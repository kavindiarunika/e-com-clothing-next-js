
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Printer,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

// Demo order data
// Later this data will come from your backend/MySQL database
const orders = {
  1001: {
    order_id: 1001,
    order_date: "September 22, 2026",

    subtotal: 12000,
    discount: 0,
    shipping_fee: 500,
    total_amount: 12500,

    payment_status: "pending",
    order_status: "shipped",

    payment_method: "Cash on Delivery",

    shipping_address: {
      name: "Chathuni Imasha",
      address: "123 Main Street",
      city: "Colombo",
      province: "Western Province",
      postal_code: "00100",
      phone: "+94 77 123 4567",
    },

    items: [
      {
        order_item_id: 1,
        item_id: 101,
        product_name: "Premium Linen Shirt",
        variant: "M / Beige",
        qty: 1,
        unit_price: 6500,
        discount: 0,
        total_price: 6500,
      },
      {
        order_item_id: 2,
        item_id: 102,
        product_name: "Classic Wide Leg Trousers",
        variant: "S / Brown",
        qty: 1,
        unit_price: 5500,
        discount: 0,
        total_price: 5500,
      },
    ],
  },

  1000: {
    order_id: 1000,
    order_date: "September 15, 2026",

    subtotal: 8400,
    discount: 0,
    shipping_fee: 500,
    total_amount: 8900,

    payment_status: "successful",
    order_status: "delivered",

    payment_method: "Cash on Delivery",

    shipping_address: {
      name: "Chathuni Imasha",
      address: "123 Main Street",
      city: "Colombo",
      province: "Western Province",
      postal_code: "00100",
      phone: "+94 77 123 4567",
    },

    items: [
      {
        order_item_id: 3,
        item_id: 103,
        product_name: "Classic Cotton Shirt",
        variant: "M / White",
        qty: 1,
        unit_price: 8400,
        discount: 0,
        total_price: 8400,
      },
    ],
  },
};

