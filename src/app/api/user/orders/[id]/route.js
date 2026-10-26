import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  CUSTOMER_COOKIE_NAME,
  GUEST_COOKIE_NAME,
  verifyCustomerToken,
  verifyGuestToken,
} from "@/lib/auth";

export async function GET(request, { params }) {
  const customerToken = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  const customer = customerToken ? verifyCustomerToken(customerToken) : null;
  const guestToken = request.cookies.get(GUEST_COOKIE_NAME)?.value;
  const guest = customer || !guestToken ? null : verifyGuestToken(guestToken);

  if (!customer && !guest) {
    return NextResponse.json(
      { success: false, message: "Please sign in to view this order." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const orders = await query(
      `
      SELECT
        o.order_id,
        o.user_id,
        o.guest_id,
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
        (
          SELECT p.payment_method
          FROM payments p
          WHERE p.order_id = o.order_id
          ORDER BY p.payment_id DESC
          LIMIT 1
        ) AS payment_method,

        COALESCE(u.first_name, g.first_name) AS first_name,
        COALESCE(u.last_name, g.last_name) AS last_name,
        COALESCE(u.email, g.email) AS email,
        COALESCE(u.phone, g.phone) AS phone

      FROM orders o

      LEFT JOIN users u
        ON o.user_id = u.user_id
      LEFT JOIN guest_customers g
        ON o.guest_id = g.guest_id

      WHERE o.order_id = ? AND ${customer ? "o.user_id" : "o.guest_id"} = ?

      LIMIT 1
      `,
      [id, customer ? customer.user_id : guest.guest_id]
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