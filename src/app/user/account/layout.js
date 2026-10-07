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
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">
      <header className="border-b border-[#322D29]/10 bg-[#322D29]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link
            href="/user"
            className="text-2xl font-semibold tracking-[0.25em] text-[#EFE9E1]"
          >
            VELORA
          </Link>
          <Link
            href="/user/shop"
            className="rounded-full border border-[#EFE9E1]/40 px-5 py-2 text-sm text-[#EFE9E1] transition hover:bg-[#EFE9E1] hover:text-[#322D29]"
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl items-start gap-8 px-5 py-10 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <div className="mb-6 border-b border-[#322D29]/10 pb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#72383D]">
              My Account
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Your account"}
            </h2>
            <p className="mt-1 break-all text-sm text-[#322D29]/60">
              {profile.email}
            </p>
            {profileError && (
              <p role="status" className="mt-2 text-xs text-red-700">
                {profileError}
              </p>
            )}
          </div>

          <nav aria-label="Account navigation" className="space-y-1">
            {accountLinks.map(({ href, label, icon: Icon, active }) => (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-[#72383D] text-white"
                    : "text-[#322D29] hover:bg-[#EFE9E1]"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}