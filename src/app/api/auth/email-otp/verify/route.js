import { NextResponse } from "next/server";
import {
  createVerifiedEmailToken,
  emailCookieOptions,
  emailOtpMatches,
  EMAIL_OTP_COOKIE,
  readEmailOtpToken,
  updateEmailOtpAttempts,
  VERIFIED_EMAIL_COOKIE,
} from "@/lib/emailOtp";

const MAX_ATTEMPTS = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const runtime = "nodejs";

export async function POST(request) {
  const otpCookie = request.cookies.get(EMAIL_OTP_COOKIE)?.value;

  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();

    if (!EMAIL_PATTERN.test(email) || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email and 6-digit code." },
        { status: 400 }
      );
    }

    if (!otpCookie) {
      return NextResponse.json(
        { success: false, message: "Your code has expired. Request a new one." },
        { status: 400 }
      );
    }

    let state;
    try {
      state = readEmailOtpToken(otpCookie);
    } catch {
      const response = NextResponse.json(
        { success: false, message: "Your code has expired. Request a new one." },
        { status: 400 }
      );
      response.cookies.set(
        EMAIL_OTP_COOKIE,
        "",
        emailCookieOptions("/api/auth/email-otp", 0)
      );
      return response;
    }

    if (typeof state === "string" || state.email !== email) {
      return NextResponse.json(
        { success: false, message: "Request a verification code for this email address." },
        { status: 400 }
      );
    }

    if (state.attempts >= MAX_ATTEMPTS) {
      const response = NextResponse.json(
        { success: false, message: "Too many incorrect attempts. Request a new code." },
        { status: 429 }
      );
      response.cookies.set(
        EMAIL_OTP_COOKIE,
        "",
        emailCookieOptions("/api/auth/email-otp", 0)
      );
      return response;
    }

    if (!emailOtpMatches(email, code, state.codeHash)) {
      const attempts = state.attempts + 1;
      const response = NextResponse.json(
        {
          success: false,
          message: attempts >= MAX_ATTEMPTS
            ? "Too many incorrect attempts. Request a new code."
            : "That code is incorrect. Please try again.",
        },
        { status: attempts >= MAX_ATTEMPTS ? 429 : 400 }
      );

      if (attempts >= MAX_ATTEMPTS) {
        response.cookies.set(
          EMAIL_OTP_COOKIE,
          "",
          emailCookieOptions("/api/auth/email-otp", 0)
        );
      } else {
        const expiresIn = Math.max(0, state.exp - Math.floor(Date.now() / 1000));
        response.cookies.set(
          EMAIL_OTP_COOKIE,
          updateEmailOtpAttempts(state, attempts),
          emailCookieOptions("/api/auth/email-otp", expiresIn)
        );
      }

      return response;
    }

    const response = NextResponse.json({
      success: true,
      message: "Email verified. You can now create your account.",
    });
    response.cookies.set(
      VERIFIED_EMAIL_COOKIE,
      createVerifiedEmailToken(email),
      emailCookieOptions("/api/auth/register", 10 * 60)
    );
    response.cookies.set(
      EMAIL_OTP_COOKIE,
      "",
      emailCookieOptions("/api/auth/email-otp", 0)
    );

    return response;
  } catch (error) {
    console.error("Email OTP verification error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to verify the code right now." },
      { status: 500 }
    );
  }
}