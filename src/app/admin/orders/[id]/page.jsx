import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==========================================
// GET ALL ORDERS
// ==========================================

export async function GET() {
  try {
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

        COUNT(oi.order_item_id) AS item_count,

        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone

      FROM orders o

      LEFT JOIN users u
        ON o.user_id = u.user_id

      LEFT JOIN order_items oi
        ON o.order_id = oi.order_id

      GROUP BY
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
        u.name,
        u.email,
        u.phone

      ORDER BY o.order_id DESC
    `);

    return NextResponse.json(orders);
  } catch (error) {
    console.error(
      "GET ORDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch orders.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}