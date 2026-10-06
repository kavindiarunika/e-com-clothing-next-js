"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";

import ProductImageGallery from "@/components/user/product/ProductImageGallery";
import ProductRating from "@/components/user/product/ProductRating";
import ColorSelector from "@/components/user/product/ColorSelector";
import SizeSelector from "@/components/user/product/SizeSelector";
import RelatedProducts from "@/components/user/product/RelatedProducts";
import ReviewSection from "@/components/user/product/ReviewSection";

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
          `/api/user/Product?status=active&category_id=${encodeURIComponent(product.category_id)}`,
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
      <main className="flex min-h-[60vh] items-center justify-center bg-[#EFE9E1] text-sm text-[#6B625D]">
        Loading product...
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#EFE9E1] px-6 text-center text-sm text-[#6B625D]">
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
    <main className="bg-[#EFE9E1]">
      <section className="mx-auto w-[92%] max-w-[1200px] py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
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
              <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 bg-[#E3DCD1] text-[#6B625D]">
                <ImageIcon size={32} strokeWidth={1.4} />
                <span className="text-xs">No product image available</span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[3px] text-[#72383D]">
              {product.category}
            </p>

            <h1 className="font-serif text-4xl leading-tight text-[#322D29] md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-4 text-sm">
              <ProductRating
                productId={product.id}
                defaultRating={product.rating}
                defaultReviews={product.reviews}
              />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-3xl font-semibold text-[#72383D]">
                Rs. {Math.round(discountedPrice).toLocaleString()}
              </span>

              {hasDiscount && (
                <span className="text-sm text-[#6B625C] line-through">
                  Rs. {originalPrice.toLocaleString()}
                </span>
              )}

              {hasDiscount && (
                <span className="bg-[#72383D] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <div
              className="product-description mt-6 text-sm leading-7 text-[#6B625C]"
              dangerouslySetInnerHTML={{
                __html: product.description || "",
              }}
            />

            <div className="mt-8 space-y-6">
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

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]">
                  Quantity
                </p>

                <div className="flex w-fit items-center border border-[#D8D0C8] bg-white">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1 || availableStock <= 0}
                    aria-label="Decrease quantity"
                    className="flex h-11 w-11 items-center justify-center text-xl text-[#322D29] transition hover:bg-[#F6F1EA] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ?
                  </button>

                  <span className="flex h-11 w-14 items-center justify-center text-sm font-medium text-[#322D29]">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= quantityLimit || availableStock <= 0}
                    aria-label="Increase quantity"
                    className="flex h-11 w-11 items-center justify-center text-xl text-[#322D29] transition hover:bg-[#F6F1EA] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#72383D] px-6 py-3 text-sm font-medium uppercase tracking-[1.5px] text-white transition hover:bg-[#5E2B30]"
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 border border-[#72383D] bg-transparent px-6 py-3 text-sm font-medium uppercase tracking-[1.5px] text-[#72383D] transition hover:bg-[#F6F1EA]"
                >
                  Buy Now
                </button>
              </div>

              <button
                type="button"
                onClick={handleWishlist}
                className="mt-2 flex items-center gap-2 self-start text-xs font-medium uppercase tracking-[1.5px] text-[#322D29]"
              >
                <span className={`text-base ${isWishlisted ? "text-[#72383D]" : "text-[#322D29]"}`}>
                  {isWishlisted ? "?" : "?"}
                </span>
                {isWishlisted ? "Saved to wishlist" : "Add to wishlist"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[92%] max-w-[1200px] pb-12">
        <div className="rounded-[24px] border border-[#E3DCD1] bg-white/60 p-6 md:p-8">
          <RelatedProducts
            products={relatedProducts}
            currentProduct={product}
          />
        </div>
      </section>

      <section className="mx-auto w-[92%] max-w-[1200px] pb-16">
        <ReviewSection product={product} />
      </section>
    </main>
  );
}
