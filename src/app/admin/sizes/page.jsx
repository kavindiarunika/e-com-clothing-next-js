"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function SizesPage() {
  return (
    <AdminCrudPage
      title="Sizes"
      description="Manage clothing sizes."
      addLabel="Add Size"
      fields={[
        {
          key: "name",
          label: "Size",
        },
        {
          key: "status",
          label: "Status",
        },
      ]}
      initialData={[
        {
          id: 1,
          name: "XS",
          description: "Extra Small",
          status: "Active",
        },
        {
          id: 2,
          name: "S",
          description: "Small",
          status: "Active",
        },
        {
          id: 3,
          name: "M",
          description: "Medium",
          status: "Active",
        },
        {
          id: 4,
          name: "L",
          description: "Large",
          status: "Active",
        },
        {
          id: 5,
          name: "XL",
          description: "Extra Large",
          status: "Active",
        },
      ]}
      endpoint="/api/admin/sizes"
      resultKey="sizes"
      idKey="size_id"
    />
  );
}