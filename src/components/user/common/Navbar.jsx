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

export default function Navbar() {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);

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
  const collections = activeCategories
    .filter((category) => !category.parent_category_id)
    .map((category) => {
      const categorySlug = category.name
        .toLowerCase()
        .replace(/\s+/g, "-");

      return {
        id: category.category_id,
        name: category.name,
        href: `/user/${categorySlug}`,
      };
    });

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
                  {collections.map(({ id, name, href }) => (
                      <div key={id}>

                        {/* Main Category */}

                        <Link
                          href={href}
                          onClick={closeMenu}
                          className="block px-6 pt-3 text-xs font-semibold uppercase tracking-[1.5px] text-[#322D29]"
                        >
                          {name}
                        </Link>
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
                  {collections.map(({ id, name, href }) => (
                      <div key={id}>

                        <Link
                          href={href}
                          onClick={closeMenu}
                          className="block py-2 text-sm font-medium text-white"
                        >
                          {name}
                        </Link>

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