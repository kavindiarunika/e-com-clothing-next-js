"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

import ProductCard from "@/components/user/product/ProductCard";
import CategoryFilterSidebar from "@/components/user/category/CategoryFilterSidebar";
import SearchBar from "@/components/user/shop/SearchBar";
import SortDropdown from "@/components/user/shop/SortDropdown";

export default function CategoryPage(props) {
  return (
    <CategoryPageContent
      key={`${props.category}-${props.subcategory || ""}`}
      {...props}
    />
  );
}

function CategoryPageContent({ category, subcategory }) {
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
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

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const productGridRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategoryProducts() {
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch("/api/admin/categories", { signal: controller.signal }),
          fetch("/api/user/Product?status=active", {
            signal: controller.signal,
          }),
        ]);

        if (!categoriesResponse.ok || !productsResponse.ok) {
          throw new Error("Failed to load category products");
        }

        const [allCategories, productsResult] = await Promise.all([
          categoriesResponse.json(),
          productsResponse.json(),
        ]);
        const activeCategories = Array.isArray(allCategories)
          ? allCategories.filter((item) => item.status === "active")
          : [];
        const rootCategory = activeCategories.find(
          (item) =>
            !item.parent_category_id &&
            item.name?.trim().toLowerCase() === category.toLowerCase()
        );

        if (!rootCategory) {
          setCategoryProducts([]);
          return;
        }

        const rootCategoryId = Number(rootCategory.category_id);
        const categoryById = new Map(
          activeCategories.map((item) => [Number(item.category_id), item])
        );
        const visibleCategoryIds = new Set(
          activeCategories
            .filter(
              (item) =>
                Number(item.category_id) === rootCategoryId ||
                Number(item.parent_category_id) === rootCategoryId
            )
            .map((item) => Number(item.category_id))
        );
        const categoryProducts = (Array.isArray(productsResult.data)
          ? productsResult.data
          : []
        )
          .filter((item) => visibleCategoryIds.has(Number(item.category_id)))
          .map((item) => {
            const assignedCategory = categoryById.get(
              Number(item.category_id)
            );

            return {
              id: item.item_id,
              name: item.title,
              category,
              subcategory:
                Number(item.category_id) === rootCategoryId
                  ? ""
                  : assignedCategory?.name || "",
              price: item.price,
              discount: item.discount,
              image: item.image,
              images: item.image ? [item.image] : [],
              variants: [],
              sizes: [],
            };
          });

        setCategoryProducts(categoryProducts);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Category products error:", error);
          setCategoryProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProducts(false);
        }
      }
    }

    void loadCategoryProducts();

    return () => controller.abort();
  }, [category]);

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);
  const [desktopFiltersOpen, setDesktopFiltersOpen] =
    useState(false);

  // ---------------------------------------
  // Category Products
  // ---------------------------------------

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
    setCurrentPage(1);
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

        <div className="mx-auto w-[92%] max-w-300 py-8 md:py-8">

          
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

          <h1 className="mt-3 font-serif text-3xl font-medium text-[#322D29] md:text-4xl">
            {category}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6B625C]">
            {categoryDescription[category]}
          </p>

        </div>

      </section>

      {/* ================= CATEGORY CONTENT ================= */}

      <section className="mx-auto w-[92%] max-w-300 py-10 md:py-14">

        {/* ================= SEARCH ================= */}

        <div className="mb-6 w-full">
          <SearchBar
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* ================= MOBILE FILTER + SORT ================= */}

        <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
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

        {/* Desktop Toolbar */}
        <div className="mb-6 hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setDesktopFiltersOpen((isOpen) => !isOpen)}
              aria-expanded={desktopFiltersOpen}
              aria-controls="category-filter-sidebar"
              className={`flex items-center gap-2 border px-4 py-2.5 text-xs font-semibold uppercase tracking-[1px] transition ${
                desktopFiltersOpen
                  ? "border-[#72383D] bg-[#72383D] text-white"
                  : "border-[#D8D0C8] bg-white text-[#322D29] hover:border-[#72383D] hover:text-[#72383D]"
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>

            <p className="text-sm text-[#6B625C]">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[1px] text-[#6B625C]">
              Sort by
            </span>
            <SortDropdown
              sortBy={sortBy}
              setSortBy={(value) => {
                setSortBy(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* ================= SIDEBAR + PRODUCTS ================= */}

        <div className="flex gap-8">

          {/* SIDEBAR */}

          {desktopFiltersOpen && (
            <div id="category-filter-sidebar">
              <CategoryFilterSidebar
            subcategories={subcategories}
            selectedSubcategory={
              selectedSubcategory
            }
            setSelectedSubcategory={(value) => {
              setSelectedSubcategory(value);
              setCurrentPage(1);
            }}
            selectedPrice={
              selectedPrice
            }
            setSelectedPrice={(value) => {
              setSelectedPrice(value);
              setCurrentPage(1);
            }}
            selectedSizes={
              selectedSizes
            }
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
                onClear={clearFilters}
              />
            </div>
          )}

          {/* PRODUCTS */}

          <div className="min-w-0 flex-1">

            {/* Mobile Product Count */}
            <p className="mb-5 text-sm text-[#6B625C] lg:hidden">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </p>

            {isLoadingProducts ? (
              <div className="flex min-h-75 items-center justify-center bg-white">
                <p className="text-sm text-[#6B625C]">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div
                ref={productGridRef}
                className={`grid scroll-mt-28 grid-cols-2 gap-4 md:grid-cols-3 ${desktopFiltersOpen ? "xl:grid-cols-4" : "lg:grid-cols-4"}`}
              >

                {pageProducts.map(
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

                  <span
                    aria-current="page"
                    aria-label={`Page ${activePage} of ${pageCount}`}
                    className="flex h-9 min-w-9 items-center justify-center bg-[#72383D] px-3 text-xs font-semibold text-white shadow-sm"
                  >
                    {activePage}
                  </span>

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
                setSelectedSubcategory={(value) => {
                  setSelectedSubcategory(value);
                  setCurrentPage(1);
                }}
              selectedPrice={
                selectedPrice
              }
                setSelectedPrice={(value) => {
                  setSelectedPrice(value);
                  setCurrentPage(1);
                }}
              selectedSizes={
                selectedSizes
              }
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