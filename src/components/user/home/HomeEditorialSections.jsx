import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Heart,
  Headphones,
  PackageCheck,
  Sparkles,
} from "lucide-react";

const styleCategories = [
  {
    name: "Men's",
    href: "/user/men",
    image: "/images/men/01.jpg",
    className: "row-span-2 min-h-[420px] sm:min-h-[500px]",
  },
  {
    name: "Women's",
    href: "/user/women",
    image: "/images/women/05.jpg",
    className: "min-h-[202px] sm:min-h-[242px]",
  },
  {
    name: "Kid's",
    href: "/user/kids",
    image: "/images/kids/02.jpg",
    className: "min-h-[202px] sm:min-h-[242px]",
  },
];

const collectionCards = [
  {
    name: "Women's Collection",
    href: "/user/women",
    image: "/images/women/03.jpg",
    description: "Effortless looks for every day.",
  },
  {
    name: "Men's Collection",
    href: "/user/men",
    image: "/images/men/04.jpg",
    description: "Modern essentials, made to move.",
  },
  {
    name: "Kid's Collection",
    href: "/user/kids",
    image: "/images/kids/3.jpg",
    description: "Comfort and color for little ones.",
  },
];

const storeBenefits = [
  {
    title: "Thoughtful Styles",
    description: "Collections selected for every wardrobe.",
    Icon: Sparkles,
  },
  {
    title: "Easy Ordering",
    description: "A simple, convenient shopping experience.",
    Icon: Heart,
  },
  {
    title: "Order Updates",
    description: "Follow your order from purchase to delivery.",
    Icon: PackageCheck,
  },
  {
    title: "Here to Help",
    description: "Our customer care team is ready to assist.",
    Icon: Headphones,
  },
];

export function FindYourStyle() {
  return (
    <section className="py-8 sm:py-12">
      <div className="mb-5 sm:mb-7">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]">
          Made for your everyday
        </p>
        <h2 className="font-serif text-2xl font-semibold text-[#292524] sm:text-3xl">
          Find Your Style
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {styleCategories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className={`group relative block overflow-hidden bg-[#E8E4DF] ${category.className}`}
          >
            <Image
              src={category.image}
              alt={`${category.name} fashion`}
              fill
              sizes="(max-width: 640px) 50vw, 40vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2 text-white sm:inset-x-6 sm:bottom-6">
              <h3 className="font-serif text-2xl font-medium sm:text-3xl">
                {category.name}
              </h3>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center bg-white text-[#292524] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowUpRight size={17} aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomeEditorialSections() {
  return (
    <>
      <section className="relative my-4 isolate overflow-hidden bg-[#292524] text-white sm:my-8">
        <div className="absolute inset-0">
          <Image
            src="/images/promo/promo2.jpg"
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 1440px) 100vw, 1440px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative mx-auto flex min-h-[300px] max-w-5xl flex-col items-center justify-center px-6 py-14 text-center sm:min-h-[380px]">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/75">
            The Velora edit
          </p>
          <h2 className="max-w-2xl font-serif text-3xl font-medium leading-tight sm:text-5xl">
            Elevate Your Everyday Style
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
            Discover versatile pieces and fresh inspiration for the moments
            that make up your day.
          </p>
          <Link
            href="/user/shop"
            className="mt-7 inline-flex min-h-11 items-center gap-2 bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[1.4px] text-[#292524] transition-colors hover:bg-white/85"
          >
            Explore the Collection
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="my-8 grid grid-cols-2 divide-x divide-y divide-white/20 bg-[#8C939E] text-white sm:my-10 sm:grid-cols-4 sm:divide-y-0">
        {storeBenefits.map(({ title, description, Icon }) => (
          <div
            key={title}
            className="flex min-h-32 flex-col items-center justify-center px-4 py-5 text-center sm:min-h-36 sm:px-5"
          >
            <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
            <h3 className="mt-3 text-[10px] font-semibold uppercase tracking-[1.2px] sm:text-xs">
              {title}
            </h3>
            <p className="mt-1.5 max-w-48 text-[10px] leading-4 text-white/75 sm:text-xs">
              {description}
            </p>
          </div>
        ))}
      </section>

      <section className="py-8 sm:py-12">
        <div className="mb-6 text-center sm:mb-8">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]">
            A little inspiration
          </p>
          <h2 className="font-serif text-2xl font-semibold text-[#292524] sm:text-3xl">
            Style in Motion
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6B625C]">
            Find a look you love and explore the collection.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 sm:gap-5">
          {collectionCards.map((card) => (
            <Link
              key={card.name}
              href={card.href}
              className="group relative block min-h-[280px] overflow-hidden bg-[#E8E4DF] sm:min-h-[360px]"
            >
              <Image
                src={card.image}
                alt={card.name}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 text-white sm:inset-x-6 sm:bottom-6">
                <h3 className="font-serif text-xl font-medium sm:text-2xl">
                  {card.name}
                </h3>
                <p className="mt-1 text-xs text-white/80">{card.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[1.4px]">
                  Explore
                  <ArrowUpRight
                    size={14}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
