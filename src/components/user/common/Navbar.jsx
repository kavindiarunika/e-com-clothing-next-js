"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

function normalizeCategoryImage(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  const image = value.trim();
  if (/^(\/|https?:|data:|blob:)/i.test(image)) return image;
  if (!/^[A-Za-z0-9+/=\r\n]+$/.test(image)) return image;

  try {
    const base64 = image.replace(/\s/g, "");
    const signature = atob(base64.slice(0, 16));
    const bytes = Uint8Array.from(signature, (character) =>
      character.charCodeAt(0)
    );

    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return `data:image/png;base64,${base64}`;
    }
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return `data:image/jpeg;base64,${base64}`;
    }
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return `data:image/gif;base64,${base64}`;
    }
    if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return `data:image/webp;base64,${base64}`;
    }

    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return "";
  }
}

export default function Navbar() {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);
  const [expandedCollectionId, setExpandedCollectionId] = useState(null);
  const [collectionSearchTerm, setCollectionSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const searchInputRef = useRef(null);

  // =====================================================
  // CART COUNT
  // =====================================================

  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = JSON.parse(
        localStorage.getItem("velora-cart") || "[]"
      );

      const totalItems = savedCart.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );

      setCartCount(totalItems);
    };

    updateCartCount();

    window.addEventListener("velora-cart-updated", updateCartCount);

    return () => {
      window.removeEventListener(
        "velora-cart-updated",
        updateCartCount
      );
    };
  }, []);

  useEffect(() => {
    if (!searchOpen) return undefined;

    searchInputRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories", {
          signal: controller.signal,
        });
        if (!response.ok) return;

        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load collection categories:", error);
        }
      }
    };

    void loadCategories();

    return () => controller.abort();
  }, []);

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setOpenCollection(false);
    setExpandedCollectionId(null);
    setCollectionSearchTerm("");
  };

  const openSearch = () => {
    closeMenu();
    setSearchTerm("");
    setSearchOpen(true);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchTerm("");
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    router.push(`/user/shop?search=${encodeURIComponent(query)}`);
    closeSearch();
  };

  // =====================================================
  // ACCOUNT
  // =====================================================

  const handleAccountClick = (event) => {
    event.preventDefault();

    closeMenu();

    const isLoggedIn = Boolean(
      localStorage.getItem("velora-user-session")
    );

    router.push(
      isLoggedIn ? "/user/account" : "/user/login"
    );
  };

  // =====================================================
  // CREATE COLLECTIONS FROM ADMIN CATEGORIES
  // =====================================================

  const activeCategories = categories.filter(
    (category) => category.status === "active"
  );
  const categorySlug = (name) => name.toLowerCase().trim().replace(/\s+/g, "-");
  const collections = activeCategories
    .filter((category) => !category.parent_category_id)
    .map((category) => {
      const subcategories = activeCategories
        .filter(
          (subcategory) =>
            String(subcategory.parent_category_id) === String(category.category_id)
        )
        .map((subcategory) => ({
          id: subcategory.category_id,
          name: subcategory.name,
          image: normalizeCategoryImage(subcategory.image),
          href: `/user/${categorySlug(category.name)}/${categorySlug(subcategory.name)}`,
        }));

      return {
        id: category.category_id,
        name: category.name,
        image: normalizeCategoryImage(category.image),
        href: `/user/${categorySlug(category.name)}`,
        subcategories,
      };
    });
  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(collectionSearchTerm.trim().toLowerCase()) ||
    collection.subcategories.some((subcategory) =>
      subcategory.name.toLowerCase().includes(collectionSearchTerm.trim().toLowerCase())
    )
  );
  const filteredSubcategories = (collection) => {
    const search = collectionSearchTerm.trim().toLowerCase();
    if (!search || collection.name.toLowerCase().includes(search)) {
      return collection.subcategories;
    }

    return collection.subcategories.filter((subcategory) =>
      subcategory.name.toLowerCase().includes(search)
    );
  };
  const isCollectionExpanded = (collection) =>
    expandedCollectionId === collection.id;
  const expandedCollection = filteredCollections.find(isCollectionExpanded);
  const expandedCollectionIndex = filteredCollections.findIndex(isCollectionExpanded);
  return (
    <header className="sticky top-0 z-50 w-full bg-black text-white">

      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <div className="mx-auto flex h-19 w-[92%] max-w-300 items-center justify-between">

        {/* =====================================================
            LOGO
        ===================================================== */}

        <Link
          href="/user"
          onClick={closeMenu}
          className={`flex items-center gap-2 ${searchOpen ? "hidden" : ""}`}
        >
          <Image
            src="/images/logo/logo.png"
            alt="Velora Logo"
            width={70}
            height={70}
            priority
            className="h-17.5 w-17.5 object-contain"
          />

          <span className="font-serif text-[24px] font-bold tracking-[3px] text-white">
            VELORA
          </span>
        </Link>

        {searchOpen && (
          <form
            onSubmit={submitSearch}
            className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-md border border-[#E5DDD5] bg-white px-3 text-[#292524] shadow-sm sm:mx-6 sm:h-12 sm:px-4"
          >
            <Search size={19} className="shrink-0 text-[#e63e62]" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#292524] outline-none placeholder:text-[#8B817A] sm:text-base"
            />
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="shrink-0 rounded-full p-1 text-[#6B625C] transition hover:bg-[#F1ECE6] hover:text-[#e63e62]"
            >
              <X size={18} />
            </button>
          </form>
        )}

        {/* =====================================================
            DESKTOP NAVIGATION
        ===================================================== */}

        <nav className={`hidden items-center gap-9 md:flex ${searchOpen ? "!hidden" : ""}`}>

          {/* HOME */}

          <Link
            href="/user"
            className="text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#e63e62]"
          >
            Home
          </Link>

          {/* SHOP */}

          <Link
            href="/user/shop"
            className="text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#e63e62]"
          >
            Shop
          </Link>

          <Link
            href="/user/offers"
            className="text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#e63e62]"
          >
            Offers
          </Link>

          {/* =================================================
              COLLECTION DROPDOWN
          ================================================= */}

          <div
            className="relative"
            onMouseEnter={() => setOpenCollection(true)}
            onMouseLeave={() => setOpenCollection(false)}
          >

            <Link
              href="/user/shop"
              className="flex items-center gap-1 text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#e63e62]"
            >
              Collection

              <ChevronDown
                size={14}
                strokeWidth={1.7}
                className={`transition-transform duration-200 ${
                  openCollection ? "rotate-180" : ""
                }`}
              />
            </Link>

            {openCollection && (
              <div className="absolute left-1/2 top-full flex w-[35rem] -translate-x-1/2 items-start gap-2 pt-4">
                <div className="w-72 shrink-0 overflow-hidden rounded-xl border border-[#F3DCE1] bg-black p-2 text-white shadow-[0_16px_40px_rgba(41,37,36,0.18)]">
                  <label className="flex h-10 items-center gap-2 rounded-lg bg-[#F8F5F2] px-3 focus-within:ring-1 focus-within:ring-[#e63e62]">
                    <Search size={15} className="shrink-0 text-[#e63e62]" />
                    <input
                      type="search"
                      value={collectionSearchTerm}
                      onChange={(event) => setCollectionSearchTerm(event.target.value)}
                      placeholder="Search collections..."
                      aria-label="Search collections"
                      className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#8B817A]"
                    />
                    <ChevronDown size={14} className="shrink-0 text-white" />
                  </label>

                  <div className="mt-2 max-h-64 overflow-y-auto">
                    {filteredCollections.length > 0 ? (
                      filteredCollections.map((collection) => {
                        const expanded = isCollectionExpanded(collection);

                        return (
                          <div key={collection.id}>
                            <div className="group flex min-h-12 items-center rounded-lg text-white transition-colors hover:bg-[#FCE8ED] hover:text-[#d52d51]">
                              <Link
                                href={collection.href}
                                onClick={closeMenu}
                                className="flex min-w-0 flex-1 items-center gap-3 rounded-l-lg px-3 py-2 text-xs font-medium focus-visible:outline-none"
                              >
                                {collection.image ? (
                                  <img
                                    src={collection.image}
                                    alt=""
                                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                                  />
                                ) : (
                                  <span
                                    aria-hidden="true"
                                    className="h-9 w-9 shrink-0 rounded-full bg-[#F8F5F2]"
                                  />
                                )}
                                <span className="flex-1">{collection.name}</span>
                              </Link>
                              {collection.subcategories.length > 0 && (
                                <button
                                  type="button"
                                  aria-label={`${expanded ? "Collapse" : "Expand"} ${collection.name} subcategories`}
                                  aria-expanded={expanded}
                                  onClick={() =>
                                    setExpandedCollectionId(
                                      expanded ? null : collection.id
                                    )
                                  }
                                  className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/15 hover:text-[#e63e62] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e63e62]"
                                >
                                  <ChevronRight
                                    size={16}
                                    className={`transition-transform duration-200 ${
                                      expanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="px-3 py-4 text-center text-xs text-[#6B625C]">
                        No collections found.
                      </p>
                    )}
                  </div>
                </div>

                {expandedCollection && (
                  <div
                    className="w-64 shrink-0 overflow-hidden rounded-xl border border-[#F3DCE1] bg-black p-2 text-white shadow-[0_16px_40px_rgba(41,37,36,0.18)]"
                    style={{ marginTop: `${56 + expandedCollectionIndex * 48}px` }}
                  >
                    <div className="max-h-80 overflow-y-auto">
                      {filteredSubcategories(expandedCollection).map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={subcategory.href}
                          onClick={closeMenu}
                          className="flex min-h-12 items-center gap-3 rounded-lg px-3 py-2 text-xs text-white transition-colors hover:bg-[#FCE8ED] hover:text-[#d52d51] focus-visible:bg-[#FCE8ED] focus-visible:outline-none"
                        >
                          {subcategory.image ? (
                            <img
                              src={subcategory.image}
                              alt=""
                              className="h-9 w-9 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="h-9 w-9 shrink-0 rounded-full bg-[#F8F5F2]"
                            />
                          )}
                          <span>{subcategory.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =================================================
              NEW ARRIVALS
          ================================================= */}

          <Link
            href="/user/shop?sort=newest"
            className="text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#e63e62]"
          >
            New Arrivals
          </Link>

        </nav>

        {/* =====================================================
            DESKTOP ACTIONS
        ===================================================== */}

        <div className={`hidden items-center gap-5 md:flex ${searchOpen ? "!hidden" : ""}`}>

          {/* Search */}

          <button
            type="button"
            onClick={openSearch}
            aria-label="Search"
            className="transition hover:text-[#e63e62]"
          >
            <Search
              size={20}
              strokeWidth={1.7}
            />
          </button>

          {/* Wishlist */}

          <Link
            href="/user/wishlist"
            aria-label="Wishlist"
            className="transition hover:text-[#e63e62]"
          >
            <Heart
              size={20}
              strokeWidth={1.7}
            />
          </Link>

          {/* Cart */}

          <Link
            href="/user/cart"
            aria-label="Shopping Cart"
            className="relative transition hover:text-[#e63e62]"
          >
            <ShoppingBag
              size={20}
              strokeWidth={1.7}
            />

            <span className="absolute -right-2 -top-2 flex h-3.75 w-3.75 items-center justify-center rounded-full bg-[#e63e62] text-[9px] font-bold text-white">
              {cartCount}
            </span>
          </Link>

          {/* Account */}

          <Link
            href="/user/account"
            onClick={handleAccountClick}
            aria-label="Account"
            className="transition hover:text-[#e63e62]"
          >
            <User
              size={20}
              strokeWidth={1.7}
            />
          </Link>

        </div>

        {/* =====================================================
            MOBILE MENU BUTTON
        ===================================================== */}

        <div className={`flex items-center gap-5 md:hidden ${searchOpen ? "hidden" : ""}`}>
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search products"
            className="flex items-center justify-center transition hover:text-[#e63e62]"
          >
            <Search size={21} strokeWidth={1.7} />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="flex items-center justify-center"
          >
            {mobileMenuOpen ? (
              <X size={25} strokeWidth={1.7} />
            ) : (
              <Menu size={25} strokeWidth={1.7} />
            )}
          </button>
        </div>

      </div>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-black px-[6%] pb-6 md:hidden">

          <nav className="flex flex-col">

            {/* HOME */}

            <Link
              href="/user"
              onClick={closeMenu}
              className="border-b border-white/10 py-4 text-sm uppercase tracking-[1px] transition hover:text-[#e63e62]"
            >
              Home
            </Link>

            {/* SHOP */}

            <Link
              href="/user/shop"
              onClick={closeMenu}
              className="border-b border-white/10 py-4 text-sm uppercase tracking-[1px] transition hover:text-[#e63e62]"
            >
              Shop
            </Link>

            <Link
              href="/user/offers"
              onClick={closeMenu}
              className="border-b border-white/10 py-4 text-sm uppercase tracking-[1px] transition hover:text-[#e63e62]"
            >
              Offers
            </Link>

            {/* =================================================
                MOBILE COLLECTION
            ================================================= */}

            <div className="border-b border-white/10">

              <button
                type="button"
                onClick={() =>
                  setOpenCollection(!openCollection)
                }
                className="flex w-full items-center justify-between py-4 text-sm uppercase tracking-[1px]"
              >
                Collection

                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    openCollection
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {openCollection && (
                <div className="mb-4 rounded-xl border border-[#F3DCE1] bg-white p-2 text-[#292524] shadow-lg">
                  <label className="flex h-10 items-center gap-2 rounded-lg bg-[#F8F5F2] px-3 focus-within:ring-1 focus-within:ring-[#e63e62]">
                    <Search size={15} className="shrink-0 text-[#e63e62]" />
                    <input
                      type="search"
                      value={collectionSearchTerm}
                      onChange={(event) => setCollectionSearchTerm(event.target.value)}
                      placeholder="Search collections..."
                      aria-label="Search collections"
                      className="min-w-0 flex-1 bg-transparent text-xs text-[#292524] outline-none placeholder:text-[#8B817A]"
                    />
                    <ChevronDown size={14} className="shrink-0 text-[#6B625C]" />
                  </label>
                  <div className="mt-2 max-h-52 overflow-y-auto">
                    {filteredCollections.length > 0 ? (
                      filteredCollections.map((collection) => {
                        const expanded = isCollectionExpanded(collection);

                        return (
                          <div key={collection.id}>
                            <div className="group flex min-h-12 items-center rounded-lg text-[#292524] transition-colors hover:bg-[#FCE8ED] hover:text-[#d52d51]">
                              <Link
                                href={collection.href}
                                onClick={closeMenu}
                                className="flex min-w-0 flex-1 items-center gap-3 rounded-l-lg px-3 py-2 text-xs font-medium focus-visible:outline-none"
                              >
                                {collection.image ? (
                                  <img
                                    src={collection.image}
                                    alt=""
                                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                                  />
                                ) : (
                                  <span
                                    aria-hidden="true"
                                    className="h-9 w-9 shrink-0 rounded-full bg-[#F8F5F2]"
                                  />
                                )}
                                <span className="flex-1">{collection.name}</span>
                              </Link>
                              {collection.subcategories.length > 0 && (
                                <button
                                  type="button"
                                  aria-label={`${expanded ? "Collapse" : "Expand"} ${collection.name} subcategories`}
                                  aria-expanded={expanded}
                                  onClick={() =>
                                    setExpandedCollectionId(
                                      expanded ? null : collection.id
                                    )
                                  }
                                  className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#292524] transition-colors hover:bg-white hover:text-[#e63e62] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e63e62]"
                                >
                                  <ChevronRight
                                    size={16}
                                    className={`transition-transform duration-200 ${
                                      expanded ? "rotate-90" : ""
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                            {expanded && collection.subcategories.length > 0 && (
                              <div className="ml-7 border-l border-[#F3DCE1] py-1 pl-3">
                                {filteredSubcategories(collection).map((subcategory) => (
                                  <Link
                                    key={subcategory.id}
                                    href={subcategory.href}
                                    onClick={closeMenu}
                                    className="flex min-h-12 items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#292524] transition-colors hover:bg-[#FCE8ED] hover:text-[#d52d51] focus-visible:bg-[#FCE8ED] focus-visible:outline-none"
                                  >
                                    {subcategory.image ? (
                                      <img
                                        src={subcategory.image}
                                        alt=""
                                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                                      />
                                    ) : (
                                      <span
                                        aria-hidden="true"
                                        className="h-9 w-9 shrink-0 rounded-full bg-[#F8F5F2]"
                                      />
                                    )}
                                    <span>{subcategory.name}</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="px-3 py-4 text-center text-xs text-[#6B625C]">
                        No collections found.
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* =================================================
                NEW ARRIVALS
            ================================================= */}

            <Link
              href="/user/shop?sort=newest"
              onClick={closeMenu}
              className="border-b border-white/10 py-4 text-sm uppercase tracking-[1px] transition hover:text-[#e63e62]"
            >
              New Arrivals
            </Link>

          </nav>

          {/* =====================================================
              MOBILE ACCOUNT LINKS
          ===================================================== */}

          <div className="mt-3 flex flex-col">

            {/* Wishlist */}

            <Link
              href="/user/wishlist"
              onClick={closeMenu}
              className="flex items-center gap-3 py-3 text-sm transition hover:text-[#e63e62]"
            >
              <Heart
                size={18}
                strokeWidth={1.7}
              />

              Wishlist
            </Link>

            {/* Cart */}

            <Link
              href="/user/cart"
              onClick={closeMenu}
              className="flex items-center gap-3 py-3 text-sm transition hover:text-[#e63e62]"
            >
              <ShoppingBag
                size={18}
                strokeWidth={1.7}
              />

              Cart

              {cartCount > 0 && (
                <span className="ml-auto rounded-full bg-[#e63e62] px-2 py-0.5 text-[10px]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account */}

            <Link
              href="/user/account"
              onClick={handleAccountClick}
              className="flex items-center gap-3 py-3 text-sm transition hover:text-[#e63e62]"
            >
              <User
                size={18}
                strokeWidth={1.7}
              />

              Account
            </Link>

          </div>

        </div>
      )}

    </header>
  );
}