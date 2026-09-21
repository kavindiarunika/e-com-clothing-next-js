"use client";

import DataTable from "./DataTable";

export default function ProductTable({
  products = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  const columns = [
    {
      key: "product_id",
      label: "ID",
    },
    {
      key: "title",
      label: "Product",
    },
    {
      key: "name",
      label: "Name",
    },
    {
      key: "price",
      label: "Price",
      render: (value) =>
        value
          ? `Rs. ${Number(value).toLocaleString()}`
          : "-",
    },
    {
      key: "stock",
      label: "Stock",
    },
    {
      key: "stock_quantity",
      label: "Quantity",
    },
    {
      key: "status",
      label: "Status",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}