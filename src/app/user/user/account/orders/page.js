
"use client";

import Link from "next/link";
import {
  Package,
  ChevronRight,
  ArrowLeft,
  Clock3,
  CheckCircle2,
  Truck,
} from "lucide-react";

export default function OrdersPage() {
  const orders = [
    {
      id: "1001",
      date: "September 22, 2026",
      total: "Rs. 12,500",
      status: "Shipped",
      statusType: "shipped",
      items: 2,
    },
    {
      id: "1000",
      date: "September 15, 2026",
      total: "Rs. 8,900",
      status: "Delivered",
      statusType: "delivered",
      items: 1,
    },
  ];

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
      <section className="mx-auto max-w-5xl px-6 py-12 lg:py-16">

        {/* TITLE */}
        <div className="mb-10">

          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
            Purchase History
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl">
            MY ORDERS
          </h1>

          <p className="mt-4 text-sm text-[#6B625C]">
            View and track all your Velora orders.
          </p>

        </div>

        {/* ORDERS */}
        <div className="space-y-5">

          {orders.map((order) => (

            <div
              key={order.id}
              className="border border-[#D8D0C8] bg-[#F8F5F1]"
            >

              {/* ORDER HEADER */}
              <div className="flex flex-col gap-4 border-b border-[#D8D0C8] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center bg-[#E3DCD1]">
                    <Package size={20} />
                  </div>

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8B817A]">
                      Order
                    </p>

                    <h2 className="mt-1 font-serif text-xl">
                      #{order.id}
                    </h2>

                  </div>

                </div>

                <div className="text-left sm:text-right">

                  <p className="text-xs text-[#8B817A]">
                    {order.date}
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {order.total}
                  </p>

                </div>

              </div>

              {/* ORDER DETAILS */}
              <div className="p-5 sm:p-6">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  {/* STATUS */}
                  <div>

                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8B817A]">
                      Order Status
                    </p>

                    <div className="flex items-center gap-2">

                      {order.statusType === "shipped" ? (
                        <Truck
                          size={17}
                          className="text-[#72383D]"
                        />
                      ) : (
                        <CheckCircle2
                          size={17}
                          className="text-[#547454]"
                        />
                      )}

                      <span
                        className={`
                          text-sm
                          font-semibold
                          ${
                            order.statusType ===
                            "delivered"
                              ? "text-[#547454]"
                              : "text-[#72383D]"
                          }
                        `}
                      >
                        {order.status}
                      </span>

                    </div>

                  </div>

                  {/* ITEMS */}
                  <div>

                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8B817A]">
                      Items
                    </p>

                    <p className="text-sm">
                      {order.items}{" "}
                      {order.items === 1
                        ? "item"
                        : "items"}
                    </p>

                  </div>

                  {/* VIEW */}
                  <Link
                    href={`/user/account/orders/${order.id}`}
                    className="
                      group
                      flex
                      items-center
                      justify-center
                      gap-2
                      border
                      border-[#322D29]
                      px-5
                      py-3
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[1.5px]
                      transition
                      hover:bg-[#322D29]
                      hover:text-white
                    "
                  >
                    View Order

                    <ChevronRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />

                  </Link>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* EMPTY STATE - OPTIONAL */}
        {orders.length === 0 && (
          <div className="border border-[#D8D0C8] bg-[#F8F5F1] px-6 py-16 text-center">

            <Package
              size={40}
              className="mx-auto text-[#8B817A]"
            />

            <h2 className="mt-5 font-serif text-2xl">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-[#8B817A]">
              Your orders will appear here once you
              make a purchase.
            </p>

            <Link
              href="/user"
              className="mt-6 inline-block bg-[#322D29] px-6 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white hover:bg-[#72383D]"
            >
              Start Shopping
            </Link>

          </div>
        )}

      </section>

    </main>
  );
}

