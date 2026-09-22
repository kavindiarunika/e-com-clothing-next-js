"use client";

import DataTable from "./DataTable";

export default function OrderTable({
  orders = [],
  loading = false,
  onView,
  onEdit,
}) {
  const columns = [
    {
      key: "order_id",
      label: "Order ID",
    },
    {
      key: "user_id",
      label: "Customer",
    },
    {
      key: "total",
      label: "Total",
      render: (value, row) => {
        const amount =
          value ??
          row.total_amount ??
          row.grand_total ??
          row.order_total;

        return amount
          ? `Rs. ${Number(
              amount
            ).toLocaleString()}`
          : "-";
      },
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "payment_status",
      label: "Payment",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      loading={loading}
      onView={onView}
      onEdit={onEdit}
    />
  );
}