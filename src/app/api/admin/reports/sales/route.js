import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export async function GET() {
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

    const pool = getPool();

    const [sales] = await pool.query(`
      SELECT
        o.order_id,
        o.user_id,
        o.order_date,
        o.subtotal,
        o.discount,
        o.shipping_fee,
        o.total_amount,
        o.payment_status,
        o.order_status,
        o.created_at,
        o.updated_at,
        CONCAT_WS(' ', u.first_name, u.last_name) AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,
        (
          SELECT COUNT(*)
          FROM order_items oi
          WHERE oi.order_id = o.order_id
        ) AS item_count,
        (
          SELECT p.payment_method
          FROM payments p
          WHERE p.order_id = o.order_id
          ORDER BY p.payment_id DESC
          LIMIT 1
        ) AS payment_method,
        (
          SELECT p.transaction_id
          FROM payments p
          WHERE p.order_id = o.order_id
          ORDER BY p.payment_id DESC
          LIMIT 1
        ) AS transaction_id
      FROM orders o
      LEFT JOIN users u ON u.user_id = o.user_id
      ORDER BY o.order_date DESC, o.order_id DESC
    `);

    const [items] = await pool.query(`
      SELECT
        oi.order_id,
        oi.order_item_id,
        oi.item_id,
        oi.qty,
        oi.unit_price,
        p.title AS product_title,
        p.sku
      FROM order_items oi
      LEFT JOIN products p ON p.item_id = oi.item_id
      ORDER BY oi.order_id, oi.order_item_id
    `);

    const itemsByOrder = new Map();
    for (const item of items) {
      const orderId = String(item.order_id);
      const orderItems = itemsByOrder.get(orderId) || [];
      orderItems.push(item);
      itemsByOrder.set(orderId, orderItems);
    }

    return Response.json({
      success: true,
      sales: sales.map((sale) => ({
        ...sale,
        items: itemsByOrder.get(String(sale.order_id)) || [],
      })),
    });
  } catch (error) {
    console.error(
      "Sales Report GET API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to load sales report",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}