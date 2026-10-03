"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Tag } from "lucide-react";
import { sanitizeProductDescription } from "@/lib/productDescription";

function formatOfferDate(value) {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          throw new Error(result.message || "Failed to load offers");
        }

        setOffers(
          (Array.isArray(result.data) ? result.data : [])
            .filter((offer) => offer.status === "active")
        );
      } catch (loadError) {
        if (!controller.signal.aborted) {
          console.error("Offers page error:", loadError);
          setError("Offers could not be loaded. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadOffers();
    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-[#EFE9E1]">
      <section className="mx-auto w-[92%] max-w-[1200px] py-10 md:py-14">
        <div className="mb-8">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[3px] text-[#72383D]">
            <Tag size={14} />
            Velora
          </p>
          <h1 className="font-serif text-4xl font-medium text-[#322D29] md:text-5xl">
            Offers
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6B625C]">
            Discover our latest promotions and special offers.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center bg-white text-sm text-[#6B625C]">
            Loading offers...
          </div>
        ) : error ? (
          <div role="alert" className="bg-white px-6 py-12 text-center text-sm text-[#72383D]">
            {error}
          </div>
        ) : offers.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {offers.map((offer) => (
              <article
                key={offer.offer_id}
                className="overflow-hidden bg-white shadow-sm"
              >
                {offer.banner_image && (
                  <div className="relative aspect-[16/9] bg-[#D8D0C8]">
                    <Image
                      src={offer.banner_image}
                      alt={offer.title}
                      fill
                      sizes="(max-width: 768px) 92vw, 46vw"
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-6 md:p-8">
                  <h2 className="font-serif text-2xl text-[#322D29]">
                    {offer.title}
                  </h2>
                  {offer.description && (
                    <div
                      className="mt-3 text-sm leading-6 text-[#6B625C]"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeProductDescription(offer.description),
                      }}
                    />
                  )}

                  {(offer.start_date || offer.end_date) && (
                    <p className="mt-4 text-xs text-[#6B625C]">
                      {offer.start_date && `From ${formatOfferDate(offer.start_date)}`}
                      {offer.start_date && offer.end_date && " · "}
                      {offer.end_date && `Until ${formatOfferDate(offer.end_date)}`}
                    </p>
                  )}

                  <Link
                    href={offer.link || "/user/shop"}
                    className="mt-6 inline-flex items-center gap-2 bg-[#72383D] px-5 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#322D29]"
                  >
                    Explore Offer
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center bg-white px-6 text-center">
            <h2 className="font-serif text-2xl text-[#322D29]">
              No offers right now
            </h2>
            <p className="mt-2 text-sm text-[#6B625C]">
              Check back soon for new promotions.
            </p>
            <Link
              href="/user/shop"
              className="mt-6 inline-flex items-center gap-2 border border-[#72383D] px-5 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-[#72383D] transition hover:bg-[#72383D] hover:text-white"
            >
              Shop Collection
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
