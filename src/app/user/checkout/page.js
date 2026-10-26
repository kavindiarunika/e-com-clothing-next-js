"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react";

function getCartItemKey(item) {
  const colorName = typeof item.color === "object"
    ? item.color?.name || ""
    : item.color || "";

  return `${item.productId}-${item.size}-${colorName}`;
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [couponLoadError, setCouponLoadError] = useState("");
  const [isBuyNowCheckout, setIsBuyNowCheckout] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [profileError, setProfileError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
  });

  // Only Cash on Delivery
  const [paymentMethod, setPaymentMethod] =
    useState("Cash on Delivery");

  const shippingCost = 500;

  // Load the cart and saved profile before allowing checkout edits.
  useEffect(() => {
    const controller = new AbortController();

    async function loadCheckout() {
      let savedCart = [];
      let buyNowItem = null;
      try {
        const storedBuyNowItem = sessionStorage.getItem("velora-buy-now-item");
        if (storedBuyNowItem) {
          const parsedItem = JSON.parse(storedBuyNowItem);
          if (
            !parsedItem ||
            typeof parsedItem !== "object" ||
            !Number.isInteger(Number(parsedItem.productId)) ||
            Number(parsedItem.productId) <= 0 ||
            !Number.isInteger(Number(parsedItem.quantity)) ||
            Number(parsedItem.quantity) <= 0
          ) {
            throw new Error("The Buy Now item is invalid. Please select the product again.");
          }
          buyNowItem = parsedItem;
        } else {
          const selectedCheckoutItems = sessionStorage.getItem("velora-checkout-items");
          savedCart = selectedCheckoutItems
            ? JSON.parse(selectedCheckoutItems)
            : JSON.parse(localStorage.getItem("velora-cart") || "[]");
        }
      } catch (error) {
        console.error("Unable to load checkout items:", error);
        setOrderError("Unable to load your checkout items. Please return to your cart and try again.");
        setIsLoading(false);
        return;
      }

      const isBuyNow = buyNowItem && typeof buyNowItem === "object";
      const checkoutCart = isBuyNow
        ? [buyNowItem]
        : Array.isArray(savedCart)
          ? savedCart
          : [];
      setIsBuyNowCheckout(Boolean(isBuyNow));
      setSelectedCouponId(
        isBuyNow
          ? null
          : sessionStorage.getItem("velora-selected-coupon")
      );
      setCart(checkoutCart);
      const guestCheckoutRequested =
        new URLSearchParams(window.location.search).get("guest") === "true";
      setIsGuestCheckout(guestCheckoutRequested);

      if (checkoutCart.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/profile", {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("velora-user-session");
          if (!guestCheckoutRequested) {
            router.replace(
              `/user/login?next=${encodeURIComponent("/user/checkout")}`
            );
          }
          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load your saved profile.");
        }

        const profile = result.data;
        setIsGuestCheckout(false);
        setFormData((current) => ({
          ...current,
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          phone: profile.phone || "",
          address: [profile.address_line1, profile.address_line2]
            .filter(Boolean)
            .join("\n"),
          city: profile.city || "",
          district: profile.district || "",
          postalCode: profile.postal_code || "",
        }));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Checkout profile error:", error);
          setProfileError(
            error.message || "Unable to load your saved profile. You can enter your shipping details manually."
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadCheckout();
    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCoupons() {
      try {
        const response = await fetch("/api/user/coupons", {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load available coupons.");
        }

        setCoupons(Array.isArray(result.coupons) ? result.coupons : []);
        setCouponLoadError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Checkout coupons error:", error);
          setCouponLoadError(
            error.message || "Unable to load available coupons."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingCoupons(false);
        }
      }
    }

    void loadCoupons();
    return () => controller.abort();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Calculate subtotal
  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const orderTotalBeforeCoupon =
    subtotal + (cart.length > 0 ? shippingCost : 0);
  const eligibleCoupons = coupons.filter(
    (coupon) =>
      orderTotalBeforeCoupon >=
      (Number(coupon.minimum_order_amount) || 0)
  );
  const selectedCoupon = eligibleCoupons.find(
    (coupon) => String(coupon.coupon_id) === String(selectedCouponId)
  ) || null;
  const couponBase = subtotal;
  const rawCouponDiscount = selectedCoupon
    ? selectedCoupon.discount_type === "percentage"
      ? couponBase * (Number(selectedCoupon.discount_value) || 0) / 100
      : Number(selectedCoupon.discount_value) || 0
    : 0;
  const maximumCouponDiscount = Number(selectedCoupon?.maximum_discount) || 0;
  const couponDiscount = Math.round(
    Math.min(
      couponBase,
      maximumCouponDiscount > 0
        ? Math.min(rawCouponDiscount, maximumCouponDiscount)
        : rawCouponDiscount
    ) * 100
  ) / 100;
  const total = Math.max(0, orderTotalBeforeCoupon - couponDiscount);

  // Place order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError("");

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (
      !formData.firstName ||
      !formData.phone ||
      !formData.address ||
      (!isGuestCheckout &&
        (!formData.lastName ||
          !formData.city ||
          !formData.district ||
          !formData.postalCode))
    ) {
      alert(
        isGuestCheckout
          ? "Please fill in your first name, phone, and address."
          : "Please fill in all shipping details."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (isGuestCheckout) {
        const guestResponse = await fetch("/api/auth/guest-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            district: formData.district,
            postalCode: formData.postalCode,
          }),
        });
        const guestResult = await guestResponse.json();
        if (!guestResponse.ok || !guestResult.success) {
          throw new Error(
            guestResult.message || "Unable to start guest checkout."
          );
        }
      }

      const response = await fetch("/api/user/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          shippingAddress: formData,
          couponId: selectedCoupon?.coupon_id || null,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to place your order.");
      }

      if (isBuyNowCheckout) {
        sessionStorage.removeItem("velora-buy-now-item");
      } else {
        try {
          const currentCart = JSON.parse(localStorage.getItem("velora-cart") || "[]");
          const orderedItemKeys = new Set(cart.map(getCartItemKey));
          const remainingCart = Array.isArray(currentCart)
            ? currentCart.filter((item) => !orderedItemKeys.has(getCartItemKey(item)))
            : [];

          localStorage.setItem("velora-cart", JSON.stringify(remainingCart));
        } catch (storageError) {
          console.error("Unable to update cart after order:", storageError);
          localStorage.removeItem("velora-cart");
        }

        sessionStorage.removeItem("velora-checkout-items");
        window.dispatchEvent(new Event("velora-cart-updated"));
      }
      sessionStorage.removeItem("velora-selected-coupon");
      alert(
        `Order placed successfully!\n\nOrder ID: ${result.data.order_id}\nPayment: Cash on Delivery`
      );
      router.push("/user");
    } catch (error) {
      setOrderError(error.message || "Unable to place your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FFFFFF] px-6 py-20">
        <div className="mx-auto max-w-300 text-center">
          <p className="text-sm text-[#6B625C]">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  // Empty cart
  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#FFFFFF] px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <ShoppingBag
            size={50}
            className="mx-auto text-[#e63e62]"
          />

          <h1 className="mt-6 font-serif text-4xl text-[#292524]">
            Your Cart Is Empty
          </h1>

          <p className="mt-4 text-sm text-[#6B625C]">
            Add some products to your cart before checking out.
          </p>

          <Link
            href="/user/shop"
            className="mt-8 inline-block bg-[#e63e62] px-8 py-4 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#A96870]"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      {/* Header */}
      <section className="border-b border-[#E7DEDC] bg-[#FFFFFF]">
        <div className="mx-auto w-[92%] max-w-300 py-10 md:py-14">
          <Link
            href="/user/cart"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[1.5px] text-[#6B625C] transition hover:text-[#e63e62]"
          >
            <ArrowLeft size={15} />
            Back to Cart
          </Link>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[3px] text-[#e63e62]">
            Velora
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#292524] md:text-5xl">
            Checkout
          </h1>

          <p className="mt-3 text-sm text-[#6B625C]">
            Complete your order with Cash on Delivery.
          </p>
        </div>
      </section>

      {/* Checkout */}
      <form
        onSubmit={handlePlaceOrder}
        className="mx-auto w-[92%] max-w-300 py-10 md:py-16"
      >
        {orderError && (
          <p
            role="alert"
            className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {orderError}
          </p>
        )}
        {profileError && (
          <p
            role="status"
            className="mb-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            {profileError}
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          {/* LEFT SIDE */}
          <div className="space-y-8">
            {/* 01 Shipping Address */}
            <section className="bg-white p-6 md:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[2px] text-[#e63e62]">
                  01
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#292524]">
                  Shipping Address
                </h2>

                <p className="mt-2 text-sm text-[#6B625C]">
                  Enter the address where you want your order delivered.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#292524]"
                  >
                    First Name
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className="w-full border border-[#E7DEDC] bg-[#FAF6F5] px-4 py-3 text-sm text-[#292524] outline-none transition focus:border-[#e63e62]"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#292524]"
                  >
                    Last Name
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className="w-full border border-[#E7DEDC] bg-[#FAF6F5] px-4 py-3 text-sm text-[#292524] outline-none transition focus:border-[#e63e62]"
                    required={!isGuestCheckout}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#292524]"
                  >
                    Phone
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="07XXXXXXXX"
                    className="w-full border border-[#E7DEDC] bg-[#FAF6F5] px-4 py-3 text-sm text-[#292524] outline-none transition focus:border-[#e63e62]"
                    required
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label
                    htmlFor="postalCode"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#292524]"
                  >
                    Postal Code
                  </label>

                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Postal code"
                    className="w-full border border-[#E7DEDC] bg-[#FAF6F5] px-4 py-3 text-sm text-[#292524] outline-none transition focus:border-[#e63e62]"
                    required={!isGuestCheckout}
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#292524]"
                  >
                    Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    rows={4}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House number, street, area..."
                    className="w-full resize-none border border-[#E7DEDC] bg-[#FAF6F5] px-4 py-3 text-sm text-[#292524] outline-none transition focus:border-[#e63e62]"
                    required
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#292524]"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full border border-[#E7DEDC] bg-[#FAF6F5] px-4 py-3 text-sm text-[#292524] outline-none transition focus:border-[#e63e62]"
                    required={!isGuestCheckout}
                  />
                </div>

                {/* District */}
                <div>
                  <label
                    htmlFor="district"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#292524]"
                  >
                    District
                  </label>

                  <input
                    id="district"
                    name="district"
                    type="text"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Enter district"
                    className="w-full border border-[#E7DEDC] bg-[#FAF6F5] px-4 py-3 text-sm text-[#292524] outline-none transition focus:border-[#e63e62]"
                    required={!isGuestCheckout}
                  />
                </div>
              </div>
            </section>

            {/* 02 Delivery */}
            <section className="bg-white p-6 md:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[2px] text-[#e63e62]">
                  02
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#292524]">
                  Delivery
                </h2>
              </div>

              <div className="border border-[#e63e62] bg-[#FAF6F5] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#292524]">
                      Standard Delivery
                    </p>

                    <p className="mt-1 text-xs text-[#6B625C]">
                      Delivery within 3–5 working days.
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-[#e63e62]">
                    Rs. {shippingCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* 03 Payment */}
            <section className="bg-white p-6 md:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[2px] text-[#e63e62]">
                  03
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#292524]">
                  Payment
                </h2>
              </div>

              {/* ONLY CASH ON DELIVERY */}
              <div className="border border-[#e63e62] bg-[#FAF6F5] p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={
                      paymentMethod === "Cash on Delivery"
                    }
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                    className="h-4 w-4 accent-[#e63e62]"
                  />

                  <div>
                    <p className="text-sm font-medium text-[#292524]">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs text-[#6B625C]">
                      Pay when your order is delivered.
                    </p>
                  </div>

                  <CheckCircle
                    size={18}
                    className="ml-auto text-[#e63e62]"
                  />
                </label>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE */}
          <div>
            <section className="sticky top-24 bg-white p-6 md:p-8">
              {/* Order Summary */}
              <div className="border-b border-[#E7DEDC] pb-6">
                <p className="text-xs font-semibold uppercase tracking-[2px] text-[#e63e62]">
                  04
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#292524]">
                  Order Summary
                </h2>
              </div>

              {/* Products */}
              <div className="mt-6 space-y-5">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-4"
                  >
                    {/* Image */}
                    <div className="h-20 w-16 shrink-0 overflow-hidden bg-[#FFFFFF]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[#6B625C]">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#292524]">
                        {item.name}
                      </p>

                      <div className="mt-1 space-y-1 text-xs text-[#6B625C]">
                        <p>
                          Size: {item.size}
                        </p>

                        <p>
                          Color: {item.color}
                        </p>

                        <p>
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#e63e62]">
                        Rs.{" "}
                        {(
                          Number(item.price) *
                          Number(item.quantity)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="mt-8 space-y-4 border-t border-[#E7DEDC] pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B625C]">
                    Subtotal
                  </span>

                  <span className="font-medium text-[#292524]">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B625C]">
                    Delivery
                  </span>

                  <span className="font-medium text-[#292524]">
                    Rs. {shippingCost.toLocaleString()}
                  </span>
                </div>

                {couponDiscount > 0 && selectedCoupon && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6B625C]">
                      Coupon ({selectedCoupon.code})
                    </span>

                    <span className="font-medium text-[#e63e62]">
                      - Rs. {couponDiscount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="mt-5 flex items-center justify-between border-t border-[#E7DEDC] pt-5">
                <span className="text-base font-semibold uppercase tracking-[1px] text-[#292524]">
                  Total
                </span>

                <span className="text-2xl font-semibold text-[#e63e62]">
                  Rs. {total.toLocaleString()}
                </span>
              </div>

              {/* Eligible Coupons */}
              <section className="mt-6 border-t border-[#E7DEDC] pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#292524]">
                  Coupons you can use
                </h3>

                {isLoadingCoupons ? (
                  <p className="mt-3 text-sm text-[#6B625C]">
                    Checking available coupons...
                  </p>
                ) : couponLoadError ? (
                  <p role="alert" className="mt-3 text-sm text-[#e63e62]">
                    {couponLoadError}
                  </p>
                ) : eligibleCoupons.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {eligibleCoupons.map((coupon) => (
                      <button
                        type="button"
                        key={coupon.coupon_id}
                        aria-label={`Apply coupon ${coupon.code}`}
                        aria-pressed={
                          String(selectedCouponId) === String(coupon.coupon_id)
                        }
                        onClick={() =>
                          setSelectedCouponId((currentId) =>
                            String(currentId) === String(coupon.coupon_id)
                              ? null
                              : coupon.coupon_id
                          )
                        }
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
                          <span className="checkout-coupon-label">
                            Coupon
                          </span>
                          <strong className="checkout-coupon-code">
                            {coupon.code}
                          </strong>
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
                    No active coupons match this order total.
                  </p>
                )}
              </section>

              {/* Payment Info */}
              <div className="mt-6 bg-[#FAF6F5] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-[#e63e62]"
                  />

                  <div>
                    <p className="text-sm font-medium text-[#292524]">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#6B625C]">
                      You will pay Rs.{" "}
                      {total.toLocaleString()} when your
                      order is delivered.
                    </p>
                  </div>
                </div>
              </div>

              {/* Place Order */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-7 w-full bg-[#e63e62] px-6 py-4 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#A96870] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </button>

              {/* Secure Checkout */}
              <p className="mt-4 text-center text-[11px] leading-5 text-[#6B625C]">
                By placing your order, you agree to Velora&apos;s
                terms and conditions.
              </p>
            </section>
          </div>
        </div>
      </form>
    </main>
  );
}