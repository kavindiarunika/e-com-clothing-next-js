"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    subcategory_id: "",
    stock_quantity: "",
    image_url: "",
    status: "active",
  });

  const [loading, setLoading] =
    useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message
        );
      }

      router.push(
        "/admin/products"
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-page">

      <div className="page-header">

        <div>
          <p className="eyebrow">
            CATALOG
          </p>

          <h1>Add Product</h1>
        </div>

      </div>

      <form
        className="admin-card form-card"
        onSubmit={handleSubmit}
      >

        <div className="form-grid">

          <div className="form-group">
            <label>
              Product Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Price
            </label>

            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Category
            </label>

            <input
              name="category_id"
              type="number"
              value={form.category_id}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Subcategory
            </label>

            <input
              name="subcategory_id"
              type="number"
              value={
                form.subcategory_id
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Stock Quantity
            </label>

            <input
              name="stock_quantity"
              type="number"
              value={
                form.stock_quantity
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Status
            </label>

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
            </select>
          </div>

          <div className="form-group full">
            <label>
              Image URL
            </label>

            <input
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full">
            <label>
              Description
            </label>

            <textarea
              name="description"
              rows="6"
              value={form.description}
              onChange={handleChange}
            />
          </div>

        </div>

        <div className="form-actions">

          <button
            type="button"
            className="btn"
            onClick={() =>
              router.back()
            }
          >
            Cancel
          </button>

          <button
            className="btn primary"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Product"}
          </button>

        </div>

      </form>

    </main>
  );
}