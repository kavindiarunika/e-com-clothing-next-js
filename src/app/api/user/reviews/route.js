import { getPool } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("item_id");

  if (!itemId || !/^\d+$/.test(itemId) || Number(itemId) < 1) {
    return Response.json(
      { success: false, message: "A valid product ID is required." },
      { status: 400 }
    );
  }

  try {
    const pool = getPool();
    const [reviews] = await pool.execute(
      `SELECT
         r.review_id,
         r.rating,
         r.review_text,
         r.created_at,
         CONCAT_WS(' ', u.first_name, u.last_name) AS reviewer_name
       FROM reviews r
       INNER JOIN users u ON u.user_id = r.user_id
       WHERE r.item_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC, r.review_id DESC`,
      [Number(itemId)]
    );

    return Response.json({ success: true, reviews });
  } catch (error) {
    console.error("Review GET API Error:", error);
    return Response.json(
      { success: false, message: "Failed to load product reviews." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { item_id, reviewer_name, rating, review_text } = await request.json();
    const itemId = Number(item_id);
    const reviewRating = Number(rating);
    const reviewerName = String(reviewer_name || "").trim();
    const reviewText = String(review_text || "").trim();

    if (
      !Number.isInteger(itemId) ||
      itemId < 1 ||
      !reviewerName ||
      reviewerName.length > 150 ||
      !Number.isInteger(reviewRating) ||
      reviewRating < 1 ||
      reviewRating > 5 ||
      !reviewText
    ) {
      return Response.json(
        { success: false, message: "Please provide a valid name, rating, and review." },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [products] = await pool.execute(
      "SELECT item_id FROM products WHERE item_id = ? AND status = 'active'",
      [itemId]
    );

    if (products.length === 0) {
      return Response.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    const [users] = await pool.execute(
      `SELECT user_id FROM users
       WHERE CONCAT_WS(' ', first_name, last_name) = ?
       ORDER BY user_id DESC
       LIMIT 1`,
      [reviewerName]
    );

    if (users.length === 0) {
      return Response.json(
        { success: false, message: "Enter the full name on your customer account to submit a review." },
        { status: 404 }
      );
    }

    const [result] = await pool.execute(
      `INSERT INTO reviews (item_id, user_id, rating, review_text, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [itemId, users[0].user_id, reviewRating, reviewText]
    );

    return Response.json(
      {
        success: true,
        review: {
          review_id: result.insertId,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review POST API Error:", error);
    return Response.json(
      { success: false, message: "Failed to submit review." },
      { status: 500 }
    );
  }
}