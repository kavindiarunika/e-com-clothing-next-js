
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ChevronRight,
  ArrowLeft,
  Clock3,
  CheckCircle2,
  Truck,
} from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadOrders = async () => {
      try {
        const response = await fetch("/api/user/orders", {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("velora-user-session");
          router.replace("/user/login");
          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load your orders.");
        }

        const customerOrders = Array.isArray(result.data) ? result.data : [];
        setOrders(
          customerOrders.map((order) => {
            const status = String(order.order_status || "pending").toLowerCase();

            return {
              id: String(order.order_id),
              date: new Date(order.order_date || order.created_at).toLocaleDateString(),
              total: `Rs. ${Number(order.total_amount || 0).toLocaleString()}`,
              status: status.charAt(0).toUpperCase() + status.slice(1),
              statusType: status,
              items: Number(order.item_count) || 0,
            };
          })
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Load customer orders error:", error);
          setLoadError(error.message || "Unable to load your orders.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadOrders();
    return () => controller.abort();
  }, [router]);

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

          {isLoading && (
            <p className="py-8 text-center text-sm text-[#6B625C]">
              Loading your orders...
            </p>
          )}

          {!isLoading && loadError && (
            <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {loadError}
            </p>
          )}

          {orders.map((order) => (

            <Link
              key={order.id}
              href={`/user/account/orders/${order.id}`}
              className="group block border border-[#D8D0C8] bg-[#F8F5F1] transition hover:border-[#72383D] hover:shadow-sm"
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
                  <span
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

                  </span>

                </div>

            </div>

            </Link>

          ))}

        </div>

        {/* EMPTY STATE - OPTIONAL */}
        {!isLoading && !loadError && orders.length === 0 && (
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
