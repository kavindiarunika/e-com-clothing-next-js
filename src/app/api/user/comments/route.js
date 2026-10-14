import { CUSTOMER_COOKIE_NAME, verifyCustomerToken } from "@/lib/auth";
import { getPool } from "@/lib/db";

function getCustomer(request) {
  const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  return token ? verifyCustomerToken(token) : null;
}

function invalidProductId() {
  return Response.json(
    { success: false, message: "A valid product ID is required." },
    { status: 400 }
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const itemIdValue = searchParams.get("item_id");

  if (!itemIdValue || !/^\d+$/.test(itemIdValue) || Number(itemIdValue) < 1) {
    return invalidProductId();
  }

  try {
    const pool = getPool();
    const [comments] = await pool.execute(
      `SELECT
         c.comment_id,
         c.parent_comment_id,
         c.comment_text,
         c.created_at,
         CONCAT_WS(' ', u.first_name, u.last_name) AS commenter_name
       FROM comments c
       INNER JOIN users u ON u.user_id = c.user_id
       INNER JOIN products p ON p.item_id = c.item_id
       WHERE c.item_id = ? AND c.status = 'approved' AND p.status = 'active'
       ORDER BY c.created_at ASC, c.comment_id ASC`,
      [Number(itemIdValue)]
    );

    const customer = getCustomer(request);
    let isAuthenticated = false;

    if (customer) {
      const [activeCustomers] = await pool.execute(
        "SELECT user_id FROM users WHERE user_id = ? AND role = 'customer' AND status = 'active' LIMIT 1",
        [customer.user_id]
      );
      isAuthenticated = activeCustomers.length > 0;
    }

    return Response.json({ success: true, comments, is_authenticated: isAuthenticated });
  } catch (error) {
    console.error("Product comments GET API Error:", error);
    return Response.json(
      { success: false, message: "Failed to load product comments." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const customer = getCustomer(request);

  if (!customer) {
    return Response.json(
      { success: false, message: "Please sign in to add a comment." },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Please submit a valid comment." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      { success: false, message: "Please submit a valid comment." },
      { status: 400 }
    );
  }

  const itemId = Number(body.item_id);
  const commentText =
    typeof body.comment_text === "string" ? body.comment_text.trim() : "";
  const hasParentId =
    body.parent_comment_id !== undefined &&
    body.parent_comment_id !== null &&
    body.parent_comment_id !== "";
  const parentCommentId = hasParentId ? Number(body.parent_comment_id) : null;

  if (
    !Number.isInteger(itemId) ||
    itemId < 1 ||
    !commentText ||
    commentText.length > 5000 ||
    (hasParentId &&
      (!Number.isInteger(parentCommentId) || parentCommentId < 1))
  ) {
    return Response.json(
      {
        success: false,
        message: "Enter a comment of up to 5,000 characters for a valid product.",
      },
      { status: 400 }
    );
  }

  try {
    const pool = getPool();
    const [activeCustomers] = await pool.execute(
      "SELECT user_id FROM users WHERE user_id = ? AND role = 'customer' AND status = 'active' LIMIT 1",
      [customer.user_id]
    );

    if (activeCustomers.length === 0) {
      return Response.json(
        { success: false, message: "Your customer account is not active. Please sign in again." },
        { status: 401 }
      );
    }

    const [products] = await pool.execute(
      "SELECT item_id FROM products WHERE item_id = ? AND status = 'active' LIMIT 1",
      [itemId]
    );

    if (products.length === 0) {
      return Response.json(
        { success: false, message: "This product is not available." },
        { status: 404 }
      );
    }

    if (hasParentId) {
      const [parents] = await pool.execute(
        `SELECT comment_id
         FROM comments
         WHERE comment_id = ? AND item_id = ? AND status = 'approved'
         LIMIT 1`,
        [parentCommentId, itemId]
      );

      if (parents.length === 0) {
        return Response.json(
          { success: false, message: "You can only reply to an approved comment on this product." },
          { status: 400 }
        );
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO comments (item_id, user_id, parent_comment_id, comment_text)
       VALUES (?, ?, ?, ?)`,
      [itemId, customer.user_id, parentCommentId, commentText]
    );

    return Response.json(
      { success: true, comment_id: result.insertId, message: "Your comment has been submitted for approval." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product comments POST API Error:", error);
    return Response.json(
      { success: false, message: "Failed to submit your comment." },
      { status: 500 }
    );
  }
}
