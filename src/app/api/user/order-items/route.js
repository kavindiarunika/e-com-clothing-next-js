import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Get all order items
export async function GET() {
  try {
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

        pv.size,
        pv.color

      FROM order_items oi

      LEFT JOIN products p
        ON oi.item_id = p.item_id

      LEFT JOIN product_variants pv
        ON oi.variant_id = pv.variant_id

      ORDER BY oi.order_item_id DESC
    `);

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