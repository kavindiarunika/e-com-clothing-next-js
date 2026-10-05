import { createHmac, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";

export const EMAIL_OTP_COOKIE = "velora_email_otp";
export const VERIFIED_EMAIL_COOKIE = "velora_verified_email";
export const PASSWORD_RESET_OTP_COOKIE = "velora_password_reset_otp";
export const PASSWORD_RESET_VERIFIED_COOKIE = "velora_password_reset_verified";

const OTP_TTL_SECONDS = 10 * 60;

export function getEmailOtpSecret() {
  const secret = process.env.EMAIL_OTP_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("EMAIL_OTP_SECRET must contain at least 32 characters.");
  }

  return secret;
}

function hashOtp(email, code, purpose) {
  return createHmac("sha256", getEmailOtpSecret())
    .update(`${purpose}:${email}:${code}`)
    .digest("hex");
}

export function createEmailOtpToken(email, code, purpose = "signup") {
  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      email,
      purpose,
      codeHash: hashOtp(email, code, purpose),
      attempts: 0,
      sentAt: now,
      exp: now + OTP_TTL_SECONDS,
    },
    getEmailOtpSecret()
  );
}

export function readEmailOtpToken(token) {
  return jwt.verify(token, getEmailOtpSecret());
}

export function updateEmailOtpAttempts(state, attempts) {
  return jwt.sign(
    { ...state, attempts },
    getEmailOtpSecret()
  );
}

export function emailOtpMatches(email, code, expectedHash, purpose = "signup") {
  const actual = Buffer.from(hashOtp(email, code, purpose), "hex");
  const expected = Buffer.from(expectedHash || "", "hex");

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createVerifiedEmailToken(email, purpose = "signup") {
  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    { email, purpose, verified: true, exp: now + OTP_TTL_SECONDS },
    getEmailOtpSecret()
  );
}

export function isEmailVerified(email, token, purpose = "signup") {
  if (!token) return false;

  try {
    const state = jwt.verify(token, getEmailOtpSecret());
    return typeof state !== "string" &&
      state.email === email &&
      state.purpose === purpose &&
      state.verified === true;
  } catch {
    return false;
  }
}

export function emailCookieOptions(path, maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path,
    maxAge,
  };
}