import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("user_id") || 0);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User id is required.",
        },
        { status: 400 }
      );
    }

    const pool = getPool();

    const [returns] = await pool.query(
      `
        SELECT
          return_id,
          order_id,
          order_item_id,
          user_id,
          request_type,
          reason,
          description,
          status,
          requested_at,
          processed_at
        FROM returns_exchanges
        WHERE user_id = ?
        ORDER BY return_id DESC
      `,
      [userId]
    );

    return NextResponse.json({
      success: true,
      returns,
    });
  } catch (error) {
    console.error("User returns GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load return requests.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      order_id,
      order_item_id,
      user_id,
      request_type,
      reason,
      description,
    } = body;

    const orderId = Number(order_id);
    const orderItemId = Number(order_item_id);
    const userId = Number(user_id);

    if (
      !Number.isInteger(orderId) || orderId < 1 ||
      !Number.isInteger(orderItemId) || orderItemId < 1 ||
      !Number.isInteger(userId) || userId < 1 ||
      !["return", "exchange"].includes(request_type)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid order, item, user, and request type are required.",
        },
        { status: 400 }
      );
    }

    const pool = getPool();

    const [matchingItems] = await pool.execute(
      `
        SELECT o.order_id, o.user_id, o.order_status
        FROM orders o
        INNER JOIN order_items oi ON oi.order_id = o.order_id
        WHERE o.order_id = ? AND oi.order_item_id = ?
        LIMIT 1
      `,
      [orderId, orderItemId]
    );

    if (!matchingItems.length) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected order or item was not found. Open the request from an existing order.",
        },
        { status: 404 }
      );
    }

    const order = matchingItems[0];

    if (order.user_id && Number(order.user_id) !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "This order does not belong to the selected user.",
        },
        { status: 403 }
      );
    }

    if (String(order.order_status).toLowerCase() !== "delivered") {
      return NextResponse.json(
        {
          success: false,
          message: "Returns and exchanges are available after an order is delivered.",
        },
        { status: 409 }
      );
    }

    const [users] = await pool.execute(
      "SELECT user_id FROM users WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (!users.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Your customer account could not be found. Please sign in again.",
        },
        { status: 404 }
      );
    }

    const [result] = await pool.execute(
      `
        INSERT INTO returns_exchanges (
          order_id,
          order_item_id,
          user_id,
          request_type,
          reason,
          description,
          status,
          requested_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
      `,
      [
        orderId,
        orderItemId,
        userId,
        request_type,
        reason || null,
        description || null,
      ]
    );

    return NextResponse.json({
      success: true,
      returnId: result.insertId,
      message: "Return request submitted successfully.",
    });
  } catch (error) {
    console.error("User returns POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit return request.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
