"use client";

export default function ColorSelector({
  colors = [],
  selectedColor,
  setSelectedColor,
}) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#292524]">
          Color
        </h3>

        {selectedColor && (
          <p className="mt-1 text-xs text-[#6B625C]">
            Selected:{" "}
            <span className="font-medium text-[#292524]">
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
            color.hex_code?.trim() || "#E7DEDC";

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
                    ? "ring-2 ring-[#e63e62] ring-offset-2"
                    : "hover:ring-2 hover:ring-[#e63e62] hover:ring-offset-2"
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