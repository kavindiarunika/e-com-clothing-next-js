
"use client";

import Link from "next/link";

import {
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  Clock3,
  CheckCircle2,
  XCircle,
  PackageCheck,
} from "lucide-react";

export default function ReturnsPage() {

  // Demo data
  // Later replace this with API data.
  const requests = [
    {
      return_id: 1,
      order_id: 1001,
      order_item_id: 1,
      request_type: "return",
      reason: "Wrong size",
      description: "The shirt is too large for me.",
      status: "pending",
      requested_at: "September 24, 2026",
      processed_at: null,
    },
    {
      return_id: 2,
      order_id: 1000,
      order_item_id: 3,
      request_type: "exchange",
      reason: "Wrong color",
      description: "I would like to exchange this item for another color.",
      status: "approved",
      requested_at: "September 20, 2026",
      processed_at: "September 21, 2026",
    },
    {
      return_id: 3,
      order_id: 998,
      order_item_id: 2,
      request_type: "return",
      reason: "Damaged item",
      description: "The product arrived damaged.",
      status: "completed",
      requested_at: "September 10, 2026",
      processed_at: "September 13, 2026",
    },
    {
      return_id: 4,
      order_id: 997,
      order_item_id: 4,
      request_type: "exchange",
      reason: "Wrong size",
      description: "Requested a different size.",
      status: "rejected",
      requested_at: "September 8, 2026",
      processed_at: "September 9, 2026",
    },
  ];

  const getStatusStyle = (status) => {

    switch (status) {

      case "pending":
        return {
          bg: "bg-[#FFF4D6]",
          text: "text-[#A36A00]",
          border: "border-[#E5C979]",
          icon: <Clock3 size={14} />,
        };

      case "approved":
        return {
          bg: "bg-[#E6F0E6]",
          text: "text-[#547454]",
          border: "border-[#B8CFB8]",
          icon: <CheckCircle2 size={14} />,
        };

      case "rejected":
        return {
          bg: "bg-[#F8E4E4]",
          text: "text-[#A44747]",
          border: "border-[#D8A7A7]",
          icon: <XCircle size={14} />,
        };

      case "completed":
        return {
          bg: "bg-[#E4EAF1]",
          text: "text-[#49657C]",
          border: "border-[#B8C6D4]",
          icon: <PackageCheck size={14} />,
        };

      default:
        return {
          bg: "bg-[#EFE9E1]",
          text: "text-[#322D29]",
          border: "border-[#D8D0C8]",
          icon: <Clock3 size={14} />,
        };
    }
  };

  return (
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">

      {/* HEADER */}
      <header className="border-b border-[#D8D0C8]">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

          <Link
            href="/user"
            className="font-serif text-3xl tracking-[4px]"
          >
            VELORA
          </Link>

          <Link
            href="/user/account"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#6B625C] hover:text-[#72383D]"
          >
            <ArrowLeft size={15} />
            My Account
          </Link>

        </div>

      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-16">

        {/* TITLE */}
        <div className="mb-10">

          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
            Customer Account
          </p>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h1 className="font-serif text-4xl sm:text-5xl">
                RETURNS & EXCHANGES
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6B625C]">
                Track your return and exchange requests
                and see the latest status from our team.
              </p>

            </div>

            <Link
              href="/user/account/orders"
              className="inline-flex items-center justify-center border border-[#72383D] px-5 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-[#72383D] transition hover:bg-[#72383D] hover:text-white"
            >
              My Orders
            </Link>

          </div>

        </div>

        {/* REQUESTS */}
        <div className="space-y-5">

          {requests.length === 0 ? (

            <div className="border border-[#D8D0C8] bg-[#F8F5F1] p-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E3DCD1]">

                <RefreshCw size={22} />

              </div>

              <h2 className="mt-5 font-serif text-2xl">
                No Return or Exchange Requests
              </h2>

              <p className="mt-3 text-sm text-[#8B817A]">
                You have not submitted any return or
                exchange requests yet.
              </p>

            </div>

          ) : (

            requests.map((request) => {

              const style = getStatusStyle(request.status);

              const isReturn =
                request.request_type === "return";

              return (
                <div
                  key={request.return_id}
                  className="border border-[#D8D0C8] bg-[#F8F5F1]"
                >

                  {/* TOP */}
                  <div className="flex flex-col gap-5 border-b border-[#D8D0C8] p-6 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full ${
                          isReturn
                            ? "bg-[#E3DCD1]"
                            : "bg-[#E4EAF1]"
                        }`}
                      >

                        {isReturn ? (
                          <RotateCcw size={18} />
                        ) : (
                          <RefreshCw size={18} />
                        )}

                      </div>

                      <div>

                        <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#72383D]">
                          Request #{request.return_id}
                        </p>

                        <h2 className="mt-1 font-serif text-xl capitalize">
                          {request.request_type}
                        </h2>

                      </div>

                    </div>

                    {/* STATUS */}
                    <div
                      className={`inline-flex w-fit items-center gap-2 border px-4 py-2 text-xs font-semibold capitalize ${style.bg} ${style.text} ${style.border}`}
                    >
                      {style.icon}
                      {request.status}
                    </div>

                  </div>

                  {/* BODY */}
                  <div className="grid gap-6 p-6 md:grid-cols-2">

                    {/* LEFT */}
                    <div>

                      <div className="space-y-4">

                        <div>

                          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8B817A]">
                            Order
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            #{request.order_id}
                          </p>

                        </div>

                        <div>

                          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8B817A]">
                            Order Item
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            #{request.order_item_id}
                          </p>

                        </div>

                        <div>

                          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8B817A]">
                            Reason
                          </p>

                          <p className="mt-1 text-sm">
                            {request.reason}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* RIGHT */}
                    <div>

                      <div>

                        <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8B817A]">
                          Description
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#6B625C]">
                          {request.description}
                        </p>

                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">

                        <div>

                          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8B817A]">
                            Requested
                          </p>

                          <p className="mt-1 text-xs">
                            {request.requested_at}
                          </p>

                        </div>

                        <div>

                          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8B817A]">
                            Processed
                          </p>

                          <p className="mt-1 text-xs">
                            {request.processed_at || "Not processed yet"}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* FOOTER */}
                  <div className="border-t border-[#D8D0C8] bg-[#EFE9E1] px-6 py-4">

                    <Link
                      href={`/user/account/orders/${request.order_id}`}
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.2px] text-[#72383D] hover:underline"
                    >
                      View Order
                      <ArrowLeft
                        size={13}
                        className="rotate-180"
                      />
                    </Link>

                  </div>

                </div>
              );
            })

          )}

        </div>

      </section>

    </main>
  );
}

