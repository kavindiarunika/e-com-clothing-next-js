"use client";

import { ChevronDown } from "lucide-react";

export default function SortDropdown({ sortBy, setSortBy }) {
  return (
    <div className="relative">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="appearance-none border border-[#E7DEDC] bg-white py-2.5 pl-4 pr-10 text-sm text-[#292524] outline-none focus:border-[#e63e62]"
      >
        <option value="featured">Featured</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="rating">Highest Rated</option>
        <option value="name">Name: A-Z</option>
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#e63e62]"
      />
    </div>
  );
}