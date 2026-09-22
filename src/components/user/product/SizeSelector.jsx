"use client";

import { useState } from "react";
import SizeChart from "./SizeChart";

export default function SizeSelector({
  sizes = [],
  selectedSize,
  setSelectedSize,
  category,
  sizeGuide,
  variants = [],
  selectedColor,
}) {
  const [isSizeChartOpen, setIsSizeChartOpen] =
    useState(false);

  // =========================
  // Check Size Stock
  // =========================
  const getSizeStock = (size) => {
    // If no color is selected yet,
    // check whether this size has any stock
    if (!selectedColor) {
      return variants
        .filter((variant) => variant.size === size)
        .reduce(
          (total, variant) =>
            total + Number(variant.stock || 0),
          0
        );
    }

    const colorName =
      typeof selectedColor === "object"
        ? selectedColor.name
        : selectedColor;

    const variant = variants.find(
      (item) =>
        item.size === size &&
        item.color === colorName
    );

    return Number(variant?.stock || 0);
  };

  return (
    <>
      <div>
        {/* Title */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]">
            Size
          </h3>

          <button
            type="button"
            onClick={() => setIsSizeChartOpen(true)}
            className="text-xs text-[#72383D] underline underline-offset-2 transition hover:text-[#322D29]"
          >
            Size Guide
          </button>
        </div>

        {/* Sizes */}
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const stock = getSizeStock(size);
            const isOutOfStock = stock <= 0;

            return (
              <button
                key={size}
                type="button"
                disabled={isOutOfStock}
                onClick={() => setSelectedSize(size)}
                className={`relative min-w-[52px] border px-4 py-3 text-xs transition ${
                  isOutOfStock
                    ? "cursor-not-allowed border-[#E5E0DC] bg-[#F5F2EF] text-[#AAA19A]"
                    : selectedSize === size
                    ? "border-[#72383D] bg-[#72383D] text-white"
                    : "border-[#D8D0C8] bg-white text-[#322D29] hover:border-[#72383D]"
                }`}
              >
                {size}

                {/* Diagonal line for unavailable */}
                {isOutOfStock && (
                  <span className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[55px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#72383D]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Color Info */}
        {selectedColor && (
          <p className="mt-3 text-xs text-[#6B625C]">
            Available stock shown for{" "}
            <span className="font-medium text-[#322D29]">
              {typeof selectedColor === "object"
                ? selectedColor.name
                : selectedColor}
            </span>
          </p>
        )}
      </div>

      {/* Size Chart */}
      <SizeChart
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={category}
        sizeGuide={sizeGuide}
      />
    </>
  );
}