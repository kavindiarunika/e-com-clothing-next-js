
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowLeftRight, Bell, Package, RotateCcw } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadNotifications = async () => {
      try {
        const response = await fetch("/api/user/notifications", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load notifications.");
        }

        setNotifications(
          Array.isArray(data.notifications) ? data.notifications : []
        );
      } catch (loadError) {
        if (!controller.signal.aborted) {
          console.error("Load notifications error:", loadError);
          setError(loadError.message || "Failed to load notifications.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadNotifications();

    return () => controller.abort();
  }, []);

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
      ? ""
      : parsedDate.toLocaleString();
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#292524]">
      <header className="border-b border-[#E7DEDC]">
              <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
      
                <Link
                  href="/user"
                  className="font-serif text-3xl tracking-[4px]"
                >
                  VELORA
                </Link>
      
                <Link
                  href="/user/account"
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#6B625C] hover:text-[#C08081]"
                >
                  <ArrowLeft size={15} />
                  My Account
                </Link>
      
              </div>
            </header>

      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-[#C08081]">
            Account
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Notifications
          </h1>

          <p className="mt-2 text-[#292524]/60">
            Stay updated about your orders and returns.
          </p>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`rounded-2xl bg-white p-5 shadow-sm ${
                !notification.is_read
                  ? "border-l-4 border-[#C08081]"
                  : ""
              }`}
            >
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFFFFF] text-[#C08081]">
                  {notification.type === "return" ? (
                    <RotateCcw size={20} />
                  ) : notification.type === "exchange" ? (
                    <ArrowLeftRight size={20} />
                  ) : (
                    <Package size={20} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row">
                    <h2 className="font-semibold">
                      {notification.title}
                    </h2>

                    <span className="text-xs text-[#292524]/50">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>

                  <p className="mt-1 text-sm leading-6 text-[#292524]/65">
                    {notification.message}
                  </p>

                  {!notification.is_read && (
                    <span className="mt-3 inline-block rounded-full bg-[#C08081] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="rounded-3xl bg-white px-6 py-16 text-center text-sm text-[#292524]/60">
            Loading notifications...
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-3xl bg-white px-6 py-16 text-center text-sm text-[#A44747]"
          >
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="rounded-3xl bg-white px-6 py-16 text-center">
            <Bell
              size={40}
              className="mx-auto text-[#292524]/30"
            />

            <h2 className="mt-4 text-xl font-semibold">
              No notifications
            </h2>

            <p className="mt-2 text-sm text-[#292524]/60">
              You are all caught up.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
