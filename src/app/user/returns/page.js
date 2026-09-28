
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  PackageCheck,
  CheckCircle2,
} from "lucide-react";

export default function ReturnsPage() {
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
            className="flex items-center gap-2 text-sm text-[#EFE9E1] transition hover:text-[#AC9C8D]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 py-16">

        <div className="text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#72383D]">
            Customer Care
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Returns & Exchanges
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#322D29]/60">
            If something isn't right with your order, you can submit a
            return or exchange request from your VELORA account.
          </p>

        </div>

        {/* Steps */}
        <div className="mt-12 space-y-5">

          <ReturnStep
            number="01"
            icon={<PackageCheck size={23} />}
            title="Check Your Order"
          >
            Make sure your order has been delivered and check the item you
            would like to return or exchange.
          </ReturnStep>

          <ReturnStep
            number="02"
            icon={<RotateCcw size={23} />}
            title="Request a Return"
          >
            Open your order details and select the Return option for the
            item you want to return.
          </ReturnStep>

          <ReturnStep
            number="03"
            icon={<RefreshCw size={23} />}
            title="Request an Exchange"
          >
            If you need an eligible replacement or different size, select
            the Exchange option from your delivered order.
          </ReturnStep>

          <ReturnStep
            number="04"
            icon={<CheckCircle2 size={23} />}
            title="Request Review"
          >
            Your request will initially have a Pending status. Our team
            will review the request and update its status.
          </ReturnStep>

        </div>

        {/* Status */}
        <div className="mt-10 rounded-3xl bg-white p-7 shadow-sm sm:p-9">

          <h2 className="text-2xl font-semibold">
            Request Status
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#322D29]/60">
            You can check your return or exchange requests from your
            VELORA account.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">

            <Status
              label="Pending"
              className="bg-amber-100 text-amber-700"
            />

            <Status
              label="Approved"
              className="bg-green-100 text-green-700"
            />

            <Status
              label="Rejected"
              className="bg-red-100 text-red-700"
            />

            <Status
              label="Completed"
              className="bg-blue-100 text-blue-700"
            />

          </div>

          <Link
            href="/user/account/returns"
            className="mt-7 inline-flex items-center gap-2 bg-[#72383D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#432415]"
          >
            View My Requests
          </Link>

        </div>

        {/* Important Information */}
        <div className="mt-8 rounded-2xl border border-[#72383D]/15 bg-[#72383D]/5 p-6">

          <h3 className="font-semibold">
            Important Information
          </h3>

          <ul className="mt-3 space-y-2 text-sm leading-7 text-[#322D29]/65">
            <li>• Return and exchange requests are available for eligible delivered orders.</li>
            <li>• Each request is reviewed before approval.</li>
            <li>• Please provide a clear reason when submitting a request.</li>
            <li>• You can monitor your request status from your account.</li>
          </ul>

        </div>

      </section>
    </main>
  );
}

function ReturnStep({ number, icon, title, children }) {
  return (
    <div className="flex gap-5 rounded-3xl bg-white p-7 shadow-sm">

      <div className="pt-2 text-sm font-semibold tracking-wider text-[#AC9C8D]">
        {number}
      </div>

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EFE9E1] text-[#72383D]">
        {icon}
      </div>

      <div>
        <h2 className="text-lg font-semibold">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-7 text-[#322D29]/60">
          {children}
        </p>
      </div>

    </div>
  );
}

function Status({ label, className }) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-center text-sm font-medium ${className}`}
    >
      {label}
    </div>
  );
}

