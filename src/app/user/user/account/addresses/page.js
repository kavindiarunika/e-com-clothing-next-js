
"use client";

import Link from "next/link";
import {
  MapPin,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";

export default function AddressesPage() {
  const addresses = [
    {
      id: 1,
      name: "Chathuni Imasha",
      phone: "+94 77 123 4567",
      address: "123 Main Street",
      city: "Colombo",
      district: "Western Province",
      postalCode: "00100",
      default: true,
    },
  ];

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
            href="/user/account"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#6B625C] hover:text-[#72383D]"
          >
            <ArrowLeft size={15} />
            My Account
          </Link>

        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12 lg:py-16">

        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#72383D]">
              Delivery
            </p>

            <h1 className="font-serif text-4xl sm:text-5xl">
              MY ADDRESSES
            </h1>

          </div>

        </div>

        <div className="grid gap-5 sm:grid-cols-2">

          {addresses.map((address) => (

            <div
              key={address.id}
              className="border border-[#D8D0C8] bg-[#F8F5F1] p-6"
            >

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center bg-[#E3DCD1]">
                    <MapPin size={18} />
                  </div>

                  <div>
                    <h2 className="font-serif text-xl">
                      Home
                    </h2>

                    {address.default && (
                      <span className="text-[10px] font-semibold uppercase tracking-[1px] text-[#547454]">
                        Default Address
                      </span>
                    )}
                  </div>

                </div>

              </div>

              <div className="mt-6 text-sm leading-6 text-[#6B625C]">

                <p className="font-semibold text-[#322D29]">
                  {address.name}
                </p>

                <p className="mt-2">
                  {address.address}
                  <br />
                  {address.city},{" "}
                  {address.district}
                  <br />
                  {address.postalCode}
                </p>

                <p className="mt-2">
                  {address.phone}
                </p>

              </div>

              <div className="mt-6 flex gap-3 border-t border-[#D8D0C8] pt-5">

                <Link
                  href={`/user/account/addresses/edit/${address.id}`}
                  className="flex items-center gap-2 border border-[#D8D0C8] px-4 py-2 text-xs font-semibold uppercase tracking-[1px] hover:border-[#72383D]"
                >
                  <Pencil size={14} />
                  Edit
                </Link>

                <button
                  type="button"
                  className="flex items-center gap-2 border border-[#D8D0C8] px-4 py-2 text-xs font-semibold uppercase tracking-[1px] text-[#8B817A] hover:border-[#72383D] hover:text-[#72383D]"
                >
                  <Trash2 size={14} />
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}

