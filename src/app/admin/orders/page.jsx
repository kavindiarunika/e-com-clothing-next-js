"use client";

import Link from "next/link";
import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function OrdersPage() {
  return (
    <AdminCrudPage
      title="Orders"
      description="View and manage customer orders."
      addLabel="Create Order"
      fields={[
        {
          key: "order",
          label: "Order ID",
        },
        {
          key: "customer",
          label: "Customer",
        },
        {
          key: "total",
          label: "Total",
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
          total: "Rs. 12,500",
          status: "Pending",
        },
        {
          id: 2,
          order: "#ORD-1002",
          customer: "Kasun",
          total: "Rs. 8,900",
          status: "Processing",
        },
        {
          id: 3,
          order: "#ORD-1003",
          customer: "Nimali",
          total: "Rs. 21,000",
          status: "Delivered",
        },
      ]}
    />
  );
}