import Link from "next/link";
import ProductCard from "../product/ProductCard";
import products from "@/data/products";

const newArrivals = products.slice(0, 4);

export default function NewArrivals() {
  return (
    <section className="bg-[#EFE9E1] px-[4%] py-20 md:py-24">
      <div className="mx-auto max-w-[1200px]">

        {/* Heading */}
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end md:mb-14">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[4px] text-[#AC9C8D]">
              Just In
            </p>

            <h2 className="font-serif text-3xl font-medium tracking-wide text-[#322D29] sm:text-4xl md:text-5xl">
              New Arrivals
            </h2>

            <div className="mt-5 h-px w-12 bg-[#72383D]" />
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {/* View All Products Button */}
        <div className="mt-12 text-center">
          <a
            href="/user/shop"
            className="inline-flex items-center gap-3 border border-[#72383D] px-7 py-3.5 text-xs font-semibold uppercase tracking-[1.5px] text-[#72383D] transition duration-300 hover:bg-[#72383D] hover:text-white"
          >
            View All Products
            <span>→</span>
          </a>
        </div>

      </div>
    </section>
  );
}