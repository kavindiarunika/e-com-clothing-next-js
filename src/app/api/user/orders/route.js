import { NextResponse } from "next/server";
import { getPool, query } from "@/lib/db";

// GET - Get all orders
export async function GET() {
  try {
    const orders = await query(`
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

      ORDER BY o.order_id DESC
    `);

    return NextResponse.json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error("Get orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request) {
  try {
    const body = await request.json();
    const cartItems = Array.isArray(body.items) ? body.items : [];

    if (!cartItems.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart is empty.",
        },
        { status: 400 }
      );
    }

    const subtotal = cartItems.reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

    const shippingFee = Number(body.shippingFee || 0);
    const discount = Number(body.discount || 0);
    const totalAmount = Math.max(subtotal + shippingFee - discount, 0);

    const shippingAddress = body.shippingAddress ? JSON.stringify(body.shippingAddress) : "";
    const billingAddress = body.billingAddress ? JSON.stringify(body.billingAddress) : shippingAddress;

    const pool = getPool();

    const [orderResult] = await pool.execute(
      `
        INSERT INTO orders (
          user_id,
          subtotal,
          discount,
          shipping_fee,
          total_amount,
          payment_status,
          order_status,
          shipping_address,
          billing_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        body.user_id ?? null,
        Number(subtotal).toFixed(2),
        Number(discount).toFixed(2),
        Number(shippingFee).toFixed(2),
        Number(totalAmount).toFixed(2),
        body.paymentStatus || "pending",
        body.orderStatus || "pending",
        shippingAddress,
        billingAddress,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      const itemId = Number(item.productId ?? item.item_id ?? item.id ?? 0);
      const qty = Number(item.quantity || 1);
      const unitPrice = Number(item.price || 0);
      const itemTotal = unitPrice * qty;

      if (!itemId || qty <= 0) continue;

      await pool.execute(
        `
          INSERT INTO order_items (
            order_id,
            item_id,
            qty,
            unit_price,
            discount,
            total_price
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          orderId,
          itemId,
          qty,
          Number(unitPrice).toFixed(2),
          0,
          Number(itemTotal).toFixed(2),
        ]
      );
    }

    if (body.paymentMethod) {
      await pool.execute(
        `
          INSERT INTO payments (
            order_id,
            payment_method,
            transaction_id,
            amount,
            payment_status,
            paid_at
          ) VALUES (?, ?, ?, ?, ?, NOW())
        `,
        [
          orderId,
          body.paymentMethod === "Cash on Delivery" ? "cash_on_delivery" : body.paymentMethod,
          body.transactionId || null,
          Number(totalAmount).toFixed(2),
          "pending",
        ]
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order created successfully.",
    });
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}