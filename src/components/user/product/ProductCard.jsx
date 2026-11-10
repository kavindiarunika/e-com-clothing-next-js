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
  compact = false,
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
    <article className="group relative flex h-full flex-col overflow-hidden border border-[#EAE7E4] bg-white transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[#D8CDC7] hover:shadow-[0_10px_28px_rgba(41,37,36,0.10)]">

      {/* =====================================
          PRODUCT IMAGE
      ====================================== */}

      <div
        className={`relative overflow-hidden bg-[#F5F5F5] ${
          compact ? "aspect-[1/1.15] sm:aspect-[3/4]" : "aspect-[3/4]"
        }`}
      >

        <Link
          href={`/user/product/${product.id}`}
          className="relative block h-full w-full"
        >
          <Image
            src={productImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition duration-500 ease-out group-hover:scale-[1.03]"
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
            className="absolute left-2 top-2 z-20 bg-[#292524] px-2 py-1 text-[9px] font-semibold uppercase tracking-[1px] text-white shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1.5"
          >
            Sold Out
          </span>
        )}

        {/* =================================
            DISCOUNT BADGE
        ================================== */}

        {hasDiscount && !isSoldOut && (
          <span
            className="absolute left-2 top-2 z-10 bg-[var(--color-primary)] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-white sm:left-3 sm:top-3 sm:px-2.5 sm:py-1.5"
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
          className="absolute right-2 top-2 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white/95 text-[#5D554F] shadow-sm backdrop-blur-sm transition-colors duration-200 hover:text-[var(--color-primary)] sm:right-3 sm:top-3 sm:h-10 sm:w-10"
        >
          <Heart
            size={17}
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
            className="group/add-to-cart absolute bottom-0 left-0 right-0 z-30 flex min-h-10 translate-y-0 items-center justify-center gap-1 bg-[var(--color-primary)] px-1 py-2 text-[9px] font-semibold uppercase tracking-[0.8px] text-white transition-[background-color,box-shadow,transform] duration-300 ease-out hover:bg-[var(--color-primary-hover)] hover:shadow-[0_-4px_14px_rgba(17,17,17,0.18)] active:scale-[0.98] [@media(hover:hover)]:translate-y-full [@media(hover:hover)]:group-hover:translate-y-0 motion-reduce:transition-none sm:min-h-11 sm:gap-2 sm:py-3 sm:text-xs sm:tracking-[1.5px]"
          >
            <ShoppingBag
              size={14}
              strokeWidth={1.7}
              className="transition-transform duration-300 ease-out group-hover/add-to-cart:scale-110 motion-reduce:transition-none"
            />

            Add to Cart
          </button>
        )}

      </div>

      {/* =====================================
          PRODUCT INFORMATION
      ====================================== */}

      <div className="flex flex-1 flex-col px-2 py-2 sm:px-3.5 sm:py-3">
        

        <Link href={`/user/product/${product.id}`}>
          <h3 className="line-clamp-2 min-h-8 break-words text-[17px] font-medium leading-4 text-[#292524] transition-colors hover:text-[var(--color-primary)] sm:min-h-10 sm:text-sm sm:leading-5">
            {product.name}
          </h3>
        </Link>

        {currentRating > 0 && (
          <div
            className="mt-1 flex items-center gap-1"
            aria-label={`${currentRating} out of 5 stars${reviewCount ? `, ${reviewCount} reviews` : ""}`}
          >
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  strokeWidth={1.5}
                  className={
                    star <= Math.round(currentRating)
                      ? "fill-[#C99B42] text-[#C99B42]"
                      : "text-[#E5E5E5]"
                  }
                />
              ))}
            </div>
            <span className="ml-1 text-[10px] text-[#6B625D]">
              {currentRating.toFixed(1)}
              {reviewCount > 0 ? ` (${reviewCount})` : ""}
            </span>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-1.5 sm:pt-2">
          <span className="text-xs font-semibold text-[#292524] sm:text-sm">
            Rs. {Math.round(discountedPrice).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-[#8A8178] line-through sm:text-xs">
              Rs. {originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}