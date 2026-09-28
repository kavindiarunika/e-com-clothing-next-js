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
      const base64 = text.replace(/\s/g, "");
      const signature = atob(base64.slice(0, 16));
      const bytes = new Uint8Array(signature.split("").map((char) => char.charCodeAt(0)));

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
    <section className="bg-[#EFE9E1] px-[4%] py-12 md:py-14">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 text-left md:mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[4px] text-[#AC9C8D]">
            Explore Our Collection
          </p>

          <h2 className="font-serif text-3xl font-medium tracking-wide text-[#322D29] sm:text-4xl md:text-5xl">
            Shop by Category
          </h2>

          <div className="mt-5 h-px w-12 bg-[#72383D]" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.category_id || category.name}
              href={categoryPaths[category.name.trim().toLowerCase()] || "/user/shop"}
              className="group relative block h-80 overflow-hidden bg-[#D8CEC5] sm:h-87.5"
            >
              {category.image ? (
                <img
                  src={normalizeCategoryImage(category.image)}
                  alt={`${category.name} fashion`}
                  className="h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[#D8CEC5] to-[#B6A49A]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#322D29]/80 via-[#322D29]/20 to-transparent transition duration-500 group-hover:from-[#322D29]/90" />

              <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-8">
                <p className="mb-2 text-[10px] uppercase tracking-[3px] text-[#AC9C8D]">
                  Discover
                </p>

                <h3 className="font-serif text-3xl italic md:text-4xl">
                  {category.name}
                </h3>

                <div className="mt-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[1.5px]">
                  <span>Shop Collection</span>

                  <span className="transition-transform duration-300 group-hover:translate-x-2">
                    →
                  </span>
                </div>
              </div>

              <div className="absolute left-5 right-5 top-5 h-px bg-white/30 opacity-0 transition duration-500 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}