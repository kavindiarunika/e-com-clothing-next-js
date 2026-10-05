import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  CUSTOMER_COOKIE_NAME,
  verifyCustomerToken,
} from "@/lib/auth";
import { getImageSource } from "@/lib/productImageSource";

// GET - Get all order items
export async function GET(request) {
  const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  const customer = token ? verifyCustomerToken(token) : null;

  if (!customer) {
    return NextResponse.json(
      { success: false, message: "Please sign in to view order items." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("order_id");

    if (orderId && (!/^\d+$/.test(orderId) || Number(orderId) < 1)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid order id is required.",
        },
        { status: 400 }
      );
    }

    const orderItems = await query(`
      SELECT
        oi.order_item_id,
        oi.order_id,
        oi.item_id,
        oi.variant_id,
        oi.qty,
        oi.unit_price,
        oi.discount,
        oi.total_price,

        p.title AS product_title,
        p.main_image,

        s.name AS size,
        c.name AS color

      FROM order_items oi
      INNER JOIN orders o
        ON oi.order_id = o.order_id AND o.user_id = ?

      LEFT JOIN products p
        ON oi.item_id = p.item_id

      LEFT JOIN product_variants pv
        ON oi.variant_id = pv.variant_id

      LEFT JOIN sizes s
        ON pv.size_id = s.size_id

      LEFT JOIN colors c
        ON pv.color_id = c.color_id

      ${orderId ? "WHERE oi.order_id = ?" : ""}

      ORDER BY oi.order_item_id DESC
    `, orderId
      ? [customer.user_id, Number(orderId)]
      : [customer.user_id]);

    return NextResponse.json({
      success: true,
      data: orderItems.map((item) => ({
        ...item,
        image: getImageSource(item.main_image),
        main_image: undefined,
      })),
    });

  } catch (error) {
    console.error("Get order items error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order items",
      },
      { status: 500 }
    );
  }
}