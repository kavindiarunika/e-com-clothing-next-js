import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export async function GET() {
  try {
    // =====================================================
    // CHECK ADMIN
    // =====================================================

    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // DATABASE
    // =====================================================

    const pool = getPool();

    // =====================================================
    // GET REVIEWS
    // =====================================================

    const [reviews] = await pool.query(`
      SELECT
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
      ORDER BY r.review_id DESC
    `);

    return Response.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error(
      "Reviews GET API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to load reviews",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}