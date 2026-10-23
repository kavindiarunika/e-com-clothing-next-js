
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* =========================
     SEND OTP
  ========================= */
  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/password-reset/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to send a reset code.");
      }

      setMessage(result.message);
      setStep(2);
    } catch (requestError) {
      setError(requestError.message || "Unable to send a reset code.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     VERIFY OTP
  ========================= */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/password-reset/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to verify the code.");
      }

      setStep(3);
    } catch (verifyError) {
      setError(verifyError.message || "Unable to verify the code.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESET PASSWORD
  ========================= */
  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/password-reset/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to reset your password.");
      }

      setStep(4);
    } catch (resetError) {
      setError(resetError.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/password-reset/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to resend the code.");
      }

      setMessage(result.message);
    } catch (requestError) {
      setError(requestError.message || "Unable to resend the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <div className="flex min-h-screen items-center justify-center px-5 py-12">

        <div className="w-full max-w-md">

          {/* =========================
              BRAND
          ========================= */}
          <div className="mb-10 text-center">
            <Link
              href="/"
              className="
                font-serif
                text-3xl
                tracking-wide
                text-[#292524]
              "
            >
              VELORA
            </Link>

            <div className="mx-auto mt-5 h-px w-10 bg-[#e63e62]" />
          </div>

          {/* =========================
              CARD
          ========================= */}
          <div
            className="
              border
              border-[#E7DEDC]
              bg-[#FAF6F5]
              px-6
              py-8
              shadow-[0_20px_60px_rgba(50,45,41,0.08)]
              sm:px-10
              sm:py-10
            "
          >

            {/* =========================
                STEP INDICATOR
            ========================= */}
            <div className="mb-9 flex items-center justify-center">

              {/* STEP 1 */}
              <Step
                number="1"
                active={step >= 1}
                completed={step > 1}
              />

              <div
                className={`h-px w-10 ${
                  step > 1
                    ? "bg-[#e63e62]"
                    : "bg-[#E7DEDC]"
                }`}
              />

              {/* STEP 2 */}
              <Step
                number="2"
                active={step >= 2}
                completed={step > 2}
              />

              <div
                className={`h-px w-10 ${
                  step > 2
                    ? "bg-[#e63e62]"
                    : "bg-[#E7DEDC]"
                }`}
              />

              {/* STEP 3 */}
              <Step
                number="3"
                active={step >= 3}
                completed={step > 3}
              />

            </div>

            {/* =========================
                STEP 1 - EMAIL
            ========================= */}
            {step === 1 && (
              <>
                <div className="mb-8 text-center">

                  <div
                    className="
                      mx-auto
                      mb-5
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-[#FAF6F5]
                      text-[#e63e62]
                    "
                  >
                    <Mail
                      size={23}
                      strokeWidth={1.5}
                    />
                  </div>

                  <p
                    className="
                      mb-3
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[3px]
                      text-[#e63e62]
                    "
                  >
                    Password Recovery
                  </p>

                  <h1
                    className="
                      font-serif
                      text-3xl
                      text-[#292524]
                      sm:text-4xl
                    "
                  >
                    Forgot your password?
                  </h1>

                  <p
                    className="
                      mx-auto
                      mt-4
                      max-w-sm
                      text-sm
                      leading-6
                      text-[#6B625C]
                    "
                  >
                    Enter your email address and we&apos;ll send you
                    a verification code.
                  </p>
                </div>

                <form
                  onSubmit={handleSendOtp}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[1.5px]
                        text-[#292524]
                      "
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="Enter your email"
                      required
                      className="
                        w-full
                        border
                        border-[#E7DEDC]
                        bg-white
                        px-4
                        py-3.5
                        text-sm
                        text-[#292524]
                        outline-none
                        transition
                        placeholder:text-[#A69C94]
                        focus:border-[#e63e62]
                      "
                    />
                  </div>

                  {error && <ErrorMessage message={error} />}
                  {message && <p role="status" className="text-xs text-[#547454]">{message}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      group
                      flex
                      h-12
                      w-full
                      items-center
                      justify-center
                      gap-3
                      bg-[#292524]
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[2px]
                      text-white
                      transition
                      duration-300
                      hover:bg-[#e63e62]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loading ? "Sending..." : "Send OTP"}

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
              </>
            )}

            {/* =========================
                STEP 2 - OTP
            ========================= */}
            {step === 2 && (
              <>
                <div className="mb-8 text-center">

                  <div
                    className="
                      mx-auto
                      mb-5
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-[#FAF6F5]
                      text-[#e63e62]
                    "
                  >
                    <ShieldCheck
                      size={23}
                      strokeWidth={1.5}
                    />
                  </div>

                  <p
                    className="
                      mb-3
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[3px]
                      text-[#e63e62]
                    "
                  >
                    Verification
                  </p>

                  <h1
                    className="
                      font-serif
                      text-3xl
                      text-[#292524]
                      sm:text-4xl
                    "
                  >
                    Enter your OTP
                  </h1>

                  <p
                    className="
                      mx-auto
                      mt-4
                      max-w-sm
                      text-sm
                      leading-6
                      text-[#6B625C]
                    "
                  >
                    If an active account exists for this email, a code is on its way.
                  </p>

                  <p className="mt-2 text-xs font-medium text-[#e63e62]">
                    {email}
                  </p>
                </div>

                <form
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="otp"
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[1.5px]
                        text-[#292524]
                      "
                    >
                      Verification Code
                    </label>

                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      placeholder="Enter 6-digit OTP"
                      required
                      className="
                        w-full
                        border
                        border-[#E7DEDC]
                        bg-white
                        px-4
                        py-4
                        text-center
                        text-lg
                        font-semibold
                        tracking-[8px]
                        text-[#292524]
                        outline-none
                        transition
                        placeholder:text-[#A69C94]
                        placeholder:tracking-normal
                        focus:border-[#e63e62]
                      "
                    />
                  </div>

                  {error && <ErrorMessage message={error} />}
                  {message && <p role="status" className="text-xs text-[#547454]">{message}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      group
                      flex
                      h-12
                      w-full
                      items-center
                      justify-center
                      gap-3
                      bg-[#292524]
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[2px]
                      text-white
                      transition
                      duration-300
                      hover:bg-[#e63e62]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loading ? "Verifying..." : "Verify OTP"}

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

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setError("");
                      setMessage("");
                    }}
                    disabled={loading}
                    className="
                      text-xs
                      font-medium
                      text-[#e63e62]
                      hover:text-[#A96870]
                    "
                  >
                    Change email
                  </button>

                  <span className="mx-3 text-[#E7DEDC]">
                    |
                  </span>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="
                      text-xs
                      font-medium
                      text-[#e63e62]
                      hover:text-[#A96870]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    Resend OTP
                  </button>
                </div>
              </>
            )}

            {/* =========================
                STEP 3 - NEW PASSWORD
            ========================= */}
            {step === 3 && (
              <>
                <div className="mb-8 text-center">

                  <div
                    className="
                      mx-auto
                      mb-5
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-[#FAF6F5]
                      text-[#e63e62]
                    "
                  >
                    <KeyRound
                      size={23}
                      strokeWidth={1.5}
                    />
                  </div>

                  <p
                    className="
                      mb-3
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[3px]
                      text-[#e63e62]
                    "
                  >
                    New Password
                  </p>

                  <h1
                    className="
                      font-serif
                      text-3xl
                      text-[#292524]
                      sm:text-4xl
                    "
                  >
                    Create new password
                  </h1>

                  <p
                    className="
                      mx-auto
                      mt-4
                      max-w-sm
                      text-sm
                      leading-6
                      text-[#6B625C]
                    "
                  >
                    Create a strong new password for your
                    Velora account.
                  </p>
                </div>

                <form
                  onSubmit={handleResetPassword}
                  className="space-y-5"
                >

                  {/* PASSWORD */}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[1.5px]
                        text-[#292524]
                      "
                    >
                      New Password
                    </label>

                    <div className="relative">
                      <input
                        id="newPassword"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="Enter new password"
                        required
                        className="
                          w-full
                          border
                          border-[#E7DEDC]
                          bg-white
                          px-4
                          py-3.5
                          pr-12
                          text-sm
                          text-[#292524]
                          outline-none
                          transition
                          placeholder:text-[#A69C94]
                          focus:border-[#e63e62]
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          text-[#8B817A]
                          hover:text-[#e63e62]
                        "
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[1.5px]
                        text-[#292524]
                      "
                    >
                      Confirm Password
                    </label>

                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        placeholder="Confirm new password"
                        required
                        className="
                          w-full
                          border
                          border-[#E7DEDC]
                          bg-white
                          px-4
                          py-3.5
                          pr-12
                          text-sm
                          text-[#292524]
                          outline-none
                          transition
                          placeholder:text-[#A69C94]
                          focus:border-[#e63e62]
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          text-[#8B817A]
                          hover:text-[#e63e62]
                        "
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* PASSWORD RULE */}
                  <div
                    className="
                      border
                      border-[#E7DEDC]
                      bg-[#FFFFFF]
                      px-4
                      py-3
                    "
                  >
                    <p className="text-[11px] leading-5 text-[#6B625C]">
                      Password must contain at least 8
                      characters.
                    </p>
                  </div>

                  {error && <ErrorMessage message={error} />}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      group
                      flex
                      h-12
                      w-full
                      items-center
                      justify-center
                      gap-3
                      bg-[#292524]
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[2px]
                      text-white
                      transition
                      duration-300
                      hover:bg-[#e63e62]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loading ? "Updating..." : "Reset Password"}

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
              </>
            )}

            {/* =========================
                STEP 4 - SUCCESS
            ========================= */}
            {step === 4 && (
              <div className="text-center">

                <div
                  className="
                    mx-auto
                    mb-6
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-[#e63e62]
                    text-white
                  "
                >
                  <Check size={28} />
                </div>

                <p
                  className="
                    mb-3
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[3px]
                    text-[#e63e62]
                  "
                >
                  All Done
                </p>

                <h1
                  className="
                    font-serif
                    text-3xl
                    text-[#292524]
                    sm:text-4xl
                  "
                >
                  Password updated
                </h1>

                <p
                  className="
                    mx-auto
                    mt-4
                    max-w-sm
                    text-sm
                    leading-6
                    text-[#6B625C]
                  "
                >
                  Your password has been successfully changed.
                  You can now sign in to your Velora account.
                </p>

                <Link
                  href="/user/login"
                  className="
                    group
                    mt-8
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-3
                    bg-[#292524]
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[2px]
                    text-white
                    transition
                    duration-300
                    hover:bg-[#e63e62]
                  "
                >
                  Back to Login

                  <ArrowRight
                    size={16}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </Link>
              </div>
            )}

          </div>

          {/* BACK TO HOME */}
          {step !== 4 && (
            <div className="mt-7 text-center">
              <Link
                href="/user/login"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[1.5px]
                  text-[#6B625C]
                  transition
                  hover:text-[#e63e62]
                "
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

/* =========================
   STEP COMPONENT
========================= */

function Step({ number, active, completed }) {
  return (
    <div
      className={`
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-full
        text-[11px]
        font-semibold
        transition
        ${
          active
            ? "bg-[#e63e62] text-white"
            : "bg-[#FAF6F5] text-[#8B817A]"
        }
      `}
    >
      {completed ? <Check size={14} /> : number}
    </div>
  );
}

/* =========================
   ERROR MESSAGE
========================= */

function ErrorMessage({ message }) {
  return (
    <div
      className="
        border
        border-red-200
        bg-red-50
        px-4
        py-3
        text-xs
        text-red-600
      "
    >
      {message}
    </div>
  );
}
