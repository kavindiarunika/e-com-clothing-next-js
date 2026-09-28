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
        review_id,
        item_id,
        user_id,
        order_id,
        rating,
        review_text,
        status,
        created_at
      FROM reviews
      ORDER BY review_id DESC
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