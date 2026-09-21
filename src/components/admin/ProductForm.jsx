"use client";

import { useState } from "react";

export default function ProductForm({
  initialData = {},
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    name: initialData.name || "",
    description:
      initialData.description || "",
    price: initialData.price || "",
    discount:
      initialData.discount || "",
    sku: initialData.sku || "",
    brand: initialData.brand || "",
    stock:
      initialData.stock ||
      initialData.stock_quantity ||
      "",
    status:
      initialData.status || "active",
    ...initialData,
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await onSubmit(form);
  }

  return (
    <form
      className="admin-form"
      onSubmit={handleSubmit}
    >
      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label>Product Title</label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter product title"
          />
        </div>

        <div className="admin-form-group">
          <label>Product Name</label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter product name"
          />
        </div>

        <div className="admin-form-group">
          <label>Price</label>

          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>

        <div className="admin-form-group">
          <label>Discount</label>

          <input
            type="number"
            name="discount"
            value={form.discount}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="admin-form-group">
          <label>SKU</label>

          <input
            name="sku"
            value={form.sku}
            onChange={handleChange}
            placeholder="SKU"
          />
        </div>

        <div className="admin-form-group">
          <label>Brand</label>

          <input
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="Brand"
          />
        </div>

        <div className="admin-form-group">
          <label>Stock</label>

          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="admin-form-group">
          <label>Status</label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

            <option value="draft">
              Draft
            </option>
          </select>
        </div>

        <div className="admin-form-group full">
          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            placeholder="Product description"
          />
        </div>
      </div>

      <button
        type="submit"
        className="admin-button primary"
        disabled={loading}
      >
        {loading
          ? "Saving..."
          : "Save Product"}
      </button>
    </form>
  );
}