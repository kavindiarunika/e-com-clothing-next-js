import { getAdmin } from "@/lib/auth";
import { getPool } from "@/lib/db";

const REVIEW_STATUSES = ["pending", "approved", "rejected"];

async function getReviewId(context) {
  const { id } = await context.params;
  const reviewId = Number(id);

  return Number.isInteger(reviewId) && reviewId > 0 ? reviewId : null;
}

export async function GET(_request, context) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const reviewId = await getReviewId(context);

    if (!reviewId) {
      return Response.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [reviews] = await pool.execute(
      `SELECT
         r.review_id,
         r.item_id,
         r.user_id,
         CONCAT_WS(' ', u.first_name, u.last_name) AS reviewer_name,
         r.order_id,
         r.rating,
         r.review_text,
         r.status,
         r.created_at
       FROM reviews r
       LEFT JOIN users u ON u.user_id = r.user_id
       WHERE r.review_id = ?`,
      [reviewId]
    );

    if (reviews.length === 0) {
      return Response.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, review: reviews[0] });
  } catch (error) {
    console.error("Review GET API Error:", error);
    return Response.json(
      { success: false, message: "Failed to load review" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const reviewId = await getReviewId(context);

    if (!reviewId) {
      return Response.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    if (!REVIEW_STATUSES.includes(status)) {
      return Response.json(
        { success: false, message: "Invalid review status" },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [result] = await pool.execute(
      "UPDATE reviews SET status = ? WHERE review_id = ?",
      [status, reviewId]
    );

    if (result.affectedRows === 0) {
      const [reviews] = await pool.execute(
        "SELECT review_id FROM reviews WHERE review_id = ?",
        [reviewId]
      );

      if (reviews.length === 0) {
        return Response.json(
          { success: false, message: "Review not found" },
          { status: 404 }
        );
      }
    }

    return Response.json({ success: true, message: "Review status updated" });
  } catch (error) {
    console.error("Review PUT API Error:", error);
    return Response.json(
      { success: false, message: "Failed to update review" },
      { status: 500 }
    );
  }
}
