
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import {
  Package,
  ChevronRight,
  ArrowLeft,
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
        const [ordersResponse, itemsResponse] = await Promise.all([
          fetch("/api/user/orders", {
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch("/api/user/order-items", {
            signal: controller.signal,
            cache: "no-store",
          }),
        ]);
        const [result, itemsResult] = await Promise.all([
          ordersResponse.json(),
          itemsResponse.json(),
        ]);

        if (ordersResponse.status === 401 || itemsResponse.status === 401) {
          localStorage.removeItem("velora-user-session");
          router.replace("/user/login");
          return;
        }

        if (!ordersResponse.ok || !result.success) {
          throw new Error(result.message || "Unable to load your orders.");
        }

        if (!itemsResponse.ok || !itemsResult.success) {
          throw new Error(itemsResult.message || "Unable to load order items.");
        }

        const itemsByOrder = new Map();
        for (const item of Array.isArray(itemsResult.data) ? itemsResult.data : []) {
          const orderId = String(item.order_id);
          const orderItems = itemsByOrder.get(orderId) || [];
          orderItems.push({
            id: String(item.order_item_id),
            name: item.product_title || `Product #${item.item_id}`,
            image: item.image || "",
            quantity: Number(item.qty) || 0,
          });
          itemsByOrder.set(orderId, orderItems);
        }

        const customerOrders = Array.isArray(result.data) ? result.data : [];
        setOrders(
          customerOrders.map((order) => {
            const status = String(order.order_status || "pending").toLowerCase();
            const items = itemsByOrder.get(String(order.order_id)) || [];

            return {
              id: String(order.order_id),
              date: new Date(order.order_date || order.created_at).toLocaleDateString(),
              total: `Rs. ${Number(order.total_amount || 0).toLocaleString()}`,
              status: status.charAt(0).toUpperCase() + status.slice(1),
              statusType: status,
              items,
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

    const socket = io({ autoConnect: false, withCredentials: true });
    socket.on("orders:created", () => void loadOrders());
    socket.on("order:updated", () => void loadOrders());
    socket.connect();

    return () => {
      controller.abort();
      socket.disconnect();
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#292524]">

      {/* HEADER */}
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
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#6B625C] hover:text-[#e63e62]"
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

          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#e63e62]">
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
              className="group block border border-[#E7DEDC] bg-[#FAF6F5] transition hover:border-[#e63e62] hover:shadow-sm"
            >

              <div className="space-y-3 p-5 sm:p-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-20 w-16 shrink-0 overflow-hidden bg-[#FAF6F5]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-[#8B817A]">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                      <p className="mt-1 text-xs text-[#8B817A]">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-4 border-t border-[#E7DEDC] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#8B817A]">
                    <span className="font-semibold text-[#292524]">Order #{order.id}</span>
                    <span>{order.date}</span>
                    <span className="inline-flex items-center gap-1.5">
                      {order.statusType === "shipped" ? (
                        <Truck size={14} className="text-[#e63e62]" />
                      ) : (
                        <CheckCircle2 size={14} className="text-[#547454]" />
                      )}
                      <span className={order.statusType === "delivered" ? "text-[#547454]" : "text-[#e63e62]"}>
                        {order.status}
                      </span>
                    </span>
                    <span className="font-semibold text-[#292524]">{order.total}</span>
                  </div>

                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#292524] group-hover:text-[#e63e62]">
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
          <div className="border border-[#E7DEDC] bg-[#FAF6F5] px-6 py-16 text-center">

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
              className="mt-6 inline-block bg-[#292524] px-6 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white hover:bg-[#e63e62]"
            >
              Start Shopping
            </Link>

          </div>
        )}

      </section>

    </main>
  );
}
