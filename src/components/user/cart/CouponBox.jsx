"use client";

import { useState } from "react";

export default function CouponBox({ onApplyCoupon }) {
  const [coupon, setCoupon] = useState("");

  const handleApply = () => {
    onApplyCoupon(coupon.trim().toUpperCase());
  };

  return (
    <div className="border-t border-[#D8D0C8] pt-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]">
        Coupon Code
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Enter coupon"
          className="min-w-0 flex-1 border border-[#D8D0C8] bg-white px-4 py-3 text-sm outline-none focus:border-[#72383D]"
        />

        <button
          type="button"
          onClick={handleApply}
          className="bg-[#322D29] px-5 py-3 text-xs font-semibold uppercase tracking-[1px] text-white transition hover:bg-[#72383D]"
        >
          Apply
        </button>
      </div>
    </div>
  );
}