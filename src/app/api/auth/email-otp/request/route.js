import { randomInt } from "node:crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  createEmailOtpToken,
  emailCookieOptions,
  EMAIL_OTP_COOKIE,
  getEmailOtpSecret,
  readEmailOtpToken,
} from "@/lib/emailOtp";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_SECONDS = 10 * 60;
const RESEND_WAIT_SECONDS = 60;

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
        {
          success: false,
          message: "Email delivery is not configured. Add the SMTP settings to .env.local.",
        },
        { status: 503 }
      );
    }

    try {
      getEmailOtpSecret();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Email verification is not configured. Add EMAIL_OTP_SECRET to .env.local.",
        },
        { status: 503 }
      );
    }

    const existingUsers = await query(
      "SELECT user_id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const existingOtpToken = request.cookies.get(EMAIL_OTP_COOKIE)?.value;
    if (existingOtpToken) {
      try {
        const state = readEmailOtpToken(existingOtpToken);
        const waitRemaining = RESEND_WAIT_SECONDS -
          (Math.floor(Date.now() / 1000) - state.sentAt);

        if (state.email === email && waitRemaining > 0) {
          return NextResponse.json(
            {
              success: false,
              message: `Please wait ${waitRemaining} seconds before requesting another code.`,
              retryAfterSeconds: waitRemaining,
            },
            { status: 429 }
          );
        }
      } catch {
        // An expired or invalid cookie does not prevent a new verification request.
      }
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
      subject: "Your Velora verification code",
      text: `Your Velora verification code is ${code}. It expires in 10 minutes.`,
      html: `<div style="font-family:Arial,sans-serif;color:#322D29;max-width:520px;margin:auto;padding:32px"><p style="font-size:12px;letter-spacing:3px;color:#72383D">VELORA</p><h1 style="font-size:24px;font-weight:500">Verify your email</h1><p>Enter this code to finish creating your account. It expires in 10 minutes.</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;padding:16px 0">${code}</p><p style="font-size:13px;color:#6B625C">If you did not request this code, you can ignore this email.</p></div>`,
    });

    const response = NextResponse.json({
      success: true,
      message: `A verification code has been sent to ${email}.`,
    });
    response.cookies.set(
      EMAIL_OTP_COOKIE,
      createEmailOtpToken(email, code),
      emailCookieOptions("/api/auth/email-otp", OTP_TTL_SECONDS)
    );

    return response;
  } catch (error) {
    console.error("Email OTP request error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to send the verification code. Check your mail settings and try again.",
      },
      { status: 500 }
    );
  }
}