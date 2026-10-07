import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createCustomerToken, CUSTOMER_COOKIE_NAME } from "@/lib/auth";

const STATE_COOKIE_NAME = "velora_google_oauth_state";
const NEXT_COOKIE_NAME = "velora_google_oauth_next";
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

function loginRedirect(request, status, reason) {
  const nextPath = request.cookies.get(NEXT_COOKIE_NAME)?.value;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const appOrigin = redirectUri
    ? new URL(redirectUri).origin
    : request.nextUrl.origin;
  const loginUrl = new URL("/user/login", appOrigin);
  loginUrl.searchParams.set("google", status);
  if (status === "error" && reason) {
    loginUrl.searchParams.set("google_reason", reason);
  }
  if (
    nextPath === "/user" ||
    (nextPath?.startsWith("/user/") &&
      !nextPath.startsWith("/user/login"))
  ) {
    loginUrl.searchParams.set("next", nextPath);
  }
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set(STATE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google/callback",
    maxAge: 0,
  });
  response.cookies.set(NEXT_COOKIE_NAME, "", {
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

  const callbackFailures = [];
  if (params.has("error")) callbackFailures.push("provider_error");
  if (!state) callbackFailures.push("missing_state");
  if (!savedState) callbackFailures.push("missing_state_cookie");
  if (state && savedState && state !== savedState) {
    callbackFailures.push("state_mismatch");
  }
  if (!code) callbackFailures.push("missing_authorization_code");
  if (!clientId || !clientSecret) {
    callbackFailures.push("missing_oauth_credentials");
  }

  if (callbackFailures.length > 0) {
    const reason = params.has("error")
      ? "provider_error"
      : callbackFailures.includes("missing_oauth_credentials")
        ? "oauth_config"
        : "session_error";
    console.error(
      "Google sign-in callback validation failed:",
      callbackFailures.join(", ")
    );
    return loginRedirect(request, "error", reason);
  }

  let failureReason = "token_exchange";
  try {
    failureReason = "token_exchange_network";
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
    let tokens;
    try {
      tokens = await tokenResponse.json();
    } catch {
      throw new Error("Google returned an invalid token response.");
    }

    if (!tokenResponse.ok || !tokens.id_token) {
      failureReason =
        {
          invalid_client: "oauth_invalid_client",
          unauthorized_client: "oauth_unauthorized_client",
          invalid_grant: "oauth_invalid_grant",
        }[tokens.error] || "token_exchange";
      throw new Error("Google token exchange failed.");
    }

    failureReason = "identity_verification";
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
    failureReason = "account_database";
    const existingUsers = await query(
      `SELECT user_id, first_name, last_name, email, role, status
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    let user = existingUsers[0];

    if (user && (user.role !== "customer" || user.status !== "active")) {
      console.error(
        "Google sign-in rejected: matching account is not an active customer."
      );
      return loginRedirect(request, "error", "account_inactive");
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
    return loginRedirect(request, "error", failureReason);
  }
}