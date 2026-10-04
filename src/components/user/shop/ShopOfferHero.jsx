"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { sanitizeProductDescription } from "@/lib/productDescription";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-fade";

const AUTOPLAY_DELAY = 4500;

function isOfferCurrent(offer) {
  if (offer.status !== "active" || !offer.banner_image) return false;

  const now = new Date();
  const startsAt = offer.start_date ? new Date(offer.start_date) : null;
  const endsAt = offer.end_date ? new Date(offer.end_date) : null;

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
          throw new Error(result.message || "Failed to load shop offers");
        }

        setOffers(
          (Array.isArray(result.data) ? result.data : []).filter(isOfferCurrent)
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
      className="mx-auto w-[92%] max-w-[1200px] pt-6 md:pt-8"
    >
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={offers.length > 1}
        slidesPerView={1}
        speed={700}
        autoplay={offers.length > 1 ? {
          delay: AUTOPLAY_DELAY,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        } : false}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="overflow-hidden"
      >
        {offers.map((offer) => (
          <SwiperSlide key={offer.offer_id}>
            <article className="group relative isolate h-[340px] overflow-hidden bg-[#322D29] sm:h-[380px] md:h-[420px]">
              <Image
                src={offer.banner_image}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 1200px) 92vw, 1200px"
                className={`absolute inset-0 z-0 object-cover transition-transform ease-out ${
                  offers[activeIndex]?.offer_id === offer.offer_id
                    ? "scale-105 duration-[7000ms]"
                    : "scale-100 duration-0"
                }`}
              />
              <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#171310]/90 via-[#171310]/58 to-[#171310]/10" />
              <div className="absolute inset-x-0 bottom-0 z-10 h-36 bg-gradient-to-t from-[#171310]/65 to-transparent" />

              <div className="relative z-20 flex h-full max-w-3xl flex-col justify-end px-6 pb-20 pt-10 text-white sm:px-10 sm:pb-24 md:px-14">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-8 bg-[#C7AE9A]" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#E3DCD1]">
                    Velora Exclusive
                  </p>
                </div>
                <h2 className="max-w-2xl font-serif text-3xl font-medium leading-[1.08] sm:text-4xl md:text-[48px]">
                  {offer.title}
                </h2>
                {offer.description && (
                  <div
                    className="mt-3 line-clamp-2 max-w-xl text-[13px] leading-6 text-white/75 sm:text-sm"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeProductDescription(offer.description),
                    }}
                  />
                )}
                <Link
                  href={`/user/offers/${encodeURIComponent(String(offer.offer_id))}`}
                  className="group/cta mt-6 inline-flex h-11 w-fit items-center gap-3 bg-[#F7F3ED] px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#322D29] transition-colors duration-300 hover:bg-[#C7AE9A]"
                >
                  Explore Offer
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover/cta:translate-x-1" />
                </Link>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      {offers.length > 1 && (
        <div className="flex items-center justify-between border-b border-[#D8CEC5] py-3">
          <div className="flex items-center gap-3" aria-label="Choose offer">
            {offers.map((offer, index) => (
              <button
                key={offer.offer_id}
                type="button"
                onClick={() => swiperRef.current?.slideToLoop(index)}
                aria-label={`Show offer ${index + 1}: ${offer.title}`}
                aria-current={activeIndex === index ? "true" : undefined}
                className="flex h-7 items-center"
              >
                <span
                  className={`h-px transition-all duration-300 ${
                    activeIndex === index
                      ? "w-9 bg-[#72383D]"
                      : "w-5 bg-[#B9AEA4] hover:bg-[#72383D]"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <p className="font-serif text-sm tabular-nums text-[#6B625C]">
              <span className="text-[#322D29]">{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="mx-2 text-[#B9AEA4]">/</span>
              {String(offers.length).padStart(2, "0")}
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                aria-label="Previous offer"
                onClick={() => swiperRef.current?.slidePrev()}
                className="flex h-9 w-9 items-center justify-center border border-[#D8CEC5] text-[#322D29] transition-colors hover:border-[#72383D] hover:bg-[#72383D] hover:text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next offer"
                onClick={() => swiperRef.current?.slideNext()}
                className="flex h-9 w-9 items-center justify-center border border-[#D8CEC5] text-[#322D29] transition-colors hover:border-[#72383D] hover:bg-[#72383D] hover:text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
