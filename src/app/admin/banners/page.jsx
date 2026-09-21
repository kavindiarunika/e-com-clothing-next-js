"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function BannersPage() {
  return (
    <AdminCrudPage
      title="Banners"
      description="Manage homepage promotional banners."
      addLabel="Add Banner"
      fields={[
        {
          key: "title",
          label: "Title",
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
          title: "Summer Collection",
          position: "Homepage",
          status: "Active",
        },
        {
          id: 2,
          title: "New Arrivals",
          position: "Homepage",
          status: "Active",
        },
      ]}
    />
  );
}