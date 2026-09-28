
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  Package,
} from "lucide-react";

export default function ReturnExchangeRequestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId") || "1001";
  const orderItemId = searchParams.get("orderItemId") || "1";

  const initialType =
    searchParams.get("type") === "exchange"
      ? "exchange"
      : "return";

  const [requestType, setRequestType] = useState(initialType);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    "Wrong size",
    "Wrong color",
    "Damaged item",
    "Defective product",
    "Wrong item received",
    "Item does not match description",
    "Changed my mind",
    "Other",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reason) {
      alert("Please select a reason.");
      return;
    }

    /*
      FRONTEND DEMO

      Later send this data to your backend:

      {
        order_id: orderId,
        order_item_id: orderItemId,
        user_id: loggedInUserId,
        request_type: requestType,
        reason: reason,
        description: description
      }

      The database should create:

      status = "pending"

      requested_at = current timestamp
    */

    const requestData = {
      order_id: Number(orderId),
      order_item_id: Number(orderItemId),
      request_type: requestType,
      reason,
      description,
      status: "pending",
    };

    console.log("Return / Exchange Request:", requestData);

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">

        {/* HEADER */}
        <header className="border-b border-[#D8D0C8]">

          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

            <Link
              href="/"
              className="font-serif text-3xl tracking-[4px]"
            >
              VELORA
            </Link>

            <Link
              href="/user/account/returns"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#6B625C] hover:text-[#72383D]"
            >
              <ArrowLeft size={15} />
              My Requests
            </Link>

          </div>

        </header>

        {/* SUCCESS */}
        <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-3xl items-center justify-center px-6 py-16">

          <div className="w-full border border-[#D8D0C8] bg-[#F8F5F1] p-8 text-center sm:p-12">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#547454] text-white">

              <CheckCircle2 size={30} />

            </div>

            <p className="mt-7 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
              Request Submitted
            </p>

            <h1 className="mt-3 font-serif text-4xl">
              {requestType === "return"
                ? "Return Request Sent"
                : "Exchange Request Sent"}
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#6B625C]">

              Your request has been submitted successfully.
              Our team will review your request and update
              the status once it has been processed.

            </p>

            <div className="mx-auto mt-8 max-w-md border border-[#D8D0C8] bg-[#EFE9E1] p-5 text-left">

              <div className="flex justify-between text-sm">

                <span className="text-[#8B817A]">
                  Order
                </span>

                <span className="font-semibold">
                  #{orderId}
                </span>

              </div>

              <div className="mt-3 flex justify-between text-sm">

                <span className="text-[#8B817A]">
                  Item
                </span>

                <span className="font-semibold">
                  #{orderItemId}
                </span>

              </div>

              <div className="mt-3 flex justify-between text-sm">

                <span className="text-[#8B817A]">
                  Request
                </span>

                <span className="font-semibold capitalize">
                  {requestType}
                </span>

              </div>

              <div className="mt-3 flex justify-between text-sm">

                <span className="text-[#8B817A]">
                  Status
                </span>

                <span className="font-semibold text-[#B27A00]">
                  Pending
                </span>

              </div>

            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                href="/user/account/returns"
                className="inline-flex items-center justify-center border border-[#72383D] bg-[#72383D] px-7 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#432415]"
              >
                View My Requests
              </Link>

              <Link
                href="/user/account/orders"
                className="inline-flex items-center justify-center border border-[#322D29] px-7 py-3 text-xs font-semibold uppercase tracking-[1.5px] transition hover:bg-[#322D29] hover:text-white"
              >
                My Orders
              </Link>

            </div>

          </div>

        </section>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">

      {/* HEADER */}
      <header className="border-b border-[#D8D0C8]">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

          <Link
            href="/"
            className="font-serif text-3xl tracking-[4px]"
          >
            VELORA
          </Link>

          <Link
            href={`/user/account/orders/${orderId}`}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#6B625C] hover:text-[#72383D]"
          >
            <ArrowLeft size={15} />
            Back to Order
          </Link>

        </div>

      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-4xl px-6 py-12 lg:px-10 lg:py-16">

        {/* TITLE */}
        <div className="mb-10">

          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
            Order #{orderId}
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl">
            RETURN / EXCHANGE
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6B625C]">
            Tell us why you would like to return or exchange
            this item. Your request will be reviewed by our
            customer service team.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* REQUEST TYPE */}
          <div className="border border-[#D8D0C8] bg-[#F8F5F1] p-6 sm:p-8">

            <div className="mb-6">

              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#72383D]">
                Step 01
              </p>

              <h2 className="mt-2 font-serif text-2xl">
                Choose Request Type
              </h2>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* RETURN */}
              <button
                type="button"
                onClick={() => setRequestType("return")}
                className={`flex items-center gap-4 border p-5 text-left transition ${
                  requestType === "return"
                    ? "border-[#72383D] bg-[#E3DCD1]"
                    : "border-[#D8D0C8] bg-[#EFE9E1] hover:border-[#72383D]"
                }`}
              >

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${
                    requestType === "return"
                      ? "bg-[#72383D] text-white"
                      : "bg-[#E3DCD1]"
                  }`}
                >
                  <RotateCcw size={19} />
                </div>

                <div>

                  <p className="text-sm font-semibold">
                    Return
                  </p>

                  <p className="mt-1 text-xs text-[#8B817A]">
                    Send the item back
                  </p>

                </div>

              </button>

              {/* EXCHANGE */}
              <button
                type="button"
                onClick={() => setRequestType("exchange")}
                className={`flex items-center gap-4 border p-5 text-left transition ${
                  requestType === "exchange"
                    ? "border-[#72383D] bg-[#E3DCD1]"
                    : "border-[#D8D0C8] bg-[#EFE9E1] hover:border-[#72383D]"
                }`}
              >

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${
                    requestType === "exchange"
                      ? "bg-[#72383D] text-white"
                      : "bg-[#E3DCD1]"
                  }`}
                >
                  <RefreshCw size={19} />
                </div>

                <div>

                  <p className="text-sm font-semibold">
                    Exchange
                  </p>

                  <p className="mt-1 text-xs text-[#8B817A]">
                    Replace with another item
                  </p>

                </div>

              </button>

            </div>

          </div>

          {/* ITEM */}
          <div className="border border-[#D8D0C8] bg-[#F8F5F1] p-6 sm:p-8">

            <div className="mb-6">

              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#72383D]">
                Step 02
              </p>

              <h2 className="mt-2 font-serif text-2xl">
                Selected Item
              </h2>

            </div>

            <div className="flex items-center gap-4 border border-[#D8D0C8] bg-[#EFE9E1] p-4">

              <div className="flex h-12 w-12 items-center justify-center bg-[#E3DCD1]">
                <Package size={20} />
              </div>

              <div>

                <p className="text-sm font-semibold">
                  Order Item #{orderItemId}
                </p>

                <p className="mt-1 text-xs text-[#8B817A]">
                  Order #{orderId}
                </p>

              </div>

            </div>

          </div>

          {/* REASON */}
          <div className="border border-[#D8D0C8] bg-[#F8F5F1] p-6 sm:p-8">

            <div className="mb-6">

              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#72383D]">
                Step 03
              </p>

              <h2 className="mt-2 font-serif text-2xl">
                Reason
              </h2>

            </div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-[1px]">
              Why are you requesting this?
            </label>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-[#D8D0C8] bg-[#EFE9E1] px-4 py-3 text-sm outline-none focus:border-[#72383D]"
              required
            >

              <option value="">
                Select a reason
              </option>

              {reasons.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}

            </select>

          </div>

          {/* DESCRIPTION */}
          <div className="border border-[#D8D0C8] bg-[#F8F5F1] p-6 sm:p-8">

            <div className="mb-6">

              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#72383D]">
                Step 04
              </p>

              <h2 className="mt-2 font-serif text-2xl">
                Additional Details
              </h2>

            </div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-[1px]">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Please describe the issue or explain what you would like to exchange..."
              className="w-full resize-none border border-[#D8D0C8] bg-[#EFE9E1] px-4 py-3 text-sm outline-none placeholder:text-[#9A9088] focus:border-[#72383D]"
            />

            <p className="mt-2 text-xs text-[#8B817A]">
              Please provide enough information to help us
              process your request.
            </p>

          </div>

          {/* SUBMIT */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              href={`/user/account/orders/${orderId}`}
              className="inline-flex items-center justify-center border border-[#322D29] px-7 py-3 text-xs font-semibold uppercase tracking-[1.5px] transition hover:bg-[#322D29] hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-[#72383D] px-7 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#432415]"
            >
              {requestType === "return"
                ? "Submit Return Request"
                : "Submit Exchange Request"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}

