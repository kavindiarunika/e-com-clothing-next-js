"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function CategoriesPage() {
  return (
    <AdminCrudPage
      title="Categories"
      description="Manage product categories."
      addLabel="Add Category"
      fields={[
        {
          key: "name",
          label: "Category Name",
        },
        {
          key: "description",
          label: "Description",
        },
        {
          key: "status",
          label: "Status",
        },
      ]}
      initialData={[
        {
          id: 1,
          name: "Men",
          description: "Men's clothing",
          status: "Active",
        },
        {
          id: 2,
          name: "Women",
          description: "Women's clothing",
          status: "Active",
        },
        {
          id: 3,
          name: "Kids",
          description: "Kids clothing",
          status: "Active",
        },
      ]}
    />
  );
}