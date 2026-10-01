import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==========================================
// GET SINGLE ORDER
// ==========================================

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // ========================================
    // ORDER
    // ========================================

    const [orders] = await pool.query(
      `
      SELECT
        o.*,

        CONCAT_WS(' ', u.first_name, u.last_name) AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone

      FROM orders o

      LEFT JOIN users u
        ON o.user_id = u.user_id

      WHERE o.order_id = ?
      `,
      [id]
    );

    if (orders.length === 0) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    const order = orders[0];

    // ========================================
    // ORDER ITEMS
    // ========================================

    const [items] = await pool.query(
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
        p.main_image,
        p.sku

      FROM order_items oi

      LEFT JOIN products p
        ON oi.item_id = p.item_id

      WHERE oi.order_id = ?

      ORDER BY oi.order_item_id ASC
      `,
      [id]
    );

    // ========================================
    // CONVERT PRODUCT IMAGES
    // ========================================

    const formattedItems = items.map(
      (item) => ({
        ...item,

        main_image: item.main_image
          ? `data:image/jpeg;base64,${Buffer.from(
              item.main_image
            ).toString("base64")}`
          : null,
      })
    );

    return NextResponse.json({
      ...order,
      items: formattedItems,
    });
  } catch (error) {
    console.error(
      "GET ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch order.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ==========================================
// UPDATE ORDER
// ==========================================

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const body = await request.json();

    const {
      order_status,
      payment_status,
    } = body;

    // ========================================
    // CHECK ORDER
    // ========================================

    const [existing] = await pool.query(
      `
      SELECT order_id
      FROM orders
      WHERE order_id = ?
      `,
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    // ========================================
    // UPDATE ORDER STATUS
    // ========================================

    if (order_status) {
      const validOrderStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (
        !validOrderStatuses.includes(
          order_status
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid order status.",
          },
          { status: 400 }
        );
      }

      await pool.query(
        `
        UPDATE orders
        SET order_status = ?
        WHERE order_id = ?
        `,
        [order_status, id]
      );
    }

    // ========================================
    // UPDATE PAYMENT STATUS
    // ========================================

    if (payment_status) {
      const validPaymentStatuses = [
        "pending",
        "paid",
        "failed",
        "refunded",
      ];

      if (
        !validPaymentStatuses.includes(
          payment_status
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid payment status.",
          },
          { status: 400 }
        );
      }

      await pool.query(
        `
        UPDATE orders
        SET payment_status = ?
        WHERE order_id = ?
        `,
        [payment_status, id]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
    });
  } catch (error) {
    console.error(
      "UPDATE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update order.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}