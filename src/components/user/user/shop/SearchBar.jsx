"use client";

import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full">
      <Search
        size={19}
        strokeWidth={1.7}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e63e62]"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-none border border-[#E7DEDC] bg-white py-3.5 pl-11 pr-10 text-sm text-[#292524] outline-none transition focus:border-[#e63e62]"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#e63e62] hover:text-[#e63e62]"
        >
          <X size={17} />
        </button>
      )}
    </div>
  );
}