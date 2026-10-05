"use client";

import CouponBox from "./CouponBox";
import Link from "next/link";

function PriceRow({ label, value, valueClassName = "text-[#322D29]" }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#6B625C]">{label}</span>
      <span className={`shrink-0 text-right font-medium tabular-nums ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

export default function CartSummary({
  subtotal,
  discount,
  shipping,
  total,
  selectedCount,
  selectedItems = [],
  onApplyCoupon,
}) {
  return (
    <div className="bg-white p-5 md:p-7 lg:p-8">
      <h2 className="font-serif text-2xl text-[#322D29] md:text-[2rem]">
        Cart Summary
      </h2>

      <p className="mt-2 text-[10px] uppercase tracking-[2px] text-[#6B625C] md:text-[11px]">
        {selectedCount} item selected
      </p>

      <div className="mt-6 space-y-3 text-sm md:space-y-4">
        <PriceRow label="Subtotal" value={`Rs. ${subtotal.toLocaleString()}`} />

        <PriceRow
          label="Discount"
          value={`- Rs. ${discount.toLocaleString()}`}
          valueClassName="text-[#72383D]"
        />

        <PriceRow label="Shipping" value={`Rs. ${shipping.toLocaleString()}`} />
      </div>

      <div className="my-6 border-t border-[#D8D0C8]" />

      {/* Total */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold uppercase tracking-[1px] text-[#322D29]">
          Total
        </span>

        <span className="shrink-0 text-right text-xl font-semibold tabular-nums text-[#72383D]">
          Rs. {total.toLocaleString()}
        </span>
      </div>

      {/* Coupon */}
      <div className="mt-7">
        <CouponBox onApplyCoupon={onApplyCoupon} />
      </div>

      {/* Checkout */}
      <Link
        href="/user/checkout"
        aria-disabled={selectedItems.length === 0}
        onClick={(event) => {
          if (selectedItems.length === 0) {
            event.preventDefault();
            return;
          }

          sessionStorage.removeItem("velora-buy-now-item");
          sessionStorage.setItem(
            "velora-checkout-items",
            JSON.stringify(selectedItems)
          );
        }}
        className={`mt-7 block w-full px-6 py-4 text-center text-xs font-semibold uppercase tracking-[1.5px] text-white transition ${
          selectedItems.length === 0
            ? "cursor-not-allowed bg-[#8B817A]"
            : "bg-[#72383D] hover:bg-[#5E2E33]"
        }`}
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}