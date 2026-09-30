
"use client";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How can I place an order?",
    answer:
      "Browse our products, select your preferred size and color, add the item to your cart, and continue to checkout.",
  },
  {
    question: "What payment method does VELORA accept?",
    answer:
      "VELORA currently supports Cash on Delivery for customer orders.",
  },
  {
    question: "How can I track my order?",
    answer:
      "You can track your order status from your VELORA account under My Orders.",
  },
  {
    question: "Can I return an item?",
    answer:
      "Eligible delivered items can be submitted for a return request from the order details page.",
  },
  {
    question: "Can I exchange an item?",
    answer:
      "Eligible delivered items can be submitted for an exchange request from the order details page.",
  },
  {
    question: "Where can I find the size information?",
    answer:
      "You can use the Size Guide from the Customer Care section in the footer.",
  },
  {
    question: "How can I contact VELORA?",
    answer:
      "You can contact our customer care team through the Contact Us page.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">

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

      <section className="mx-auto max-w-3xl px-5 py-16">

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#72383D]">
            Customer Care
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            Frequently Asked Questions
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#322D29]/60">
            Find answers to some of the most common questions about VELORA.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left"
                >
                  <span className="font-medium">
                    {faq.question}
                  </span>

                  <Plus
                    size={19}
                    className={`shrink-0 text-[#72383D] transition ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-[#322D29]/10 px-6 pb-6 pt-4">
                    <p className="text-sm leading-7 text-[#322D29]/60">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>
    </main>
  );
}

