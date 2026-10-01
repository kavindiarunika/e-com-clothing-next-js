
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  FileText,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

export default function OrderDetailsPage() {
  const params = useParams();

  const orderId = params?.id || "1001";

  // Demo order
  // Later replace this with API data.
  const order = {
    id: orderId,
    date: "September 22, 2026",

    status: orderId === "1000" ? "Delivered" : "Shipped",

    total: "Rs. 12,500",
    subtotal: "Rs. 12,000",
    shipping: "Rs. 500",

    items: [
      {
        id: 1,
        name: "Premium Linen Shirt",
        size: "M",
        color: "Beige",
        quantity: 1,
        price: "Rs. 6,500",
        image: "/images/products/dress1.webp",
      },
      {
        id: 2,
        name: "Classic Wide Leg Trousers",
        size: "S",
        color: "Brown",
        quantity: 1,
        price: "Rs. 5,500",
        image: "/images/products/dress2.webp",
      },
    ],

    address: {
      name: "Chathuni Imasha",
      phone: "+94 77 123 4567",
      address: "123 Main Street",
      city: "Colombo",
      district: "Western Province",
      postalCode: "00100",
    },

    payment: "Cash on Delivery",
  };

  const currentStatus = order.status.toLowerCase();

  // Return / Exchange is available ONLY after delivery.
  const isDelivered = currentStatus === "delivered";

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
            href="/user/account/orders"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#6B625C] hover:text-[#72383D]"
          >
            <ArrowLeft size={15} />
            My Orders
          </Link>

        </div>

      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-16">

        {/* TITLE */}
        <div className="mb-10">

          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
            Order Details
          </p>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h1 className="font-serif text-4xl sm:text-5xl">
                ORDER #{order.id}
              </h1>

              <p className="mt-3 text-sm text-[#8B817A]">
                Placed on {order.date}
              </p>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              {/* STATUS */}
              <div className="flex items-center gap-2 text-sm font-semibold text-[#72383D]">

                <Truck size={18} />

                {order.status}

              </div>

              {/* INVOICE */}
              <Link
                href={`/user/account/orders/${order.id}/invoice`}
                className="inline-flex items-center gap-2 border border-[#72383D] bg-[#72383D] px-5 py-2.5 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#432415]"
              >
                <FileText size={15} />
                Invoice
              </Link>

            </div>

          </div>

        </div>

        {/* ORDER PROGRESS */}
        <div className="mb-8 border border-[#D8D0C8] bg-[#F8F5F1] p-6 sm:p-8">

          <p className="mb-7 text-[10px] font-semibold uppercase tracking-[2px] text-[#72383D]">
            Order Progress
          </p>

          <div className="grid grid-cols-4 gap-2">

            {/* ORDERED */}
            <div className="text-center">

              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#547454] text-white">
                <CheckCircle2 size={18} />
              </div>

              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[1px]">
                Ordered
              </p>

            </div>

            {/* PROCESSING */}
            <div className="text-center">

              <div
                className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${
                  currentStatus === "pending"
                    ? "border border-[#D8D0C8] bg-[#EFE9E1] text-[#9A9088]"
                    : "bg-[#547454] text-white"
                }`}
              >

                {currentStatus === "pending" ? (
                  <Package size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}

              </div>

              <p
                className={`mt-3 text-[10px] font-semibold uppercase tracking-[1px] ${
                  currentStatus === "pending"
                    ? "text-[#9A9088]"
                    : "text-[#322D29]"
                }`}
              >
                Processing
              </p>

            </div>

            {/* SHIPPED */}
            <div className="text-center">

              <div
                className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${
                  currentStatus === "shipped"
                    ? "bg-[#72383D] text-white"
                    : currentStatus === "delivered"
                    ? "bg-[#547454] text-white"
                    : "border border-[#D8D0C8] bg-[#EFE9E1] text-[#9A9088]"
                }`}
              >

                {currentStatus === "shipped" ? (
                  <Truck size={18} />
                ) : currentStatus === "delivered" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Truck size={18} />
                )}

              </div>

              <p
                className={`mt-3 text-[10px] font-semibold uppercase tracking-[1px] ${
                  currentStatus === "shipped"
                    ? "text-[#72383D]"
                    : currentStatus === "delivered"
                    ? "text-[#322D29]"
                    : "text-[#9A9088]"
                }`}
              >
                Shipped
              </p>

            </div>

            {/* DELIVERED */}
            <div className="text-center">

              <div
                className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${
                  currentStatus === "delivered"
                    ? "bg-[#72383D] text-white"
                    : "border border-[#D8D0C8] bg-[#EFE9E1] text-[#9A9088]"
                }`}
              >

                {currentStatus === "delivered" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Package size={18} />
                )}

              </div>

              <p
                className={`mt-3 text-[10px] font-semibold uppercase tracking-[1px] ${
                  currentStatus === "delivered"
                    ? "text-[#72383D]"
                    : "text-[#9A9088]"
                }`}
              >
                Delivered
              </p>

            </div>

          </div>

        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">

          {/* LEFT */}
          <div className="space-y-8">

            {/* PRODUCTS */}
            <div className="border border-[#D8D0C8] bg-[#F8F5F1]">

              <div className="border-b border-[#D8D0C8] p-6">

                <h2 className="font-serif text-2xl">
                  Ordered Items
                </h2>

              </div>

              <div className="divide-y divide-[#D8D0C8]">

                {order.items.map((item) => (

                  <div
                    key={item.id}
                    className="flex gap-4 p-5 sm:p-6"
                  >

                    {/* IMAGE */}
                    <div className="h-28 w-24 flex-shrink-0 overflow-hidden bg-[#E3DCD1] sm:h-32 sm:w-28">

                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />

                    </div>

                    {/* INFO */}
                    <div className="flex flex-1 flex-col justify-between">

                      <div>

                        <h3 className="text-sm font-semibold">
                          {item.name}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#8B817A]">

                          <span>
                            Size: {item.size}
                          </span>

                          <span>
                            Color: {item.color}
                          </span>

                          <span>
                            Qty: {item.quantity}
                          </span>

                        </div>

                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <p className="text-sm font-semibold">
                          {item.price}
                        </p>

                        {/* RETURN / EXCHANGE */}
                        {isDelivered && (

                          <div className="flex flex-wrap gap-2">

                            <Link
                              href={`/user/account/returns/request?orderId=${order.id}&orderItemId=${item.id}&type=return`}
                              className="inline-flex items-center gap-2 border border-[#72383D] px-4 py-2 text-[10px] font-semibold uppercase tracking-[1.2px] text-[#72383D] transition hover:bg-[#72383D] hover:text-white"
                            >

                              <RotateCcw size={13} />

                              Return

                            </Link>

                            <Link
                              href={`/user/account/returns/request?orderId=${order.id}&orderItemId=${item.id}&type=exchange`}
                              className="inline-flex items-center gap-2 border border-[#322D29] px-4 py-2 text-[10px] font-semibold uppercase tracking-[1.2px] text-[#322D29] transition hover:bg-[#322D29] hover:text-white"
                            >

                              <RefreshCw size={13} />

                              Exchange

                            </Link>

                          </div>

                        )}

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* DELIVERY ADDRESS */}
            <div className="border border-[#D8D0C8] bg-[#F8F5F1]">

              <div className="border-b border-[#D8D0C8] p-6">

                <div className="flex items-center gap-3">

                  <MapPin size={18} />

                  <h2 className="font-serif text-2xl">
                    Delivery Address
                  </h2>

                </div>

              </div>

              <div className="p-6">

                <p className="text-sm font-semibold">
                  {order.address.name}
                </p>

                <p className="mt-3 text-sm leading-6 text-[#6B625C]">

                  {order.address.address}

                  <br />

                  {order.address.city},{" "}
                  {order.address.district}

                  <br />

                  {order.address.postalCode}

                </p>

                <p className="mt-3 text-sm text-[#6B625C]">
                  {order.address.phone}
                </p>

              </div>

            </div>

            {/* RETURN / EXCHANGE INFO */}
            {isDelivered && (

              <div className="border border-[#D8D0C8] bg-[#E3DCD1] p-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#72383D] text-white">

                    <RefreshCw size={18} />

                  </div>

                  <div>

                    <h3 className="font-serif text-xl">
                      Need a Return or Exchange?
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#6B625C]">
                      If you are not satisfied with an item,
                      you can request a return or exchange
                      from your delivered order.
                    </p>

                    <Link
                      href="/user/account/returns"
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#72383D] hover:underline"
                    >

                      View Return & Exchange Requests

                      <ArrowLeft
                        size={14}
                        className="rotate-180"
                      />

                    </Link>

                  </div>

                </div>

              </div>

            )}

          </div>

          {/* RIGHT */}
          <aside className="space-y-8">

            {/* SUMMARY */}
            <div className="border border-[#D8D0C8] bg-[#F8F5F1]">

              <div className="border-b border-[#D8D0C8] p-6">

                <h2 className="font-serif text-2xl">
                  Order Summary
                </h2>

              </div>

              <div className="space-y-4 p-6">

                <div className="flex justify-between text-sm">

                  <span className="text-[#6B625C]">
                    Subtotal
                  </span>

                  <span>
                    {order.subtotal}
                  </span>

                </div>

                <div className="flex justify-between text-sm">

                  <span className="text-[#6B625C]">
                    Shipping
                  </span>

                  <span>
                    {order.shipping}
                  </span>

                </div>

                <div className="border-t border-[#D8D0C8] pt-4">

                  <div className="flex justify-between">

                    <span className="font-semibold">
                      Total
                    </span>

                    <span className="font-serif text-xl">
                      {order.total}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* PAYMENT */}
            <div className="border border-[#D8D0C8] bg-[#F8F5F1] p-6">

              <div className="flex items-center gap-3">

                <CreditCard size={18} />

                <h2 className="font-serif text-xl">
                  Payment
                </h2>

              </div>

              <p className="mt-4 text-sm text-[#6B625C]">
                {order.payment}
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs text-[#547454]">

                <CheckCircle2 size={14} />

                Payment confirmed

              </div>

            </div>

            {/* HELP */}
            <div className="border border-[#D8D0C8] bg-[#E3DCD1] p-6">

              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#72383D]">
                Need Help?
              </p>

              <h3 className="mt-2 font-serif text-xl">
                Questions about your order?
              </h3>

              <p className="mt-2 text-xs leading-5 text-[#6B625C]">
                Contact our customer support team if
                you need assistance with your order.
              </p>

              <button
                type="button"
                className="mt-5 border border-[#322D29] px-5 py-2.5 text-xs font-semibold uppercase tracking-[1.5px] transition hover:bg-[#322D29] hover:text-white"
              >
                Contact Us
              </button>

            </div>

          </aside>

        </div>

      </section>

    </main>
  );
}

