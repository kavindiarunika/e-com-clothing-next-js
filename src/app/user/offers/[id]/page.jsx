"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";
import SearchBar from "@/components/user/shop/SearchBar";
import FilterSidebar from "@/components/user/shop/FilterSidebar";
import SortDropdown from "@/components/user/shop/SortDropdown";

function formatPrice(value) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getOfferStatus(offer) {
  if (!offer) return "inactive";

  const now = Date.now();
  const startDate = offer.start_date ? new Date(offer.start_date).getTime() : null;
  const endDate = offer.end_date ? new Date(offer.end_date).getTime() : null;

  if (startDate && startDate > now) return "upcoming";
  if (endDate && endDate < now) return "expired";
  return offer.status || "active";
}

function getCountdownParts(endDate) {
  if (!endDate) return null;

  const now = Date.now();
  const diff = Math.max(0, new Date(endDate).getTime() - now);

  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { expired: false, days, hours, minutes, seconds };
}

function getProductStock(product) {
  const variantStock = (product.variants || []).reduce(
    (total, variant) => total + (Number(variant.stock) || 0),
    0
  );

  return variantStock > 0
    ? variantStock
    : Number(product.stock ?? product.qty ?? product.total_stock ?? 0);
}

function getDiscountedPrice(product) {
  const originalPrice = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;

  if (discount <= 0 || originalPrice <= 0) return originalPrice;
  return originalPrice - (originalPrice * discount) / 100;
}

