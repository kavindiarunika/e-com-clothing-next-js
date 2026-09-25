
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem("velora-user-session", "true");
    router.push("/user");
  };

  const handleGoogleLogin = () => {
    localStorage.setItem("velora-user-session", "true");
    router.push("/user");
  };

  return (
    <main className="min-h-screen bg-[#EFE9E1]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =========================
            LEFT IMAGE
        ========================= */}
        <div className="relative hidden overflow-hidden lg:block">
          <img
            src="/images/auth/login.jpg"
            alt="Velora fashion"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-[#322D29]/40" />

          <div className="absolute bottom-12 left-12 max-w-md text-white">
            <p className="mb-4 text-xs uppercase tracking-[4px] text-[#E3DCD1]">
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
        <div className="flex items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-sm">

            {/* BRAND */}
            <div className="mb-7 text-center">
              <Link
                href="/"
                className="font-serif text-2xl tracking-wide text-[#322D29]"
              >
                VELORA
              </Link>

              <div className="mx-auto mt-4 h-px w-8 bg-[#72383D]" />
            </div>

            {/* TITLE */}
            <div className="mb-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
                Welcome Back
              </p>

              <h1 className="font-serif text-3xl text-[#322D29]">
                Sign in to your account
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#6B625C]">
                Welcome back. Enter your details to continue.
              </p>
            </div>

            {/* GOOGLE LOGIN */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="
                flex
                h-11
                w-full
                items-center
                justify-center
                gap-3
                border
                border-[#D8D0C8]
                bg-white
                text-xs
                font-semibold
                uppercase
                tracking-[1.3px]
                text-[#322D29]
                transition
                duration-300
                hover:border-[#322D29]
                hover:bg-[#F8F5F1]
              "
            >
              {/* Google Icon */}
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

              Continue with Google
            </button>

            {/* DIVIDER */}
            <div className="my-5 flex items-center gap-4">
              <span className="h-px flex-1 bg-[#D8D0C8]" />

              <span className="text-[10px] uppercase tracking-[2px] text-[#A69C94]">
                Or
              </span>

              <span className="h-px flex-1 bg-[#D8D0C8]" />
            </div>

            {/* LOGIN FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]"
                >
                  Email
                </label>

                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="
                      w-full
                      border
                      border-[#D8D0C8]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-[#322D29]
                      outline-none
                      transition
                      placeholder:text-[#A69C94]
                      focus:border-[#72383D]
                    "
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]"
                  >
                    Password
                  </label>

                  <Link
                    href="/user/forgot-password"
                    className="
                      text-[11px]
                      font-medium
                      text-[#72383D]
                      transition
                      hover:text-[#432415]
                    "
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
                    placeholder="Enter your password"
                    required
                    className="
                      w-full
                      border
                      border-[#D8D0C8]
                      bg-white
                      px-4
                      py-3
                      pr-12
                      text-sm
                      text-[#322D29]
                      outline-none
                      transition
                      placeholder:text-[#A69C94]
                      focus:border-[#72383D]
                    "
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
                      hover:text-[#72383D]
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
                className="
                  group
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-3
                  bg-[#322D29]
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[2px]
                  text-white
                  transition
                  duration-300
                  hover:bg-[#72383D]
                "
              >
                Login

                <ArrowRight
                  size={16}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </button>
            </form>

            {/* REGISTER */}
            <div className="mt-6 border-t border-[#D8D0C8] pt-5 text-center">
              <p className="text-sm text-[#6B625C]">
                Don't have an account?
              </p>

              <Link
                href="/user/register"
                className="
                  mt-2
                  inline-block
                  text-sm
                  font-semibold
                  text-[#72383D]
                  transition
                  hover:text-[#432415]
                "
              >
                Create Account
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

