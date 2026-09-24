import { getAdmin } from "@/lib/auth";
import { getPool } from "@/lib/db";

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
    await getPool().execute("UPDATE orders SET order_status = ? WHERE order_id = ?", [order_status, order_id]);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Shipments PUT error:", error);
    return Response.json({ success: false, message: "Failed to update shipment" }, { status: 500 });
  }
}
