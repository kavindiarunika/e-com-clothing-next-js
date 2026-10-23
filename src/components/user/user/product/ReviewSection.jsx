
"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

export default function ReviewSection({ product }) {
  const reviewKey = `velora-reviews-${product.id}`;

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  // Load customer reviews
  useEffect(() => {
    const savedReviews =
      JSON.parse(localStorage.getItem(reviewKey)) || [];

    setReviews(savedReviews);
  }, [reviewKey]);

  // Calculate overall rating
  const averageRating = useMemo(() => {
    const existingRating = Number(product.rating) || 0;
    const existingReviewCount = Number(product.reviews) || 0;

    const customerRatingTotal = reviews.reduce(
      (sum, review) => sum + Number(review.rating),
      0
    );

    const totalReviewCount =
      existingReviewCount + reviews.length;

    if (totalReviewCount === 0) {
      return 0;
    }

    const totalRating =
      existingRating * existingReviewCount +
      customerRatingTotal;

    return (totalRating / totalReviewCount).toFixed(1);
  }, [product.rating, product.reviews, reviews]);

  // Total number of reviews
  const totalReviews =
    Number(product.reviews || 0) + reviews.length;

  // Submit review
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !comment.trim()) {
      alert("Please enter your name and review.");
      return;
    }

    const newReview = {
      id: Date.now(),
      name: name.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      date: new Date().toLocaleDateString(),
    };

    const updatedReviews = [
      newReview,
      ...reviews,
    ];

    localStorage.setItem(
      reviewKey,
      JSON.stringify(updatedReviews)
    );

    setReviews(updatedReviews);

    // Reset form
    setName("");
    setComment("");
    setRating(5);

    alert("Thank you! Your review has been added.");
  };

  return (
    <section className="border-t border-[#E7DEDC] pt-14 md:pt-20">

      {/* ================= HEADER ================= */}
      <div className="mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[3px] text-[#C08081]">
          Customer Feedback
        </p>

        <h2 className="font-serif text-3xl text-[#292524] md:text-4xl">
          Reviews & Ratings
        </h2>

        <div className="mt-5 h-px w-12 bg-[#C08081]" />
      </div>

      {/* ================= RATING SUMMARY ================= */}
      <div className="border border-[#E7DEDC] bg-white p-6 md:p-8">

        <div className="flex flex-col items-center text-center">

          {/* Average Rating */}
          <span className="font-serif text-5xl text-[#292524]">
            {averageRating}
          </span>

          {/* Stars */}
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                className={
                  star <=
                  Math.round(Number(averageRating))
                    ? "fill-[#C08081] text-[#C08081]"
                    : "text-[#E7DEDC]"
                }
              />
            ))}
          </div>

          {/* Review Count */}
          <p className="mt-3 text-xs text-[#6B625C]">
            Based on {totalReviews} reviews
          </p>

        </div>
      </div>
       {/* ================= WRITE REVIEW ================= */}
      <div className="mt-12 border border-[#E7DEDC] bg-white p-6 md:p-8">

        <div className="mb-6">

          <p className="text-xs font-semibold uppercase tracking-[2px] text-[#C08081]">
            Share Your Experience
          </p>

          <h3 className="mt-2 font-serif text-2xl text-[#292524]">
            Write a Review
          </h3>

          <p className="mt-2 text-sm text-[#6B625C]">
            Tell other customers what you think about this product.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* NAME */}
          <div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#292524]">
              Your Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter your name"
              className="w-full border border-[#E7DEDC] bg-[#FAF6F5] px-4 py-3 text-sm text-[#292524] outline-none transition focus:border-[#C08081]"
            />

          </div>

          {/* RATING */}
          <div>

            <label className="mb-3 block text-xs font-semibold uppercase tracking-[1px] text-[#292524]">
              Your Rating
            </label>

            <div className="flex gap-2">

              {[1, 2, 3, 4, 5].map((star) => (

                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} stars`}
                >

                  <Star
                    size={23}
                    className={
                      star <= rating
                        ? "fill-[#C08081] text-[#C08081]"
                        : "text-[#E7DEDC]"
                    }
                  />

                </button>

              ))}

            </div>

            <p className="mt-2 text-xs text-[#6B625C]">
              {rating} out of 5
            </p>

          </div>

          {/* COMMENT */}
          <div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#292524]">
              Your Review
            </label>

            <textarea
              rows={5}
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              placeholder="Share your experience with this product..."
              className="w-full resize-none border border-[#E7DEDC] bg-[#FAF6F5] px-4 py-3 text-sm text-[#292524] outline-none transition focus:border-[#C08081]"
            />

          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="bg-[#C08081] px-8 py-4 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#A96870]"
          >
            Submit Review
          </button>

        </form>
      </div>

      {/* ================= CUSTOMER REVIEWS ================= */}
      <div className="mt-10">

        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-serif text-2xl text-[#292524]">
            Customer Reviews
          </h3>

          <span className="text-xs text-[#6B625C]">
            {totalReviews} reviews
          </span>
        </div>

        {reviews.length === 0 ? (

          <div className="border border-[#E7DEDC] bg-white p-8 text-center">

            <p className="text-sm text-[#6B625C]">
              No customer reviews yet.
            </p>

            <p className="mt-2 text-xs text-[#C08081]">
              Be the first to share your experience.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {reviews.map((review) => (

              <div
                key={review.id}
                className="border border-[#E7DEDC] bg-white p-6"
              >

                {/* Review Header */}
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                  <div>

                    <p className="text-sm font-medium text-[#292524]">
                      {review.name}
                    </p>

                    {/* Review Stars */}
                    <div className="mt-2 flex gap-1">

                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= review.rating
                              ? "fill-[#C08081] text-[#C08081]"
                              : "text-[#E7DEDC]"
                          }
                        />
                      ))}

                    </div>

                  </div>

                  <span className="text-xs text-[#C08081]">
                    {review.date}
                  </span>

                </div>

                {/* Review Text */}
                <p className="mt-4 text-sm leading-7 text-[#6B625C]">
                  {review.comment}
                </p>

              </div>

            ))}

          </div>

        )}
      </div>

     

    </section>
  );
}

