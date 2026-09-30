"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    // Frontend only for now
    setSubscribed(true);
    setEmail("");

    setTimeout(() => {
      setSubscribed(false);
    }, 4000);
  };

  return (
    <section className="w-full bg-[var(--color-white)] py-10 sm:py-14">
      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-xl bg-[var(--color-bg)] md:grid-cols-2">

          {/* ================= IMAGE ================= */}
          <div className="relative min-h-[240px] sm:min-h-[300px] md:min-h-[330px]">
            <Image
              src="/images/newsletter/promo2.jpg"
              alt="Velora Fashion"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Image overlay */}
            <div className="absolute inset-0 bg-black/5" />
          </div>

          {/* ================= CONTENT ================= */}
          <div className="flex items-center px-7 py-10 sm:px-10 sm:py-12 lg:px-14">

            <div className="w-full max-w-xl">

              {/* Small label */}
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--color-dark)]/60">
                Get 10% Off Your First Order
              </p>

              {/* Heading */}
              <h2 className="font-serif text-3xl leading-tight text-[var(--color-dark)] sm:text-4xl lg:text-5xl">
                Join Our
                <br />
                <span className="italic">Style List</span>
              </h2>

              {/* Description */}
              <p className="mt-4 max-w-md text-sm leading-6 text-[var(--color-dark)]/65 sm:text-base">
                Sign up for exclusive offers, new arrivals,
                and style inspiration delivered straight to
                your inbox.
              </p>

              {/* ================= FORM ================= */}
              {!subscribed ? (
                <form
                  onSubmit={handleSubmit}
                  className="mt-7 flex w-full flex-col gap-2 sm:flex-row"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="h-12 min-w-0 flex-1 rounded-md border border-[var(--color-dark)]/10 bg-white px-4 text-sm text-[var(--color-dark)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)]"
                  />

                  <button
                    type="submit"
                    className="group flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--color-dark)] px-6 text-xs font-medium uppercase tracking-wider text-white transition-all duration-300 hover:bg-[var(--color-primary)]"
                  >
                    Subscribe

                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </form>
              ) : (
                <div className="mt-7 flex items-center gap-3 rounded-md bg-white px-4 py-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Check size={15} />
                  </div>

                  <p className="text-sm text-[var(--color-dark)]">
                    Thank you for joining the Velora community!
                  </p>
                </div>
              )}

              {/* Small text */}
              <p className="mt-3 text-[10px] text-[var(--color-dark)]/45">
                By subscribing, you agree to receive updates from Velora.
              </p>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}