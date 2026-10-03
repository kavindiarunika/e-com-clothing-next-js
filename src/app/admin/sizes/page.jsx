"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function SizesPage() {
  return (
    <AdminCrudPage
      title="Sizes"
      description="Manage clothing sizes."
      addLabel="Add Size"
      pageClassName="product-style-crud-page"
      fields={[
        {
          key: "name",
          label: "Size",
        },
      ]}
      initialData={[
        {
          id: 1,
          name: "XS",
          description: "Extra Small",
        },
        {
          id: 2,
          name: "S",
          description: "Small",
        },
        {
          id: 3,
          name: "M",
          description: "Medium",
        },
        {
          id: 4,
          name: "L",
          description: "Large",
        },
        {
          id: 5,
          name: "XL",
          description: "Extra Large",
        },
      ]}
      endpoint="/api/admin/sizes"
      resultKey="sizes"
      idKey="size_id"
    />
  );
}