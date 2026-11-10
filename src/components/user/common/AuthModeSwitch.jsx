import Link from "next/link";
import Image from "next/image";

const modes = [
  { id: "login", label: "Sign In", href: "/user/login" },
  { id: "register", label: "Sign Up", href: "/user/register" },
];

export default function AuthModeSwitch({ activeMode, embedded = false }) {
  return (
    <aside
      className={`relative flex w-full items-center overflow-hidden bg-[#292524] ${
        embedded
          ? "h-44 shrink-0 lg:h-full lg:min-h-[620px]"
          : "min-h-[100svh]"
      }`}
    >
      {embedded ? (
        <>
          <Image
            src="/login.jpg"
            alt=""
            fill
            sizes="(max-width: 1023px) 100vw, 40vw"
            priority
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#292524]/35"
          />
        </>
      ) : (
        <>
          <span
            aria-hidden="true"
            className="absolute -left-20 -top-20 h-64 w-64 rotate-45 border-[24px] border-white/[0.06]"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-28 -left-10 h-72 w-72 rotate-45 border-[24px] border-white/[0.06]"
          />
        </>
      )}
      <nav
        aria-label="Account access"
        className={`relative z-10 flex w-full items-center justify-center gap-3 lg:ml-auto lg:w-1/2 lg:flex-col lg:gap-7 lg:py-10 ${
          embedded ? "" : "flex-col py-10"
        }`}
      >
        {modes.map((mode) => {
          const isActive = mode.id === activeMode;

          return (
            <Link
              key={mode.id}
              href={mode.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-12 min-w-28 items-center justify-center text-[11px] font-semibold uppercase tracking-[1.4px] transition lg:w-full ${
                isActive
                  ? "rounded-full bg-white text-[#292524] lg:-ml-5 lg:w-[calc(100%+20px)] lg:rounded-l-full lg:rounded-r-none"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {mode.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
