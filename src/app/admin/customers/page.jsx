"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function CustomersPage() {
  return (
    <AdminCrudPage
      title="Customers"
      description="Manage registered customers."
      addLabel="Add Customer"
      fields={[
        {
          key: "name",
          label: "Customer",
        },
        {
          key: "email",
          label: "Email",
        },
        {
          key: "phone",
          label: "Phone",
        },
        {
          key: "orders",
          label: "Orders",
        },
      ]}
      initialData={[
        {
          id: 1,
          name: "Chamodi Jayasingha",
          email: "customer@example.com",
          phone: "0771234567",
          orders: 8,
        },
        {
          id: 2,
          name: "Kasun Perera",
          email: "kasun@example.com",
          phone: "0711234567",
          orders: 4,
        },
        {
          id: 3,
          name: "Nimali Silva",
          email: "nimali@example.com",
          phone: "0761234567",
          orders: 12,
        },
      ]}
    />
  );
}