"use client";

import { useEffect, useState } from "react";
import CategoryFilter from "./CategoryFilter";

export default function FilterSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedPrice,
  setSelectedPrice,
  selectedSizes = [],
  setSelectedSizes,
  selectedAvailability = "all",
  setSelectedAvailability,
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
          console.error("Shop size options error:", error);
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

  return (
    <aside className="space-y-8">

      {/* Category */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Price */}
      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]">
          Price
        </h3>

        <div className="space-y-3">

          <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]">
            <input
              type="radio"
              name="price"
              checked={selectedPrice === "under5000"}
              onChange={() => setSelectedPrice("under5000")}
              className="h-4 w-4 accent-[#72383D]"
            />
            Under Rs. 5,000
          </label>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]">
            <input
              type="radio"
              name="price"
              checked={selectedPrice === "5000-10000"}
              onChange={() => setSelectedPrice("5000-10000")}
              className="h-4 w-4 accent-[#72383D]"
            />
            Rs. 5,000 - 10,000
          </label>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]">
            <input
              type="radio"
              name="price"
              checked={selectedPrice === "above10000"}
              onChange={() => setSelectedPrice("above10000")}
              className="h-4 w-4 accent-[#72383D]"
            />
            Above Rs. 10,000
          </label>

        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]">
          Size
        </h3>

        {isLoadingSizes ? (
          <p className="text-sm text-[#6B625C]">Loading sizes...</p>
        ) : sizesError ? (
          <p role="alert" className="text-sm text-[#72383D]">
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
                    ? "border-[#72383D] bg-[#72383D] text-white"
                    : "border-[#D8D0C8] bg-white text-[#5D554F] hover:border-[#72383D]"
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

      {/* Availability */}
      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]">
          Availability
        </h3>

        <div className="space-y-3">
          {[
            ["all", "All Products"],
            ["available", "In Stock"],
            ["soldout", "Sold Out"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]"
            >
              <input
                type="radio"
                name="shop-availability"
                checked={selectedAvailability === value}
                onChange={() => setSelectedAvailability(value)}
                className="h-4 w-4 accent-[#72383D]"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

    </aside>
  );
}