import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  emailCookieOptions,
  isEmailVerified,
  PASSWORD_RESET_VERIFIED_COOKIE,
} from "@/lib/emailOtp";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!EMAIL_PATTERN.test(email) || email.length > 150) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    const verifiedToken = request.cookies.get(PASSWORD_RESET_VERIFIED_COOKIE)?.value;
    if (!isEmailVerified(email, verifiedToken, "password-reset")) {
      return NextResponse.json(
        { success: false, message: "Verify your email before resetting your password." },
        { status: 403 }
      );
    }

    const users = await query(
      `SELECT user_id FROM users
       WHERE email = ? AND role = 'customer' AND status = 'active'
       LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "This password reset request is no longer valid." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await query("UPDATE users SET password = ? WHERE user_id = ?", [
      hashedPassword,
      users[0].user_id,
    ]);

    const response = NextResponse.json({
      success: true,
      message: "Your password has been updated.",
    });
    response.cookies.set(
      PASSWORD_RESET_VERIFIED_COOKIE,
      "",
      emailCookieOptions("/api/auth/password-reset/reset", 0)
    );

    return response;
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to reset your password right now." },
      { status: 500 }
    );
  }
}