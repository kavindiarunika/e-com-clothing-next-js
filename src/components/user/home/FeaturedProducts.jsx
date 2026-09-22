import ProductCard from "../product/ProductCard";
import products from "@/data/products";

const featuredProducts = products.slice(0, 4);

export default function FeaturedProducts() {
  return (
    <section className="bg-[#F8F5F2] px-[4%] py-20 md:py-24">
      <div className="mx-auto max-w-[1200px]">

        {/* Heading */}
        <div className="mb-10 text-center md:mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[4px] text-[#AC9C8D]">
            Curated For You
          </p>

          <h2 className="font-serif text-3xl font-medium tracking-wide text-[#322D29] sm:text-4xl md:text-5xl">
            Featured Collection
          </h2>

          <div className="mx-auto mt-5 h-px w-12 bg-[#72383D]" />

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#6B625D]">
            Discover our carefully selected pieces, designed to bring
            effortless elegance to your everyday wardrobe.
          </p>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {/* View All */}
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