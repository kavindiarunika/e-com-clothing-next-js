
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const AUTOPLAY_DELAY = 3500;

const offers = [
  {
    offer_id: 1,
    title: "New Season Collection",
    description: "Discover timeless styles made for your everyday look.",
    banner_image: "/images/banners/banner1.jpg",
    link: "/user/shop",
    start_date: "2026-09-01 00:00:00",
    end_date: "2026-12-31 23:59:59",
    status: "active",
  },
  {
    offer_id: 2,
    title: "Women's Collection",
    description: "Elegant pieces designed to elevate your wardrobe.",
    banner_image: "/images/banners/banner2.jpg",
    link: "/user/women",
    start_date: "2026-09-01 00:00:00",
    end_date: "2026-12-31 23:59:59",
    status: "active",
  },
  {
    offer_id: 3,
    title: "Men's Collection",
    description: "Modern essentials with a refined Velora touch.",
    banner_image: "/images/banners/banner3.jpg",
    link: "/user/men",
    start_date: "2026-09-01 00:00:00",
    end_date: "2026-12-31 23:59:59",
    status: "active",
  },
];

function isOfferActive(offer) {
  if (offer.status !== "active") {
    return false;
  }

  const now = new Date();

  if (offer.start_date && new Date(offer.start_date) > now) {
    return false;
  }

  if (offer.end_date && new Date(offer.end_date) < now) {
    return false;
  }

  return true;
}

export default function PromoBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeOffers = offers.filter(isOfferActive);

  if (activeOffers.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[var(--color-bg)] px-3 py-5 sm:px-5 md:px-6">
      <div className="mx-auto w-full max-w-[1200px]">
<Swiper
  modules={[Autoplay]}
  loop={true}
  spaceBetween={24}
  autoplay={{
    delay: 3500,
    disableOnInteraction: false,
  }}
  breakpoints={{
    0: {
      slidesPerView: 1,
    },
    768: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 2,
    },
  }}
