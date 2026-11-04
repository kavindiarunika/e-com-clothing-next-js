"use client";

import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full">
      <Search
        size={19}
        strokeWidth={1.7}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)]"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-none border border-[#E5E5E5] bg-white py-3.5 pl-11 pr-10 text-sm text-[#292524] outline-none transition focus:border-[var(--color-primary)]"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          <X size={17} />
        </button>
      )}
    </div>
  );
}