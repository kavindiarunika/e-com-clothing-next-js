"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, MessageSquare, RefreshCw, Search, X } from "lucide-react";

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

  return (
    <main className="min-h-screen bg-[#F7F5F2] px-4 py-8 text-[#322D29] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[2px] text-[#72383D]">
              Catalog moderation
            </p>
            <h1 className="mt-2 font-serif text-3xl">Product Comments</h1>
            <p className="mt-2 text-sm text-[#6B625C]">
              Comments appear on product pages immediately. You can still reject inappropriate comments here.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshComments}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-[#D8D0C8] bg-white px-4 py-2.5 text-sm hover:border-[#72383D] disabled:opacity-60"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AC9C8D]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, customer, or comment"
              className="w-full border border-[#D8D0C8] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#72383D]"
            />
          </label>
          <label className="sr-only" htmlFor="comment-status-filter">
            Filter by status
          </label>
          <select
            id="comment-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="border border-[#D8D0C8] bg-white px-4 py-3 text-sm outline-none focus:border-[#72383D]"
          >
            <option value="pending">Pending ({pendingCount})</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All statuses</option>
          </select>
        </div>

        {loadError && (
          <div role="alert" className="mb-5 border border-[#D8D0C8] bg-white p-4 text-sm text-[#72383D]">
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="border border-[#D8D0C8] bg-white p-8 text-center text-sm text-[#6B625C]">
            Loading comments...
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="border border-[#D8D0C8] bg-white p-8 text-center">
            <MessageSquare className="mx-auto text-[#AC9C8D]" size={24} />
            <p className="mt-3 text-sm text-[#6B625C]">No comments found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <article
                key={comment.comment_id}
                className="border border-[#D8D0C8] bg-white p-5 md:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {comment.product_name}{" "}
                      <span className="font-normal text-[#6B625C]">
                        (Product #{comment.item_id})
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-[#6B625C]">
                      {comment.commenter_name || "Customer"} ·{" "}
                      {new Date(comment.created_at).toLocaleString()}
                      {comment.parent_comment_id &&
                        ` · Reply to comment #${comment.parent_comment_id}`}
                    </p>
                  </div>
                  <span className="border border-[#D8D0C8] px-2.5 py-1 text-xs">
                    {STATUS_LABELS[comment.status] || comment.status}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#6B625C]">
                  {comment.comment_text}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void updateStatus(comment.comment_id, "approved")}
                    disabled={savingId === comment.comment_id || comment.status === "approved"}
                    className="inline-flex items-center gap-1.5 bg-[#72383D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#322D29] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check size={14} />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void updateStatus(comment.comment_id, "rejected")}
                    disabled={savingId === comment.comment_id || comment.status === "rejected"}
                    className="inline-flex items-center gap-1.5 border border-[#D8D0C8] px-4 py-2 text-xs font-semibold text-[#72383D] hover:border-[#72383D] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
