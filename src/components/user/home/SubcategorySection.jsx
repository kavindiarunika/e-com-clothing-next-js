"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

const categorySlug = (name) => name.trim().toLowerCase().replace(/\s+/g, "-");

export default function SubcategorySection() {
  const [subcategories, setSubcategories] = useState([]);
  const swiperRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSubcategories() {
      try {
        const response = await fetch("/api/admin/categories", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load subcategories");
        }

        const categories = await response.json();
        const activeCategories = Array.isArray(categories)
          ? categories.filter(
              (category) =>
                category?.name && category.status !== "inactive"
            )
          : [];
        const parentCategories = new Map(
          activeCategories
            .filter((category) => !category.parent_category_id)
            .map((category) => [
              String(category.category_id),
              category,
            ])
        );
        const activeSubcategories = activeCategories.filter(
          (category) =>
            category.parent_category_id &&
            parentCategories.has(String(category.parent_category_id))
        );

        setSubcategories(activeSubcategories);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Subcategory fetch error:", error);
        }
      }
    }

    void loadSubcategories();

    return () => controller.abort();
  }, []);

  if (!subcategories.length) {
    return null;
  }

  const parentCategories = new Map(
    subcategories.map((subcategory) => [
      String(subcategory.parent_category_id),
      subcategory.parent_name,
    ])
  );

  return (
    <section className="bg-[#FFFFFF] px-0 py-10 md:py-12">
      <div className="mx-0 w-full max-w-none">
        <div className="mb-8 flex items-end justify-between md:mb-10">
          <h2 className="font-serif text-[32px] font-bold tracking-wide text-[#292524] sm:text-[38px]">
            Shop by Sub Category
          </h2>

          {subcategories.length > 1 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label="Previous subcategories"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7DEDC] text-[#292524] transition hover:bg-[#A96870] hover:text-white"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                aria-label="Next subcategories"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7DEDC] text-[#292524] transition hover:bg-[#A96870] hover:text-white"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>

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
          {subcategories.map((subcategory) => {
            const parentName = parentCategories.get(
              String(subcategory.parent_category_id)
            );

            return (
              <SwiperSlide key={subcategory.category_id}>
                <Link
                  href={`/user/${categorySlug(parentName)}/${categorySlug(subcategory.name)}`}
                  className="group relative block h-[360px] w-full cursor-pointer overflow-hidden rounded-tr-[3rem] rounded-bl-[3rem] bg-[#EFECE6] shadow-[0_10px_35px_rgba(50,45,41,0.12)] sm:h-[400px] xl:h-[440px]"
                >
                  {subcategory.image ? (
                    <img
                      src={subcategory.image}
                      alt={`${subcategory.name} fashion`}
                      className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#E7DEDC] to-[#B6A49A]" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#292524]/85 via-[#292524]/20 to-transparent transition duration-500 group-hover:from-[#292524]/95" />

                  <div className="absolute bottom-8 left-6 right-6 flex items-end justify-between gap-4 text-white sm:bottom-10 sm:left-8 sm:right-8">
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-[10px] uppercase tracking-[2px] text-white/75">
                        {parentName}
                      </p>
                      <h3 className="font-serif text-3xl italic tracking-wide sm:text-4xl">
                        {subcategory.name}
                      </h3>
                      {subcategory.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/80 sm:text-sm">
                          {subcategory.description}
                        </p>
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
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
