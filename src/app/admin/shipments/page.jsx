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
          key: "order_id",
          label: "Order",
        },
        {
          key: "customer_name",
          label: "Customer",
        },
        {
          key: "shipping_address",
          label: "Shipping Address",
        },
        {
          key: "order_date",
          label: "Order Date",
        },
        {
          key: "order_status",
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
      endpoint="/api/admin/shipments"
      resultKey="shipments"
      idKey="order_id"
      readOnly
    />
  );
}