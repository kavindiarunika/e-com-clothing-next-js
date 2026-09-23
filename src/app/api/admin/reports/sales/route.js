import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export async function GET() {
  try {
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

    const pool = getPool();

    const [sales] = await pool.query(`
      SELECT
        order_id,
        user_id,
        order_date,
        subtotal,
        discount,
        shipping_fee,
        total_amount,
        payment_status,
        order_status,
        created_at,
        updated_at
      FROM orders
      ORDER BY order_date DESC
    `);

    return Response.json({
      success: true,
      sales,
    });
  } catch (error) {
    console.error(
      "Sales Report GET API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to load sales report",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}