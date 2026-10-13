import { NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE_NAME,
  verifyCustomerToken,
} from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(request) {
  const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  const customer = token ? verifyCustomerToken(token) : null;

  if (!customer) {
    return NextResponse.json(
      { success: false, message: "Please sign in to view your notifications." },
      { status: 401 }
    );
  }

  try {
    const notifications = await query(
      `SELECT notification_id, order_id, title, message, type, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC, notification_id DESC`,
      [customer.user_id]
    );

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("User notifications GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load your notifications." },
      { status: 500 }
    );
  }
}
