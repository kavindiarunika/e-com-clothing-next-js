
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

const normalizeCategoryImage = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const text = value.trim();

    if (
      text.startsWith("/") ||
      text.startsWith("http") ||
      text.startsWith("data:") ||
      text.startsWith("blob:")
    ) {
      return text;
    }

    if (/^[A-Za-z0-9+/=\r\n]+$/.test(text)) {
      try {
        const base64 = text.replace(/\s/g, "");
        const signature = atob(base64.slice(0, 16));

        const bytes = new Uint8Array(
          signature
            .split("")
            .map((char) => char.charCodeAt(0))
        );

        if (
          bytes[0] === 0x89 &&
          bytes[1] === 0x50 &&
          bytes[2] === 0x4e &&
          bytes[3] === 0x47
        ) {
          return `data:image/png;base64,${base64}`;
        }

        if (
          bytes[0] === 0xff &&
          bytes[1] === 0xd8 &&
          bytes[2] === 0xff
        ) {
          return `data:image/jpeg;base64,${base64}`;
        }

        if (
          bytes[0] === 0x47 &&
          bytes[1] === 0x49 &&
          bytes[2] === 0x46
        ) {
          return `data:image/gif;base64,${base64}`;
        }

        if (
          bytes[8] === 0x57 &&
          bytes[9] === 0x45 &&
          bytes[10] === 0x42 &&
          bytes[11] === 0x50
        ) {
          return `data:image/webp;base64,${base64}`;
        }

        return `data:image/jpeg;base64,${base64}`;
      } catch {
        return "";
      }
    }

    return text;
  }

  return "";
};

