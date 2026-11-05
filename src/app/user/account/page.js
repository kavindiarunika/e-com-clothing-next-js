"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";

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
      window.dispatchEvent(
        new CustomEvent("velora-profile-updated", { detail: result.data })
      );
      setProfileMessage(result.message);
    } catch (error) {
      setProfileError(error.message || "Unable to save your profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
       
        <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          Welcome back{profile.first_name ? `, ${profile.first_name}` : ""}
        </h1>
       
      </header>

      <section className="rounded-2xl border border-[#292524]/5 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7">
        <div className="mb-6 border-b border-[#292524]/10 pb-5">
          <h2 className="text-xl font-semibold sm:text-2xl">Profile details</h2>
         
        </div>

        {profileError && (
          <p role="alert" className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {profileError}
          </p>
        )}

        {profileMessage && (
          <p role="status" className="mb-5 border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800">
            {profileMessage}
          </p>
        )}

        {profileLoading ? (
          <div role="status" className="space-y-4 py-2">
            <span className="sr-only">Loading profile details</span>
            <div className="h-5 w-36 animate-pulse bg-[#292524]/10" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-11 animate-pulse bg-[#292524]/5" />
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleProfileSave} className="space-y-7">
            <fieldset className="space-y-4">
              <legend className="mb-4 text-sm font-semibold">Personal information</legend>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                <ProfileInput label="First name" name="first_name" value={profile.first_name} onChange={handleProfileChange} required maxLength={100} autoComplete="given-name" />
                <ProfileInput label="Last name" name="last_name" value={profile.last_name} onChange={handleProfileChange} maxLength={100} autoComplete="family-name" />
              </div>
            </fieldset>

            <fieldset className="space-y-4 border-t border-[#292524]/10 pt-6">
              <legend className="mb-4 text-sm font-semibold">Contact information</legend>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                <ProfileInput label="Email" name="email" type="email" value={profile.email} onChange={handleProfileChange} required maxLength={150} autoComplete="email" />
                <ProfileInput label="Phone" name="phone" type="tel" value={profile.phone} onChange={handleProfileChange} maxLength={20} autoComplete="tel" />
                <ProfileInput label="WhatsApp number" name="whatsapp_number" type="tel" value={profile.whatsapp_number} onChange={handleProfileChange} maxLength={20} autoComplete="tel" />
              </div>
            </fieldset>

            <fieldset className="space-y-4 border-t border-[#292524]/10 pt-6">
              <legend className="mb-4 text-sm font-semibold">Delivery address</legend>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                <ProfileInput label="Address line 1" name="address_line1" value={profile.address_line1} onChange={handleProfileChange} maxLength={255} autoComplete="address-line1" />
                <ProfileInput label="Address line 2" name="address_line2" value={profile.address_line2} onChange={handleProfileChange} maxLength={255} autoComplete="address-line2" />
                <ProfileInput label="City" name="city" value={profile.city} onChange={handleProfileChange} maxLength={100} autoComplete="address-level2" />
                <ProfileInput label="District" name="district" value={profile.district} onChange={handleProfileChange} maxLength={100} />
                <ProfileInput label="Postal code" name="postal_code" value={profile.postal_code} onChange={handleProfileChange} maxLength={20} autoComplete="postal-code" />
              </div>
            </fieldset>

            <div className="border-t border-[#292524]/10 pt-5">
              <button
                type="submit"
                disabled={profileSaving}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-[#292524] px-5 text-sm font-medium text-white transition hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {profileSaving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
                {profileSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function ProfileInput({ label, name, value, onChange, type = "text", ...inputProps }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-xs font-medium text-[#292524]/70">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        className="h-11 w-full rounded-md border border-[#E5E5E5] bg-white px-3 text-sm text-[#292524] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
        {...inputProps}
      />
    </div>
  );
}