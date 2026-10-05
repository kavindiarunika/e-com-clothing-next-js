import { NextResponse } from "next/server";
import { getPool, query } from "@/lib/db";
import {
  CUSTOMER_COOKIE_NAME,
  verifyCustomerToken,
} from "@/lib/auth";
import { publishRealtime } from "@/lib/realtime.mjs";

export async function GET(request) {
  const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  const customer = token ? verifyCustomerToken(token) : null;

  if (!customer) {
    return NextResponse.json(
      { success: false, message: "Please sign in to view your orders." },
      { status: 401 }
    );
  }

  try {
    const orders = await query(`
      SELECT
        o.order_id,
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
          SELECT COUNT(*)
          FROM order_items oi
          WHERE oi.order_id = o.order_id
        ) AS item_count
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.order_id DESC
    `, [customer.user_id]);

    return NextResponse.json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error("Get customer orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let connection;

  try {
    const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const customer = token ? verifyCustomerToken(token) : null;

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Please sign in before placing an order." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const address = body.shippingAddress || {};
    const requiredAddressFields = [
      "firstName",
      "lastName",
      "phone",
      "address",
      "city",
      "district",
      "postalCode",
    ];

    if (
      requiredAddressFields.some(
        (field) => !String(address[field] || "").trim()
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Complete all shipping details before ordering." },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Your cart is empty." },
        { status: 400 }
      );
    }

    const items = body.items.map((item) => ({
      productId: Number(item.productId),
      variantId: Number(item.variantId) || null,
      size: String(item.size || ""),
      color: typeof item.color === "object"
        ? String(item.color?.name || "")
        : String(item.color || ""),
      quantity: Number(item.quantity),
    }));

    if (
      items.some(
        (item) =>
          !Number.isInteger(item.productId) ||
          item.productId <= 0 ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0 ||
          item.quantity > 99
      )
    ) {
      return NextResponse.json(
        { success: false, message: "One or more cart quantities are invalid." },
        { status: 400 }
      );
    }

    items.sort(
      (left, right) =>
        left.productId - right.productId ||
        (left.variantId || 0) - (right.variantId || 0) ||
        left.size.localeCompare(right.size) ||
        left.color.localeCompare(right.color)
    );

    const pool = getPool();
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [activeUsers] = await connection.execute(
      "SELECT user_id FROM users WHERE user_id = ? AND role = 'customer' AND status = 'active' LIMIT 1",
      [customer.user_id]
    );
    if (!activeUsers.length) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, message: "Your account is not active." },
        { status: 403 }
      );
    }

    let subtotal = 0;
    let discountTotal = 0;
    const orderLines = [];

    for (const item of items) {
      let variantId = item.variantId;

      if (!variantId) {
        const [matchingVariants] = await connection.execute(
          `SELECT pv.variant_id
           FROM product_variants pv
           INNER JOIN products p ON p.item_id = pv.item_id
           LEFT JOIN sizes s ON s.size_id = pv.size_id
           LEFT JOIN colors c ON c.color_id = pv.color_id
           WHERE pv.item_id = ?
             AND pv.status = 'active'
             AND pv.stock_quantity > 0
             AND p.status = 'active'
             AND COALESCE(s.name, '') = ?
             AND COALESCE(c.name, '') = ?
           LIMIT 1
           FOR UPDATE`,
          [item.productId, item.size, item.color]
        );
        variantId = matchingVariants[0]?.variant_id || null;
      }

      if (!variantId) {
        const [simpleProducts] = await connection.execute(
          `SELECT p.item_id, p.qty, p.price, p.discount
           FROM products p
           LEFT JOIN sizes default_size ON default_size.size_id = p.size_id
           LEFT JOIN colors default_color ON default_color.color_id = p.color_id
           WHERE p.item_id = ?
             AND p.status = 'active'
             AND (
               NOT EXISTS (
                 SELECT 1 FROM product_variants pv
                 WHERE pv.item_id = p.item_id
                   AND pv.status = 'active'
                   AND pv.stock_quantity > 0
               )
               OR (
                 COALESCE(default_size.name, '') = ?
                 AND COALESCE(default_color.name, '') = ?
                 AND NOT EXISTS (
                   SELECT 1
                   FROM product_variants pv
                   LEFT JOIN sizes variant_size ON variant_size.size_id = pv.size_id
                   LEFT JOIN colors variant_color ON variant_color.color_id = pv.color_id
                   WHERE pv.item_id = p.item_id
                     AND pv.status = 'active'
                     AND COALESCE(variant_size.name, '') = ?
                     AND COALESCE(variant_color.name, '') = ?
                 )
               )
             )
           LIMIT 1
           FOR UPDATE`,
          [item.productId, item.size, item.color, item.size, item.color]
        );
        const product = simpleProducts[0];

        if (!product) {
          await connection.rollback();
          return NextResponse.json(
            { success: false, message: "A product option in your cart is no longer available." },
            { status: 409 }
          );
        }

        const stock = Number(product.qty) || 0;
        if (stock < item.quantity) {
          await connection.rollback();
          return NextResponse.json(
            {
              success: false,
              message: `Only ${stock} item${stock === 1 ? "" : "s"} remain for a product in your cart. Update the quantity and try again.`,
            },
            { status: 409 }
          );
        }

        const unitPrice = Number(product.price) || 0;
        const discountPercent = Number(product.discount) || 0;
        const discountAmount = unitPrice * item.quantity * discountPercent / 100;
        const lineTotal = unitPrice * item.quantity - discountAmount;

        const [updateResult] = await connection.execute(
          `UPDATE products
           SET qty = qty - ?
           WHERE item_id = ? AND qty >= ?`,
          [item.quantity, product.item_id, item.quantity]
        );
        if (updateResult.affectedRows !== 1) {
          await connection.rollback();
          return NextResponse.json(
            { success: false, message: "Stock changed while placing your order. Please try again." },
            { status: 409 }
          );
        }

        subtotal += unitPrice * item.quantity;
        discountTotal += discountAmount;
        orderLines.push({
          ...item,
          variantId: null,
          unitPrice,
          discountPercent,
          lineTotal,
          stockAfter: stock - item.quantity,
        });

        continue;
      }

      const [variants] = await connection.execute(
        `SELECT
           pv.variant_id,
           pv.stock_quantity,
           pv.price AS variant_price,
           pv.discount AS variant_discount,
           p.price AS product_price,
           p.discount AS product_discount
         FROM product_variants pv
         INNER JOIN products p ON p.item_id = pv.item_id
         LEFT JOIN sizes s ON s.size_id = pv.size_id
         LEFT JOIN colors c ON c.color_id = pv.color_id
         WHERE pv.item_id = ?
           AND pv.status = 'active'
           AND p.status = 'active'
           AND pv.variant_id = ?
         LIMIT 1
         FOR UPDATE`,
        [item.productId, variantId]
      );

      const variant = variants[0];
      if (!variant) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, message: "A product option in your cart is no longer available." },
          { status: 409 }
        );
      }

      const stock = Number(variant.stock_quantity) || 0;
      if (stock < item.quantity) {
        await connection.rollback();
        return NextResponse.json(
          {
            success: false,
            message: `Only ${stock} item${stock === 1 ? "" : "s"} remain for a product in your cart. Update the quantity and try again.`,
          },
          { status: 409 }
        );
      }

      const unitPrice = Number(variant.variant_price) > 0
        ? Number(variant.variant_price)
        : Number(variant.product_price) || 0;
      const discountPercent = Number(variant.variant_discount) > 0
        ? Number(variant.variant_discount)
        : Number(variant.product_discount) || 0;
      const discountAmount = unitPrice * item.quantity * discountPercent / 100;
      const lineTotal = unitPrice * item.quantity - discountAmount;

      subtotal += unitPrice * item.quantity;
      discountTotal += discountAmount;
      orderLines.push({
        ...item,
        variantId: variant.variant_id,
        unitPrice,
        discountPercent,
        lineTotal,
        stockAfter: stock - item.quantity,
      });

      const [updateResult] = await connection.execute(
        `UPDATE product_variants
         SET stock_quantity = stock_quantity - ?
         WHERE variant_id = ? AND stock_quantity >= ?`,
        [item.quantity, variant.variant_id, item.quantity]
      );
      if (updateResult.affectedRows !== 1) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, message: "Stock changed while placing your order. Please try again." },
          { status: 409 }
        );
      }
    }

    const shippingFee = 500;
    const totalAmount = subtotal - discountTotal + shippingFee;
    const shippingAddress = JSON.stringify({
      first_name: String(address.firstName).trim(),
      last_name: String(address.lastName).trim(),
      phone: String(address.phone).trim(),
      address_line1: String(address.address).trim(),
      city: String(address.city).trim(),
      district: String(address.district).trim(),
      postal_code: String(address.postalCode).trim(),
    });

    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
         user_id, subtotal, discount, shipping_fee, total_amount,
         payment_status, order_status, shipping_address, billing_address
       ) VALUES (?, ?, ?, ?, ?, 'pending', 'pending', ?, ?)`,
      [
        customer.user_id,
        subtotal,
        discountTotal,
        shippingFee,
        totalAmount,
        shippingAddress,
        shippingAddress,
      ]
    );
    const orderId = orderResult.insertId;

    await connection.execute(
      `INSERT INTO payments (
         order_id, payment_method, amount, payment_status
       ) VALUES (?, 'cash_on_delivery', ?, 'pending')`,
      [orderId, totalAmount]
    );

    for (const item of orderLines) {
      await connection.execute(
        `INSERT INTO order_items (
           order_id, item_id, variant_id, qty, unit_price, discount, total_price
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.variantId,
          item.quantity,
          item.unitPrice,
          item.discountPercent,
          item.lineTotal,
        ]
      );

      if (item.variantId) {
        await connection.execute(
        `INSERT INTO inventory_transactions (
           variant_id, transaction_type, quantity, reference_id, note
         ) VALUES (?, 'sale', ?, ?, ?)`,
        [item.variantId, item.quantity, orderId, `Order ${orderId}`]
      );

        await connection.execute(
        `INSERT INTO inventory (
           variant_id, quantity, reserved_quantity, available_quantity
         ) VALUES (?, ?, 0, ?)
         ON DUPLICATE KEY UPDATE
           quantity = VALUES(quantity),
           available_quantity = VALUES(available_quantity)`,
        [item.variantId, item.stockAfter, item.stockAfter]
      );
      }
    }

    await connection.commit();

    const orderUpdate = {
      order_id: String(orderId),
      user_id: String(customer.user_id),
      order_status: "pending",
      payment_status: "pending",
    };
    publishRealtime(`customer:${customer.user_id}`, "orders:created", orderUpdate);
    publishRealtime("admins", "orders:created", orderUpdate);

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully.",
        data: {
          order_id: orderId,
          subtotal,
          discount: discountTotal,
          shipping_fee: shippingFee,
          total_amount: totalAmount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to place your order right now." },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}