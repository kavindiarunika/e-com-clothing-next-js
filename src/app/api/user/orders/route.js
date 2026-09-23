import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Get all orders
export async function GET() {
  try {
    const orders = await query(`
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
        u.email,
        u.phone

      FROM orders o

      LEFT JOIN users u
        ON o.user_id = u.user_id

      ORDER BY o.order_id DESC
    `);

    return NextResponse.json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error("Get orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}