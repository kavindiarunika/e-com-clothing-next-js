"use client";

import { useEffect, useState } from "react";

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

  return (
    <aside className="hidden w-57.5 shrink-0 lg:block">
      <div className="sticky top-28 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-lg text-[#292524]">Filters</h2>

          <button
            type="button"
            onClick={onClear}
            className="text-xs text-[#e63e62] hover:underline"
          >
            Clear
          </button>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#292524]">
              Category
            </h3>

            <div className="space-y-3">
              {subcategories.map((subcategory) => (
                <label
                  key={subcategory}
                  className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]"
                >
                  <input
                    type="radio"
                    name="subcategory"
                    checked={selectedSubcategory === subcategory}
                    onChange={() => setSelectedSubcategory(subcategory)}
                    className="h-4 w-4 accent-[#e63e62]"
                  />
                  {subcategory}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#292524]">
              Price
            </h3>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPrice === "under5000"}
                  onChange={() => setSelectedPrice("under5000")}
                  className="h-4 w-4 accent-[#e63e62]"
                />
                Under Rs. 5,000
              </label>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPrice === "5000-10000"}
                  onChange={() => setSelectedPrice("5000-10000")}
                  className="h-4 w-4 accent-[#e63e62]"
                />
                Rs. 5,000 - 10,000
              </label>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPrice === "above10000"}
                  onChange={() => setSelectedPrice("above10000")}
                  className="h-4 w-4 accent-[#e63e62]"
                />
                Above Rs. 10,000
              </label>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#292524]">
              Size
            </h3>

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

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#292524]">
              Availability
            </h3>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]">
                <input
                  type="radio"
                  name="availability"
                  checked={selectedAvailability === "all"}
                  onChange={() => setSelectedAvailability("all")}
                  className="h-4 w-4 accent-[#e63e62]"
                />
                All Products
              </label>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]">
                <input
                  type="radio"
                  name="availability"
                  checked={selectedAvailability === "available"}
                  onChange={() => setSelectedAvailability("available")}
                  className="h-4 w-4 accent-[#e63e62]"
                />
                In Stock
              </label>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]">
                <input
                  type="radio"
                  name="availability"
                  checked={selectedAvailability === "soldout"}
                  onChange={() => setSelectedAvailability("soldout")}
                  className="h-4 w-4 accent-[#e63e62]"
                />
                Sold Out
              </label>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}