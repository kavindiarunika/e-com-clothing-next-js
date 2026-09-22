import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    name: "Men",
    image: "/images/categories/velora-hero4.jpg",
    href: "/user/men",
  },
  {
    name: "Women",
    image: "/images/categories/velora-hero3.jpg",
    href: "/user/women",
  },
  {
    name: "Kids",
    image: "/images/categories/kids-tshirt1.webp",
    href: "/user/kids",
  },
];

export default function CategorySection() {
  return (
    <section className="bg-[#EFE9E1] px-[4%] py-20 md:py-24">
      <div className="mx-auto max-w-[1200px]">

        {/* Section Heading */}
        <div className="mb-10 text-center md:mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[4px] text-[#AC9C8D]">
            Explore Our Collection
          </p>

          <h2 className="font-serif text-3xl font-medium tracking-wide text-[#322D29] sm:text-4xl md:text-5xl">
            Shop by Category
          </h2>

          <div className="mx-auto mt-5 h-px w-12 bg-[#72383D]" />
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative block h-[420px] overflow-hidden bg-[#D8CEC5] sm:h-[450px]"
            >
              {/* Image */}
              <Image
                src={category.image}
                alt={`${category.name} fashion`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-105"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#322D29]/80 via-[#322D29]/20 to-transparent transition duration-500 group-hover:from-[#322D29]/90" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-8">
                <p className="mb-2 text-[10px] uppercase tracking-[3px] text-[#AC9C8D]">
                  Discover
                </p>

                <h3 className="font-serif text-3xl italic md:text-4xl">
                  {category.name}
                </h3>

                <div className="mt-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[1.5px]">
                  <span>Shop Collection</span>

                  <span className="transition-transform duration-300 group-hover:translate-x-2">
                    →
                  </span>
                </div>
              </div>

              {/* Top Border */}
              <div className="absolute left-5 right-5 top-5 h-px bg-white/30 opacity-0 transition duration-500 group-hover:opacity-100" />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}