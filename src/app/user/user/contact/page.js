
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">

      {/* Header */}
      <header className="bg-[#322D29]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-[0.25em] text-[#EFE9E1]"
          >
            VELORA
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#EFE9E1] hover:text-[#AC9C8D]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#72383D]">
            Customer Care
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Contact Us
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#322D29]/60">
            Have a question about your order, products, delivery, or returns?
            Our customer care team is here to help.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          <ContactCard
            icon={<Mail size={22} />}
            title="Email"
            value="hello@velora.com"
          />

          <ContactCard
            icon={<Phone size={22} />}
            title="Phone"
            value="+94 77 123 4567"
          />

          <ContactCard
            icon={<MapPin size={22} />}
            title="Location"
            value="Colombo, Sri Lanka"
          />

          <ContactCard
            icon={<Clock size={22} />}
            title="Opening Hours"
            value="Mon - Sat, 9 AM - 6 PM"
          />

        </div>

        <div className="mt-10 rounded-3xl bg-white p-7 shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold">
            Send us a message
          </h2>

          <form className="mt-7 grid gap-5 sm:grid-cols-2">

            <input
              type="text"
              placeholder="Your Name"
              className="h-12 border border-[#322D29]/15 bg-[#EFE9E1]/40 px-4 text-sm outline-none focus:border-[#72383D]"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="h-12 border border-[#322D29]/15 bg-[#EFE9E1]/40 px-4 text-sm outline-none focus:border-[#72383D]"
            />

            <input
              type="text"
              placeholder="Order Number"
              className="h-12 border border-[#322D29]/15 bg-[#EFE9E1]/40 px-4 text-sm outline-none focus:border-[#72383D]"
            />

            <input
              type="text"
              placeholder="Subject"
              className="h-12 border border-[#322D29]/15 bg-[#EFE9E1]/40 px-4 text-sm outline-none focus:border-[#72383D]"
            />

            <textarea
              placeholder="Your Message"
              rows={6}
              className="resize-none border border-[#322D29]/15 bg-[#EFE9E1]/40 px-4 py-3 text-sm outline-none focus:border-[#72383D] sm:col-span-2"
            />

            <button
              type="button"
              className="h-12 bg-[#72383D] px-6 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-[#432415] sm:w-fit"
            >
              Send Message
            </button>

          </form>
        </div>
      </section>
    </main>
  );
}

function ContactCard({ icon, title, value }) {
  return (
    <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE9E1] text-[#72383D]">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-[#322D29]/60">
        {value}
      </p>
    </div>
  );
}

