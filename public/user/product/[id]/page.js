"use client";

import { use, useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";

import ProductImageGallery from "@/components/user/product/ProductImageGallery";
import ProductRating from "@/components/user/product/ProductRating";
import ColorSelector from "@/components/user/product/ColorSelector";
import SizeSelector from "@/components/user/product/SizeSelector";
import RelatedProducts from "@/components/user/product/RelatedProducts";
import ReviewSection from "@/components/user/product/ReviewSection";

import products from "@/data/products";

export default function ProductPage({ params }) {
  const resolvedParams = use(params);
  const productId = Number(resolvedParams.id);

  const product = useMemo(
    () => products.find((item) => item.id === productId),
    [productId]
  );

  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.[0] || null
  );

  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.[0] || ""
  );

  const [quantity, setQuantity] = useState(1);

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Product not found
  if (!product) {
    notFound();
  }

  /*
  ==========================================
  SELECTED VARIANT
  ==========================================
  */

  const selectedColorName =
    typeof selectedColor === "object"
      ? selectedColor?.name
      : selectedColor;

  const selectedVariant = product.variants?.find(
    (variant) =>
      variant.size === selectedSize &&
      variant.color === selectedColorName
  );

  const availableStock = Number(
    selectedVariant?.stock || 0
  );

  /*
  ==========================================
  PRODUCT SOLD OUT
  ==========================================
  */

  const isSoldOut =
    product.variants?.length > 0 &&
    product.variants.every(
      (variant) => Number(variant.stock || 0) <= 0
    );

  /*
  ==========================================
  CHECK WISHLIST
  ==========================================
  */

  useEffect(() => {
    if (!product) return;

    const savedWishlist =
      JSON.parse(
        localStorage.getItem("velora-wishlist")
      ) || [];

    setIsWishlisted(
      savedWishlist.includes(product.id)
    );
  }, [product]);

  /*
  ==========================================
  RESET QUANTITY WHEN VARIANT CHANGES
  ==========================================
  */

  useEffect(() => {
    setQuantity(1);
  }, [selectedSize, selectedColor]);

  /*
  ==========================================
  DECREASE QUANTITY
  ==========================================
  */

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  /*
  ==========================================
  INCREASE QUANTITY
  ==========================================
  */

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(
        availableStock,
        current + 1
      )
    );
  };

  /*
  ==========================================
  WISHLIST
  ==========================================
  */

  const handleWishlist = () => {
    if (!product) return;

    const savedWishlist =
      JSON.parse(
        localStorage.getItem("velora-wishlist")
      ) || [];

    if (savedWishlist.includes(product.id)) {
      // Remove
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
      // Add
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
  };

  /*
  ==========================================
  PRICE CALCULATION
  ==========================================
  */

  const hasDiscount =
    product.discount &&
    product.discount > 0;

  const discountedPrice = hasDiscount
    ? product.price -
      (product.price * product.discount) / 100
    : product.price;

  /*
  ==========================================
  CREATE CART ITEM
  ==========================================
  */

  const createCartItem = () => {
    return {
      productId: product.id,
      name: product.name,

      price: Math.round(discountedPrice),

      image: product.images?.[0],

      size: selectedSize,

      color: selectedColorName || "",

      quantity: quantity,

      // Store selected variant stock
      stock: availableStock,
    };
  };

  /*
  ==========================================
  ADD TO CART
  ==========================================
  */

  const handleAddToCart = () => {
    if (!product) return;

    // Check variant
    if (!selectedVariant) {
      alert(
        "Please select an available size and color."
      );
      return;
    }

    // Check stock
    if (availableStock <= 0) {
      alert(
        "This size and color combination is sold out."
      );
      return;
    }

    // Check quantity
    if (quantity > availableStock) {
      alert(
        `Only ${availableStock} items are available.`
      );
      return;
    }

    const savedCart =
      JSON.parse(
        localStorage.getItem("velora-cart")
      ) || [];

    const cartItem = createCartItem();

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
          savedCart[existingItemIndex].quantity
        ) || 0;

      const newQuantity =
        existingQuantity + quantity;

      savedCart[existingItemIndex].quantity =
        Math.min(
          newQuantity,
          availableStock
        );

      savedCart[existingItemIndex].stock =
        availableStock;
    } else {
      savedCart.push(cartItem);
    }

    localStorage.setItem(
      "velora-cart",
      JSON.stringify(savedCart)
    );

    alert("Product added to cart!");
  };

  /*
  ==========================================
  BUY NOW
  ==========================================
  */

  const handleBuyNow = () => {
    if (!product) return;

    // Check variant
    if (!selectedVariant) {
      alert(
        "Please select an available size and color."
      );
      return;
    }

    // Check stock
    if (availableStock <= 0) {
      alert(
        "This size and color combination is sold out."
      );
      return;
    }

    // Check quantity
    if (quantity > availableStock) {
      alert(
        `Only ${availableStock} items are available.`
      );
      return;
    }

    const savedCart =
      JSON.parse(
        localStorage.getItem("velora-cart")
      ) || [];

    const cartItem = createCartItem();

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
          savedCart[existingItemIndex].quantity
        ) || 0;

      const newQuantity =
        existingQuantity + quantity;

      savedCart[existingItemIndex].quantity =
        Math.min(
          newQuantity,
          availableStock
        );

      savedCart[existingItemIndex].stock =
        availableStock;
    } else {
      savedCart.push(cartItem);
    }

    localStorage.setItem(
      "velora-cart",
      JSON.stringify(savedCart)
    );

    // Go directly to checkout
    window.location.href = "/checkout";
  };

  /*
  ==========================================
  RETURN UI
  ==========================================
  */

  return (
    <main className="bg-[#EFE9E1]">

      {/* ================= PRODUCT SECTION ================= */}

      <section className="mx-auto w-[92%] max-w-[1200px] py-10 md:py-16">

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">

          {/* PRODUCT IMAGES */}

          <div>
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              selectedColor={selectedColor}
            />
          </div>

          {/* PRODUCT INFORMATION */}

          <div className="flex flex-col justify-center">

            {/* Category */}

            <p className="mb-3 text-xs font-medium uppercase tracking-[3px] text-[#72383D]">
              {product.category}
            </p>

            {/* Product Name */}

            <h1 className="font-serif text-4xl leading-tight text-[#322D29] md:text-5xl">
              {product.name}
            </h1>

            {/* Rating */}

            <div className="mt-4 text-sm">
              <ProductRating
                productId={product.id}
                defaultRating={product.rating}
                defaultReviews={product.reviews}
              />
            </div>

            {/* PRICE */}

            <div className="mt-6 flex items-center gap-3">

              <span className="text-3xl font-semibold text-[#72383D]">
                Rs.{" "}
                {Math.round(
                  discountedPrice
                ).toLocaleString()}
              </span>

              {hasDiscount && (
                <span className="text-sm text-[#6B625C] line-through">
                  Rs.{" "}
                  {product.price.toLocaleString()}
                </span>
              )}

              {hasDiscount && (
                <span className="bg-[#72383D] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {product.discount}% OFF
                </span>
              )}

            </div>

            {/* DESCRIPTION */}

            <p className="mt-6 text-m leading-7 text-[#6B625C]">
              {product.description}
            </p>

            <div className="mt-8 space-y-6">

              {/* COLOR */}

              <ColorSelector
                colors={product.colors}
                selectedColor={selectedColor}
                setSelectedColor={
                  setSelectedColor
                }
                variants={product.variants}
                selectedSize={selectedSize}
              />

              {/* SIZE */}

              <SizeSelector
                sizes={product.sizes}
                selectedSize={selectedSize}
                setSelectedSize={
                  setSelectedSize
                }
                category={product.category}
                sizeGuide={product.sizeGuide}
                variants={product.variants}
                selectedColor={selectedColor}
              />

              {/* QUANTITY */}

              <div>

                <p className="mb-3 text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]">
                  Quantity
                </p>

                <div className="flex w-fit items-center border border-[#D8D0C8] bg-white">

                  {/* MINUS */}

                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={
                      quantity <= 1 ||
                      availableStock <= 0
                    }
                    aria-label="Decrease quantity"
                    className="flex h-11 w-11 items-center justify-center text-xl text-[#322D29] transition hover:bg-[#F6F1EA] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>

                  {/* NUMBER */}

                  <span className="flex h-11 w-14 items-center justify-center text-sm font-medium text-[#322D29]">
                    {quantity}
                  </span>

                  {/* PLUS */}

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={
                      !selectedVariant ||
                      availableStock <= 0 ||
                      quantity >= availableStock
                    }
                    aria-label="Increase quantity"
                    className="flex h-11 w-11 items-center justify-center text-xl text-[#322D29] transition hover:bg-[#F6F1EA] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>

                </div>

                {/* STOCK MESSAGE */}

                <p className="mt-2 text-xs text-[#6B625C]">

                  {!selectedSize ||
                  !selectedColor ? (
                    "Select size and color"
                  ) : availableStock > 0 ? (
                    <>
                      {availableStock}{" "}
                      items available
                    </>
                  ) : (
                    <span className="font-medium text-[#72383D]">
                      This combination is sold out
                    </span>
                  )}

                </p>

              </div>

            </div>

            {/* ================= BUTTONS ================= */}

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">

              {/* BUY NOW */}

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={
                  !selectedVariant ||
                  availableStock <= 0
                }
                className="bg-[#72383D] px-6 py-4 text-xs font-semibold uppercase tracking-[1.5px] text-white transition duration-300 hover:bg-[#322D29] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>

              {/* ADD TO CART */}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={
                  !selectedVariant ||
                  availableStock <= 0
                }
                className="border border-[#72383D] bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#72383D] transition duration-300 hover:bg-[#72383D] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to Cart
              </button>

              {/* WISHLIST */}

              <button
                type="button"
                onClick={handleWishlist}
                className={`flex items-center justify-center gap-2 border px-6 py-4 text-xs font-semibold uppercase tracking-[1.5px] transition duration-300 sm:col-span-2 ${
                  isWishlisted
                    ? "border-[#72383D] bg-[#72383D] text-white"
                    : "border-[#D8D0C8] bg-white text-[#322D29] hover:border-[#72383D] hover:text-[#72383D]"
                }`}
              >

                <span className="text-base">
                  {isWishlisted
                    ? "♥"
                    : "♡"}
                </span>

                {isWishlisted
                  ? "Added to Wishlist"
                  : "Add to Wishlist"}

              </button>

            </div>

            {/* PRODUCT DETAILS */}

            <div className="mt-8 border-t border-[#D8D0C8] pt-5">

              <p className="text-[14px] uppercase tracking-[2px] text-[#322D29]">
                Product Details
              </p>

              <ul className="mt-3 space-y-2 text-m text-[#6B625C]">

                <li>
                  • Premium quality material
                </li>

                <li>
                  • Comfortable everyday fit
                </li>

                <li>
                  • Available in selected sizes and colors
                </li>

              </ul>

            </div>

          </div>
        </div>

      </section>

      {/* ================= RELATED PRODUCTS ================= */}

      <section className="mx-auto w-[92%] max-w-[1200px] pb-16">

        <RelatedProducts
          products={products}
          currentProduct={product}
        />

        {/* ================= REVIEWS ================= */}

        <div className="mt-16">
          <ReviewSection product={product} />
        </div>

      </section>

    </main>
  );
}