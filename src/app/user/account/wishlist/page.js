
"use client";

import Link from "next/link";
import { useState } from "react";
import products from "@/data/products";
import {
  Heart,
  ArrowLeft,
  ShoppingBag,
  X,
} from "lucide-react";

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState([1, 2]);
  const wishlist = products.filter((product) =>
    wishlistIds.includes(product.id)
  );

  const handleRemove = (productId) => {
    const savedWishlist = JSON.parse(
      localStorage.getItem("velora-wishlist") || "[]"
    );

    const updatedWishlist = savedWishlist.filter(
      (id) => String(id) !== String(productId)
    );

    localStorage.setItem(
      "velora-wishlist",
      JSON.stringify(updatedWishlist)
    );
    setWishlistIds((currentIds) =>
      currentIds.filter((id) => id !== productId)
    );
    window.dispatchEvent(new Event("velora-wishlist-updated"));
  };

  return (
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">

      <header className="border-b border-[#D8D0C8]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

          <Link
            href="/user"
            className="font-serif text-3xl tracking-[4px]"
          >
            VELORA
          </Link>

          <Link
            href="/user/account"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#6B625C] hover:text-[#72383D]"
          >
            <ArrowLeft size={15} />
            My Account
          </Link>

        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">

        <div className="mb-10">

          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
            Saved Items
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl">
            MY WISHLIST
          </h1>

        </div>

        {wishlist.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {wishlist.map((product) => (

              <div
                key={product.id}
                className="group border border-[#D8D0C8] bg-[#F8F5F1]"
              >

                <div className="relative aspect-[3/4] overflow-hidden bg-[#E3DCD1]">

                  <img
                    src={product.images?.[0] || "/images/products/placeholder.webp"}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemove(product.id)}
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#72383D] shadow-sm"
                  >
                    <X size={16} />
                  </button>

                </div>

                <div className="p-5">

                  <p className="text-[10px] uppercase tracking-[1.5px] text-[#8B817A]">
                    {product.category} / {product.subcategory}
                  </p>

                  <h2 className="mt-2 font-serif text-xl">
                    {product.name}
                  </h2>

                  <p className="mt-2 text-sm font-semibold">
                    Rs. {Number(product.price).toLocaleString()}
                  </p>

                  <Link
                    href={`/user/product/${product.id}`}
                    className="mt-5 flex h-11 items-center justify-center gap-2 bg-[#322D29] text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#72383D]"
                  >
                    <ShoppingBag size={15} />
                    View Product
                  </Link>

                </div>

              </div>

            ))}

          </div>
        ) : (
          <div className="border border-[#D8D0C8] bg-[#F8F5F1] px-6 py-16 text-center">

            <Heart
              size={40}
              className="mx-auto text-[#8B817A]"
            />

            <h2 className="mt-5 font-serif text-2xl">
              Your wishlist is empty
            </h2>

            <p className="mt-2 text-sm text-[#8B817A]">
              Save your favorite products here.
            </p>

            <Link
              href="/user/shop"
              className="mt-6 inline-block bg-[#322D29] px-6 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white hover:bg-[#72383D]"
            >
              Start Shopping
            </Link>

          </div>
        )}

      </section>

    </main>
  );
}


