import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

const STATE_COOKIE_NAME = "velora_google_oauth_state";
const NEXT_COOKIE_NAME = "velora_google_oauth_next";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function getSafeNextPath(value) {
  return (value === "/user" ||
    (value?.startsWith("/user/") && !value.startsWith("/user/login")))
    ? value
    : "";
}

export async function GET(request) {
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${request.nextUrl.origin}/api/auth/google/callback`;
  const redirectHost = new URL(redirectUri).hostname.toLowerCase();
  const requestHost = request.headers
    .get("host")
    ?.replace(/:\d+$/, "")
    .toLowerCase();

  if (
    process.env.NODE_ENV !== "production" &&
    LOCAL_HOSTS.has(requestHost) &&
    LOCAL_HOSTS.has(redirectHost) &&
    requestHost !== redirectHost
  ) {
    const localUrl = new URL(request.url);
    localUrl.hostname = redirectHost;
    return NextResponse.redirect(localUrl);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/user/login?google=unavailable", request.url)
    );
  }

  const state = randomBytes(32).toString("hex");
  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  }).toString();

  const response = NextResponse.redirect(googleUrl);
  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google/callback",
    maxAge: 600,
  });
  response.cookies.set(
    NEXT_COOKIE_NAME,
    getSafeNextPath(request.nextUrl.searchParams.get("next")),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/google/callback",
      maxAge: 600,
    }
  );

  return response;
}