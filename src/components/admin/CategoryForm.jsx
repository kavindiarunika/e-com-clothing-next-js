"use client";

import { useState } from "react";

export default function CategoryForm({
  initialData = {},
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    slug: initialData.slug || "",
    description:
      initialData.description || "",
  });

  function change(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function submit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form
      className="admin-form"
      onSubmit={submit}
    >
      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label>Category Name</label>

          <input
            name="name"
            value={form.name}
            onChange={change}
            placeholder="Men"
            required
          />
        </div>

        <div className="admin-form-group">
          <label>Slug</label>

          <input
            name="slug"
            value={form.slug}
            onChange={change}
            placeholder="men"
          />
        </div>

        <div className="admin-form-group full">
          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={change}
            rows={4}
          />
        </div>
      </div>

      <button
        className="admin-button primary"
        disabled={loading}
      >
        {loading
          ? "Saving..."
          : "Save Category"}
      </button>
    </form>
  );
}