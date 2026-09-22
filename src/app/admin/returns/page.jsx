"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function ReturnsPage() {
  return (
    <AdminCrudPage
      title="Returns"
      description="Manage product return requests."
      addLabel="Add Return"
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
          key: "reason",
          label: "Reason",
        },
        {
          key: "status",
          label: "Status",
        },
      ]}
      initialData={[
        {
          id: 1,
          order: "#ORD-1002",
          customer: "Kasun",
          reason: "Wrong Size",
          status: "Pending",
        },
        {
          id: 2,
          order: "#ORD-1008",
          customer: "Nimali",
          reason: "Damaged",
          status: "Approved",
        },
      ]}
      endpoint="/api/admin/returns"
      resultKey="returns"
      idKey="return_id"
      editOnly
    />
  );
}