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

function CategoryTile({ category, categories, featured = false }) {
  const key = category.name.trim().toLowerCase();
  const parentCategory = categories.find(
    (item) => Number(item.category_id) === Number(category.parent_category_id),
  );
  const parentPath = categoryPaths[parentCategory?.name.trim().toLowerCase()];
  const subcategorySlug = category.name.trim().toLowerCase().replace(/\s+/g, "-");
  const href = category.parent_category_id && parentPath
    ? `${parentPath}/${encodeURIComponent(subcategorySlug)}`
    : categoryPaths[key] || "/user/shop";
  const image = normalizeCategoryImage(category.image) || fallbackImages[key];
  const label =
    key === "men" ? "Men's" : key === "women" ? "Women's" : key === "kids" ? "Kid's" : category.name;
  const description =
    key === "men"
      ? "Everyday essentials, made to move."
      : key === "women"
        ? "Fresh looks for every day."
        : key === "kids"
          ? "Comfort and color for little ones."
          : "Find your next favorite look.";

  return (
    <Link
      href={href}
      className={`group relative block min-h-[190px] overflow-hidden rounded-md bg-[#F2EEE8] shadow-[0_6px_20px_rgba(224,190,88,0.12)] transition-shadow duration-300 hover:shadow-[0_10px_26px_rgba(224,190,88,0.2)] ${
        featured ? "h-[300px] md:row-span-2 md:h-full" : "h-full"
      }`}
    >
      {image ? (
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={`${category.name} fashion`}
            fill={true}
            sizes="(max-width: 767px) 100vw, 50vw"
            unoptimized
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#E5E0D9] to-[#B6A49A]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-colors group-hover:from-black/80" />
      <div className="absolute inset-x-4 bottom-4 z-10 text-white sm:inset-x-6 sm:bottom-6">
        <p className="mb-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/80 sm:text-[9px]">
          The collection
        </p>
        <h3 className={featured ? "font-serif text-2xl leading-tight sm:text-4xl" : "font-serif text-xl leading-tight sm:text-2xl"}>
          {label}
        </h3>
        <p className="mt-1 max-w-48 text-[10px] leading-relaxed text-white/85 sm:mt-2 sm:text-xs">
          {description}
        </p>
        <span className="mt-2 inline-flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.14em] text-white sm:mt-3 sm:text-[9px]">
          Shop now
          <ArrowUpRight
            size={14}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
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

  const orderedCategories = [...categories]
    .sort((a, b) => {
      const aParent = Boolean(a.parent_category_id);
      const bParent = Boolean(b.parent_category_id);
      if (aParent !== bParent) return aParent ? 1 : -1;

      const aIndex = categoryOrder.indexOf(a.name.trim().toLowerCase());
      const bIndex = categoryOrder.indexOf(b.name.trim().toLowerCase());
      const orderDifference =
        (aIndex === -1 ? categoryOrder.length : aIndex) -
        (bIndex === -1 ? categoryOrder.length : bIndex);

      return orderDifference || a.name.localeCompare(b.name);
    })
    .slice(0, 5);
  const [featuredCategory, ...sideCategories] = orderedCategories;

  return (
    <section className="scroll-mt-20 bg-white py-8 sm:py-12">
      <div className="mb-5 sm:mb-7">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#292524]">
          Made for your everyday
        </p>
        <h2 className="font-serif text-2xl font-medium text-[#292524] sm:text-3xl">
          Shop by Category
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:h-[500px] md:grid-cols-3 md:gap-5">
        <CategoryTile
          category={featuredCategory}
          categories={categories}
          featured
        />
        {sideCategories.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-2 md:row-span-2 md:h-full md:min-h-0 md:grid-cols-2 md:grid-rows-2 md:gap-5">
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
