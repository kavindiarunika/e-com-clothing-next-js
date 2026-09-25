"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Star,
  Flame,
  Save,
} from "lucide-react";

export default function ProductFormPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id;

  const isAddMode = id === "add";
  const isEditMode = !isAddMode;

  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);

  const [images, setImages] = useState([]);

  const [dragActive, setDragActive] =
    useState(false);

  const [loading, setLoading] =
    useState(isEditMode);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    discount: "0",
    category_id: "",
    sku: "",
    brand: "",
    tags: "",
    status: "active",
    is_featured: false,
    is_best_selling: false,
  });

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  async function fetchCategories() {
    try {
      const response = await fetch(
        "/api/admin/categories"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load categories"
        );
      }

      setCategories(
        data.categories || []
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load categories"
      );
    }
  }

  // =====================================================
  // FETCH PRODUCT
  // =====================================================

  async function fetchProduct() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/products/${id}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load product"
        );
      }

      const product =
        data.product;

      setForm({
        title:
          product.title || "",

        description:
          product.description || "",

        price:
          product.price || "",

        discount:
          product.discount || "0",

        category_id:
          product.category_id || "",

        sku:
          product.sku || "",

        brand:
          product.brand || "",

        tags: Array.isArray(
          product.tags
        )
          ? product.tags.join(", ")
          : product.tags || "",

        status:
          product.status ||
          "active",

        is_featured:
          Boolean(
            product.is_featured
          ),

        is_best_selling:
          Boolean(
            product.is_best_selling
          ),
      });

      // Existing images
      setImages(
        data.images || []
      );

    } catch (err) {
      setError(
        err.message ||
          "Failed to load product"
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchCategories();

    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  function handleChange(e) {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  // =====================================================
  // HANDLE FILES
  // =====================================================

  function handleFiles(fileList) {
    const selectedFiles =
      Array.from(fileList);

    const imageFiles =
      selectedFiles.filter(
        (file) =>
          file.type.startsWith(
            "image/"
          )
      );

    if (imageFiles.length === 0) {
      setError(
        "Please select image files only."
      );
      return;
    }

    const newImages =
      imageFiles.map((file) => ({
        id:
          `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,

        file,

        preview:
          URL.createObjectURL(file),

        isNew: true,

        isMain: false,
      }));

    setImages((previous) => {
      const updated = [
        ...previous,
        ...newImages,
      ];

      // If there is no main image,
      // make the first image main.
      if (
        !updated.some(
          (image) =>
            image.isMain
        )
      ) {
        updated[0].isMain = true;
      }

      return updated;
    });

    setError("");
  }

  // =====================================================
  // FILE INPUT
  // =====================================================

  function handleFileInput(e) {
    if (e.target.files) {
      handleFiles(
        e.target.files
      );
    }

    e.target.value = "";
  }

  // =====================================================
  // DRAG EVENTS
  // =====================================================

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFiles(
        e.dataTransfer.files
      );
    }
  }

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  function removeImage(imageId) {
    setImages((previous) => {
      const imageToRemove =
        previous.find(
          (image) =>
            image.id === imageId
        );

      if (
        imageToRemove?.preview &&
        imageToRemove.isNew
      ) {
        URL.revokeObjectURL(
          imageToRemove.preview
        );
      }

      const updated =
        previous.filter(
          (image) =>
            image.id !== imageId
        );

      // If removed image was main,
      // make first remaining image main.
      if (
        imageToRemove?.isMain &&
        updated.length > 0
      ) {
        updated[0].isMain = true;
      }

      return updated;
    });
  }

  // =====================================================
  // SET MAIN IMAGE
  // =====================================================

  function setMainImage(imageId) {
    setImages((previous) =>
      previous.map(
        (image) => ({
          ...image,
          isMain:
            image.id === imageId,
        })
      )
    );
  }

  // =====================================================
  // SAVE PRODUCT
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (
        isAddMode &&
        images.length === 0
      ) {
        throw new Error(
          "Please add at least one product image."
        );
      }

      const formData =
        new FormData();

      // =================================================
      // PRODUCT DATA
      // =================================================

      formData.append(
        "title",
        form.title
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "price",
        form.price
      );

      formData.append(
        "discount",
        form.discount
      );

      if (form.category_id) {
        formData.append(
          "category_id",
          form.category_id
        );
      }

      formData.append(
        "sku",
        form.sku
      );

      formData.append(
        "brand",
        form.brand
      );

      formData.append(
        "tags",
        JSON.stringify(
          form.tags
            ? form.tags
                .split(",")
                .map((tag) =>
                  tag.trim()
                )
                .filter(Boolean)
            : []
        )
      );

      formData.append(
        "status",
        form.status
      );

      formData.append(
        "is_featured",
        form.is_featured
          ? "1"
          : "0"
      );

      formData.append(
        "is_best_selling",
        form.is_best_selling
          ? "1"
          : "0"
      );

      // =================================================
      // IMAGES
      // =================================================

      images.forEach(
        (image, index) => {
          if (image.isNew) {
            formData.append(
              "images",
              image.file
            );
          }

          formData.append(
            "image_order",
            JSON.stringify({
              index,
              isMain:
                image.isMain,
            })
          );
        }
      );

      // =================================================
      // API
      // =================================================

      const url = isAddMode
        ? "/api/admin/products"
        : `/api/admin/products/${id}`;

      const method = isAddMode
        ? "POST"
        : "PUT";

      const response =
        await fetch(url, {
          method,
          body: formData,
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save product"
        );
      }

      router.push(
        "/admin/products"
      );

      router.refresh();

    } catch (err) {
      setError(
        err.message ||
          "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-table-loading">
        Loading product...
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="admin-product-form-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-page-header">

        <div>

          <h1>
            {isAddMode
              ? "Add Product"
              : "Edit Product"}
          </h1>

          <p>
            {isAddMode
              ? "Add a new clothing product."
              : "Update product information."}
          </p>

        </div>

        <Link
          href="/admin/products"
          className="secondary-button"
        >
          <ArrowLeft size={18} />
          Back to Products
        </Link>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="admin-product-form"
      >

        {/* =================================================
            IMAGE UPLOAD
        ================================================= */}

        <div className="admin-card">

          <div className="form-section-header">

            <div>
              <h2>
                Product Images
              </h2>

              <p>
                Upload product images.
                The first image can be
                selected as the main image.
              </p>
            </div>

          </div>

          {/* DRAG & DROP */}

          <div
            className={`product-dropzone ${
              dragActive
                ? "drag-active"
                : ""
            }`}
            onDragOver={
              handleDragOver
            }
            onDragLeave={
              handleDragLeave
            }
            onDrop={handleDrop}
            onClick={() =>
              fileInputRef.current?.click()
            }
          >

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={
                handleFileInput
              }
            />

            <div className="dropzone-icon">
              <Upload size={30} />
            </div>

            <h3>
              Drag & Drop Images Here
            </h3>

            <p>
              or click to browse
            </p>

            <span>
              PNG, JPG, JPEG, WEBP
            </span>

          </div>

          {/* IMAGE PREVIEWS */}

          {images.length > 0 && (
            <div className="product-image-grid">

              {images.map(
                (image, index) => (
                  <div
                    key={image.id}
                    className={`product-image-card ${
                      image.isMain
                        ? "main-image"
                        : ""
                    }`}
                  >

                    {/* IMAGE */}

                    <div className="product-preview">

                      <img
                        src={
                          image.preview ||
                          image.url
                        }
                        alt={`Product image ${
                          index + 1
                        }`}
                      />

                      {image.isMain && (
                        <span className="main-image-badge">
                          Main Image
                        </span>
                      )}

                    </div>

                    {/* CONTROLS */}

                    <div className="product-image-controls">

                      <button
                        type="button"
                        className={
                          image.isMain
                            ? "main-image-button active"
                            : "main-image-button"
                        }
                        onClick={() =>
                          setMainImage(
                            image.id
                          )
                        }
                      >
                        <Star
                          size={15}
                        />

                        {image.isMain
                          ? "Main"
                          : "Set Main"}
                      </button>

                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() =>
                          removeImage(
                            image.id
                          )
                        }
                      >
                        <X
                          size={16}
                        />
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* =================================================
            PRODUCT INFORMATION
        ================================================= */}

        <div className="admin-card">

          <div className="form-section-header">

            <div>
              <h2>
                Product Information
              </h2>

              <p>
                Enter the basic product
                information.
              </p>
            </div>

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
              onChange={
                handleChange
              }
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
              value={
                form.description
              }
              onChange={
                handleChange
              }
              placeholder="Enter product description"
              rows={5}
            />

          </div>

          {/* PRICE / DISCOUNT */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Price *
              </label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={
                  handleChange
                }
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
                value={
                  form.discount
                }
                onChange={
                  handleChange
                }
                placeholder="10"
                min="0"
                step="0.01"
              />

            </div>

          </div>

          {/* CATEGORY / SKU */}

          <div className="form-row">

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
                        category.title}
                    </option>
                  )
                )}

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
                onChange={
                  handleChange
                }
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
              onChange={
                handleChange
              }
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
              onChange={
                handleChange
              }
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

          {/* FEATURES */}

          <div className="product-options">

            <label className="checkbox-option">

              <input
                type="checkbox"
                name="is_featured"
                checked={
                  form.is_featured
                }
                onChange={
                  handleChange
                }
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
                checked={
                  form.is_best_selling
                }
                onChange={
                  handleChange
                }
              />

              <span>
                <Flame size={16} />
                Best Selling Product
              </span>

            </label>

          </div>

        </div>

        {/* =================================================
            SAVE BUTTONS
        ================================================= */}

        <div className="product-form-actions">

          <Link
            href="/admin/products"
            className="cancel-btn"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="save-product-btn"
            disabled={saving}
          >

            <Save size={18} />

            {saving
              ? "Saving..."
              : isAddMode
              ? "Add Product"
              : "Update Product"}

          </button>

        </div>

      </form>

    </div>
  );
}