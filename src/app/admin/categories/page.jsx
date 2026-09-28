"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
} from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    parent_category_id: "",
    status: "active",
    image: null,
  });

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/categories");

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();

      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch categories error:", error);
      alert("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // IMAGE CHANGE
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    setForm((prev) => ({
      ...prev,
      image: file,
    }));
  };

  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const openAddModal = () => {
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
      parent_category_id: "",
      status: "active",
      image: null,
    });

    setShowModal(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const openEditModal = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
      parent_category_id:
        category.parent_category_id || "",
      status: category.status || "active",
      image: null,
    });

    setShowModal(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCategory(null);
  };

  // ==========================================
  // SAVE CATEGORY
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append(
        "description",
        form.description || ""
      );

      formData.append(
        "parent_category_id",
        form.parent_category_id || ""
      );

      formData.append("status", form.status);

      if (form.image) {
        formData.append("image", form.image);
      }

      let response;

      if (editingCategory) {
        response = await fetch(
          `/api/admin/categories/${editingCategory.category_id}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        response = await fetch(
          "/api/admin/categories",
          {
            method: "POST",
            body: formData,
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save category."
        );
      }

      setShowModal(false);
      setEditingCategory(null);

      await fetchCategories();

      alert(
        editingCategory
          ? "Category updated successfully."
          : "Category created successfully."
      );
    } catch (error) {
      console.error("Save category error:", error);

      alert(error.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/categories/${category.category_id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete category."
        );
      }

      await fetchCategories();

      alert("Category deleted successfully.");
    } catch (error) {
      console.error("Delete category error:", error);

      alert(
        error.message || "Failed to delete category."
      );
    }
  };

  // ==========================================
  // FILTER CATEGORIES
  // ==========================================

  const filteredCategories = categories.filter(
    (category) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        category.name
          ?.toLowerCase()
          .includes(searchText) ||
        category.description
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        category.status === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );

  // ==========================================
  // GET PARENT NAME
  // ==========================================

  const getParentName = (parentId) => {
    if (!parentId) return "Main Category";

    const parent = categories.find(
      (category) =>
        Number(category.category_id) ===
        Number(parentId)
    );

    return parent ? parent.name : "Main Category";
  };

  return (
    <div className="admin-categories">
      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="categories-header">
        <div>
          <h1>Categories</h1>

          <p>
            Manage product categories and
            subcategories.
          </p>
        </div>

        <button
          className="categories-add-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />

          Add Category
        </button>
      </div>

      {/* =====================================
          FILTER BAR
      ====================================== */}

      <div className="categories-toolbar">
        <div className="categories-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          className="categories-status-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">
            Inactive
          </option>
        </select>
      </div>

      {/* =====================================
          CATEGORY TABLE
      ====================================== */}

      <div className="categories-table-card">
        <div className="categories-table-wrapper">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Parent Category</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="categories-empty"
                  >
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="categories-empty"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map(
                  (category) => (
                    <tr
                      key={category.category_id}
                    >
                      {/* CATEGORY */}

                      <td>
                        <div className="category-product">
                          <div className="category-image">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                              />
                            ) : (
                              <ImageIcon
                                size={20}
                              />
                            )}
                          </div>

                          <div>
                            <strong>
                              {category.name}
                            </strong>

                            <span>
                              ID #
                              {
                                category.category_id
                              }
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* DESCRIPTION */}

                      <td>
                        <span className="category-description">
                          {category.description ||
                            "No description"}
                        </span>
                      </td>

                      {/* PARENT */}

                      <td>
                        <span className="category-parent">
                          {getParentName(
                            category.parent_category_id
                          )}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`category-status ${category.status}`}
                        >
                          {category.status ===
                          "active"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* CREATED */}

                      <td>
                        {category.created_at
                          ? new Date(
                              category.created_at
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="category-actions">
                          <button
                            className="category-edit-btn"
                            onClick={() =>
                              openEditModal(
                                category
                              )
                            }
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="category-delete-btn"
                            onClick={() =>
                              handleDelete(
                                category
                              )
                            }
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================
          ADD / EDIT MODAL
      ====================================== */}

      {showModal && (
        <div className="category-modal-overlay">
          <div className="category-modal">
            {/* MODAL HEADER */}

            <div className="category-modal-header">
              <div>
                <h2>
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p>
                  {editingCategory
                    ? "Update category information."
                    : "Create a new product category."}
                </p>
              </div>

              <button
                className="category-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="category-form"
            >
              {/* CATEGORY NAME */}

              <div className="category-form-group">
                <label>
                  Category Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Women"
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div className="category-form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter category description..."
                  rows="4"
                />
              </div>

              {/* PARENT CATEGORY */}

              <div className="category-form-group">
                <label>Parent Category</label>

                <select
                  name="parent_category_id"
                  value={form.parent_category_id}
                  onChange={handleChange}
                >
                  <option value="">
                    Main Category
                  </option>

                  {categories
                    .filter(
                      (category) =>
                        !editingCategory ||
                        Number(
                          category.category_id
                        ) !==
                          Number(
                            editingCategory.category_id
                          )
                    )
                    .map((category) => (
                      <option
                        key={
                          category.category_id
                        }
                        value={
                          category.category_id
                        }
                      >
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* STATUS */}

              <div className="category-form-group">
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
                </select>
              </div>

              {/* IMAGE */}

              <div className="category-form-group">
                <label>Category Image</label>

                <div className="category-upload">
                  <ImageIcon size={24} />

                  <div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                    />

                    <small>
                      JPG, PNG or WEBP
                    </small>
                  </div>
                </div>

                {/* CURRENT IMAGE */}

                {editingCategory &&
                  editingCategory.image &&
                  !form.image && (
                    <div className="current-category-image">
                      <img
                        src={editingCategory.image}
                        alt="Current"
                      />

                      <span>
                        Current image
                      </span>
                    </div>
                  )}

                {/* NEW IMAGE */}

                {form.image && (
                  <div className="selected-category-image">
                    <span>
                      Selected: {form.image.name}
                    </span>
                  </div>
                )}
              </div>

              {/* BUTTONS */}

              <div className="category-form-actions">
                <button
                  type="button"
                  className="category-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="category-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}