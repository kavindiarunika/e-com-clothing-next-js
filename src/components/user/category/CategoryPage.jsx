"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

import ProductCard from "@/components/user/product/ProductCard";
import CategoryFilterSidebar from "@/components/user/category/CategoryFilterSidebar";
import SearchBar from "@/components/user/shop/SearchBar";
import SortDropdown from "@/components/user/shop/SortDropdown";

import products from "@/data/products";

export default function CategoryPage({
  category,
  subcategory,
}) {
  const [selectedSubcategory, setSelectedSubcategory] =
    useState(subcategory || "All");

  const [selectedPrice, setSelectedPrice] =
    useState("");

  const [selectedSizes, setSelectedSizes] =
    useState([]);

  const [selectedAvailability, setSelectedAvailability] =
    useState("all");

  const [searchTerm, setSearchTerm] = useState("");

  const [sortBy, setSortBy] = useState("featured");

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  // ---------------------------------------
  // Update URL subcategory
  // ---------------------------------------

  useEffect(() => {
    setSelectedSubcategory(
      subcategory || "All"
    );
  }, [subcategory]);

  // ---------------------------------------
  // Category Products
  // ---------------------------------------

  const categoryProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.category === category
    );
  }, [category]);

  // ---------------------------------------
  // Subcategories
  // ---------------------------------------

  const subcategories = useMemo(() => {
    const values = categoryProducts
      .map(
        (product) =>
          product.subcategory
      )
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [categoryProducts]);

  // ---------------------------------------
  // Final Product Price
  // ---------------------------------------

  const getFinalPrice = (product) => {
    const price = Number(
      product.price || 0
    );

    const discount = Number(
      product.discount || 0
    );

    if (discount > 0) {
      return Math.round(
        price -
          (price * discount) / 100
      );
    }

    return price;
  };

  // ---------------------------------------
  // Product Sold Out
  // ---------------------------------------

  const isProductSoldOut = (product) => {
    if (
      !product.variants ||
      product.variants.length === 0
    ) {
      return false;
    }

    return product.variants.every(
      (variant) =>
        Number(variant.stock || 0) <= 0
    );
  };

  // ---------------------------------------
  // Filter Products
  // ---------------------------------------

  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          product.subcategory.toLowerCase().includes(term)
      );
    }

    // Subcategory
    if (
      selectedSubcategory &&
      selectedSubcategory !== "All"
    ) {
      result = result.filter(
        (product) =>
          product.subcategory ===
          selectedSubcategory
      );
    }

    // Price
    if (selectedPrice === "under5000") {
      result = result.filter(
        (product) =>
          getFinalPrice(product) < 5000
      );
    }

    if (
      selectedPrice === "5000-10000"
    ) {
      result = result.filter(
        (product) => {
          const price =
            getFinalPrice(product);

          return (
            price >= 5000 &&
            price <= 10000
          );
        }
      );
    }

    if (
      selectedPrice === "above10000"
    ) {
      result = result.filter(
        (product) =>
          getFinalPrice(product) >
          10000
      );
    }

    // Size
    if (selectedSizes.length > 0) {
      result = result.filter(
        (product) =>
          product.sizes?.some(
            (size) =>
              selectedSizes.includes(size)
          )
      );
    }

    // Availability
    if (
      selectedAvailability ===
      "available"
    ) {
      result = result.filter(
        (product) =>
          !isProductSoldOut(product)
      );
    }

    if (
      selectedAvailability ===
      "soldout"
    ) {
      result = result.filter(
        (product) =>
          isProductSoldOut(product)
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
    }

    if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [
    categoryProducts,
    searchTerm,
    selectedSubcategory,
    selectedPrice,
    selectedSizes,
    selectedAvailability,
    sortBy,
  ]);

  // ---------------------------------------
  // Clear Filters
  // ---------------------------------------

  const clearFilters = () => {
    setSelectedSubcategory("All");
    setSelectedPrice("");
    setSelectedSizes([]);
    setSelectedAvailability("all");
    setSearchTerm("");
    setSortBy("featured");
  };

  const categoryDescription = {
    Men: "Explore timeless styles and premium essentials designed for modern men.",

    Women:
      "Discover elegant and contemporary pieces designed to express your unique style.",

    Kids:
      "Find comfortable, stylish and playful pieces made for every little personality.",
  };

  return (
    <main className="min-h-screen bg-[#EFE9E1]">

      {/* ================= HEADER ================= */}

      <section className="border-b border-[#D8D0C8] bg-[#EFE9E1]">

        <div className="mx-auto w-[92%] max-w-300 py-12 md:py-16">

          <p className="mb-3 text-xs font-medium uppercase tracking-[3px] text-[#72383D]">
            Velora Collection
          </p>

          <div className="flex items-center gap-2 text-sm text-[#6B625C]">

            <Link
              href="/"
              className="transition hover:text-[#72383D]"
            >
              Home
            </Link>

            <ChevronRight size={14} />

            <span>{category}</span>

          </div>

          <h1 className="mt-4 font-serif text-4xl font-medium text-[#322D29] md:text-5xl">
            {category}
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-[#6B625C]">
            {categoryDescription[category]}
          </p>

        </div>

      </section>

      {/* ================= CATEGORY CONTENT ================= */}

      <section className="mx-auto w-[92%] max-w-300 py-10 md:py-14">

        {/* ================= MOBILE FILTER BUTTON ================= */}

        <div className="mb-6 lg:hidden">

          <button
            type="button"
            onClick={() =>
              setMobileFiltersOpen(true)
            }
            className="flex w-full items-center justify-center gap-2 border border-[#D8D0C8] bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[1px] text-[#322D29]"
          >
            <SlidersHorizontal size={16} />

            Filters
          </button>

        </div>

        {/* ================= SEARCH + SORT ================= */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-105">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>

          <div className="flex items-center justify-between gap-3 md:justify-end">
            <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[1px] text-[#6B625C]">
              Sort by
            </span>

            <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
          </div>
        </div>

        {/* ================= SUBCATEGORY ================= */}

        <div className="mb-10">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="font-serif text-2xl text-[#322D29]">
              Shop {category}
            </h2>

            <span className="text-sm text-[#6B625C]">
              {filteredProducts.length} products
            </span>

          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">

            {subcategories.map(
              (subcategoryItem) => (
                <button
                  key={subcategoryItem}
                  type="button"
                  onClick={() =>
                    setSelectedSubcategory(
                      subcategoryItem
                    )
                  }
                  className={`whitespace-nowrap border px-5 py-2.5 text-xs uppercase tracking-[1px] transition ${
                    selectedSubcategory ===
                    subcategoryItem
                      ? "border-[#72383D] bg-[#72383D] text-white"
                      : "border-[#D8D0C8] bg-white text-[#322D29] hover:border-[#72383D]"
                  }`}
                >
                  {subcategoryItem}
                </button>
              )
            )}

          </div>

        </div>

        {/* ================= SIDEBAR + PRODUCTS ================= */}

        <div className="flex items-start gap-8">

          {/* SIDEBAR */}

          <CategoryFilterSidebar
            subcategories={subcategories}
            selectedSubcategory={
              selectedSubcategory
            }
            setSelectedSubcategory={
              setSelectedSubcategory
            }
            selectedPrice={
              selectedPrice
            }
            setSelectedPrice={
              setSelectedPrice
            }
            selectedSizes={
              selectedSizes
            }
            setSelectedSizes={
              setSelectedSizes
            }
            selectedAvailability={
              selectedAvailability
            }
            setSelectedAvailability={
              setSelectedAvailability
            }
            onClear={clearFilters}
          />

          {/* PRODUCTS */}

          <div className="min-w-0 flex-1">

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">

                {filteredProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  )
                )}

              </div>
            ) : (
              <div className="flex min-h-75 items-center justify-center bg-white">

                <div className="text-center">

                  <h2 className="font-serif text-2xl text-[#322D29]">
                    No products found
                  </h2>

                  <p className="mt-2 text-sm text-[#6B625C]">
                    Try changing your
                    filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 bg-[#72383D] px-5 py-3 text-xs font-semibold uppercase tracking-[1px] text-white transition hover:bg-[#322D29]"
                  >
                    Clear Filters
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </section>

      {/* ================= MOBILE FILTER DRAWER ================= */}

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">

          {/* Background */}

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setMobileFiltersOpen(false)
            }
          />

          {/* Drawer */}

          <div className="absolute right-0 top-0 h-full w-[85%] max-w-90 overflow-y-auto bg-[#EFE9E1] p-5">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="font-serif text-2xl text-[#322D29]">
                Filters
              </h2>

              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(false)
                }
                className="flex h-9 w-9 items-center justify-center bg-white text-[#322D29]"
              >
                <ChevronRight
                  size={18}
                />
              </button>

            </div>

            <CategoryFilterSidebar
              subcategories={
                subcategories
              }
              selectedSubcategory={
                selectedSubcategory
              }
              setSelectedSubcategory={
                setSelectedSubcategory
              }
              selectedPrice={
                selectedPrice
              }
              setSelectedPrice={
                setSelectedPrice
              }
              selectedSizes={
                selectedSizes
              }
              setSelectedSizes={
                setSelectedSizes
              }
              selectedAvailability={
                selectedAvailability
              }
              setSelectedAvailability={
                setSelectedAvailability
              }
              onClear={clearFilters}
            />

            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen(false)
              }
              className="mt-6 w-full bg-[#72383D] py-4 text-xs font-semibold uppercase tracking-[1.5px] text-white"
            >
              View {filteredProducts.length} Products
            </button>

          </div>

        </div>
      )}

    </main>
  );
}