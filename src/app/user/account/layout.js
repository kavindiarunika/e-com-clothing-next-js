"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Bell,
  Heart,
  LogOut,
  Package,
  RotateCcw,
  User,
} from "lucide-react";

function subscribeToSession(callback) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSessionSnapshot() {
  return localStorage.getItem("velora-user-session") === "true";
}

export default function AccountLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState({ first_name: "", last_name: "", email: "" });
  const [profileError, setProfileError] = useState("");
  const authorized = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    () => null
  );

  useEffect(() => {
    if (authorized === false) {
      router.replace("/user/login");
      return;
    }

    if (authorized !== true) return;

    const controller = new AbortController();
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          if (response.status === 401) {
            localStorage.removeItem("velora-user-session");
            router.replace("/user/login");
          }
          throw new Error(result.message || "Unable to load your account.");
        }
        setProfile(result.data);
        setProfileError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          setProfileError(error.message || "Unable to load your account.");
        }
      }
    };

    const handleProfileUpdate = (event) => {
      if (event.detail) setProfile((current) => ({ ...current, ...event.detail }));
    };

    window.addEventListener("velora-profile-updated", handleProfileUpdate);
    void loadProfile();
    return () => {
      controller.abort();
      window.removeEventListener("velora-profile-updated", handleProfileUpdate);
    };
  }, [authorized, router]);

  if (authorized !== true) return null;

  const accountLinks = [
    { href: "/user/account", label: "Profile", icon: User, active: pathname === "/user/account" },
    { href: "/user/account/orders", label: "Orders", icon: Package, active: pathname.startsWith("/user/account/orders") },
    { href: "/user/account/wishlist", label: "Wishlist", icon: Heart, active: pathname === "/user/account/wishlist" },
    { href: "/user/account/returns", label: "Returns & Exchanges", icon: RotateCcw, active: pathname.startsWith("/user/account/returns") },
    { href: "/user/account/notifications", label: "Notifications", icon: Bell, active: pathname === "/user/account/notifications" },
  ];

  const handleLogout = () => {
    void fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("velora-user-session");
    router.replace("/user/login");
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#292524]">

      <div className="mx-auto grid max-w-7xl items-start gap-5 px-4 py-6 sm:gap-8 sm:px-5 sm:py-10 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5 lg:sticky lg:top-6">
          <div className="mb-4 border-b border-[#292524]/10 pb-4 sm:mb-6 sm:pb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-primary)]">
              My Account
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Your account"}
            </h2>
            <p className="mt-1 break-all text-sm text-[#292524]/60">
              {profile.email}
            </p>
            {profileError && (
              <p role="status" className="mt-2 text-xs text-red-700">
                {profileError}
              </p>
            )}
          </div>

          <nav
            aria-label="Account navigation"
            className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {accountLinks.map(({ href, label, icon: Icon, active }) => (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition sm:gap-3 sm:px-4 lg:w-full ${
                  active
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[#292524] hover:bg-[#FFFFFF]"
                }`}
              >
                <Icon size={18} className="shrink-0" aria-hidden="true" />
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50 sm:gap-3 sm:px-4 lg:w-full"
            >
              <LogOut size={18} className="shrink-0" aria-hidden="true" />
              Logout
            </button>
          </nav>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}