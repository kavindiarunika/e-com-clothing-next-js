
"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export default function ProductRating({
  productId,
  defaultRating = 0,
  defaultReviews = 0,
}) {
  const [rating, setRating] = useState(defaultRating);
  const [reviews, setReviews] = useState(defaultReviews);

  useEffect(() => {
    if (!productId) return;

    const reviewKey = `velora-reviews-${productId}`;

    const savedReviews =
      JSON.parse(localStorage.getItem(reviewKey)) || [];

    if (savedReviews.length > 0) {
      const totalRating = savedReviews.reduce(
        (sum, review) => sum + Number(review.rating),
        0
      );

      const averageRating =
        totalRating / savedReviews.length;

      setRating(Number(averageRating.toFixed(1)));
      setReviews(savedReviews.length);
    } else {
      setRating(defaultRating);
      setReviews(defaultReviews);
    }
  }, [productId, defaultRating, defaultReviews]);

  return (
    <div className="flex items-center gap-3">

      {/* Stars */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={15}
            fill={
              star <= Math.round(rating)
                ? "#72383D"
                : "none"
            }
            className={
              star <= Math.round(rating)
                ? "text-[#72383D]"
                : "text-[#AC9C8D]"
            }
          />
        ))}
      </div>

      {/* Rating */}
      <span className="text-xs text-[#6B625C]">
        {rating} ({reviews} reviews)
      </span>

    </div>
  );
}

