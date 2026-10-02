"use client";

import { useEffect, useState } from "react";
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
          ? result.data.slice(0, 5).map((product) => ({
              id: product.item_id,
              name: product.title,
              category: product.category_name,
              stock_quantity: product.total_stock,
              price: product.price,
              discount: product.discount,
              image: product.image,
              images: product.image ? [product.image] : [],
              variants: product.variants || [],
              sizes: product.sizes || [],
              colors: product.colors || [],
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
    <section className="bg-[#EFE9E1] px-4 py-10 sm:px-6 md:py-12 lg:px-8">
      <div className="mx-auto max-w-350">

        {/* Heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end md:mb-10">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[4px] text-[#AC9C8D]">
              Just In
            </p>

            <h2 className="font-serif text-3xl font-medium tracking-wide text-[#322D29] sm:text-4xl">
              New Arrivals
            </h2>

            <div className="mt-5 h-px w-12 bg-[#72383D]" />
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-4">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {!loading && newArrivals.length === 0 && (
          <p className="py-8 text-center text-sm text-[#6B625D]">
            No new products available right now.
          </p>
        )}

        {/* View All Products Button */}
        <div className="mt-12 text-center">
          <a
            href="/user/shop"
            className="inline-flex items-center gap-3 border border-[#72383D] px-7 py-3.5 text-xs font-semibold uppercase tracking-[1.5px] text-[#72383D] transition duration-300 hover:bg-[#72383D] hover:text-white"
          >
            View All Products
            <span>→</span>
          </a>
        </div>

      </div>
    </section>
  );
}