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
    <div>
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.2em] text-[#72383D]">
              My Account
            </p>

            <h1 className="mt-2 text-4xl font-semibold">
              Welcome back{profile.first_name ? `, ${profile.first_name}` : ""}
            </h1>

            
          </div>

          {/* Profile */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Profile</h2>
              
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
    </div>
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