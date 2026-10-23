
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
    <section className="bg-[#FFFFFF] px-0 py-10 md:py-12">
      <div className="mx-0 w-full max-w-none">

        {/* Heading */}
        <div className="mb-8 flex items-end justify-between md:mb-10">
          <h2 className="font-serif text-[32px] font-bold tracking-wide text-[#292524] sm:text-[38px]">
            Featured Collection
          </h2>
          <Link
            href="/user/shop?sort=featured"
            className="inline-flex shrink-0 items-center gap-3 bg-[#e63e62] px-4 py-3 text-[10px] font-bold uppercase tracking-[1.2px] text-white transition-colors duration-300 hover:bg-[#c92f50] sm:min-h-[50px] sm:px-5 sm:text-sm"
          >
            View All Products
            <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
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
                className="h-[450px] w-full animate-pulse rounded-tr-[2.5rem] rounded-bl-[2.5rem] bg-[#EFECE6]"
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
