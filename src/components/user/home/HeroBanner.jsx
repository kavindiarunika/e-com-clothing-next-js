"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft, ArrowUpRight, Gem, Layers, Sparkles } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const AUTOPLAY_DELAY = 6000;

const slides = [
  {
    image: "/images/hero/velora-hero.jpg",
    label: "New Collection 2026",
    title: "Timeless Fashion",
    highlight: "for Modern You.",
    description:
      "Discover thoughtfully designed pieces that blend timeless elegance, modern comfort, and effortless style.",
  },
  {
    image: "/images/hero/velora-hero3.jpg",
    label: "Elegant Essentials",
    title: "Define Your",
    highlight: "Signature Style.",
    description:
      "Explore premium clothing made for confident, effortless everyday looks.",
  },
  {
    image: "/images/hero/velora-hero7.jpg",
    label: "Seasonal Edit",
    title: "Style That",
    highlight: "Feels Like You.",
    description:
      "Refresh your wardrobe with carefully selected pieces for every occasion.",
  },
];

const stats = [
  { icon: Gem, label: "Premium", sub: "Quality Materials" },
  { icon: Sparkles, label: "Modern", sub: "Timeless Designs" },
  { icon: Layers, label: "Crafted", sub: "With Attention" },
];

export default function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  const total = slides.length;

  return (
    <section className="relative overflow-hidden bg-[var(--color-dark)]">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop
        speed={900}
        autoplay={{
          delay: AUTOPLAY_DELAY,
          disableOnInteraction: false,
        }}
        pagination={{
          el: ".velora-pagination",
          clickable: true,
        }}
        navigation={{
          prevEl: ".velora-prev",
          nextEl: ".velora-next",
        }}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="velora-hero-swiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative min-h-[680px] w-full md:min-h-[760px]">
              {/* Background image with slow zoom on the active slide */}
              <div
                className={`absolute inset-0 ${
                  activeIndex === index ? "velora-kenburns" : ""
                }`}
              >
                <Image
                  src={slide.image}
                  alt="Velora premium fashion collection"
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>

              {/* Overlays — softer, lighter gradient for a more premium look */}
              <div className="absolute inset-0 bg-[#322D29]/20" />
              <div className="absolute inset-0 bg-linear-to-r from-[#322D29]/70 via-[#322D29]/35 to-[#322D29]/10" />
              <div className="absolute inset-0 bg-linear-to-t from-[#322D29]/45 via-transparent to-transparent" />

              {/* Content */}
              <div className="relative z-10 mx-auto flex min-h-[680px] w-[92%] max-w-[1200px] items-center md:min-h-[760px]">
                <div
                  key={activeIndex === index ? `active-${index}` : index}
                  className="max-w-[650px] pt-12 md:pt-0"
                >
                  <div
                    className={`mb-6 flex items-center gap-3 ${
                      activeIndex === index ? "velora-fade-up velora-delay-0" : ""
                    }`}
                  >
                    <span className="h-px w-10 bg-[var(--color-banner)]" />
                    <p className="text-xs font-medium uppercase tracking-[3px] text-[var(--color-banner)]">
                      {slide.label}
                    </p>
                  </div>

                  <h1
                    className={`font-serif text-5xl font-medium leading-[1.05] tracking-tight text-[var(--color-white)] sm:text-6xl md:text-7xl lg:text-[78px] ${
                      activeIndex === index ? "velora-fade-up velora-delay-1" : ""
                    }`}
                  >
                    {slide.title}
                    <span className="block italic text-[var(--color-banner)]">
                      {slide.highlight}
                    </span>
                  </h1>

                  <p
                    className={`mt-7 max-w-[500px] text-sm leading-7 text-[var(--color-white)]/75 sm:text-base ${
                      activeIndex === index ? "velora-fade-up velora-delay-2" : ""
                    }`}
                  >
                    {slide.description}
                  </p>

                  <div
                    className={`mt-9 flex flex-col gap-3 sm:flex-row ${
                      activeIndex === index ? "velora-fade-up velora-delay-3" : ""
                    }`}
                  >
                    <Link
                      href="/user/shop"
                      className="group inline-flex h-12 items-center justify-center gap-3 overflow-hidden bg-[var(--color-primary)] px-7 text-xs font-semibold uppercase tracking-[1.5px] text-[var(--color-white)] transition-all duration-300 hover:bg-[var(--color-banner)] hover:text-[var(--color-dark)] hover:shadow-[0_8px_24px_-8px_rgba(172,156,141,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-banner)]"
                    >
                      Shop Now
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>

                    <Link
                      href="/user/shop"
                      className="group inline-flex h-12 items-center justify-center gap-2 border border-[var(--color-white)]/60 bg-[var(--color-white)]/5 px-7 text-xs font-semibold uppercase tracking-[1.5px] text-[var(--color-white)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-white)] hover:bg-[var(--color-white)] hover:text-[var(--color-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-white)]"
                    >
                      Explore Collection
                      <ArrowUpRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </Link>
                  </div>

                  <div
                    className={`mt-12 flex flex-wrap items-center gap-6 border-t border-[var(--color-white)]/15 pt-6 sm:gap-8 ${
                      activeIndex === index ? "velora-fade-up velora-delay-4" : ""
                    }`}
                  >
                    {stats.map(({ icon: Icon, label, sub }, i) => (
                      <div key={label} className="flex items-center gap-6">
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} className="shrink-0 text-[var(--color-banner)]" />
                          <div>
                            <p className="text-xs uppercase tracking-[1.5px] text-[var(--color-white)]">
                              {label}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[var(--color-white)]/50">
                              {sub}
                            </p>
                          </div>
                        </div>
                        {i < stats.length - 1 && (
                          <span className="hidden h-8 w-px bg-[var(--color-white)]/15 sm:block" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Slide counter */}
              <div className="absolute bottom-9 right-[8%] z-20 hidden items-center gap-4 text-[var(--color-white)] md:flex">
                <span className="text-sm tracking-widest tabular-nums">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-[var(--color-white)]/40">/</span>
                <span className="text-sm tracking-widest text-[var(--color-white)]/50 tabular-nums">
                  {String(total).padStart(2, "0")}
                </span>
                <span className="h-px w-12 bg-[var(--color-white)]/50" />
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Prev / Next arrows */}
        <button
          aria-label="Previous slide"
          className="velora-prev absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-white)]/25 bg-[var(--color-white)]/5 text-[var(--color-white)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-white)] hover:bg-[var(--color-white)] hover:text-[var(--color-dark)] md:flex lg:left-8"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          aria-label="Next slide"
          className="velora-next absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-white)]/25 bg-[var(--color-white)]/5 text-[var(--color-white)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-white)] hover:bg-[var(--color-white)] hover:text-[var(--color-dark)] md:flex lg:right-8"
        >
          <ArrowRight size={18} />
        </button>

        {/* Pagination dots */}
        <div className="velora-pagination absolute bottom-9 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2" />
      </Swiper>

      <style>{`
        .velora-hero-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          margin: 0 5px !important;
          opacity: 1;
          background: rgba(255, 255, 255, 0.4);
          transition: all 0.3s ease;
        }

        .velora-hero-swiper .swiper-pagination-bullet-active {
          width: 30px;
          border-radius: 20px;
          background: var(--color-banner);
        }

        @media (max-width: 640px) {
          .velora-hero-swiper .swiper-pagination-bullet {
            width: 7px;
            height: 7px;
          }
          .velora-hero-swiper .swiper-pagination-bullet-active {
            width: 22px;
          }
        }

        /* Slow, subtle zoom on the active background image */
        .velora-kenburns img {
          animation: velora-zoom 6900ms ease-out forwards;
        }
        @keyframes velora-zoom {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.08);
          }
        }

        /* Staggered content entrance */
        .velora-fade-up {
          animation: velora-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .velora-delay-0 {
          animation-delay: 0.05s;
        }
        .velora-delay-1 {
          animation-delay: 0.15s;
        }
        .velora-delay-2 {
          animation-delay: 0.28s;
        }
        .velora-delay-3 {
          animation-delay: 0.4s;
        }
        .velora-delay-4 {
          animation-delay: 0.52s;
        }
        @keyframes velora-fade-up {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .velora-kenburns img,
          .velora-fade-up {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}