"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  Heart,
  MapPin,
  RotateCcw,
  Bell,
  LogOut,
  Save,
  Loader2,
} from "lucide-react";

const notifications = [
  {
    notification_id: 1,
    title: "Order Shipped",
    message: "Your order #1001 has been shipped.",
    is_read: false,
  },
];

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    whatsapp_number: "",
    postal_code: "",
    address_line1: "",
    address_line2: "",
    city: "",
    district: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
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
          throw new Error(result.message || "Unable to load your profile.");
        }

        setProfile((current) => ({ ...current, ...result.data }));
      } catch (error) {
        if (!controller.signal.aborted) {
          setProfileError(error.message || "Unable to load your profile.");
        }
      } finally {
        if (!controller.signal.aborted) setProfileLoading(false);
      }
    }

    void loadProfile();
    return () => controller.abort();
  }, [router]);

  const handleLogout = () => {
    void fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("velora-user-session");
    router.replace("/user/login");
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setProfileError("");
    setProfileMessage("");
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save your profile.");
      }

      setProfile((current) => ({ ...current, ...result.data }));
      setProfileMessage(result.message);
    } catch (error) {
      setProfileError(error.message || "Unable to save your profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const unreadNotifications = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">
      {/* Header */}
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

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-6 border-b border-[#322D29]/10 pb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#72383D]">
              My Account
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Your account"}
            </h2>

            <p className="mt-1 text-sm text-[#322D29]/60">
              {profile.email}
            </p>
          </div>

          <nav className="space-y-1">
            <AccountLink
              href="/user/account"
              icon={<User size={18} />}
              label="Profile"
              active
            />

            <AccountLink
              href="/user/account/orders"
              icon={<Package size={18} />}
              label="Orders"
            />

            <AccountLink
              href="/user/account/wishlist"
              icon={<Heart size={18} />}
              label="Wishlist"
            />

        

            <AccountLink
              href="/user/account/returns"
              icon={<RotateCcw size={18} />}
              label="Returns & Exchanges"
            />

            <AccountLink
              href="/user/account/notifications"
              icon={<Bell size={18} />}
              label="Notifications"
              badge={unreadNotifications}
            />

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </aside>

        {/* Main */}
        <section>
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.2em] text-[#72383D]">
              My Account
            </p>

            <h1 className="mt-2 text-4xl font-semibold">
              Welcome back{profile.first_name ? `, ${profile.first_name}` : ""}
            </h1>

            <p className="mt-2 text-[#322D29]/60">
              Manage your orders, returns and account information.
            </p>
          </div>

          {/* Profile */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Profile</h2>
              <p className="mt-1 text-sm text-[#322D29]/60">
                Update your personal and contact information.
              </p>
            </div>

            {profileError && (
              <p role="alert" className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {profileError}
              </p>
            )}

            {profileMessage && (
              <p role="status" className="mb-5 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                {profileMessage}
              </p>
            )}

            {profileLoading ? (
              <p className="py-4 text-sm text-[#322D29]/60">Loading profile...</p>
            ) : (
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <ProfileInput label="First name" name="first_name" value={profile.first_name} onChange={handleProfileChange} required maxLength={100} />
                  <ProfileInput label="Last name" name="last_name" value={profile.last_name} onChange={handleProfileChange} maxLength={100} />
                  <ProfileInput label="Email" name="email" type="email" value={profile.email} onChange={handleProfileChange} required maxLength={150} />
                  <ProfileInput label="Phone" name="phone" type="tel" value={profile.phone} onChange={handleProfileChange} maxLength={20} />
                  <ProfileInput label="WhatsApp number" name="whatsapp_number" type="tel" value={profile.whatsapp_number} onChange={handleProfileChange} maxLength={20} />
                  <ProfileInput label="Postal code" name="postal_code" value={profile.postal_code} onChange={handleProfileChange} maxLength={20} />
                  <ProfileInput label="Address line 1" name="address_line1" value={profile.address_line1} onChange={handleProfileChange} maxLength={255} />
                  <ProfileInput label="Address line 2" name="address_line2" value={profile.address_line2} onChange={handleProfileChange} maxLength={255} />
                  <ProfileInput label="City" name="city" value={profile.city} onChange={handleProfileChange} maxLength={100} />
                  <ProfileInput label="District" name="district" value={profile.district} onChange={handleProfileChange} maxLength={100} />
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex h-11 items-center justify-center gap-2 bg-[#322D29] px-5 text-sm font-medium text-white transition hover:bg-[#72383D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {profileSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {profileSaving ? "Saving..." : "Save profile"}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function AccountLink({ href, icon, label, active, badge }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
        active
          ? "bg-[#72383D] text-white"
          : "text-[#322D29] hover:bg-[#EFE9E1]"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>

      {badge > 0 && (
        <span className="rounded-full bg-[#AC9C8D] px-2 py-0.5 text-xs">
          {badge}
        </span>
      )}
    </Link>
  );
}

function ProfileInput({ label, name, value, onChange, type = "text", ...inputProps }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#322D29]/60">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        className="h-11 w-full border border-[#D8D0C8] bg-white px-3 text-sm text-[#322D29] outline-none focus:border-[#72383D]"
        {...inputProps}
      />
    </div>
  );
}