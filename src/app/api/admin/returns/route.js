import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

/* =========================================
   GET RETURNS / EXCHANGES
========================================= */

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

    const [returns] = await pool.query(`
      SELECT
        return_id,
        order_id,
        order_item_id,
        user_id,
        request_type,
        reason,
        description,
        status,
        requested_at,
        processed_at
      FROM returns_exchanges
      ORDER BY return_id DESC
    `);

    return Response.json({
      success: true,
      returns,
    });
  } catch (error) {
    console.error(
      "Returns GET API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to load return requests",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}