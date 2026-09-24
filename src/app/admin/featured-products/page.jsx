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
          key: "title",
          label: "Product",
        },
        {
          key: "category_name",
          label: "Category",
        },
        {
          key: "price",
          label: "Price",
        },
        {
          key: "is_featured",
          label: "Featured",
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
      endpoint="/api/admin/featured-products"
      resultKey="products"
      idKey="item_id"
      editOnly
    />
  );
}