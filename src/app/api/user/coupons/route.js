import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pool = getPool();
    const [coupons] = await pool.query(`
      SELECT
        coupon_id,
        code,
        title,
        description,
        discount_type,
        discount_value,
        minimum_order_amount,
        maximum_discount
      FROM coupons
      WHERE status = 'active'
      ORDER BY minimum_order_amount ASC, coupon_id DESC
    `);

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("User coupons API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load available coupons.",
      },
      { status: 500 }
    );
  }
}
