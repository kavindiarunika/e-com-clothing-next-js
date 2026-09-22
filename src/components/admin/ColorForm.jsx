"use client";

import { useState } from "react";

export default function ColorForm({
  initialData = {},
  onSubmit,
}) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    code:
      initialData.code ||
      initialData.hex_code ||
      "",
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
          <label>Color Name</label>

          <input
            name="name"
            value={form.name}
            onChange={change}
            placeholder="Black"
            required
          />
        </div>

        <div className="admin-form-group">
          <label>Color Code</label>

          <input
            name="code"
            value={form.code}
            onChange={change}
            placeholder="#000000"
          />
        </div>
      </div>

      <button className="admin-button primary">
        Save Color
      </button>
    </form>
  );
}