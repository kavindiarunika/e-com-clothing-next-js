"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import Image from "next/image";
import products from "@/data/products";

export default function Navbar() {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);
  const [cartCount, setCartCount] = useState(0);

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

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setOpenCollection(false);
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
  // CREATE COLLECTIONS FROM PRODUCTS
  // =====================================================

  const collections = Object.entries(
    products.reduce((acc, product) => {
      const category = product.category;
      const subcategory = product.subcategory;

      if (!category) return acc;

      if (!acc[category]) {
        acc[category] = new Set();
      }

      if (subcategory) {
        acc[category].add(subcategory);
      }

      return acc;
    }, {})
  ).reduce((acc, [category, subcategories]) => {
    acc[category] = [...subcategories].map((subcategory) => ({
      name: subcategory,
      href: `/user/${category
        .toLowerCase()
        .replace(/\s+/g, "-")}/${subcategory
        .toLowerCase()
        .replace(/\s+/g, "-")}`,
    }));

    return acc;
  }, {});

  return (
    <header className="sticky top-0 z-50 w-full bg-[#322D29] text-white">

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
          className="flex items-center gap-2"
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

        {/* =====================================================
            DESKTOP NAVIGATION
        ===================================================== */}

        <nav className="hidden items-center gap-9 md:flex">

          {/* HOME */}

          <Link
            href="/user"
            className="text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
          >
            Home
          </Link>

          {/* SHOP */}

          <Link
            href="/user/shop"
            className="text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
          >
            Shop
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
              className="flex items-center gap-1 text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
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
              <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-4">

                <div className="overflow-hidden rounded-sm bg-white py-4 text-[#322D29] shadow-xl">

                  {/* Dropdown Header */}

                  <div className="border-b border-[#322D29]/10 px-6 pb-3">
                    <p className="text-[10px] font-medium uppercase tracking-[2px] text-[#AC9C8D]">
                      Shop Collection
                    </p>

                    <p className="mt-1 font-serif text-lg">
                      Explore Velora
                    </p>
                  </div>

                  {/* View All */}

                  <Link
                    href="/user/shop"
                    onClick={closeMenu}
                    className="block px-6 py-3 text-sm font-medium transition hover:bg-[#EFE9E1] hover:text-[#72383D]"
                  >
                    View All Products
                  </Link>

                  {/* Collections */}

                  {Object.entries(collections).map(
                    ([categoryName, items]) => (
                      <div key={categoryName}>

                        {/* Main Category */}

                        <Link
                          href={`/user/${categoryName
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          onClick={closeMenu}
                          className="block px-6 pt-3 text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]"
                        >
                          {categoryName}
                        </Link>

                        {/* Subcategories */}

                        {items.length > 0 && (
                          <div className="pb-2 pt-1">

                            {items.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={closeMenu}
                                className="block px-6 py-2 text-sm text-[#322D29]/65 transition hover:bg-[#EFE9E1] hover:text-[#72383D]"
                              >
                                {item.name}
                              </Link>
                            ))}

                          </div>
                        )}
                      </div>
                    )
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
            className="text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
          >
            New Arrivals
          </Link>

        </nav>

        {/* =====================================================
            DESKTOP ACTIONS
        ===================================================== */}

        <div className="hidden items-center gap-5 md:flex">

          {/* Search */}

          <Link
            href="/user/shop"
            aria-label="Search"
            className="transition hover:text-[#AC9C8D]"
          >
            <Search
              size={20}
              strokeWidth={1.7}
            />
          </Link>

          {/* Wishlist */}

          <Link
            href="/user/wishlist"
            aria-label="Wishlist"
            className="transition hover:text-[#AC9C8D]"
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
            className="relative transition hover:text-[#AC9C8D]"
          >
            <ShoppingBag
              size={20}
              strokeWidth={1.7}
            />

            <span className="absolute -right-2 -top-2 flex h-3.75 w-3.75 items-center justify-center rounded-full bg-[#72383D] text-[9px] font-bold text-white">
              {cartCount}
            </span>
          </Link>

          {/* Account */}

          <Link
            href="/user/account"
            onClick={handleAccountClick}
            aria-label="Account"
            className="transition hover:text-[#AC9C8D]"
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

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(!mobileMenuOpen)
          }
          aria-label="Toggle menu"
          className="flex items-center justify-center md:hidden"
        >
          {mobileMenuOpen ? (
            <X
              size={25}
              strokeWidth={1.7}
            />
          ) : (
            <Menu
              size={25}
              strokeWidth={1.7}
            />
          )}
        </button>

      </div>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#322D29] px-[6%] pb-6 md:hidden">

          <nav className="flex flex-col">

            {/* HOME */}

            <Link
              href="/user"
              onClick={closeMenu}
              className="border-b border-white/10 py-4 text-sm uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
            >
              Home
            </Link>

            {/* SHOP */}

            <Link
              href="/user/shop"
              onClick={closeMenu}
              className="border-b border-white/10 py-4 text-sm uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
            >
              Shop
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
                <div className="pb-3 pl-4">

                  {/* View All */}

                  <Link
                    href="/user/shop"
                    onClick={closeMenu}
                    className="block py-2 text-sm font-medium text-[#AC9C8D]"
                  >
                    View All Products
                  </Link>

                  {/* Categories */}

                  {Object.entries(collections).map(
                    ([categoryName, items]) => (
                      <div key={categoryName}>

                        <Link
                          href={`/user/${categoryName
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          onClick={closeMenu}
                          className="block py-2 text-sm font-medium text-white"
                        >
                          {categoryName}
                        </Link>

                        {items.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={closeMenu}
                            className="block py-1.5 pl-4 text-sm text-white/60 transition hover:text-[#AC9C8D]"
                          >
                            {item.name}
                          </Link>
                        ))}

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                NEW ARRIVALS
            ================================================= */}

            <Link
              href="/user/shop?sort=newest"
              onClick={closeMenu}
              className="border-b border-white/10 py-4 text-sm uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
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
              className="flex items-center gap-3 py-3 text-sm transition hover:text-[#AC9C8D]"
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
              className="flex items-center gap-3 py-3 text-sm transition hover:text-[#AC9C8D]"
            >
              <ShoppingBag
                size={18}
                strokeWidth={1.7}
              />

              Cart

              {cartCount > 0 && (
                <span className="ml-auto rounded-full bg-[#72383D] px-2 py-0.5 text-[10px]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account */}

            <Link
              href="/user/account"
              onClick={handleAccountClick}
              className="flex items-center gap-3 py-3 text-sm transition hover:text-[#AC9C8D]"
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