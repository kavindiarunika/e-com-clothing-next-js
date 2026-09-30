"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

const initialAddress = {
  name: "Chathuni Imasha",
  phone: "+94 77 123 4567",
  address: "123 Main Street",
  city: "Colombo",
  district: "Western Province",
  postalCode: "00100",
};

export default function EditAddressPage() {
  const [address, setAddress] = useState(initialAddress);
  const [saved, setSaved] = useState(false);

  const handleChange = (event) => {
    const { id, value } = event.target;

    setAddress((currentAddress) => ({
      ...currentAddress,
      [id]: value,
    }));
    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">
      <header className="border-b border-[#D8D0C8]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link
            href="/user"
            className="font-serif text-3xl tracking-[4px]"
          >
            VELORA
          </Link>

          <Link
            href="/user/account/addresses"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#6B625C] transition hover:text-[#72383D]"
          >
            <ArrowLeft size={15} />
            Back to Addresses
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="mb-10">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
            Delivery Details
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl">
            EDIT ADDRESS
          </h1>

          <div className="mt-5 h-px w-12 bg-[#72383D]" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-[#D8D0C8] bg-[#F8F5F1]"
        >
          <div className="border-b border-[#D8D0C8] p-6 sm:p-8">
            <h2 className="font-serif text-2xl">Home Address</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B625C]">
              Update the details used for your deliveries.
            </p>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            <label className="text-xs font-semibold uppercase tracking-[1.5px]">
              Full Name
              <input
                id="name"
                value={address.name}
                onChange={handleChange}
                required
                className="mt-2 h-11 w-full border border-[#D8D0C8] bg-white px-4 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#72383D]"
              />
            </label>

            <label className="text-xs font-semibold uppercase tracking-[1.5px]">
              Phone
              <input
                id="phone"
                type="tel"
                value={address.phone}
                onChange={handleChange}
                required
                className="mt-2 h-11 w-full border border-[#D8D0C8] bg-white px-4 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#72383D]"
              />
            </label>

            <label className="text-xs font-semibold uppercase tracking-[1.5px] sm:col-span-2">
              Street Address
              <input
                id="address"
                value={address.address}
                onChange={handleChange}
                required
                className="mt-2 h-11 w-full border border-[#D8D0C8] bg-white px-4 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#72383D]"
              />
            </label>

            <label className="text-xs font-semibold uppercase tracking-[1.5px]">
              City
              <input
                id="city"
                value={address.city}
                onChange={handleChange}
                required
                className="mt-2 h-11 w-full border border-[#D8D0C8] bg-white px-4 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#72383D]"
              />
            </label>

            <label className="text-xs font-semibold uppercase tracking-[1.5px]">
              District
              <input
                id="district"
                value={address.district}
                onChange={handleChange}
                required
                className="mt-2 h-11 w-full border border-[#D8D0C8] bg-white px-4 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#72383D]"
              />
            </label>

            <label className="text-xs font-semibold uppercase tracking-[1.5px]">
              Postal Code
              <input
                id="postalCode"
                value={address.postalCode}
                onChange={handleChange}
                required
                className="mt-2 h-11 w-full border border-[#D8D0C8] bg-white px-4 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#72383D]"
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#D8D0C8] p-6 sm:flex-row sm:justify-end sm:p-8">
            <Link
              href="/user/account/addresses"
              className="flex h-11 items-center justify-center border border-[#D8D0C8] px-6 text-xs font-semibold uppercase tracking-[1.5px] text-[#6B625C] hover:border-[#322D29] hover:text-[#322D29]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="flex h-11 items-center justify-center gap-2 bg-[#322D29] px-6 text-xs font-semibold uppercase tracking-[1.5px] text-white hover:bg-[#72383D]"
            >
              {saved && <Check size={15} />}
              {saved ? "Changes Saved" : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
