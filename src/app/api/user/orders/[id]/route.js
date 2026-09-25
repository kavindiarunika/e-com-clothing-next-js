import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const orders = await query(
      `
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

      WHERE o.order_id = ?

      LIMIT 1
      `,
      [id]
    );

    if (!orders.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: orders[0],
    });

  } catch (error) {
    console.error("Get order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
      },
      { status: 500 }
    );
  }
}