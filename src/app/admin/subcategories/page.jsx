"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function SubcategoriesPage() {
  return (
    <AdminCrudPage
      title="Subcategories"
      description="Manage product subcategories."
      addLabel="Add Subcategory"
      fields={[
        {
          key: "name",
          label: "Subcategory",
        },
        {
          key: "category",
          label: "Category",
        },
        {
          key: "status",
          label: "Status",
        },
      ]}
      initialData={[
        {
          id: 1,
          name: "T-Shirts",
          category: "Men",
          status: "Active",
        },
        {
          id: 2,
          name: "Shirts",
          category: "Men",
          status: "Active",
        },
        {
          id: 3,
          name: "Dresses",
          category: "Women",
          status: "Active",
        },
        {
          id: 4,
          name: "Jeans",
          category: "Men",
          status: "Active",
        },
      ]}
    />
  );
}