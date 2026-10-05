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
  const [isBuyNowCheckout, setIsBuyNowCheckout] = useState(false);
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
      setCart(checkoutCart);

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
          router.replace(
            `/user/login?next=${encodeURIComponent("/user/checkout")}`
          );
          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load your saved profile.");
        }

        const profile = result.data;
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

  const total = subtotal + (cart.length > 0 ? shippingCost : 0);

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
      !formData.lastName ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.district ||
      !formData.postalCode
    ) {
      alert("Please fill in all shipping details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/user/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          shippingAddress: formData,
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
      <main className="min-h-screen bg-[#EFE9E1] px-6 py-20">
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
      <main className="min-h-screen bg-[#EFE9E1] px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <ShoppingBag
            size={50}
            className="mx-auto text-[#72383D]"
          />

          <h1 className="mt-6 font-serif text-4xl text-[#322D29]">
            Your Cart Is Empty
          </h1>

          <p className="mt-4 text-sm text-[#6B625C]">
            Add some products to your cart before checking out.
          </p>

          <Link
            href="/user/shop"
            className="mt-8 inline-block bg-[#72383D] px-8 py-4 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#5E2E33]"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EFE9E1]">
      {/* Header */}
      <section className="border-b border-[#D8D0C8] bg-[#EFE9E1]">
        <div className="mx-auto w-[92%] max-w-300 py-10 md:py-14">
          <Link
            href="/user/cart"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[1.5px] text-[#6B625C] transition hover:text-[#72383D]"
          >
            <ArrowLeft size={15} />
            Back to Cart
          </Link>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[3px] text-[#72383D]">
            Velora
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#322D29] md:text-5xl">
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
                <p className="text-xs font-semibold uppercase tracking-[2px] text-[#72383D]">
                  01
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#322D29]">
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
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#322D29]"
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
                    className="w-full border border-[#D8D0C8] bg-[#FAF8F5] px-4 py-3 text-sm text-[#322D29] outline-none transition focus:border-[#72383D]"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#322D29]"
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
                    className="w-full border border-[#D8D0C8] bg-[#FAF8F5] px-4 py-3 text-sm text-[#322D29] outline-none transition focus:border-[#72383D]"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#322D29]"
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
                    className="w-full border border-[#D8D0C8] bg-[#FAF8F5] px-4 py-3 text-sm text-[#322D29] outline-none transition focus:border-[#72383D]"
                    required
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label
                    htmlFor="postalCode"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#322D29]"
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
                    className="w-full border border-[#D8D0C8] bg-[#FAF8F5] px-4 py-3 text-sm text-[#322D29] outline-none transition focus:border-[#72383D]"
                    required
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#322D29]"
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
                    className="w-full resize-none border border-[#D8D0C8] bg-[#FAF8F5] px-4 py-3 text-sm text-[#322D29] outline-none transition focus:border-[#72383D]"
                    required
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#322D29]"
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
                    className="w-full border border-[#D8D0C8] bg-[#FAF8F5] px-4 py-3 text-sm text-[#322D29] outline-none transition focus:border-[#72383D]"
                    required
                  />
                </div>

                {/* District */}
                <div>
                  <label
                    htmlFor="district"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#322D29]"
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
                    className="w-full border border-[#D8D0C8] bg-[#FAF8F5] px-4 py-3 text-sm text-[#322D29] outline-none transition focus:border-[#72383D]"
                    required
                  />
                </div>
              </div>
            </section>

            {/* 02 Delivery */}
            <section className="bg-white p-6 md:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[2px] text-[#72383D]">
                  02
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#322D29]">
                  Delivery
                </h2>
              </div>

              <div className="border border-[#72383D] bg-[#FAF8F5] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#322D29]">
                      Standard Delivery
                    </p>

                    <p className="mt-1 text-xs text-[#6B625C]">
                      Delivery within 3–5 working days.
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-[#72383D]">
                    Rs. {shippingCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* 03 Payment */}
            <section className="bg-white p-6 md:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[2px] text-[#72383D]">
                  03
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#322D29]">
                  Payment
                </h2>
              </div>

              {/* ONLY CASH ON DELIVERY */}
              <div className="border border-[#72383D] bg-[#FAF8F5] p-4">
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
                    className="h-4 w-4 accent-[#72383D]"
                  />

                  <div>
                    <p className="text-sm font-medium text-[#322D29]">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs text-[#6B625C]">
                      Pay when your order is delivered.
                    </p>
                  </div>

                  <CheckCircle
                    size={18}
                    className="ml-auto text-[#72383D]"
                  />
                </label>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE */}
          <div>
            <section className="sticky top-24 bg-white p-6 md:p-8">
              {/* Order Summary */}
              <div className="border-b border-[#D8D0C8] pb-6">
                <p className="text-xs font-semibold uppercase tracking-[2px] text-[#72383D]">
                  04
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#322D29]">
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
                    <div className="h-20 w-16 shrink-0 overflow-hidden bg-[#EFE9E1]">
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
                      <p className="text-sm font-medium text-[#322D29]">
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
                      <p className="text-sm font-medium text-[#72383D]">
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
              <div className="mt-8 space-y-4 border-t border-[#D8D0C8] pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B625C]">
                    Subtotal
                  </span>

                  <span className="font-medium text-[#322D29]">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B625C]">
                    Delivery
                  </span>

                  <span className="font-medium text-[#322D29]">
                    Rs. {shippingCost.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-5 flex items-center justify-between border-t border-[#D8D0C8] pt-5">
                <span className="text-base font-semibold uppercase tracking-[1px] text-[#322D29]">
                  Total
                </span>

                <span className="text-2xl font-semibold text-[#72383D]">
                  Rs. {total.toLocaleString()}
                </span>
              </div>

              {/* Payment Info */}
              <div className="mt-6 bg-[#FAF8F5] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-[#72383D]"
                  />

                  <div>
                    <p className="text-sm font-medium text-[#322D29]">
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
                className="mt-7 w-full bg-[#72383D] px-6 py-4 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#5E2E33] disabled:cursor-not-allowed disabled:opacity-60"
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