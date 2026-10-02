import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Get all order items
export async function GET(request) {
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

        s.name AS size,
        c.name AS color

      FROM order_items oi

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
    `, orderId ? [Number(orderId)] : []);

    return NextResponse.json({
      success: true,
      data: orderItems,
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