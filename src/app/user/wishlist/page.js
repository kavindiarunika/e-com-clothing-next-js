"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

import ProductCard from "@/components/user/product/ProductCard";
import products from "@/data/products";

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState([]);

  const loadWishlist = () => {
    const savedWishlist =
      JSON.parse(
        localStorage.getItem("velora-wishlist") || "[]"
      );

    const savedProducts = products.filter((product) =>
      savedWishlist.includes(product.id)
    );

    setWishlistProducts(savedProducts);
  };

  useEffect(() => {
    loadWishlist();

    const handleWishlistUpdated = () => {
      loadWishlist();
    };

    window.addEventListener(
      "velora-wishlist-updated",
      handleWishlistUpdated
    );

    return () => {
      window.removeEventListener(
        "velora-wishlist-updated",
        handleWishlistUpdated
      );
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#EFE9E1]">
      {/* Header */}
      <section className="mx-auto w-[92%] max-w-[1200px] py-12 md:py-16">
        <div className="flex items-center gap-3">
          <Heart
            size={24}
            className="text-[#72383D]"
            fill="#72383D"
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#72383D]">
              Your Collection
            </p>

            <h1 className="mt-2 font-serif text-4xl text-[#322D29] md:text-5xl">
              Wishlist
            </h1>
          </div>
        </div>

        <p className="mt-4 text-sm text-[#6B625D]">
          {wishlistProducts.length}{" "}
          {wishlistProducts.length === 1
            ? "item"
            : "items"}{" "}
          saved
        </p>
      </section>

      {/* Products */}
      <section className="mx-auto w-[92%] max-w-[1200px] pb-20">
        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {wishlistProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center border border-[#D8CEC5] bg-white px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFE9E1]">
              <Heart
                size={28}
                className="text-[#72383D]"
              />
            </div>

            <h2 className="mt-6 font-serif text-2xl text-[#322D29]">
              Your wishlist is empty
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#6B625D]">
              Save your favorite pieces here and come
              back when you're ready to shop.
            </p>

            <Link
              href="/user/shop"
              className="mt-6 inline-flex items-center gap-2 bg-[#72383D] px-6 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#322D29]"
            >
              <ArrowLeft size={15} />
              Continue Shopping
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}