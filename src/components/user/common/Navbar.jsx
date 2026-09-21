
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = JSON.parse(localStorage.getItem("velora-cart") || "[]");
      const totalItems = savedCart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      setCartCount(totalItems);
    };

    updateCartCount();
    window.addEventListener("velora-cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("velora-cart-updated", updateCartCount);
    };
  }, []);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setOpenCategory(null);
  };

  const categories = Object.entries(
    products.reduce((acc, product) => {
      const category = product.category;
      const subcategory = product.subcategory;

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
      href: `/user/${category.toLowerCase()}/${subcategory
        .toLowerCase()
        .replace(/\s+/g, "-")}`,
    }));

    return acc;
  }, {});

  return (
    <header className="sticky top-0 z-50 w-full bg-[#322D29] text-white">
      <div className="mx-auto flex h-19 w-[92%] max-w-300 items-center justify-between">

        {/* Logo */}
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

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">

          <Link
            href="/user"
            className="text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
          >
            Home
          </Link>

          <Link
            href="/user/shop"
            className="text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
          >
            Shop
          </Link>

          {/* Men */}
          <div
            className="relative"
            onMouseEnter={() => setOpenCategory("Men")}
            onMouseLeave={() => setOpenCategory(null)}
          >
            <Link
              href="/user/men"
              className="flex items-center gap-1 text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
            >
              Men
              <ChevronDown size={14} strokeWidth={1.7} />
            </Link>

            {openCategory === "Men" && (
              <div className="absolute left-0 top-full w-48 pt-4">
                <div className="bg-white py-3 text-[#322D29] shadow-lg">
                  {categories.Men.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="block px-5 py-2.5 text-sm transition hover:bg-[#EFE9E1] hover:text-[#72383D]"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Women */}
          <div
            className="relative"
            onMouseEnter={() => setOpenCategory("Women")}
            onMouseLeave={() => setOpenCategory(null)}
          >
            <Link
              href="/user/women"
              className="flex items-center gap-1 text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
            >
              Women
              <ChevronDown size={14} strokeWidth={1.7} />
            </Link>

            {openCategory === "Women" && (
              <div className="absolute left-0 top-full w-48 pt-4">
                <div className="bg-white py-3 text-[#322D29] shadow-lg">
                  {categories.Women.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="block px-5 py-2.5 text-sm transition hover:bg-[#EFE9E1] hover:text-[#72383D]"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kids */}
          <div
            className="relative"
            onMouseEnter={() => setOpenCategory("Kids")}
            onMouseLeave={() => setOpenCategory(null)}
          >
            <Link
              href="/user/kids"
              className="flex items-center gap-1 text-[13px] font-medium uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
            >
              Kids
              <ChevronDown size={14} strokeWidth={1.7} />
            </Link>

            {openCategory === "Kids" && (
              <div className="absolute left-0 top-full w-48 pt-4">
                <div className="bg-white py-3 text-[#322D29] shadow-lg">
                  {categories.Kids.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="block px-5 py-2.5 text-sm transition hover:bg-[#EFE9E1] hover:text-[#72383D]"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-5 md:flex">

          <Link
            href="/user/shop"
            aria-label="Search"
            className="transition hover:text-[#AC9C8D]"
          >
            <Search size={20} strokeWidth={1.7} />
          </Link>

          <Link
            href="/user/wishlist"
            aria-label="Wishlist"
            className="transition hover:text-[#AC9C8D]"
          >
            <Heart size={20} strokeWidth={1.7} />
          </Link>

          <Link
            href="/user/cart"
            aria-label="Shopping Cart"
            className="relative transition hover:text-[#AC9C8D]"
          >
            <ShoppingBag size={20} strokeWidth={1.7} />

            <span className="absolute -right-2 -top-2 flex h-3.75 w-3.75 items-center justify-center rounded-full bg-[#72383D] text-[9px] font-bold text-white">
              {cartCount > 0 ? cartCount : 0}
            </span>
          </Link>

          <Link
            href="/user"
            aria-label="Account"
            className="transition hover:text-[#AC9C8D]"
          >
            <User size={20} strokeWidth={1.7} />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          className="flex items-center justify-center md:hidden"
        >
          {mobileMenuOpen ? (
            <X size={25} strokeWidth={1.7} />
          ) : (
            <Menu size={25} strokeWidth={1.7} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#322D29] px-[6%] pb-6 md:hidden">

          <nav className="flex flex-col">

            <Link
              href="/user"
              onClick={closeMenu}
              className="border-b border-white/10 py-4 text-sm uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
            >
              Home
            </Link>

            <Link
              href="/user/shop"
              onClick={closeMenu}
              className="border-b border-white/10 py-4 text-sm uppercase tracking-[1px] transition hover:text-[#AC9C8D]"
            >
              Shop
            </Link>

            {/* Mobile Categories */}
            {Object.entries(categories).map(([categoryName, items]) => (
              <div key={categoryName} className="border-b border-white/10">

                <button
                  type="button"
                  onClick={() =>
                    setOpenCategory(
                      openCategory === categoryName ? null : categoryName
                    )
                  }
                  className="flex w-full items-center justify-between py-4 text-sm uppercase tracking-[1px]"
                >
                  {categoryName}

                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      openCategory === categoryName ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openCategory === categoryName && (
                  <div className="pb-3 pl-4">

                    {/* Main Category */}
                    <Link
                      href={`/user/${categoryName.toLowerCase()}`}
                      onClick={closeMenu}
                      className="block py-2 text-sm font-medium text-[#AC9C8D]"
                    >
                      View All {categoryName}
                    </Link>

                    {items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeMenu}
                        className="block py-2 text-sm text-white/75 transition hover:text-[#AC9C8D]"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Account Links */}
          <div className="mt-3 flex flex-col">

            <Link
              href="/user/wishlist"
              onClick={closeMenu}
              className="flex items-center gap-3 py-3 text-sm transition hover:text-[#AC9C8D]"
            >
              <Heart size={18} strokeWidth={1.7} />
              Wishlist
            </Link>

            <Link
              href="/user/cart"
              onClick={closeMenu}
              className="flex items-center gap-3 py-3 text-sm transition hover:text-[#AC9C8D]"
            >
              <ShoppingBag size={18} strokeWidth={1.7} />
              Cart
            </Link>

            <Link
              href="/user"
              onClick={closeMenu}
              className="flex items-center gap-3 py-3 text-sm transition hover:text-[#AC9C8D]"
            >
              <User size={18} strokeWidth={1.7} />
              Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

