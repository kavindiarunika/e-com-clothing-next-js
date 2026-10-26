import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

const STATE_COOKIE_PREFIX = "velora_google_oauth_state_";
const NEXT_COOKIE_PREFIX = "velora_google_oauth_next_";
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
  const redirectUrl = new URL(redirectUri);
  const requestUrl = request.nextUrl;
  const redirectHost = redirectUrl.hostname.toLowerCase();
  const requestHost = requestUrl.hostname.toLowerCase();
  const requestAuthority = (
    request.headers.get("host") || requestUrl.host
  ).toLowerCase();

  if (
    process.env.NODE_ENV !== "production" &&
    LOCAL_HOSTS.has(requestHost) &&
    LOCAL_HOSTS.has(redirectHost) &&
    (requestAuthority !== redirectUrl.host.toLowerCase() ||
      requestUrl.protocol !== redirectUrl.protocol)
  ) {
    const localUrl = new URL(request.url);
    localUrl.protocol = redirectUrl.protocol;
    localUrl.host = redirectUrl.host;
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
  const cookieNames = {
    state: `${STATE_COOKIE_PREFIX}${state}`,
    next: `${NEXT_COOKIE_PREFIX}${state}`,
  };
  response.cookies.set(cookieNames.state, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google/callback",
    maxAge: 600,
  });
  response.cookies.set(
    cookieNames.next,
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