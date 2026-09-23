"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  X,
} from "lucide-react";

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [filteredBanners, setFilteredBanners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    button_text: "",
    button_link: "",
    sort_order: 0,
    start_date: "",
    end_date: "",
    status: "active",
  });

  /* =========================================
     LOAD BANNERS
  ========================================= */

  const loadBanners = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/banners");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load banners");
      }

      setBanners(data.banners || []);
    } catch (error) {
      console.error("Load banners error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  /* =========================================
     FILTER BANNERS
  ========================================= */

  useEffect(() => {
    let result = [...banners];

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      result = result.filter((banner) =>
        [
          banner.banner_id,
          banner.title,
          banner.subtitle,
          banner.button_text,
          banner.button_link,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(searchValue)
          )
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (banner) => banner.status === statusFilter
      );
    }

    setFilteredBanners(result);
  }, [search, statusFilter, banners]);

  /* =========================================
     OPEN ADD MODAL
  ========================================= */

  const openAddModal = () => {
    setEditingBanner(null);

    setFormData({
      title: "",
      subtitle: "",
      image: "",
      button_text: "",
      button_link: "",
      sort_order: 0,
      start_date: "",
      end_date: "",
      status: "active",
    });

    setShowModal(true);
  };

  /* =========================================
     OPEN EDIT MODAL
  ========================================= */

  const openEditModal = (banner) => {
    setEditingBanner(banner);

    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image: banner.image || "",
      button_text: banner.button_text || "",
      button_link: banner.button_link || "",
      sort_order: banner.sort_order ?? 0,
      start_date: formatDateTimeForInput(banner.start_date),
      end_date: formatDateTimeForInput(banner.end_date),
      status: banner.status || "active",
    });

    setShowModal(true);
  };

  /* =========================================
     DATE FORMAT
  ========================================= */

  const formatDateTimeForInput = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  /* =========================================
     HANDLE FORM
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
     SAVE BANNER
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image.trim()) {
      alert("Banner image URL is required.");
      return;
    }

    try {
      setSaving(true);

      const url = editingBanner
        ? `/api/admin/banners/${editingBanner.banner_id}`
        : "/api/admin/banners";

      const method = editingBanner ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          sort_order: Number(formData.sort_order) || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save banner");
      }

      setShowModal(false);
      setEditingBanner(null);

      await loadBanners();
    } catch (error) {
      console.error("Save banner error:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     DELETE BANNER
  ========================================= */

  const handleDelete = async (banner) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete banner "${banner.title || `#${banner.banner_id}`}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/banners/${banner.banner_id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete banner");
      }

      await loadBanners();
    } catch (error) {
      console.error("Delete banner error:", error);
      alert(error.message);
    }
  };

  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "-";

    return d.toLocaleString();
  };

  /* =========================================
     STATUS LABEL
  ========================================= */

  const getStatusClass = (status) => {
    if (status === "active") {
      return "banner-status banner-status-active";
    }

    return "banner-status banner-status-inactive";
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="admin-banner-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="banner-page-header">

        <div>
          <h1>Banners</h1>
          <p>
            Manage your website hero banners and promotional content.
          </p>
        </div>

        <div className="banner-header-actions">

          <button
            type="button"
            className="banner-refresh-btn"
            onClick={loadBanners}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            className="banner-add-btn"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add Banner
          </button>

        </div>

      </div>

      {/* =========================================
          FILTERS
      ========================================= */}

      <div className="banner-filters">

        <div className="banner-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search banners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <select
          className="banner-filter-select"
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

      <div className="banner-table-card">

        <div className="banner-table-wrapper">

          <table className="banner-table">

            <thead>
              <tr>
                <th>Banner</th>
                <th>Button</th>
                <th>Sort Order</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="banner-empty"
                  >
                    Loading banners...
                  </td>
                </tr>
              ) : filteredBanners.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="banner-empty"
                  >
                    <ImageIcon size={30} />
                    <span>No banners found.</span>
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner) => (

                  <tr key={banner.banner_id}>

                    {/* Banner */}
                    <td>

                      <div className="banner-info">

                        <div className="banner-image">

                          {banner.image ? (
                            <img
                              src={banner.image}
                              alt={banner.title || "Banner"}
                            />
                          ) : (
                            <ImageIcon size={22} />
                          )}

                        </div>

                        <div className="banner-details">

                          <strong>
                            {banner.title || "Untitled Banner"}
                          </strong>

                          <span>
                            #{banner.banner_id}
                          </span>

                          {banner.subtitle && (
                            <small>
                              {banner.subtitle}
                            </small>
                          )}

                        </div>

                      </div>

                    </td>

                    {/* Button */}
                    <td>

                      {banner.button_text ? (
                        <div className="banner-button-info">

                          <strong>
                            {banner.button_text}
                          </strong>

                          {banner.button_link && (
                            <span>
                              {banner.button_link}
                            </span>
                          )}

                        </div>
                      ) : (
                        "-"
                      )}

                    </td>

                    {/* Sort Order */}
                    <td>
                      <span className="banner-sort-order">
                        {banner.sort_order ?? 0}
                      </span>
                    </td>

                    {/* Schedule */}
                    <td>

                      <div className="banner-schedule">

                        <span>
                          Start: {formatDate(banner.start_date)}
                        </span>

                        <span>
                          End: {formatDate(banner.end_date)}
                        </span>

                      </div>

                    </td>

                    {/* Status */}
                    <td>

                      <span className={getStatusClass(banner.status)}>
                        {banner.status}
                      </span>

                    </td>

                    {/* Created */}
                    <td>
                      <span className="banner-date">
                        {formatDate(banner.created_at)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>

                      <div className="banner-actions">

                        <button
                          type="button"
                          className="banner-action-btn"
                          title="Edit Banner"
                          onClick={() =>
                            openEditModal(banner)
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="banner-action-btn banner-delete-btn"
                          title="Delete Banner"
                          onClick={() =>
                            handleDelete(banner)
                          }
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

      {/* =========================================
          ADD / EDIT MODAL
      ========================================= */}

      {showModal && (

        <div className="banner-modal-overlay">

          <div className="banner-modal">

            <div className="banner-modal-header">

              <div>
                <h2>
                  {editingBanner
                    ? "Edit Banner"
                    : "Add Banner"}
                </h2>

                <p>
                  {editingBanner
                    ? "Update banner information."
                    : "Add a new hero banner."}
                </p>
              </div>

              <button
                type="button"
                className="banner-modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>

            </div>

            <form
              className="banner-form"
              onSubmit={handleSubmit}
            >

              {/* Title */}
              <div className="banner-form-group">

                <label>
                  Banner Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Summer Collection"
                />

              </div>

              {/* Subtitle */}
              <div className="banner-form-group">

                <label>
                  Subtitle
                </label>

                <textarea
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="Discover our latest collection."
                  rows="3"
                />

              </div>

              {/* Image */}
              <div className="banner-form-group">

                <label>
                  Banner Image URL *
                </label>

                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/banner.jpg"
                  required
                />

              </div>

              {/* Image Preview */}
              {formData.image && (

                <div className="banner-preview">

                  <img
                    src={formData.image}
                    alt="Banner preview"
                  />

                </div>

              )}

              {/* Button Row */}
              <div className="banner-form-row">

                <div className="banner-form-group">

                  <label>
                    Button Text
                  </label>

                  <input
                    type="text"
                    name="button_text"
                    value={formData.button_text}
                    onChange={handleChange}
                    placeholder="Shop Now"
                  />

                </div>

                <div className="banner-form-group">

                  <label>
                    Button Link
                  </label>

                  <input
                    type="text"
                    name="button_link"
                    value={formData.button_link}
                    onChange={handleChange}
                    placeholder="/products"
                  />

                </div>

              </div>

              {/* Sort Order */}
              <div className="banner-form-group">

                <label>
                  Sort Order
                </label>

                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  min="0"
                />

                <small>
                  Lower numbers appear first.
                </small>

              </div>

              {/* Date Row */}
              <div className="banner-form-row">

                <div className="banner-form-group">

                  <label>
                    Start Date
                  </label>

                  <input
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />

                </div>

                <div className="banner-form-group">

                  <label>
                    End Date
                  </label>

                  <input
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* Status */}
              <div className="banner-form-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
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

              {/* Actions */}
              <div className="banner-modal-actions">

                <button
                  type="button"
                  className="banner-cancel-btn"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="banner-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingBanner
                    ? "Update Banner"
                    : "Add Banner"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}