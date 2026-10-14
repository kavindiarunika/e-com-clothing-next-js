import { CUSTOMER_COOKIE_NAME, verifyCustomerToken } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { getImageSource } from "@/lib/productImageSource";

const MAX_COMMENT_IMAGES = 2;
const MAX_COMMENT_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_COMMENT_REQUEST_SIZE = 11 * 1024 * 1024;

function getImageMimeType(buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

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
       WHERE c.item_id = ? AND c.status IN ('pending', 'approved') AND p.status = 'active'
       ORDER BY c.created_at ASC, c.comment_id ASC`,
      [Number(itemIdValue)]
    );
    const commentsWithImages = comments.map((comment) => ({
      ...comment,
      images: [],
    }));

    if (commentsWithImages.length > 0) {
      const placeholders = commentsWithImages.map(() => "?").join(", ");
      const [images] = await pool.execute(
        `SELECT comment_id, image
         FROM comment_images
         WHERE comment_id IN (${placeholders})
         ORDER BY sort_order ASC, image_id ASC`,
        commentsWithImages.map((comment) => comment.comment_id)
      );
      const commentsById = new Map(
        commentsWithImages.map((comment) => [comment.comment_id, comment])
      );

      for (const image of images) {
        commentsById
          .get(image.comment_id)
          ?.images.push(getImageSource(image.image));
      }
    }

    const customer = getCustomer(request);
    let isAuthenticated = false;

    if (customer) {
      const [activeCustomers] = await pool.execute(
        "SELECT user_id FROM users WHERE user_id = ? AND role = 'customer' AND status = 'active' LIMIT 1",
        [customer.user_id]
      );
      isAuthenticated = activeCustomers.length > 0;
    }

    return Response.json({
      success: true,
      comments: commentsWithImages,
      is_authenticated: isAuthenticated,
    });
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

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_COMMENT_REQUEST_SIZE) {
    return Response.json(
      { success: false, message: "Comment images must be no larger than 5 MB each." },
      { status: 413 }
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { success: false, message: "Please submit a valid comment and images." },
      { status: 400 }
    );
  }

  const itemId = Number(formData.get("item_id"));
  const commentText =
    formData.get("comment_text")?.toString().trim() || "";
  const rawParentCommentId = formData.get("parent_comment_id");
  const hasParentId =
    rawParentCommentId !== null && rawParentCommentId !== "";
  const parentCommentId = hasParentId ? Number(rawParentCommentId) : null;
  const uploadedFiles = formData.getAll("images");
  const imageFiles = uploadedFiles.filter(
    (file) => typeof file !== "string" && file.size > 0
  );

  if (
    !Number.isInteger(itemId) ||
    itemId < 1 ||
    (!commentText && imageFiles.length === 0) ||
    commentText.length > 5000 ||
    (hasParentId &&
      (!Number.isInteger(parentCommentId) || parentCommentId < 1)) ||
    uploadedFiles.some((file) => typeof file === "string") ||
    uploadedFiles.length > MAX_COMMENT_IMAGES ||
    imageFiles.length !== uploadedFiles.length ||
    imageFiles.length > MAX_COMMENT_IMAGES
  ) {
    return Response.json(
      {
        success: false,
        message: "Enter a comment (up to 5,000 characters) or attach up to two images.",
      },
      { status: 400 }
    );
  }

  if (imageFiles.some((file) => file.size > MAX_COMMENT_IMAGE_SIZE)) {
    return Response.json(
      { success: false, message: "Each comment image must be 5 MB or smaller." },
      { status: 413 }
    );
  }

  const commentImages = [];
  let connection;
  try {
    for (const file of imageFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = getImageMimeType(buffer);
      if (!mimeType) {
        return Response.json(
          { success: false, message: "Comment images must be JPEG, PNG, or WebP files." },
          { status: 415 }
        );
      }

      commentImages.push({ buffer, mimeType });
    }

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
        WHERE comment_id = ? AND item_id = ? AND status IN ('pending', 'approved')
         LIMIT 1`,
        [parentCommentId, itemId]
      );

      if (parents.length === 0) {
        return Response.json(
          { success: false, message: "You can only reply to an available comment on this product." },
          { status: 400 }
        );
      }
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO comments (item_id, user_id, parent_comment_id, comment_text, status)
       VALUES (?, ?, ?, ?, 'approved')`,
      [itemId, customer.user_id, parentCommentId, commentText]
    );

    for (const [sortOrder, image] of commentImages.entries()) {
      await connection.execute(
        "INSERT INTO comment_images (comment_id, image, sort_order) VALUES (?, ?, ?)",
        [result.insertId, image.buffer, sortOrder]
      );
    }

    const [createdComments] = await connection.execute(
      `SELECT
         c.comment_id,
         c.parent_comment_id,
         c.comment_text,
         c.created_at,
         CONCAT_WS(' ', u.first_name, u.last_name) AS commenter_name
       FROM comments c
       INNER JOIN users u ON u.user_id = c.user_id
       WHERE c.comment_id = ?
       LIMIT 1`,
      [result.insertId]
    );

    if (createdComments.length === 0) {
      throw new Error("The comment was saved but could not be loaded.");
    }

    await connection.commit();
    const comment = {
      ...createdComments[0],
      images: commentImages.map(({ buffer, mimeType }) =>
        `data:${mimeType};base64,${buffer.toString("base64")}`
      ),
    };

    return Response.json(
      {
        success: true,
        comment,
        message: "Your comment has been posted.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Product comments transaction rollback error:", rollbackError);
      }
    }
    console.error("Product comments POST API Error:", error);
    return Response.json(
      { success: false, message: "Failed to submit your comment." },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
