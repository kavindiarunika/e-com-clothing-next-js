"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const AUTOPLAY_DELAY = 5000;

const banners = [
  {
    id: 1,
    image: "/images/banners/banner1.jpg",
    eyebrow: "New Season",
    button: "Shop Now",
    link: "/user/shop",
  },
  {
    id: 2,
    image: "/images/banners/banner2.jpg",
    eyebrow: "Womenswear",
    button: "Explore Collection",
    link: "/user/women",
  },
  {
    id: 3,
    image: "/images/banners/banner3.jpg",
    eyebrow: "Menswear",
    button: "Discover More",
    link: "/user/men",
  },
];

export default function PromoBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="bg-[var(--color-banner)] px-[4%] py-16 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          slidesPerView={1}
          loop={true}
          speed={800}
          autoplay={{
            delay: AUTOPLAY_DELAY,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={{
            prevEl: ".promo-prev",
            nextEl: ".promo-next",
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="promo-swiper"
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={banner.id}>
              <div className="relative min-h-[500px] overflow-hidden rounded-sm md:min-h-[580px]">
                {/* Banner Image, with a slow zoom while active */}
                <div
                  className={`absolute inset-0 ${
                    activeIndex === index ? "promo-kenburns" : ""
                  }`}
                >
                  <Image
                    src={banner.image}
                    alt={`Velora — ${banner.eyebrow}`}
                    fill
                    priority={banner.id === 1}
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className="object-cover"
                  />
                </div>

                {/* Legibility gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/80 via-[var(--color-dark)]/10 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-end gap-5 px-6 pb-16 text-center md:pb-20">
                  <div
                    key={activeIndex === index ? `eyebrow-${index}` : `e-${index}`}
                    className={`flex items-center gap-3 ${
                      activeIndex === index ? "promo-fade-up promo-delay-0" : ""
                    }`}
                  >
                    <span className="h-px w-8 bg-[var(--color-white)]/70" />
                    <p className="text-xs font-semibold uppercase tracking-[3px] text-[var(--color-white)]">
                      {banner.eyebrow}
                    </p>
                    <span className="h-px w-8 bg-[var(--color-white)]/70" />
                  </div>

                  <Link
                    href={banner.link}
                    className={`group inline-flex items-center gap-3 bg-[var(--color-primary)] px-8 py-4 text-xs font-semibold uppercase tracking-[1.5px] text-[var(--color-white)] transition-all duration-300 hover:bg-[var(--color-banner)] hover:text-[var(--color-dark)] hover:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-white)] ${
                      activeIndex === index ? "promo-fade-up promo-delay-1" : ""
                    }`}
                  >
                    {banner.button}
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Floating side arrows, over the image like the hero banner */}
          <button
            aria-label="Previous banner"
            className="promo-prev absolute left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-white)]/30 bg-[var(--color-white)]/10 text-[var(--color-white)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-white)] hover:bg-[var(--color-white)] hover:text-[var(--color-dark)] md:flex lg:left-6"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            aria-label="Next banner"
            className="promo-next absolute right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-white)]/30 bg-[var(--color-white)]/10 text-[var(--color-white)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-white)] hover:bg-[var(--color-white)] hover:text-[var(--color-dark)] md:flex lg:right-6"
          >
            <ArrowRight size={16} />
          </button>
        </Swiper>
      </div>

      <style>{`
        .promo-swiper {
          padding-bottom: 45px !important;
        }

        .promo-swiper .swiper-pagination {
          bottom: 0 !important;
        }

        .promo-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: var(--color-dark);
          opacity: 0.4;
          transition: all 0.3s ease;
        }

        .promo-swiper .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 5px;
          background: var(--color-primary);
          opacity: 1;
        }

        .promo-kenburns img {
          animation: promo-zoom ${AUTOPLAY_DELAY + 800}ms ease-out forwards;
        }
        @keyframes promo-zoom {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.07);
          }
        }

        .promo-fade-up {
          animation: promo-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .promo-delay-0 {
          animation-delay: 0.1s;
        }
        .promo-delay-1 {
          animation-delay: 0.25s;
        }
        @keyframes promo-fade-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .promo-kenburns img,
          .promo-fade-up {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}