export default function InvoicePage() {
  const params = useParams();

  const orderId = params?.id;

  const order = orders[orderId];

  // If order does not exist
  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EFE9E1] px-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-[#322D29]">
            Invoice Not Found
          </h1>

          <p className="mt-3 text-sm text-[#322D29]/60">
            We couldn't find the invoice for this order.
          </p>

          <Link
            href="/user/account/orders"
            className="mt-6 inline-flex rounded-full bg-[#72383D] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#432415]"
          >
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="invoice-page min-h-screen bg-[#EFE9E1] text-[#322D29]">
      {/* =====================================================
          HEADER
          Hidden when printing / saving PDF
      ====================================================== */}
      <header className="print:hidden bg-[#322D29]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-[0.25em] text-[#EFE9E1]"
          >
            VELORA
          </Link>

          <Link
            href={`/user/account/orders/${order.order_id}`}
            className="flex items-center gap-2 text-sm text-[#EFE9E9] transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Order
          </Link>
        </div>
      </header>

      {/* =====================================================
          ACTION BUTTONS
          Hidden when printing / saving PDF
      ====================================================== */}
      <div className="print:hidden">
        <div className="mx-auto flex max-w-5xl justify-end gap-3 px-5 pt-8">
          {/* Print */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-full border border-[#322D29]/20 bg-white px-5 py-3 text-sm font-medium transition hover:bg-[#322D29] hover:text-white"
          >
            <Printer size={17} />
            Print
          </button>

          {/* Save as PDF */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-full bg-[#72383D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#432415]"
          >
            <Download size={17} />
            Save as PDF
          </button>
        </div>
      </div>

      {/* =====================================================
          INVOICE
      ====================================================== */}
      <div className="mx-auto max-w-5xl px-5 py-8 sm:py-10">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm print:rounded-none print:shadow-none">

          {/* =================================================
              INVOICE HEADER
          ================================================== */}
          <div className="border-b border-[#322D29]/10 p-6 sm:p-10">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

              {/* Company */}
              <div>
                <h1 className="text-3xl font-semibold tracking-[0.15em] text-[#322D29]">
                  VELORA
                </h1>

                <p className="mt-2 text-sm text-[#322D29]/55">
                  Fashion & Lifestyle
                </p>

                <div className="mt-5 space-y-1 text-sm text-[#322D29]/65">
                  <p>Colombo, Sri Lanka</p>
                  <p>+94 77 123 4567</p>
                  <p>hello@velora.com</p>
                </div>
              </div>

              {/* Invoice Information */}
              <div className="sm:text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-[#72383D]">
                  Invoice
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  INV-{order.order_id}
                </h2>

                <p className="mt-2 text-sm text-[#322D29]/60">
                  Order #{order.order_id}
                </p>

                <p className="mt-1 text-sm text-[#322D29]/60">
                  {order.order_date}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              CUSTOMER + PAYMENT
          ================================================== */}
          <div className="grid gap-8 border-b border-[#322D29]/10 p-6 sm:grid-cols-2 sm:p-10">

            {/* Customer */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#72383D]">
                Bill To
              </p>

              <div className="mt-4">
                <h3 className="font-semibold">
                  {order.shipping_address.name}
                </h3>

                <div className="mt-3 space-y-2 text-sm text-[#322D29]/65">
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 shrink-0" />

                    <span>
                      {order.shipping_address.address}
                      <br />
                      {order.shipping_address.city},{" "}
                      {order.shipping_address.province}
                      <br />
                      {order.shipping_address.postal_code}
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <Phone size={16} />
                    {order.shipping_address.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#72383D]">
                Payment Information
              </p>

              <div className="mt-4 space-y-3">

                {/* Payment Method */}
                <div className="flex items-center justify-between gap-5 text-sm">
                  <span className="text-[#322D29]/55">
                    Payment Method
                  </span>

                  <span className="font-medium">
                    {order.payment_method}
                  </span>
                </div>

                {/* Payment Status */}
                <div className="flex items-center justify-between gap-5 text-sm">
                  <span className="text-[#322D29]/55">
                    Payment Status
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      order.payment_status === "successful"
                        ? "bg-green-100 text-green-700"
                        : order.payment_status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </div>

                {/* Order Status */}
                <div className="flex items-center justify-between gap-5 text-sm">
                  <span className="text-[#322D29]/55">
                    Order Status
                  </span>

                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium capitalize text-purple-700">
                    {order.order_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              PRODUCTS
          ================================================== */}
          <div className="p-6 sm:p-10">

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#72383D]">
              Order Items
            </p>

            {/* Desktop Header */}
            <div className="hidden border-b border-[#322D29]/10 pb-3 text-xs uppercase tracking-wider text-[#322D29]/50 sm:grid sm:grid-cols-[1fr_80px_120px_120px] sm:gap-4">
              <span>Product</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Total</span>
            </div>

            {/* Products */}
            <div className="divide-y divide-[#322D29]/10">
              {order.items.map((item) => (
                <div
                  key={item.order_item_id}
                  className="grid gap-3 py-5 sm:grid-cols-[1fr_80px_120px_120px] sm:items-center sm:gap-4"
                >
                  {/* Product */}
                  <div>
                    <p className="font-medium">
                      {item.product_name}
                    </p>

                    <p className="mt-1 text-sm text-[#322D29]/55">
                      {item.variant}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex justify-between text-sm sm:block sm:text-center">
                    <span className="text-[#322D29]/50 sm:hidden">
                      Qty
                    </span>

                    <span>{item.qty}</span>
                  </div>

                  {/* Unit Price */}
                  <div className="flex justify-between text-sm sm:block sm:text-right">
                    <span className="text-[#322D29]/50 sm:hidden">
                      Unit Price
                    </span>

                    <span>
                      Rs. {item.unit_price.toLocaleString()}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between font-medium sm:block sm:text-right">
                    <span className="text-[#322D29]/50 sm:hidden">
                      Total
                    </span>

                    <span>
                      Rs. {item.total_price.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* =================================================
                SUMMARY
            ================================================== */}
            <div className="mt-8 ml-auto max-w-sm border-t border-[#322D29]/10 pt-5">

              <SummaryRow
                label="Subtotal"
                value={order.subtotal}
              />

              <SummaryRow
                label="Discount"
                value={order.discount}
                negative
              />

              <SummaryRow
                label="Shipping"
                value={order.shipping_fee}
              />

              <div className="my-4 border-t border-[#322D29]/10" />

              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>

                <span className="text-[#72383D]">
                  Rs. {order.total_amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              FOOTER
              
              Visible on website.
              Hidden when printing / saving PDF.
          ================================================== */}
          <div className="print:hidden border-t border-[#322D29]/10 bg-[#EFE9E1]/50 px-6 py-8 text-center sm:px-10">
            <p className="font-medium">
              Thank you for shopping with VELORA
            </p>

            <p className="mt-2 text-sm text-[#322D29]/55">
              We appreciate your support and hope to see you again.
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs text-[#322D29]/50">
              <span className="flex items-center gap-1.5">
                <Mail size={14} />
                hello@velora.com
              </span>

              <span className="flex items-center gap-1.5">
                <Phone size={14} />
                +94 77 123 4567
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          PRINT CSS
      ====================================================== */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body {
            background: white !important;
          }

          body:has(.invoice-page) footer {
            display: none !important;
          }

          main {
            min-height: auto !important;
            background: white !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Remove unnecessary spacing when printing */
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */
function SummaryRow({ label, value, negative = false }) {
  return (
    <div className="mb-3 flex items-center justify-between text-sm">
      <span className="text-[#322D29]/60">
        {label}
      </span>

      <span>
        {negative && value > 0 ? "-" : ""}
        Rs. {Number(value).toLocaleString()}
      </span>
    </div>
  );
}

