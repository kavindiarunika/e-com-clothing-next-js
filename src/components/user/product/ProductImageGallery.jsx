"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductImageGallery({
  images,
  productName,
  selectedColor,
  selectedSize,
  selectedVariantImage,
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const fallbackImage = "/images/products/shirt1.webp";
  const priorityImage = selectedVariantImage || selectedColor?.image || null;
  const selectionContext = selectedSize
    ? `${selectedSize}-${selectedColor?.name || "color"}`
    : selectedColor?.name || "default";
  const displayImages = images?.length
    ? priorityImage
      ? [priorityImage, ...images.filter((image) => image !== priorityImage)]
      : images
    : [fallbackImage];

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">

      {/* Thumbnail Images */}
      <div className="flex gap-3 overflow-x-auto md:w-[90px] md:flex-col">
        {displayImages.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedImage(index)}
            className={`relative h-20 w-20 shrink-0 overflow-hidden border ${
              selectedImage === index
                ? "border-[#72383D]"
                : "border-[#D8D0C8]"
            }`}
          >
            <Image
              src={image}
              alt={`${productName} ${index + 1}`}
              fill
              sizes="80px"
              className="object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = fallbackImage;
              }}
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-white md:flex-1">
        <Image
          src={displayImages[selectedImage] || displayImages[0]}
          alt={`${productName} ${selectionContext}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="cursor-zoom-in object-cover transition duration-500 hover:scale-110"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
        />
      </div>

    </div>
  );
}