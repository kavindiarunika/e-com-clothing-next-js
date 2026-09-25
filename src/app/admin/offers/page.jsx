
"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
} from "lucide-react";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    start_date: "",
    end_date: "",
    status: "active",
  });

  const [bannerImage, setBannerImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  /* =====================================================
     FETCH OFFERS
  ===================================================== */

  async function fetchOffers() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/offers");

      const data = await response.json();

      if (data.success) {
        setOffers(data.offers || []);
      } else {
        alert(data.message || "Failed to load offers.");
      }
    } catch (error) {
      console.error("Fetch offers error:", error);
      alert("Failed to load offers.");
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     HANDLE INPUT
  ===================================================== */

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /* =====================================================
     IMAGE CHANGE
  ===================================================== */

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    setBannerImage(file);

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
  }

  /* =====================================================
     OPEN ADD FORM
  ===================================================== */

  function openAddForm() {
    setEditingOffer(null);

    setForm({
      title: "",
      description: "",
      link: "",
      start_date: "",
      end_date: "",
      status: "active",
    });

    setBannerImage(null);
    setPreviewImage(null);

    setShowForm(true);
  }

  /* =====================================================
     OPEN EDIT FORM
  ===================================================== */

  function openEditForm(offer) {
    setEditingOffer(offer);

    setForm({
      title: offer.title || "",
      description: offer.description || "",
      link: offer.link || "",
      start_date: offer.start_date
        ? formatDateTimeLocal(offer.start_date)
        : "",
      end_date: offer.end_date
        ? formatDateTimeLocal(offer.end_date)
        : "",
      status: offer.status || "active",
    });

    setBannerImage(null);

    if (offer.banner_image) {
      setPreviewImage(
        offer.banner_image.startsWith("/") ||
          offer.banner_image.startsWith("http") ||
          offer.banner_image.startsWith("data:")
          ? offer.banner_image
          : `data:image/jpeg;base64,${offer.banner_image}`
      );
    } else {
      setPreviewImage(null);
    }

    setShowForm(true);
  }

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  function formatDateTimeLocal(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const hours = String(
      date.getHours()
    ).padStart(2, "0");

    const minutes = String(
      date.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /* =====================================================
     SUBMIT
  ===================================================== */

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter an offer title.");
      return;
    }

    if (!form.start_date || !form.end_date) {
      alert("Please select start and end dates.");
      return;
    }

    if (
      new Date(form.end_date) <
      new Date(form.start_date)
    ) {
      alert(
        "End date cannot be before start date."
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "link",
        form.link
      );

      formData.append(
        "start_date",
        form.start_date
      );

      formData.append(
        "end_date",
        form.end_date
      );

      formData.append(
        "status",
        form.status
      );

      if (bannerImage) {
        formData.append(
          "banner_image",
          bannerImage
        );
      }

      let response;

      if (editingOffer) {
        response = await fetch(
          `/api/admin/offers/${editingOffer.offer_id}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        response = await fetch(
          "/api/admin/offers",
          {
            method: "POST",
            body: formData,
          }
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            "Failed to save offer."
        );
        return;
      }

      alert(
        editingOffer
          ? "Offer updated successfully."
          : "Offer added successfully."
      );

      closeForm();

      fetchOffers();
    } catch (error) {
      console.error("Save offer error:", error);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     DELETE
  ===================================================== */

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this offer?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/offers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            "Failed to delete offer."
        );
        return;
      }

      alert("Offer deleted successfully.");

      fetchOffers();
    } catch (error) {
      console.error("Delete offer error:", error);
      alert("Something went wrong.");
    }
  }

  /* =====================================================
     CLOSE FORM
  ===================================================== */

  function closeForm() {
    setShowForm(false);
    setEditingOffer(null);
    setBannerImage(null);
    setPreviewImage(null);

    setForm({
      title: "",
      description: "",
      link: "",
      start_date: "",
      end_date: "",
      status: "active",
    });
  }

  /* =====================================================
     IMAGE URL
  ===================================================== */

  function getImageUrl(image) {
    if (!image) return null;

    if (typeof image === "string") {
      if (
        image.startsWith("/") ||
        image.startsWith("http") ||
        image.startsWith("data:")
      ) {
        return image;
      }

      return `data:image/jpeg;base64,${image}`;
    }

    return null;
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="offers-page">

      {/* HEADER */}

      <div className="offers-page-header">

        <div>
          <h1>Offers</h1>

          <p>
            Manage promotional offers and offer
            banners.
          </p>
        </div>

        <button
          className="offers-add-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Offer
        </button>

      </div>

      {/* TABLE CARD */}

      <div className="offers-table-card">

        {loading ? (
          <div className="offers-loading">
            Loading offers...
          </div>
        ) : offers.length === 0 ? (
          <div className="offers-empty">

            <ImageIcon size={42} />

            <h3>No Offers Found</h3>

            <p>
              Create your first promotional offer.
            </p>

            <button
              className="offers-add-button"
              onClick={openAddForm}
            >
              <Plus size={18} />
              Add Offer
            </button>

          </div>
        ) : (

          <div className="offers-table-wrapper">

            <table className="offers-table">

              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Link</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {offers.map((offer) => (

                  <tr key={offer.offer_id}>

                    {/* IMAGE */}

                    <td>

                      <div className="offer-image">

                        {offer.banner_image ? (
                          <img
                            src={getImageUrl(
                              offer.banner_image
                            )}
                            alt={offer.title}
                          />
                        ) : (
                          <div className="offer-no-image">
                            <ImageIcon
                              size={20}
                            />
                          </div>
                        )}

                      </div>

                    </td>

                    {/* TITLE */}

                    <td>
                      <strong className="offer-title">
                        {offer.title}
                      </strong>
                    </td>

                    {/* DESCRIPTION */}

                    <td>

                      <span className="offer-description">
                        {offer.description ||
                          "-"}
                      </span>

                    </td>

                    {/* LINK */}

                    <td>

                      {offer.link ? (
                        <a
                          href={offer.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="offer-link"
                        >
                          View Link
                        </a>
                      ) : (
                        "-"
                      )}

                    </td>

                    {/* START DATE */}

                    <td>
                      {offer.start_date
                        ? new Date(
                            offer.start_date
                          ).toLocaleString()
                        : "-"}
                    </td>

                    {/* END DATE */}

                    <td>
                      {offer.end_date
                        ? new Date(
                            offer.end_date
                          ).toLocaleString()
                        : "-"}
                    </td>

                    {/* STATUS */}

                    <td>

                      <span
                        className={`offer-status ${
                          offer.status ===
                          "active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {offer.status}
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="offer-actions">

                        <button
                          className="offer-edit-button"
                          onClick={() =>
                            openEditForm(
                              offer
                            )
                          }
                          title="Edit Offer"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="offer-delete-button"
                          onClick={() =>
                            handleDelete(
                              offer.offer_id
                            )
                          }
                          title="Delete Offer"
                        >
                          <Trash2 size={16} />
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

      {/* MODAL */}

      {showForm && (

        <div className="offer-modal-overlay">

          <div className="offer-modal">

            {/* MODAL HEADER */}

            <div className="offer-modal-header">

              <div>
                <h2>
                  {editingOffer
                    ? "Edit Offer"
                    : "Add Offer"}
                </h2>

                <p>
                  Add promotional offer details.
                </p>
              </div>

              <button
                className="offer-modal-close"
                onClick={closeForm}
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              className="offer-form"
              onSubmit={handleSubmit}
            >

              {/* TITLE */}

              <div className="offer-form-group">

                <label>
                  Offer Title <span>*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Summer Sale"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div className="offer-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter offer description"
                  rows={4}
                />

              </div>

              {/* BANNER IMAGE */}

              <div className="offer-form-group">

                <label>
                  Offer Banner Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {previewImage && (
                  <div className="offer-image-preview">

                    <img
                      src={previewImage}
                      alt="Offer preview"
                    />

                  </div>
                )}

              </div>

              {/* LINK */}

              <div className="offer-form-group">

                <label>
                  Link
                </label>

                <input
                  type="text"
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  placeholder="/products"
                />

              </div>

              {/* DATES */}

              <div className="offer-form-row">

                <div className="offer-form-group">

                  <label>
                    Start Date
                  </label>

                  <input
                    type="datetime-local"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                  />

                </div>

                <div className="offer-form-group">

                  <label>
                    End Date
                  </label>

                  <input
                    type="datetime-local"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* STATUS */}

              <div className="offer-form-group">

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

              {/* BUTTONS */}

              <div className="offer-form-actions">

                <button
                  type="button"
                  className="offer-cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="offer-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingOffer
                    ? "Update Offer"
                    : "Add Offer"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}
