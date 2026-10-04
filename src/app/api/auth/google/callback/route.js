import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createCustomerToken, CUSTOMER_COOKIE_NAME } from "@/lib/auth";

const STATE_COOKIE_NAME = "velora_google_oauth_state";
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

function loginRedirect(request, status) {
  const response = NextResponse.redirect(
    new URL(`/user/login?google=${status}`, request.url)
  );
  response.cookies.set(STATE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google/callback",
    maxAge: 0,
  });
  return response;
}

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const state = params.get("state");
  const savedState = request.cookies.get(STATE_COOKIE_NAME)?.value;
  const code = params.get("code");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${request.nextUrl.origin}/api/auth/google/callback`;

  if (
    params.has("error") ||
    !state ||
    !savedState ||
    state !== savedState ||
    !code ||
    !clientId ||
    !clientSecret
  ) {
    return loginRedirect(request, "error");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
      cache: "no-store",
    });
    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok || !tokens.id_token) {
      throw new Error("Google token exchange failed.");
    }

    const { payload } = await jwtVerify(tokens.id_token, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId,
    });

    if (
      payload.email_verified !== true ||
      typeof payload.email !== "string" ||
      !payload.email
    ) {
      throw new Error("Google did not return a verified email address.");
    }

    const email = payload.email.trim().toLowerCase();
    const existingUsers = await query(
      `SELECT user_id, first_name, last_name, email, role, status
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    let user = existingUsers[0];

    if (user && (user.role !== "customer" || user.status !== "active")) {
      return loginRedirect(request, "error");
    }

    if (!user) {
      const nameParts = String(payload.name || "").trim().split(/\s+/);
      const firstName = String(
        payload.given_name || nameParts.shift() || email.split("@")[0]
      ).slice(0, 100);
      const lastName = String(payload.family_name || nameParts.join(" ")).slice(
        0,
        100
      );
      const generatedPassword = await bcrypt.hash(
        randomBytes(32).toString("hex"),
        12
      );
      const result = await query(
        `INSERT INTO users (first_name, last_name, email, password)
         VALUES (?, ?, ?, ?)`,
        [firstName, lastName, email, generatedPassword]
      );
      user = {
        user_id: result.insertId,
        first_name: firstName,
        last_name: lastName,
        email,
      };
    }

    const response = loginRedirect(request, "success");
    response.cookies.set(CUSTOMER_COOKIE_NAME, createCustomerToken(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Google sign-in error:", error);
    return loginRedirect(request, "error");
  }
}