"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function FeaturedProductsPage() {
  return (
    <AdminCrudPage
      title="Featured Products"
      description="Manage products displayed as featured."
      addLabel="Add Featured Product"
      fields={[
        {
          key: "product",
          label: "Product",
        },
        {
          key: "category",
          label: "Category",
        },
        {
          key: "position",
          label: "Position",
        },
        {
          key: "status",
          label: "Status",
        },
      ]}
      initialData={[
        {
          id: 1,
          product: "Premium Cotton T-Shirt",
          category: "Men",
          position: 1,
          status: "Active",
        },
        {
          id: 2,
          product: "Elegant Summer Dress",
          category: "Women",
          position: 2,
          status: "Active",
        },
      ]}
    />
  );
}