import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#322D29] text-white">

      {/* Main Footer */}
      <div className="mx-auto max-w-[1200px] px-[4%] py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
        <Link
  href="/user"
  className="flex items-center gap-3"
>
  <Image
    src="/images/logo/logo.png"
    alt="Velora logo"
    width={70}
    height={70}
    className="h-[70px] w-[70px] object-contain"
  />

  <span className="font-serif text-2xl font-bold tracking-[4px]">
    VELORA
  </span>
</Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-white/65">
              Discover timeless fashion designed to bring confidence,
              comfort, and elegance to every moment.
            </p>

            {/* Social Media */}
            <div className="mt-7 flex items-center gap-3">

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition duration-300 hover:border-[#AC9C8D] hover:bg-[#AC9C8D] hover:text-[#322D29]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    width="20"
                    height="20"
                    x="2"
                    y="2"
                    rx="5"
                    ry="5"
                  />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition duration-300 hover:border-[#AC9C8D] hover:bg-[#AC9C8D] hover:text-[#322D29]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="#"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition duration-300 hover:border-[#AC9C8D] hover:bg-[#AC9C8D] hover:text-[#322D29]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-4-.98L3 20l1-4.8a8.4 8.4 0 0 1-1-4.2A8.5 8.5 0 1 1 21 11.5z" />
                  <path d="M8.5 8.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.4 0 .6.5.8 1.2 1.5 2 2 .2.1.4.2.6 0l.6-.5c.2-.2.4-.2.6-.1l1.7.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.4.2-1 .4-1.5.3-1-.1-2.1-.6-3.3-1.5-1.1-.8-2-1.8-2.6-2.8-.6-1-.8-1.8-.7-2.4.1-.5.3-1.1.8-1.3z" />
                </svg>
              </a>

            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[2px]">
              Shop
            </h3>

            <ul className="space-y-3">

              <li>
                <Link
                  href="/user/shop"
                  className="group flex items-center gap-1 text-sm text-white/65 transition hover:text-[#AC9C8D]"
                >
                  All Products
                  <span className="opacity-0 transition group-hover:opacity-100">
                    ↗
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/user/men"
                  className="group flex items-center gap-1 text-sm text-white/65 transition hover:text-[#AC9C8D]"
                >
                  Men
                  <span className="opacity-0 transition group-hover:opacity-100">
                    ↗
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/user/women"
                  className="group flex items-center gap-1 text-sm text-white/65 transition hover:text-[#AC9C8D]"
                >
                  Women
                  <span className="opacity-0 transition group-hover:opacity-100">
                    ↗
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/user/kids"
                  className="group flex items-center gap-1 text-sm text-white/65 transition hover:text-[#AC9C8D]"
                >
                  Kids
                  <span className="opacity-0 transition group-hover:opacity-100">
                    ↗
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/user/shop?category=new-arrivals"
                  className="group flex items-center gap-1 text-sm text-white/65 transition hover:text-[#AC9C8D]"
                >
                  New Arrivals
                  <span className="opacity-0 transition group-hover:opacity-100">
                    ↗
                  </span>
                </Link>
              </li>

            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[2px]">
              Customer Care
            </h3>

            <ul className="space-y-3">

              <li>
                <Link
                  href="/contact"
                  className="group flex items-center gap-1 text-sm text-white/65 transition hover:text-[#AC9C8D]"
                >
                  Contact Us
                  <span className="opacity-0 transition group-hover:opacity-100">
                    ↗
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/shipping"
                  className="group flex items-center gap-1 text-sm text-white/65 transition hover:text-[#AC9C8D]"
                >
                  Shipping & Delivery
                  <span className="opacity-0 transition group-hover:opacity-100">
                    ↗
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/returns"
                  className="group flex items-center gap-1 text-sm text-white/65 transition hover:text-[#AC9C8D]"
                >
                  Returns & Exchanges
                  <span className="opacity-0 transition group-hover:opacity-100">
                    ↗
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/size-guide"
                  className="group flex items-center gap-1 text-sm text-white/65 transition hover:text-[#AC9C8D]"
                >
                  Size Guide
                  <span className="opacity-0 transition group-hover:opacity-100">
                    ↗
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/faq"
                  className="group flex items-center gap-1 text-sm text-white/65 transition hover:text-[#AC9C8D]"
                >
                  FAQ
                  <span className="opacity-0 transition group-hover:opacity-100">
                    ↗
                  </span>
                </Link>
              </li>

            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[2px]">
              Stay Connected
            </h3>

            <p className="text-sm leading-6 text-white/65">
              Subscribe to receive updates about new collections,
              exclusive offers, and special events.
            </p>

            <div className="mt-5 flex flex-col gap-2">

              <input
                type="email"
                placeholder="Your email address"
                className="h-11 w-full border border-white/20 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#AC9C8D]"
              />

              <button
                type="button"
                className="h-11 w-full bg-[#72383D] px-5 text-sm font-semibold uppercase tracking-wide text-white transition duration-300 hover:bg-[#AC9C8D] hover:text-[#322D29]"
              >
                Subscribe
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">

        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-[4%] py-6 text-center sm:flex-row sm:text-left">

          <p className="text-xs text-white/50">
            © 2026 Velora. All rights reserved.
          </p>

          <div className="flex items-center gap-5">

            <Link
              href="/privacy"
              className="text-xs text-white/50 transition hover:text-[#AC9C8D]"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="text-xs text-white/50 transition hover:text-[#AC9C8D]"
            >
              Terms & Conditions
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}