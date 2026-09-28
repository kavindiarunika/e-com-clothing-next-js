"use client";

export default function ColorSelector({
  colors = [],
  selectedColor,
  setSelectedColor,
  variants = [],
  selectedSize,
}) {
  // Check whether a color has stock
  const getColorStock = (colorName) => {
    // If a size is selected,
    // check only that size + color combination
    if (selectedSize) {
      const variant = variants.find(
        (item) =>
          item.size === selectedSize &&
          item.color === colorName
      );

      return Number(variant?.stock || 0);
    }

    // If no size is selected,
    // check stock across all sizes for this color
    return variants
      .filter((item) => item.color === colorName)
      .reduce(
        (total, item) =>
          total + Number(item.stock || 0),
        0
      );
  };

  return (
    <div>
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]">
          Color
        </h3>
      </div>

      {/* Colors */}
      <select
        aria-label="Select color"
        value={selectedColor?.name || ""}
        onChange={(event) => {
          const color = colors.find(
            (item) => item.name === event.target.value
          );
          if (color) setSelectedColor(color);
        }}
        className="w-full max-w-xs border border-[#D8D0C8] bg-white px-4 py-3 text-sm text-[#322D29] outline-none transition focus:border-[#72383D]"
      >
        <option value="" disabled>
          Select color
        </option>
        {colors.map((color) => {
          const colorName = color.name;
          const isOutOfStock = getColorStock(colorName) <= 0;

          return (
            <option key={colorName} value={colorName} disabled={isOutOfStock}>
              {colorName}{isOutOfStock ? " (Unavailable)" : ""}
            </option>
          );
        })}
      </select>

      {/* Stock message */}
      {selectedSize && (
        <p className="mt-3 text-xs text-[#6B625C]">
          Available colors for size{" "}
          <span className="font-medium text-[#322D29]">
            {selectedSize}
          </span>
        </p>
      )}
    </div>
  );
}