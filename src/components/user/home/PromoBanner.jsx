"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

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
  const [offers, setOffers] = useState([]);

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
        setOffers(
          offerData
            .map((offer, index) => ({
              ...offer,
              banner_image:
                PROMO_BANNER_IMAGES[index % PROMO_BANNER_IMAGES.length],
              link: offer.link || "/user/shop",
            }))
            .filter(isOfferActive)
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Promo offers error:", error);
          setOffers([]);
        }
      }
    }

    void loadOffers();

    return () => controller.abort();
  }, []);

  const activeOffers = offers.filter(isOfferActive);

  if (activeOffers.length === 0) {
    return null;
  }

  return (
    <section className="w-full">

      <Swiper
        modules={[Autoplay]}
        loop={activeOffers.length > 1}
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

        {activeOffers.map((offer, index) => (
          <SwiperSlide key={offer.offer_id}>

            <div
              className={normalizeClassName(`
                group
                relative
                h-[50px]
                w-full
                overflow-hidden
                bg-[var(--color-dark)]
              `)}
            >

              {/* =====================================================
                  BACKGROUND IMAGE
              ===================================================== */}

              <img
                src={offer.banner_image}
                alt=""
                aria-hidden="true"
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

              <div className="relative z-10 flex h-full w-full items-center justify-center px-3 sm:px-6">

                <div className="flex w-full max-w-7xl items-center justify-center gap-2 sm:gap-4">

                  {/* Sparkle */}

                  <Sparkles
                    size={13}
                    strokeWidth={1.8}
                    className="hidden shrink-0 text-[var(--color-banner)] sm:block"
                  />

                  {/* Offer label */}

                  <span className="hidden text-[9px] font-semibold uppercase tracking-[1.8px] text-[var(--color-banner)] sm:block">
                    Velora Exclusive
                  </span>

                  {/* Separator */}

                  <span className="hidden h-3 w-px bg-white/30 sm:block" />

                  {/* Title */}

                  <p
                    className={normalizeClassName(`
                      min-w-0
                      truncate
                      text-center
                      text-[11px]
                      font-semibold
                      tracking-wide
                      text-white
                      sm:text-xs
                      md:text-sm
                    `)}
                  >
                    {offer.title}
                  </p>

                  {/* Description */}

                  {offer.description && (
                    <>
                      <span className="hidden h-3 w-px bg-white/25 md:block" />

                      <p
                        className={normalizeClassName(`
                          hidden
                          max-w-md
                          truncate
                          text-[11px]
                          text-white/70
                          lg:block
                        `)}
                      >
                        {offer.description}
                      </p>
                    </>
                  )}

                  {/* CTA */}

                  {offer.link && (
                    <Link
                      href={offer.link}
                      className={normalizeClassName(`
                        group/button
                        ml-1
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
                      <span className="hidden sm:inline">
                        Shop Now
                      </span>

                      <span className="sm:hidden">
                        Shop
                      </span>

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