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

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    discount: "",
    category_id: "",
    sku: "",
    brand: "",
    tags: "",
    status: "active",
    main_image: null,
    images: [],
  });

  const [mainImagePreview, setMainImagePreview] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/products");

      if (!res.ok) {
        throw new Error("Failed to load products");
      }

      const data = await res.json();

      setProducts(data.products || []);
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FETCH CATEGORIES
  ===================================================== */

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");

      if (!res.ok) {
        return;
      }

      const data = await res.json();

      setCategories(data.categories || []);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  /* =====================================================
     RESET FORM
  ===================================================== */

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      price: "",
      discount: "",
      category_id: "",
      sku: "",
      brand: "",
      tags: "",
      status: "active",
      main_image: null,
      images: [],
    });

    setMainImagePreview("");
    setImagePreviews([]);
    setEditingProduct(null);
  };

  /* =====================================================
     OPEN ADD MODAL
  ===================================================== */

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  /* =====================================================
     OPEN EDIT MODAL
  ===================================================== */

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      title: product.title || "",
      description: product.description || "",
      price: product.price || "",
      discount: product.discount || "",
      category_id: product.category_id || "",
      sku: product.sku || "",
      brand: product.brand || "",
      tags: Array.isArray(product.tags)
        ? product.tags.join(", ")
        : product.tags || "",
      status: product.status || "active",
      main_image: null,
      images: [],
    });

    if (product.main_image) {
      setMainImagePreview(getImageUrl(product));
    } else {
      setMainImagePreview("");
    }

    setImagePreviews([]);

    setShowModal(true);
  };

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  /* =====================================================
     HANDLE FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     MAIN IMAGE
  ===================================================== */

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      main_image: file,
    }));

    const reader = new FileReader();

    reader.onloadend = () => {
      setMainImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  /* =====================================================
     ADDITIONAL IMAGES
  ===================================================== */

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

    setForm((prev) => ({
      ...prev,
      images: files,
    }));

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setImagePreviews(previews);
  };

  /* =====================================================
     SUBMIT FORM
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Product title is required.");
      return;
    }

    if (!form.price) {
      alert("Product price is required.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("discount", form.discount || "0");
      formData.append(
        "category_id",
        form.category_id
      );
      formData.append("sku", form.sku);
      formData.append("brand", form.brand);
      formData.append("status", form.status);

      formData.append(
        "tags",
        JSON.stringify(
          form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        )
      );

      if (form.main_image) {
        formData.append(
          "main_image",
          form.main_image
        );
      }

      form.images.forEach((image) => {
        formData.append("images", image);
      });

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.item_id}`
        : "/api/admin/products";

      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to save product"
        );
      }

      await fetchProducts();

      setShowModal(false);
      resetForm();

      alert(
        editingProduct
          ? "Product updated successfully."
          : "Product added successfully."
      );
    } catch (error) {
      console.error("Save product error:", error);

      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE PRODUCT
  ===================================================== */

  const handleDelete = async (itemId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/admin/products/${itemId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to delete product"
        );
      }

      setProducts((prev) =>
        prev.filter(
          (product) => product.item_id !== itemId
        )
      );
    } catch (error) {
      console.error("Delete product error:", error);

      alert(error.message);
    }
  };

  /* =====================================================
     IMAGE URL
  ===================================================== */

  const getImageUrl = (product) => {
    if (!product.main_image) {
      return null;
    }

    if (
      product.main_image.startsWith("/") ||
      product.main_image.startsWith("http") ||
      product.main_image.startsWith("data:")
    ) {
      return product.main_image;
    }

    return `data:image/jpeg;base64,${product.main_image}`;
  };

  /* =====================================================
     CATEGORY NAME
  ===================================================== */

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (cat) =>
        String(cat.category_id) ===
        String(categoryId)
    );

    return (
      category?.name ||
      category?.category_name ||
      "Uncategorized"
    );
  };

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */

  const filteredProducts = products.filter(
    (product) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        product.title
          ?.toLowerCase()
          .includes(searchText) ||
        product.sku
          ?.toLowerCase()
          .includes(searchText) ||
        product.brand
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        product.status === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );

  return (
    <div className="products-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="products-header">
        <div>
          <h1>Products</h1>

          <p>
            Manage your VELORA clothing products,
            pricing and inventory.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* =================================================
          SEARCH / FILTER
      ================================================= */}

      <div className="products-toolbar">

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

        <select
          className="status-filter"
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
          PRODUCTS TABLE
      ================================================= */}

      <div className="products-table-wrapper">

        {loading ? (
          <div className="products-loading">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="products-empty">

            <ImageIcon size={40} />

            <h3>
              No products found
            </h3>

            <p>
              Add your first product to start
              managing your store.
            </p>

            <button
              className="primary-button"
              onClick={openAddModal}
            >
              <Plus size={18} />
              Add Product
            </button>

          </div>
        ) : (
          <table className="products-table">

            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredProducts.map(
                (product) => (
                  <tr
                    key={product.item_id}
                  >

                    {/* PRODUCT */}

                    <td>
                      <div className="product-info">

                        <div className="product-image">

                          {getImageUrl(
                            product
                          ) ? (
                            <img
                              src={getImageUrl(
                                product
                              )}
                              alt={
                                product.title
                              }
                            />
                          ) : (
                            <ImageIcon
                              size={22}
                            />
                          )}

                        </div>

                        <div>

                          <strong>
                            {product.title}
                          </strong>

                          {product.brand && (
                            <span>
                              {product.brand}
                            </span>
                          )}

                        </div>

                      </div>
                    </td>

                    {/* SKU */}

                    <td className="sku-cell">
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

                      <div className="price-cell">

                        <strong>
                          Rs.{" "}
                          {Number(
                            product.price || 0
                          ).toLocaleString()}
                        </strong>

                        {Number(
                          product.discount || 0
                        ) > 0 && (
                          <span>
                            {
                              product.discount
                            }
                            % OFF
                          </span>
                        )}

                      </div>

                    </td>

                    {/* STATUS */}

                    <td>

                      <span
                        className={`status-badge status-${product.status}`}
                      >
                        {product.status ===
                        "out_of_stock"
                          ? "Out of Stock"
                          : product.status}
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="action-buttons">

                        <button
                          className="icon-button edit"
                          title="Edit"
                          onClick={() =>
                            openEditModal(
                              product
                            )
                          }
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="icon-button delete"
                          title="Delete"
                          onClick={() =>
                            handleDelete(
                              product.item_id
                            )
                          }
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>
        )}

      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (
        <div className="product-modal-overlay">

          <div className="product-modal">

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p>
                  {editingProduct
                    ? "Update product information."
                    : "Add a new product to your store."}
                </p>

              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                <X size={21} />
              </button>

            </div>

            {/* FORM */}

            <form
              className="product-form"
              onSubmit={handleSubmit}
            >

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <div className="form-section">

                <h3>
                  Basic Information
                </h3>

                <div className="form-grid">

                  <div className="form-group full">

                    <label>
                      Product Name *
                    </label>

                    <input
                      name="title"
                      value={form.title}
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Premium Oversized T-Shirt"
                      required
                    />

                  </div>

                  <div className="form-group full">

                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={
                        form.description
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter product description..."
                      rows={4}
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      SKU
                    </label>

                    <input
                      name="sku"
                      value={form.sku}
                      onChange={
                        handleChange
                      }
                      placeholder="VELORA-TS-001"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Brand
                    </label>

                    <input
                      name="brand"
                      value={form.brand}
                      onChange={
                        handleChange
                      }
                      placeholder="VELORA"
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  PRICING
              ================================================= */}

              <div className="form-section">

                <h3>
                  Pricing
                </h3>

                <div className="form-grid">

                  <div className="form-group">

                    <label>
                      Price *
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      value={form.price}
                      onChange={
                        handleChange
                      }
                      placeholder="0.00"
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Discount (%)
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      name="discount"
                      value={
                        form.discount
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0"
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  CATEGORY
              ================================================= */}

              <div className="form-section">

                <h3>
                  Category
                </h3>

                <div className="form-grid">

                  <div className="form-group">

                    <label>
                      Category
                    </label>

                    <select
                      name="category_id"
                      value={
                        form.category_id
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="">
                        Select Category
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={
                              category.category_id
                            }
                            value={
                              category.category_id
                            }
                          >
                            {category.name ||
                              category.category_name}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Status
                    </label>

                    <select
                      name="status"
                      value={
                        form.status
                      }
                      onChange={
                        handleChange
                      }
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

                  <div className="form-group full">

                    <label>
                      Tags
                    </label>

                    <input
                      name="tags"
                      value={form.tags}
                      onChange={
                        handleChange
                      }
                      placeholder="t-shirt, men, casual, cotton"
                    />

                    <small>
                      Separate tags using
                      commas.
                    </small>

                  </div>

                </div>

              </div>

              {/* =================================================
                  MAIN IMAGE
              ================================================= */}

              <div className="form-section">

                <h3>
                  Main Product Image
                </h3>

                <div className="image-upload-area">

                  {mainImagePreview ? (
                    <div className="main-image-preview">

                      <img
                        src={
                          mainImagePreview
                        }
                        alt="Main product"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setMainImagePreview(
                            ""
                          );

                          setForm(
                            (prev) => ({
                              ...prev,
                              main_image:
                                null,
                            })
                          );
                        }}
                      >
                        <X size={16} />
                      </button>

                    </div>
                  ) : (
                    <label className="upload-box">

                      <ImageIcon
                        size={30}
                      />

                      <strong>
                        Upload Main Image
                      </strong>

                      <span>
                        JPG, PNG or WEBP
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleMainImageChange
                        }
                      />

                    </label>
                  )}

                </div>

              </div>

              {/* =================================================
                  ADDITIONAL IMAGES
              ================================================= */}

              <div className="form-section">

                <h3>
                  Additional Product Images
                </h3>

                <label className="upload-box small">

                  <ImageIcon
                    size={25}
                  />

                  <strong>
                    Select Multiple Images
                  </strong>

                  <span>
                    You can select multiple
                    images.
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={
                      handleImagesChange
                    }
                  />

                </label>

                {imagePreviews.length >
                  0 && (
                  <div className="image-preview-grid">

                    {imagePreviews.map(
                      (
                        preview,
                        index
                      ) => (
                        <div
                          className="additional-image"
                          key={index}
                        >
                          <img
                            src={preview}
                            alt={`Product ${
                              index + 1
                            }`}
                          />
                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
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