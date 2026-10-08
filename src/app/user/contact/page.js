
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionError, setSubmissionError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCustomerProfile() {
      try {
        const response = await fetch("/api/auth/profile", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) return;

        const result = await response.json();
        if (!result.success || !result.data) return;

        const profile = result.data;
        const name = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ");

        setFormData((current) => ({
          ...current,
          name: current.name || name,
          email: current.email || profile.email || "",
        }));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Unable to load contact form profile:", error);
        }
      }
    }

    void loadCustomerProfile();
    return () => controller.abort();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSending(true);
    setSubmissionMessage("");
    setSubmissionError(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to send your message.");
      }

      setSubmissionMessage(result.message);
      setFormData((current) => ({ ...current, subject: "", message: "" }));
    } catch (error) {
      setSubmissionError(true);
      setSubmissionMessage(error.message || "Unable to send your message. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

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

          <form className="mt-7 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>

            <input
              name="name"
              type="text"
              maxLength={100}
              required
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              aria-label="Your name"
              placeholder="Your Name"
              className="h-12 border border-[#322D29]/15 bg-[#EFE9E1]/40 px-4 text-sm outline-none focus:border-[#72383D]"
            />

            <input
              name="email"
              type="email"
              maxLength={150}
              required
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              aria-label="Email address"
              placeholder="Email Address"
              className="h-12 border border-[#322D29]/15 bg-[#EFE9E1]/40 px-4 text-sm outline-none focus:border-[#72383D]"
            />

            <input
              name="subject"
              type="text"
              maxLength={150}
              required
              value={formData.subject}
              onChange={handleChange}
              aria-label="Subject"
              placeholder="Subject"
              className="h-12 border border-[#322D29]/15 bg-[#EFE9E1]/40 px-4 text-sm outline-none focus:border-[#72383D] sm:col-span-2"
            />

            <textarea
              name="message"
              maxLength={5000}
              required
              value={formData.message}
              onChange={handleChange}
              aria-label="Your message"
              placeholder="Your Message"
              rows={10}
              className="resize-none border border-[#322D29]/15 bg-[#EFE9E1]/40 px-4 py-3 text-sm outline-none focus:border-[#72383D] sm:col-span-2"
            />

            {submissionMessage && (
              <p
                className={`text-sm sm:col-span-2 ${submissionError ? "text-red-700" : "text-green-700"}`}
                role={submissionError ? "alert" : "status"}
              >
                {submissionMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="h-12 bg-[#72383D] px-6 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-[#432415] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
            >
              {isSending ? "Sending..." : "Send Message"}
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
