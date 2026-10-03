"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function ColorsPage() {
  return (
    <AdminCrudPage
      title="Colors"
      description="Manage available product colors."
      addLabel="Add Color"
      pageClassName="product-style-crud-page"
      fields={[
        {
          key: "name",
          label: "Color Name",
        },
        {
          key: "hex_code",
          label: "Color Code",
          type: "color",
          render: (color) => {
            const isValidHex = /^#[0-9a-f]{6}$/i.test(color.hex_code || "");

            return (
              <span className="admin-color-code-preview">
                <span
                  className="admin-color-code-preview-swatch"
                  role="img"
                  aria-label={`Color preview for ${color.name}`}
                  style={{
                    backgroundColor: isValidHex ? color.hex_code : "#FFFFFF",
                  }}
                />
                <span className="admin-color-code-preview-value">
                  {color.hex_code || "—"}
                </span>
              </span>
            );
          },
        },
        {
          key: "status",
          label: "Status",
        },
      ]}
      initialData={[
        {
          id: 1,
          name: "Black",
          code: "#000000",
          status: "Active",
        },
        {
          id: 2,
          name: "White",
          code: "#FFFFFF",
          status: "Active",
        },
        {
          id: 3,
          name: "Red",
          code: "#B42318",
          status: "Active",
        },
        {
          id: 4,
          name: "Blue",
          code: "#2563EB",
          status: "Active",
        },
      ]}
      endpoint="/api/admin/colors"
      resultKey="colors"
      idKey="color_id"
    />
  );
}