export default function OfferDetailPage() {
  const params = useParams();
  const offerId = params?.id;
  const [offer, setOffer] = useState(null);
  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState({ expired: false, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (!offerId) return;

    const controller = new AbortController();

    async function loadOffer() {
      try {
        const offerResponse = await fetch(
          `/api/user/offers/${encodeURIComponent(String(offerId))}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const offerResult = await offerResponse.json();

        if (!offerResponse.ok || !offerResult.success) {
          throw new Error(offerResult.message || "Offer not found");
        }

        const nextOffer = offerResult.data || null;
        setOffer(nextOffer);

        const productResponse = await fetch(
          `/api/user/Product?status=active&offer_id=${encodeURIComponent(String(offerId))}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const productResult = await productResponse.json();

        if (!productResponse.ok) {
          throw new Error(productResult.message || "Failed to load offer products");
        }

        const eligibleProducts = Array.isArray(productResult.data)
          ? productResult.data
          : [];

        setProducts(eligibleProducts);

        const allProductsResponse = await fetch("/api/user/Product?status=active", {
          signal: controller.signal,
          cache: "no-store",
        });

        const allProductsResult = await allProductsResponse.json();

        if (!allProductsResponse.ok) {
          throw new Error(allProductsResult.message || "Failed to load recommended products");
        }

        const allProducts = Array.isArray(allProductsResult.data)
          ? allProductsResult.data
          : [];

        const productIds = new Set(eligibleProducts.map((product) => product.item_id));
        const categoryIds = new Set(
          eligibleProducts
            .map((product) => product.category_id)
            .filter((id) => id != null && id !== "")
        );

        const recommended = allProducts.filter((product) => {
          const sameProduct = productIds.has(product.item_id);
          const sameCategory = categoryIds.has(product.category_id);
          return !sameProduct && (sameCategory || !productIds.size);
        }).slice(0, 4);

        setRecommendedProducts(recommended);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          console.error("Offer detail error:", loadError);
          setError("This offer could not be loaded right now.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadOffer();
    return () => controller.abort();
  }, [offerId]);

  useEffect(() => {
    if (!offer?.end_date) return;

    const tick = () => setCountdown(getCountdownParts(offer.end_date));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [offer]);

  const offerStatus = useMemo(() => getOfferStatus(offer), [offer]);

  const offerStatusLabel =
    offerStatus === "expired"
      ? "Expired"
      : offerStatus === "upcoming"
        ? "Upcoming"
        : "Active";

  const filteredProducts = useMemo(() => {
    let result = [...products];
    const search = searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter((product) =>
        [product.title, product.category_name]
          .some((value) => value?.toLowerCase().includes(search))
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter(
        (product) => product.category_name === selectedCategory
      );
    }

    if (selectedPrice) {
      result = result.filter((product) => {
        const price = getDiscountedPrice(product);
        if (selectedPrice === "under5000") return price < 5000;
        if (selectedPrice === "5000-10000") {
          return price >= 5000 && price <= 10000;
        }
        return price > 10000;
      });
    }

    if (selectedSizes.length) {
      result = result.filter((product) => {
        const availableSizes = [
          ...(Array.isArray(product.sizes) ? product.sizes : []),
          ...(product.variants || []).map((variant) => variant.size),
        ];
        return selectedSizes.some((size) => availableSizes.includes(size));
      });
    }

    if (selectedAvailability !== "all") {
      result = result.filter((product) => {
        const isAvailable = getProductStock(product) > 0;
        return selectedAvailability === "available"
          ? isAvailable
          : !isAvailable;
      });
    }

    if (sortBy === "newest") {
      result.sort(
        (first, second) =>
          new Date(second.created_at || 0).getTime() -
          new Date(first.created_at || 0).getTime()
      );
    } else if (sortBy === "price-low") {
      result.sort(
        (first, second) =>
          getDiscountedPrice(first) - getDiscountedPrice(second)
      );
    } else if (sortBy === "price-high") {
      result.sort(
        (first, second) =>
          getDiscountedPrice(second) - getDiscountedPrice(first)
      );
    } else if (sortBy === "rating") {
      result.sort(
        (first, second) =>
          Number(second.rating || 0) - Number(first.rating || 0)
      );
    } else if (sortBy === "name") {
      result.sort((first, second) =>
        (first.title || "").localeCompare(second.title || "")
      );
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedPrice,
    selectedSizes,
    selectedAvailability,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedPrice("");
    setSelectedSizes([]);
    setSelectedAvailability("all");
    setSortBy("newest");
  };

  const handleQuickAddToCart = (product) => {
    const stock = getProductStock(product);
    if (stock <= 0) return;

    const savedCart = JSON.parse(localStorage.getItem("velora-cart") || "[]");
    const cartItem = {
      productId: product.item_id,
      name: product.title,
      price: Math.round(getDiscountedPrice(product)),
      originalPrice: Math.round(Number(product.price) || 0),
      image: product.image || product.main_image || "/images/products/shirt1.webp",
      size: product.sizes?.[0] || "",
      color: product.colors?.[0]?.name || "",
      quantity: 1,
      variantId: product.variants?.[0]?.variant_id || null,
      stock,
    };

    const existingItemIndex = savedCart.findIndex(
      (item) =>
        item.productId === cartItem.productId &&
        item.size === cartItem.size &&
        item.color === cartItem.color
    );

    if (existingItemIndex !== -1) {
      const currentQty = Number(savedCart[existingItemIndex].quantity) || 0;
      if (currentQty + 1 > cartItem.stock) {
        alert(`Only ${cartItem.stock} items are available for this product.`);
        return;
      }
      savedCart[existingItemIndex].quantity = currentQty + 1;
    } else {
      savedCart.push(cartItem);
    }

    localStorage.setItem("velora-cart", JSON.stringify(savedCart));
    window.dispatchEvent(new Event("velora-cart-updated"));
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#EFE9E1] text-sm text-[#6B625D]">
        Loading offer...
      </main>
    );
  }

  if (error || !offer) {
    return (
      <main className="min-h-screen bg-[#EFE9E1] px-5 py-12">
        <div className="mx-auto max-w-xl bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[3px] text-[#72383D]">
            Offer unavailable
          </p>
          <h1 className="mt-4 font-serif text-3xl text-[#322D29]">We couldn’t find this offer</h1>
          <p className="mt-3 text-sm leading-6 text-[#6B625C]">
            {error || "The offer may have expired or been removed."}
          </p>
          <Link
            href="/user/offers"
            className="mt-6 inline-flex items-center gap-2 bg-[#72383D] px-5 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#322D29]"
          >
            <ArrowLeft size={15} />
            Back to offers
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">
      <div className="mx-auto w-[92%] max-w-[1440px] py-4">
        <Link
          href="/user/offers"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[2px] text-[#72383D] transition hover:text-[#322D29]"
        >
          <ArrowLeft size={15} />
          Back to offers
        </Link>
      </div>

      <section className="user-page-full-bleed relative isolate h-[400px] w-full overflow-hidden bg-[#322D29] text-white">
        {offer.banner_image && (
          <Image
            src={offer.banner_image}
            alt={offer.title}
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-20 object-cover"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#171310]/95 via-[#171310]/75 to-[#171310]/40" />

        <div className="relative mx-auto flex h-full w-[92%] max-w-[1440px] flex-col justify-center pt-10">
          <div className="max-w-3xl">
            {offer.end_date && (
              <div className="mb-4 w-fit border border-white/20 bg-black/35 px-4 py-3 text-white shadow-xl backdrop-blur-sm sm:px-5 sm:py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[2.5px] text-white/75">
                  Offer ends in:
                </p>
                <div
                  className="mt-2 grid grid-cols-4 gap-2 text-center"
                  aria-label={
                    countdown.expired
                      ? "Offer has ended"
                      : `${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, ${countdown.seconds} seconds remaining`
                  }
                >
                  {[
                    { label: "Days", value: countdown.days },
                    { label: "Hours", value: countdown.hours },
                    { label: "Minutes", value: countdown.minutes },
                    { label: "Seconds", value: countdown.seconds },
                  ].map(({ label, value }) => (
                    <div key={label} className="min-w-12 bg-white/10 px-2 py-1.5">
                      <span className="block font-serif text-2xl leading-none tabular-nums sm:text-3xl">
                        {String(countdown.expired ? 0 : value).padStart(2, "0")}
                      </span>
                      <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[1.2px] text-white/70 sm:text-[9px]">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                {countdown.expired && (
                  <p className="mt-2 text-xs text-white/70">This offer has ended</p>
                )}
              </div>
            )}

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[2px] text-white backdrop-blur-sm">
                  <Tag size={12} />
                  Limited Time Offer
                </span>
                <span className="inline-flex items-center gap-2 border border-white/30 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[2px] text-white backdrop-blur-sm">
                  {offerStatusLabel}
                </span>
              </div>

              <h1 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
                {offer.title}
              </h1>
          </div>
        </div>
      </section>

      <section id="eligible-products" className="w-full pt-10 pb-8 md:pt-14 md:pb-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl text-[#322D29]">Products included in this offer</h2>
          </div>
          <div className="text-sm text-[#6B625C]">{filteredProducts.length} items</div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 border border-[#D8D0C8] bg-white px-4 py-2.5 text-sm text-[#322D29]"
          >
            <SlidersHorizontal size={17} />
            Filters
          </button>

          <SortDropdown
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        <div className="flex gap-6 lg:gap-8">
          <aside
            id="offer-filter-sidebar"
            className="hidden w-[220px] shrink-0 md:block lg:w-[250px]"
          >
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto border border-[#DED5CB] border-t-2 border-t-[#72383D] bg-gradient-to-b from-white to-[#FAF7F3] p-5 shadow-[0_12px_32px_rgba(50,45,41,0.08)] lg:p-6">
              <div className="mb-6 rounded-sm bg-[#F3EEE8] p-2">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
              </div>

              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-serif text-lg text-[#322D29]">Filters</h3>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-[#72383D] hover:underline"
                >
                  Clear
                </button>
              </div>

              <div className="mb-6 border-b border-[#E7DED5] pb-6">
                <label
                  htmlFor="offer-sort-desktop"
                  className="mb-3 block text-[10px] font-semibold uppercase tracking-[1.5px] text-[#786E66]"
                >
                  Sort by
                </label>
                <SortDropdown
                  id="offer-sort-desktop"
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </div>

              <FilterSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
                selectedSizes={selectedSizes}
                setSelectedSizes={setSelectedSizes}
                selectedAvailability={selectedAvailability}
                setSelectedAvailability={setSelectedAvailability}
              />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
        {filteredProducts.length ? (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const stock = getProductStock(product);
              const soldOut = stock <= 0;
              const discounted = getDiscountedPrice(product);
              const originalPrice = Number(product.price) || 0;
              const discountPercent = Number(product.discount) || 0;
              const productImage = product.image || product.main_image || "/images/products/shirt1.webp";

              return (
                <article key={product.item_id} className="group overflow-hidden border border-[#F0E6E1] bg-white shadow-sm transition hover:-translate-y-0.5">
                  <div className="relative aspect-[4/5] bg-[#E7E0D9]">
                    <Image
                      src={productImage}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.04]"
                    />
                    {discountPercent > 0 && !soldOut && (
                      <span className="absolute left-2 top-2 bg-[#72383D] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-white">
                        -{discountPercent}%
                      </span>
                    )}
                    {soldOut && (
                      <span className="absolute left-2 top-2 bg-[#322D29] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-white">
                        Sold out
                      </span>
                    )}
                  </div>

                  <div className="p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-semibold uppercase tracking-[2px] text-[#72383D]">
                        {product.category_name || "Featured"}
                      </span>
                      <span className={`text-[9px] font-semibold uppercase tracking-[2px] ${stock > 0 ? "text-[#1F6F4A]" : "text-[#8B3A41]"}`}>
                        {stock > 0 ? `${stock} left` : "Out of stock"}
                      </span>
                    </div>

                    <Link href={`/user/product/${product.item_id}`}>
                      <h3 className="mt-2 line-clamp-2 font-serif text-xl leading-tight text-[#322D29] hover:text-[#72383D]">
                        {product.title}
                      </h3>
                    </Link>

                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-base font-semibold text-[#322D29]">{formatPrice(discounted)}</span>
                      {originalPrice > discounted && (
                        <span className="text-xs text-[#8A8178] line-through">{formatPrice(originalPrice)}</span>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/user/product/${product.item_id}`}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 border border-[#72383D] px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[1.4px] text-[#72383D] transition hover:bg-[#72383D] hover:text-white"
                      >
                        View
                        <ArrowRight size={12} />
                      </Link>

                      {!soldOut && (
                        <button
                          type="button"
                          onClick={() => handleQuickAddToCart(product)}
                          className="inline-flex items-center justify-center bg-[#322D29] p-2.5 text-white transition hover:bg-[#72383D]"
                          aria-label={`Quick add ${product.title} to cart`}
                        >
                          <ShoppingBag size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-[#6B625C]">
              {products.length
                ? "No products match these filters. Try changing your search or filters."
                : "No eligible products are currently linked to this offer."}
            </p>
            {products.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 bg-[#72383D] px-5 py-2.5 text-xs font-semibold uppercase tracking-[1px] text-white transition hover:bg-[#5E2E33]"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
          </div>
        </div>
      </section>

      

      {recommendedProducts.length > 0 && (
        <section className="mx-auto w-[92%] max-w-[1200px] pb-14">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[3px] text-[#72383D]">Recommended</p>
              <h2 className="mt-2 font-serif text-3xl text-[#322D29]">More styles you may like</h2>
            </div>
            <Link href="/user/shop" className="text-xs font-semibold uppercase tracking-[2px] text-[#72383D] hover:text-[#322D29]">
              View all
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recommendedProducts.map((product) => {
              const productImage = product.image || product.main_image || "/images/products/shirt1.webp";
              const discounted = getDiscountedPrice(product);
              const originalPrice = Number(product.price) || 0;
              const discountPercent = Number(product.discount) || 0;

              return (
                <article key={product.item_id} className="group overflow-hidden border border-[#F0E6E1] bg-white shadow-sm transition hover:-translate-y-0.5">
                  <div className="relative aspect-[4/5] bg-[#E7E0D9]">
                    <Image
                      src={productImage}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.04]"
                    />
                    {discountPercent > 0 && (
                      <span className="absolute left-2 top-2 bg-[#72383D] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-white">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  <div className="p-3.5">
                    <Link href={`/user/product/${product.item_id}`}>
                      <h3 className="line-clamp-2 font-serif text-xl leading-tight text-[#322D29] hover:text-[#72383D]">{product.title}</h3>
                    </Link>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-base font-semibold text-[#322D29]">{formatPrice(discounted)}</span>
                      {originalPrice > discounted && (
                        <span className="text-xs text-[#8A8178] line-through">{formatPrice(originalPrice)}</span>
                      )}
                    </div>
                    <Link
                      href={`/user/product/${product.item_id}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[1.4px] text-[#72383D]"
                    >
                      View Product
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-[85%] max-w-[360px] overflow-y-auto bg-[#EFE9E1]">
            <div className="flex items-center justify-between border-b border-[#D8D0C8] bg-white px-5 py-5">
              <h2 className="font-serif text-xl text-[#322D29]">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="text-[#322D29]"
              >
                <X size={22} />
              </button>
            </div>

            <div className="bg-gradient-to-b from-white to-[#FAF7F3] p-6">
              <div className="mb-6 rounded-sm bg-[#F3EEE8] p-2">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
              </div>

              <div className="mb-6 border-b border-[#E7DED5] pb-6">
                <label
                  htmlFor="offer-sort-mobile"
                  className="mb-3 block text-[10px] font-semibold uppercase tracking-[1.5px] text-[#786E66]"
                >
                  Sort by
                </label>
                <SortDropdown
                  id="offer-sort-mobile"
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </div>

              <div className="mb-6 flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-[#72383D] hover:underline"
                >
                  Clear All
                </button>
              </div>

              <FilterSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
                selectedSizes={selectedSizes}
                setSelectedSizes={setSelectedSizes}
                selectedAvailability={selectedAvailability}
                setSelectedAvailability={setSelectedAvailability}
              />

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-8 w-full bg-[#72383D] py-3.5 text-xs font-medium uppercase tracking-[1px] text-white"
              >
                Show {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
