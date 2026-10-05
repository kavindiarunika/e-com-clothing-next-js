"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

import ProductCard from "@/components/user/product/ProductCard";

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [requiresSignIn, setRequiresSignIn] = useState(false);

  const loadWishlist = useCallback(async () => {
    try {
      const response = await fetch("/api/user/wishlist", {
        cache: "no-store",
      });
      const result = await response.json();

      if (response.status === 401) {
        setRequiresSignIn(true);
        setWishlistProducts([]);
        setLoadError("");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load your wishlist.");
      }

      const savedProducts = Array.isArray(result.data) ? result.data : [];
      setWishlistProducts(savedProducts);
      setRequiresSignIn(false);
      setLoadError("");

      const savedIds = savedProducts.map((product) => product.id);
      localStorage.setItem("velora-wishlist", JSON.stringify(savedIds));
    } catch (error) {
      console.error("Could not load customer wishlist:", error);
      setLoadError(error.message || "Unable to load your wishlist.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadWishlist, 0);

    const handleWishlistUpdated = () => {
      void loadWishlist();
    };

    window.addEventListener(
      "velora-wishlist-updated",
      handleWishlistUpdated
    );

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener(
        "velora-wishlist-updated",
        handleWishlistUpdated
      );
    };
  }, [loadWishlist]);

  const handleWishlistChange = useCallback((productId, isWishlisted) => {
    setWishlistProducts((current) => (
      isWishlisted
        ? current
        : current.filter((product) => String(product.id) !== String(productId))
    ));
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
        {isLoading ? (
          <p className="py-12 text-center text-sm text-[#6B625D]">
            Loading your wishlist...
          </p>
        ) : loadError ? (
          <p role="alert" className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            {loadError}
          </p>
        ) : requiresSignIn ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center border border-[#D8CEC5] bg-white px-6 text-center">
            <h2 className="font-serif text-2xl text-[#322D29]">
              Sign in to view your wishlist
            </h2>
            <Link
              href="/user/login?next=%2Fuser%2Fwishlist"
              className="mt-6 inline-flex items-center gap-2 bg-[#72383D] px-6 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#322D29]"
            >
              Sign In
            </Link>
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {wishlistProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showSoldOut
                onWishlistChange={handleWishlistChange}
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
              back when you&apos;re ready to shop.
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