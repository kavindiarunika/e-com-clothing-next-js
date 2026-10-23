"use client";

import Link from "next/link";

function PriceRow({ label, value, valueClassName = "text-[#292524]" }) {
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
  productDiscount,
  couponDiscount,
  selectedCoupon,
  coupons = [],
  selectedCouponId,
  onSelectCoupon,
  isLoadingCoupons,
  couponLoadError,
  shipping,
  total,
  selectedCount,
  selectedItems = [],
}) {
  return (
    <div className="bg-white p-5 md:p-7 lg:p-8">
      <h2 className="font-serif text-2xl text-[#292524] md:text-[2rem]">
        Cart Summary
      </h2>

      <p className="mt-2 text-[10px] uppercase tracking-[2px] text-[#6B625C] md:text-[11px]">
        {selectedCount} item selected
      </p>

      <div className="mt-6 space-y-3 text-sm md:space-y-4">
        <PriceRow label="Subtotal" value={`Rs. ${subtotal.toLocaleString()}`} />

        {productDiscount > 0 && (
          <PriceRow
            label="Product discount"
            value={`- Rs. ${productDiscount.toLocaleString()}`}
            valueClassName="text-[#C08081]"
          />
        )}

        {couponDiscount > 0 && selectedCoupon && (
          <PriceRow
            label={`Coupon (${selectedCoupon.code})`}
            value={`- Rs. ${couponDiscount.toLocaleString()}`}
            valueClassName="text-[#C08081]"
          />
        )}

        <PriceRow label="Shipping" value={`Rs. ${shipping.toLocaleString()}`} />
      </div>

      <div className="my-6 border-t border-[#E7DEDC]" />

      {/* Total */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold uppercase tracking-[1px] text-[#292524]">
          Total
        </span>

        <span className="shrink-0 text-right text-xl font-semibold tabular-nums text-[#C08081]">
          Rs. {total.toLocaleString()}
        </span>
      </div>

      {/* Available coupons */}
      <section className="mt-7 border-t border-[#E7DEDC] pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#292524]">
          Coupons you can use
        </h3>

        {isLoadingCoupons ? (
          <p className="mt-3 text-sm text-[#6B625C]">
            Checking available coupons...
          </p>
        ) : couponLoadError ? (
          <p role="alert" className="mt-3 text-sm text-[#C08081]">
            {couponLoadError}
          </p>
        ) : coupons.length > 0 ? (
          <div className="mt-3 space-y-3">
            {coupons.map((coupon) => (
              <button
                type="button"
                key={coupon.coupon_id}
                aria-label={`Apply coupon ${coupon.code}`}
                aria-pressed={
                  String(selectedCouponId) === String(coupon.coupon_id)
                }
                onClick={() => onSelectCoupon(coupon.coupon_id)}
                className={`checkout-coupon-ticket w-full cursor-pointer text-left transition ${
                  String(selectedCouponId) === String(coupon.coupon_id)
                    ? "ring-2 ring-[#292524] ring-offset-2"
                    : "hover:brightness-95"
                }`}
              >
                <div className="checkout-coupon-discount">
                  <span>Save</span>
                  <strong>
                    {coupon.discount_type === "percentage"
                      ? `${Number(coupon.discount_value)}%`
                      : `Rs. ${Number(coupon.discount_value).toLocaleString()}`}
                  </strong>
                  <span>Off</span>
                </div>

                <div className="checkout-coupon-details">
                  <span className="checkout-coupon-label">Coupon</span>
                  <strong className="checkout-coupon-code">{coupon.code}</strong>
                  <span className="checkout-coupon-title">
                    {coupon.title || coupon.description || "Special offer"}
                  </span>
                  <span className="checkout-coupon-select-hint">
                    {String(selectedCouponId) === String(coupon.coupon_id)
                      ? "Selected - click to remove"
                      : "Tap to apply"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#6B625C]">
            {selectedCount > 0
              ? "No active coupons match the selected items."
              : "Select items to see matching coupons."}
          </p>
        )}
      </section>

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
          if (selectedCoupon) {
            sessionStorage.setItem(
              "velora-selected-coupon",
              String(selectedCoupon.coupon_id)
            );
          } else {
            sessionStorage.removeItem("velora-selected-coupon");
          }
        }}
        className={`mt-7 block w-full px-6 py-4 text-center text-xs font-semibold uppercase tracking-[1.5px] text-white transition ${
          selectedItems.length === 0
            ? "cursor-not-allowed bg-[#8B817A]"
            : "bg-[#C08081] hover:bg-[#A96870]"
        }`}
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}