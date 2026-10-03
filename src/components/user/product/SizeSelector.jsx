"use client";

import { useState } from "react";
import SizeChart from "./SizeChart";

export default function SizeSelector({
  sizes = [],
  selectedSize,
  setSelectedSize,
  category,
  variants = [],
  selectedColor,
  productQty = 0,
  defaultSize = "",
}) {
  const [isSizeChartOpen, setIsSizeChartOpen] =
    useState(false);

  // =========================
  // Check Size Stock
  // =========================
  const normalizeText = (value) =>
    String(value ?? "").trim().toLowerCase();
  const totalVariantStock = variants.reduce(
    (total, variant) => total + (Number(variant.stock) || 0),
    0
  );
  const useProductStock =
    totalVariantStock <= 0 && Number(productQty) > 0;

  const getSizeStock = (size) => {
    const isDefaultSize =
      normalizeText(size) === normalizeText(defaultSize);

    if (useProductStock) return Number(productQty) || 0;

    if (!selectedColor) {
      const totalForSize = variants
        .filter((variant) =>
          normalizeText(variant.size) === normalizeText(size)
        )
        .reduce(
          (total, variant) =>
            total + Number(variant.stock || 0),
          0
        );

      return totalForSize;
    }

    const colorName =
      typeof selectedColor === "object"
        ? selectedColor.name
        : selectedColor;

    const exactVariant = variants.find(
      (item) =>
        normalizeText(item.size) === normalizeText(size) &&
        selectedColor?.color_id != null &&
        item.color_id != null &&
        String(item.color_id) === String(selectedColor.color_id)
    ) || variants.find(
      (item) =>
        normalizeText(item.size) === normalizeText(size) &&
        normalizeText(item.color) === normalizeText(colorName)
    ) || variants.find(
      (item) =>
        normalizeText(item.size) === normalizeText(size) &&
        item.color_id == null &&
        !normalizeText(item.color)
    );

    if (exactVariant) {
      return Number(exactVariant.stock || 0);
    }

    if (isDefaultSize) return Number(productQty) || 0;

    return 0;
  };

  const selectedStock = selectedSize ? getSizeStock(selectedSize) : 0;

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
            const sizeStock = getSizeStock(size);
            const isOutOfStock = sizeStock <= 0;
            const isSelected = selectedSize === size;

            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                disabled={isOutOfStock}
                aria-pressed={isSelected}
                aria-label={`${size}${isOutOfStock ? ", unavailable" : ""}`}
                className={`relative flex h-11 min-w-11 flex-col items-center justify-center border px-3 text-sm font-medium transition ${
                  isSelected
                    ? "border-[#72383D] bg-[#72383D] text-white"
                    : "border-[#D8D0C8] bg-white text-[#322D29] hover:border-[#72383D]"
                } disabled:cursor-not-allowed disabled:border-[#E4DED7] disabled:bg-[#F3F0EC] disabled:text-[#B7AFA7] disabled:before:absolute disabled:before:inset-x-1 disabled:before:top-1/2 disabled:before:h-px disabled:before:rotate-[-35deg] disabled:before:bg-[#B7AFA7]`}
              >
                <span>{String(size).toUpperCase()}</span>
                <span className="text-[10px] font-medium leading-none opacity-80">
                  {sizeStock > 0 ? sizeStock : "Sold out"}
                </span>
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

        {selectedSize && (
          <p className="mt-2 text-xs text-[#6B625C]">
            <span className="font-medium text-[#322D29]">
              {selectedSize.toUpperCase()}
            </span>{" "}
            has {selectedStock} item{selectedStock === 1 ? "" : "s"} available
          </p>
        )}
      </div>

      {/* Size Chart */}
      <SizeChart
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={category}
      />
    </>
  );
}