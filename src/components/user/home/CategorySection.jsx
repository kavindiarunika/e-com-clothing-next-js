"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

  return (
    <section className="bg-[#EFE9E1] px-4 py-10 sm:px-6 md:py-12 lg:px-8">
      <div className="mx-auto max-w-[1400px]">

        {/* =====================================================
            SECTION HEADER
        ===================================================== */}

        <div className="mb-7 text-left md:mb-9">

          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[3px] text-[#AC9C8D]">
            Explore Our Collection
          </p>

          <h2 className="font-serif text-3xl font-medium tracking-wide text-[#322D29] sm:text-4xl">
            Shop by Category
          </h2>

          <div className="mt-3 h-px w-10 bg-[#72383D]" />

        </div>

        {/* =====================================================
            CATEGORY GRID
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-5
            xl:gap-4
          "
        >

          {categories.map((category) => (

            <Link
              key={
                category.category_id ||
                category.name
              }
              href={
                categoryPaths[
                  category.name.trim().toLowerCase()
                ] || "/user/shop"
              }
              className="
                group
                relative
                block
                h-56
                overflow-hidden
                bg-[#D8CEC5]
                sm:h-64
                lg:h-72
              "
            >

              {/* =================================================
                  CATEGORY IMAGE
              ================================================= */}

              {category.image ? (

                <img
                  src={normalizeCategoryImage(category.image)}
                  alt={`${category.name} fashion`}
                  className="
                    h-full
                    w-full
                    object-cover
                    object-center
                    transition
                    duration-700
                    ease-out
                    group-hover:scale-105
                  "
                />

              ) : (

                <div className="h-full w-full bg-gradient-to-br from-[#D8CEC5] to-[#B6A49A]" />

              )}

              {/* =================================================
                  OVERLAY
              ================================================= */}

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#322D29]/85
                  via-[#322D29]/25
                  to-transparent
                  transition
                  duration-500
                  group-hover:from-[#322D29]/95
                "
              />

              {/* =================================================
                  CONTENT
              ================================================= */}

              <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">

                <p className="mb-1.5 text-[8px] uppercase tracking-[2px] text-[#AC9C8D]">
                  Discover
                </p>

                <h3 className="font-serif text-xl italic sm:text-2xl lg:text-[25px]">
                  {category.name}
                </h3>

                <div className="mt-3 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[1.2px] sm:text-[10px]">

                  <span>
                    Shop Collection
                  </span>

                  <span
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1.5
                    "
                  >
                    →
                  </span>

                </div>

              </div>

              {/* =================================================
                  TOP LINE
              ================================================= */}

              <div
                className="
                  absolute
                  left-4
                  right-4
                  top-4
                  h-px
                  bg-white/40
                  opacity-0
                  transition
                  duration-500
                  group-hover:opacity-100
                "
              />

            </Link>

          ))}

        </div>

      </div>
    </section>
  );
}