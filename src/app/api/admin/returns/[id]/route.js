import { getAdmin } from "@/lib/auth";
import { getPool } from "@/lib/db";

const RETURN_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "completed",
];

async function getReturnId(context) {
  const { id } = await context.params;
  const returnId = Number(id);

  return Number.isInteger(returnId) && returnId > 0
    ? returnId
    : null;
}

export async function PUT(request, context) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const returnId = await getReturnId(context);

    if (!returnId) {
      return Response.json(
        { success: false, message: "Invalid return ID" },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    if (!RETURN_STATUSES.includes(status)) {
      return Response.json(
        { success: false, message: "Invalid return status" },
        { status: 400 }
      );
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [returnRequests] = await connection.execute(
        `SELECT return_id, order_id, user_id, request_type, status
         FROM returns_exchanges
         WHERE return_id = ?
         FOR UPDATE`,
        [returnId]
      );

      if (returnRequests.length === 0) {
        await connection.rollback();
        return Response.json(
          { success: false, message: "Return request not found" },
          { status: 404 }
        );
      }

      const returnRequest = returnRequests[0];
      await connection.execute(
        "UPDATE returns_exchanges SET status = ? WHERE return_id = ?",
        [status, returnId]
      );

      if (status === "approved" && returnRequest.status !== "approved") {
        const requestType =
          returnRequest.request_type === "exchange" ? "Exchange" : "Return";

        await connection.execute(
          `INSERT INTO notifications (user_id, order_id, title, message, type)
           VALUES (?, ?, ?, ?, ?)`,
          [
            returnRequest.user_id,
            returnRequest.order_id,
            `${requestType} Approved`,
            `Your ${returnRequest.request_type} request for order #${returnRequest.order_id} has been approved.`,
            returnRequest.request_type,
          ]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return Response.json({
      success: true,
      message: "Return status updated",
    });
  } catch (error) {
    console.error("Returns PUT API Error:", error);
    return Response.json(
      { success: false, message: "Failed to update return status" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, context) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const returnId = await getReturnId(context);

    if (!returnId) {
      return Response.json(
        { success: false, message: "Invalid return ID" },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [result] = await pool.execute(
      "DELETE FROM returns_exchanges WHERE return_id = ?",
      [returnId]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        { success: false, message: "Return request not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Return request deleted",
    });
  } catch (error) {
    console.error("Returns DELETE API Error:", error);
    return Response.json(
      { success: false, message: "Failed to delete return request" },
      { status: 500 }
    );
  }
}
