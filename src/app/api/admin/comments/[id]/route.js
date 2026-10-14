import { getAdmin } from "@/lib/auth";
import { getPool } from "@/lib/db";

const COMMENT_STATUSES = ["pending", "approved", "rejected"];

export async function PUT(request, context) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const commentId = Number(id);

    if (!Number.isInteger(commentId) || commentId < 1) {
      return Response.json(
        { success: false, message: "Invalid comment ID." },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, message: "Please submit a valid comment status." },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !COMMENT_STATUSES.includes(body.status)
    ) {
      return Response.json(
        { success: false, message: "Invalid comment status." },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [result] = await pool.execute(
      "UPDATE comments SET status = ? WHERE comment_id = ?",
      [body.status, commentId]
    );

    if (result.affectedRows === 0) {
      const [comments] = await pool.execute(
        "SELECT comment_id FROM comments WHERE comment_id = ?",
        [commentId]
      );

      if (comments.length === 0) {
        return Response.json(
          { success: false, message: "Comment not found." },
          { status: 404 }
        );
      }
    }

    return Response.json({ success: true, message: "Comment status updated." });
  } catch (error) {
    console.error("Admin comments PUT API Error:", error);
    return Response.json(
      { success: false, message: "Failed to update comment status." },
      { status: 500 }
    );
  }
}
