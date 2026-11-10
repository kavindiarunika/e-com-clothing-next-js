
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const categorySlug = (name) =>
  name.trim().toLowerCase().replace(/\s+/g, "-");

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

        if (!response.ok) throw new Error("Failed to load subcategories");

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
            .map((category) => [String(category.category_id), category])
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

  if (!subcategories.length) return null;

  return (
    <section className="overflow-hidden bg-white py-5 sm:py-7">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        {subcategories.length > 1 && (
          <div className="mb-3 flex justify-end sm:mb-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label="Previous subcategories"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7DEDC] text-[#292524] transition-all duration-300 hover:-translate-y-1 hover:bg-[#A96870] hover:text-white hover:shadow-lg sm:h-10 sm:w-10"
              >
                <ArrowLeft size={17} />
              </button>
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                aria-label="Next subcategories"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7DEDC] text-[#292524] transition-all duration-300 hover:-translate-y-1 hover:bg-[#A96870] hover:text-white hover:shadow-lg sm:h-10 sm:w-10"
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {/* Auto Carousel */}
        <Swiper
          modules={[Autoplay]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          slidesPerView={2.2}
          spaceBetween={14}
          loop={subcategories.length > 2}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={900}
          breakpoints={{
            480: {
              slidesPerView: 2.8,
              spaceBetween: 18,
            },
            640: {
              slidesPerView: 3.5,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 26,
            },
            1280: {
              slidesPerView: 6,
              spaceBetween: 30,
            },
          }}
          className="subcategory-swiper !overflow-visible"
        >
          {subcategories.map((subcategory) => {
            const parentName = subcategory.parent_name;

            return (
              <SwiperSlide key={subcategory.category_id}>
                <Link
                  href={`/user/${categorySlug(parentName)}/${categorySlug(subcategory.name)}`}
                  className="group flex h-full flex-col items-center gap-4 pb-3 text-center"
                >
                  {/* 3D Circle Image */}
                  <div className="relative aspect-square w-[min(34vw,150px)] shrink-0 rounded-full p-[5px] transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:scale-105 sm:w-[140px] md:w-[155px] lg:w-[165px]"
                    style={{
                      background:
                        "linear-gradient(145deg, #ffffff, #e9d9d5, #c99da0)",
                      boxShadow:
                        "8px 10px 20px rgba(80, 45, 45, 0.16), -5px -5px 14px rgba(255,255,255,0.9), inset 2px 2px 5px rgba(255,255,255,0.9)",
                    }}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-white bg-[#EEE4DC]">
                      {subcategory.image ? (
                        <Image
                          src={subcategory.image}
                          alt={`${subcategory.name} fashion`}
                          fill
                          sizes="(max-width: 480px) 34vw, (max-width: 768px) 140px, 165px"
                          unoptimized
                          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full rounded-full bg-gradient-to-br from-[#EEE4DC] to-[#D4BFB0]" />
                      )}

                      {/* Glossy highlight */}
                      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-black/10" />

                      <div className="pointer-events-none absolute left-[18%] top-[10%] h-[18%] w-[35%] rotate-[-35deg] rounded-full bg-white/30 blur-md" />
                    </div>
                  </div>

                  {/* Category Name */}
                  <span className="w-full px-1 text-xs font-semibold leading-snug text-[#292524] transition-all duration-300 group-hover:translate-y-[-2px] group-hover:text-[#A96870] sm:text-sm md:text-base">
                    {subcategory.name}
                  </span>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
