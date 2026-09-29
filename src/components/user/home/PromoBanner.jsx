"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const AUTOPLAY_DELAY = 3500;

// =====================================================
// DEMO OFFERS
// Later replace this with API data
// =====================================================

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
              className="
                group
                relative
                h-[50px]
                w-full
                overflow-hidden
                bg-[var(--color-dark)]
              "
            >

              {/* =====================================================
                  BACKGROUND IMAGE
              ===================================================== */}

              <img
                src={offer.banner_image}
                alt=""
                aria-hidden="true"
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-[4000ms]
                  group-hover:scale-[1.03]
                "
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
                    className="
                      min-w-0
                      truncate
                      text-center
                      text-[11px]
                      font-semibold
                      tracking-wide
                      text-white
                      sm:text-xs
                      md:text-sm
                    "
                  >
                    {offer.title}
                  </p>

                  {/* Description */}

                  {offer.description && (
                    <>
                      <span className="hidden h-3 w-px bg-white/25 md:block" />

                      <p
                        className="
                          hidden
                          max-w-md
                          truncate
                          text-[11px]
                          text-white/70
                          lg:block
                        "
                      >
                        {offer.description}
                      </p>
                    </>
                  )}

                  {/* CTA */}

                  {offer.link && (
                    <Link
                      href={offer.link}
                      className="
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
                      "
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
                        className="
                          transition-transform
                          duration-300
                          group-hover/button:translate-x-1
                        "
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
                  className="
                    h-full
                    w-1/3
                    bg-[var(--color-banner)]
                    opacity-80
                  "
                />
              </div>

            </div>

          </SwiperSlide>
        ))}

      </Swiper>

    </section>
  );
}