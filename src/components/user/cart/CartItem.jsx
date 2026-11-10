"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartItem({
  item,
  isSelected,
  onToggleSelect,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  const fallbackImage = "/images/products/shirt1.webp";

  // Safely get color name
  const colorName =
    typeof item.color === "object"
      ? item.color?.name || ""
      : item.color || "";

  const handleRemove = () => {
    const confirmed = window.confirm(
      `Remove ${item.name || "this item"} from your cart?`
    );

    if (confirmed) {
      onRemove(item);
    }
  };

  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)] items-start gap-x-3 gap-y-3 border-b border-[#E5E5E5] py-4 sm:grid-cols-[24px_minmax(0,1fr)_110px_160px] sm:items-center sm:gap-4 sm:py-5 lg:py-6">
      <div className="row-span-2 flex items-start justify-center pt-2 sm:row-span-1 sm:pt-0">
        <input
          type="checkbox"
          checked={Boolean(isSelected)}
          onChange={() => onToggleSelect(item)}
          className="h-4 w-4 accent-[var(--color-primary)]"
          aria-label={`Select ${item.name || "item"}`}
        />
      </div>

      <div className="flex min-w-0 gap-3 sm:gap-4">
        {/* Image */}
        <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-white sm:h-32 sm:w-28">
          <Image
            src={item.image || fallbackImage}
            alt={item.name || "Product"}
            fill
            sizes="112px"
            className="object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackImage;
            }}
          />
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 break-words font-serif text-base leading-snug text-[#292524] sm:text-lg md:text-xl">
              {item.name}
            </h3>
            <button
              type="button"
              onClick={handleRemove}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#E7B8B8] bg-[#FFF4F4] text-[#C23939] transition hover:border-[#C23939] hover:bg-[#FDECEC] hover:text-[#A72828] sm:hidden"
              aria-label={`Remove ${item.name || "item"} from cart`}
            >
              <Trash2 size={15} />
            </button>
          </div>

          <p className="mt-1 break-words text-[11px] text-[#6B625C] md:text-xs">
            Color: {colorName}
          </p>

          <p className="mt-1 text-[11px] text-[#6B625C] md:text-xs">
            Size: {item.size}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:hidden">
            <div className="flex items-center border border-[#E5E5E5] bg-white">
              <button
                type="button"
                onClick={() => onDecrease(item)}
                disabled={Number(item.quantity) <= 1}
                aria-label={`Decrease quantity of ${item.name || "item"}`}
                className="flex h-9 w-9 items-center justify-center text-[#292524] transition hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus size={14} />
              </button>

              <span className="flex h-9 w-10 items-center justify-center text-xs">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={() => onIncrease(item)}
                disabled={
                  item.stock != null &&
                  Number(item.quantity) >= Number(item.stock)
                }
                aria-label={`Increase quantity of ${item.name || "item"}`}
                className="flex h-9 w-9 items-center justify-center text-[#292524] transition hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus size={14} />
              </button>
            </div>

            <p className="text-right text-sm font-semibold tabular-nums text-[var(--color-primary)] md:text-[15px]">
              Rs. {(
                Number(item.price || 0) *
                Number(item.quantity || 0)
              ).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="hidden justify-center sm:flex">
        <div className="flex items-center border border-[#E5E5E5] bg-white">
          <button
            type="button"
            onClick={() => onDecrease(item)}
            disabled={Number(item.quantity) <= 1}
            aria-label={`Decrease quantity of ${item.name || "item"}`}
            className="flex h-9 w-9 items-center justify-center text-[#292524] transition hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus size={14} />
          </button>

          <span className="flex h-9 w-10 items-center justify-center text-xs">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() => onIncrease(item)}
            disabled={
              item.stock != null &&
              Number(item.quantity) >= Number(item.stock)
            }
            aria-label={`Increase quantity of ${item.name || "item"}`}
            className="flex h-9 w-9 items-center justify-center text-[#292524] transition hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="hidden w-full justify-end sm:flex sm:w-auto">
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
          <p className="text-sm font-semibold text-[var(--color-primary)] md:text-[15px]">
            Rs. {(
              Number(item.price || 0) *
              Number(item.quantity || 0)
            ).toLocaleString()}
          </p>

          <button
            type="button"
            onClick={handleRemove}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E7B8B8] bg-[#FFF4F4] text-[#C23939] transition hover:border-[#C23939] hover:bg-[#FDECEC] hover:text-[#A72828]"
            aria-label={`Remove ${item.name || "item"} from cart`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}