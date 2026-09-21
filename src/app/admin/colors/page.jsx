"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function ColorsPage() {
  return (
    <AdminCrudPage
      title="Colors"
      description="Manage available product colors."
      addLabel="Add Color"
      fields={[
        {
          key: "name",
          label: "Color Name",
        },
        {
          key: "code",
          label: "Color Code",
        },
        {
          key: "status",
          label: "Status",
        },
      ]}
      initialData={[
        {
          id: 1,
          name: "Black",
          code: "#000000",
          status: "Active",
        },
        {
          id: 2,
          name: "White",
          code: "#FFFFFF",
          status: "Active",
        },
        {
          id: 3,
          name: "Red",
          code: "#B42318",
          status: "Active",
        },
        {
          id: 4,
          name: "Blue",
          code: "#2563EB",
          status: "Active",
        },
      ]}
    />
  );
}