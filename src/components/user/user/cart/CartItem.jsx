"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  // Safely get color name
  const colorName =
    typeof item.color === "object"
      ? item.color?.name || ""
      : item.color || "";

  return (
    <div className="flex gap-4 border-b border-[#D8D0C8] py-6">
      {/* Image */}
      <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-white sm:h-32 sm:w-28">
        <Image
          src={item.image}
          alt={item.name || "Product"}
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          {/* Product Name */}
          <h3 className="font-serif text-lg text-[#322D29]">
            {item.name}
          </h3>

          {/* Color */}
          <p className="mt-1 text-xs text-[#6B625C]">
            Color: {colorName}
          </p>

          {/* Size */}
          <p className="mt-1 text-xs text-[#6B625C]">
            Size: {item.size}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {/* Quantity */}
          <div className="flex items-center border border-[#D8D0C8] bg-white">
            <button
              type="button"
              onClick={() => onDecrease(item)}
              disabled={item.quantity <= 1}
              className="flex h-9 w-9 items-center justify-center text-[#322D29] transition hover:text-[#72383D] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus size={14} />
            </button>

            <span className="flex h-9 w-10 items-center justify-center text-xs">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => onIncrease(item)}
              disabled={item.quantity >= item.stock}
              className="flex h-9 w-9 items-center justify-center text-[#322D29] transition hover:text-[#72383D] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Price */}
          <p className="text-sm font-semibold text-[#72383D]">
            Rs.{" "}
            {(
              Number(item.price || 0) *
              Number(item.quantity || 0)
            ).toLocaleString()}
          </p>

          {/* Remove */}
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="text-[#6B625C] transition hover:text-[#72383D]"
            aria-label={`Remove ${item.name || "item"} from cart`}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}