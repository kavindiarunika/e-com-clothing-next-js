"use client";

import { useEffect, useState } from "react";
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
  endpoint,
  resultKey,
  idKey = "id",
  readOnly = false,
  editOnly = false,
}) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(Boolean(endpoint));
  const [error, setError] = useState("");

  const [form, setForm] = useState({});

  useEffect(() => {
    if (!endpoint) return;

    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch(endpoint);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `Failed to load ${title.toLowerCase()}`);
        setData(result[resultKey] || result.data || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [endpoint, resultKey, title]);

  function openAdd() {
    const empty = {};

    fields.forEach((field) => {
      empty[field.key] = "";
    });

    setForm(empty);
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(item) {
    setForm(
      Object.fromEntries(
        fields.map((field) => [field.key, item[field.key] ?? ""])
      )
    );
    setEditingId(item[idKey]);
    setError("");
    setShowForm(true);
  }

  function changeField(key, value) {
    setForm({
      ...form,
      [key]: value,
    });
  }

  async function saveItem(e) {
    e.preventDefault();

    try {
      const response = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...form, [idKey]: editingId, id: editingId } : form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `Failed to save ${title.toLowerCase()}`);
      setShowForm(false);
      setEditingId(null);
      const refreshed = await fetch(endpoint);
      const refreshedResult = await refreshed.json();
      setData(refreshedResult[resultKey] || refreshedResult.data || []);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function deleteItem(id) {
    if (!confirm("Delete this item?")) return;

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [idKey]: id, id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `Failed to delete ${title.toLowerCase()}`);
      setData(data.filter((item) => item[idKey] !== id));
    } catch (deleteError) {
      setError(deleteError.message);
    }
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

        {!readOnly && !editOnly && (
        <button
          className="primary-button"
          onClick={openAdd}
        >
          <Plus size={18} />
          {addLabel || "Add New"}
        </button>
        )}
      </div>

      {error && <div className="admin-error">{error}</div>}

      {showForm && !readOnly && (
        <div className="admin-card crud-form-card">
          <h3>{editingId ? `Edit ${title}` : `Add ${title}`}</h3>

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
              {loading ? (
                <tr><td colSpan={fields.length + 1}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={fields.length + 1}>No records found.</td></tr>
              ) : filtered.map((item) => (
                <tr key={item[idKey]}>
                  {fields.map((field) => (
                    <td key={field.key}>
                      {field.render ? field.render(item) : item[field.key]}
                    </td>
                  ))}

                  <td>
                    <div className="table-actions">
                      {!readOnly && (
                      <button className="icon-action" onClick={() => openEdit(item)}>
                        <Pencil size={16} />
                      </button>
                      )}

                      {!readOnly && !editOnly && (
                      <button
                        className="icon-action danger"
                        onClick={() =>
                          deleteItem(item.id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                      )}
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