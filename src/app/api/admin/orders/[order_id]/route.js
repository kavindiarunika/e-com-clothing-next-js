import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

/* =========================================
   GET SINGLE ORDER
========================================= */

export async function GET(request, { params }) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { order_id } = await params;

    const pool = getPool();

    const [orders] = await pool.query(
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
        u.email

      FROM orders o

      LEFT JOIN users u
        ON o.user_id = u.user_id

      WHERE o.order_id = ?
      `,
      [order_id]
    );

    if (orders.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      order: orders[0],
    });
  } catch (error) {
    console.error("Order GET Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to load order",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   UPDATE ORDER STATUS
========================================= */

export async function PUT(request, { params }) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { order_id } = await params;

    const body = await request.json();

    const { order_status } = body;

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(order_status)) {
      return Response.json(
        {
          success: false,
          message: "Invalid order status.",
        },
        {
          status: 400,
        }
      );
    }

    const pool = getPool();

    const [existingOrder] = await pool.query(
      `
      SELECT order_id
      FROM orders
      WHERE order_id = ?
      `,
      [order_id]
    );

    if (existingOrder.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    await pool.query(
      `
      UPDATE orders
      SET order_status = ?
      WHERE order_id = ?
      `,
      [order_status, order_id]
    );

    return Response.json({
      success: true,
      message: "Order status updated successfully.",
    });
  } catch (error) {
    console.error("Order PUT Error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update order status.",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}