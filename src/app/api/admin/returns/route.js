import { getAdmin } from "@/lib/auth";
import { getPool } from "@/lib/db";

export async function GET() {
  try {
    if (!(await getAdmin())) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const [returns] = await getPool().query(`
      SELECT r.return_id, r.order_id, r.order_item_id, r.user_id,
             r.request_type, r.reason, r.description, r.status,
             r.requested_at, CONCAT(u.first_name, ' ', u.last_name) AS customer_name
      FROM returns_exchanges r JOIN users u ON u.user_id = r.user_id
      ORDER BY r.return_id DESC
    `);
    return Response.json({ success: true, returns });
  } catch (error) {
    console.error("Returns GET error:", error);
    return Response.json({ success: false, message: "Failed to load returns" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!(await getAdmin())) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { return_id, status } = await request.json();
    if (!return_id) return Response.json({ success: false, message: "Return id is required" }, { status: 400 });
    await getPool().execute(
      "UPDATE returns_exchanges SET status = ?, processed_at = CURRENT_TIMESTAMP WHERE return_id = ?",
      [status, return_id]
    );
    return Response.json({ success: true });
  } catch (error) {
    console.error("Returns PUT error:", error);
    return Response.json({ success: false, message: "Failed to update return" }, { status: 500 });
  }
}