>
          {activeOffers.map((offer, index) => (
            <SwiperSlide key={offer.offer_id}>
              <div
                className={`
                  group
                  relative
                  h-[200px]
                  w-full
                  overflow-hidden
                  rounded-md
                  sm:h-[200px]
                  md:h-[200px]
                `}
              >
                {/* =====================================================
                    BACKGROUND IMAGE
                ===================================================== */}

                <div
                  className={`absolute inset-0 ${
                    activeIndex === index ? "promo-image-active" : ""
                  }`}
                >
                  <Image
                    src={offer.banner_image}
                    alt={offer.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className="object-cover"
                  />
                </div>

                {/* =====================================================
                    IMAGE OVERLAY
                ===================================================== */}

                <div className="absolute inset-0 bg-[var(--color-dark)]/50" />

                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-dark)]/85 via-[var(--color-dark)]/40 to-transparent" />

                {/* =====================================================
                    CONTENT
                ===================================================== */}

                <div className="relative z-10 flex h-full items-center px-5 sm:px-8 md:px-10">
                  <div className="flex w-full items-center justify-between gap-4">
                    {/* LEFT SIDE */}

                    <div className="min-w-0 flex-1">
                      {/* Label */}

                      <div className="mb-1 flex items-center gap-2">
                        <Sparkles
                          size={11}
                          strokeWidth={1.8}
                          className="shrink-0 text-[var(--color-banner)]"
                        />

                        <span
                          className={`
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[2px]
                            text-[var(--color-banner)]
                            sm:text-[10px]
                          `}
                        >
                          Velora Exclusive
                        </span>
                      </div>

                      {/* Title */}

                      <h2
                        className={`
                          truncate
                          text-sm
                          font-semibold
                          tracking-wide
                          text-[var(--color-white)]
                          sm:text-base
                          md:text-lg
                        `}
                      >
                        {offer.title}
                      </h2>

                      {/* Description */}

                      {offer.description && (
                        <p
                          className={`
                            mt-0.5
                            hidden
                            max-w-[600px]
                            truncate
                            text-[10px]
                            leading-relaxed
                            text-[var(--color-white)]/75
                            sm:block
                            md:text-xs
                          `}
                        >
                          {offer.description}
                        </p>
                      )}
                    </div>

                    {/* =================================================
                        BUTTON
                    ================================================= */}

                    {offer.link && (
                      <Link
                        href={offer.link}
                        className={`
                          group/button
                          inline-flex
                          shrink-0
                          items-center
                          gap-2
                          border
                          border-[var(--color-white)]/60
                          bg-[var(--color-white)]
                          px-4
                          py-2.5
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[1.2px]
                          text-[var(--color-dark)]
                          transition-all
                          duration-300
                          hover:border-[var(--color-primary)]
                          hover:bg-[var(--color-primary)]
                          hover:text-[var(--color-white)]
                          sm:px-5
                          sm:py-3
                          sm:text-[10px]
                        `}
                      >
                        <span className="hidden sm:inline">
                          Shop Collection
                        </span>

                        <span className="sm:hidden">
                          Shop
                        </span>

                        <ArrowRight
                          size={13}
                          className={`
                            transition-transform
                            duration-300
                            group-hover/button:translate-x-1
                          `}
                        />
                      </Link>
                    )}
                  </div>
                </div>

                {/* =====================================================
                    DECORATIVE BORDERS
                ===================================================== */}

                <div
                  className={`
                    absolute
                    left-0
                    right-0
                    top-0
                    z-20
                    h-px
                    bg-[var(--color-white)]/20
                  `}
                />

                <div
                  className={`
                    absolute
                    bottom-0
                    left-0
                    right-0
                    z-20
                    h-px
                    bg-[var(--color-white)]/10
                  `}
                />
              </div>
            </SwiperSlide>
          ))}

          {/* =========================================================
              PREVIOUS BUTTON
          ========================================================= */}

          {activeOffers.length > 1 && (
            <button
              type="button"
              aria-label="Previous offer"
              className={`
                promo-prev
                absolute
                left-2
                top-1/2
                z-30
                hidden
                h-7
                w-7
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-[var(--color-white)]/30
                bg-[var(--color-dark)]/30
                text-[var(--color-white)]
                backdrop-blur-sm
                transition-all
                duration-300
                hover:border-[var(--color-white)]
                hover:bg-[var(--color-white)]
                hover:text-[var(--color-dark)]
                sm:flex
                md:left-3
              `}
            >
              <ArrowLeft
                size={12}
                strokeWidth={1.8}
              />
            </button>
          )}

          {/* =========================================================
              NEXT BUTTON
          ========================================================= */}

          {activeOffers.length > 1 && (
            <button
              type="button"
              aria-label="Next offer"
              className={`
                promo-next
                absolute
                right-2
                top-1/2
                z-30
                hidden
                h-7
                w-7
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-[var(--color-white)]/30
                bg-[var(--color-dark)]/30
                text-[var(--color-white)]
                backdrop-blur-sm
                transition-all
                duration-300
                hover:border-[var(--color-white)]
                hover:bg-[var(--color-white)]
                hover:text-[var(--color-dark)]
                sm:flex
                md:right-3
              `}
            >
              <ArrowRight
                size={12}
                strokeWidth={1.8}
              />
            </button>
          )}
        </Swiper>
      </div>

      {/* ===========================================================
          CUSTOM SWIPER CSS
      =========================================================== */}

      <style jsx global>{`
        .promo-swiper {
          padding-bottom: 20px !important;
        }

        /* Pagination */

        .promo-swiper .swiper-pagination {
          bottom: 0 !important;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 4px;
        }

        .promo-swiper .swiper-pagination-bullet {
          width: 5px;
          height: 5px;

          margin: 0 !important;

          border-radius: 999px;

          background: var(--color-dark);

          opacity: 0.25;

          transition:
            width 0.3s ease,
            opacity 0.3s ease,
            background 0.3s ease;
        }

        .promo-swiper .swiper-pagination-bullet-active {
          width: 18px;

          border-radius: 999px;

          background: var(--color-primary);

          opacity: 1;
        }

        /* =========================================================
           IMAGE ZOOM
        ========================================================= */

        .promo-image-active img {
          animation:
            promo-image-zoom ${AUTOPLAY_DELAY + 700}ms
            cubic-bezier(0.2, 0.6, 0.3, 1)
            forwards;
        }

        @keyframes promo-image-zoom {
          from {
            transform: scale(1);
          }

          to {
            transform: scale(1.05);
          }
        }

        /* =========================================================
           MOBILE
        ========================================================= */

        @media (max-width: 639px) {
          .promo-swiper {
            padding-bottom: 18px !important;
          }

          .promo-swiper .swiper-pagination-bullet {
            width: 4px;
            height: 4px;
          }

          .promo-swiper .swiper-pagination-bullet-active {
            width: 14px;
          }
        }

        /* =========================================================
           REDUCED MOTION
        ========================================================= */

        @media (prefers-reduced-motion: reduce) {
          .promo-image-active img {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

