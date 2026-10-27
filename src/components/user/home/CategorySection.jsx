
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { sanitizeProductDescription } from "@/lib/productDescription";

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
            !category.parent_category_id &&
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
    if (category.parent_category_id) {
      const parentCategory = categories.find(
        (item) =>
          Number(item.category_id) ===
          Number(category.parent_category_id)
      );
      const parentPath =
        categoryPaths[parentCategory?.name.trim().toLowerCase()];

      if (parentPath) {
        const subcategorySlug = category.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");

        return `${parentPath}/${encodeURIComponent(subcategorySlug)}`;
      }
    }

    return (
      categoryPaths[
        category.name.trim().toLowerCase()
      ] || "/user/shop"
    );
  };

  return (
    <section className="bg-[#FFFFFF] px-0 py-10 md:py-12">
      <div className="mx-0 w-full max-w-none">

        {/* =====================================================
            SECTION HEADER
        ===================================================== */}

        <div className="mb-8 flex items-end justify-between md:mb-10">
          <div>
            <h2 className="font-serif text-[32px] font-bold tracking-wide text-[#292524] sm:text-[38px]">
              Shop by Category
            </h2>
          </div>

          {categories.length > 1 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label="Previous categories"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7DEDC] text-[#292524] transition hover:bg-[#A96870] hover:text-white"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                aria-label="Next categories"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7DEDC] text-[#292524] transition hover:bg-[#A96870] hover:text-white"
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
                      from-[#E7DEDC]
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
                    from-[#292524]/75
                    via-[#292524]/15
                    to-transparent
                  "
                />

                {/* CONTENT */}

                <div className="absolute bottom-3 left-3 right-2 flex items-end justify-between gap-2">
                  <h3 className="min-w-0 font-serif text-base italic tracking-wide text-white">
                    {category.name}
                  </h3>

                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e63e62] text-sm text-white transition-transform duration-300 group-hover:translate-x-1"
                  >
                      →
                  </span>
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
            {categories.map((category) => (
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
                      from-[#E7DEDC]
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
                    from-[#292524]/85
                    via-[#292524]/20
                    to-transparent
                    transition
                    duration-500
                    group-hover:from-[#292524]/95
                  "
                />

                <div className="absolute bottom-8 left-6 right-6 flex items-end justify-between gap-4 text-white sm:bottom-10 sm:left-8 sm:right-8">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-3xl italic tracking-wide sm:text-4xl">
                      {category.name}
                    </h3>
                    {category.description && (
                      <div
                        className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/80 sm:text-sm"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeProductDescription(
                            category.description
                          ),
                        }}
                      />
                    )}
                  </div>

                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e63e62] text-lg text-white transition-transform duration-300 group-hover:translate-x-1"
                  >
                      →
                  </span>
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
                        from-[#E7DEDC]
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
                      from-[#292524]/75
                      via-[#292524]/15
                      to-transparent
                    "
                  />

                  {/* CONTENT */}

                  <div className="absolute bottom-3 left-3 right-2 flex items-end justify-between gap-2">
                    <h3 className="min-w-0 font-serif text-base italic tracking-wide text-white">
                      {category.name}
                    </h3>

                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e63e62] text-sm text-white transition-transform duration-300 group-hover:translate-x-1"
                    >
                        →
                    </span>
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
                    from-[#E7DEDC]
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
                  from-[#292524]/85
                  via-[#292524]/20
                  to-transparent
                "
              />

              {/* CONTENT */}

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-white">
                <h3 className="min-w-0 font-serif text-3xl italic">
                  {category.name}
                </h3>

                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e63e62] text-lg text-white transition-transform duration-300 group-hover:translate-x-1"
                >
                    →
                </span>
              </div>

            </Link>
          ))}

        </div>

      </div>
    </section>
  );
}
