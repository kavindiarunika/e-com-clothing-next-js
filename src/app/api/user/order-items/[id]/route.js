import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Get single order item
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const orderItems = await query(
      `
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

      WHERE oi.order_item_id = ?

      LIMIT 1
      `,
      [id]
    );

    if (!orderItems.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Order item not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: orderItems[0],
    });

  } catch (error) {
    console.error("Get order item error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order item",
      },
      { status: 500 }
    );
  }
}