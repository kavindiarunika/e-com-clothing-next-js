import { NextResponse } from "next/server";
import { createAdminToken } from "@/lib/auth";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Admin@12345";

export async function POST(request) {
  try {
    const body = await request.json();

    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    // Check required fields
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username and password are required",
        },
        { status: 400 }
      );
    }

    // Check username
    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        { status: 401 }
      );
    }

    // Check password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        { status: 401 }
      );
    }

    // Admin user information
    const user = {
      user_id: 1,
      first_name: "Admin",
      last_name: "",
      username: "admin",
      email: "admin@example.com",
      role: "admin",
    };

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
        username: user.username,
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