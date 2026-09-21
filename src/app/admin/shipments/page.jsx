"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function ShipmentsPage() {
  return (
    <AdminCrudPage
      title="Shipments"
      description="Track customer shipments."
      addLabel="Add Shipment"
      fields={[
        {
          key: "order",
          label: "Order",
        },
        {
          key: "customer",
          label: "Customer",
        },
        {
          key: "courier",
          label: "Courier",
        },
        {
          key: "tracking",
          label: "Tracking",
        },
        {
          key: "status",
          label: "Status",
        },
      ]}
      initialData={[
        {
          id: 1,
          order: "#ORD-1001",
          customer: "Chamodi",
          courier: "Domex",
          tracking: "DMX12345",
          status: "Shipped",
        },
        {
          id: 2,
          order: "#ORD-1002",
          customer: "Kasun",
          courier: "Prompt X",
          tracking: "PX54321",
          status: "Processing",
        },
      ]}
    />
  );
}