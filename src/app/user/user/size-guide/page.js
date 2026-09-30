
"use client";

import Link from "next/link";
import { ArrowLeft, Ruler } from "lucide-react";

export default function SizeGuidePage() {
  const sizes = [
    {
      size: "XS",
      chest: "32–34",
      waist: "26–28",
      hip: "34–36",
    },
    {
      size: "S",
      chest: "34–36",
      waist: "28–30",
      hip: "36–38",
    },
    {
      size: "M",
      chest: "36–38",
      waist: "30–32",
      hip: "38–40",
    },
    {
      size: "L",
      chest: "38–40",
      waist: "32–34",
      hip: "40–42",
    },
    {
      size: "XL",
      chest: "40–42",
      waist: "34–36",
      hip: "42–44",
    },
  ];

  return (
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">

      {/* Header */}
      <header className="bg-[#322D29]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">

          <Link
            href="/"
            className="text-2xl font-semibold tracking-[0.25em] text-[#EFE9E1]"
          >
            VELORA
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#EFE9E1] transition hover:text-[#AC9C8D]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-4xl px-5 py-16">

        {/* Hero */}
        <div className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#72383D] shadow-sm">
            <Ruler size={25} />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#72383D]">
            Find Your Fit
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Size Guide
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#322D29]/60">
            Use the measurements below as a general guide when choosing
            your size. Product-specific measurements may vary.
          </p>

        </div>

        {/* Measurement Guide */}
        <div className="mt-12 rounded-3xl bg-white p-6 shadow-sm sm:p-8">

          <h2 className="text-2xl font-semibold">
            Clothing Size Chart
          </h2>

          <p className="mt-2 text-sm text-[#322D29]/55">
            Measurements are shown in inches.
          </p>

          <div className="mt-7 overflow-x-auto">

            <table className="w-full min-w-[600px] border-collapse text-sm">

              <thead>
                <tr className="bg-[#322D29] text-white">

                  <th className="rounded-l-xl px-5 py-4 text-left font-medium">
                    Size
                  </th>

                  <th className="px-5 py-4 text-left font-medium">
                    Chest
                  </th>

                  <th className="px-5 py-4 text-left font-medium">
                    Waist
                  </th>

                  <th className="rounded-r-xl px-5 py-4 text-left font-medium">
                    Hip
                  </th>

                </tr>
              </thead>

              <tbody>
                {sizes.map((item) => (
                  <tr
                    key={item.size}
                    className="border-b border-[#322D29]/10 last:border-0"
                  >

                    <td className="px-5 py-5 font-semibold">
                      {item.size}
                    </td>

                    <td className="px-5 py-5 text-[#322D29]/65">
                      {item.chest} in
                    </td>

                    <td className="px-5 py-5 text-[#322D29]/65">
                      {item.waist} in
                    </td>

                    <td className="px-5 py-5 text-[#322D29]/65">
                      {item.hip} in
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>

        </div>

        {/* How to Measure */}
        <div className="mt-6 rounded-3xl bg-white p-7 shadow-sm sm:p-9">

          <h2 className="text-2xl font-semibold">
            How to Measure
          </h2>

          <div className="mt-6 space-y-6">

            <MeasureItem
              number="01"
              title="Chest"
              text="Measure around the fullest part of your chest while keeping the measuring tape horizontal."
            />

            <MeasureItem
              number="02"
              title="Waist"
              text="Measure around the narrowest part of your natural waist without pulling the tape too tightly."
            />

            <MeasureItem
              number="03"
              title="Hip"
              text="Measure around the fullest part of your hips while standing naturally."
            />

          </div>

        </div>

        {/* Tip */}
        <div className="mt-6 rounded-2xl border border-[#72383D]/15 bg-[#72383D]/5 p-6">

          <h3 className="font-semibold">
            Fit Tip
          </h3>

          <p className="mt-2 text-sm leading-7 text-[#322D29]/65">
            For the best fit, compare your measurements with the product
            specific size information available on each product page.
            If you are between two sizes, check the individual product
            description before making your selection.
          </p>

        </div>

      </section>
    </main>
  );
}

function MeasureItem({ number, title, text }) {
  return (
    <div className="flex gap-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFE9E1] text-xs font-semibold text-[#72383D]">
        {number}
      </div>

      <div>
        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-[#322D29]/60">
          {text}
        </p>
      </div>

    </div>
  );
}

