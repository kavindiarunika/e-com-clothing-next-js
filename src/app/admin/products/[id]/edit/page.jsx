"use client";

import Link from "next/link";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

import DataTable from "@/components/admin/DataTable";

const products = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    category: "Men",
    price: "Rs. 4,500",
    stock: 35,
    status: "Active",
  },
  {
    id: 2,
    name: "Classic Denim Jeans",
    category: "Men",
    price: "Rs. 8,500",
    stock: 18,
    status: "Active",
  },
  {
    id: 3,
    name: "Elegant Summer Dress",
    category: "Women",
    price: "Rs. 12,500",
    stock: 7,
    status: "Low Stock",
  },
];

export default function ProductsPage() {
  const columns = [
    {
      key: "name",
      label: "Product",
      render: (row) => (
        <div className="product-table-name">
          <div className="product-placeholder">
            P
          </div>

          <div>
            <strong>{row.name}</strong>
            <span>{row.category}</span>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
    },
    {
      key: "stock",
      label: "Stock",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`status ${
            row.status === "Active"
              ? "status-success"
              : "status-warning"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="table-actions">
          <Link
            href={`/admin/products/${row.id}/edit`}
            className="icon-action"
          >
            <Pencil size={17} />
          </Link>

          <button className="icon-action danger">
            <Trash2 size={17} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Products</h1>
          <p>
            Manage your clothing products.
          </p>
        </div>

        <Link
          href="/admin/products/add"
          className="primary-button"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="admin-card">
        <div className="table-toolbar">
          <div className="toolbar-search">
            <Search size={18} />

            <input
              placeholder="Search products..."
            />
          </div>

          <select className="admin-select">
            <option>All Categories</option>
            <option>Men</option>
            <option>Women</option>
            <option>Kids</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={products}
        />
      </div>
    </div>
  );
}