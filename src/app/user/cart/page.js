"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import CartItem from "@/components/user/cart/CartItem";
import CartSummary from "@/components/user/cart/CartSummary";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);

  // Get color name safely
  const getColorName = (color) => {
    if (!color) return "";

    if (typeof color === "object") {
      return color.name || "";
    }

    return color;
  };

  // Create a unique cart item key
  const getCartItemKey = (item) => {
    const colorName = getColorName(item.color);

    return `${item.productId}-${item.size}-${colorName}`;
  };

  // Check whether two cart items are the same
  const isSameCartItem = (cartItem, item) => {
    return (
      cartItem.productId === item.productId &&
      cartItem.size === item.size &&
      getColorName(cartItem.color) === getColorName(item.color)
    );
  };

  // Sync cart from localStorage
  const syncCartFromStorage = () => {
    if (typeof window === "undefined") return;

    try {
      const savedCart = JSON.parse(
        localStorage.getItem("velora-cart") || "[]"
      );

      setCart(Array.isArray(savedCart) ? savedCart : []);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCart([]);
    }

    setHasLoadedCart(true);
  };

  // Load cart
  useEffect(() => {
    syncCartFromStorage();

    const handleCartUpdate = () => {
      syncCartFromStorage();
    };

    window.addEventListener(
      "velora-cart-updated",
      handleCartUpdate
    );

    return () => {
      window.removeEventListener(
        "velora-cart-updated",
        handleCartUpdate
      );
    };
  }, []);

  // Save cart
  useEffect(() => {
    if (!hasLoadedCart || typeof window === "undefined") {
      return;
    }

    localStorage.setItem(
      "velora-cart",
      JSON.stringify(cart)
    );
  }, [cart, hasLoadedCart]);

  // Increase quantity
  const increaseQuantity = (item) => {
    setCart((currentCart) =>
      currentCart.map((cartItem) => {
        if (isSameCartItem(cartItem, item)) {
          return {
            ...cartItem,
            quantity: Math.min(
              Number(cartItem.quantity || 1) + 1,
              Number(cartItem.stock || 1)
            ),
          };
        }

        return cartItem;
      })
    );
  };

  // Decrease quantity
  const decreaseQuantity = (item) => {
    setCart((currentCart) =>
      currentCart.map((cartItem) => {
        if (isSameCartItem(cartItem, item)) {
          return {
            ...cartItem,
            quantity: Math.max(
              Number(cartItem.quantity || 1) - 1,
              1
            ),
          };
        }

        return cartItem;
      })
    );
  };

  // Remove product
  const removeItem = (item) => {
    setCart((currentCart) =>
      currentCart.filter(
        (cartItem) => !isSameCartItem(cartItem, item)
      )
    );
  };

  // Subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return (
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0)
      );
    }, 0);
  }, [cart]);

  // Shipping
  const shipping = subtotal > 0 ? 500 : 0;

  // Total
  const total = Math.max(
    0,
    subtotal - couponDiscount + shipping
  );

  // Coupon
  const applyCoupon = (coupon) => {
    const code = coupon.trim().toUpperCase();

    if (code === "VELORA10") {
      const discount = Math.round(subtotal * 0.1);

      setCouponDiscount(discount);

      alert("Coupon applied! 10% discount.");
    } else if (code === "") {
      setCouponDiscount(0);
    } else {
      setCouponDiscount(0);

      alert("Invalid coupon code.");
    }
  };

  // Empty cart
  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#EFE9E1] py-16">
        <div className="mx-auto w-[92%] max-w-175 text-center">
          <ShoppingBag
            size={50}
            className="mx-auto text-[#AC9C8D]"
          />

          <p className="mt-6 text-xs uppercase tracking-[3px] text-[#72383D]">
            Velora
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#322D29]">
            Your Cart is Empty
          </h1>

          <p className="mt-4 text-sm text-[#6B625C]">
            Add some beautiful pieces to your cart and come back here.
          </p>

          <Link
            href="/user/shop"
            className="mt-8 inline-flex items-center gap-2 bg-[#72383D] px-7 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white hover:bg-[#5E2E33]"
          >
            <ArrowLeft size={15} />
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EFE9E1] py-10 md:py-16">
      <div className="mx-auto w-[92%] max-w-300">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[3px] text-[#72383D]">
            Velora
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#322D29] md:text-5xl">
            Shopping Cart
          </h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">

          {/* Cart Items */}
          <section className="bg-white px-5 md:px-7">

            {/* Desktop Header */}
            <div className="hidden border-b border-[#D8D0C8] py-4 text-xs font-semibold uppercase tracking-[1px] text-[#6B625C] sm:grid sm:grid-cols-[1fr_100px_120px]">
              <span>Product</span>

              <span className="text-center">
                Qty
              </span>

              <span className="text-right">
                Price
              </span>
            </div>

            {/* Cart Items */}
            {cart.map((item) => (
              <CartItem
                key={getCartItemKey(item)}
                item={item}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeItem}
              />
            ))}

            {/* Continue Shopping */}
            <Link
              href="/user/shop"
              className="my-6 inline-flex items-center gap-2 text-xs uppercase tracking-[1px] text-[#72383D] hover:underline"
            >
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>
          </section>

          {/* Summary */}
          <section>
            <CartSummary
              subtotal={subtotal}
              discount={couponDiscount}
              shipping={shipping}
              total={total}
              onApplyCoupon={applyCoupon}
            />
          </section>

        </div>
      </div>
    </main>
  );
}