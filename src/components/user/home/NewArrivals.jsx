
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "../product/ProductCard";

export default function NewArrivals() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadNewArrivals() {
      try {
        const response = await fetch(
          "/api/user/Product?status=active",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load new arrivals");
        }

        const result = await response.json();

        const products = Array.isArray(result.data)
          ? result.data.slice(0, 4).map((product) => ({
              id: product.item_id,
              name: product.title,
              category: product.category_name,
              rating: Number(product.rating) || 0,
              reviews: Number(product.review_count) || 0,
              stock_quantity: product.total_stock,
              price: product.price,
              discount: product.discount,
              image: product.image,
              images: product.image ? [product.image] : [],
              variants: product.variants || [],
              sizes: product.sizes || [],
              colors: product.colors || [],
              stock: Number(product.total_stock) || 0,
            }))
          : [];

        setNewArrivals(products);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("New arrivals error:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadNewArrivals();

    return () => controller.abort();
  }, []);

  return (
    <section className="bg-[#FFFFFF] px-0 py-7 sm:py-10 md:py-12">
      <div className="mx-0 w-full max-w-none">

        {/* Heading */}
        <div className="mb-5 flex flex-col items-start gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between md:mb-10">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]">
              Just landed
            </p>
            <h2 className="font-serif text-2xl font-bold leading-tight tracking-wide text-[#292524] sm:text-[38px]">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/user/shop?sort=newest"
            className="group/button hidden min-h-10 items-center gap-2 bg-[var(--color-primary)] px-4 py-2 text-[10px] font-bold uppercase tracking-[1.2px] text-white transition-[background-color,box-shadow,transform] duration-300 ease-out hover:bg-[var(--color-primary-hover)] hover:shadow-[0_4px_14px_rgba(17,17,17,0.18)] active:scale-[0.98] motion-reduce:transition-none sm:inline-flex sm:text-xs sm:active:scale-100"
          >
            View All Products
            <ArrowRight
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover/button:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
        </div>

        {/* 4 Product Cards Horizontally */}
        {!loading && newArrivals.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {newArrivals.map((product) => (
              <div
                key={product.id}
                className="shadow-[0_4px_15px_rgba(50,45,41,0.10)]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-[320px] w-full animate-pulse rounded-tr-[2.5rem] rounded-bl-[2.5rem] bg-[#EFECE6] sm:h-[450px]"
              />
            ))}
          </div>
        )}

        {!loading && newArrivals.length === 0 && (
          <p className="py-8 text-center text-sm text-[#6B625D]">
            No new products available right now.
          </p>
        )}
        <Link
          href="/user/shop?sort=newest"
          className="group/button mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 bg-[var(--color-primary)] px-4 py-2 text-[10px] font-bold uppercase tracking-[1.2px] text-white transition-[background-color,box-shadow,transform] duration-300 ease-out hover:bg-[var(--color-primary-hover)] hover:shadow-[0_4px_14px_rgba(17,17,17,0.18)] active:scale-[0.98] motion-reduce:transition-none sm:hidden"
        >
          View All Products
          <ArrowRight
            size={14}
            strokeWidth={1.8}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover/button:translate-x-1 motion-reduce:transition-none"
          />
        </Link>

      </div>
    </section>
  );
}
