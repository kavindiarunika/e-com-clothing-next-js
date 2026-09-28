
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState("register");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    setError("");
  };

  // ==========================================
  // EMAIL VALIDATION
  // ==========================================

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check email
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Check password
    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    // Check confirm password
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      /*
      ==========================================
      BACKEND API WILL BE CONNECTED HERE
      ==========================================

      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }
      */

      // Temporary frontend testing
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      setSuccess(
        `Verification code sent to ${formData.email}`
      );

      setStep("otp");
    } catch (err) {
      setError(
        err.message || "Unable to send verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      /*
      ==========================================
      BACKEND API WILL BE CONNECTED HERE
      ==========================================

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }
      */

      // Temporary frontend testing
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      setStep("verified");
    } catch (err) {
      setError(
        err.message || "Invalid verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      /*
      POST /api/auth/send-otp
      */

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      setSuccess(
        `A new code has been sent to ${formData.email}.`
      );
    } catch (err) {
      setError("Unable to resend verification code.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREATE ACCOUNT
  // ==========================================

  const handleCreateAccount = async () => {
    setError("");
    setLoading(true);

    try {
      /*
      ==========================================
      BACKEND API WILL BE CONNECTED HERE
      ==========================================

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }
      */

      // Temporary frontend testing
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      setStep("created");
    } catch (err) {
      setError(
        err.message || "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const handleGoogleLogin = () => {
    /*
      Later connect this button to Auth.js:

      signIn("google", {
        callbackUrl: "/",
      });
    */

    console.log("Continue with Google");
  };

  // ==========================================
  // REGISTER PAGE
  // ==========================================

  if (step === "register") {
    return (
      <main className="min-h-screen bg-[#EFE9E1]">

        <div className="grid min-h-screen lg:grid-cols-2">

          {/* ================================= */}
          {/* LEFT - REGISTER FORM */}
          {/* ================================= */}

          <div className="flex items-center justify-center px-6 py-8 sm:px-10">

            <div className="w-full max-w-sm">

              {/* BRAND */}
              <div className="mb-7 text-center">

                <Link
                  href="/"
                  className="font-serif text-2xl tracking-[3px] text-[#322D29]"
                >
                  VELORA
                </Link>

                <div className="mx-auto mt-4 h-px w-8 bg-[#72383D]" />

              </div>

              {/* TITLE */}
              <div className="mb-5">

                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
                  Join Velora
                </p>

                <h1 className="font-serif text-3xl text-[#322D29]">
                  Create your account
                </h1>

                <p className="mt-2 text-sm leading-6 text-[#6B625C]">
                  Create an account and enjoy a more
                  personalized shopping experience.
                </p>

              </div>

              {/* GOOGLE BUTTON */}
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
                  text-sm
                  font-medium
                  text-[#322D29]
                  transition
                  duration-300
                  hover:border-[#72383D]
                  hover:bg-[#FAF8F5]
                "
              >

                {/* GOOGLE ICON */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                >

                  <path
                    fill="#4285F4"
                    d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.45h3.14c1.84-1.69 2.93-4.18 2.93-7.41z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 21.73c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.73z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M6.54 13.82A5.86 5.86 0 0 1 6.23 12c0-.63.11-1.24.31-1.82V7.65H3.3A9.73 9.73 0 0 0 2.27 12c0 1.57.38 3.05 1.03 4.35l3.24-2.53z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 6.15c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.17 14.63 2.27 12 2.27a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 7.87 9.46 6.15 12 6.15z"
                  />

                </svg>

                Continue with Google

              </button>

              {/* DIVIDER */}
              <div className="my-5 flex items-center gap-4">

                <div className="h-px flex-1 bg-[#D8D0C8]" />

                <span className="text-[10px] uppercase tracking-[2px] text-[#9A9088]">
                  Or continue with email
                </span>

                <div className="h-px flex-1 bg-[#D8D0C8]" />

              </div>

              {/* ERROR */}
              {error && (
                <div className="mb-5 border border-[#C98B8B] bg-[#F8EAEA] px-4 py-3 text-sm text-[#8B3A3A]">
                  {error}
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="mb-5 border border-[#A9C3A9] bg-[#EDF5ED] px-4 py-3 text-sm text-[#4E704E]">
                  {success}
                </div>
              )}

              {/* FORM */}
              <form
                onSubmit={handleRegister}
                className="space-y-4"
              >

                {/* FIRST + LAST NAME */}
                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <label
                      htmlFor="firstName"
                      className="mb-2 block text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]"
                    >
                      First Name
                    </label>

                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      required
                      className="
                        h-11
                        w-full
                        border
                        border-[#D8D0C8]
                        bg-white
                        px-4
                        text-sm
                        text-[#322D29]
                        outline-none
                        placeholder:text-[#A69C94]
                        focus:border-[#72383D]
                      "
                    />

                  </div>

                  <div>

                    <label
                      htmlFor="lastName"
                      className="mb-2 block text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]"
                    >
                      Last Name
                    </label>

                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      required
                      className="
                        h-11
                        w-full
                        border
                        border-[#D8D0C8]
                        bg-white
                        px-4
                        text-sm
                        text-[#322D29]
                        outline-none
                        placeholder:text-[#A69C94]
                        focus:border-[#72383D]
                      "
                    />

                  </div>

                </div>

                {/* EMAIL */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="
                      h-11
                      w-full
                      border
                      border-[#D8D0C8]
                      bg-white
                      px-4
                      text-sm
                      text-[#322D29]
                      outline-none
                      placeholder:text-[#A69C94]
                      focus:border-[#72383D]
                    "
                  />

                  <p className="mt-2 text-xs text-[#8B817A]">
                    A verification code will be sent to
                    this email.
                  </p>

                </div>

                {/* PHONE */}
                <div>

                  <label
                    htmlFor="phone"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]"
                  >
                    Phone
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                    className="
                      h-11
                      w-full
                      border
                      border-[#D8D0C8]
                      bg-white
                      px-4
                      text-sm
                      text-[#322D29]
                      outline-none
                      placeholder:text-[#A69C94]
                      focus:border-[#72383D]
                    "
                  />

                </div>

                {/* PASSWORD */}
                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      required
                      className="
                        h-11
                        w-full
                        border
                        border-[#D8D0C8]
                        bg-white
                        px-4
                        pr-12
                        text-sm
                        text-[#322D29]
                        outline-none
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
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]"
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
                      value={
                        formData.confirmPassword
                      }
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      className="
                        h-11
                        w-full
                        border
                        border-[#D8D0C8]
                        bg-white
                        px-4
                        pr-12
                        text-sm
                        text-[#322D29]
                        outline-none
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

                {/* CREATE ACCOUNT */}
                <button
                  type="submit"
                  disabled={loading}
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
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {loading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Sending Code
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </>
                  )}

                </button>

              </form>

              {/* LOGIN */}
              <div className="mt-6 border-t border-[#D8D0C8] pt-5 text-center">

                <p className="text-sm text-[#6B625C]">
                  Already have an account?
                </p>

                <Link
                  href="/user/login"
                  className="mt-2 inline-block text-sm font-semibold text-[#72383D] hover:text-[#432415]"
                >
                  Sign In
                </Link>

              </div>

            </div>

          </div>

          {/* ================================= */}
          {/* RIGHT - IMAGE */}
          {/* REGISTER PAGE ONLY */}
          {/* ================================= */}

          <div className="relative hidden overflow-hidden lg:block">

            <img
              src="/images/auth/register.jpg"
              alt="Velora fashion collection"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-[#322D29]/35" />

            <div className="absolute bottom-12 left-12 max-w-md text-white">

              <p className="mb-4 text-xs uppercase tracking-[4px] text-[#E3DCD1]">
                VELORA COLLECTION
              </p>

              <h2 className="font-serif text-5xl leading-tight">
                Discover your
                <span className="block italic text-[#CCB2A5]">
                  signature style.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-6 text-white/70">
                Premium fashion, thoughtfully selected
                for the modern wardrobe.
              </p>

            </div>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================
  // OTP PAGE
  // NO IMAGE
  // ==========================================

  if (step === "otp") {
    return (
      <main className="min-h-screen bg-[#EFE9E1]">

        {/* HEADER */}
        <header className="border-b border-[#D8D0C8]">
          <div className="flex h-16 items-center justify-center">

            <Link
              href="/"
              className="font-serif text-2xl tracking-[4px] text-[#322D29]"
            >
              VELORA
            </Link>

          </div>
        </header>

        {/* OTP CONTENT */}
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-8">

          <div className="w-full max-w-sm">

            <div className="mb-6 text-center">

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E8E5]">
                <Mail
                  size={27}
                  className="text-[#72383D]"
                />
              </div>

              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
                Email Verification
              </p>

              <h1 className="font-serif text-3xl text-[#322D29]">
                Verify your email
              </h1>

              <p className="mt-4 text-sm leading-6 text-[#6B625C]">
                We've sent a 6-digit verification code
                to
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-[#322D29]">
                {formData.email}
              </p>

            </div>

            {/* CARD */}
            <div className="border border-[#D8D0C8] bg-[#F8F5F1] p-5 sm:p-6">

              {error && (
                <div className="mb-5 border border-[#C98B8B] bg-[#F8EAEA] px-4 py-3 text-sm text-[#8B3A3A]">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 border border-[#A9C3A9] bg-[#EDF5ED] px-4 py-3 text-sm text-[#4E704E]">
                  {success}
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>

                <label
                  htmlFor="otp"
                  className="mb-3 block text-center text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]"
                >
                  Verification Code
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="000000"
                  className="
                    h-14
                    w-full
                    border
                    border-[#D8D0C8]
                    bg-white
                    px-4
                    text-center
                    text-xl
                    font-semibold
                    tracking-[10px]
                    text-[#322D29]
                    outline-none
                    placeholder:text-[#C8BFB8]
                    focus:border-[#72383D]
                  "
                />

                <p className="mt-3 text-center text-xs text-[#8B817A]">
                  Enter the verification code sent to
                  your email.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    mt-5
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
                    hover:bg-[#72383D]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {loading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Verifying
                    </>
                  ) : (
                    <>
                      Verify OTP
                      <CheckCircle2 size={17} />
                    </>
                  )}

                </button>

              </form>

              {/* RESEND */}
                  <div className="mt-6 text-center">

                <p className="text-sm text-[#6B625C]">
                  Didn't receive the code?
                </p>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="mt-2 text-sm font-semibold text-[#72383D] hover:text-[#432415]"
                >
                  Resend Code
                </button>

              </div>

              {/* BACK */}
              <button
                type="button"
                onClick={() => {
                  setStep("register");
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                className="
                  mx-auto
                  mt-6
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[1px]
                  text-[#6B625C]
                  hover:text-[#72383D]
                "
              >
                <ArrowLeft size={14} />
                Back to registration
              </button>

            </div>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================
  // EMAIL VERIFIED PAGE
  // NO IMAGE
  // ==========================================

  if (step === "verified") {
    return (
      <main className="min-h-screen bg-[#EFE9E1]">

        {/* HEADER */}
        <header className="border-b border-[#D8D0C8]">
          <div className="flex h-16 items-center justify-center">

            <Link
              href="/"
              className="font-serif text-2xl tracking-[4px] text-[#322D29]"
            >
              VELORA
            </Link>

          </div>
        </header>

        {/* CONTENT */}
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-8">

          <div className="w-full max-w-sm">

            <div className="border border-[#D8D0C8] bg-[#F8F5F1] px-5 py-8 text-center sm:px-8">

              {/* ICON */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF2EA]">

                <CheckCircle2
                  size={34}
                  className="text-[#547454]"
                />

              </div>

              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
                Email Verified
              </p>

              <h1 className="font-serif text-3xl text-[#322D29]">
                Your email is verified
              </h1>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#6B625C]">
                Your email address has been successfully
                verified. You're one step away from joining
                Velora.
              </p>

              {error && (
                <div className="mt-5 border border-[#C98B8B] bg-[#F8EAEA] px-4 py-3 text-sm text-[#8B3A3A]">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleCreateAccount}
                disabled={loading}
                className="
                  group
                  mt-6
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
                  hover:bg-[#72383D]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Creating Account
                  </>
                ) : (
                  <>
                    Create My Account
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================
  // ACCOUNT CREATED PAGE
  // NO IMAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-[#EFE9E1]">

      {/* HEADER */}
      <header className="border-b border-[#D8D0C8]">
        <div className="flex h-16 items-center justify-center">

          <Link
            href="/"
            className="font-serif text-2xl tracking-[4px] text-[#322D29]"
          >
            VELORA
          </Link>

        </div>
      </header>

      {/* CONTENT */}
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-8">

        <div className="w-full max-w-sm">

          <div className="border border-[#D8D0C8] bg-[#F8F5F1] px-5 py-8 text-center sm:px-8">

            {/* SUCCESS ICON */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF2EA]">

              <CheckCircle2
                size={34}
                className="text-[#547454]"
              />

            </div>

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
              Welcome to Velora
            </p>

            <h1 className="font-serif text-3xl text-[#322D29]">
              Account created
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#6B625C]">
              Welcome, {formData.firstName}. Your Velora
              account has been successfully created.
            </p>

            {/* LOGIN */}
            <Link
              href="/user/login"
              className="
                group
                mt-6
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
                hover:bg-[#72383D]
              "
            >
              Continue to Sign In

              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            {/* HOME */}
            <Link
              href="/user"
              className="mt-5 inline-block text-sm text-[#6B625C] hover:text-[#72383D]"
            >
              Return to Home
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}

