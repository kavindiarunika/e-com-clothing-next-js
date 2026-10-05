import { getAdmin } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { publishRealtime } from "@/lib/realtime.mjs";

export async function GET() {
  try {
    if (!(await getAdmin())) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const [shipments] = await getPool().query(`
      SELECT o.order_id, o.order_date, o.order_status, o.shipping_address,
             CONCAT(u.first_name, ' ', u.last_name) AS customer_name, u.email
      FROM orders o LEFT JOIN users u ON u.user_id = o.user_id
      WHERE o.order_status IN ('shipped', 'delivered')
      ORDER BY o.order_id DESC
    `);
    return Response.json({ success: true, shipments });
  } catch (error) {
    console.error("Shipments GET error:", error);
    return Response.json({ success: false, message: "Failed to load shipments" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!(await getAdmin())) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { order_id, order_status } = await request.json();
    if (!order_id) return Response.json({ success: false, message: "Order id is required" }, { status: 400 });
    const validOrderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validOrderStatuses.includes(order_status)) {
      return Response.json({ success: false, message: "Invalid order status" }, { status: 400 });
    }

    const pool = getPool();
    const [existingOrders] = await pool.execute(
      "SELECT order_id FROM orders WHERE order_id = ?",
      [order_id]
    );
    if (!existingOrders.length) {
      return Response.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    await pool.execute(
      "UPDATE orders SET order_status = ? WHERE order_id = ?",
      [order_status, order_id]
    );

    const [orders] = await pool.execute(
      "SELECT order_id, user_id, order_status, payment_status FROM orders WHERE order_id = ?",
      [order_id]
    );
    const orderUpdate = {
      order_id: String(orders[0].order_id),
      user_id: String(orders[0].user_id),
      order_status: orders[0].order_status,
      payment_status: orders[0].payment_status,
    };
    publishRealtime(`customer:${orders[0].user_id}`, "order:updated", orderUpdate);
    publishRealtime("admins", "orders:updated", orderUpdate);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Shipments PUT error:", error);
    return Response.json({ success: false, message: "Failed to update shipment" }, { status: 500 });
  }
}
