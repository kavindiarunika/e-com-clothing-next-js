"use client";

import { X } from "lucide-react";

export default function SizeChart({
  isOpen,
  onClose,
  category,
  sizeGuide = {},
}) {
  if (!isOpen) return null;

  const getChartData = () => {
    if (category === "Kids") {
      return {
        title: "Kids Size Guide",
        headers: ["Size", "Age", "Chest"],
        rows: [
          ["XS", "3–4 Years", sizeGuide.XS || "—"],
          ["S", "5–7 Years", sizeGuide.S || "—"],
          ["M", "8–10 Years", sizeGuide.M || "—"],
        ],
      };
    }

    if (category === "Women") {
      return {
        title: "Women's Size Guide",
        headers: ["Size", "Bust", "Waist", "Hips"],
        rows: [
          ["S", sizeGuide.S || "—", "26–28", "36–38"],
          ["M", sizeGuide.M || "—", "28–30", "38–40"],
          ["L", sizeGuide.L || "—", "30–32", "40–42"],
          ["XL", sizeGuide.XL || "—", "32–34", "42–44"],
        ],
      };
    }

    return {
      title: "Men's Size Guide",
      headers: ["Size", "Chest", "Waist"],
      rows: [
        ["S", sizeGuide.S || "—", "28–30"],
        ["M", sizeGuide.M || "—", "30–32"],
        ["L", sizeGuide.L || "—", "32–34"],
        ["XL", sizeGuide.XL || "—", "34–36"],
      ],
    };
  };

  const chart = getChartData();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-2xl bg-white p-6 shadow-xl md:p-8">

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center text-[#322D29] transition hover:text-[#72383D]"
          aria-label="Close size chart"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6 pr-8">
          <p className="text-xs font-semibold uppercase tracking-[2px] text-[#72383D]">
            Size Guide
          </p>

          <h2 className="mt-2 font-serif text-2xl text-[#322D29]">
            {chart.title}
          </h2>

          <p className="mt-2 text-sm text-[#6B625C]">
            Use the measurements below to find your best fit.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#EFE9E1]">
                {chart.headers.map((header) => (
                  <th
                    key={header}
                    className="border border-[#D8D0C8] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[1px] text-[#322D29]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {chart.rows.map((row, index) => (
                <tr key={index}>
                  {row.map((value, valueIndex) => (
                    <td
                      key={valueIndex}
                      className="border border-[#D8D0C8] px-4 py-3 text-sm text-[#6B625C]"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note */}
        <p className="mt-5 text-xs leading-5 text-[#AC9C8D]">
          Measurements are approximate. For the best fit, compare these
          measurements with a garment you already own.
        </p>
      </div>
    </div>
  );
}