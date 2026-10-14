"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export default function ReviewSection({ product }) {
  const router = useRouter();
  const [ratingSummary, setRatingSummary] = useState({
    averageRating: 0,
    reviewCount: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRatingSummary() {
      try {
        const response = await fetch(
          `/api/user/reviews?item_id=${encodeURIComponent(product.id)}`,
          { signal: controller.signal, cache: "no-store" }
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load product rating.");
        }

        const summary = data.rating_summary || {};
        const distribution = summary.rating_distribution || {};
        setRatingSummary({
          averageRating: Number(summary.average_rating) || 0,
          reviewCount: Number(summary.review_count) || 0,
          distribution: {
            1: Number(distribution[1]) || 0,
            2: Number(distribution[2]) || 0,
            3: Number(distribution[3]) || 0,
            4: Number(distribution[4]) || 0,
            5: Number(distribution[5]) || 0,
          },
        });
        setIsAuthenticated(Boolean(data.is_authenticated));
        setHasSubmittedReview(Boolean(data.has_submitted_review));
        setLoadError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Product rating error:", error);
          setLoadError("Rating could not be loaded. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadRatingSummary();
    return () => controller.abort();
  }, [product.id]);

  const averageRating = ratingSummary.averageRating.toFixed(1);
  const displayedRating =
    selectedRating === null ? averageRating : selectedRating.toFixed(1);

  async function submitRating() {
    if (selectedRating === null || isSubmitting || hasSubmittedReview) {
      return;
    }

    if (!isAuthenticated) {
      router.push(
        `/user/login?next=%2Fuser%2Fproduct%2F${encodeURIComponent(product.id)}`
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("/api/user/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: product.id,
          rating: selectedRating,
          review_text: "",
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit your rating.");
      }

      setRatingSummary({
        averageRating: Number(data.rating_summary.average_rating) || 0,
        reviewCount: Number(data.rating_summary.review_count) || 0,
        distribution: {
          1: Number(data.rating_summary.rating_distribution[1]) || 0,
          2: Number(data.rating_summary.rating_distribution[2]) || 0,
          3: Number(data.rating_summary.rating_distribution[3]) || 0,
          4: Number(data.rating_summary.rating_distribution[4]) || 0,
          5: Number(data.rating_summary.rating_distribution[5]) || 0,
        },
      });
      setHasSubmittedReview(true);
      setSelectedRating(null);
      setSubmitMessage("Your rating has been added to the product rating.");
      window.dispatchEvent(
        new CustomEvent("product-rating-updated", {
          detail: {
            productId: String(product.id),
            ratingSummary: data.rating_summary,
          },
        })
      );
    } catch (error) {
      console.error("Failed to submit product rating:", error);
      setSubmitMessage(
        error.message || "Failed to submit your rating. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="border-t border-[#D8D0C8] pt-8 md:pt-10">
      <div className="grid w-full gap-8 border border-[#D8D0C8] bg-white p-5 sm:grid-cols-[minmax(180px,1fr)_minmax(0,2fr)] sm:items-center sm:p-7">
        <div className="text-center">
          <p className="font-serif text-4xl text-[#322D29]">
            {displayedRating}
          </p>
          <div
            className="mt-2 flex justify-center gap-1"
            role="group"
            aria-label="Choose a rating from 1 to 5 stars"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setSelectedRating(star);
                  setSubmitMessage("");
                }}
                disabled={isLoading || isSubmitting}
                aria-label={`Rate ${star} stars`}
                aria-pressed={selectedRating === star}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#FAF8F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#72383D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Star
                  size={20}
                  aria-hidden="true"
                  className={
                    star <=
                    (selectedRating ?? Math.round(ratingSummary.averageRating))
                      ? "fill-[#72383D] text-[#72383D]"
                      : "text-[#D8D0C8]"
                  }
                />
              </button>
            ))}
          </div>
          <p
            className="mt-2 text-xs text-[#6B625C]"
            aria-live="polite"
          >
            {selectedRating === null
              ? `Based on ${ratingSummary.reviewCount} reviews`
              : `Your selected rating: ${selectedRating} out of 5`}
          </p>
          {selectedRating !== null && (
            <button
              type="button"
              onClick={() => void submitRating()}
              disabled={isSubmitting || hasSubmittedReview}
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-[#72383D] px-5 py-2 text-xs font-semibold uppercase tracking-[1px] text-white transition hover:bg-[#5E2B30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#72383D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Submitting..."
                : hasSubmittedReview
                  ? "Rating Submitted"
                  : "Submit Rating"}
            </button>
          )}
          {submitMessage && (
            <p
              role="status"
              className="mt-3 text-sm text-[#6B625C]"
            >
              {submitMessage}
            </p>
          )}
        </div>

        <div
          className="w-full space-y-3"
          aria-label="Ratings breakdown"
        >
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingSummary.distribution[star];
            const percentage = ratingSummary.reviewCount
              ? (count / ratingSummary.reviewCount) * 100
              : 0;

            return (
              <div
                key={star}
                className="flex items-center gap-3 text-sm text-[#6B625C]"
              >
                <span className="w-3 text-right">{star}</span>
                <Star
                  size={14}
                  className="shrink-0 fill-[#AC9C8D] text-[#AC9C8D]"
                  aria-hidden="true"
                />
                <div
                  className="h-2 flex-1 overflow-hidden rounded-full bg-[#E9E4DE]"
                  role="img"
                  aria-label={`${star} stars: ${count} reviews`}
                >
                  <div
                    className="h-full rounded-full bg-[#72383D]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right">{count}</span>
              </div>
            );
          })}
          {loadError && (
            <p role="alert" className="text-sm text-[#72383D]">
              {loadError}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
