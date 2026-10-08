"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, MessageCircle } from "lucide-react";

const whatsappNumber = "94774547033";
const whatsappMessage = encodeURIComponent(
  "Hello, I have a question about Velora."
);

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);
  const showScrollTop = scrollProgress > 0.04;

  const hideFloatingActions =
    pathname === "/user/login" ||
    pathname === "/user/register" ||
    pathname === "/user/forgot-password" ||
    pathname.startsWith("/user/account");

  useEffect(() => {
    if (hideFloatingActions) return;

    const updateScrollState = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0
        ? window.scrollY / scrollableHeight
        : 0;

      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollState);
  }, [hideFloatingActions]);

  if (hideFloatingActions) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2.5">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={`Back to top, ${Math.round(scrollProgress * 100)}% scrolled`}
        title="Back to top"
        aria-hidden={!showScrollTop}
        tabIndex={showScrollTop ? 0 : -1}
        className={`relative flex h-13 w-13 items-center justify-center rounded-full bg-[#322D29] text-[#F5F0E9] shadow-[0_8px_24px_rgba(50,45,41,0.25)] transition-all duration-500 motion-reduce:transition-none hover:-translate-y-0.5 hover:bg-[#443B35] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#AC9C8D] ${
          showScrollTop
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-90 opacity-0"
        }`}
      >
        <svg
          aria-hidden="true"
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 48 48"
        >
          <circle
            cx="24"
            cy="24"
            r="21"
            fill="none"
            stroke="rgba(197,181,164,0.22)"
            strokeWidth="1.5"
          />
          <circle
            cx="24"
            cy="24"
            r="21"
            fill="none"
            stroke="#C5B5A4"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 21}
            strokeDashoffset={2 * Math.PI * 21 * (1 - scrollProgress)}
          />
        </svg>
        <ArrowUp size={18} strokeWidth={1.8} aria-hidden="true" />
      </button>

      <a
        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Velora on WhatsApp"
        className="group inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#AC9C8D]/55 bg-[#322D29] text-white shadow-[0_10px_30px_rgba(50,45,41,0.28)] transition duration-300 hover:-translate-y-1 hover:border-[#AC9C8D] hover:bg-[#443B35] hover:shadow-[0_14px_34px_rgba(50,45,41,0.34)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#AC9C8D]"
      >
        <span className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] transition-colors duration-300 group-hover:bg-[#25D366]/15">
          <MessageCircle size={18} strokeWidth={2} aria-hidden="true" />
        </span>
      </a>
    </div>
  );
}