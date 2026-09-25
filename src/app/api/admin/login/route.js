import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { createAdminToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    const [admins] = await db.execute(
      `
      SELECT user_id, first_name, last_name, email, password, role, status
      FROM users
      WHERE email = ? AND role = 'admin'
      LIMIT 1
      `,
      [email]
    );

    if (admins.length === 0) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    const admin = admins[0];

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // Check status if your table has status
    if (
      admin.status &&
      admin.status !== "active"
    ) {
      return NextResponse.json(
        {
          message: "This admin account is inactive",
        },
        {
          status: 403,
        }
      );
    }

    const token = createAdminToken({
      user_id: admin.user_id,
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Admin login successful",
      admin: {
        id: admin.user_id,
        name: `${admin.first_name} ${admin.last_name || ""}`.trim(),
        email: admin.email,
        role: admin.role,
      },
    });

    // Admin cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;

  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        message: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}