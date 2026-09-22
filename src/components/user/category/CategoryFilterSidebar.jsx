"use client";

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
  const sizes = ["XS", "S", "M", "L", "XL"];

  const toggleSize = (size) => {
    setSelectedSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size]
    );
  };

  return (
    <aside className="hidden w-57.5 shrink-0 lg:block">
      <div className="sticky top-24 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-lg text-[#322D29]">Filters</h2>

          <button
            type="button"
            onClick={onClear}
            className="text-xs text-[#72383D] hover:underline"
          >
            Clear
          </button>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]">
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
                    className="h-4 w-4 accent-[#72383D]"
                  />
                  {subcategory}
                </label>
              ))}
            </div>
          </div>

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

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]">
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
                      ? "border-[#72383D] bg-[#72383D] text-white"
                      : "border-[#D8D0C8] bg-white text-[#5D554F] hover:border-[#72383D]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]">
              Availability
            </h3>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]">
                <input
                  type="radio"
                  name="availability"
                  checked={selectedAvailability === "all"}
                  onChange={() => setSelectedAvailability("all")}
                  className="h-4 w-4 accent-[#72383D]"
                />
                All Products
              </label>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]">
                <input
                  type="radio"
                  name="availability"
                  checked={selectedAvailability === "available"}
                  onChange={() => setSelectedAvailability("available")}
                  className="h-4 w-4 accent-[#72383D]"
                />
                In Stock
              </label>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]">
                <input
                  type="radio"
                  name="availability"
                  checked={selectedAvailability === "soldout"}
                  onChange={() => setSelectedAvailability("soldout")}
                  className="h-4 w-4 accent-[#72383D]"
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