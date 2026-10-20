"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle,
  Clock,
  MessageSquare,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const requestComments = useCallback(async () => {
    const response = await fetch("/api/admin/comments");
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load product comments.");
    }

    return Array.isArray(data.comments) ? data.comments : [];
  }, []);

  function refreshComments() {
    setLoading(true);
    setLoadError("");
    void requestComments()
      .then(setComments)
      .catch((error) => {
        console.error("Failed to load product comments:", error);
        setLoadError(error.message || "Failed to load product comments.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    let isCurrent = true;

    requestComments()
      .then((nextComments) => {
        if (isCurrent) setComments(nextComments);
      })
      .catch((error) => {
        if (isCurrent) {
          console.error("Failed to load product comments:", error);
          setLoadError(error.message || "Failed to load product comments.");
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [requestComments]);

  async function updateStatus(commentId, status) {
    setSavingId(commentId);
    setLoadError("");

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update comment status.");
      }

      setComments((current) =>
        current.map((comment) =>
          comment.comment_id === commentId ? { ...comment, status } : comment
        )
      );
    } catch (error) {
      console.error("Failed to update product comment:", error);
      setLoadError(error.message || "Failed to update comment status.");
    } finally {
      setSavingId(null);
    }
  }

  const filteredComments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return comments.filter((comment) => {
      const matchesStatus =
        statusFilter === "all" || comment.status === statusFilter;
      const searchableText = [
        comment.comment_id,
        comment.item_id,
        comment.product_name,
        comment.user_id,
        comment.commenter_name,
        comment.comment_text,
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchableText.includes(searchValue);
    });
  }, [comments, search, statusFilter]);

  const pendingCount = comments.filter(
    (comment) => comment.status === "pending"
  ).length;
  const approvedCount = comments.filter(
    (comment) => comment.status === "approved"
  ).length;
  const rejectedCount = comments.filter(
    (comment) => comment.status === "rejected"
  ).length;

  return (
    <main className="admin-review-page admin-comments-page">
      <div className="review-page-header">
        <div>
          <h1>Product Comments</h1>
          <p>
            Manage customer comments and moderate what appears on product pages.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshComments}
          disabled={loading}
          className="review-refresh-btn"
        >
          <RefreshCw
            size={17}
            className={loading ? "review-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="review-summary">
        <div className="review-summary-card">
          <div className="review-summary-icon">
            <MessageSquare size={21} />
          </div>
          <div>
            <span>Total Comments</span>
            <strong>{comments.length}</strong>
          </div>
        </div>
        <div className="review-summary-card">
          <div className="review-summary-icon">
            <Clock size={21} />
          </div>
          <div>
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>
        <div className="review-summary-card">
          <div className="review-summary-icon">
            <CheckCircle size={21} />
          </div>
          <div>
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </div>
        </div>
        <div className="review-summary-card">
          <div className="review-summary-icon">
            <XCircle size={21} />
          </div>
          <div>
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>
      </div>

      <div className="review-filters">
        <label className="review-search">
          <Search size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product, customer, or comment..."
          />
        </label>
        <label className="sr-only" htmlFor="comment-status-filter">
          Filter by status
        </label>
        <select
          id="comment-status-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="review-filter-select"
        >
          <option value="pending">Pending ({pendingCount})</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All statuses</option>
        </select>
      </div>

      {loadError && (
        <div role="alert" className="comment-error">
          {loadError}
        </div>
      )}

      <div className="review-table-card">
        <div className="review-table-wrapper">
          <table className="review-table comment-table">
            <thead>
              <tr>
                <th>Comment</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="review-empty">
                    Loading comments...
                  </td>
                </tr>
              ) : filteredComments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="review-empty">
                    <MessageSquare
                      className="comment-empty-icon"
                      size={24}
                    />
                    No comments found.
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment) => (
                  <tr key={comment.comment_id}>
                    <td>
                      <div className="review-info comment-info">
                        <div className="review-icon">
                          <MessageSquare size={17} />
                        </div>
                        <p className="comment-text">{comment.comment_text}</p>
                      </div>
                    </td>
                    <td>
                      <div className="comment-product">
                        <strong>{comment.product_name || "Product"}</strong>
                        <span>Product #{comment.item_id}</span>
                      </div>
                    </td>
                    <td>{comment.commenter_name || "Customer"}</td>
                    <td>
                      {comment.parent_comment_id
                        ? `Reply #${comment.parent_comment_id}`
                        : "Comment"}
                    </td>
                    <td>
                      <span
                        className={`review-status review-status-${comment.status}`}
                      >
                        {STATUS_LABELS[comment.status] || comment.status}
                      </span>
                    </td>
                    <td className="review-date">
                      {comment.created_at
                        ? new Date(comment.created_at).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      <div className="review-actions">
                        <button
                          type="button"
                          onClick={() =>
                            void updateStatus(comment.comment_id, "approved")
                          }
                          disabled={
                            savingId === comment.comment_id ||
                            comment.status === "approved"
                          }
                          className="review-action-btn comment-approve-btn"
                          aria-label="Approve comment"
                          title="Approve comment"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void updateStatus(comment.comment_id, "rejected")
                          }
                          disabled={
                            savingId === comment.comment_id ||
                            comment.status === "rejected"
                          }
                          className="review-action-btn comment-reject-btn"
                          aria-label="Reject comment"
                          title="Reject comment"
                        >
                          <X size={16} />
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
    </main>
  );
}
