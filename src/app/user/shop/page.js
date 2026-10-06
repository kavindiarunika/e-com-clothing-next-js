"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";

import SearchBar from "@/components/user/shop/SearchBar";
import FilterSidebar from "@/components/user/shop/FilterSidebar";
import SortDropdown from "@/components/user/shop/SortDropdown";
import ProductCard from "@/components/user/product/ProductCard";
import ShopOfferHero from "@/components/user/shop/ShopOfferHero";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productLoadError, setProductLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Availability
  const [selectedAvailability, setSelectedAvailability] =
    useState("all");

  const [sortBy, setSortBy] = useState("best-selling");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const productGridRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/user/Product?status=active", {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load products");
        }

        const apiProducts = Array.isArray(result.data) ? result.data : [];
        setProducts(
          apiProducts.map((product) => ({
            id: product.item_id,
            name: product.title,
            category: product.category_name || "",
            subcategory: "",
            price: product.price,
            discount: product.discount,
            image: product.image,
            images: product.image ? [product.image] : [],
            variants: product.variants || [],
            sizes: product.sizes || [],
            colors: product.colors || [],
            isBestSelling: Number(product.is_best_selling) === 1,
            stock: Number(product.total_stock) || 0,
            createdAt: product.created_at,
          }))
        );
        setProductLoadError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Shop products error:", error);
          setProductLoadError("Products could not be loaded. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProducts(false);
        }
      }
    }

    void loadProducts();

    return () => controller.abort();
  }, []);

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
    const variantStock = (product.variants || []).reduce(
      (total, variant) => total + (Number(variant.stock) || 0),
      0
    );
    const availableStock = variantStock > 0
      ? variantStock
      : Number(product.stock ?? product.qty ?? 0);

    return availableStock <= 0;
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

    if (sortBy === "best-selling") {
      result.sort(
        (a, b) =>
          Number(b.isBestSelling) - Number(a.isBestSelling) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

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
    products,
    searchTerm,
    selectedCategory,
    selectedPrice,
    selectedSizes,
    selectedAvailability,
    sortBy,
  ]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredProducts.length / pageSize)
  );
  const activePage = Math.min(currentPage, pageCount);
  const pageProducts = filteredProducts.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize
  );
  const firstVisibleProduct =
    filteredProducts.length === 0
      ? 0
      : (activePage - 1) * pageSize + 1;
  const lastVisibleProduct = Math.min(
    activePage * pageSize,
    filteredProducts.length
  );
  const changePage = (page) => {
    setCurrentPage(page);
    productGridRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const paginationItems = [activePage];

  // =========================
  // Clear Filters
  // =========================
  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedPrice("");
    setSelectedSizes([]);
    setSelectedAvailability("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-[#EFE9E1]">

      <ShopOfferHero />

      {/* Main */}
      <section className="mx-auto w-[94%] max-w-[1440px] py-8 md:py-12">

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
            setSortBy={(value) => {
              setSortBy(value);
              setCurrentPage(1);
            }}
          />

        </div>


        <div className="flex gap-6 lg:gap-8">

          {/* Desktop Sidebar */}
          <aside
            id="shop-filter-sidebar"
            className="hidden w-[220px] shrink-0 md:block lg:w-[250px]"
          >
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto border border-[#DED5CB] border-t-2 border-t-[#72383D] bg-gradient-to-b from-white to-[#FAF7F3] p-5 shadow-[0_12px_32px_rgba(50,45,41,0.08)] lg:p-6">
              <div className="mb-6 rounded-sm bg-[#F3EEE8] p-2">
                <SearchBar
                  value={searchTerm}
                  onChange={(value) => {
                    setSearchTerm(value);
                    setCurrentPage(1);
                  }}
                />
              </div>

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

              <div className="mb-6 border-b border-[#E7DED5] pb-6">
                <label
                  htmlFor="shop-sort-desktop"
                  className="mb-3 block text-[10px] font-semibold uppercase tracking-[1.5px] text-[#786E66]"
                >
                  Sort by
                </label>
                <SortDropdown
                  id="shop-sort-desktop"
                  sortBy={sortBy}
                  setSortBy={(value) => {
                    setSortBy(value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <FilterSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={(value) => {
                  setSelectedCategory(value);
                  setCurrentPage(1);
                }}
                selectedPrice={selectedPrice}
                setSelectedPrice={(value) => {
                  setSelectedPrice(value);
                  setCurrentPage(1);
                }}
                selectedSizes={selectedSizes}
                setSelectedSizes={(value) => {
                  setSelectedSizes(value);
                  setCurrentPage(1);
                }}
                selectedAvailability={selectedAvailability}
                setSelectedAvailability={(value) => {
                  setSelectedAvailability(value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </aside>

          {/* Products */}
          <div className="min-w-0 flex-1">

            {/* Product Grid */}
            {isLoadingProducts ? (
              <div className="flex min-h-[350px] items-center justify-center bg-white">
                <p className="text-sm text-[#6B625C]">Loading products...</p>
              </div>
            ) : productLoadError ? (
              <div className="flex min-h-[350px] items-center justify-center bg-white px-6 text-center">
                <p className="text-sm text-[#72383D]">{productLoadError}</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div
                ref={productGridRef}
                className="grid scroll-mt-28 grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >

                {pageProducts.map((product) => (
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

            {filteredProducts.length > 0 && (
              <nav
                aria-label="Product pagination"
                className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-[#D8D0C8] pt-6 sm:flex-row"
              >
                <p className="text-sm text-[#6B625C]">
                  Showing <span className="font-semibold text-[#322D29]">{firstVisibleProduct}-{lastVisibleProduct}</span> of {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                </p>

                <div className="inline-flex items-center gap-1 border border-[#D8D0C8] bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => changePage(activePage - 1)}
                    disabled={activePage === 1}
                    aria-label="Go to previous page"
                    className="flex h-9 w-9 items-center justify-center text-[#5D554F] transition hover:bg-[#F8F5F2] hover:text-[#72383D] disabled:cursor-not-allowed disabled:text-[#C8C0B8] disabled:hover:bg-transparent"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  {paginationItems.map((item) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        type="button"
                        onClick={() => changePage(item)}
                        aria-label={`Go to page ${item}`}
                        aria-current={activePage === item ? "page" : undefined}
                        className={`h-9 min-w-9 px-3 text-xs font-semibold transition ${
                          activePage === item
                            ? "bg-[#72383D] text-white shadow-sm"
                            : "text-[#322D29] hover:bg-[#F8F5F2] hover:text-[#72383D]"
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span
                        key={item}
                        aria-hidden="true"
                        className="flex h-9 w-6 items-center justify-center text-sm text-[#9A928C]"
                      >
                        ...
                      </span>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() => changePage(activePage + 1)}
                    disabled={activePage === pageCount}
                    aria-label="Go to next page"
                    className="flex h-9 w-9 items-center justify-center text-[#5D554F] transition hover:bg-[#F8F5F2] hover:text-[#72383D] disabled:cursor-not-allowed disabled:text-[#C8C0B8] disabled:hover:bg-transparent"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </nav>
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

            <div className="bg-gradient-to-b from-white to-[#FAF7F3] p-6">

              <div className="mb-6 rounded-sm bg-[#F3EEE8] p-2">
                <SearchBar
                  value={searchTerm}
                  onChange={(value) => {
                    setSearchTerm(value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="mb-6 border-b border-[#E7DED5] pb-6">
                <label
                  htmlFor="shop-sort-mobile"
                  className="mb-3 block text-[10px] font-semibold uppercase tracking-[1.5px] text-[#786E66]"
                >
                  Sort by
                </label>
                <SortDropdown
                  id="shop-sort-mobile"
                  sortBy={sortBy}
                  setSortBy={(value) => {
                    setSortBy(value);
                    setCurrentPage(1);
                  }}
                />
              </div>

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
                setSelectedCategory={(value) => {
                  setSelectedCategory(value);
                  setCurrentPage(1);
                }}

                selectedPrice={selectedPrice}
                setSelectedPrice={(value) => {
                  setSelectedPrice(value);
                  setCurrentPage(1);
                }}

                selectedSizes={selectedSizes}
                setSelectedSizes={(value) => {
                  setSelectedSizes(value);
                  setCurrentPage(1);
                }}

                selectedAvailability={
                  selectedAvailability
                }
                setSelectedAvailability={(value) => {
                  setSelectedAvailability(value);
                  setCurrentPage(1);
                }}
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