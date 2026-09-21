"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  async function loadProducts() {
    const response =
      await fetch("/api/admin/products");

    const data =
      await response.json();

    if (data.success) {
      setProducts(data.products);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function fetchProducts() {
      const response =
        await fetch("/api/admin/products");

      const data =
        await response.json();

      if (data.success) {
        setProducts(data.products);
      }

      setLoading(false);
    }

    fetchProducts();
  }, []);

  async function deleteProduct(id) {
    const confirmDelete =
      confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmDelete) return;

    await fetch(
      `/api/admin/products/${id}`,
      {
        method: "DELETE",
      }
    );

    loadProducts();
  }

  return (
    <main className="admin-page">

      <div className="page-header">

        <div>
          <p className="eyebrow">
            CATALOG
          </p>

          <h1>Products</h1>

          <p className="muted">
            Manage your clothing products.
          </p>
        </div>

        <button
          className="btn primary"
          onClick={() =>
            router.push(
              "/admin/products/add"
            )
          }
        >
          + Add Product
        </button>

      </div>

      <div className="admin-card">

        <div className="table-toolbar">

          <input
            placeholder="Search products..."
          />

          <select>
            <option>All Categories</option>
            <option>Men</option>
            <option>Women</option>
            <option>Kids</option>
          </select>

        </div>

        {loading ? (
          <div className="loading">
            Loading products...
          </div>
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {products.map(
                  (product) => (
                    <tr
                      key={
                        product.product_id
                      }
                    >

                      <td>
                        #{product.product_id}
                      </td>

                      <td>
                        {product.name}
                      </td>

                      <td>
                        Rs.{" "}
                        {Number(
                          product.price
                        ).toLocaleString()}
                      </td>

                      <td>
                        {product.stock_quantity}
                      </td>

                      <td>
                        <span className="status-badge">
                          {product.status}
                        </span>
                      </td>

                      <td>

                        <button
                          className="table-btn"
                          onClick={() =>
                            router.push(
                              `/admin/products/${product.product_id}/edit`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="table-btn danger"
                          onClick={() =>
                            deleteProduct(
                              product.product_id
                            )
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </main>
  );
}