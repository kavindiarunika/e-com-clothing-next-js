"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProductCard({
  product,
  showSoldOut = false,
  onWishlistChange,
}) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);

  const currentRating = Number(
    (Number(product.rating) || 0).toFixed(1)
  );
  const reviewCount =
    Number(product.reviews ?? product.reviewCount ?? product.review_count) || 0;

  // ---------------------------------------
  // Product Image
  // ---------------------------------------
  const fallbackImage = "/images/products/shirt1.webp";
  const productImage =
    product.image ||
    product.images?.[0] ||
    fallbackImage;

  // ---------------------------------------
  // Discount
  // ---------------------------------------
  const originalPrice = Number(product.price) || 0;
  const hasDiscount =
    Number(product.discount) > 0 &&
    originalPrice > 0;

  const discountedPrice = hasDiscount
    ? originalPrice -
      (originalPrice * Number(product.discount)) / 100
    : originalPrice;

  // ---------------------------------------
  // SOLD OUT
  // ---------------------------------------
  const variantStock = (product.variants || []).reduce(
    (total, variant) => total + (Number(variant.stock) || 0),
    0
  );
  const availableStock = variantStock > 0
    ? variantStock
    : Number(product.stock ?? product.qty ?? 0);
  const isSoldOut = availableStock <= 0;

  // ---------------------------------------
  // Load Wishlist
  // ---------------------------------------
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      let savedWishlist = [];
      try {
        savedWishlist = JSON.parse(
          localStorage.getItem("velora-wishlist") || "[]"
        );
      } catch {
        savedWishlist = [];
      }

      setIsWishlisted(
        savedWishlist.some((id) => String(id) === String(product.id))
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [product.id]);

  if (isSoldOut && !showSoldOut) return null;

  // ---------------------------------------
  // Wishlist
  // ---------------------------------------
  const handleWishlist = async () => {
    if (isUpdatingWishlist) return;

    setIsUpdatingWishlist(true);
    let savedWishlist = [];
    try {
      savedWishlist = JSON.parse(
        localStorage.getItem("velora-wishlist") || "[]"
      );
    } catch (error) {
      console.error("Could not read saved wishlist:", error);
      window.alert("Unable to update your wishlist. Please try again.");
      setIsUpdatingWishlist(false);
      return;
    }

    const alreadyWishlisted = savedWishlist.some(
      (id) => String(id) === String(product.id)
    ) || isWishlisted;

    try {
      const response = await fetch(
        alreadyWishlisted
          ? `/api/user/wishlist?item_id=${encodeURIComponent(product.id)}`
          : "/api/user/wishlist",
        {
          method: alreadyWishlisted ? "DELETE" : "POST",
          headers: alreadyWishlisted
            ? undefined
            : { "Content-Type": "application/json" },
          body: alreadyWishlisted
            ? undefined
            : JSON.stringify({ item_id: product.id }),
        }
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update your wishlist.");
      }

      const updatedWishlist = alreadyWishlisted
        ? savedWishlist.filter((id) => String(id) !== String(product.id))
        : [...savedWishlist.filter((id) => String(id) !== String(product.id)), product.id];
      localStorage.setItem("velora-wishlist", JSON.stringify(updatedWishlist));
      setIsWishlisted(!alreadyWishlisted);
      onWishlistChange?.(product.id, !alreadyWishlisted);
      window.dispatchEvent(new Event("velora-wishlist-updated"));

      if (!alreadyWishlisted) {
        router.push("/user/wishlist");
      }
    } catch (error) {
      console.error("Update customer wishlist error:", error);
      window.alert(error.message || "Unable to update your wishlist.");
    } finally {
      setIsUpdatingWishlist(false);
    }
  };

  // ---------------------------------------
  // Add to Cart
  // ---------------------------------------
  const handleAddToCart = () => {
    if (isSoldOut) {
      return;
    }

    const savedCart =
      JSON.parse(
        localStorage.getItem("velora-cart") || "[]"
      );

    // Find first available variant
    const availableVariant =
      product.variants?.find(
        (variant) =>
          Number(variant.stock || 0) > 0
      );

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: Math.round(discountedPrice),
      originalPrice: Math.round(originalPrice),
      image: productImage,

      variantId: availableVariant?.variant_id || null,

      size:
        availableVariant?.size ||
        product.sizes?.[0] ||
        "",

      color:
        availableVariant?.color ||
        product.colors?.[0]?.name ||
        "",

      quantity: 1,
      variantId: availableVariant?.variant_id,

      stock: Number(availableVariant?.stock ?? product.stock ?? product.qty ?? 0),
    };

    // Check if same product + size + color already exists
    const existingItemIndex =
      savedCart.findIndex(
        (item) =>
          item.productId ===
            cartItem.productId &&
          item.size === cartItem.size &&
          item.color === cartItem.color
      );

    if (existingItemIndex !== -1) {
      const existingQuantity =
        Number(
          savedCart[existingItemIndex]
            .quantity
        ) || 0;

      if (existingQuantity + 1 > cartItem.stock) {
        alert(`Only ${cartItem.stock} items are available for this product.`);
        return;
      }

      savedCart[
        existingItemIndex
      ].quantity = existingQuantity + 1;

      savedCart[
        existingItemIndex
      ].stock = cartItem.stock;
    } else {
      savedCart.push(cartItem);
    }

    localStorage.setItem(
      "velora-cart",
      JSON.stringify(savedCart)
    );

    // Notify Cart
    window.dispatchEvent(
      new Event("velora-cart-updated")
    );
  };

  return (
    <div className="group relative">

      {/* =====================================
          PRODUCT IMAGE
      ====================================== */}

      <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF6F5]">

        <Link
          href={`/user/product/${product.id}`}
          className="relative block h-full w-full"
        >
          <Image
            src={productImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition duration-700 ease-out group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackImage;
            }}
          />
        </Link>

        {/* =================================
            SOLD OUT LABEL
        ================================== */}

        {isSoldOut && (
          <span
            className="absolute left-0 top-4 z-20 bg-red-600 px-4 py-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-white shadow-sm"
          >
            Sold Out
          </span>
        )}

        {/* =================================
            DISCOUNT BADGE
        ================================== */}

        {hasDiscount && !isSoldOut && (
          <span
            className="absolute left-3 top-3 z-10 bg-[#e63e62] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white"
          >
            -{product.discount}%
          </span>
        )}

        {/* =================================
            WISHLIST BUTTON
        ================================== */}

        <button
          type="button"
          onClick={handleWishlist}
          disabled={isUpdatingWishlist}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className={`absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white ${isWishlisted ? "text-[#e63e62]" : "text-[#292524]"}`}
        >
          <Heart
            size={19}
            strokeWidth={1.6}
            fill={
              isWishlisted
                ? "currentColor"
                : "none"
            }
          />
        </button>

        {/* =================================
            QUICK ADD
        ================================== */}

        {!isSoldOut && (
          <button
            type="button"
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 z-30 flex translate-y-full items-center justify-center gap-2 bg-[#e63e62] py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white transition-transform duration-300 hover:bg-[#A96870] group-hover:translate-y-0"
          >
            <ShoppingBag
              size={16}
              strokeWidth={1.7}
            />

            Add to Cart
          </button>
        )}

      </div>

      {/* =====================================
          PRODUCT INFORMATION
      ====================================== */}

      <div className="px-1 pt-4">

        {/* Product Name */}

        <Link
          href={`/user/product/${product.id}`}
        >
          <h3
            className="text-sm font-medium text-[#292524] transition-colors hover:text-[#e63e62]"
          >
            {product.name}
          </h3>
        </Link>

        {/* =================================
            RATING
        ================================== */}

        <div className="mt-2 flex items-center gap-1">

          <div className="flex">
            {[1, 2, 3, 4, 5].map(
              (star) => (
                <Star
                  key={star}
                  size={13}
                  strokeWidth={1.5}
                  className={
                    star <=
                    Math.round(
                      currentRating
                    )
                      ? "fill-[#e63e62] text-[#e63e62]"
                      : "text-[#E7DEDC]"
                  }
                />
              )
            )}
          </div>

          <span
            className="ml-1 text-[11px] text-[#6B625D]"
          >
            {currentRating} ({reviewCount})
          </span>

        </div>

        {/* =================================
            PRICE
        ================================== */}

        <div
          className="mt-2 flex items-center gap-2"
        >

          <span
            className="text-sm font-semibold text-[#e63e62]"
          >
            Rs.{" "}
            {Math.round(
              discountedPrice
            ).toLocaleString()}
          </span>

          {hasDiscount && (
            <span
              className="text-xs text-[#6B625D] line-through"
            >
              Rs.{" "}
              {originalPrice.toLocaleString()}
            </span>
          )}

        </div>

      </div>
    </div>
  );
}