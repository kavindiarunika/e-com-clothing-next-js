"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Gem,
  Layers,
  Sparkles,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  Pagination,
  Navigation,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

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
  {
    icon: Gem,
    label: "Premium",
    sub: "Quality Materials",
  },
  {
    icon: Sparkles,
    label: "Modern",
    sub: "Timeless Designs",
  },
  {
    icon: Layers,
    label: "Crafted",
    sub: "With Attention",
  },
];

export default function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  return (
    <section className="relative min-h-[600px] overflow-hidden bg-[#F3EFEB] text-[#432415] lg:min-h-[560px]">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full border border-[#CCB2A5]/30" />

        <div className="absolute -right-40 -top-32 h-[420px] w-[420px] rounded-full border border-[#CCB2A5]/25" />

        <div className="absolute bottom-[-180px] left-[35%] h-[350px] w-[350px] rounded-full border border-[#CCB2A5]/20" />

        <div className="absolute right-[42%] top-[15%] h-2 w-2 rounded-full bg-[#CCB2A5]" />

        <div className="absolute bottom-[20%] left-[8%] h-1.5 w-1.5 rounded-full bg-[#CCB2A5]" />
      </div>

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        loop
        speed={900}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
          waitForTransition: false,
        }}
        pagination={{
          el: ".velora-pagination",
          clickable: true,
        }}
        navigation={{
          prevEl: ".velora-prev",
          nextEl: ".velora-next",
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
        }}
        className="h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.image}>
            <div className="relative min-h-[600px] lg:min-h-[560px]">
              {/* Main Container */}
              <div className="relative z-10 mx-auto flex min-h-[600px] w-[90%] max-w-[1400px] flex-col lg:min-h-[560px] lg:flex-row lg:items-center">
                {/* ================= LEFT CONTENT ================= */}
                <div className="flex w-full items-center pt-20 pb-6 lg:w-[48%] lg:pt-6 lg:pb-0">
                  <div className="w-full max-w-[650px]">
                    {/* Top Brand Line */}
                    <div
                      className={`mb-6 flex items-center gap-4 transition-all duration-1000 ${
                        activeIndex === index
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                      }`}
                    >
                      <div className="h-px w-10 bg-[#432415]" />

                      <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#432415]/70 sm:text-xs">
                        {slide.label}
                      </span>
                    </div>

                    {/* Main Heading */}
                    <h1
                      className={`font-serif text-[48px] font-medium leading-[0.95] tracking-[-0.04em] text-[#432415] transition-all duration-1000 sm:text-[60px] md:text-[68px] lg:text-[76px] ${
                        activeIndex === index
                          ? "translate-y-0 opacity-100"
                          : "translate-y-8 opacity-0"
                      }`}
                    >
                      {slide.title}
                      <br />

                      <span className="font-light italic text-[#9A7766]">
                        {slide.highlight}
                      </span>
                    </h1>

                    {/* Description */}
                    <p
                      className={`mt-6 max-w-[500px] text-sm leading-7 text-[#432415]/65 transition-all duration-1000 delay-200 sm:text-[15px] ${
                        activeIndex === index
                          ? "translate-y-0 opacity-100"
                          : "translate-y-5 opacity-0"
                      }`}
                    >
                      {slide.description}
                    </p>

                    {/* Buttons */}
                    <div
                      className={`mt-7 flex flex-wrap items-center gap-5 transition-all duration-1000 delay-300 ${
                        activeIndex === index
                          ? "translate-y-0 opacity-100"
                          : "translate-y-5 opacity-0"
                      }`}
                    >
                      <Link
                        href="/user/shop"
                        className="group inline-flex h-12 items-center justify-center gap-3 overflow-hidden bg-[var(--color-primary)] px-7 text-xs font-semibold uppercase tracking-[1.5px] text-[var(--color-white)] transition-all duration-300 hover:bg-[var(--color-banner)] hover:text-[var(--color-dark)] hover:shadow-[0_8px_24px_-8px_rgba(172,156,141,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-banner)]"
                      >
                        Shop Collection

                        <ArrowRight
                          size={16}
                          strokeWidth={1.5}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </Link>

                      <Link
                        href="/user/shop"
                        className="group inline-flex h-12 items-center gap-2 border border-[#432415]/30 px-7 text-xs font-medium uppercase tracking-[0.18em] text-[#432415] transition-all duration-300 hover:border-[#AC9C8D] hover:bg-[#AC9C8D] hover:text-[#432415]"
                      >
                        Explore

                        <ArrowUpRight
                          size={16}
                          strokeWidth={1.5}
                          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </Link>
                    </div>

                    {/* Stats */}
                    <div
                      className={`mt-9 flex flex-wrap gap-6 border-t border-[#432415]/10 pt-5 transition-all duration-1000 delay-500 sm:gap-8 ${
                        activeIndex === index
                          ? "translate-y-0 opacity-100"
                          : "translate-y-5 opacity-0"
                      }`}
                    >
                      {stats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                          <div
                            key={stat.label}
                            className="flex items-center gap-2.5"
                          >
                            <Icon
                              size={17}
                              strokeWidth={1.2}
                              className="text-[#9A7766]"
                            />

                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#432415]">
                                {stat.label}
                              </p>

                              <p className="mt-0.5 text-[9px] text-[#432415]/50">
                                {stat.sub}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ================= RIGHT IMAGE ================= */}
                <div className="relative flex w-full flex-1 items-center justify-center pb-10 lg:w-[52%] lg:pb-0">
                  <div
                    className={`relative h-[330px] w-[78%] max-w-[480px] overflow-hidden rounded-[50%_50%_4%_4%] sm:h-[390px] md:h-[440px] lg:h-[480px] ${
                      activeIndex === index
                        ? "velora-image-reveal"
                        : ""
                    }`}
                  >
                    {/* Image */}
                    <Image
                      src={slide.image}
                      alt={`${slide.title} ${slide.highlight}`}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 768px) 78vw, 480px"
                      quality={75}
                      unoptimized
                      className={`object-cover transition-transform duration-[7000ms] ${
                        activeIndex === index
                          ? "scale-105"
                          : "scale-100"
                      }`}
                    />

                    {/* Soft Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060302]/20 via-transparent to-[#F3EFEB]/5" />

                    {/* Image Border */}
                    <div className="pointer-events-none absolute inset-0 rounded-[50%_50%_4%_4%] border border-white/30" />
                  </div>

                  {/* Vertical Text */}
                  <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 lg:block">
                    <p className="rotate-90 whitespace-nowrap text-[9px] uppercase tracking-[0.4em] text-[#432415]/40">
                      VELORA — CONTEMPORARY FASHION
                    </p>
                  </div>

                  {/* Floating Circle */}
                  <div className="absolute bottom-12 left-[5%] flex h-20 w-20 items-center justify-center rounded-full border border-[#432415]/15 bg-[#F3EFEB]/80 backdrop-blur-sm sm:h-24 sm:w-24">
                    <div className="text-center">
                      <p className="font-serif text-lg italic text-[#432415]">
                        New
                      </p>

                      <p className="text-[8px] uppercase tracking-[0.18em] text-[#432415]/50">
                        Collection
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= SLIDE DOTS ================= */}
              <div className="absolute bottom-7 left-[5%] z-20 hidden items-center gap-2 sm:flex">
                {slides.map((item, dotIndex) => (
                  <span
                    key={item.image}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      activeIndex === dotIndex
                        ? "scale-125 bg-[#432415]"
                        : "bg-[#432415]/25"
                    }`}
                  />
                ))}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ================= CUSTOM CONTROLS ================= */}
      <div className="absolute bottom-7 right-[5%] z-30 flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous slide"
          className="velora-prev flex h-9 w-9 items-center justify-center border border-[#432415]/20 bg-[#F3EFEB]/70 text-[#432415] backdrop-blur-sm transition-all duration-300 hover:bg-[#432415] hover:text-[#F3EFEB]"
        >
          <ArrowLeft size={15} strokeWidth={1.4} />
        </button>

        <button
          type="button"
          aria-label="Next slide"
          className="velora-next flex h-9 w-9 items-center justify-center border border-[#432415]/20 bg-[#F3EFEB]/70 text-[#432415] backdrop-blur-sm transition-all duration-300 hover:bg-[#432415] hover:text-[#F3EFEB]"
        >
          <ArrowRight size={15} strokeWidth={1.4} />
        </button>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="velora-pagination absolute bottom-9 left-1/2 z-30 flex -translate-x-1/2 gap-2" />

      {/* ================= BRAND DETAILS ================= */}
      <div className="absolute right-[5%] top-7 z-20 hidden items-center gap-4 lg:flex">
        <span className="text-[9px] uppercase tracking-[0.3em] text-[#432415]/40">
          Est. 2026
        </span>

        <div className="h-px w-8 bg-[#432415]/20" />

        <span className="font-serif text-sm italic text-[#432415]/60">
          Velora
        </span>
      </div>

      {/* ================= CUSTOM STYLES ================= */}
      <style jsx global>{`
        .velora-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          margin: 0 !important;
          opacity: 0.25;
          background: #432415;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .velora-pagination .swiper-pagination-bullet-active {
          transform: scale(1.35);
          opacity: 1;
          background: #432415;
        }

        .velora-image-reveal {
          animation: veloraImageReveal 1s ease forwards;
        }

        @keyframes veloraImageReveal {
          from {
            opacity: 0;
            transform: translateX(30px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 1023px) {
          .velora-pagination {
            bottom: 18px !important;
          }
        }

        @media (max-width: 640px) {
          .velora-pagination .swiper-pagination-bullet {
            width: 7px;
            height: 7px;
          }
        }
      `}</style>
    </section>
  );
}