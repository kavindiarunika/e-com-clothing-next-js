"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function InventoryPage() {
  return (
    <AdminCrudPage
      title="Inventory"
      description="Monitor product stock."
      addLabel="Add Stock"
      fields={[
        {
          key: "product",
          label: "Product",
        },
        {
          key: "sku",
          label: "SKU",
        },
        {
          key: "stock",
          label: "Stock",
        },
        {
          key: "status",
          label: "Status",
        },
      ]}
      initialData={[
        {
          id: 1,
          product: "Cotton T-Shirt",
          sku: "TSH-001",
          stock: 35,
          status: "In Stock",
        },
        {
          id: 2,
          product: "Denim Jeans",
          sku: "JNS-001",
          stock: 18,
          status: "In Stock",
        },
        {
          id: 3,
          product: "Summer Dress",
          sku: "DRS-001",
          stock: 7,
          status: "Low Stock",
        },
        {
          id: 4,
          product: "Classic Shirt",
          sku: "SHT-001",
          stock: 0,
          status: "Out of Stock",
        },
      ]}
    />
  );
}