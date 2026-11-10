
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

const categoryPaths = {
  men: "/user/men",
  women: "/user/women",
  kids: "/user/kids",
};

const fallbackImages = {
  men: "/images/men/01.jpg",
  women: "/images/women/05.jpg",
  kids: "/images/kids/02.jpg",
};

const categoryOrder = ["men", "women", "kids", "adult"];

function normalizeCategoryImage(value) {
  if (!value || typeof value !== "string") return "";

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
        signature.split("").map((char) => char.charCodeAt(0))
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

function CategoryTile({ category, categories, featured = false }) {
  const key = category.name.trim().toLowerCase();

  const parentCategory = categories.find(
    (item) =>
      Number(item.category_id) ===
      Number(category.parent_category_id)
  );

  const parentPath =
    categoryPaths[parentCategory?.name.trim().toLowerCase()];

  const subcategorySlug = category.name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const href =
    category.parent_category_id && parentPath
      ? `${parentPath}/${encodeURIComponent(subcategorySlug)}`
      : categoryPaths[key] || "/user/shop";

  const image =
    normalizeCategoryImage(category.image) || fallbackImages[key];

  const label =
    key === "men"
      ? "Men's"
      : key === "women"
        ? "Women's"
        : key === "kids"
          ? "Kids"
          : category.name;

  return (
    <Link
      href={href}
      style={{ minHeight: 0 }}
      className={`group relative isolate block overflow-hidden rounded-2xl bg-[#EDE8E2] shadow-[0_8px_25px_rgba(41,37,36,0.07)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(41,37,36,0.16)] ${
        featured
          ? "row-span-4 h-full min-h-[0px] md:row-span-2"
          : "h-full min-h-[0px]"
      }`}
    >
      {/* Background Image */}
      {image ? (
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={image}
            alt={`${category.name} fashion`}
            fill
            sizes={
              featured
                ? "(max-width: 767px) 100vw, 33vw"
                : "(max-width: 767px) 100vw, 33vw"
            }
            unoptimized
            priority={featured}
            className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-110"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#E5E0D9] to-[#B6A49A]" />
      )}

      {/* Image Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/5 transition-all duration-500 group-hover:from-black/85" />

      {/* Arrow Button */}
      <div className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-md transition-all duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-[#292524] sm:right-4 sm:top-4 sm:h-9 sm:w-9 lg:right-6 lg:top-6 lg:h-11 lg:w-11">
        <ArrowUpRight size={16} className="sm:h-[18px] sm:w-[18px]" />
      </div>

      {/* Category Name */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-2.5 text-white sm:p-5 lg:p-8">
        <h3
          className={`font-serif font-medium leading-none tracking-tight ${
            featured
              ? "text-xl sm:text-4xl lg:text-6xl"
              : "text-base sm:text-2xl lg:text-4xl"
          }`}
        >
          {label}
        </h3>
      </div>

      {/* Hover Border */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/0 transition-all duration-500 group-hover:border-white/40" />
    </Link>
  );
}

export default function CategorySection() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories", {
          signal: controller.signal,
        });

        if (!response.ok) {
          setCategories([]);
          return;
        }

        const data = await response.json();

        const activeCategories = (Array.isArray(data) ? data : []).filter(
          (category) =>
            category &&
            category.name &&
            category.status !== "inactive"
        );

        setCategories(activeCategories);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Category fetch error:", error);
          setCategories([]);
        }
      }
    };

    loadCategories();

    return () => controller.abort();
  }, []);

  if (!categories.length) return null;

  const orderedCategories = [...categories]
    .sort((a, b) => {
      const aParent = Boolean(a.parent_category_id);
      const bParent = Boolean(b.parent_category_id);

      if (aParent !== bParent) return aParent ? 1 : -1;

      const aIndex = categoryOrder.indexOf(
        a.name.trim().toLowerCase()
      );

      const bIndex = categoryOrder.indexOf(
        b.name.trim().toLowerCase()
      );

      const orderDifference =
        (aIndex === -1 ? categoryOrder.length : aIndex) -
        (bIndex === -1 ? categoryOrder.length : bIndex);

      return orderDifference || a.name.localeCompare(b.name);
    })
    .slice(0, 5);

  const [featuredCategory, ...sideCategories] = orderedCategories;

  return (
    <section className="scroll-mt-20 overflow-hidden bg-white py-10 sm:py-14 lg:py-16">
      <div className="mb-7 sm:mb-9">
        <h2 className="font-serif text-2xl font-semibold text-[#292524] sm:text-3xl">
          Find Your Style
        </h2>
      </div>

      <div className="grid h-[520px] grid-cols-2 grid-rows-4 gap-2 md:h-[600px] md:grid-cols-3 md:grid-rows-2 md:gap-5 lg:gap-6">
        <CategoryTile
          category={featuredCategory}
          categories={categories}
          featured
        />

        {sideCategories.length > 0 && (
          <div className="col-span-1 row-span-4 grid h-full min-h-[0px] grid-cols-1 grid-rows-4 gap-2 md:col-span-2 md:row-span-2 md:grid-cols-2 md:grid-rows-2 md:gap-5 lg:gap-6">
            {sideCategories.map((category) => (
              <CategoryTile
                key={category.category_id || category.name}
                category={category}
                categories={categories}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
