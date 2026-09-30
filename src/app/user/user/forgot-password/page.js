
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");

  /* =========================
     SEND OTP
  ========================= */
  const handleSendOtp = (e) => {
    e.preventDefault();

    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    // OTP API will be connected later
    console.log("OTP sent to:", email);

    setStep(2);
  };

  /* =========================
     VERIFY OTP
  ========================= */
  const handleVerifyOtp = (e) => {
    e.preventDefault();

    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    // OTP verification API will be connected later
    console.log("OTP verified:", otp);

    setStep(3);
  };

  /* =========================
     RESET PASSWORD
  ========================= */
  const handleResetPassword = (e) => {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password reset API will be connected later
    console.log("Password reset successfully");

    setStep(4);
  };

  return (
    <main className="min-h-screen bg-[#EFE9E1]">
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
                text-[#322D29]
              "
            >
              VELORA
            </Link>

            <div className="mx-auto mt-5 h-px w-10 bg-[#72383D]" />
          </div>

          {/* =========================
              CARD
          ========================= */}
          <div
            className="
              border
              border-[#D8D0C8]
              bg-[#F8F5F1]
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
                    ? "bg-[#72383D]"
                    : "bg-[#D8D0C8]"
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
                    ? "bg-[#72383D]"
                    : "bg-[#D8D0C8]"
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
                      bg-[#E3DCD1]
                      text-[#72383D]
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
                      text-[#72383D]
                    "
                  >
                    Password Recovery
                  </p>

                  <h1
                    className="
                      font-serif
                      text-3xl
                      text-[#322D29]
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
                    Enter your email address and we'll send you
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
                        text-[#322D29]
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
                        border-[#D8D0C8]
                        bg-white
                        px-4
                        py-3.5
                        text-sm
                        text-[#322D29]
                        outline-none
                        transition
                        placeholder:text-[#A69C94]
                        focus:border-[#72383D]
                      "
                    />
                  </div>

                  {error && <ErrorMessage message={error} />}

                  <button
                    type="submit"
                    className="
                      group
                      flex
                      h-12
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
                    Send OTP

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
                      bg-[#E3DCD1]
                      text-[#72383D]
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
                      text-[#72383D]
                    "
                  >
                    Verification
                  </p>

                  <h1
                    className="
                      font-serif
                      text-3xl
                      text-[#322D29]
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
                    We've sent a 6-digit verification code to
                    your email.
                  </p>

                  <p className="mt-2 text-xs font-medium text-[#72383D]">
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
                        text-[#322D29]
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
                        border-[#D8D0C8]
                        bg-white
                        px-4
                        py-4
                        text-center
                        text-lg
                        font-semibold
                        tracking-[8px]
                        text-[#322D29]
                        outline-none
                        transition
                        placeholder:text-[#A69C94]
                        placeholder:tracking-normal
                        focus:border-[#72383D]
                      "
                    />
                  </div>

                  {error && <ErrorMessage message={error} />}

                  <button
                    type="submit"
                    className="
                      group
                      flex
                      h-12
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
                    Verify OTP

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
                    onClick={() => setStep(1)}
                    className="
                      text-xs
                      font-medium
                      text-[#72383D]
                      hover:text-[#432415]
                    "
                  >
                    Change email
                  </button>

                  <span className="mx-3 text-[#D8D0C8]">
                    |
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      console.log("OTP resent");
                    }}
                    className="
                      text-xs
                      font-medium
                      text-[#72383D]
                      hover:text-[#432415]
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
                      bg-[#E3DCD1]
                      text-[#72383D]
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
                      text-[#72383D]
                    "
                  >
                    New Password
                  </p>

                  <h1
                    className="
                      font-serif
                      text-3xl
                      text-[#322D29]
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
                        text-[#322D29]
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
                          border-[#D8D0C8]
                          bg-white
                          px-4
                          py-3.5
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
                          hover:text-[#72383D]
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
                        text-[#322D29]
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
                          border-[#D8D0C8]
                          bg-white
                          px-4
                          py-3.5
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
                          hover:text-[#72383D]
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
                      border-[#D8D0C8]
                      bg-[#EFE9E1]
                      px-4
                      py-3
                    "
                  >
                    <p className="text-[11px] leading-5 text-[#6B625C]">
                      Password must contain at least 6
                      characters.
                    </p>
                  </div>

                  {error && <ErrorMessage message={error} />}

                  <button
                    type="submit"
                    className="
                      group
                      flex
                      h-12
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
                    Reset Password

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
                    bg-[#72383D]
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
                    text-[#72383D]
                  "
                >
                  All Done
                </p>

                <h1
                  className="
                    font-serif
                    text-3xl
                    text-[#322D29]
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
                  hover:text-[#72383D]
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
            ? "bg-[#72383D] text-white"
            : "bg-[#E3DCD1] text-[#8B817A]"
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
