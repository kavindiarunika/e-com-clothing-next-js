
"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";

export default function CategoriesPage() {
  // =====================================================
  // STATE
  // =====================================================

  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // EMPTY FORM
  // =====================================================

  const emptyForm = {
    name: "",
    description: "",
    image: "",
    parent_category_id: "",
    status: "active",
  };

  const [form, setForm] = useState(emptyForm);

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  async function fetchCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/categories");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load categories"
        );
      }

      setCategories(data.categories || data.data || []);
    } catch (err) {
      console.error("Category fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  // =====================================================
  // HANDLE FORM CHANGE
  // =====================================================

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  function openAddModal() {
    setEditingCategory(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  function openEditModal(category) {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
      parent_category_id:
        category.parent_category_id || "",
      status: category.status || "active",
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
    setEditingCategory(null);
    setForm(emptyForm);
    setError("");
  }

  // =====================================================
  // SUBMIT CATEGORY
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        parent_category_id: form.parent_category_id
          ? Number(form.parent_category_id)
          : null,
        status: form.status,
      };

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.category_id}`
        : "/api/admin/categories";

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText };
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save category"
        );
      }

      closeModal();

      await fetchCategories();
    } catch (err) {
      console.error("Save category error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // DELETE CATEGORY
  // =====================================================

  async function handleDelete(categoryId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/admin/categories/${categoryId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete category"
        );
      }

      await fetchCategories();
    } catch (err) {
      console.error("Delete category error:", err);
      setError(err.message);
    }
  }

  // =====================================================
  // GET PARENT CATEGORY NAME
  // =====================================================

  function getParentCategoryName(parentId) {
    if (!parentId) {
      return "Main Category";
    }

    const parent = categories.find(
      (category) =>
        String(category.category_id) ===
        String(parentId)
    );

    return parent?.name || "Unknown";
  }

  // =====================================================
  // FILTER CATEGORIES
  // =====================================================

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

  // =====================================================
  // SEPARATE MAIN / SUB CATEGORIES
  // =====================================================

  const mainCategories = filteredCategories.filter(
    (category) =>
      !category.parent_category_id
  );

  const subCategories = filteredCategories.filter(
    (category) =>
      category.parent_category_id
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin-category-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="category-page-header">

        <div>
          <h1>Categories</h1>

          <p>
            Manage your product categories
          </p>
        </div>

        <button
          className="add-category-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Category
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && !showModal && (
        <div className="category-error">
          {error}
        </div>
      )}

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="category-filters">

        {/* SEARCH */}

        <div className="category-search">

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

        {/* STATUS */}

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
        </select>

      </div>

      {/* =================================================
          CATEGORY TABLE
      ================================================= */}

      <div className="category-table-card">

        <div className="category-table-wrapper">

          <table className="category-table">

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
                    className="category-table-message"
                  >
                    Loading categories...
                  </td>

                </tr>

              ) : filteredCategories.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="category-table-message"
                  >
                    No categories found.
                  </td>

                </tr>

              ) : (

                <>
                  {/* MAIN CATEGORIES */}

                  {mainCategories.map(
                    (category) => (
                      <CategoryRow
                        key={category.category_id}
                        category={category}
                        getParentCategoryName={
                          getParentCategoryName
                        }
                        openEditModal={
                          openEditModal
                        }
                        handleDelete={
                          handleDelete
                        }
                        isSubCategory={false}
                      />
                    )
                  )}

                  {/* SUB CATEGORIES */}

                  {subCategories.map(
                    (category) => (
                      <CategoryRow
                        key={category.category_id}
                        category={category}
                        getParentCategoryName={
                          getParentCategoryName
                        }
                        openEditModal={
                          openEditModal
                        }
                        handleDelete={
                          handleDelete
                        }
                        isSubCategory={true}
                      />
                    )
                  )}
                </>

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
          className="category-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !saving
            ) {
              closeModal();
            }
          }}
        >

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
                    ? "Update category information"
                    : "Create a new product category"}
                </p>

              </div>

              <button
                className="category-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              className="category-form"
              onSubmit={handleSubmit}
            >

              {error && (
                <div className="category-error">
                  {error}
                </div>
              )}

              {/* NAME */}

              <div className="category-form-group">

                <label>
                  Category Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Dresses"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div className="category-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter category description"
                  rows="4"
                />

              </div>

              {/* IMAGE */}

              <div className="category-form-group">

                <label>
                  Category Image
                </label>

                <input
                  type="text"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="Enter image URL"
                />

                {form.image && (
                  <div className="category-image-preview">

                    <img
                      src={form.image}
                      alt="Category preview"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>
                )}

              </div>

              {/* PARENT CATEGORY */}

              <div className="category-form-group">

                <label>
                  Parent Category
                </label>

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
                        !category.parent_category_id &&
                        category.category_id !==
                          editingCategory?.category_id
                    )
                    .map((category) => (

                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.name}
                      </option>

                    ))}

                </select>

                <small>
                  Select a parent category to create
                  a subcategory.
                </small>

              </div>

              {/* STATUS */}

              <div className="category-form-group">

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

              {/* ACTIONS */}

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
                    : "Add Category"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   CATEGORY ROW COMPONENT
========================================================= */

function CategoryRow({
  category,
  getParentCategoryName,
  openEditModal,
  handleDelete,
  isSubCategory,
}) {
  return (
    <tr>

      {/* CATEGORY */}

      <td>

        <div
          className={`category-info ${
            isSubCategory
              ? "subcategory-info"
              : ""
          }`}
        >

          {isSubCategory && (
            <ChevronRight
              size={16}
              className="subcategory-icon"
            />
          )}

          <div className="category-image">

            {category.image ? (

              <img
                src={category.image}
                alt={category.name}
              />

            ) : (

              <ImageIcon size={21} />

            )}

          </div>

          <div>

            <div className="category-name">
              {category.name}
            </div>

            {isSubCategory && (
              <div className="subcategory-label">
                Subcategory
              </div>
            )}

          </div>

        </div>

      </td>

      {/* DESCRIPTION */}

      <td>

        <div className="category-description">

          {category.description
            ? category.description
            : "-"}

        </div>

      </td>

      {/* PARENT */}

      <td>

        <span
          className={
            category.parent_category_id
              ? "parent-category"
              : "main-category"
          }
        >
          {getParentCategoryName(
            category.parent_category_id
          )}
        </span>

      </td>

      {/* STATUS */}

      <td>

        <span
          className={`category-status ${category.status}`}
        >
          {category.status === "active"
            ? "Active"
            : "Inactive"}
        </span>

      </td>

      {/* CREATED */}

      <td>

        <span className="category-created">

          {category.created_at
            ? new Date(
                category.created_at
              ).toLocaleDateString("en-LK", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "-"}

        </span>

      </td>

      {/* ACTIONS */}

      <td>

        <div className="category-actions">

          <button
            className="category-edit-btn"
            onClick={() =>
              openEditModal(category)
            }
            title="Edit Category"
          >
            <Pencil size={16} />
          </button>

          <button
            className="category-delete-btn"
            onClick={() =>
              handleDelete(category.category_id)
            }
            title="Delete Category"
          >
            <Trash2 size={16} />
          </button>

        </div>

      </td>

    </tr>
  );
}

