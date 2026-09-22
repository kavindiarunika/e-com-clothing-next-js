"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function ReviewsPage() {
  return (
    <AdminCrudPage
      title="Reviews"
      description="Manage customer product reviews."
      addLabel="Add Review"
      fields={[
        {
          key: "customer",
          label: "Customer",
        },
        {
          key: "product",
          label: "Product",
        },
        {
          key: "rating",
          label: "Rating",
        },
        {
          key: "status",
          label: "Status",
        },
      ]}
      initialData={[
        {
          id: 1,
          customer: "Chamodi",
          product: "Cotton T-Shirt",
          rating: "5/5",
          status: "Approved",
        },
        {
          id: 2,
          customer: "Nimali",
          product: "Summer Dress",
          rating: "4/5",
          status: "Pending",
        },
      ]}
    />
  );
}