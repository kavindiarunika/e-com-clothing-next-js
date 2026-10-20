import { getAdmin } from "@/lib/auth";
import { getPool } from "@/lib/db";

function validateCouponDates(startDate, endDate) {
  const startTime = startDate ? new Date(startDate).getTime() : null;
  const endTime = endDate ? new Date(endDate).getTime() : null;

  return (
    (startTime === null || Number.isFinite(startTime)) &&
    (endTime === null || Number.isFinite(endTime)) &&
    (startTime === null || endTime === null || endTime >= startTime)
  );
}

function validateCoupon(body) {
  const discountValue = Number(body.discount_value);
  const minimumOrderAmount = Number(body.minimum_order_amount || 0);
  const maximumDiscount = body.maximum_discount === null || body.maximum_discount === ""
    ? null
    : Number(body.maximum_discount);

  if (!String(body.code || "").trim()) {
    return { error: "Coupon code is required." };
  }

  if (!["percentage", "fixed"].includes(body.discount_type)) {
    return { error: "Invalid discount type." };
  }

  if (
    !Number.isFinite(discountValue) ||
    discountValue < 0 ||
    (body.discount_type === "percentage" && discountValue > 100)
  ) {
    return { error: "Discount value must be valid." };
  }

  if (!Number.isFinite(minimumOrderAmount) || minimumOrderAmount < 0) {
    return { error: "Minimum order amount must be valid." };
  }

  if (
    maximumDiscount !== null &&
    (!Number.isFinite(maximumDiscount) || maximumDiscount < 0)
  ) {
    return { error: "Maximum discount must be valid." };
  }

  if (!validateCouponDates(body.start_date, body.end_date)) {
    return { error: "End date must be on or after the start date." };
  }

  if (!["active", "inactive"].includes(body.status)) {
    return { error: "Invalid coupon status." };
  }

  return {
    values: [
      String(body.code).trim().toUpperCase(),
      String(body.title || "").trim() || null,
      String(body.description || "").trim() || null,
      body.discount_type,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      body.start_date || null,
      body.end_date || null,
      body.status,
    ],
  };
}

export async function PUT(request, { params }) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { coupon_id: couponIdParam } = await params;
    const couponId = Number(couponIdParam);
    if (!Number.isInteger(couponId) || couponId <= 0) {
      return Response.json(
        { success: false, message: "Invalid coupon ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = validateCoupon(body);
    if (validation.error) {
      return Response.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [existingCoupons] = await pool.query(
      "SELECT coupon_id FROM coupons WHERE coupon_id = ? LIMIT 1",
      [couponId]
    );
    if (existingCoupons.length === 0) {
      return Response.json(
        { success: false, message: "Coupon not found." },
        { status: 404 }
      );
    }

    await pool.query(
      `UPDATE coupons
       SET code = ?,
           title = ?,
           description = ?,
           discount_type = ?,
           discount_value = ?,
           minimum_order_amount = ?,
           maximum_discount = ?,
           start_date = ?,
           end_date = ?,
           status = ?
       WHERE coupon_id = ?`,
      [...validation.values, couponId]
    );

    return Response.json({
      success: true,
      message: "Coupon updated successfully.",
    });
  } catch (error) {
    console.error("Coupons PUT API Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return Response.json(
        { success: false, message: "Coupon code already exists." },
        { status: 409 }
      );
    }

    return Response.json(
      { success: false, message: "Failed to update coupon." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { coupon_id: couponIdParam } = await params;
    const couponId = Number(couponIdParam);
    if (!Number.isInteger(couponId) || couponId <= 0) {
      return Response.json(
        { success: false, message: "Invalid coupon ID." },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [result] = await pool.query(
      "DELETE FROM coupons WHERE coupon_id = ?",
      [couponId]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        { success: false, message: "Coupon not found." },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    console.error("Coupons DELETE API Error:", error);

    return Response.json(
      { success: false, message: "Failed to delete coupon." },
      { status: 500 }
    );
  }
}
