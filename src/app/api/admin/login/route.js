
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createAdminToken } from "@/lib/auth";

const SEEDED_PASSWORD_PLACEHOLDER = "PASTE_BCRYPT_HASH_HERE";
const SEEDED_ADMIN_PASSWORD = "Admin@12345";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    // Check required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Find admin/user by email
    const users = await query(
      "SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1",
      [email]
    );

    if (!users.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const user = users[0];

    // Only admin users can access admin panel
    if (
      user.role !== "admin" &&
      user.role !== "super_admin" &&
      user.role !== "superadmin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    // Check account status
    if (user.status && user.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin account is not active",
        },
        { status: 403 }
      );
    }

    // Check password
    let validPassword = false;

    if (user.password === SEEDED_PASSWORD_PLACEHOLDER) {
      validPassword = password === SEEDED_ADMIN_PASSWORD;
    } else {
      validPassword = await bcrypt.compare(
        password,
        user.password
      );
    }

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = createAdminToken(user);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });

    // Save authentication cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,

      // Localhost = false
      // Production HTTPS = true
      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      maxAge: 60 * 60 * 24,

      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}

