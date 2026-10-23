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
    <section className="mb-6 w-full bg-black py-10 sm:mb-8 sm:py-14">
      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl bg-black md:grid-cols-2">

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
          <div className="flex items-center px-7 py-10 text-white sm:px-10 sm:py-12 lg:px-14">

            <div className="w-full max-w-xl">

              {/* Small label */}
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-white/65">
                Get 10% Off Your First Order
              </p>

              {/* Heading */}
              <h2 className="font-serif text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
                Join Our
                <br />
                <span className="italic">Style List</span>
              </h2>

              {/* Description */}
              <p className="mt-4 max-w-md text-sm leading-6 text-white/70 sm:text-base">
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
                    className="h-12 min-w-0 flex-1 rounded-md border border-white/20 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-[var(--color-primary)]"
                  />

                  <button
                    type="submit"
                    className="group flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-6 text-xs font-medium uppercase tracking-wider text-white transition-all duration-300 hover:bg-[var(--color-primary-hover)]"
                  >
                    Subscribe

                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </form>
              ) : (
                <div className="mt-7 flex items-center gap-3 rounded-md border border-white/15 bg-white/5 px-4 py-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Check size={15} />
                  </div>

                  <p className="text-sm text-white">
                    Thank you for joining the Velora community!
                  </p>
                </div>
              )}

              {/* Small text */}
              <p className="mt-3 text-[10px] text-white/50">
                By subscribing, you agree to receive updates from Velora.
              </p>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}