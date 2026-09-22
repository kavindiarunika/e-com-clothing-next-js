"use client";

import CouponBox from "./CouponBox";
import Link from "next/link";

export default function CartSummary({
  subtotal,
  discount,
  shipping,
  total,
  onApplyCoupon,
}) {
  return (
    <div className="bg-white p-6 md:p-8">
      <h2 className="font-serif text-2xl text-[#322D29]">
        Cart Summary
      </h2>

      <div className="mt-6 space-y-4 text-sm">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span className="text-[#6B625C]">Subtotal</span>
          <span className="font-medium text-[#322D29]">
            Rs. {subtotal.toLocaleString()}
          </span>
        </div>

        {/* Discount */}
        <div className="flex justify-between">
          <span className="text-[#6B625C]">Discount</span>
          <span className="font-medium text-[#72383D]">
            - Rs. {discount.toLocaleString()}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between">
          <span className="text-[#6B625C]">Shipping</span>
          <span className="font-medium text-[#322D29]">
            Rs. {shipping.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="my-6 border-t border-[#D8D0C8]" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-[1px] text-[#322D29]">
          Total
        </span>

        <span className="text-xl font-semibold text-[#72383D]">
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
  className="mt-7 block w-full bg-[#72383D] px-6 py-4 text-center text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#5E2E33]"
>
  Proceed to Checkout
</Link>
    </div>
  );
}