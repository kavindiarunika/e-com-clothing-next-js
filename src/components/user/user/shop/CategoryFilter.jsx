"use client";

export default function CategoryFilter({
  selectedCategory,
  setSelectedCategory,
}) {
  const categories = ["All", "Men", "Women", "Kids"];

  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]">
        Category
      </h3>

      <div className="space-y-3">
        {categories.map((category) => (
          <label
            key={category}
            className="flex cursor-pointer items-center gap-3 text-sm text-[#5D554F]"
          >
            <input
              type="radio"
              name="category"
              value={category}
              checked={selectedCategory === category}
              onChange={() => setSelectedCategory(category)}
              className="h-4 w-4 accent-[#72383D]"
            />

            {category}
          </label>
        ))}
      </div>
    </div>
  );
}