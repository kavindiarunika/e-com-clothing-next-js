import DataTable from "./DataTable";

export default function CustomerTable({
  customers = [],
  loading = false,
}) {
  const columns = [
    {
      key: "user_id",
      label: "ID",
    },
    {
      key: "first_name",
      label: "First Name",
    },
    {
      key: "last_name",
      label: "Last Name",
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
      key: "role",
      label: "Role",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={customers}
      loading={loading}
    />
  );
}