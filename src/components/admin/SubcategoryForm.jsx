"use client";

import { useState } from "react";

export default function SubcategoryForm({
  initialData = {},
  onSubmit,
}) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    slug: initialData.slug || "",
    category_id:
      initialData.category_id || "",
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
          <label>Name</label>

          <input
            name="name"
            value={form.name}
            onChange={change}
            required
          />
        </div>

        <div className="admin-form-group">
          <label>Slug</label>

          <input
            name="slug"
            value={form.slug}
            onChange={change}
          />
        </div>

        <div className="admin-form-group">
          <label>Category ID</label>

          <input
            type="number"
            name="category_id"
            value={form.category_id}
            onChange={change}
          />
        </div>

        <div className="admin-form-group full">
          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={change}
          />
        </div>
      </div>

      <button className="admin-button primary">
        Save Subcategory
      </button>
    </form>
  );
}