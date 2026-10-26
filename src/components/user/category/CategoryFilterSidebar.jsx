"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CategoryFilterSidebar({
  subcategories = [],
  selectedSubcategory,
  setSelectedSubcategory,
  selectedPrice,
  setSelectedPrice,
  selectedSizes,
  setSelectedSizes,
  selectedAvailability,
  setSelectedAvailability,
  onClear,
  showHeader = true,
}) {
  const [sizes, setSizes] = useState([]);
  const [isLoadingSizes, setIsLoadingSizes] = useState(true);
  const [sizesError, setSizesError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadSizes() {
      try {
        const response = await fetch("/api/user/sizes", {
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load sizes.");
        }

        setSizes(
          (Array.isArray(result.sizes) ? result.sizes : [])
            .map((size) => size.name)
            .filter(Boolean)
        );
        setSizesError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Category size options error:", error);
          setSizesError("Sizes could not be loaded.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSizes(false);
        }
      }
    }

    void loadSizes();

    return () => controller.abort();
  }, []);

  const toggleSize = (size) => {
    setSelectedSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size]
    );
  };

  const sectionClass = "group border-b border-[#E7DEDC]";
  const summaryClass =
    "flex min-h-[67px] cursor-pointer list-none items-center justify-between text-sm font-semibold uppercase tracking-wide text-[#292524] [&::-webkit-details-marker]:hidden";
  const contentClass = "pb-5 pt-1";
  const optionClass =
    "flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]";

  return (
    <aside>
      {showHeader && (
        <div className="mb-5 flex items-center justify-between border-b border-[#E5E5E5] pb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#292524]">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-[#e63e62] hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      <details className={sectionClass}>
        <summary className={summaryClass}>
          Availability
          <ChevronDown
            size={16}
            className="transition-transform group-open:rotate-180"
          />
        </summary>
        <div className={contentClass}>
          <div className="space-y-3">
            {[
              ["all", "All Products"],
              ["available", "In Stock"],
              ["soldout", "Sold Out"],
            ].map(([value, label]) => (
              <label key={value} className={optionClass}>
                <input
                  type="radio"
                  name="category-availability"
                  checked={selectedAvailability === value}
                  onChange={() => setSelectedAvailability(value)}
                  className="h-4 w-4 accent-[#e63e62]"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </details>

      <details className={sectionClass}>
        <summary className={summaryClass}>
          Price
          <ChevronDown
            size={16}
            className="transition-transform group-open:rotate-180"
          />
        </summary>
        <div className={contentClass}>
          <div className="space-y-3">
            {[
              ["under5000", "Under Rs. 5,000"],
              ["5000-10000", "Rs. 5,000 - 10,000"],
              ["above10000", "Above Rs. 10,000"],
            ].map(([value, label]) => (
              <label key={value} className={optionClass}>
                <input
                  type="radio"
                  name="category-price"
                  checked={selectedPrice === value}
                  onChange={() => setSelectedPrice(value)}
                  className="h-4 w-4 accent-[#e63e62]"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </details>

      <details className={sectionClass}>
        <summary className={summaryClass}>
          Size
          <ChevronDown
            size={16}
            className="transition-transform group-open:rotate-180"
          />
        </summary>
        <div className={contentClass}>
          {isLoadingSizes ? (
            <p className="text-sm text-[#6B625C]">Loading sizes...</p>
          ) : sizesError ? (
            <p role="alert" className="text-sm text-[#e63e62]">
              {sizesError}
            </p>
          ) : sizes.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={selectedSizes.includes(size)}
                  onClick={() => toggleSize(size)}
                  className={`border px-3 py-2 text-xs transition ${
                    selectedSizes.includes(size)
                      ? "border-[#e63e62] bg-[#e63e62] text-white"
                      : "border-[#E7DEDC] bg-white text-[#5D554F] hover:border-[#e63e62]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B625C]">No sizes available.</p>
          )}
        </div>
      </details>

      <details className={sectionClass}>
        <summary className={summaryClass}>
          Category
          <ChevronDown
            size={16}
            className="transition-transform group-open:rotate-180"
          />
        </summary>
        <div className={contentClass}>
          <div className="space-y-3">
            {subcategories.map((subcategory) => (
              <label key={subcategory} className={optionClass}>
                <input
                  type="radio"
                  name="category-subcategory"
                  checked={selectedSubcategory === subcategory}
                  onChange={() => setSelectedSubcategory(subcategory)}
                  className="h-4 w-4 accent-[#e63e62]"
                />
                {subcategory}
              </label>
            ))}
          </div>
        </div>
      </details>
    </aside>
  );
}
