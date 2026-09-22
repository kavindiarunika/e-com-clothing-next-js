import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

/* =========================================
   GET ALL ORDERS
========================================= */

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

    const [orders] = await pool.query(`
      SELECT
        o.order_id,
        o.user_id,
        o.order_date,

        o.subtotal,
        o.discount,
        o.shipping_fee,
        o.total_amount,

        o.coupon_id,

        o.payment_status,
        o.order_status,

        o.shipping_address,
        o.billing_address,

        o.created_at,
        o.updated_at,

        u.first_name,
        u.last_name,
        u.email

      FROM orders o

      LEFT JOIN users u
        ON o.user_id = u.user_id

      ORDER BY o.order_id DESC
    `);

    return Response.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Orders GET Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to load orders",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}