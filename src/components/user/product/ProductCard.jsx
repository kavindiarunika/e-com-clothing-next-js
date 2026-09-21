"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ---------------------------------------
  // Rating
  // ---------------------------------------
  const [currentRating, setCurrentRating] = useState(
    Number(product.rating) || 0
  );

  const [reviewCount, setReviewCount] = useState(
    Number(product.reviews) || 0
  );

  // ---------------------------------------
  // Product Image
  // ---------------------------------------
  const productImage =
    product.image ||
    product.images?.[0] ||
    "/images/products/placeholder.webp";

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
  const isSoldOut =
    product.variants?.length > 0 &&
    product.variants.every(
      (variant) =>
        Number(variant.stock || 0) <= 0
    );

  // ---------------------------------------
  // Load Wishlist
  // ---------------------------------------
  useEffect(() => {
    const savedWishlist =
      JSON.parse(
        localStorage.getItem("velora-wishlist") || "[]"
      );

    setIsWishlisted(
      savedWishlist.includes(product.id)
    );
  }, [product.id]);

  // ---------------------------------------
  // Load Reviews
  // ---------------------------------------
  useEffect(() => {
    const loadReviews = () => {
      const reviewKey =
        `velora-reviews-${product.id}`;

      const savedReviews =
        JSON.parse(
          localStorage.getItem(reviewKey) || "[]"
        );

      const existingRating =
        Number(product.rating) || 0;

      const existingReviewCount =
        Number(product.reviews) || 0;

      // Rating total from customer reviews
      const customerRatingTotal =
        savedReviews.reduce(
          (sum, review) =>
            sum + Number(review.rating || 0),
          0
        );

      // Existing + customer reviews
      const totalReviews =
        existingReviewCount +
        savedReviews.length;

      // Existing rating total + customer rating total
      const totalRating =
        existingRating *
          existingReviewCount +
        customerRatingTotal;

      const updatedRating =
        totalReviews > 0
          ? totalRating / totalReviews
          : 0;

      setCurrentRating(
        Number(updatedRating.toFixed(1))
      );

      setReviewCount(totalReviews);
    };

    loadReviews();

    // Update when ReviewSection submits a review
    const handleReviewUpdated = () => {
      loadReviews();
    };

    window.addEventListener(
      "velora-review-updated",
      handleReviewUpdated
    );

    return () => {
      window.removeEventListener(
        "velora-review-updated",
        handleReviewUpdated
      );
    };
  }, [
    product.id,
    product.rating,
    product.reviews,
  ]);

  // ---------------------------------------
  // Wishlist
  // ---------------------------------------
  const handleWishlist = () => {
    const savedWishlist =
      JSON.parse(
        localStorage.getItem("velora-wishlist") || "[]"
      );

    if (savedWishlist.includes(product.id)) {
      // Remove from wishlist
      const updatedWishlist =
        savedWishlist.filter(
          (id) => id !== product.id
        );

      localStorage.setItem(
        "velora-wishlist",
        JSON.stringify(updatedWishlist)
      );

      setIsWishlisted(false);
    } else {
      // Add to wishlist
      const updatedWishlist = [
        ...savedWishlist,
        product.id,
      ];

      localStorage.setItem(
        "velora-wishlist",
        JSON.stringify(updatedWishlist)
      );

      setIsWishlisted(true);
    }

    // Notify Wishlist page / Navbar
    window.dispatchEvent(
      new Event("velora-wishlist-updated")
    );
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
      image: productImage,

      size:
        availableVariant?.size ||
        product.sizes?.[0] ||
        "",

      color:
        availableVariant?.color ||
        product.colors?.[0]?.name ||
        "",

      quantity: 1,

      stock: Number(
        availableVariant?.stock || 0
      ),
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

      savedCart[
        existingItemIndex
      ].quantity = Math.min(
        existingQuantity + 1,
        cartItem.stock
      );

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

      <div className="relative aspect-[3/4] overflow-hidden bg-[#E3DCD1]">

        <Link
          href={`/user/product/${product.id}`}
          className="block h-full w-full"
        >
          <Image
            src={productImage}
            alt={product.name}
            fill
            sizes="
              (max-width: 640px) 50vw,
              (max-width: 1024px) 33vw,
              25vw
            "
            className="
              object-cover
              object-center
              transition
              duration-700
              ease-out
              group-hover:scale-105
            "
          />
        </Link>

        {/* =================================
            SOLD OUT LABEL
        ================================== */}

        {isSoldOut && (
          <span
            className="
              absolute
              left-0
              top-4
              z-20
              bg-red-600
              px-4
              py-2
              text-[10px]
              font-semibold
              uppercase
              tracking-[1.5px]
              text-white
              shadow-sm
            "
          >
            Sold Out
          </span>
        )}

        {/* =================================
            DISCOUNT BADGE
        ================================== */}

        {hasDiscount && !isSoldOut && (
          <span
            className="
              absolute
              left-3
              top-3
              z-10
              bg-[#72383D]
              px-3
              py-1.5
              text-[10px]
              font-semibold
              uppercase
              tracking-wider
              text-white
            "
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
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className={`
            absolute
            right-3
            top-3
            z-30
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-white/90
            shadow-sm
            backdrop-blur-sm
            transition-all
            duration-300
            hover:bg-white

            ${
              isWishlisted
                ? "text-[#72383D]"
                : "text-[#322D29]"
            }
          `}
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
            className="
              absolute
              bottom-0
              left-0
              right-0
              z-30
              flex
              translate-y-full
              items-center
              justify-center
              gap-2
              bg-[#322D29]
              py-3
              text-xs
              font-semibold
              uppercase
              tracking-[1.5px]
              text-white
              transition-transform
              duration-300
              group-hover:translate-y-0
            "
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
            className="
              text-sm
              font-medium
              text-[#322D29]
              transition-colors
              hover:text-[#72383D]
            "
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
                      ? "fill-[#AC9C8D] text-[#AC9C8D]"
                      : "text-[#D8CEC5]"
                  }
                />
              )
            )}
          </div>

          <span
            className="
              ml-1
              text-[11px]
              text-[#6B625D]
            "
          >
            {currentRating} ({reviewCount})
          </span>

        </div>

        {/* =================================
            PRICE
        ================================== */}

        <div
          className="
            mt-2
            flex
            items-center
            gap-2
          "
        >

          <span
            className="
              text-sm
              font-semibold
              text-[#72383D]
            "
          >
            Rs.{" "}
            {Math.round(
              discountedPrice
            ).toLocaleString()}
          </span>

          {hasDiscount && (
            <span
              className="
                text-xs
                text-[#6B625D]
                line-through
              "
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