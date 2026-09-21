"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function CouponsPage() {
  return (
    <AdminCrudPage
      title="Coupons"
      description="Create and manage discount coupons."
      addLabel="Add Coupon"
      fields={[
        {
          key: "code",
          label: "Coupon Code",
        },
        {
          key: "discount",
          label: "Discount",
        },
        {
          key: "expiry",
          label: "Expiry",
        },
        {
          key: "status",
          label: "Status",
        },
      ]}
      initialData={[
        {
          id: 1,
          code: "WELCOME10",
          discount: "10%",
          expiry: "2026-12-31",
          status: "Active",
        },
        {
          id: 2,
          code: "FASHION20",
          discount: "20%",
          expiry: "2026-11-30",
          status: "Active",
        },
      ]}
    />
  );
}