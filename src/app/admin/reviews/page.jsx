"use client";

import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  Pencil,
  X,
  Star,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const [selectedReview, setSelectedReview] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editStatus, setEditStatus] = useState("pending");
  const [saving, setSaving] = useState(false);

  // =========================================================
  // LOAD REVIEWS
  // =========================================================

  const loadReviews = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/reviews");
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        console.error(data.message);
        setReviews([]);
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending";

      case "approved":
        return "Approved";

      case "rejected":
        return "Rejected";

      default:
        return status || "-";
    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // RATING STARS
  // =========================================================

  const renderStars = (rating) => {
    const currentRating = Number(rating || 0);

    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={15}
            fill={star <= currentRating ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
  };

  // =========================================================
  // FILTER REVIEWS
  // =========================================================

  const filteredReviews = reviews.filter((review) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      String(review.review_id || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(review.item_id || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(review.user_id || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(review.order_id || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(review.review_text || "")
        .toLowerCase()
        .includes(searchValue);

    const matchesStatus =
      statusFilter === "all" ||
      review.status === statusFilter;

    const matchesRating =
      ratingFilter === "all" ||
      Number(review.rating) === Number(ratingFilter);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesRating
    );
  });

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalReviews = reviews.length;

  const pendingReviews = reviews.filter(
    (review) => review.status === "pending"
  ).length;

  const approvedReviews = reviews.filter(
    (review) => review.status === "approved"
  ).length;

  const rejectedReviews = reviews.filter(
    (review) => review.status === "rejected"
  ).length;

  // =========================================================
  // VIEW REVIEW
  // =========================================================

  const handleView = async (reviewId) => {
    try {
      const response = await fetch(
        `/api/admin/reviews/${reviewId}`
      );

      const data = await response.json();

      if (data.success) {
        setSelectedReview(data.review);
        setShowViewModal(true);
      } else {
        alert(data.message || "Failed to load review");
      }
    } catch (error) {
      console.error("Failed to load review:", error);
      alert("Failed to load review");
    }
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const handleEdit = (review) => {
    setSelectedReview(review);
    setEditStatus(review.status || "pending");
    setShowEditModal(true);
  };

  // =========================================================
  // UPDATE REVIEW STATUS
  // =========================================================

  const handleUpdate = async () => {
    if (!selectedReview) return;

    try {
      setSaving(true);

      const response = await fetch(
        `/api/admin/reviews/${selectedReview.review_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: editStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message || "Failed to update review"
        );
        return;
      }

      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          review.review_id ===
          selectedReview.review_id
            ? {
                ...review,
                status: editStatus,
              }
            : review
        )
      );

      setSelectedReview((current) =>
        current
          ? {
              ...current,
              status: editStatus,
            }
          : current
      );

      setShowEditModal(false);
    } catch (error) {
      console.error("Update review error:", error);
      alert("Failed to update review");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE REVIEW
  // =========================================================

  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/reviews/${reviewId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message || "Failed to delete review"
        );
        return;
      }

      setReviews((currentReviews) =>
        currentReviews.filter(
          (review) =>
            review.review_id !== reviewId
        )
      );

      if (
        selectedReview &&
        selectedReview.review_id === reviewId
      ) {
        setSelectedReview(null);
        setShowViewModal(false);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Delete review error:", error);
      alert("Failed to delete review");
    }
  };

  // =========================================================
  // CLOSE MODALS
  // =========================================================

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedReview(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedReview(null);
  };

  return (
    <div className="admin-review-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="review-page-header">

        <div>
          <h1>Reviews</h1>

          <p>
            Manage and moderate customer product reviews.
          </p>
        </div>

        <button
          className="review-refresh-btn"
          onClick={loadReviews}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "review-spin" : ""}
          />

          Refresh
        </button>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="review-summary">

        <div className="review-summary-card">

          <div className="review-summary-icon">
            <MessageSquare size={21} />
          </div>

          <div>
            <span>Total Reviews</span>
            <strong>{totalReviews}</strong>
          </div>

        </div>

        <div className="review-summary-card">

          <div className="review-summary-icon">
            <Clock size={21} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingReviews}</strong>
          </div>

        </div>

        <div className="review-summary-card">

          <div className="review-summary-icon">
            <CheckCircle size={21} />
          </div>

          <div>
            <span>Approved</span>
            <strong>{approvedReviews}</strong>
          </div>

        </div>

        <div className="review-summary-card">

          <div className="review-summary-icon">
            <XCircle size={21} />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{rejectedReviews}</strong>
          </div>

        </div>

      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <div className="review-filters">

        <div className="review-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search review, product, user or order..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          className="review-filter-select"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          className="review-filter-select"
          value={ratingFilter}
          onChange={(e) =>
            setRatingFilter(e.target.value)
          }
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

      </div>

      {/* =====================================================
          REVIEWS TABLE
      ====================================================== */}

      <div className="review-table-card">

        <div className="review-table-wrapper">

          <table className="review-table">

            <thead>

              <tr>
                <th>Review</th>
                <th>Product</th>
                <th>User</th>
                <th>Order</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="review-empty"
                  >
                    Loading reviews...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="review-empty"
                  >
                    No reviews found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.review_id}>

                    {/* REVIEW */}

                    <td>

                      <div className="review-info">

                        <div className="review-icon">
                          <MessageSquare size={17} />
                        </div>

                        <div>
                          <strong>
                            #{review.review_id}
                          </strong>

                          <span>
                            {review.review_text
                              ? review.review_text.length > 45
                                ? `${review.review_text.substring(
                                    0,
                                    45
                                  )}...`
                                : review.review_text
                              : "No review text"}
                          </span>
                        </div>

                      </div>

                    </td>

                    {/* PRODUCT */}

                    <td>
                      <span className="review-id">
                        #{review.item_id}
                      </span>
                    </td>

                    {/* USER */}

                    <td>
                      <span className="review-id">
                        #{review.user_id}
                      </span>
                    </td>

                    {/* ORDER */}

                    <td>
                      <span className="review-id">
                        {review.order_id
                          ? `#${review.order_id}`
                          : "-"}
                      </span>
                    </td>

                    {/* RATING */}

                    <td>

                      <div className="review-rating">

                        {renderStars(review.rating)}

                        <span>
                          {review.rating}/5
                        </span>

                      </div>

                    </td>

                    {/* STATUS */}

                    <td>

                      <span
                        className={`review-status review-status-${review.status}`}
                      >
                        {getStatusLabel(
                          review.status
                        )}
                      </span>

                    </td>

                    {/* DATE */}

                    <td>
                      <span className="review-date">
                        {formatDate(
                          review.created_at
                        )}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="review-actions">

                        <button
                          className="review-action-btn"
                          onClick={() =>
                            handleView(
                              review.review_id
                            )
                          }
                          title="View Review"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="review-action-btn"
                          onClick={() =>
                            handleEdit(review)
                          }
                          title="Edit Review"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="review-action-btn review-delete-btn"
                          onClick={() =>
                            handleDelete(
                              review.review_id
                            )
                          }
                          title="Delete Review"
                        >
                          <XCircle size={16} />
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

      {/* =====================================================
          VIEW MODAL
      ====================================================== */}

      {showViewModal && selectedReview && (
        <div
          className="review-modal-overlay"
          onClick={closeViewModal}
        >

          <div
            className="review-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="review-modal-header">

              <div>
                <h2>Review Details</h2>

                <p>
                  Review #{selectedReview.review_id}
                </p>
              </div>

              <button
                className="review-modal-close"
                onClick={closeViewModal}
              >
                <X size={20} />
              </button>

            </div>

            <div className="review-detail-rating">

              {renderStars(
                selectedReview.rating
              )}

              <strong>
                {selectedReview.rating}/5
              </strong>

            </div>

            <div className="review-text-box">

              <span>Review</span>

              <p>
                {selectedReview.review_text ||
                  "No review text provided."}
              </p>

            </div>

            <div className="review-details-grid">

              <div className="review-detail-item">
                <span>Review ID</span>
                <strong>
                  #{selectedReview.review_id}
                </strong>
              </div>

              <div className="review-detail-item">
                <span>Product ID</span>
                <strong>
                  #{selectedReview.item_id}
                </strong>
              </div>

              <div className="review-detail-item">
                <span>User ID</span>
                <strong>
                  #{selectedReview.user_id}
                </strong>
              </div>

              <div className="review-detail-item">
                <span>Order ID</span>
                <strong>
                  {selectedReview.order_id
                    ? `#${selectedReview.order_id}`
                    : "-"}
                </strong>
              </div>

              <div className="review-detail-item">
                <span>Status</span>

                <span
                  className={`review-status review-status-${selectedReview.status}`}
                >
                  {getStatusLabel(
                    selectedReview.status
                  )}
                </span>
              </div>

              <div className="review-detail-item">
                <span>Created At</span>

                <strong>
                  {formatDate(
                    selectedReview.created_at
                  )}
                </strong>
              </div>

            </div>

            <div className="review-modal-actions">

              <button
                className="review-secondary-btn"
                onClick={closeViewModal}
              >
                Close
              </button>

              <button
                className="review-primary-btn"
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedReview);
                }}
              >
                <Pencil size={16} />
                Edit Status
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          EDIT MODAL
      ====================================================== */}

      {showEditModal && selectedReview && (
        <div
          className="review-modal-overlay"
          onClick={closeEditModal}
        >

          <div
            className="review-modal review-edit-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="review-modal-header">

              <div>
                <h2>Edit Review</h2>

                <p>
                  Review #{selectedReview.review_id}
                </p>
              </div>

              <button
                className="review-modal-close"
                onClick={closeEditModal}
              >
                <X size={20} />
              </button>

            </div>

            <div className="review-edit-content">

              <div className="review-edit-preview">

                <div className="review-icon">
                  <MessageSquare size={18} />
                </div>

                <div>
                  <strong>
                    Review #{selectedReview.review_id}
                  </strong>

                  <span>
                    Product #{selectedReview.item_id}
                  </span>
                </div>

              </div>

              <div className="review-form-group">

                <label>
                  Review Status
                </label>

                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value)
                  }
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="approved">
                    Approved
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>
                </select>

              </div>

            </div>

            <div className="review-modal-actions">

              <button
                className="review-secondary-btn"
                onClick={closeEditModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="review-primary-btn"
                onClick={handleUpdate}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}