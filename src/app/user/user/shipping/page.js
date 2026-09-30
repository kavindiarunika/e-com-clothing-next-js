
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  Package,
  MapPin,
  Clock,
} from "lucide-react";

export default function ShippingPage() {
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
            Shipping & Delivery
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#322D29]/60">
            We want your VELORA experience to be simple from the moment you
            place your order until it arrives at your door.
          </p>

        </div>

        {/* Shipping Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">

          <ShippingCard
            icon={<Package size={23} />}
            title="Order Processing"
          >
            Once your order is confirmed, our team prepares your items
            carefully for delivery.
          </ShippingCard>

          <ShippingCard
            icon={<Truck size={23} />}
            title="Delivery"
          >
            Your order will be delivered to the address provided during
            checkout.
          </ShippingCard>

          <ShippingCard
            icon={<Clock size={23} />}
            title="Delivery Time"
          >
            Delivery time may vary depending on your location and order
            processing time.
          </ShippingCard>

        </div>

        {/* Main Information */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">

          {/* Delivery Information */}
          <div className="rounded-3xl bg-white p-7 shadow-sm sm:p-9">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE9E1] text-[#72383D]">
              <MapPin size={22} />
            </div>

            <h2 className="mt-6 text-2xl font-semibold">
              Delivery Information
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-7 text-[#322D29]/65">

              <p>
                Please make sure your delivery address and contact number
                are correct before placing your order.
              </p>

              <p>
                Orders are delivered to the address entered during the
                checkout process.
              </p>

              <p>
                If you need to update your delivery information, please
                contact our customer care team as soon as possible.
              </p>

            </div>
          </div>

          {/* Order Tracking */}
          <div className="rounded-3xl bg-white p-7 shadow-sm sm:p-9">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE9E1] text-[#72383D]">
              <Truck size={22} />
            </div>

            <h2 className="mt-6 text-2xl font-semibold">
              Track Your Order
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#322D29]/65">
              After placing an order, you can view its current status from
              your VELORA account. Order statuses include Pending,
              Processing, Shipped, Delivered, and Cancelled.
            </p>

            <Link
              href="/user/account/orders"
              className="mt-6 inline-flex items-center gap-2 bg-[#72383D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#432415]"
            >
              View My Orders
            </Link>

          </div>

        </div>

        {/* Important Note */}
        <div className="mt-8 rounded-2xl border border-[#72383D]/15 bg-[#72383D]/5 p-6">

          <h3 className="font-semibold">
            Important
          </h3>

          <p className="mt-2 text-sm leading-7 text-[#322D29]/65">
            Delivery times can vary depending on location, order volume,
            product availability, and other delivery conditions. Please
            check your order status for the latest information.
          </p>

        </div>

      </section>
    </main>
  );
}

function ShippingCard({ icon, title, children }) {
  return (
    <div className="rounded-3xl bg-white p-7 text-center shadow-sm">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EFE9E1] text-[#72383D]">
        {icon}
      </div>

      <h2 className="mt-5 text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-[#322D29]/60">
        {children}
      </p>

    </div>
  );
}

