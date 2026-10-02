import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createCustomerToken, CUSTOMER_COOKIE_NAME } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const users = await query(
      `SELECT user_id, first_name, last_name, email, password, role, status
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );
    const user = users[0];

    if (
      !user ||
      user.role !== "customer" ||
      user.status !== "active" ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      data: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });

    response.cookies.set(CUSTOMER_COOKIE_NAME, createCustomerToken(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("User login error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to sign in right now." },
      { status: 500 }
    );
  }
}