import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

// ==========================================
// GET ALL COUPONS
// ==========================================

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

    const [coupons] = await pool.query(`
      SELECT
        coupon_id,
        code,
        title,
        description,
        discount_type,
        discount_value,
        minimum_order_amount,
        maximum_discount,
        usage_limit,
        used_count,
        start_date,
        end_date,
        status,
        created_at

      FROM coupons

      ORDER BY coupon_id DESC
    `);

    return Response.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error(
      "Coupons GET API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to load coupons",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// CREATE COUPON
// ==========================================

export async function POST(request) {
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

    const body = await request.json();

    const {
      code,
      title,
      description,
      discount_type,
      discount_value,
      minimum_order_amount,
      maximum_discount,
      usage_limit,
      start_date,
      end_date,
      status,
    } = body;

    if (!code) {
      return Response.json(
        {
          success: false,
          message: "Coupon code is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !["percentage", "fixed"].includes(
        discount_type
      )
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid discount type",
        },
        {
          status: 400,
        }
      );
    }

    if (
      discount_value === undefined ||
      Number(discount_value) < 0
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Discount value must be valid",
        },
        {
          status: 400,
        }
      );
    }

    if (
      discount_type === "percentage" &&
      Number(discount_value) > 100
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Percentage discount cannot exceed 100",
        },
        {
          status: 400,
        }
      );
    }

    const pool = getPool();

    const [result] = await pool.query(
      `
      INSERT INTO coupons (
        code,
        title,
        description,
        discount_type,
        discount_value,
        minimum_order_amount,
        maximum_discount,
        usage_limit,
        start_date,
        end_date,
        status
      )

      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        code.trim().toUpperCase(),
        title || null,
        description || null,
        discount_type,
        Number(discount_value),
        Number(
          minimum_order_amount || 0
        ),
        maximum_discount === null ||
        maximum_discount === ""
          ? null
          : Number(maximum_discount),
        usage_limit === null ||
        usage_limit === ""
          ? null
          : Number(usage_limit),
        start_date || null,
        end_date || null,
        status || "active",
      ]
    );

    return Response.json(
      {
        success: true,
        message:
          "Coupon created successfully",
        coupon_id: result.insertId,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Coupons POST API Error:",
      error
    );

    if (error.code === "ER_DUP_ENTRY") {
      return Response.json(
        {
          success: false,
          message:
            "Coupon code already exists",
        },
        {
          status: 409,
        }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Failed to create coupon",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}