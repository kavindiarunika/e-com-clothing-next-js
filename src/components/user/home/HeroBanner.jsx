"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const AUTOPLAY_DELAY = 2000;

export default function HeroBanner() {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const swiperRef = useRef(null);

  useEffect(() => {
    const loadHeroBanners = async () => {
      try {
        const response = await fetch("/api/user/hero_banners");
        if (!response.ok) {
          setSlides([]);
          return;
        }

        const data = await response.json();
        const banners = Array.isArray(data?.data) ? data.data : [];

        const formattedSlides = banners
          .map((banner) => ({
            id: banner.banner_id,
            title: banner.title || "Discover Your Style",
            subtitle:
              banner.subtitle || "Explore our latest fashion collection.",
            image: banner.image || "",
            buttonText: banner.button_text || "Shop Now",
            buttonLink: banner.button_link || "/user/shop",
          }))
          .filter((banner) => banner.image);

        setSlides(formattedSlides);
      } catch (error) {
        console.error("Hero banner fetch error:", error);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    loadHeroBanners();
  }, []);

  // Skeleton while fetching — avoids a jarring layout pop-in
  if (loading) {
    return (
      <section className="user-page-full-bleed relative h-[400px] w-full overflow-hidden bg-[#322D29]">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#2a2622] via-[#322D29] to-[#2a2622]" />
      </section>
    );
  }

  if (!slides.length) {
    return null;
  }

  return (
    <section className="user-page-full-bleed relative h-[400px] w-full overflow-hidden bg-[#322D29]">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={slides.length > 1}
        speed={700}
        autoplay={{
          delay: AUTOPLAY_DELAY,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{ prevEl: ".velora-prev", nextEl: ".velora-next" }}
        pagination={{ el: ".velora-pagination", clickable: true }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`${slide.id || slide.image}-${index}`}>
            <div className="relative h-[400px] w-full">
              {/* IMAGE — slow Ken Burns drift, only while active */}
              <img
                src={slide.image}
                alt={slide.title}
                className={`absolute inset-0 h-full w-full object-cover transition-transform ease-out ${
                  activeIndex === index
                    ? "scale-110 duration-[7000ms]"
                    : "scale-100 duration-0"
                }`}
              />

              {/* OVERLAYS */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#060302]/90 via-[#060302]/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#060302]/50 to-transparent" />

              {/* CONTENT */}
              <div className="relative z-10 mx-auto flex h-full max-w-[1200px] items-center px-[5%]">
                <div
                  className={`max-w-[520px] text-white transition-all duration-700 ease-out ${
                    activeIndex === index
                      ? "translate-y-0 opacity-100 delay-200"
                      : "translate-y-6 opacity-0"
                  }`}
                >
                  <div className="mb-4 flex items-center gap-2.5">
                    <span className="h-px w-8 bg-[#AC9C8D]" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#E3DCD1]">
                      Velora
                    </span>
                  </div>

                  <h1 className="max-w-[500px] font-serif text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-[48px]">
                    {slide.title}
                  </h1>

                  <p className="mt-4 max-w-[440px] text-[13px] leading-6 text-white/70 sm:text-sm">
                    {slide.subtitle}
                  </p>

                  <div className="mt-7">
                    <Link
                      href={slide.buttonLink || "/user/shop"}
                      className="group relative inline-flex h-11 items-center gap-2.5 overflow-hidden bg-white px-7 text-[10px] font-bold uppercase tracking-[1.8px] text-[#322D29] transition-colors duration-300"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-[#AC9C8D] transition-transform duration-300 ease-out group-hover:translate-x-0" />
                      <ShoppingBag
                        size={14}
                        strokeWidth={1.8}
                        className="relative z-10"
                      />
                      <span className="relative z-10">{slide.buttonText}</span>
                      <ArrowRight
                        size={14}
                        strokeWidth={1.8}
                        className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </div>
              </div>

              {/* SLIDE NUMBER */}
              <div className="absolute bottom-6 right-[5%] z-20 hidden items-center gap-2.5 text-white sm:flex">
                <span className="font-serif text-sm font-medium">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-px w-10 bg-white/30" />
                <span className="text-[10px] tracking-wide text-white/45">
                  {String(slides.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* NAVIGATION */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-[5%] z-30 flex gap-2">
          <button
            type="button"
            aria-label="Previous slide"
            className="velora-prev flex h-9 w-9 items-center justify-center border border-white/25 bg-black/10 text-white backdrop-blur-md transition-all duration-300 hover:border-white hover:bg-white hover:text-[#322D29]"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="velora-next flex h-9 w-9 items-center justify-center border border-white/25 bg-black/10 text-white backdrop-blur-md transition-all duration-300 hover:border-white hover:bg-white hover:text-[#322D29]"
          >
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* PAGINATION — custom bullets, active one elongates */}
      <div className="velora-pagination absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2" />

      <style jsx global>{`
        .velora-pagination .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.35);
          opacity: 1;
          margin: 0 !important;
          transition: width 0.4s ease, background-color 0.4s ease;
        }
        .velora-pagination .swiper-pagination-bullet-active {
          width: 22px;
          background: #ffffff;
        }
      `}</style>
    </section>
  );
}