"use client";

const colorClasses = {
  Black: "bg-black",
  White: "bg-white border border-[#D8D0C8]",
  Brown: "bg-[#432415]",
  Beige: "bg-[#E3DCD1]",
  Blue: "bg-blue-700",
  Pink: "bg-pink-300",
  Red: "bg-red-600",
  Green: "bg-green-600",
  Yellow: "bg-yellow-400",
  Orange: "bg-orange-500",
  Purple: "bg-purple-600",
  Grey: "bg-gray-500",
  Gray: "bg-gray-500",
  Navy: "bg-[#14213D]",
};

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

        {selectedColor && (
          <p className="mt-1 text-xs text-[#6B625C]">
            Selected:{" "}
            <span className="font-medium text-[#322D29]">
              {selectedColor.name}
            </span>
          </p>
        )}
      </div>

      {/* Colors */}
      <div className="flex flex-wrap gap-4">
        {colors.map((color) => {
          const colorName = color.name;

          const stock = getColorStock(colorName);

          const isOutOfStock = stock <= 0;

          const isSelected =
            selectedColor?.name === colorName;

          return (
            <button
              key={colorName}
              type="button"
              disabled={isOutOfStock}
              onClick={() => {
                if (!isOutOfStock) {
                  setSelectedColor(color);
                }
              }}
              aria-label={
                isOutOfStock
                  ? `${colorName} unavailable`
                  : `Select ${colorName}`
              }
              aria-pressed={isSelected}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${
                isOutOfStock
                  ? "cursor-not-allowed opacity-50"
                  : isSelected
                  ? "ring-2 ring-[#72383D] ring-offset-2"
                  : "hover:ring-1 hover:ring-[#AC9C8D] hover:ring-offset-2"
              }`}
            >
              {/* Color Circle */}
              <span
                className={`h-9 w-9 rounded-full ${
                  colorClasses[colorName] ||
                  "bg-gray-400"
                }`}
                title={colorName}
              />

              {/* Diagonal unavailable line */}
              {isOutOfStock && (
                <span className="pointer-events-none absolute left-1/2 top-1/2 h-px w-9 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#72383D]" />
              )}
            </button>
          );
        })}
      </div>

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