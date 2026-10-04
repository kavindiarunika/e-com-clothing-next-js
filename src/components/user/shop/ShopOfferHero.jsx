"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { sanitizeProductDescription } from "@/lib/productDescription";

export default function ShopOfferHero() {
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOffers() {
      try {
        const response = await fetch("/api/user/offers", {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load shop offers");
        }

        const currentOffer = (Array.isArray(result.data) ? result.data : [])
          .find((item) => item.status === "active" && item.banner_image);

        setOffer(currentOffer || null);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Shop offer hero error:", error);
          setOffer(null);
        }
      }
    }

    void loadOffers();
    return () => controller.abort();
  }, []);

  if (!offer) return null;

  return (
    <section
      aria-label="Current offers"
      className="mx-auto w-[92%] max-w-[1200px] pt-6 md:pt-8"
    >
      <article
        className="relative isolate min-h-[260px] overflow-hidden bg-[#322D29] md:min-h-[360px]"
      >
        <Image
          src={offer.banner_image}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 1200px) 92vw, 1200px"
          className="absolute inset-0 z-0 object-cover"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#171310]/90 via-[#171310]/65 to-[#171310]/10" />

        <div className="relative z-20 flex min-h-[260px] max-w-2xl flex-col justify-center px-6 py-10 text-white sm:px-10 md:min-h-[360px] md:px-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[3px] text-[#E3DCD1]">
            Velora Offer
          </p>
          <h2 className="max-w-xl font-serif text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
            {offer.title}
          </h2>
          {offer.description && (
            <div
              className="mt-4 max-w-lg text-sm leading-6 text-white/80"
              dangerouslySetInnerHTML={{
                __html: sanitizeProductDescription(offer.description),
              }}
            />
          )}
          <Link
            href={
              offer.offer_id
                ? `/user/offers/${offer.offer_id}`
                : offer.link || "/user/shop"
            }
            className="mt-6 inline-flex w-fit items-center gap-2 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29] transition hover:bg-[#E3DCD1]"
          >
            Explore Offer
            <ArrowRight size={15} />
          </Link>
        </div>
      </article>
    </section>
  );
}
