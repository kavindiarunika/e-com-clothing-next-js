import DataTable from "./DataTable";

export default function CategoryTable({
  categories = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  const columns = [
    {
      key: "category_id",
      label: "ID",
    },
    {
      key: "name",
      label: "Category",
    },
    {
      key: "slug",
      label: "Slug",
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "is_active",
      label: "Active",
      render: (value) =>
        value === 1 ||
        value === true
          ? "Yes"
          : "No",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={categories}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}