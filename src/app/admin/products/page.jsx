"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Star,
  Package,
  Upload,
} from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedImages, setSelectedImages] = useState([]);
  const selectedImagePreviewUrls = useRef([]);
  const [selectedMainImage, setSelectedMainImage] = useState(null);
  const [selectedMainImagePreview, setSelectedMainImagePreview] = useState(null);
  const selectedMainImagePreviewUrl = useRef(null);
  const [currentMainImage, setCurrentMainImage] = useState(null);
  const [removeCurrentMainImage, setRemoveCurrentMainImage] = useState(false);

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
    is_featured: false,
    is_best_selling: false,
  });

  const [variants, setVariants] = useState([]);

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => () => {
    selectedImagePreviewUrls.current.forEach((previewUrl) =>
      URL.revokeObjectURL(previewUrl)
    );
    if (selectedMainImagePreviewUrl.current) {
      URL.revokeObjectURL(selectedMainImagePreviewUrl.current);
    }
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/products");

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();

      setProducts(data.products || []);
      setCategories(data.categories || []);
      setSizes(data.sizes || []);
      setColors(data.colors || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load product data");
    } finally {
      setLoading(false);
    }
  }

  async function loadVariantOptions() {
    const [sizesResponse, colorsResponse] = await Promise.all([
      fetch("/api/admin/sizes"),
      fetch("/api/admin/colors"),
    ]);
    const [sizesResult, colorsResult] = await Promise.all([
      sizesResponse.json(),
      colorsResponse.json(),
    ]);

    if (!sizesResponse.ok || !sizesResult.success) {
      throw new Error(sizesResult.message || "Failed to load sizes");
    }

    if (!colorsResponse.ok || !colorsResult.success) {
      throw new Error(colorsResult.message || "Failed to load colors");
    }

    setSizes(Array.isArray(sizesResult.sizes) ? sizesResult.sizes : []);
    setColors(Array.isArray(colorsResult.colors) ? colorsResult.colors : []);
  }

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  function clearSelectedImages() {
    selectedImagePreviewUrls.current.forEach((previewUrl) =>
      URL.revokeObjectURL(previewUrl)
    );
    selectedImagePreviewUrls.current = [];
    setSelectedImages([]);
    if (selectedMainImagePreviewUrl.current) {
      URL.revokeObjectURL(selectedMainImagePreviewUrl.current);
      selectedMainImagePreviewUrl.current = null;
    }
    setSelectedMainImage(null);
    setSelectedMainImagePreview(null);
  }

  function openAddModal() {
    void loadVariantOptions().catch((error) => {
      console.error("Failed to refresh variant options:", error);
    });

    setEditingId(null);

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
      is_featured: false,
      is_best_selling: false,
    });

    setVariants([]);
    clearSelectedImages();
    setCurrentMainImage(null);
    setRemoveCurrentMainImage(false);

    setShowModal(true);
  }

  async function openEditModal(productId) {
    void loadVariantOptions().catch((error) => {
      console.error("Failed to refresh variant options:", error);
    });

    try {
      const response = await fetch(
        `/api/admin/products?id=${productId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load product");
      }

      const product = data.product;

      setEditingId(product.item_id);
      setCurrentMainImage(product.main_image || null);
      setRemoveCurrentMainImage(false);

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
          : "",
        status: product.status || "active",
        is_featured: Boolean(product.is_featured),
        is_best_selling: Boolean(product.is_best_selling),
      });

      setVariants(
        (data.variants || []).map((variant) => ({
          variant_id: variant.variant_id,
          size_id: variant.size_id || "",
          color_id: variant.color_id || "",
          color_mode: "catalog",
          custom_color: "",
          sku: variant.sku || "",
          price: variant.price || "",
          discount: variant.discount || "",
          stock_quantity: variant.stock_quantity || 0,
          status: variant.status || "active",
          existing_image: variant.image || null,
          image: null,
        }))
      );

      clearSelectedImages();
      setShowModal(true);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // --------------------------------------------------
  // IMAGES
  // --------------------------------------------------

  function handleImages(event) {
    const files = Array.from(event.target.files || []);
    const additionalImages = files.slice(0, 4);

    if (files.length > 4) {
      alert("You can select up to 4 additional images.");
    }

    selectedImagePreviewUrls.current.forEach((previewUrl) =>
      URL.revokeObjectURL(previewUrl)
    );

    const selectedFiles = additionalImages.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    selectedImagePreviewUrls.current = selectedFiles.map(
      (image) => image.previewUrl
    );
    setSelectedImages(selectedFiles);
    event.target.value = "";
  }

  function removeAdditionalImage(index) {
    const image = selectedImages[index];

    if (!image) return;

    URL.revokeObjectURL(image.previewUrl);
    selectedImagePreviewUrls.current =
      selectedImagePreviewUrls.current.filter(
        (previewUrl) => previewUrl !== image.previewUrl
      );
    setSelectedImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index)
    );
  }

  function handleMainImage(event) {
    const file = event.target.files?.[0] || null;

    if (selectedMainImagePreviewUrl.current) {
      URL.revokeObjectURL(selectedMainImagePreviewUrl.current);
      selectedMainImagePreviewUrl.current = null;
    }

    const previewUrl = file ? URL.createObjectURL(file) : null;

    setSelectedMainImage(file);
    setSelectedMainImagePreview(previewUrl);
    selectedMainImagePreviewUrl.current = previewUrl;
    setRemoveCurrentMainImage(false);
    event.target.value = "";
  }

  function removeSelectedMainImage() {
    if (selectedMainImagePreviewUrl.current) {
      URL.revokeObjectURL(selectedMainImagePreviewUrl.current);
      selectedMainImagePreviewUrl.current = null;
    }

    setSelectedMainImage(null);
    setSelectedMainImagePreview(null);
  }

  // --------------------------------------------------
  // VARIANTS
  // --------------------------------------------------

  function addVariant() {
    setVariants((previous) => [
      ...previous,
      {
        variant_id: null,
        size_id: "",
        color_id: "",
        color_mode: "catalog",
        custom_color: "",
        sku: "",
        price: "",
        discount: "",
        stock_quantity: 0,
        status: "active",
        image: null,
        existing_image: null,
      },
    ]);
  }

  function removeVariant(index) {
    setVariants((previous) =>
      previous.filter((_, variantIndex) => variantIndex !== index)
    );
  }

  function updateVariant(index, field, value) {
    setVariants((previous) =>
      previous.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  }

  function handleVariantImage(index, file) {
    updateVariant(index, "image", file);
  }

  // --------------------------------------------------
  // SAVE PRODUCT
  // --------------------------------------------------

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter product name");
      return;
    }

    if (!form.price) {
      alert("Please enter product price");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("discount", form.discount || "0");
      formData.append("category_id", form.category_id);
      formData.append("sku", form.sku);
      formData.append("brand", form.brand);
      formData.append("tags", form.tags);
      formData.append("status", form.status);
      formData.append(
        "is_featured",
        form.is_featured ? "1" : "0"
      );
      formData.append(
        "is_best_selling",
        form.is_best_selling ? "1" : "0"
      );
      formData.append("main_image", selectedMainImage || "");
      formData.append(
        "remove_main_image",
        removeCurrentMainImage ? "1" : "0"
      );

      if (editingId) {
        formData.append("item_id", editingId);
      }

      // Product images
      selectedImages.forEach(({ file }) => {
        formData.append("images", file);
      });

      // Variants
      const colorIdByHex = new Map(
        colors
          .filter((color) => color.hex_code)
          .map((color) => [
            color.hex_code.toUpperCase(),
            color.color_id,
          ])
      );
      const customHexCodes = new Set(
        variants
          .filter((variant) => variant.color_mode === "picker")
          .map((variant) => String(variant.custom_color || "").toUpperCase())
      );

      for (const hexCode of customHexCodes) {
        if (!/^#[0-9A-F]{6}$/.test(hexCode)) {
          throw new Error("Choose a valid color for each picked variant.");
        }

        if (colorIdByHex.has(hexCode)) continue;

        const colorResponse = await fetch("/api/admin/colors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: hexCode,
            hex_code: hexCode,
            status: "active",
          }),
        });
        const colorResult = await colorResponse.json();

        if (!colorResponse.ok || !colorResult.success) {
          throw new Error(
            colorResult.message || "Failed to save the picked color"
          );
        }

        colorIdByHex.set(hexCode, colorResult.color_id);
        setColors((currentColors) => [
          ...currentColors,
          {
            color_id: colorResult.color_id,
            name: hexCode,
            hex_code: hexCode,
            status: "active",
          },
        ]);
      }

      const variantData = variants.map((variant) => ({
        variant_id: variant.variant_id || null,
        size_id: variant.size_id || null,
        color_id:
          variant.color_mode === "picker"
            ? colorIdByHex.get(String(variant.custom_color).toUpperCase())
            : variant.color_id || null,
        sku: variant.sku || "",
        price: variant.price || form.price,
        discount: variant.discount || form.discount || 0,
        stock_quantity: Number(variant.stock_quantity || 0),
        status: variant.status || "active",
      }));

      formData.append(
        "variants",
        JSON.stringify(variantData)
      );

      // Variant images
      /*
      variants.forEach((variant, index) => {
        if (variant.image) {
          formData.append(
            `variant_image_${index}`,
            variant.image
          );
        }
      });*/

      const response = await fetch("/api/admin/products", {
        method: editingId ? "PUT" : "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save product"
        );
      }

      alert(
        editingId
          ? "Product updated successfully"
          : "Product added successfully"
      );

      setShowModal(false);

      await loadData();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  async function deleteProduct(itemId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `/api/admin/products?id=${itemId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete product"
        );
      }

      await loadData();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

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

  // --------------------------------------------------
  // PRICE
  // --------------------------------------------------

  function formatPrice(value) {
    return Number(value || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // --------------------------------------------------
  // IMAGE
  // --------------------------------------------------

  function getProductImage(product) {
    if (!product.main_image) return null;

    return product.main_image;
  }

  return (
    <div className="products-page">

      {/* ============================================
          PAGE HEADER
      ============================================ */}

      <div className="products-header">

        <div>
          <h1>Products</h1>
          <p>
            Manage your clothing products, variants and
            inventory.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Product
        </button>

      </div>

      {/* ============================================
          FILTERS
      ============================================ */}

      <div className="product-filter-bar">

        <div className="product-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">
            Out of Stock
          </option>
        </select>

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(event.target.value)
          }
        >
          <option value="all">All Categories</option>

          {categories.map((category) => (
            <option
              key={category.category_id}
              value={category.category_id}
            >
              {category.name}
            </option>
          ))}
        </select>

      </div>

      {/* ============================================
          PRODUCTS TABLE
      ============================================ */}

      <div className="products-card">

        <div className="products-card-header">
          <div>
            <h2>Product List</h2>
            <span>
              {filteredProducts.length} products
            </span>
          </div>
        </div>

        {loading ? (
          <div className="products-loading">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="products-empty">
            <Package size={40} />
            <h3>No products found</h3>
            <p>
              Add your first product to your store.
            </p>
          </div>
        ) : (
          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Variants</th>
                  <th>Status</th>
                  <th>Features</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredProducts.map((product) => {

                  const image =
                    getProductImage(product);

                  return (
                    <tr key={product.item_id}>

                      {/* PRODUCT */}
                      <td>
                        <div className="product-info">

                          <div className="product-image">

                            {image ? (
                              <img
                                src={image}
                                alt={product.title}
                              />
                            ) : (
                              <ImageIcon size={24} />
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
                      <td>
                        <span className="sku">
                          {product.sku || "-"}
                        </span>
                      </td>

                      {/* CATEGORY */}
                      <td>
                        {product.category_name || "-"}
                      </td>

                      {/* PRICE */}
                      <td>

                        <div className="price-cell">
                          <strong>
                            Rs.{" "}
                            {formatPrice(product.price)}
                          </strong>

                          {Number(product.discount) > 0 && (
                            <span>
                              {product.discount}% OFF
                            </span>
                          )}
                        </div>

                      </td>

                      {/* VARIANTS */}
                      <td>
                        <span className="variant-count">
                          {product.variant_count || 0}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`status-badge ${product.status}`}
                        >
                          {product.status.replace(
                            "_",
                            " "
                          )}
                        </span>
                      </td>

                      {/* FEATURES */}
                      <td>
                        <div className="feature-icons">

                          {product.is_featured && (
                            <span title="Featured">
                              <Star
                                size={17}
                                fill="currentColor"
                              />
                            </span>
                          )}

                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td>

                        <div className="table-actions">

                          <button
                            className="edit-btn"
                            onClick={() =>
                              openEditModal(
                                product.item_id
                              )
                            }
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              deleteProduct(
                                product.item_id
                              )
                            }
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ============================================
          PRODUCT MODAL
      ============================================ */}

      {showModal && (
        <div className="modal-overlay">

          <div className="product-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingId
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p>
                  Add product information and variants.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={21} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              {/* ======================================
                  BASIC INFORMATION
              ====================================== */}

              <div className="form-section">

                <div className="section-title">
                  <h3>Basic Information</h3>
                  <span>Product details</span>
                </div>

                <div className="form-grid">

                  <div className="form-group full">
                    <label>
                      Product Name *
                    </label>

                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) =>
                        updateForm(
                          "title",
                          event.target.value
                        )
                      }
                      placeholder="Example: Oversized Cotton T-Shirt"
                      required
                    />
                  </div>

                  <div className="form-group full">
                    <label>Description</label>

                    <RichTextEditor
                      value={form.description}
                      onChange={(value) =>
                        updateForm("description", value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>SKU</label>

                    <input
                      type="text"
                      value={form.sku}
                      onChange={(event) =>
                        updateForm(
                          "sku",
                          event.target.value
                        )
                      }
                      placeholder="VELORA-TS-001"
                    />
                  </div>

                  <div className="form-group">
                    <label>Brand</label>

                    <input
                      type="text"
                      value={form.brand}
                      onChange={(event) =>
                        updateForm(
                          "brand",
                          event.target.value
                        )
                      }
                      placeholder="VELORA"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tags</label>

                    <input
                      type="text"
                      value={form.tags}
                      onChange={(event) =>
                        updateForm(
                          "tags",
                          event.target.value
                        )
                      }
                      placeholder="cotton, casual, t-shirt"
                    />

                    <small>
                      Separate tags using commas.
                    </small>
                  </div>

                </div>

              </div>

              {/* ======================================
                  PRICING
              ====================================== */}

              <div className="form-section">

                <div className="section-title">
                  <h3>Pricing</h3>
                  <span>Default product price</span>
                </div>

                <div className="form-grid">

                  <div className="form-group">
                    <label>Price *</label>

                    <div className="input-prefix">
                      <span>Rs.</span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(event) =>
                          updateForm(
                            "price",
                            event.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Discount (%)</label>

                    <div className="input-suffix">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={form.discount}
                        onChange={(event) =>
                          updateForm(
                            "discount",
                            event.target.value
                          )
                        }
                      />

                      <span>%</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* ======================================
                  CATEGORY & STATUS
              ====================================== */}

              <div className="form-section">

                <div className="section-title">
                  <h3>Category & Status</h3>
                  <span>Product organization</span>
                </div>

                <div className="form-grid">

                  <div className="form-group">
                    <label>Category</label>

                    <select
                      value={form.category_id}
                      onChange={(event) =>
                        updateForm(
                          "category_id",
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Category
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category.category_id}
                          value={category.category_id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>

                    <select
                      value={form.status}
                      onChange={(event) =>
                        updateForm(
                          "status",
                          event.target.value
                        )
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

                </div>

                <div className="checkbox-row">

                  <label className="checkbox-label">

                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(event) =>
                        updateForm(
                          "is_featured",
                          event.target.checked
                        )
                      }
                    />

                    <span>
                      <Star size={16} />
                      Featured Product
                    </span>

                  </label>

            
                </div>

              </div>

              {/* ======================================
                  PRODUCT IMAGES
              ====================================== */}

              <div className="form-section">

                <div className="section-title">
                  <h3>Main Image</h3>
                  <span>
                    Choose the primary image shown for this product
                  </span>
                </div>

                <label className="upload-box">

                  <Upload size={24} />

                  <strong>
                    Click to upload a main image
                  </strong>

                  <span>
                    JPG, PNG or WEBP
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImage}
                  />

                </label>

                {(selectedMainImagePreview || currentMainImage) &&
                  !removeCurrentMainImage && (
                    <div className="product-image-previews">
                      <div className="product-image-preview">
                        <img
                          src={selectedMainImagePreview || currentMainImage}
                          alt={selectedMainImage?.name || "Main product image"}
                        />
                        <span className="product-image-label">Main image</span>
                        <button
                          type="button"
                          aria-label="Remove main image"
                          title="Remove main image"
                          onClick={() => {
                            if (selectedMainImage) {
                              removeSelectedMainImage();
                            } else {
                              setRemoveCurrentMainImage(true);
                            }
                          }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                {removeCurrentMainImage && (
                  <button
                    type="button"
                    className="restore-main-image-button"
                    onClick={() => setRemoveCurrentMainImage(false)}
                  >
                    Undo main image removal
                  </button>
                )}

                <div className="section-title">
                  <h3>Additional Images</h3>
                  <span>
                    Add up to 4 images to the product gallery
                  </span>
                </div>

                <label className="upload-box">

                  <Upload size={24} />

                  <strong>
                    Click to upload additional images
                  </strong>

                  <span>
                    JPG, PNG or WEBP
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImages}
                  />

                </label>

                {selectedImages.length > 0 && (
                  <div className="product-image-previews">
                    {selectedImages.map(
                      ({ file, previewUrl }, index) => (
                        <div
                          className="product-image-preview"
                          key={`${file.name}-${index}`}
                        >
                          <img
                            src={previewUrl}
                            alt={file.name}
                          />
                          <button
                            type="button"
                            aria-label={`Remove ${file.name}`}
                            title="Remove image"
                            onClick={() => removeAdditionalImage(index)}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

              </div>

              {/* ======================================
                  PRODUCT VARIANTS
              ====================================== */}

              <div className="form-section">

                <div className="variant-section-header">

                  <div className="section-title">
                    <h3>Product Variants</h3>

                    <span>
                      Select size and color combinations
                    </span>
                  </div>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={addVariant}
                  >
                    <Plus size={16} />
                    Add Variant
                  </button>

                </div>

                {variants.length === 0 ? (
                  <div className="no-variants">

                    <Package size={30} />

                    <p>
                      No variants added yet.
                    </p>

                    <span>
                      Add variants if this product has
                      different sizes or colors.
                    </span>

                  </div>
                ) : (

                  <div className="variants-list">

                    {variants.map(
                      (variant, index) => (

                        <div
                          className="variant-card"
                          key={
                            variant.variant_id ||
                            `new-${index}`
                          }
                        >

                          <div className="variant-card-header">

                            <strong>
                              Variant {index + 1}
                            </strong>

                            <button
                              type="button"
                              onClick={() =>
                                removeVariant(index)
                              }
                              className="variant-remove"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                          <div className="variant-grid">

                            {/* SIZE */}
                            <div className="form-group">
                              <label>Size</label>

                              <select
                                value={
                                  variant.size_id
                                }
                                onChange={(event) =>
                                  updateVariant(
                                    index,
                                    "size_id",
                                    event.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Select Size
                                </option>

                                {sizes
                                  .filter(
                                    (size) =>
                                      String(size.status).toLowerCase() ===
                                      "active"
                                  )
                                  .map((size) => (
                                    <option
                                      key={
                                        size.size_id
                                      }
                                      value={
                                        size.size_id
                                      }
                                    >
                                      {size.name}
                                    </option>
                                  ))}
                              </select>
                            </div>

                            {/* COLOR */}
                            <div className="form-group variant-color-group">
                              <label>Color</label>

                              <div className="flex items-center gap-2">
                                <select
                                  aria-label={`Saved color for variant ${index + 1}`}
                                  value={variant.color_id}
                                  onChange={(event) => {
                                    updateVariant(index, "color_id", event.target.value);
                                    updateVariant(index, "color_mode", "catalog");
                                  }}
                                  style={{ flex: 1, minWidth: 0 }}
                                >
                                  <option value="">Select saved color</option>

                                  {colors
                                    .filter(
                                      (color) =>
                                        String(color.status).toLowerCase() ===
                                        "active"
                                    )
                                    .map((color) => (
                                      <option
                                        key={color.color_id}
                                        value={color.color_id}
                                      >
                                        {color.name}
                                        {color.hex_code ? ` (${color.hex_code})` : ""}
                                      </option>
                                    ))}
                                </select>

                                <input
                                  type="color"
                                  aria-label={`Pick color for variant ${index + 1}`}
                                  title="Choose a custom color"
                                  value={
                                    variant.color_mode === "picker"
                                      ? variant.custom_color || "#000000"
                                      : colors.find(
                                          (color) =>
                                            String(color.color_id) ===
                                            String(variant.color_id)
                                        )?.hex_code || "#000000"
                                  }
                                  onChange={(event) => {
                                    updateVariant(index, "custom_color", event.target.value);
                                    updateVariant(index, "color_mode", "picker");
                                    updateVariant(index, "color_id", "");
                                  }}
                                  style={{
                                    width: "3.25rem",
                                    minWidth: "3.25rem",
                                    height: "2.75rem",
                                    padding: "4px",
                                  }}
                                />
                                <span className="min-w-16 text-xs font-mono text-[#5D554F]">
                                  {variant.color_mode === "picker"
                                    ? variant.custom_color || "#000000"
                                    : colors.find(
                                        (color) =>
                                          String(color.color_id) ===
                                          String(variant.color_id)
                                      )?.hex_code || "#000000"}
                                </span>
                              </div>
                            </div>

                            {/* SKU */}
                            <div className="form-group">
                              <label>Variant SKU</label>

                              <input
                                type="text"
                                value={variant.sku}
                                onChange={(event) =>
                                  updateVariant(
                                    index,
                                    "sku",
                                    event.target.value
                                  )
                                }
                                placeholder="TS-BLK-M"
                              />
                            </div>

                            {/* PRICE */}
                            <div className="form-group">
                              <label>Price</label>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={variant.price}
                                onChange={(event) =>
                                  updateVariant(
                                    index,
                                    "price",
                                    event.target.value
                                  )
                                }
                                placeholder={
                                  form.price ||
                                  "Product price"
                                }
                              />
                            </div>

                            {/* DISCOUNT */}
                            <div className="form-group">
                              <label>
                                Discount (%)
                              </label>

                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={
                                  variant.discount
                                }
                                onChange={(event) =>
                                  updateVariant(
                                    index,
                                    "discount",
                                    event.target.value
                                  )
                                }
                              />
                            </div>

                            {/* STOCK */}
                            <div className="form-group">
                              <label>
                                Stock Quantity
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  variant.stock_quantity
                                }
                                onChange={(event) =>
                                  updateVariant(
                                    index,
                                    "stock_quantity",
                                    event.target.value
                                  )
                                }
                              />
                            </div>

                            {/* STATUS */}
                            <div className="form-group">
                              <label>Status</label>

                              <select
                                value={
                                  variant.status
                                }
                                onChange={(event) =>
                                  updateVariant(
                                    index,
                                    "status",
                                    event.target.value
                                  )
                                }
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
                            
                            <div className="form-group">
                              <label>
                                Variant Image
                              </label>

                              <input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                  handleVariantImage(
                                    index,
                                    event.target.files?.[0] ||
                                      null
                                  )
                                }
                              />

                              {variant.image && (
                                <small>
                                  {
                                    variant.image.name
                                  }
                                </small>
                              )}

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* ======================================
                  MODAL FOOTER
              ====================================== */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowModal(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Product"
                    : "Save Product"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}