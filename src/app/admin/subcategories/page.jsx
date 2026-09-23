"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
} from "lucide-react";

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    parent_category_id: "",
    status: "active",
  });

  /* =========================================
     LOAD DATA
  ========================================= */

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      const [subcategoryResponse, categoryResponse] = await Promise.all([
        fetch("/api/admin/subcategories"),
        fetch("/api/admin/categories"),
      ]);

      const subcategoryData = await subcategoryResponse.json();
      const categoryData = await categoryResponse.json();

      if (subcategoryData.success) {
        setSubcategories(subcategoryData.subcategories || []);
      }

      if (categoryData.success) {
        setCategories(categoryData.categories || []);
      }
    } catch (error) {
      console.error("Failed to load subcategories:", error);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================
     FILTER
  ========================================= */

  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((subcategory) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        subcategory.name?.toLowerCase().includes(searchValue) ||
        subcategory.description?.toLowerCase().includes(searchValue) ||
        subcategory.parent_category_name
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        subcategory.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subcategories, search, statusFilter]);

  /* =========================================
     FORM HANDLER
  ========================================= */

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /* =========================================
     OPEN ADD MODAL
  ========================================= */

  function openAddModal() {
    setEditingSubcategory(null);

    setForm({
      name: "",
      description: "",
      image: "",
      parent_category_id: "",
      status: "active",
    });

    setShowModal(true);
  }

  /* =========================================
     OPEN EDIT MODAL
  ========================================= */

  function openEditModal(subcategory) {
    setEditingSubcategory(subcategory);

    setForm({
      name: subcategory.name || "",
      description: subcategory.description || "",
      image: subcategory.image || "",
      parent_category_id: subcategory.parent_category_id || "",
      status: subcategory.status || "active",
    });

    setShowModal(true);
  }

  /* =========================================
     CLOSE MODAL
  ========================================= */

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingSubcategory(null);
  }

  /* =========================================
     SAVE SUBCATEGORY
  ========================================= */

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter subcategory name.");
      return;
    }

    if (!form.parent_category_id) {
      alert("Please select a parent category.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        parent_category_id: Number(form.parent_category_id),
        status: form.status,
      };

      const url = editingSubcategory
        ? `/api/admin/subcategories/${editingSubcategory.category_id}`
        : "/api/admin/subcategories";

      const method = editingSubcategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save subcategory."
        );
      }

      closeModal();
      await fetchData();
    } catch (error) {
      console.error("Save Subcategory Error:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  /* =========================================
     DELETE SUBCATEGORY
  ========================================= */

  async function handleDelete(categoryId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subcategory?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/subcategories/${categoryId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete subcategory."
        );
      }

      await fetchData();
    } catch (error) {
      console.error("Delete Subcategory Error:", error);
      alert(error.message);
    }
  }

  /* =========================================
     MAIN CATEGORIES ONLY
  ========================================= */

  const mainCategories = categories.filter(
    (category) => !category.parent_category_id
  );

  return (
    <div className="admin-subcategory-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="subcategory-page-header">
        <div>
          <h1>Subcategories</h1>
          <p>Manage your product subcategories</p>
        </div>

        <button
          className="add-subcategory-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Subcategory
        </button>
      </div>

      {/* =========================================
          FILTERS
      ========================================= */}

      <div className="subcategory-filters">

        <div className="subcategory-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search subcategories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="subcategory-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

      </div>

      {/* =========================================
          TABLE
      ========================================= */}

      <div className="subcategory-table-card">

        {loading ? (
          <div className="subcategory-loading">
            Loading subcategories...
          </div>
        ) : filteredSubcategories.length === 0 ? (
          <div className="subcategory-empty">
            <div className="empty-icon">
              <ImageIcon size={30} />
            </div>

            <h3>No subcategories found</h3>

            <p>
              Add your first subcategory to organize your products.
            </p>

            <button
              className="add-subcategory-btn"
              onClick={openAddModal}
            >
              <Plus size={18} />
              Add Subcategory
            </button>
          </div>
        ) : (
          <div className="subcategory-table-wrapper">

            <table className="subcategory-table">

              <thead>
                <tr>
                  <th>Subcategory</th>
                  <th>Description</th>
                  <th>Parent Category</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubcategories.map((subcategory) => (
                  <tr key={subcategory.category_id}>

                    {/* SUBCATEGORY */}
                    <td>
                      <div className="subcategory-info">

                        {subcategory.image ? (
                          <img
                            src={subcategory.image}
                            alt={subcategory.name}
                            className="subcategory-image"
                          />
                        ) : (
                          <div className="subcategory-image-placeholder">
                            <ImageIcon size={20} />
                          </div>
                        )}

                        <div>
                          <span className="subcategory-name">
                            {subcategory.name}
                          </span>

                          <span className="subcategory-id">
                            ID #{subcategory.category_id}
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* DESCRIPTION */}
                    <td>
                      <div className="subcategory-description">
                        {subcategory.description || "No description"}
                      </div>
                    </td>

                    {/* PARENT */}
                    <td>
                      <span className="parent-category-badge">
                        {subcategory.parent_category_name ||
                          "Unknown Category"}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`subcategory-status ${
                          subcategory.status === "active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {subcategory.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* CREATED */}
                    <td>
                      <span className="subcategory-date">
                        {subcategory.created_at
                          ? new Date(
                              subcategory.created_at
                            ).toLocaleDateString()
                          : "-"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className="subcategory-actions">

                        <button
                          className="subcategory-edit-btn"
                          onClick={() =>
                            openEditModal(subcategory)
                          }
                          title="Edit"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="subcategory-delete-btn"
                          onClick={() =>
                            handleDelete(
                              subcategory.category_id
                            )
                          }
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* =========================================
          MODAL
      ========================================= */}

      {showModal && (
        <div
          className="subcategory-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="subcategory-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="subcategory-modal-header">

              <div>
                <h2>
                  {editingSubcategory
                    ? "Edit Subcategory"
                    : "Add Subcategory"}
                </h2>

                <p>
                  {editingSubcategory
                    ? "Update subcategory information"
                    : "Create a new product subcategory"}
                </p>
              </div>

              <button
                className="subcategory-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              className="subcategory-form"
              onSubmit={handleSubmit}
            >

              {/* NAME */}

              <div className="subcategory-form-group">
                <label>
                  Subcategory Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Summer Dresses"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div className="subcategory-form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  placeholder="Enter subcategory description..."
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              {/* IMAGE */}

              <div className="subcategory-form-group">
                <label>Image URL</label>

                <input
                  type="text"
                  name="image"
                  placeholder="https://example.com/image.jpg"
                  value={form.image}
                  onChange={handleChange}
                />
              </div>

              {/* PARENT CATEGORY */}

              <div className="subcategory-form-group">
                <label>
                  Parent Category <span>*</span>
                </label>

                <select
                  name="parent_category_id"
                  value={form.parent_category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Parent Category
                  </option>

                  {mainCategories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* STATUS */}

              <div className="subcategory-form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* BUTTONS */}

              <div className="subcategory-form-actions">

                <button
                  type="button"
                  className="subcategory-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="subcategory-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingSubcategory
                    ? "Update Subcategory"
                    : "Add Subcategory"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}