"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gift,
  Percent,
  ShieldCheck,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { sanitizeProductDescription } from "@/lib/productDescription";

function formatOfferDate(value) {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

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
    if (!offer || !offer.end_date) {
      setCountdown({ expired: false, days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const tick = () => setCountdown(getCountdownParts(offer.end_date));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [offer]);

  const offerStatus = useMemo(() => getOfferStatus(offer), [offer]);
  const dealSummary = useMemo(() => {
    if (!products.length) return "Exclusive savings for selected styles";

    const maxDiscount = Math.max(
      ...products.map((product) => Number(product.discount) || 0),
      0
    );

    if (maxDiscount > 0) return `Up to ${maxDiscount}% OFF selected styles`;
    return "Special offer on selected styles";
  }, [products]);

  const offerStatusLabel =
    offerStatus === "expired"
      ? "Expired"
      : offerStatus === "upcoming"
        ? "Upcoming"
        : "Active";

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

  const validDates =
    offer.start_date || offer.end_date
      ? `${offer.start_date ? `From ${formatOfferDate(offer.start_date)}` : ""}${
          offer.start_date && offer.end_date ? " · " : ""
        }${offer.end_date ? `Until ${formatOfferDate(offer.end_date)}` : ""}`
      : "";

  const displayDealText = offer.description
    ? sanitizeProductDescription(offer.description)
    : dealSummary;

  return (
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">
      <section className="mx-auto w-[92%] max-w-[1200px] py-8 md:py-12">
        <Link
          href="/user/offers"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[2px] text-[#72383D] transition hover:text-[#322D29]"
        >
          <ArrowLeft size={15} />
          Back to offers
        </Link>

        <div className="overflow-hidden bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-center p-6 md:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 bg-[#F3E8E2] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[2px] text-[#72383D]">
                  <Tag size={12} />
                  Limited Time Offer
                </span>
                <span className="inline-flex items-center gap-2 border border-[#D9CFC6] bg-[#F7F2EE] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[2px] text-[#4E463F]">
                  {offerStatusLabel}
                </span>
              </div>

              <h1 className="mt-5 font-serif text-4xl leading-tight text-[#322D29] md:text-5xl">
                {offer.title}
              </h1>

              <div className="mt-5 max-w-xl text-sm leading-7 text-[#6B625C]">
                <div dangerouslySetInnerHTML={{ __html: displayDealText }} />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#4F4742]">
                {validDates && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#D9CFC6] bg-[#F7F2EE] px-4 py-2 text-xs font-medium">
                    <CalendarDays size={14} />
                    {validDates}
                  </div>
                )}

                {offer.end_date && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#D9CFC6] bg-[#F7F2EE] px-4 py-2 text-xs font-medium">
                    <Clock3 size={14} />
                    {countdown.expired ? "Offer expired" : `Ends in ${countdown.days}d ${String(countdown.hours).padStart(2, "0")}h ${String(countdown.minutes).padStart(2, "0")}m`}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById("eligible-products")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="inline-flex items-center gap-2 bg-[#72383D] px-5 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#322D29]"
                >
                  Shop This Offer
                  <ArrowRight size={15} />
                </button>
                <Link
                  href="/user/shop"
                  className="inline-flex items-center gap-2 border border-[#72383D] px-5 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-[#72383D] transition hover:bg-[#72383D] hover:text-white"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

            <div className="relative min-h-[360px] bg-[#D8D0C8] lg:min-h-full">
              {offer.banner_image && (
                <Image
                  src={offer.banner_image}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[92%] max-w-[1200px] pb-8 md:pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Percent,
              title: "Exclusive savings",
              text: dealSummary,
            },
            {
              icon: Gift,
              title: "Special bundles",
              text: "Selected pieces are handpicked for this limited-time promotion and curated for instant styling.",
            },
            {
              icon: ShieldCheck,
              title: "Fast checkout",
              text: "Enjoy a secure, fast, and flexible shopping experience with easy product discovery.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center bg-[#F3E8E2] text-[#72383D]">
                <Icon size={20} />
              </div>
              <h3 className="font-serif text-xl text-[#322D29]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#6B625C]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-[92%] max-w-[1200px] pb-8 md:pb-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#72383D]">Offer details</p>
            <h2 className="mt-2 font-serif text-3xl text-[#322D29]">What this promotion includes</h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[2px] text-[#72383D]">Deal summary</p>
            <div className="mt-4 space-y-4 text-sm text-[#6B625C]">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 text-[#72383D]" size={18} />
                <span>{dealSummary}</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 text-[#72383D]" size={18} />
                <span>Selected products only. Minimum purchase requirements may apply depending on the promotion.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 text-[#72383D]" size={18} />
                <span>Offer is valid while stock lasts and cannot be combined with other ongoing promotions.</span>
              </div>
            </div>
          </div>

          <div className="bg-[#322D29] p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#E3DCD1]">Countdown</p>
            <h3 className="mt-3 font-serif text-3xl text-white">{countdown.expired ? "Offer expired" : `Offer ends in ${countdown.days} Days`}</h3>
            {!countdown.expired && (
              <div className="mt-6 grid grid-cols-4 gap-3 text-center">
                {[
                  { label: "Days", value: countdown.days },
                  { label: "Hours", value: countdown.hours },
                  { label: "Minutes", value: countdown.minutes },
                  { label: "Seconds", value: countdown.seconds },
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 p-3">
                    <div className="text-2xl font-semibold text-white">{String(item.value).padStart(2, "0")}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[2px] text-[#E3DCD1]">{item.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="eligible-products" className="mx-auto w-[92%] max-w-[1200px] pb-8 md:pb-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#72383D]">Eligible products</p>
            <h2 className="mt-2 font-serif text-3xl text-[#322D29]">Products included in this offer</h2>
          </div>
          <div className="text-sm text-[#6B625C]">{products.length} items</div>
        </div>

        {products.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => {
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
            <p className="text-sm text-[#6B625C]">No eligible products are currently linked to this offer.</p>
          </div>
        )}
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
    </main>
  );
}
