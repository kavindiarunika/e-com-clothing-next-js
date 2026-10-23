"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock3, Tag } from "lucide-react";
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

function getOfferStatus(offer, now) {
  if (!offer) return "inactive";

  const startDate = offer.start_date ? new Date(offer.start_date).getTime() : null;
  const endDate = offer.end_date ? new Date(offer.end_date).getTime() : null;

  if (startDate && startDate > now) return "upcoming";
  if (endDate && endDate <= now) return "expired";
  return offer.status || "active";
}

function getCountdownParts(targetDate, now) {
  if (!targetDate) return null;

  const targetTime = new Date(targetDate).getTime();
  if (!Number.isFinite(targetTime)) return null;

  const remainingSeconds = Math.max(0, Math.floor((targetTime - now) / 1000));
  return {
    days: Math.floor(remainingSeconds / 86400),
    hours: Math.floor((remainingSeconds % 86400) / 3600),
    minutes: Math.floor((remainingSeconds % 3600) / 60),
    seconds: remainingSeconds % 60,
  };
}

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(null);

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();

    const timer = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(timer);
  }, []);

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

        setOffers(Array.isArray(result.data) ? result.data : []);
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

  const visibleOffers = now === null
    ? []
    : offers.filter((offer) => getOfferStatus(offer, now) !== "expired");

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <section className="user-page-full-bleed w-full max-w-none px-[2%] py-8 md:py-10">
        <div className="mb-8 md:mb-10">
          <h1 className="font-serif text-4xl font-medium text-[#292524] md:text-5xl">
            Offers
          </h1>
        </div>

        {loading || now === null ? (
          <div className="flex min-h-64 items-center justify-center bg-white text-sm text-[#6B625C] shadow-sm">
            Loading offers...
          </div>
        ) : error ? (
          <div role="alert" className="bg-white px-6 py-12 text-center text-sm text-[#e63e62] shadow-sm">
            {error}
          </div>
        ) : visibleOffers.length ? (
          <div className="flex flex-col gap-5 md:gap-6">
            {visibleOffers.map((offer) => {
              const status = getOfferStatus(offer, now);
              const countdownTarget = status === "upcoming"
                ? offer.start_date
                : status === "active"
                  ? offer.end_date
                  : null;
              const countdown = getCountdownParts(countdownTarget, now);

              return (
                <article
                  key={offer.offer_id}
                  className="group flex min-h-[140px] overflow-hidden bg-white shadow-[0_8px_24px_rgba(41,37,36,0.14)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(41,37,36,0.2)] sm:min-h-[150px]"
                >
                  <div className="relative w-[36%] shrink-0 overflow-hidden bg-[#E7DEDC] sm:w-[32%] md:w-[28%]">
                    {offer.banner_image ? (
                      <div className="absolute inset-0">
                        <Image
                          src={offer.banner_image}
                          alt={offer.title}
                          fill
                          sizes="(max-width: 640px) 36vw, 32vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F3EEE3] to-[#E7DEDC]">
                        <Tag size={32} className="text-[#e63e62]/70" />
                      </div>
                    )}

                    {status === "upcoming" && (
                      <span className="absolute left-2 top-2 inline-flex items-center rounded-full border border-[#D9CFC6] bg-[#F3E8E2] px-2 py-1 text-[8px] font-semibold uppercase tracking-[1px] text-[#292524] sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-[2px]">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4 md:p-5">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-serif text-xl leading-tight text-[#292524] sm:text-2xl md:text-[2rem]">
                        {offer.title}
                      </h2>

                      {offer.description && (
                        <div
                          className="mt-1 line-clamp-2 text-xs leading-5 text-[#6B625C] sm:mt-2 sm:text-sm sm:leading-6"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeProductDescription(offer.description),
                          }}
                        />
                      )}

                      {(offer.start_date || offer.end_date) && (
                        <p className="mt-1 text-[8px] uppercase tracking-[0.8px] text-[#6B625C] sm:mt-2 sm:text-[10px] sm:tracking-[1px]">
                          {offer.start_date && `From ${formatOfferDate(offer.start_date)}`}
                          {offer.start_date && offer.end_date && " · "}
                          {offer.end_date && `Until ${formatOfferDate(offer.end_date)}`}
                        </p>
                      )}

                      {countdown ? (
                        <div
                          className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.8px] text-[#6B625C] sm:text-xs"
                          aria-label={`${status === "upcoming" ? "Starts" : "Ends"} in ${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, ${countdown.seconds} seconds`}
                        >
                          <Clock3 size={16} className="text-[#e63e62]" />
                          <span>{status === "upcoming" ? "Starts in" : "Ends in"}</span>
                          {[
                            ["Days", countdown.days],
                            ["Hours", countdown.hours],
                            ["Minutes", countdown.minutes],
                            ["Seconds", countdown.seconds],
                          ].map(([label, value]) => (
                            <span
                              key={label}
                              className="rounded-sm bg-[#F7F3F3] px-2 py-1.5 text-sm font-bold tabular-nums text-[#292524]"
                            >
                              {String(value).padStart(2, "0")}
                              <span className="ml-0.5 text-[9px] font-bold text-[#8B817A]">
                                {label[0]}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <Link
                      href={
                        offer.offer_id
                          ? `/user/offers/${offer.offer_id}`
                          : offer.link || "/user/shop"
                      }
                      className="mt-2 inline-flex shrink-0 self-end items-center gap-2 bg-[#e63e62] px-4 py-2 text-[9px] font-semibold uppercase tracking-[1px] text-white transition hover:bg-[#A96870] sm:mt-0 sm:self-center sm:px-5 sm:py-2.5 sm:text-[10px]"
                    >
                      Explore Offer
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center bg-white px-6 py-10 text-center shadow-sm">
            <h2 className="font-serif text-2xl text-[#292524]">
              No offers right now
            </h2>
            <p className="mt-2 text-sm text-[#6B625C]">
              Check back soon for new promotions.
            </p>
            <Link
              href="/user/shop"
              className="mt-6 inline-flex items-center gap-2 border border-[#e63e62] px-5 py-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#e63e62] transition hover:bg-[#e63e62] hover:text-white"
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
