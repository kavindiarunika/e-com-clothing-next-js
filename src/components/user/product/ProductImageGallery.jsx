"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ProductImageGallery({
  images,
  productName,
  selectedColor,
}) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Change image when color changes
  useEffect(() => {
    if (!selectedColor?.image || !images) return;

    const colorImageIndex = images.findIndex(
      (image) => image === selectedColor.image
    );

    if (colorImageIndex !== -1) {
      setSelectedImage(colorImageIndex);
    }
  }, [selectedColor, images]);

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">

      {/* Thumbnail Images */}
      <div className="flex gap-3 overflow-x-auto md:w-[90px] md:flex-col">
        {images.map((image, index) => (
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
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-white md:flex-1">
        <Image
          src={images[selectedImage]}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="cursor-zoom-in object-cover transition duration-500 hover:scale-110"
        />
      </div>

    </div>
  );
}