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

const categoryOrder = ["men", "women", "kids"];

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
        signature.split("").map((char) => char.charCodeAt(0)),
      );

      if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
        return `data:image/png;base64,${base64}`;
      }

      if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return `data:image/jpeg;base64,${base64}`;
      }

      if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
        return `data:image/gif;base64,${base64}`;
      }

      if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
        return `data:image/webp;base64,${base64}`;
      }

      return `data:image/jpeg;base64,${base64}`;
    } catch {
      return "";
    }
  }

  return text;
}

function CategoryTile({ category, featured = false }) {
  const key = category.name.trim().toLowerCase();
  const href = categoryPaths[key] || "/user/shop";
  const image = normalizeCategoryImage(category.image) || fallbackImages[key];
  const label =
    key === "men" ? "Men's" : key === "women" ? "Women's" : key === "kids" ? "Kid's" : category.name;

  return (
    <Link
      href={href}
      className={`group relative block min-h-[190px] overflow-hidden bg-[#E8E4DF] ${
        featured ? "h-[300px] md:row-span-2 md:h-full" : "h-full"
      }`}
    >
      {image ? (
        <Image
          src={image}
          alt={`${category.name} fashion`}
          fill
          sizes="(max-width: 767px) 100vw, 50vw"
          unoptimized
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-[#E5E5E5] to-[#B6A49A]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-colors group-hover:from-black/70" />
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white sm:inset-x-6 sm:bottom-6">
        <h3 className={featured ? "font-serif text-2xl sm:text-3xl" : "font-serif text-xl sm:text-2xl"}>
          {label}
        </h3>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center bg-white text-[#292524] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

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
        const activeCategories = (Array.isArray(data) ? data : []).filter(
          (category) =>
            category &&
            category.name &&
            !category.parent_category_id &&
            category.status !== "inactive",
        );

        setCategories(activeCategories);
      } catch (error) {
        console.error("Category fetch error:", error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  if (!categories.length) return null;

  const orderedCategories = [...categories].sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.name.trim().toLowerCase());
    const bIndex = categoryOrder.indexOf(b.name.trim().toLowerCase());
    return (aIndex === -1 ? categoryOrder.length : aIndex) -
      (bIndex === -1 ? categoryOrder.length : bIndex);
  });
  const [featuredCategory, ...otherCategories] = orderedCategories;
  const sideCategories = otherCategories.slice(0, 2);
  const additionalCategories = otherCategories.slice(2);

  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="mb-5 sm:mb-7">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]">
          Explore your options
        </p>
        <h2 className="font-serif text-2xl font-semibold text-[#292524] sm:text-3xl">
          Shop by Category
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:h-[560px] md:grid-cols-2 md:gap-5">
        <CategoryTile category={featuredCategory} featured />
        {sideCategories.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 md:grid-rows-2 md:gap-5">
            {sideCategories.map((category) => (
              <CategoryTile
                key={category.category_id || category.name}
                category={category}
              />
            ))}
          </div>
        )}
      </div>

      {additionalCategories.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {additionalCategories.map((category) => (
            <CategoryTile
              key={category.category_id || category.name}
              category={category}
            />
          ))}
        </div>
      )}
    </section>
  );
}
