
"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  const colorName =
    typeof item.color === "object"
      ? item.color?.name || ""
      : item.color || "";

  const quantity = Number(item.quantity || 0);
  const price = Number(item.price || 0);
  const total = price * quantity;

  return (
    <article className="group relative border-b border-[#E4DDD6] py-6 sm:py-7">
      <div className="flex gap-4 sm:gap-6">
        {/* Product Image */}
        <div className="relative h-32 w-24 shrink-0 overflow-hidden bg-[#F4F0EB] sm:h-36 sm:w-28 md:h-40 md:w-32">
          <Image
            src={item.image}
            alt={item.name || "Product"}
            fill
            sizes="(max-width: 640px) 96px, 128px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          {/* Subtle image overlay */}
          <div className="pointer-events-none absolute inset-0 border border-black/5" />
        </div>

        {/* Product Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="pr-8">
            {/* Product Name */}
            <h3 className="font-serif text-[17px] leading-6 text-[#322D29] sm:text-lg">
              {item.name}
            </h3>

            {/* Product Options */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] tracking-wide text-[#766D66]">
              {colorName && (
                <span>
                  <span className="text-[#A0968E]">Color</span>{" "}
                  {colorName}
                </span>
              )}

              {item.size && (
                <span>
                  <span className="text-[#A0968E]">Size</span>{" "}
                  {item.size}
                </span>
              )}
            </div>

            {/* Unit Price */}
            <p className="mt-3 text-xs text-[#766D66]">
              Rs. {price.toLocaleString()} each
            </p>
          </div>

          {/* Bottom Controls */}
          <div className="mt-5 flex items-end justify-between gap-3">
            {/* Quantity */}
            <div>
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[1.5px] text-[#9A9088]">
                Quantity
              </p>

              <div className="flex h-9 items-center border border-[#D8D0C8] bg-[#FAF8F5]">
                <button
                  type="button"
                  onClick={() => onDecrease(item)}
                  disabled={quantity <= 1}
                  className="flex h-9 w-8 items-center justify-center text-[#322D29] transition hover:bg-[#EFE9E1] hover:text-[#72383D] disabled:cursor-not-allowed disabled:opacity-25"
                  aria-label={`Decrease quantity of ${
                    item.name || "item"
                  }`}
                >
                  <Minus size={13} strokeWidth={1.7} />
                </button>

                <span className="flex h-9 min-w-9 items-center justify-center border-x border-[#D8D0C8] px-2 text-xs font-medium text-[#322D29]">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => onIncrease(item)}
                  disabled={quantity >= Number(item.stock || 0)}
                  className="flex h-9 w-8 items-center justify-center text-[#322D29] transition hover:bg-[#EFE9E1] hover:text-[#72383D] disabled:cursor-not-allowed disabled:opacity-25"
                  aria-label={`Increase quantity of ${
                    item.name || "item"
                  }`}
                >
                  <Plus size={13} strokeWidth={1.7} />
                </button>
              </div>
            </div>

            {/* Total + Remove */}
            <div className="flex items-end gap-4">
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#9A9088]">
                  Total
                </p>

                <p className="mt-1 font-medium text-[#72383D] sm:text-[15px]">
                  Rs. {total.toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    `Remove ${item.name || "this item"} from your cart?`
                  );

                  if (confirmed) {
                    onRemove(item);
                  }
                }}
                className="flex h-8 w-8 items-center justify-center text-[#9A9088] transition hover:bg-[#F8EEEE] hover:text-[#B23A3A]"
                aria-label={`Remove ${
                  item.name || "item"
                } from cart`}
                title="Remove item"
              >
                <Trash2 size={15} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stock information */}
      {Number(item.stock || 0) > 0 &&
        quantity >= Number(item.stock || 0) && (
          <p className="mt-3 text-[10px] font-medium uppercase tracking-[1px] text-[#B06B45]">
            Maximum available quantity reached
          </p>
        )}
    </article>
  );
}

