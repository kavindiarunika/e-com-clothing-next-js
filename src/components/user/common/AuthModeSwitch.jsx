import Link from "next/link";

const modes = [
  { id: "login", label: "Sign In", href: "/user/login" },
  { id: "register", label: "Sign Up", href: "/user/register" },
];

export default function AuthModeSwitch({ activeMode }) {
  return (
    <>
      <nav aria-label="Account access" className="mb-6 flex justify-end lg:hidden">
        <div className="inline-flex items-center gap-1 border border-[#E5E5E5] bg-[#F5F5F5] p-1">
          {modes.map((mode) => {
            const isActive = mode.id === activeMode;

            return (
              <Link
                key={mode.id}
                href={mode.href}
                aria-current={isActive ? "page" : undefined}
                className={`px-4 py-2 text-[10px] font-semibold uppercase tracking-[1.2px] transition ${
                  isActive
                    ? "bg-[#292524] text-white"
                    : "text-[#6B625C] hover:bg-white hover:text-[#292524]"
                }`}
              >
                {mode.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <nav
        aria-label="Account access"
        className="relative hidden h-[320px] w-[88px] shrink-0 flex-col items-center justify-center gap-7 overflow-hidden bg-[#292524] lg:flex"
      >
        <span
          aria-hidden="true"
          className="absolute -left-12 top-8 h-36 w-36 rotate-45 border-[12px] border-white/10"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-16 -right-12 h-40 w-40 rotate-45 border-[12px] border-white/10"
        />
        {modes.map((mode) => {
          const isActive = mode.id === activeMode;

          return (
            <Link
              key={mode.id}
              href={mode.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative z-10 flex min-h-11 w-full items-center justify-center text-[10px] font-semibold uppercase tracking-[1px] transition ${
                isActive
                  ? "-ml-5 w-[calc(100%+20px)] rounded-l-full bg-white text-[#292524]"
                  : "text-white/75 hover:text-white"
              }`}
            >
              {mode.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
