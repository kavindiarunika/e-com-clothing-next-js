"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import AuthModeSwitch from "@/components/user/common/AuthModeSwitch";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const getPostLoginPath = () => {
    const requestedPath = new URLSearchParams(window.location.search).get("next");
    return requestedPath === "/user" ||
      (requestedPath?.startsWith("/user/") &&
        !requestedPath.startsWith("/user/login"))
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
      startTransition(() =>
        setError("Google sign-in failed. Please try again.")
      );
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
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

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-white p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden bg-white shadow-[0_18px_55px_rgba(0,0,0,0.28)] lg:min-h-[620px] lg:grid-cols-[0.8fr_1.2fr]">
        <AuthModeSwitch activeMode="login" embedded />

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-sm">
            <div className="mb-7 text-center">
              <Link
                href="/"
                aria-label="Velora home"
                className="inline-flex justify-center"
              >
                <Image
                  src="/logo.jpeg"
                  alt="Velora"
                  width={100}
                  height={100}
                  className="h-20 w-20 object-contain"
                  priority
                />
              </Link>
            </div>

            {error && (
              <p
                role="alert"
                className="mb-5 border border-[#C98B8B] bg-[#F8EAEA] px-4 py-3 text-sm text-[#8B3A3A]"
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex h-11 w-full items-center justify-center gap-3 border border-[#E5E5E5] bg-white text-xs font-semibold uppercase tracking-[1.3px] text-[#292524] transition hover:border-[#292524] hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </button>

            <div className="my-5 flex items-center gap-4">
              <span className="h-px flex-1 bg-[#E5E5E5]" />
              <span className="text-[10px] uppercase tracking-[2px] text-[#A69C94]">
                Or
              </span>
              <span className="h-px flex-1 bg-[#E5E5E5]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="group relative flex items-center rounded-md border border-[#D8D8D8] bg-white px-3 transition-colors focus-within:border-[#292524]">
                  <label
                    htmlFor="email"
                    className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#292524]"
                  >
                    Email
                  </label>
                  <Mail
                    size={17}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="shrink-0 text-[#8B817A] transition-colors group-focus-within:text-[#292524]"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    placeholder="Email"
                    required
                    className="h-12 w-full bg-transparent px-3 text-sm text-[#292524] outline-none placeholder:text-[#A69C94]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-end">
                  <Link
                    href="/user/forgot-password"
                    className="text-xs font-medium text-[var(--color-primary)] transition hover:text-[var(--color-primary-hover)]"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="group relative flex items-center rounded-md border border-[#D8D8D8] bg-white px-3 transition-colors focus-within:border-[#292524]">
                  <label
                    htmlFor="password"
                    className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#292524]"
                  >
                    Password
                  </label>
                  <LockKeyhole
                    size={17}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="shrink-0 text-[#8B817A] transition-colors group-focus-within:text-[#292524]"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Password"
                    required
                    className="h-12 w-full bg-transparent px-3 text-sm text-[#292524] outline-none placeholder:text-[#A69C94]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 rounded-full p-2 text-[#8B817A] transition hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-11 w-full items-center justify-center gap-2 bg-[#292524] text-xs font-semibold uppercase tracking-[2px] text-white transition duration-300 hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Login"}
                {!loading && (
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            <div className="mt-5 border-t border-[#E5E5E5] pt-5">
              <button
                type="button"
                onClick={() => router.push("/user/checkout?guest=true")}
                className="h-11 w-full border border-[#292524] bg-white text-xs font-semibold uppercase tracking-[1.5px] text-[#292524] transition hover:bg-[#F5F5F5]"
              >
                Continue as Guest
              </button>
              <p className="mt-2 text-center text-xs text-[#6B625C]">
                No account, email, or password needed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
