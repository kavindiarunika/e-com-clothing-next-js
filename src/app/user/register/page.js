"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import AuthModeSwitch from "@/components/user/common/AuthModeSwitch";

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

async function postJson(url, body, fallbackMessage) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || fallbackMessage);
  }

  return result;
}

export default function RegisterPage() {
  const [step, setStep] = useState("register");
  const [formData, setFormData] = useState(initialFormData);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    setError("");
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await postJson(
        "/api/auth/email-otp/request",
        { email: formData.email },
        "Unable to send a verification code."
      );
      setOtp("");
      setSuccess(result.message || "A verification code has been sent.");
      setStep("otp");
    } catch (requestError) {
      setError(requestError.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      await postJson(
        "/api/auth/email-otp/verify",
        { email: formData.email, code: otp },
        "Unable to verify the code."
      );
      setStep("verified");
      setSuccess("Email verified. You can now create your account.");
    } catch (verificationError) {
      setError(verificationError.message || "Unable to verify the code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await postJson(
        "/api/auth/email-otp/request",
        { email: formData.email },
        "Unable to send a new verification code."
      );
      setSuccess(result.message || "A new verification code has been sent.");
    } catch (requestError) {
      setError(requestError.message || "Unable to send a new code.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setError("");
    setLoading(true);
    try {
      await postJson(
        "/api/auth/register",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        },
        "Unable to create your account."
      );
      setStep("created");
    } catch (createError) {
      setError(createError.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-white p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden bg-white shadow-[0_18px_55px_rgba(0,0,0,0.28)] lg:min-h-[620px] lg:grid-cols-[0.8fr_1.2fr]">
        <AuthModeSwitch activeMode="register" embedded />

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-sm">
            <div className="mb-6 text-center">
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

            {success && (
              <p
                role="status"
                className="mb-5 border border-[#A9C3A9] bg-[#EDF5ED] px-4 py-3 text-sm text-[#4E704E]"
              >
                {success}
              </p>
            )}

            {step === "register" && (
              <>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <div className="relative">
                        <label
                          htmlFor="firstName"
                          className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#292524]"
                        >
                          First name
                        </label>
                        <UserRound
                          size={16}
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B817A]"
                        />
                        <input
                          id="firstName"
                          name="firstName"
                          autoComplete="given-name"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="First name"
                          required
                          maxLength={100}
                          className="h-12 w-full rounded-md border border-[#D8D8D8] bg-white pl-10 pr-3 text-sm text-[#292524] outline-none transition placeholder:text-[#A69C94] focus:border-[#292524]"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <label
                          htmlFor="lastName"
                          className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#292524]"
                        >
                          Last name
                        </label>
                        <UserRound
                          size={16}
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B817A]"
                        />
                        <input
                          id="lastName"
                          name="lastName"
                          autoComplete="family-name"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Last name"
                          required
                          maxLength={100}
                          className="h-12 w-full rounded-md border border-[#D8D8D8] bg-white pl-10 pr-3 text-sm text-[#292524] outline-none transition placeholder:text-[#A69C94] focus:border-[#292524]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <label
                        htmlFor="email"
                        className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#292524]"
                      >
                        Email
                      </label>
                      <Mail
                        size={17}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B817A]"
                      />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                        maxLength={150}
                        className="h-12 w-full rounded-md border border-[#D8D8D8] bg-white pl-10 pr-3 text-sm text-[#292524] outline-none transition placeholder:text-[#A69C94] focus:border-[#292524]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <label
                        htmlFor="phone"
                        className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#292524]"
                      >
                        Phone
                      </label>
                      <Phone
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B817A]"
                      />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone number"
                        required
                        maxLength={20}
                        className="h-12 w-full rounded-md border border-[#D8D8D8] bg-white pl-10 pr-3 text-sm text-[#292524] outline-none transition placeholder:text-[#A69C94] focus:border-[#292524]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <div className="relative">
                        <label
                          htmlFor="password"
                          className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#292524]"
                        >
                          Password
                        </label>
                        <LockKeyhole
                          size={16}
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B817A]"
                        />
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="At least 8 characters"
                          required
                          minLength={8}
                          className="h-12 w-full rounded-md border border-[#D8D8D8] bg-white pl-10 pr-3 text-sm text-[#292524] outline-none transition placeholder:text-[#A69C94] focus:border-[#292524]"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <label
                          htmlFor="confirmPassword"
                          className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#292524]"
                        >
                          Confirm password
                        </label>
                        <LockKeyhole
                          size={16}
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B817A]"
                        />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repeat password"
                          required
                          minLength={8}
                          className="h-12 w-full rounded-md border border-[#D8D8D8] bg-white pl-10 pr-3 text-sm text-[#292524] outline-none transition placeholder:text-[#A69C94] focus:border-[#292524]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-11 w-full items-center justify-center gap-2 bg-[#292524] text-xs font-semibold uppercase tracking-[1.7px] text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending verification code..." : "Continue"}
                    {!loading && (
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    )}
                  </button>
                </form>
              </>
            )}

            {step === "otp" && (
              <div>
                <div className="mb-5 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F5]">
                    <Mail size={22} className="text-[var(--color-primary)]" />
                  </div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[3px] text-[var(--color-primary)]">
                    Email verification
                  </p>
                  <h1 className="font-serif text-2xl text-[#292524]">
                    Check your inbox
                  </h1>
                  <p className="mt-2 break-all text-sm text-[#6B625C]">
                    Enter the 6-digit code sent to {formData.email}.
                  </p>
                </div>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <label
                    htmlFor="otp"
                    className="sr-only"
                  >
                    Verification code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="000000"
                    required
                    className="h-12 w-full border-b border-[#D8D8D8] bg-transparent text-center text-xl font-semibold tracking-[0.5em] text-[#292524] outline-none placeholder:text-[#C8BFB8] focus:border-[#292524]"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 w-full items-center justify-center gap-2 bg-[#292524] text-xs font-semibold uppercase tracking-[1.7px] text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Verifying
                      </>
                    ) : (
                      "Verify email"
                    )}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="mt-4 w-full text-center text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] disabled:opacity-60"
                >
                  Resend verification code
                </button>
              </div>
            )}

            {step === "verified" && (
              <div className="py-6 text-center">
                <CheckCircle2
                  size={42}
                  className="mx-auto mb-4 text-[#547454]"
                />
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[3px] text-[var(--color-primary)]">
                  Email verified
                </p>
                <h1 className="font-serif text-2xl text-[#292524]">
                  Finish creating your account
                </h1>
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  disabled={loading}
                  className="mt-6 flex h-11 w-full items-center justify-center gap-2 bg-[#292524] text-xs font-semibold uppercase tracking-[1.7px] text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create account"}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </div>
            )}

            {step === "created" && (
              <div className="py-8 text-center">
                <CheckCircle2
                  size={44}
                  className="mx-auto mb-4 text-[#547454]"
                />
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[3px] text-[var(--color-primary)]">
                  Welcome to Velora
                </p>
                <h1 className="font-serif text-2xl text-[#292524]">
                  Account created
                </h1>
                <p className="mt-2 text-sm text-[#6B625C]">
                  Your account is ready. Sign in to continue.
                </p>
                <Link
                  href="/user/login"
                  className="mt-6 flex h-11 w-full items-center justify-center gap-2 bg-[#292524] text-xs font-semibold uppercase tracking-[1.7px] text-white transition hover:bg-[var(--color-primary-hover)]"
                >
                  Sign In
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
