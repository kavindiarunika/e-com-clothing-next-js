"use client";

import CategoryFilter from "./CategoryFilter";

export default function FilterSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedPrice,
  setSelectedPrice,
}) {
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

    </aside>
  );
}