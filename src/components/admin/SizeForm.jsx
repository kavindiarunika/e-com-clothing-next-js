"use client";

import { useState } from "react";

export default function SizeForm({
  initialData = {},
  onSubmit,
}) {
  const [name, setName] = useState(
    initialData.name || ""
  );

  function submit(e) {
    e.preventDefault();

    onSubmit({
      name,
    });
  }

  return (
    <form
      className="admin-form"
      onSubmit={submit}
    >
      <div className="admin-form-group">
        <label>Size</label>

        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="S / M / L / XL"
          required
        />
      </div>

      <button className="admin-button primary">
        Save Size
      </button>
    </form>
  );
}