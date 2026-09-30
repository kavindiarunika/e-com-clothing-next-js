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
        <div role="group" aria-label="Select size" className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const isOutOfStock = getSizeStock(size) <= 0;
            const isSelected = selectedSize === size;

            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                disabled={isOutOfStock}
                aria-pressed={isSelected}
                aria-label={`${size}${isOutOfStock ? ", unavailable" : ""}`}
                className={`relative flex h-11 min-w-11 items-center justify-center border px-3 text-sm font-medium transition ${
                  isSelected
                    ? "border-[#72383D] bg-[#72383D] text-white"
                    : "border-[#D8D0C8] bg-white text-[#322D29] hover:border-[#72383D]"
                } disabled:cursor-not-allowed disabled:border-[#E4DED7] disabled:bg-[#F3F0EC] disabled:text-[#B7AFA7] disabled:before:absolute disabled:before:inset-x-1 disabled:before:top-1/2 disabled:before:h-px disabled:before:rotate-[-35deg] disabled:before:bg-[#B7AFA7]`}
              >
                {String(size).toUpperCase()}
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