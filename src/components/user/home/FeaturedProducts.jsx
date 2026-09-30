"use client";

import { useEffect, useState } from "react";
import ProductCard from "../product/ProductCard";

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeaturedProducts() {
      try {
        const response = await fetch(
          "/api/user/Product?status=active&featured=1",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load featured products");
        }

        const result = await response.json();
        const products = Array.isArray(result.data)
          ? result.data.slice(0, 5).map((product) => ({
              id: product.item_id,
              name: product.title,
              category: product.category_name,
              stock_quantity: product.stock_quantity,
              price: product.price,
              discount: product.discount,
              image: product.image,
              images: product.image ? [product.image] : [],
              variants: [],
            }))
          : [];

        setFeaturedProducts(products);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Featured products error:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadFeaturedProducts();

    return () => controller.abort();
  }, []);

  return (
    <section className="bg-[#F8F5F2] px-4 py-10 sm:px-6 md:py-12 lg:px-8">
      <div className="mx-auto max-w-[1400px]">

        {/* Heading */}
        <div className="mb-8 text-left md:mb-10">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[4px] text-[#AC9C8D]">
            Curated For You
          </p>

          <h2 className="font-serif text-3xl font-medium tracking-wide text-[#322D29] sm:text-4xl">
            Featured Collection
          </h2>

          <div className="mt-5 h-px w-12 bg-[#72383D]" />

          
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {!loading && featuredProducts.length === 0 && (
          <p className="py-8 text-center text-sm text-[#6B625D]">
            No featured products available right now.
          </p>
        )}

        {/* View All */}
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