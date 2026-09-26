
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Package,
  RotateCcw,
  XCircle,
} from "lucide-react";

const notifications = [
  {
    notification_id: 1,
    order_id: 1001,
    title: "Order Shipped",
    message: "Your order #1001 has been shipped.",
    type: "order",
    is_read: false,
    created_at: "September 24, 2026",
  },
  {
    notification_id: 2,
    order_id: 1000,
    title: "Order Delivered",
    message: "Your order #1000 has been delivered successfully.",
    type: "order",
    is_read: true,
    created_at: "September 23, 2026",
  },
  {
    notification_id: 3,
    order_id: 1001,
    title: "Return Approved",
    message: "Your return request for order #1001 has been approved.",
    type: "return",
    is_read: false,
    created_at: "September 24, 2026",
  },
];

export default function NotificationsPage() {
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
            href="/user/account"
            className="flex items-center gap-2 text-sm text-[#EFE9E1]"
          >
            <ArrowLeft size={17} />
            My Account
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-[#72383D]">
            Account
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Notifications
          </h1>

          <p className="mt-2 text-[#322D29]/60">
            Stay updated about your orders and returns.
          </p>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`rounded-2xl bg-white p-5 shadow-sm ${
                !notification.is_read
                  ? "border-l-4 border-[#72383D]"
                  : ""
              }`}
            >
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFE9E1] text-[#72383D]">
                  {notification.type === "return" ? (
                    <RotateCcw size={20} />
                  ) : (
                    <Package size={20} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row">
                    <h2 className="font-semibold">
                      {notification.title}
                    </h2>

                    <span className="text-xs text-[#322D29]/50">
                      {notification.created_at}
                    </span>
                  </div>

                  <p className="mt-1 text-sm leading-6 text-[#322D29]/65">
                    {notification.message}
                  </p>

                  {!notification.is_read && (
                    <span className="mt-3 inline-block rounded-full bg-[#72383D] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="rounded-3xl bg-white px-6 py-16 text-center">
            <Bell
              size={40}
              className="mx-auto text-[#322D29]/30"
            />

            <h2 className="mt-4 text-xl font-semibold">
              No notifications
            </h2>

            <p className="mt-2 text-sm text-[#322D29]/60">
              You are all caught up.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