const categoryPaths = {
  men: "/user/men",
  women: "/user/women",
  kids: "/user/kids",
};

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const swiperRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories");

        if (!response.ok) {
          setCategories([]);
          return;
        }

        const data = await response.json();
        const items = Array.isArray(data) ? data : [];

        const activeCategories = items.filter(
          (category) =>
            category &&
            category.name &&
            category.status !== "inactive"
        );

        setCategories(activeCategories);
      } catch (error) {
        console.error("Category fetch error:", error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  if (!categories.length) {
    return null;
  }

  const getCategoryLink = (category) => {
    return (
      categoryPaths[
        category.name.trim().toLowerCase()
      ] || "/user/shop"
    );
  };

  return (
    <section className="bg-[#EFE9E1] px-[5%] py-10 md:py-12">
      <div className="mx-auto w-full max-w-[1600px]">

        {/* =====================================================
            SECTION HEADER
        ===================================================== */}

        <div className="mb-8 flex items-end justify-between md:mb-10">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[4px] text-[#AC9C8D]">
              Explore Our Collection
            </p>

            <h2 className="font-serif text-3xl font-medium tracking-wide text-[#322D29] sm:text-4xl">
              Shop by Category
            </h2>
          </div>

          {categories.length > 1 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label="Previous categories"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#BEB3A8] text-[#322D29] transition hover:bg-[#322D29] hover:text-white"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                aria-label="Next categories"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#BEB3A8] text-[#322D29] transition hover:bg-[#322D29] hover:text-white"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Four featured categories */}

        <div className="flex items-center justify-center gap-4 lg:gap-5">

          {/* ===================================================
              LEFT SIDE - 3 SMALL CARDS
          =================================================== */}

          <div className="hidden">

            {categories.map((category, index) => (
              <Link
                key={`left-${category.category_id || category.name}-${index}`}
                href={getCategoryLink(category)}
                className="
                  group
                  relative
                  block
                  h-[145px]
                  w-[115px]
                  overflow-hidden
                  rounded-tr-[1.8rem]
                  rounded-bl-[1.8rem]
                  bg-[#EFECE6]
                  shadow-[0_5px_20px_rgba(50,45,41,0.08)]
                  cursor-pointer
                "
              >

                {/* IMAGE */}

                {category.image ? (
                  <img
                    src={normalizeCategoryImage(category.image)}
                    alt={`${category.name} fashion`}
                    className="
                      h-full
                      w-full
                      object-cover
                      object-center
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-110
                    "
                  />
                ) : (
                  <div
                    className="
                      h-full
                      w-full
                      bg-gradient-to-br
                      from-[#D8CEC5]
                      to-[#B6A49A]
                    "
                  />
                )}

                {/* OVERLAY */}

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-[#322D29]/75
                    via-[#322D29]/15
                    to-transparent
                  "
                />

                {/* CONTENT */}

                <div className="absolute bottom-3 left-3 right-2">
                  <p className="mb-1 text-[7px] uppercase tracking-[1.5px] text-[#AC9C8D]">
                    Collection
                  </p>

                  <h3 className="font-serif text-base italic tracking-wide text-white">
                    {category.name}
                  </h3>

                  <div className="mt-1 flex items-center gap-1 text-[7px] font-semibold uppercase tracking-[1px] text-white/80">
                    <span>Shop</span>

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>

              </Link>
            ))}

          </div>

          {/* ===================================================
              CENTER - 2 LARGE MAIN IMAGES
          =================================================== */}

          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            slidesPerView={1.15}
            spaceBetween={16}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
              1280: { slidesPerView: 4, spaceBetween: 20 },
            }}
            className="w-full"
          >
            {categories.map((category, index) => (
              <SwiperSlide key={category.category_id || category.name}>
                <Link
                  href={getCategoryLink(category)}
                  className="
                  group
                  relative
                  block
                  h-[360px]
                  w-full
                  overflow-hidden
                  rounded-tr-[3rem]
                  rounded-bl-[3rem]
                  bg-[#EFECE6]
                  shadow-[0_10px_35px_rgba(50,45,41,0.12)]
                  cursor-pointer
                  sm:h-[400px]
                  xl:h-[440px]
                  "
                >

                {/* MAIN IMAGE */}

                {category.image ? (
                  <img
                    src={normalizeCategoryImage(category.image)}
                    alt={`${category.name} fashion`}
                    className="
                      h-full
                      w-full
                      object-cover
                      object-center
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-105
                    "
                  />
                ) : (
                  <div
                    className="
                      h-full
                      w-full
                      bg-gradient-to-br
                      from-[#D8CEC5]
                      to-[#B6A49A]
                    "
                  />
                )}

                {/* MAIN OVERLAY */}

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-[#322D29]/85
                    via-[#322D29]/20
                    to-transparent
                    transition
                    duration-500
                    group-hover:from-[#322D29]/95
                  "
                />

                {/* TOP LABEL */}

                <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
                  <span className="text-[8px] font-semibold uppercase tracking-[2.5px] text-white/80">
                    VELORA
                  </span>

                  <span className="h-px w-10 bg-white/50" />
                </div>

                {/* NUMBER */}

                <div className="absolute right-6 top-6">
                  <span className="font-serif text-sm italic text-white/70">
                    0{index + 1}
                  </span>
                </div>

                {/* MAIN CONTENT */}

                <div className="absolute bottom-8 left-6 right-6 text-white sm:bottom-10 sm:left-8 sm:right-8">

                  <p className="mb-2 text-[9px] uppercase tracking-[3px] text-[#AC9C8D]">
                    Discover
                  </p>

                  <h3 className="font-serif text-3xl italic tracking-wide sm:text-4xl">
                    {category.name}
                  </h3>

                  <div className="mt-5 flex items-center justify-between">

                    <span className="text-[9px] font-semibold uppercase tracking-[2px]">
                      Shop Collection
                    </span>

                    <span
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/50
                        text-lg
                        transition-all
                        duration-300
                        group-hover:bg-white
                        group-hover:text-[#322D29]
                      "
                    >
                      →
                    </span>

                  </div>

                </div>

                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* ===================================================
              RIGHT SIDE - 3 SMALL CARDS
          =================================================== */}

          <div className="hidden">

            {categories
              .slice()
              .reverse()
              .map((category, index) => (
                <Link
                  key={`right-${category.category_id || category.name}-${index}`}
                  href={getCategoryLink(category)}
                  className="
                    group
                    relative
                    block
                    h-[145px]
                    w-[115px]
                    overflow-hidden
                    rounded-tl-[1.8rem]
                    rounded-br-[1.8rem]
                    bg-[#EFECE6]
                    shadow-[0_5px_20px_rgba(50,45,41,0.08)]
                    cursor-pointer
                  "
                >

                  {/* IMAGE */}

                  {category.image ? (
                    <img
                      src={normalizeCategoryImage(category.image)}
                      alt={`${category.name} fashion`}
                      className="
                        h-full
                        w-full
                        object-cover
                        object-center
                        transition-transform
                        duration-700
                        ease-out
                        group-hover:scale-110
                      "
                    />
                  ) : (
                    <div
                      className="
                        h-full
                        w-full
                        bg-gradient-to-br
                        from-[#D8CEC5]
                        to-[#B6A49A]
                      "
                    />
                  )}

                  {/* OVERLAY */}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-[#322D29]/75
                      via-[#322D29]/15
                      to-transparent
                    "
                  />

                  {/* CONTENT */}

                  <div className="absolute bottom-3 left-3 right-2">

                    <p className="mb-1 text-[7px] uppercase tracking-[1.5px] text-[#AC9C8D]">
                      Collection
                    </p>

                    <h3 className="font-serif text-base italic tracking-wide text-white">
                      {category.name}
                    </h3>

                    <div className="mt-1 flex items-center gap-1 text-[7px] font-semibold uppercase tracking-[1px] text-white/80">
                      <span>Shop</span>

                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>

                  </div>

                </Link>
              ))}

          </div>

        </div>

        {/* =====================================================
            MOBILE / TABLET
        ===================================================== */}

        <div className="hidden">

          {categories.map((category, index) => (
            <Link
              key={`mobile-${category.category_id || category.name}-${index}`}
              href={getCategoryLink(category)}
              className="
                group
                relative
                block
                h-[360px]
                overflow-hidden
                rounded-tr-[2.5rem]
                rounded-bl-[2.5rem]
                bg-[#EFECE6]
                shadow-sm
              "
            >

              {/* IMAGE */}

              {category.image ? (
                <img
                  src={normalizeCategoryImage(category.image)}
                  alt={`${category.name} fashion`}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-105
                  "
                />
              ) : (
                <div
                  className="
                    h-full
                    w-full
                    bg-gradient-to-br
                    from-[#D8CEC5]
                    to-[#B6A49A]
                  "
                />
              )}

              {/* OVERLAY */}

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#322D29]/85
                  via-[#322D29]/20
                  to-transparent
                "
              />

              {/* CONTENT */}

              <div className="absolute bottom-6 left-6 right-6 text-white">

                <p className="mb-2 text-[8px] uppercase tracking-[2px] text-[#AC9C8D]">
                  Discover
                </p>

                <h3 className="font-serif text-3xl italic">
                  {category.name}
                </h3>

                <div className="mt-3 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[1.5px]">

                  <span>
                    Shop Collection
                  </span>

                  <span className="text-lg transition-transform duration-300 group-hover:translate-x-2">
                    →
                  </span>

                </div>

              </div>

            </Link>
          ))}

        </div>

      </div>
    </section>
  );
}
