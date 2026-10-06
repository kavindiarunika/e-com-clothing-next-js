
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  Clock3,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Package,
} from "lucide-react";

export default function ReturnsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/returns", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load return requests");
        }

        setRequests(Array.isArray(data.returns) ? data.returns : []);
      } catch (error) {
        console.error("Load user returns error:", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

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
        const [ordersResult, itemsResult] = await Promise.all([
          ordersResponse.json(),
          itemsResponse.json(),
        ]);

        if (!ordersResponse.ok || !ordersResult.success) {
          throw new Error(ordersResult.message || "Unable to load your orders.");
        }

        if (!itemsResponse.ok || !itemsResult.success) {
          throw new Error(itemsResult.message || "Unable to load your order items.");
        }

        const itemsByOrder = new Map();
        for (const item of Array.isArray(itemsResult.data) ? itemsResult.data : []) {
          const orderItems = itemsByOrder.get(String(item.order_id)) || [];
          orderItems.push(item);
          itemsByOrder.set(String(item.order_id), orderItems);
        }

        setOrders(
          (Array.isArray(ordersResult.data) ? ordersResult.data : []).map((order) => ({
            ...order,
            items: itemsByOrder.get(String(order.order_id)) || [],
          }))
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Load orders for returns error:", error);
          setOrdersError(error.message || "Unable to load your orders.");
          setOrders([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setOrdersLoading(false);
        }
      }
    };

    void loadOrders();

    return () => controller.abort();
  }, []);

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

        {/* ORDERS */}
        <div className="mb-14">
          <div className="mb-6">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
              Start a Request
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl">
              Your Orders
            </h2>
          </div>

          {ordersLoading ? (
            <div className="border border-[#D8D0C8] bg-[#F8F5F1] p-8 text-center">
              <p className="text-sm text-[#6B625C]">Loading your orders...</p>
            </div>
          ) : ordersError ? (
            <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {ordersError}
            </p>
          ) : orders.length === 0 ? (
            <div className="border border-[#D8D0C8] bg-[#F8F5F1] p-8 text-center">
              <Package size={30} className="mx-auto text-[#8B817A]" />
              <p className="mt-3 text-sm text-[#6B625C]">
                Your orders will appear here when you have placed an order.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => {
                const isDelivered =
                  String(order.order_status || "").toLowerCase() === "delivered";

                return (
                  <article
                    key={order.order_id}
                    className="border border-[#D8D0C8] bg-[#F8F5F1]"
                  >
                    <div className="flex flex-col gap-2 border-b border-[#D8D0C8] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold">
                        Order #{order.order_id}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B625C]">
                        <span>
                          {new Date(order.order_date || order.created_at).toLocaleDateString()}
                        </span>
                        <span className="capitalize">
                          {order.order_status || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-[#D8D0C8]">
                      {order.items.map((item) => (
                        <div
                          key={item.order_item_id}
                          className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-4">
                            <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#E3DCD1]">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.product_title || "Ordered product"}
                                  fill
                                  unoptimized
                                  sizes="64px"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-[#8B817A]">
                                  No image
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {item.product_title || `Product #${item.item_id}`}
                              </p>
                              <p className="mt-1 text-xs text-[#6B625C]">
                                Quantity: {item.qty}
                                {item.size ? ` · Size: ${item.size}` : ""}
                                {item.color ? ` · Color: ${item.color}` : ""}
                              </p>
                            </div>
                          </div>

                          {isDelivered ? (
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/user/account/returns/request?orderId=${order.order_id}&orderItemId=${item.order_item_id}&type=return`}
                                className="inline-flex items-center justify-center gap-2 border border-[#72383D] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[1px] text-[#72383D] transition hover:bg-[#72383D] hover:text-white"
                              >
                                <RotateCcw size={14} />
                                Return
                              </Link>
                              <Link
                                href={`/user/account/returns/request?orderId=${order.order_id}&orderItemId=${item.order_item_id}&type=exchange`}
                                className="inline-flex items-center justify-center gap-2 border border-[#49657C] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[1px] text-[#49657C] transition hover:bg-[#49657C] hover:text-white"
                              >
                                <RefreshCw size={14} />
                                Exchange
                              </Link>
                            </div>
                          ) : (
                            <p className="text-xs text-[#8B817A]">
                              Returns and exchanges are available after delivery.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* REQUESTS */}
        <div className="space-y-5">

          {loading ? (
            <div className="border border-[#D8D0C8] bg-[#F8F5F1] p-12 text-center">
              <p className="text-sm text-[#6B625C]">Loading your return requests...</p>
            </div>
          ) : requests.length === 0 ? (

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
