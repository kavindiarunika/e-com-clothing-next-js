import { getPool } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export async function POST(request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      status = "active",
    } = body;

    if (!first_name?.trim() || !email?.trim() || !password) {
      return Response.json(
        {
          success: false,
          message: "First name, email, and password are required",
        },
        { status: 400 }
      );
    }

    if (!["active", "inactive"].includes(status)) {
      return Response.json(
        { success: false, message: "Invalid customer status" },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [result] = await pool.query(
      `
      INSERT INTO users
        (first_name, last_name, email, password, phone, role, status)
      VALUES (?, ?, ?, ?, ?, 'customer', ?)
      `,
      [
        first_name.trim(),
        last_name?.trim() || null,
        email.trim(),
        password,
        phone?.trim() || null,
        status,
      ]
    );

    return Response.json(
      {
        success: true,
        message: "Customer created successfully",
        user_id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customer POST API Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return Response.json(
        { success: false, message: "Email is already registered" },
        { status: 409 }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Failed to create customer",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/* =========================================
  GET ALL CUSTOMERS
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

    const [customers] = await pool.query(
      `
      SELECT
        user_id,
        first_name,
        last_name,
        email,
        phone,
        status,
        created_at
      FROM users
      WHERE role = 'customer'
      ORDER BY user_id DESC
      `
    );

    return Response.json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error(
      "Customer GET API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to load customer",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   UPDATE CUSTOMER
========================================= */

export async function PUT(
  request,
  { params }
) {
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

    const userId = params.id ?? params.user_id;

    const body = await request.json();

    const {
      first_name,
      last_name,
      email,
      phone,
      status,
    } = body;

    if (!first_name || !first_name.trim()) {
      return Response.json(
        {
          success: false,
          message: "First name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!email || !email.trim()) {
      return Response.json(
        {
          success: false,
          message: "Email is required",
        },
        {
          status: 400,
        }
      );
    }

    const allowedStatuses = [
      "active",
      "inactive",
    ];

    if (!allowedStatuses.includes(status)) {
      return Response.json(
        {
          success: false,
          message: "Invalid customer status",
        },
        {
          status: 400,
        }
      );
    }

    const pool = getPool();

    const [existing] = await pool.query(
      `
      SELECT user_id
      FROM users
      WHERE email = ?
      AND user_id != ?
      LIMIT 1
      `,
      [
        email.trim(),
        userId,
      ]
    );

    if (existing.length > 0) {
      return Response.json(
        {
          success: false,
          message: "Another customer already uses this email",
        },
        {
          status: 409,
        }
      );
    }

    const [result] = await pool.query(
      `
      UPDATE users
      SET
        first_name = ?,
        last_name = ?,
        email = ?,
        phone = ?,
        status = ?
      WHERE user_id = ?
      `,
      [
        first_name.trim(),
        last_name?.trim() || null,
        email.trim(),
        phone?.trim() || null,
        status,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        {
          success: false,
          message: "Customer not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      message: "Customer updated successfully",
    });
  } catch (error) {
    console.error(
      "Customer PUT API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to update customer",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   DELETE CUSTOMER
========================================= */

export async function DELETE(
  request,
  { params }
) {
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

    const userId = params.id ?? params.user_id;

    const pool = getPool();

    const [result] = await pool.query(
      `
      DELETE FROM users
      WHERE user_id = ?
      `,
      [userId]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        {
          success: false,
          message: "Customer not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error(
      "Customer DELETE API Error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to delete customer",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}