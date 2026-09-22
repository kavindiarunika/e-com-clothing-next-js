import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const columns = await query(
      `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'orders'
      `
    );

    const names = columns.map((item) => item.COLUMN_NAME);

    const dateColumn =
      names.find((name) =>
        ["created_at", "order_date", "createdAt"].includes(name)
      ) || null;

    const amountColumn =
      names.find((name) =>
        [
          "total",
          "total_amount",
          "grand_total",
          "order_total",
          "amount",
        ].includes(name)
      ) || null;

    if (!dateColumn || !amountColumn) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Sales columns were not found",
      });
    }

    const rows = await query(
      `
      SELECT
        DATE(\`${dateColumn}\`) AS date,
        COUNT(*) AS orders,
        COALESCE(SUM(\`${amountColumn}\`), 0) AS revenue
      FROM orders
      GROUP BY DATE(\`${dateColumn}\`)
      ORDER BY date ASC
      LIMIT 365
      `
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}