"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import SearchBar from "@/components/user/shop/SearchBar";
import FilterSidebar from "@/components/user/shop/FilterSidebar";
import SortDropdown from "@/components/user/shop/SortDropdown";
import ProductCard from "@/components/user/product/ProductCard";

import products from "@/data/products";

export default function ShopPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Availability
  const [selectedAvailability, setSelectedAvailability] =
    useState("all");

  const [sortBy, setSortBy] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // =========================
  // Get Final Price
  // =========================
  const getFinalPrice = (product) => {
    const originalPrice = Number(product.price || 0);

    const discount = Number(
      product.discountPercentage ??
        product.discount ??
        0
    );

    if (discount > 0) {
      return Math.round(
        originalPrice - (originalPrice * discount) / 100
      );
    }

    return originalPrice;
  };

  // =========================
  // Check Product Sold Out
  // =========================
  const isProductSoldOut = (product) => {
    // If product has no variants,
    // don't consider it sold out
    if (
      !product.variants ||
      product.variants.length === 0
    ) {
      return false;
    }

    // Product is sold out only when
    // ALL variants have 0 stock
    return product.variants.every(
      (variant) =>
        Number(variant.stock || 0) <= 0
    );
  };

  // =========================
  // Filter Products
  // =========================
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // =========================
    // Search
    // =========================
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter((product) => {
        const productName =
          product.name?.toLowerCase() || "";

        const category =
          product.category?.toLowerCase() || "";

        const subcategory =
          product.subcategory?.toLowerCase() || "";

        return (
          productName.includes(search) ||
          category.includes(search) ||
          subcategory.includes(search)
        );
      });
    }

    // =========================
    // Category
    // =========================
    if (selectedCategory !== "All") {
      result = result.filter(
        (product) =>
          product.category === selectedCategory
      );
    }

    // =========================
    // Price - FINAL PRICE
    // =========================
    if (selectedPrice === "under5000") {
      result = result.filter(
        (product) =>
          getFinalPrice(product) < 5000
      );
    }

    if (selectedPrice === "5000-10000") {
      result = result.filter((product) => {
        const finalPrice =
          getFinalPrice(product);

        return (
          finalPrice >= 5000 &&
          finalPrice <= 10000
        );
      });
    }

    if (selectedPrice === "above10000") {
      result = result.filter(
        (product) =>
          getFinalPrice(product) > 10000
      );
    }

    // =========================
    // Size
    // =========================
    if (selectedSizes.length > 0) {
      result = result.filter((product) =>
        selectedSizes.some((size) =>
          product.sizes?.includes(size)
        )
      );
    }

    // =========================
    // Availability
    // =========================
    if (selectedAvailability === "available") {
      result = result.filter(
        (product) => !isProductSoldOut(product)
      );
    }

    if (selectedAvailability === "soldout") {
      result = result.filter(
        (product) => isProductSoldOut(product)
      );
    }

    // =========================
    // Sorting
    // =========================

    // Low to High - FINAL PRICE
    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          getFinalPrice(a) -
          getFinalPrice(b)
      );
    }

    // High to Low - FINAL PRICE
    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          getFinalPrice(b) -
          getFinalPrice(a)
      );
    }

    // Rating
    if (sortBy === "rating") {
      result.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );
    }

    // Name
    if (sortBy === "name") {
      result.sort((a, b) =>
        (a.name || "").localeCompare(
          b.name || ""
        )
      );
    }

    return result;
  }, [
    searchTerm,
    selectedCategory,
    selectedPrice,
    selectedSizes,
    selectedAvailability,
    sortBy,
  ]);

  // =========================
  // Clear Filters
  // =========================
  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedPrice("");
    setSelectedSizes([]);
    setSelectedAvailability("all");
    setSearchTerm("");
  };

  return (
    <main className="min-h-screen bg-[#EFE9E1]">

      {/* Header */}
      <section className="border-b border-[#D8D0C8] bg-[#EFE9E1]">
        <div className="mx-auto w-[92%] max-w-[1200px] py-12 md:py-16">

          <p className="mb-3 text-xs font-medium uppercase tracking-[3px] text-[#72383D]">
            Velora Collection
          </p>

          <h1 className="font-serif text-4xl font-medium text-[#322D29] md:text-5xl">
            Shop
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6B625C]">
            Discover timeless styles, premium fabrics and
            carefully selected pieces for every occasion.
          </p>

        </div>
      </section>

      {/* Main */}
      <section className="mx-auto w-[92%] max-w-[1200px] py-8 md:py-12">

        {/* Search */}
        <div className="mb-8">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        {/* Mobile Filter Button */}
        <div className="mb-6 flex items-center justify-between md:hidden">

          <button
            type="button"
            onClick={() =>
              setMobileFiltersOpen(true)
            }
            className="flex items-center gap-2 border border-[#D8D0C8] bg-white px-4 py-2.5 text-sm text-[#322D29]"
          >
            <SlidersHorizontal size={17} />
            Filters
          </button>

          <SortDropdown
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

        </div>

        <div className="flex gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden w-[220px] shrink-0 md:block">

            <div className="sticky top-28 bg-white p-6">

              <div className="mb-6 flex items-center justify-between">

                <h2 className="font-serif text-lg text-[#322D29]">
                  Filters
                </h2>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-[#72383D] hover:underline"
                >
                  Clear
                </button>

              </div>

              <FilterSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={
                  setSelectedCategory
                }

                selectedPrice={selectedPrice}
                setSelectedPrice={
                  setSelectedPrice
                }

                selectedSizes={selectedSizes}
                setSelectedSizes={
                  setSelectedSizes
                }

                selectedAvailability={
                  selectedAvailability
                }
                setSelectedAvailability={
                  setSelectedAvailability
                }
              />

            </div>

          </aside>

          {/* Products */}
          <div className="min-w-0 flex-1">

            {/* Product Toolbar */}
            <div className="mb-6 hidden items-center justify-between md:flex">

              <p className="text-sm text-[#6B625C]">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "product"
                  : "products"}
              </p>

              <SortDropdown
                sortBy={sortBy}
                setSortBy={setSortBy}
              />

            </div>

            {/* Mobile Count */}
            <p className="mb-5 text-sm text-[#6B625C] md:hidden">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
            </p>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}

              </div>
            ) : (
              <div className="flex min-h-[350px] flex-col items-center justify-center bg-white px-6 text-center">

                <h2 className="font-serif text-2xl text-[#322D29]">
                  No products found
                </h2>

                <p className="mt-2 max-w-md text-sm text-[#6B625C]">
                  Try changing your search or filters
                  to find what you are looking for.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 bg-[#72383D] px-6 py-3 text-xs font-medium uppercase tracking-[1px] text-white transition hover:bg-[#5E2E33]"
                >
                  Clear Filters
                </button>

              </div>
            )}

          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setMobileFiltersOpen(false)
            }
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-[360px] overflow-y-auto bg-[#EFE9E1]">

            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#D8D0C8] bg-white px-5 py-5">

              <h2 className="font-serif text-xl text-[#322D29]">
                Filters
              </h2>

              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(false)
                }
                className="text-[#322D29]"
              >
                <X size={22} />
              </button>

            </div>

            <div className="p-6">

              {/* Clear */}
              <div className="mb-6 flex justify-end">

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-[#72383D] hover:underline"
                >
                  Clear All
                </button>

              </div>

              <FilterSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={
                  setSelectedCategory
                }

                selectedPrice={selectedPrice}
                setSelectedPrice={
                  setSelectedPrice
                }

                selectedSizes={selectedSizes}
                setSelectedSizes={
                  setSelectedSizes
                }

                selectedAvailability={
                  selectedAvailability
                }
                setSelectedAvailability={
                  setSelectedAvailability
                }
              />

              {/* Apply */}
              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(false)
                }
                className="mt-8 w-full bg-[#72383D] py-3.5 text-xs font-medium uppercase tracking-[1px] text-white"
              >
                Show {filteredProducts.length} Products
              </button>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}