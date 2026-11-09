
"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const getPostLoginPath = () => {
    const requestedPath = new URLSearchParams(window.location.search).get("next");
    return (requestedPath === "/user" ||
      (requestedPath?.startsWith("/user/") &&
        !requestedPath.startsWith("/user/login")))
      ? requestedPath
      : "/user";
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const googleStatus = searchParams.get("google");

    if (googleStatus === "success") {
      localStorage.setItem("velora-user-session", "true");
      window.location.replace(getPostLoginPath());
    } else if (googleStatus === "unavailable") {
      startTransition(() => setError("Google sign-in is not configured yet."));
    } else if (googleStatus === "error") {
      const failureMessages = {
        account_database:
          "Google authenticated you, but your account could not be loaded or created. Check the MySQL server and users table.",
        account_inactive:
          "This email is linked to an inactive or non-customer account. Contact the store administrator.",
        identity_verification:
          "Google sign-in could not verify your account. Try again or check the dev-server terminal.",
        oauth_invalid_client:
          "Google rejected the OAuth client credentials. Verify the client ID and current client secret in .env, then restart the dev server.",
        oauth_invalid_grant:
          "Google rejected the sign-in code. Start again at http://localhost:3000 and make sure the authorized redirect URI is exactly http://localhost:3000/api/auth/google/callback.",
        oauth_unauthorized_client:
          "This OAuth client is not permitted for the requested sign-in. Check the OAuth client type and consent-screen configuration in Google Cloud Console.",
        oauth_config:
          "Google OAuth credentials are missing. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env, then restart the dev server.",
        provider_error:
          "Google declined or canceled sign-in. Check the OAuth consent screen and add your account as a test user if the app is in testing mode.",
        session_error:
          "The Google sign-in session expired or changed hosts. Start again at http://localhost:3000 and use the same address throughout.",
        token_exchange_network:
          "The app could not reach Google's token service. Check the server's internet connection, then try again.",
        token_exchange:
          "Google rejected the OAuth token exchange. Check the client secret and confirm the authorized redirect URI is exactly http://localhost:3000/api/auth/google/callback.",
      };
      const reason = searchParams.get("google_reason");
      startTransition(() =>
        setError(
          failureMessages[reason] ||
            "Google sign-in failed. Check the dev-server terminal for details."
        )
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to sign in.");
      }

      localStorage.setItem("velora-user-session", "true");
      window.location.replace(getPostLoginPath());
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    setGoogleLoading(true);
    const googleUrl = new URL("/api/auth/google", window.location.origin);
    googleUrl.searchParams.set("next", getPostLoginPath());
    window.location.assign(googleUrl);
  };

  const handleGuestCheckout = () => {
    router.push("/user/checkout?guest=true");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#747b78] px-4 py-8 sm:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden bg-white shadow-2xl lg:min-h-[620px] lg:grid-cols-2">

        {/* =========================
            LEFT IMAGE
        ========================= */}
        <div className="relative hidden min-h-[620px] overflow-hidden lg:block">
          <img
            src="/images/login/login.jpg"
            alt="Velora fashion"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-[#292524]/40" />

          <div className="absolute inset-x-10 bottom-12 text-center text-white">
            <p className="mb-4 text-xs uppercase tracking-[4px] text-[#FAF6F5]">
              VELORA
            </p>

            <h2 className="font-serif text-5xl leading-tight">
              Style that
              <span className="block italic text-[#CCB2A5]">
                feels like you.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-6 text-white/70">
              Discover timeless pieces designed for your everyday
              elegance.
            </p>
          </div>
        </div>

        {/* =========================
            RIGHT LOGIN
        ========================= */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-sm">

            {/* BRAND */}
            <div className="mb-5 text-center">
              <Link
                href="/"
                className="font-serif text-2xl font-semibold tracking-wide text-[#292524]"
              >
                VELORA
              </Link>

            </div>

            <div className="mb-6 space-y-3">
              <button
                type="button"
                onClick={handleGuestCheckout}
                className="h-11 w-full rounded-full bg-black text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#292524]"
              >
                Continue as Guest
              </button>
              <Link
                href="/user/register"
                className="flex h-11 w-full items-center justify-center rounded-full border border-[#D8D8D8] bg-white text-xs font-semibold uppercase tracking-[1.5px] text-[#292524] transition hover:border-[#292524] hover:bg-[#FAF6F5]"
              >
                Create Account
              </Link>
              <p className="mt-2 text-center text-xs text-[#6B625C]">
                No account, email, or password needed.
              </p>
            </div>

            {/* TITLE */}
            <div className="mb-5 text-center">
              <h1 className="font-serif text-2xl text-[#292524]">
                Welcome back
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#6B625C]">
                Sign in to your Velora account
              </p>
            </div>

            {/* LOGIN FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {error && (
                <p
                  role="alert"
                  className="border border-[#C98B8B] bg-[#F8EAEA] px-4 py-3 text-sm text-[#8B3A3A]"
                >
                  {error}
                </p>
              )}

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[1.5px] text-[#292524]"
                >
                  Email
                </label>

                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your email"
                    required
                    className="w-full border-0 border-b border-[#D8D8D8] bg-transparent px-0 py-2.5 text-sm text-[#292524] outline-none transition placeholder:text-[#A69C94] focus:border-[#292524]"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-[1.5px] text-[#292524]"
                  >
                    Password
                  </label>

                  <Link
                    href="/user/forgot-password"
                    className="text-[11px] font-medium text-[#6B8A67] transition hover:text-[#4F6F4B]"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    required
                    className="w-full border-0 border-b border-[#D8D8D8] bg-transparent px-0 py-2.5 pr-12 text-sm text-[#292524] outline-none transition placeholder:text-[#A69C94] focus:border-[#292524]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-[#8B817A]
                      transition
                      hover:text-[#e63e62]
                    "
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-11 w-full items-center justify-center gap-3 rounded-full bg-[#626262] text-sm font-semibold text-white transition duration-300 hover:bg-[#454545] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Login"}

                {!loading && (
                  <ArrowRight
                    size={16}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                )}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#E7DEDC]" />
              <span className="text-[10px] text-[#A69C94]">or</span>
              <span className="h-px flex-1 bg-[#E7DEDC]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex h-10 w-full items-center justify-center gap-2 text-xs text-[#292524] transition hover:bg-[#FAF6F5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.79-.07-1.55-.23-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.42Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.75 9.75 0 0 0 12 21.5Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.53 13.58A5.86 5.86 0 0 1 6.23 12c0-.55.1-1.08.3-1.58V7.89H3.28A9.76 9.76 0 0 0 2.25 12c0 1.57.38 3.06 1.03 4.11l3.25-2.53Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.39c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.49 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.72 5.39l3.25 2.53C7.3 8.11 9.46 6.39 12 6.39Z"
                />
              </svg>
              {googleLoading ? "Redirecting..." : "Sign in with Google"}
            </button>

          </div>
        </div>
      </div>
    </main>
  );
}
