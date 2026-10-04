
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { sanitizeProductDescription } from "@/lib/productDescription";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-fade";

const AUTOPLAY_DELAY = 3000;

function isOfferCurrent(offer) {
  if (offer.status !== "active" || !offer.banner_image) return false;

  const now = new Date();
  const startsAt = offer.start_date
    ? new Date(offer.start_date)
    : null;
  const endsAt = offer.end_date
    ? new Date(offer.end_date)
    : null;

  return (
    (!startsAt || startsAt <= now) &&
    (!endsAt || endsAt >= now)
  );
}

export default function ShopOfferHero() {
  const [offers, setOffers] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

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
          throw new Error(
            result.message || "Failed to load shop offers"
          );
        }

        setOffers(
          (Array.isArray(result.data) ? result.data : []).filter(
            isOfferCurrent
          )
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Shop offer hero error:", error);
          setOffers([]);
        }
      }
    }

    void loadOffers();

    return () => controller.abort();
  }, []);

  if (!offers.length) return null;

  return (
    <section
      aria-label="Current offers"
      className="mx-auto w-[94%] max-w-[1280px] pt-5 md:pt-7"
    >
      <div className="relative overflow-hidden shadow-[0_18px_45px_rgba(50,45,41,0.10)]">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop={offers.length > 1}
          slidesPerView={1}
          speed={900}
          autoplay={
            offers.length > 1
              ? {
                  delay: AUTOPLAY_DELAY,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) =>
            setActiveIndex(swiper.realIndex)
          }
          className="overflow-hidden"
        >
          {offers.map((offer) => (
            <SwiperSlide key={offer.offer_id}>
              <article className="group relative isolate h-[180px] overflow-hidden bg-[#322D29] sm:h-[210px] md:h-[240px]">
                {/* Background Image */}
                <Image
                  src={offer.banner_image}
                  alt={offer.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 94vw, 1280px"
                  className={`absolute inset-0 z-0 object-cover transition-transform ease-out ${
                    offers[activeIndex]?.offer_id === offer.offer_id
                      ? "scale-[1.04] duration-[7000ms]"
                      : "scale-100 duration-0"
                  }`}
                />

                {/* Luxury dark overlay */}
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#171310]/95 via-[#171310]/65 to-[#171310]/15" />

                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[#171310]/70 to-transparent" />

                {/* Soft border */}
                <div className="pointer-events-none absolute inset-0 z-30 border border-white/10" />

                {/* Content */}
                <div className="relative z-20 flex h-full max-w-2xl flex-col justify-center px-6 sm:px-9 md:px-12">
                  
                  {/* Premium Label */}
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles
                      size={11}
                      strokeWidth={1.5}
                      className="text-[#C7AE9A]"
                    />

                    <p className="text-[8px] font-medium uppercase tracking-[0.32em] text-[#E3DCD1]">
                      Velora Exclusive
                    </p>

                    <span className="h-px w-8 bg-[#C7AE9A]/60" />
                  </div>

                  {/* Title */}
                  <h2 className="max-w-xl font-serif text-[22px] font-medium leading-[1.05] tracking-[-0.02em] text-white sm:text-[26px] md:text-[32px]">
                    {offer.title}
                  </h2>

                  {/* Description */}
                  {offer.description && (
                    <div
                      className="mt-2 line-clamp-1 max-w-lg text-[10px] leading-5 text-white/70 sm:text-xs"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeProductDescription(
                          offer.description
                        ),
                      }}
                    />
                  )}

                  {/* CTA */}
                  <Link
                    href={`/user/offers/${encodeURIComponent(
                      String(offer.offer_id)
                    )}`}
                    className="group/cta mt-3 inline-flex h-8 w-fit items-center gap-2 bg-[#F7F3ED] px-4 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#322D29] shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-[#C7AE9A] hover:shadow-[0_10px_25px_rgba(0,0,0,0.22)] sm:h-9 sm:px-5"
                  >
                    Discover Offer

                    <ArrowRight
                      size={12}
                      strokeWidth={1.8}
                      className="transition-transform duration-300 group-hover/cta:translate-x-1"
                    />
                  </Link>
                </div>

                {/* Offer Number */}
                <div className="absolute bottom-4 right-5 z-20 hidden items-center gap-2 sm:flex">
                  <span className="text-[8px] uppercase tracking-[0.25em] text-white/45">
                    Offer
                  </span>

                  <span className="font-serif text-sm text-white/75">
                    {String(
                      offers.findIndex(
                        (item) =>
                          item.offer_id === offer.offer_id
                      ) + 1
                    ).padStart(2, "0")}
                  </span>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination */}
        {offers.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-40 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#171310]/40 px-3 py-1.5 backdrop-blur-md">
              {offers.map((offer, index) => (
                <button
                  key={offer.offer_id}
                  type="button"
                  onClick={() =>
                    swiperRef.current?.slideToLoop(index)
                  }
                  aria-label={`Show offer ${index + 1}: ${offer.title}`}
                  aria-current={
                    activeIndex === index ? "true" : undefined
                  }
                  className="flex h-2 items-center justify-center"
                >
                  <span
                    className={`rounded-full transition-all duration-500 ${
                      activeIndex === index
                        ? "h-1.5 w-5 bg-[#F7F3ED]"
                        : "h-1.5 w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

