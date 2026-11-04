
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
        <div className="mb-5 flex flex-col items-start gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between md:mb-10">
          <h2 className="font-serif text-2xl font-bold leading-tight tracking-wide text-[#292524] sm:text-[38px]">
            Featured Collection
          </h2>
          <Link
            href="/user/shop?sort=featured"
<<<<<<< HEAD
            className="group/button hidden min-h-10 items-center gap-2 bg-[var(--color-banner)] px-4 py-2 text-[10px] font-bold uppercase tracking-[1.2px] text-white transition-colors duration-300 hover:bg-[#A96870] sm:inline-flex sm:text-xs"
=======
            className="inline-flex shrink-0 items-center gap-3 bg-[var(--color-primary)] px-4 py-3 text-[10px] font-bold uppercase tracking-[1.2px] text-white transition-colors duration-300 hover:bg-[var(--color-primary-hover)] sm:min-h-[50px] sm:px-5 sm:text-sm"
>>>>>>> 3491e1565e547a01e556a06f4b199da5ed6a56ea
          >
            View All Products
            <ArrowRight
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover/button:translate-x-1"
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
                <ProductCard product={product} />
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
        <Link
          href="/user/shop?sort=featured"
          className="group/button mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 bg-[var(--color-banner)] px-4 py-2 text-[10px] font-bold uppercase tracking-[1.2px] text-white transition-colors duration-300 hover:bg-[#A96870] sm:hidden"
        >
          View All Products
          <ArrowRight
            size={14}
            strokeWidth={1.8}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover/button:translate-x-1"
          />
        </Link>

      </div>
    </section>
  );
}
