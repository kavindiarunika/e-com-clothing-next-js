"use client";

import CategoryFilter from "./CategoryFilter";

export default function FilterSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedPrice,
  setSelectedPrice,
  selectedSizes,
  setSelectedSizes,
  selectedColors,
  setSelectedColors,
  selectedAvailability,
  setSelectedAvailability,
}) {
  const sizes = ["XS", "S", "M", "L", "XL"];

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

      {/* Size */}
      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#292524]">
          Size
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
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
      </div>

      {/* Availability */}
      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#292524]">
          Availability
        </h3>

        <div className="space-y-3">

          {/* All */}
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

          {/* In Stock */}
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

          {/* Sold Out */}
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

    </aside>
  );
}