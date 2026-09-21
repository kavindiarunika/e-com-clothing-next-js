"use client";

import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full">
      <Search
        size={19}
        strokeWidth={1.7}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AC9C8D]"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-none border border-[#D8D0C8] bg-white py-3.5 pl-11 pr-10 text-sm text-[#322D29] outline-none transition focus:border-[#72383D]"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AC9C8D] hover:text-[#72383D]"
        >
          <X size={17} />
        </button>
      )}
    </div>
  );
}