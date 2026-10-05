"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import CartItem from "@/components/user/cart/CartItem";
import CartSummary from "@/components/user/cart/CartSummary";

function getColorName(color) {
  if (!color) return "";
  return typeof color === "object" ? color.name || "" : color;
}

function getCartItemKey(item) {
  return `${item.productId}-${item.size}-${getColorName(item.color)}`;
}

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const hasInitializedSelection = useRef(false);

  // Check whether two cart items are the same
  const isSameCartItem = (cartItem, item) => {
    return (
      cartItem.productId === item.productId &&
      cartItem.size === item.size &&
      getColorName(cartItem.color) === getColorName(item.color)
    );
  };

  // Sync cart from localStorage
  const syncCartFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const savedCart = JSON.parse(
        localStorage.getItem("velora-cart") || "[]"
      );

      const nextCart = Array.isArray(savedCart) ? savedCart : [];
      setCart(nextCart);

      if (!hasInitializedSelection.current) {
        setSelectedItems(nextCart.map((item) => getCartItemKey(item)));
        hasInitializedSelection.current = true;
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCart([]);
    }

    setHasLoadedCart(true);
  }, []);

  // Load cart
  useEffect(() => {
    const handleCartUpdate = () => {
      syncCartFromStorage();
    };

    window.addEventListener(
      "velora-cart-updated",
      handleCartUpdate
    );

    const timeoutId = window.setTimeout(() => {
      syncCartFromStorage();

      const message = sessionStorage.getItem("velora-cart-message");
      if (message) {
        setCartMessage(message);
        sessionStorage.removeItem("velora-cart-message");
      }
    });

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener(
        "velora-cart-updated",
        handleCartUpdate
      );
    };
  }, [syncCartFromStorage]);

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
          const currentQuantity = Math.max(
            1,
            Number(cartItem.quantity) || 1
          );
          const stockLimit =
            cartItem.stock == null
              ? Number.POSITIVE_INFINITY
              : Number(cartItem.stock);

          if (stockLimit <= currentQuantity) {
            return cartItem;
          }

          return {
            ...cartItem,
            quantity: Math.min(currentQuantity + 1, stockLimit),
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
    const removedKey = getCartItemKey(item);
    setCart((currentCart) =>
      currentCart.filter(
        (cartItem) => !isSameCartItem(cartItem, item)
      )
    );
    setSelectedItems((current) =>
      current.filter((key) => key !== removedKey)
    );
  };

  const selectedCart = useMemo(() => {
    return cart.filter((item) =>
      selectedItems.includes(getCartItemKey(item))
    );
  }, [cart, selectedItems]);

  const selectedCount = useMemo(() => {
    return selectedCart.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  }, [selectedCart]);

  // Subtotal is calculated before product and coupon discounts.
  const subtotal = useMemo(() => {
    return selectedCart.reduce(
      (total, item) =>
        total +
        Number(item.originalPrice ?? item.price ?? 0) *
          Number(item.quantity || 0),
      0
    );
  }, [selectedCart]);

  const productDiscount = useMemo(
    () =>
      selectedCart.reduce(
        (total, item) =>
          total +
          Math.max(
            0,
            Number(item.originalPrice ?? item.price ?? 0) -
              Number(item.price || 0)
          ) *
            Number(item.quantity || 0),
        0
      ),
    [selectedCart]
  );

  const [couponApplied, setCouponApplied] = useState(false);
  const couponDiscount = couponApplied
    ? Math.round((subtotal - productDiscount) * 0.1)
    : 0;
  const discount = productDiscount + couponDiscount;

  // Shipping is charged once whenever at least one item is selected.
  const shipping = selectedCart.length > 0 ? 500 : 0;

  const total = Math.max(0, subtotal - discount + shipping);

  const allSelected =
    cart.length > 0 &&
    cart.every((item) =>
      selectedItems.includes(getCartItemKey(item))
    );

  const toggleSelectItem = (item) => {
    const key = getCartItemKey(item);

    setSelectedItems((current) => {
      if (current.includes(key)) {
        return current.filter((value) => value !== key);
      }

      return [...current, key];
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
      return;
    }

    setSelectedItems(cart.map((item) => getCartItemKey(item)));
  };

  // Coupon
  const applyCoupon = (coupon) => {
    const code = coupon.trim().toUpperCase();

    if (code === "VELORA10") {
      setCouponApplied(true);
      alert("Coupon applied! 10% discount.");
    } else if (code === "") {
      setCouponApplied(false);
    } else {
      setCouponApplied(false);

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
      <div className="mx-auto w-[92%] max-w-[1280px]">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[3px] text-[#72383D]">
            Velora
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#322D29] md:text-5xl">
            Shopping Cart
          </h1>

          {cartMessage && (
            <p
              role="status"
              className="mt-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              {cartMessage}
            </p>
          )}
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-[1.8fr_0.9fr] lg:items-start lg:gap-12">

          {/* Cart Items */}
          <section className="bg-white px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between border-b border-[#D8D0C8] py-3 text-[10px] font-semibold uppercase tracking-[1.8px] text-[#6B625C] md:py-4 md:text-[11px]">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 accent-[#72383D]"
                />
                <span>Select all</span>
              </label>

              <span>{selectedCount} item selected</span>
            </div>

            <div className="max-h-[72vh] overflow-y-auto pr-1 md:pr-2">
              {/* Desktop Header */}
              <div className="hidden border-b border-[#D8D0C8] py-4 text-[10px] font-semibold uppercase tracking-[2px] text-[#6B625C] sm:grid sm:grid-cols-[minmax(0,1fr)_110px_160px] md:text-[11px]">
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
                  isSelected={selectedItems.includes(getCartItemKey(item))}
                  onToggleSelect={toggleSelectItem}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

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
          <section className="lg:sticky lg:top-24">
            <CartSummary
              subtotal={subtotal}
              discount={discount}
              shipping={shipping}
              total={total}
              selectedCount={selectedCount}
              onApplyCoupon={applyCoupon}
            />
          </section>

        </div>
      </div>
    </main>
  );
}