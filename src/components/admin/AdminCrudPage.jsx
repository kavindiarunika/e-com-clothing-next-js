"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";

export default function AdminCrudPage({
  title,
  description,
  addLabel,
  fields,
  initialData = [],
}) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({});

  function openAdd() {
    const empty = {};

    fields.forEach((field) => {
      empty[field.key] = "";
    });

    setForm(empty);
    setShowForm(true);
  }

  function changeField(key, value) {
    setForm({
      ...form,
      [key]: value,
    });
  }

  function saveItem(e) {
    e.preventDefault();

    setData([
      ...data,
      {
        id: Date.now(),
        ...form,
      },
    ]);

    setShowForm(false);
  }

  function deleteItem(id) {
    if (!confirm("Delete this item?")) return;

    setData(
      data.filter((item) => item.id !== id)
    );
  }

  const filtered = data.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <button
          className="primary-button"
          onClick={openAdd}
        >
          <Plus size={18} />
          {addLabel || "Add New"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card crud-form-card">
          <h3>Add {title}</h3>

          <form onSubmit={saveItem}>
            <div className="form-grid">
              {fields.map((field) => (
                <div
                  className={`form-group ${
                    field.full ? "full" : ""
                  }`}
                  key={field.key}
                >
                  <label>{field.label}</label>

                  {field.type === "textarea" ? (
                    <textarea
                      rows="4"
                      value={form[field.key] || ""}
                      onChange={(e) =>
                        changeField(
                          field.key,
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={form[field.key] || ""}
                      placeholder={
                        field.placeholder || ""
                      }
                      onChange={(e) =>
                        changeField(
                          field.key,
                          e.target.value
                        )
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="form-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="table-toolbar">
          <div className="toolbar-search">
            <Search size={18} />

            <input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                {fields.map((field) => (
                  <th key={field.key}>
                    {field.label}
                  </th>
                ))}

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  {fields.map((field) => (
                    <td key={field.key}>
                      {item[field.key]}
                    </td>
                  ))}

                  <td>
                    <div className="table-actions">
                      <button className="icon-action">
                        <Pencil size={16} />
                      </button>

                      <button
                        className="icon-action danger"
                        onClick={() =>
                          deleteItem(item.id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}