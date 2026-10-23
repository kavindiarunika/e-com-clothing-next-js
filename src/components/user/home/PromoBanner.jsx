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
  link: "/user/offers",
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
          .map((offer) => ({
            ...offer,
            banner_image: offer.banner_image || PROMO_BANNER_IMAGES[0],
            link: `/user/offers/${encodeURIComponent(String(offer.offer_id))}`,
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
    <section
      aria-label="Current offers"
      className="promo-card-entry absolute bottom-3 right-3 z-40 w-[calc(100%-1.5rem)] max-w-[500px] sm:bottom-5 sm:right-[5%]"
    >

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
                min-h-[240px]
                w-full
                rounded-xl
                border
                border-white/80
                overflow-hidden
                bg-[var(--color-dark)]
                py-6
                shadow-[0_12px_36px_rgba(0,0,0,0.32)]
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
                sizes="(max-width: 640px) calc(100vw - 24px), 500px"
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

              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-dark)]/90 via-[var(--color-dark)]/70 to-[var(--color-dark)]/45" />

              {/* =====================================================
                  CONTENT
              ===================================================== */}

              <div className="relative z-10 flex min-h-[208px] w-full items-center px-5 py-6 sm:px-7">
                <div className="flex w-full flex-col items-start gap-4">
                  <div className="flex items-center gap-2 text-[var(--color-banner)]">
                    <Sparkles size={15} strokeWidth={1.8} />
                    <span className="text-[10px] font-semibold uppercase tracking-[2px]">
                      Exclusive Offer
                    </span>
                  </div>

                  <div className="w-full">
                    <h2 className="text-xl font-semibold leading-tight tracking-wide text-white sm:text-2xl">
                      {offer.title}
                    </h2>
                    {offer.description && (
                      <div
                        className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/85 sm:text-base"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeProductDescription(offer.description),
                        }}
                      />
                    )}
                  </div>

                  <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-white/20 pt-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      {(formatOfferDate(offer.start_date) || formatOfferDate(offer.end_date)) && (
                        <p className="text-xs font-medium text-white/80">
                          {formatOfferDate(offer.start_date) && formatOfferDate(offer.end_date)
                            ? `Valid ${formatOfferDate(offer.start_date)} - ${formatOfferDate(offer.end_date)}`
                            : `Valid ${formatOfferDate(offer.start_date || offer.end_date)}`}
                        </p>
                      )}
                    </div>

                    {offer.link && (
                      <Link
                        href={offer.link}
                        className="group/button inline-flex min-h-10 items-center gap-2 bg-[var(--color-banner)] px-4 py-2 text-[10px] font-bold uppercase tracking-[1.2px] text-white transition-colors duration-300 hover:bg-[#c92f50] sm:text-xs"
                      >
                        <span>Get Offer</span>
                        <ArrowRight
                          size={14}
                          strokeWidth={1.8}
                          className="transition-transform duration-300 group-hover/button:translate-x-1"
                        />
                      </Link>
                    )}
                  </div>
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