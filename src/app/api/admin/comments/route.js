import { getAdmin } from "@/lib/auth";
import { getPool } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const pool = getPool();
    const [comments] = await pool.execute(
      `SELECT
         c.comment_id,
         c.item_id,
         p.title AS product_name,
         c.user_id,
         CONCAT_WS(' ', u.first_name, u.last_name) AS commenter_name,
         c.parent_comment_id,
         c.comment_text,
         c.status,
         c.created_at
       FROM comments c
       INNER JOIN products p ON p.item_id = c.item_id
       INNER JOIN users u ON u.user_id = c.user_id
       ORDER BY c.created_at DESC, c.comment_id DESC`
    );

    return Response.json({ success: true, comments });
  } catch (error) {
    console.error("Admin comments GET API Error:", error);
    return Response.json(
      { success: false, message: "Failed to load product comments." },
      { status: 500 }
    );
  }
}
