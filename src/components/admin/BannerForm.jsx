"use client";

import { useState } from "react";

export default function BannerForm({
  initialData = {},
  onSubmit,
}) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    link:
      initialData.link ||
      initialData.link_url ||
      "",
    position:
      initialData.position || "home",
    is_active:
      initialData.is_active ?? 1,
  });

  function change(e) {
    const value =
      e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value;

    setForm({
      ...form,
      [e.target.name]: value,
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
          <label>Banner Title</label>

          <input
            name="title"
            value={form.title}
            onChange={change}
          />
        </div>

        <div className="admin-form-group">
          <label>Link</label>

          <input
            name="link"
            value={form.link}
            onChange={change}
            placeholder="/shop"
          />
        </div>

        <div className="admin-form-group">
          <label>Position</label>

          <select
            name="position"
            value={form.position}
            onChange={change}
          >
            <option value="home">
              Home
            </option>

            <option value="shop">
              Shop
            </option>

            <option value="sub_pages">
              Sub Pages
            </option>
          </select>
        </div>

        <div className="admin-form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={Boolean(
                form.is_active
              )}
              onChange={change}
            />

            Active
          </label>
        </div>
      </div>

      <button className="admin-button primary">
        Save Banner
      </button>
    </form>
  );
}