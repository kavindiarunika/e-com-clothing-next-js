"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { sanitizeProductDescription } from "@/lib/productDescription";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import { useEffect, useState } from "react";

const AUTOPLAY_DELAY = 3500;
const PROMO_BANNER_IMAGES = [
  "/images/banners/banner1.jpg",
  "/images/banners/banner2.jpg",
  "/images/banners/banner3.jpg",
];
const DEFAULT_PROMO = {
  offer_id: "default-promo",
  title: "Explore the latest collection",
  banner_image: PROMO_BANNER_IMAGES[2],
  link: "/user/shop",
};

function formatOfferDate(dateValue) {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function normalizeClassName(className) {
  return className.trim().replace(/\s+/g, " ");
}

// =====================================================
// CHECK OFFER STATUS
// =====================================================

function isOfferActive(offer) {
  if (offer.status !== "active") {
    return false;
  }

  const now = new Date();

  if (
    offer.start_date &&
    new Date(offer.start_date) > now
  ) {
    return false;
  }

  if (
    offer.end_date &&
    new Date(offer.end_date) < now
  ) {
    return false;
  }

  return true;
}

// =====================================================
// PROMO BANNER
// =====================================================

export default function PromoBanner() {
  const [offers, setOffers] = useState([DEFAULT_PROMO]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOffers() {
      try {
        const response = await fetch("/api/user/offers", {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load offers");
        }

        const offerData = Array.isArray(result.data) ? result.data : [];
        const activeOffers = offerData
          .map((offer, index) => ({
            ...offer,
            banner_image: PROMO_BANNER_IMAGES[index % PROMO_BANNER_IMAGES.length],
            link: offer.link || "/user/shop",
          }))
          .filter(isOfferActive);

        setOffers(activeOffers.length > 0 ? activeOffers : [DEFAULT_PROMO]);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Promo offers error:", error);
          setOffers([DEFAULT_PROMO]);
        }
      }
    }

    void loadOffers();

    return () => controller.abort();
  }, []);

  const activeOffers = offers.filter(isOfferActive);

  const visibleOffers = activeOffers.length > 0 ? activeOffers : [DEFAULT_PROMO];

  return (
    <section className="w-full">

      <Swiper
        modules={[Autoplay]}
        loop={visibleOffers.length > 1}
        slidesPerView={1}
        spaceBetween={0}
        speed={700}
        autoplay={{
          delay: AUTOPLAY_DELAY,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        className="w-full"
      >

        {visibleOffers.map((offer) => (
          <SwiperSlide key={offer.offer_id}>
            <div
              className={normalizeClassName(`
                group
                relative
                min-h-[118px]
                w-full
                overflow-hidden
                bg-[var(--color-dark)]
                py-4
                md:min-h-[104px]
              `)}
            >

              {/* =====================================================
                  BACKGROUND IMAGE
              ===================================================== */}

              <Image
                src={offer.banner_image}
                alt=""
                aria-hidden="true"
                fill
                sizes="100vw"
                className={normalizeClassName(`
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-[4000ms]
                  group-hover:scale-[1.03]
                `)}
              />

              {/* =====================================================
                  DARK OVERLAY
              ===================================================== */}

              <div className="absolute inset-0 bg-[var(--color-dark)]/70" />

              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-dark)]/90 via-[var(--color-dark)]/65 to-[var(--color-dark)]/40" />

              {/* =====================================================
                  CONTENT
              ===================================================== */}

                  <div className="relative z-10 flex min-h-[86px] w-full items-center justify-center px-4 sm:px-6 md:min-h-[72px]">
                    <div className="flex w-full max-w-7xl flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
                  <Sparkles
                    size={13}
                    strokeWidth={1.8}
                        className="hidden shrink-0 text-[var(--color-banner)] md:block"
                  />

                      <span className="hidden shrink-0 text-[9px] font-semibold uppercase tracking-[1.8px] text-[var(--color-banner)] md:block">
                    Velora Exclusive
                  </span>

                      <div className="min-w-0 flex-1 text-center sm:text-left">
                        <p className="truncate text-xs font-semibold tracking-wide text-white sm:text-sm">
                          {offer.title}
                        </p>
                        {offer.description && (
                          <div
                            className="mx-auto mt-1 line-clamp-2 max-w-3xl text-[11px] leading-snug text-white/75 sm:mx-0"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeProductDescription(offer.description),
                            }}
                          />
                        )}
                      </div>

                      {(formatOfferDate(offer.start_date) || formatOfferDate(offer.end_date)) && (
                        <p className="shrink-0 text-[10px] font-medium text-white/80">
                          {formatOfferDate(offer.start_date) && formatOfferDate(offer.end_date)
                            ? `Valid ${formatOfferDate(offer.start_date)} - ${formatOfferDate(offer.end_date)}`
                            : `Valid ${formatOfferDate(offer.start_date || offer.end_date)}`}
                        </p>
                      )}

                  {offer.link && (
                    <Link
                      href={offer.link}
                      className={normalizeClassName(`
                        group/button
                        inline-flex
                        shrink-0
                        items-center
                        gap-1.5
                        border-b
                        border-white/70
                        pb-0.5
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[1.2px]
                        text-white
                        transition-all
                        duration-300
                        hover:border-[var(--color-banner)]
                        hover:text-[var(--color-banner)]
                        sm:text-[10px]
                      `)}
                    >
                      <span>Get Offer</span>

                      <ArrowRight
                        size={12}
                        strokeWidth={1.8}
                        className={normalizeClassName(`
                          transition-transform
                          duration-300
                          group-hover/button:translate-x-1
                        `)}
                      />
                    </Link>
                  )}
                </div>
              </div>

              {/* =====================================================
                  BOTTOM PROGRESS LINE
              ===================================================== */}

              <div className="absolute bottom-0 left-0 z-20 h-[2px] w-full bg-white/10">
                <div
                  className={normalizeClassName(`
                    h-full
                    w-1/3
                    bg-[var(--color-banner)]
                    opacity-80
                  `)}
                />
              </div>

            </div>

          </SwiperSlide>
        ))}

      </Swiper>

    </section>
  );
}