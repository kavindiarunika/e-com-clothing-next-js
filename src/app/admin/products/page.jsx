"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Star,
  Flame,
} from "lucide-react";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const emptyForm = {
    title: "",
    description: "",
    main_image: "",
    price: "",
    discount: "0",
    category_id: "",
    sku: "",
    brand: "",
    tags: "",
    status: "active",
    is_featured: false,
    is_best_selling: false,
  };

  const [form, setForm] = useState(emptyForm);

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/products");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load products");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  async function fetchCategories() {
    try {
      const response = await fetch("/api/admin/categories");

      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  function openAddModal() {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  function openEditModal(product) {
    setEditingProduct(product);

    setForm({
      title: product.title || "",
      description: product.description || "",
      main_image: product.main_image || "",
      price: product.price || "",
      discount: product.discount || "0",
      category_id: product.category_id || "",
      sku: product.sku || "",
      brand: product.brand || "",
      tags: Array.isArray(product.tags)
        ? product.tags.join(", ")
        : product.tags || "",
      status: product.status || "active",
      is_featured: Boolean(product.is_featured),
      is_best_selling: Boolean(product.is_best_selling),
    });

    setError("");
    setShowModal(true);
  }

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
  }

  // =====================================================
  // SAVE PRODUCT
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,

        price: Number(form.price),
        discount: Number(form.discount),

        category_id: form.category_id
          ? Number(form.category_id)
          : null,

        tags: form.tags
          ? form.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      };

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.item_id}`
        : "/api/admin/products";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save product");
      }

      closeModal();
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  async function handleDelete(itemId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/products/${itemId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product");
      }

      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      product.title?.toLowerCase().includes(searchText) ||
      product.sku?.toLowerCase().includes(searchText) ||
      product.brand?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      product.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      String(product.category_id) === String(categoryFilter);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory
    );
  });

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  function formatPrice(price) {
    return `Rs. ${Number(price || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
    })}`;
  }

  // =====================================================
  // CATEGORY NAME
  // =====================================================

  function getCategoryName(categoryId) {
    const category = categories.find(
      (item) =>
        String(item.category_id) === String(categoryId)
    );

    return category?.name || category?.title || "Uncategorized";
  }

  return (
    <div className="admin-product-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="product-page-header">

        <div>
          <h1>Products</h1>

          <p>
            Manage your clothing products
          </p>
        </div>

        <button
          className="add-product-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Product
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && !showModal && (
        <div className="product-error">
          {error}
        </div>
      )}

      {/* =================================================
          FILTER SECTION
      ================================================= */}

      <div className="product-filters">

        {/* Search */}

        <div className="product-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {/* Category */}

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
        >
          <option value="all">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category.category_id}
              value={category.category_id}
            >
              {category.name || category.title}
            </option>
          ))}
        </select>

        {/* Status */}

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>

          <option value="out_of_stock">
            Out of Stock
          </option>
        </select>

      </div>

      {/* =================================================
          PRODUCT TABLE
      ================================================= */}

      <div className="product-table-card">

        <div className="product-table-wrapper">

          <table className="product-table">

            <thead>

              <tr>

                <th>Product</th>

                <th>SKU</th>

                <th>Category</th>

                <th>Price</th>

                <th>Discount</th>

                <th>Status</th>

                <th>Features</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="8"
                    className="table-message"
                  >
                    Loading products...
                  </td>

                </tr>

              ) : filteredProducts.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="table-message"
                  >
                    No products found.
                  </td>

                </tr>

              ) : (

                filteredProducts.map((product) => (

                  <tr key={product.item_id}>

                    {/* PRODUCT */}

                    <td>

                      <div className="product-info">

                        <div className="product-image">

                          {product.main_image ? (

                            <img
                              src={product.main_image}
                              alt={product.title}
                            />

                          ) : (

                            <ImageIcon size={22} />

                          )}

                        </div>

                        <div>

                          <div className="product-name">
                            {product.title}
                          </div>

                          {product.brand && (
                            <div className="product-brand">
                              {product.brand}
                            </div>
                          )}

                        </div>

                      </div>

                    </td>

                    {/* SKU */}

                    <td>
                      {product.sku || "-"}
                    </td>

                    {/* CATEGORY */}

                    <td>
                      {getCategoryName(
                        product.category_id
                      )}
                    </td>

                    {/* PRICE */}

                    <td>
                      {formatPrice(product.price)}
                    </td>

                    {/* DISCOUNT */}

                    <td>

                      {Number(product.discount || 0) > 0
                        ? `${product.discount}%`
                        : "-"
                      }

                    </td>

                    {/* STATUS */}

                    <td>

                      <span
                        className={`status-badge ${product.status}`}
                      >
                        {product.status === "out_of_stock"
                          ? "Out of Stock"
                          : product.status
                              ?.charAt(0)
                              .toUpperCase() +
                            product.status?.slice(1)}
                      </span>

                    </td>

                    {/* FEATURES */}

                    <td>

                      <div className="feature-badges">

                        {Boolean(product.is_featured) && (
                          <span
                            className="feature-badge featured"
                            title="Featured"
                          >
                            <Star size={13} />
                          </span>
                        )}

                        {Boolean(product.is_best_selling) && (
                          <span
                            className="feature-badge best-selling"
                            title="Best Selling"
                          >
                            <Flame size={13} />
                          </span>
                        )}

                        {!product.is_featured &&
                          !product.is_best_selling && (
                            <span className="no-feature">
                              -
                            </span>
                          )}

                      </div>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="product-actions">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            openEditModal(product)
                          }
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(
                              product.item_id
                            )
                          }
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (

        <div
          className="product-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !saving
            ) {
              closeModal();
            }
          }}
        >

          <div className="product-modal">

            {/* MODAL HEADER */}

            <div className="product-modal-header">

              <div>

                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p>
                  {editingProduct
                    ? "Update product information"
                    : "Add a new product"}
                </p>

              </div>

              <button
                className="modal-close-btn"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL FORM */}

            <form
              className="product-form"
              onSubmit={handleSubmit}
            >

              {error && (
                <div className="product-error">
                  {error}
                </div>
              )}

              {/* IMAGE */}

              <div className="form-group">

                <label>
                  Main Image
                </label>

                <input
                  type="text"
                  name="main_image"
                  value={form.main_image}
                  onChange={handleChange}
                  placeholder="Enter image URL"
                />

              </div>

              {/* TITLE */}

              <div className="form-group">

                <label>
                  Product Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter product title"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows="4"
                />

              </div>

              {/* PRICE + DISCOUNT */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Price *
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="4500.00"
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Discount
                  </label>

                  <input
                    type="number"
                    name="discount"
                    value={form.discount}
                    onChange={handleChange}
                    placeholder="10.00"
                    min="0"
                    step="0.01"
                  />

                </div>

              </div>

              {/* CATEGORY + SKU */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Category
                  </label>

                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Category
                    </option>

                    {categories.map((category) => (

                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.name ||
                          category.title}
                      </option>

                    ))}

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    SKU
                  </label>

                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="VEL-DRESS-001"
                  />

                </div>

              </div>

              {/* BRAND */}

              <div className="form-group">

                <label>
                  Brand
                </label>

                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Velora"
                />

              </div>

              {/* TAGS */}

              <div className="form-group">

                <label>
                  Tags
                </label>

                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="summer, floral, women"
                />

                <small>
                  Separate tags using commas.
                </small>

              </div>

              {/* STATUS */}

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

                  <option value="out_of_stock">
                    Out of Stock
                  </option>

                </select>

              </div>

              {/* FEATURES */}

              <div className="product-options">

                <label className="checkbox-option">

                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={form.is_featured}
                    onChange={handleChange}
                  />

                  <span>
                    <Star size={16} />
                    Featured Product
                  </span>

                </label>

                <label className="checkbox-option">

                  <input
                    type="checkbox"
                    name="is_best_selling"
                    checked={form.is_best_selling}
                    onChange={handleChange}
                  />

                  <span>
                    <Flame size={16} />
                    Best Selling Product
                  </span>

                </label>

              </div>

              {/* BUTTONS */}

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-product-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}