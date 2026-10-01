import DataTable from "./DataTable";

export default function InventoryTable({
  inventory = [],
  loading = false,
  onEdit,
}) {
  const columns = [
    {
      key: "inventory_id",
      label: "ID",
    },
    {
      key: "product_id",
      label: "Product",
    },
    {
      key: "variant_id",
      label: "Variant",
    },
    {
      key: "stock_quantity",
      label: "Stock",
    },
    {
      key: "quantity",
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
      data={inventory}
      loading={loading}
      onEdit={onEdit}
    />
  );
}