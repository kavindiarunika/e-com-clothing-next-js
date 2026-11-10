
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <section className="bg-[#FFFFFF] px-0 py-7 sm:py-10 md:py-12">
      <div className="mx-0 w-full max-w-none">

        {/* Heading */}
        <div className="mb-5 flex items-center justify-between gap-2 sm:mb-8 md:mb-10">
          <div className="min-w-0">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]">
              Handpicked for you
            </p>
            <h2 className="font-serif text-xl font-bold leading-tight tracking-wide text-[#292524] sm:text-[38px]">
              Featured Collection
            </h2>
          </div>
          <Link
            href="/user/shop?sort=featured"
            className="group/button inline-flex min-h-9 shrink-0 items-center gap-1 bg-[var(--color-primary)] px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.8px] text-white transition-[background-color,box-shadow,transform] duration-300 ease-out hover:bg-[var(--color-primary-hover)] hover:shadow-[0_4px_14px_rgba(17,17,17,0.18)] active:scale-[0.98] motion-reduce:transition-none sm:min-h-10 sm:gap-2 sm:px-4 sm:text-xs sm:tracking-[1.2px] sm:active:scale-100"
          >
            View All
            <ArrowRight
              size={12}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover/button:translate-x-1 motion-reduce:transition-none sm:h-[14px] sm:w-[14px]"
            />
          </Link>
        </div>

        {/* Products - 4 Cards Horizontal */}
        {!loading && featuredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="shadow-[0_4px_15px_rgba(50,45,41,0.10)]"
              >
                <ProductCard product={product} compact />
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
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

        {/* No Products */}
        {!loading && featuredProducts.length === 0 && (
          <p className="py-8 text-center text-sm text-[#6B625D]">
            No featured products available right now.
          </p>
        )}
      </div>
    </section>
  );
}
