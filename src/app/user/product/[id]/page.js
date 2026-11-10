"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  ArrowRight,
  Heart,
  Image as ImageIcon,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";

import ProductImageGallery from "@/components/user/product/ProductImageGallery";
import ProductRating from "@/components/user/product/ProductRating";
import ColorSelector from "@/components/user/product/ColorSelector";
import SizeSelector from "@/components/user/product/SizeSelector";
import RelatedProducts from "@/components/user/product/RelatedProducts";
import ReviewSection from "@/components/user/product/ReviewSection";
import ProductComments from "@/components/user/product/ProductComments";

export default function ProductPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = String(resolvedParams.id);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const allowMultipleSizes = true;

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setLoadError(false);

      try {
        const response = await fetch(
          `/api/user/Product/${encodeURIComponent(productId)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          if (response.status !== 404) {
            throw new Error(`Product request failed with status ${response.status}`);
          }

          setProduct(null);
          return;
        }

        const result = await response.json();
        const nextProduct = result.product || null;

        setProduct(nextProduct);
        setSelectedColor(nextProduct?.colors?.[0] || null);
        const firstSize = nextProduct?.sizes?.[0] || "";
        setSelectedSize(firstSize);
        setSelectedSizes(firstSize ? [firstSize] : []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Product detail error:", error);
          setProduct(null);
          setLoadError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => controller.abort();
  }, [productId]);

  useEffect(() => {
    if (!product?.category_id) return;

    const controller = new AbortController();

    async function loadRelatedProducts() {
      try {
        const response = await fetch(
          `/api/user/Product?status=active&category_id=${encodeURIComponent(product.category_id)}&include_category_family=1`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load related products");
        }

        const result = await response.json();
        const nextProducts = Array.isArray(result.data)
          ? result.data.map((item) => ({
              id: item.item_id,
              name: item.title,
              category: item.category_name,
              rating: Number(item.rating) || 0,
              reviews: Number(item.review_count) || 0,
              price: item.price,
              discount: item.discount,
              image: item.image,
              images: item.image ? [item.image] : [],
              variants: item.variants || [],
              sizes: item.sizes || [],
              colors: item.colors || [],
              qty: Number(item.qty) || 0,
              stock: Number(item.total_stock) || 0,
            }))
          : [];

        setRelatedProducts(nextProducts);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Related products error:", error);
          setRelatedProducts([]);
        }
      }
    }

    void loadRelatedProducts();

    return () => controller.abort();
  }, [product?.category_id]);

  useEffect(() => {
    if (!product) return;

    const frameId = requestAnimationFrame(() => {
      try {
        const savedWishlist = JSON.parse(
          localStorage.getItem("velora-wishlist") || "[]"
        );
        setIsWishlisted(savedWishlist.includes(product.id));
      } catch (error) {
        console.error("Unable to read wishlist:", error);
        setIsWishlisted(false);
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [product]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#FFFFFF] text-sm text-[#6B625D]">
        Loading product...
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#FFFFFF] px-6 text-center text-sm text-[#6B625D]">
        We couldn&apos;t load this product. Please try again later.
      </main>
    );
  }

  if (!product) notFound();

  const selectedColorName =
    typeof selectedColor === "object"
      ? selectedColor?.name
      : selectedColor;

  const normalizeText = (value) =>
    String(value ?? "").trim().toLowerCase();

  const selectedColorId =
    selectedColor && typeof selectedColor === "object"
      ? selectedColor.color_id
      : null;

  const activeSelectedSizes = allowMultipleSizes && Array.isArray(selectedSizes) && selectedSizes.length > 0
    ? selectedSizes
    : selectedSize
      ? [selectedSize]
      : [];

  const selectedVariant = activeSelectedSizes.length > 0
    ? product.variants?.find(
        (variant) =>
          normalizeText(variant.size) === normalizeText(activeSelectedSizes[activeSelectedSizes.length - 1] || "") &&
          selectedColorId != null &&
          variant.color_id != null &&
          String(variant.color_id) === String(selectedColorId)
      ) || product.variants?.find(
        (variant) =>
          normalizeText(variant.size) === normalizeText(activeSelectedSizes[activeSelectedSizes.length - 1] || "") &&
          normalizeText(variant.color) === normalizeText(selectedColorName || "")
      ) || product.variants?.find(
        (variant) =>
          normalizeText(variant.size) === normalizeText(activeSelectedSizes[activeSelectedSizes.length - 1] || "") &&
          variant.color_id == null &&
          !normalizeText(variant.color)
      )
    : null;

  const totalVariantStock = (product.variants || []).reduce(
    (total, variant) => total + (Number(variant.stock) || 0),
    0
  );

  const availableStock = totalVariantStock > 0
    ? selectedVariant
      ? Number(selectedVariant.stock) || 0
      : activeSelectedSizes.some((size) =>
          normalizeText(size) === normalizeText(product.default_size || "")
        )
        ? Number(product.product_qty) || 0
        : 0
    : Number(product.qty) || 0;

  const quantityLimit = availableStock;
  const hasSelectedOption =
    product.variants.length === 0 ||
    Boolean(selectedVariant) ||
    (
      activeSelectedSizes.some(
        (size) => normalizeText(size) === normalizeText(product.default_size || "")
      ) &&
      availableStock > 0
    );

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(quantityLimit, current + 1));
  };

  const handleWishlist = () => {
    if (!product) return;

    try {
      const savedWishlist = JSON.parse(localStorage.getItem("velora-wishlist") || "[]");

      if (savedWishlist.includes(product.id)) {
        const updatedWishlist = savedWishlist.filter((id) => id !== product.id);
        localStorage.setItem("velora-wishlist", JSON.stringify(updatedWishlist));
        setIsWishlisted(false);
      } else {
        const updatedWishlist = [...savedWishlist, product.id];
        localStorage.setItem("velora-wishlist", JSON.stringify(updatedWishlist));
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Unable to update wishlist:", error);
      alert("Unable to update your wishlist. Please refresh and try again.");
    }
  };

  const discountedPrice = product.discount > 0
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  const originalPrice = Number(product.price) || 0;
  const hasDiscount = Number(product.discount) > 0;

  const createCartItem = () => {
    const selectedImage =
      selectedVariant?.image ||
      selectedColor?.image ||
      product.images?.[0] ||
      "";

    return {
      productId: product.id,
      variantId: totalVariantStock > 0 ? selectedVariant?.variant_id : null,
      name: product.name,
      price: Math.round(discountedPrice),
      originalPrice: Math.round(originalPrice),
      image: selectedImage,
      size: allowMultipleSizes && activeSelectedSizes.length > 0
        ? activeSelectedSizes.join(",")
        : selectedSize,
      color: selectedColorName || "",
      quantity,
      stock: availableStock,
    };
  };

  const addSelectedProductToCart = () => {
    if (!product) return;

    if (!hasSelectedOption) {
      alert("Please select an available size and color.");
      return;
    }

    if (availableStock <= 0) {
      alert("This size and color combination is sold out.");
      return;
    }

    if (quantity > availableStock) {
      alert(`Only ${availableStock} items are available.`);
      return;
    }

    let savedCart;
    try {
      const storedCart = JSON.parse(localStorage.getItem("velora-cart") || "[]");
      savedCart = Array.isArray(storedCart) ? storedCart : [];
    } catch (error) {
      console.error("Unable to read shopping cart:", error);
      alert("Unable to update your cart. Please refresh the page and try again.");
      return;
    }

    const cartItem = createCartItem();
    const existingItemIndex = savedCart.findIndex((item) => (
      String(item.productId) === String(cartItem.productId) &&
      String(item.variantId || "") === String(cartItem.variantId || "") &&
      item.size === cartItem.size &&
      (typeof item.color === "object" ? item.color?.name : item.color) === cartItem.color
    ));

    if (existingItemIndex !== -1) {
      const existingQuantity = Number(savedCart[existingItemIndex].quantity) || 0;
      const newQuantity = existingQuantity + quantity;

      if (newQuantity > availableStock) {
        alert(`Only ${availableStock} items are available for this option.`);
        return false;
      }

      savedCart[existingItemIndex].quantity = newQuantity;
      savedCart[existingItemIndex].stock = availableStock;
    } else {
      savedCart.push(cartItem);
    }

    localStorage.setItem("velora-cart", JSON.stringify(savedCart));
    window.dispatchEvent(new Event("velora-cart-updated"));
    return true;
  };

  const handleAddToCart = () => {
    if (!addSelectedProductToCart()) return;

    sessionStorage.setItem("velora-cart-message", `${product.name} added to your cart.`);
    router.push("/user/cart");
  };

  const handleBuyNow = () => {
    if (!product) return;

    if (!hasSelectedOption) {
      alert("Please select an available size and color.");
      return;
    }

    if (availableStock <= 0 || quantity > availableStock) {
      alert(`Only ${availableStock} items are available.`);
      return;
    }

    try {
      sessionStorage.setItem("velora-buy-now-item", JSON.stringify(createCartItem()));
      router.push("/user/checkout");
    } catch (error) {
      console.error("Unable to start Buy Now checkout:", error);
      alert("Unable to start checkout. Please try again.");
    }
  };

  return (
    <main className="bg-[#FFFFFF]">
      <section className="mx-auto w-[97%] max-w-[1280px] py-3 sm:w-[96%] sm:py-5 lg:py-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8A8178] sm:mb-5"
        >
          <Link href="/user" className="transition hover:text-[var(--color-primary)]">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/user/shop" className="transition hover:text-[var(--color-primary)]">
            Shop
          </Link>
          {product.category && (
            <>
              <span aria-hidden="true">/</span>
              <span className="truncate">{product.category}</span>
            </>
          )}
        </nav>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:gap-8">
          <div className="min-w-0">
            {product.images.length > 0 ? (
              <ProductImageGallery
                key={`${selectedColor?.color_id || selectedColor?.name || "default"}-${selectedSize || "default"}`}
                images={product.images}
                productName={product.name}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                selectedVariantImage={selectedVariant?.image || selectedColor?.image || null}
              />
            ) : (
              <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 bg-[#F5F5F5] text-[#6B625D]">
                <ImageIcon size={32} strokeWidth={1.4} />
                <span className="text-xs">No product image available</span>
              </div>
            )}
          </div>

          <div className="min-w-0 border border-[#EEE8E3] bg-[#FDFCFA] px-2.5 py-3 sm:px-3 sm:py-4 lg:sticky lg:top-28 lg:px-4 lg:py-5">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[2.4px] text-[var(--color-primary)] sm:mb-2 sm:text-xs">
              {product.category}
            </p>

            <h1 className="break-words font-serif text-3xl font-medium leading-tight text-[#292524] sm:text-4xl lg:text-[42px]">
              {product.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[#EAE4DE] pb-3 sm:mt-3 sm:pb-4">
              <ProductRating
                productId={product.id}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2 sm:mt-5">
              <span className="text-2xl font-semibold text-[#292524] sm:text-3xl">
                Rs. {Math.round(discountedPrice).toLocaleString()}
              </span>

              {hasDiscount && (
                <span className="text-sm text-[#8A8178] line-through sm:text-base">
                  Rs. {originalPrice.toLocaleString()}
                </span>
              )}

              {hasDiscount && (
                <span className="bg-[#F3E9E7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <div
              className="product-description mt-3 border-b border-[#EAE4DE] pb-4 text-sm leading-6 text-[#6B625C] sm:mt-4 sm:pb-5 sm:leading-7"
              dangerouslySetInnerHTML={{
                __html: product.description || "",
              }}
            />

            <div className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
              {product.colors.length > 0 && (
                <ColorSelector
                  colors={product.colors}
                  selectedColor={selectedColor}
                  setSelectedColor={(color) => {
                    setSelectedColor(color);
                    setQuantity(1);
                  }}
                  variants={product.variants}
                  selectedSize={selectedSize}
                />
              )}

              {product.sizes.length > 0 && (
                <SizeSelector
                  sizes={product.sizes}
                  selectedSize={selectedSize}
                  setSelectedSize={(size) => {
                    setSelectedSize(size);
                    setSelectedSizes(size ? [size] : []);
                    setQuantity(1);
                  }}
                  selectedSizes={selectedSizes}
                  setSelectedSizes={(nextSizes) => {
                    const resolvedSizes = typeof nextSizes === "function"
                      ? nextSizes(selectedSizes)
                      : nextSizes;

                    setSelectedSizes(Array.isArray(resolvedSizes) ? resolvedSizes : []);
                    setSelectedSize(
                      Array.isArray(resolvedSizes) && resolvedSizes.length > 0
                        ? resolvedSizes[resolvedSizes.length - 1]
                        : ""
                    );
                    setQuantity(1);
                  }}
                  category={product.category}
                  sizeGuide={product.sizeGuide}
                  variants={product.variants}
                  selectedColor={selectedColor}
                  productQty={Number(product.product_qty ?? product.qty) || 0}
                  defaultSize={product.default_size || ""}
                  allowMultiple={allowMultipleSizes}
                />
              )}

              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#6B625C]">
                    Quantity
                  </p>
                  <div className="flex w-fit items-center border border-[#E5E5E5] bg-white">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1 || availableStock <= 0}
                      aria-label="Decrease quantity"
                      className="flex h-10 w-10 items-center justify-center text-[#292524] transition hover:bg-[#F6F1EA] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus size={15} />
                    </button>

                    <span className="flex h-10 w-10 items-center justify-center text-sm font-medium text-[#292524]">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={quantity >= quantityLimit || availableStock <= 0}
                      aria-label="Increase quantity"
                      className="flex h-10 w-10 items-center justify-center text-[#292524] transition hover:bg-[#F6F1EA] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
                <p
                  role="status"
                  className={`pb-2 text-xs ${
                    availableStock > 0 ? "text-[#397553]" : "text-[#9B3D42]"
                  }`}
                >
                  {availableStock > 0
                    ? `${availableStock} available`
                    : "Currently unavailable"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="group flex min-h-12 items-center justify-center gap-2 bg-[var(--color-primary)] px-4 py-3 text-xs font-semibold uppercase tracking-[1.2px] text-white transition-colors hover:bg-[var(--color-primary-hover)] sm:text-sm"
                >
                  <ShoppingBag size={16} />
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex min-h-12 items-center justify-center gap-2 border border-[#292524] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[1.2px] text-[#292524] transition-colors hover:bg-[#F6F1EA] sm:text-sm"
                >
                  Buy Now
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="border-t border-[#EAE4DE] pt-3">
                <button
                  type="button"
                  onClick={handleWishlist}
                  aria-pressed={isWishlisted}
                  className="inline-flex min-h-10 items-center gap-2 text-xs font-medium text-[#5D554F] transition hover:text-[var(--color-primary)]"
                >
                  <Heart
                    size={17}
                    fill={isWishlisted ? "currentColor" : "none"}
                    className={isWishlisted ? "text-[var(--color-primary)]" : ""}
                  />
                  {isWishlisted ? "Saved to wishlist" : "Add to wishlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.some(
        (relatedProduct) =>
          relatedProduct &&
          String(relatedProduct.id) !== String(product.id)
      ) && (
        <section className="mx-auto w-[92%] max-w-[1200px] pb-8">
          <div className="rounded-[20px] border border-[#F5F5F5] bg-white/60 p-3 sm:p-4 md:p-5">
            <RelatedProducts
              products={relatedProducts}
              currentProduct={product}
            />
          </div>
        </section>
      )}

      <section className="mx-auto w-[92%] max-w-[1200px] pb-12">
        <ReviewSection product={product} />
      </section>

      <section className="mx-auto w-[92%] max-w-[1200px] pb-12">
        <ProductComments product={product} />
      </section>
    </main>
  );
}
