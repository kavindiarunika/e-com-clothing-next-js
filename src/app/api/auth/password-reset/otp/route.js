import { randomInt } from "node:crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  createEmailOtpToken,
  emailCookieOptions,
  getEmailOtpSecret,
  PASSWORD_RESET_OTP_COOKIE,
  readEmailOtpToken,
} from "@/lib/emailOtp";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_SECONDS = 10 * 60;
const RESEND_WAIT_SECONDS = 60;
const GENERIC_MESSAGE = "If an active account exists for that email, a code has been sent.";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email) || email.length > 150) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const smtpPort = Number(process.env.SMTP_PORT);
    if (
      !process.env.SMTP_HOST ||
      !Number.isInteger(smtpPort) ||
      smtpPort < 1 ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD
    ) {
      return NextResponse.json(
        { success: false, message: "Email delivery is not configured." },
        { status: 503 }
      );
    }

    try {
      getEmailOtpSecret();
    } catch {
      return NextResponse.json(
        { success: false, message: "Email verification is not configured." },
        { status: 503 }
      );
    }

    const existingToken = request.cookies.get(PASSWORD_RESET_OTP_COOKIE)?.value;
    if (existingToken) {
      try {
        const state = readEmailOtpToken(existingToken);
        const waitRemaining = RESEND_WAIT_SECONDS -
          (Math.floor(Date.now() / 1000) - state.sentAt);

        if (
          state.email === email &&
          state.purpose === "password-reset" &&
          waitRemaining > 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message: `Please wait ${waitRemaining} seconds before requesting another code.`,
            },
            { status: 429 }
          );
        }
      } catch {
        // Expired reset tokens do not prevent a new request.
      }
    }

    const users = await query(
      `SELECT user_id FROM users
       WHERE email = ? AND role = 'customer' AND status = 'active'
       LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
    }

    const code = String(randomInt(100000, 1000000));
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Your Velora password reset code",
      text: `Your Velora password reset code is ${code}. It expires in 10 minutes. If you did not request a reset, ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;color:#322D29;max-width:520px;margin:auto;padding:32px"><p style="font-size:12px;letter-spacing:3px;color:#72383D">VELORA</p><h1 style="font-size:24px;font-weight:500">Reset your password</h1><p>Enter this code to reset your password. It expires in 10 minutes.</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;padding:16px 0">${code}</p><p style="font-size:13px;color:#6B625C">If you did not request a reset, you can ignore this email.</p></div>`,
    });

    const response = NextResponse.json({ success: true, message: GENERIC_MESSAGE });
    response.cookies.set(
      PASSWORD_RESET_OTP_COOKIE,
      createEmailOtpToken(email, code, "password-reset"),
      emailCookieOptions("/api/auth/password-reset", OTP_TTL_SECONDS)
    );

    return response;
  } catch (error) {
    console.error("Password reset OTP request error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send a reset code right now." },
      { status: 500 }
    );
  }
}