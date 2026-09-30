"use client";

export default function ColorSelector({
  colors = [],
  selectedColor,
  setSelectedColor,
}) {
  return (
    <div>
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

      <div className="flex flex-wrap gap-4">
        {colors.map((color) => {
          const colorId = color.color_id;
          const colorName = color.name;

          const hexCode =
            color.hex_code?.trim() || "#D8D0C8";

          const isSelected =
            selectedColor?.color_id === colorId;

          return (
            <button
              key={colorId}
              type="button"
              onClick={() => setSelectedColor(color)}
              title={colorName}
              className={`
                relative
                h-10
                w-10
                rounded-full
                transition-all
                duration-200
                ${
                  isSelected
                    ? "ring-2 ring-[#72383D] ring-offset-2"
                    : "hover:ring-2 hover:ring-[#AC9C8D] hover:ring-offset-2"
                }
              `}
            >
              <span
                className="block h-10 w-10 rounded-full border border-black/10 shadow-sm"
                style={{
                  backgroundColor: hexCode,
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}