"use client";

import { useState } from "react";

export default function CouponBox({ onApplyCoupon }) {
  const [coupon, setCoupon] = useState("");

  const handleApply = () => {
    onApplyCoupon(coupon.trim().toUpperCase());
  };

  return (
    <div className="border-t border-[#E5E5E5] pt-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[1.5px] text-[#292524]">
        Coupon Code
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Enter coupon"
          className="min-w-0 flex-1 border border-[#E5E5E5] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
        />

        <button
          type="button"
          onClick={handleApply}
          className="bg-[var(--color-primary)] px-5 py-3 text-xs font-semibold uppercase tracking-[1px] text-white transition hover:bg-[var(--color-primary-hover)]"
        >
          Apply
        </button>
      </div>
    </div>
  );
}