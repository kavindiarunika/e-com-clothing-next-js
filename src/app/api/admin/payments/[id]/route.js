import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getPool } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    if (!(await getAdmin())) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment ID",
        },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [payments] = await pool.query(
      `
      SELECT
        payment_id,
        order_id,
        payment_method,
        transaction_id,
        amount,
        payment_status,
        paid_at,
        created_at
      FROM payments
      WHERE payment_id = ?
      LIMIT 1
      `,
      [id]
    );

    if (payments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: payments[0],
    });
  } catch (error) {
    console.error("Payment detail GET API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load payment",
      },
      { status: 500 }
    );
  }
}
