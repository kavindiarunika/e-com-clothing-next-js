
"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export default function ProductRating({ productId }) {
  const [ratingSummary, setRatingSummary] = useState({
    rating: 0,
    reviews: 0,
  });
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadApprovedReviews() {
      try {
        const response = await fetch(
          `/api/user/reviews?item_id=${encodeURIComponent(productId)}`,
          { signal: controller.signal, cache: "no-store" }
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load product reviews.");
        }

        const summary = data.rating_summary || {};

        setRatingSummary({
          rating: Number(summary.average_rating) || 0,
          reviews: Number(summary.review_count) || 0,
        });
        setLoadError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Product rating error:", error);
          setLoadError("Rating unavailable");
        }
      }
    }

    void loadApprovedReviews();

    function handleRatingUpdated(event) {
      if (event.detail?.productId !== String(productId)) {
        return;
      }

      controller.abort();
      const summary = event.detail.ratingSummary;
      setRatingSummary({
        rating: Number(summary.average_rating) || 0,
        reviews: Number(summary.review_count) || 0,
      });
      setLoadError("");
    }

    window.addEventListener("product-rating-updated", handleRatingUpdated);
    return () => {
      controller.abort();
      window.removeEventListener("product-rating-updated", handleRatingUpdated);
    };
  }, [productId]);

  return (
    <div className="flex items-center gap-3">

      {/* Stars */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={15}
            fill={
              star <= Math.round(ratingSummary.rating)
                ? "#72383D"
                : "none"
            }
            className={
              star <= Math.round(ratingSummary.rating)
                ? "text-[#72383D]"
                : "text-[#AC9C8D]"
            }
          />
        ))}
      </div>

      {/* Rating */}
      <span className="text-xs text-[#6B625C]">
        {loadError || `${ratingSummary.rating} (${ratingSummary.reviews} reviews)`}
      </span>

    </div>
  );
}
