import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export async function GET() {
  try {
    // =====================================================
    // CHECK ADMIN AUTHENTICATION
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
    // GET PAYMENTS
    // =====================================================

    const [payments] = await pool.query(`
      SELECT
        payment_id,
        order_id,
        payment_method,
        transaction_id,
        amount,
        payment_status,
        paid_at,
        created_at
      FROM payments
      ORDER BY payment_id DESC
    `);

    // =====================================================
    // RESPONSE
    // =====================================================

    return Response.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error(
      "Payments GET API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to load payments",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}