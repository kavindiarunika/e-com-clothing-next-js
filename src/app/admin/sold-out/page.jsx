"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PackageX, RefreshCw, Search } from "lucide-react";

export default function SoldOutPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchSoldOutProducts() {
    const response = await fetch("/api/admin/products", {
      cache: "no-store",
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || "Failed to load products.");
    }

    return Array.isArray(result.products) ? result.products : [];
  }

  useEffect(() => {
    let isCurrent = true;

    fetchSoldOutProducts()
      .then((loadedProducts) => {
        if (isCurrent) {
          setProducts(loadedProducts);
        }
      })
      .catch((loadError) => {
        console.error("Sold-out products loading error:", loadError);
        if (isCurrent) {
          setError(loadError.message || "Failed to load sold-out products.");
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function loadSoldOutProducts() {
    try {
      setLoading(true);
      setError("");
      setProducts(await fetchSoldOutProducts());
    } catch (loadError) {
      console.error("Sold-out products loading error:", loadError);
      setError(loadError.message || "Failed to load sold-out products.");
    } finally {
      setLoading(false);
    }
  }

  const soldOutProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return products.filter((product) => {
      const stock = Number(
        product.total_stock ?? product.qty ?? product.stock ?? 0
      );
      const matchesSearch = [
        product.title,
        product.sku,
        product.category_name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchTerm));

      return stock <= 0 && matchesSearch;
    });
  }, [products, search]);

  return (
    <main className="admin-inventory-page">
      <div className="inventory-page-header">
        <div>
          <h1>Sold Out</h1>
          <p>Products that currently have no available stock.</p>
        </div>

        <button
          type="button"
          className="inventory-refresh-btn"
          onClick={() => void loadSoldOutProducts()}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="inventory-filters">
        <div className="inventory-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search product, SKU, category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="inventory-table-card">
        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="inventory-empty">
                    Loading sold-out products...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="inventory-empty" role="alert">
                    {error}
                  </td>
                </tr>
              ) : soldOutProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="inventory-empty">
                    No sold-out products found.
                  </td>
                </tr>
              ) : (
                soldOutProducts.map((product) => (
                  <tr key={product.item_id}>
                    <td>
                      <Link
                        href={`/admin/products/${product.item_id}/edit`}
                        className="inventory-product sold-out-product-link"
                        aria-label={`View details for ${product.title || "product"}`}
                      >
                        <div className="inventory-product-icon">
                          <PackageX size={18} />
                        </div>
                        <div>
                          <strong>{product.title || "Product"}</strong>
                          <span>Product #{product.item_id}</span>
                        </div>
                      </Link>
                    </td>
                    <td>{product.sku || "-"}</td>
                    <td>{product.category_name || "-"}</td>
                    <td>
                      Rs. {Number(product.price || 0).toLocaleString("en-LK")}
                    </td>
                    <td>
                      <strong className="inventory-danger-number">
                        {Number(
                          product.total_stock ?? product.qty ?? product.stock ?? 0
                        )}
                      </strong>
                    </td>
                    <td>
                      <span className="inventory-status inventory-status-out">
                        Sold Out
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
