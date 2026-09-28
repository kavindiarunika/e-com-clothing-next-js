import { NextResponse } from "next/server";
import { createAdminToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();

    const username = String(body.username ?? body.email ?? "").trim();
    const password = String(body.password ?? "");
    const configuredUsername = process.env.ADMIN_USERNAME?.trim();
    const configuredPassword = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      return NextResponse.json(
        {
          message: "Username and password are required",
        },
        {
          status: 400,
        }
      );
    }

    if (!configuredUsername || !configuredPassword) {
      return NextResponse.json(
        {
          message: "Admin login is not configured",
        },
        { status: 500 }
      );
    }

    if (username !== configuredUsername || password !== configuredPassword) {
      return NextResponse.json(
        {
          message: "Invalid username or password",
        },
        {
          status: 401,
        }
      );
    }

    const admin = {
      user_id: "env-admin",
      first_name: "Admin",
      last_name: "",
      email: "admin@velora.local",
      role: "admin",
    };

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