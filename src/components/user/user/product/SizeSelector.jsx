export default function SizeSelector({
  sizes = [],
  selectedSize,
  setSelectedSize,
  variants = [],
  selectedColor,
}) {
  // =========================
  // Check Size Stock
  // =========================
  const getSizeStock = (size) => {
    // If no color is selected yet,
    // check whether this size has any stock
    if (!selectedColor) {
      return variants
        .filter((variant) => variant.size === size)
        .reduce(
          (total, variant) =>
            total + Number(variant.stock || 0),
          0
        );
    }

    const colorName =
      typeof selectedColor === "object"
        ? selectedColor.name
        : selectedColor;

    const variant = variants.find(
      (item) =>
        item.size === size &&
        item.color === colorName
    );

    return Number(variant?.stock || 0);
  };

  return (
    <>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#292524]">
            Size
          </h3>
        </div>

        <select
          aria-label="Select size"
          value={selectedSize || ""}
          onChange={(event) => setSelectedSize(event.target.value)}
          className="w-full max-w-xs border border-[#E7DEDC] bg-white px-4 py-3 text-sm text-[#292524] outline-none transition focus:border-[#e63e62]"
        >
          <option value="" disabled>
            Select size
          </option>
          {sizes.map((size) => {
            const isOutOfStock = getSizeStock(size) <= 0;

            return (
              <option key={size} value={size} disabled={isOutOfStock}>
                {size}{isOutOfStock ? " (Unavailable)" : ""}
              </option>
            );
          })}
        </select>

        {selectedColor && (
          <p className="mt-3 text-xs text-[#6B625C]">
            Available stock shown for{" "}
            <span className="font-medium text-[#292524]">
              {typeof selectedColor === "object"
                ? selectedColor.name
                : selectedColor}
            </span>
          </p>
        )}
      </div>
    </>
  );
}