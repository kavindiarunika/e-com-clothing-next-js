"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquare, Reply } from "lucide-react";

function buildCommentTree(comments) {
  const commentsById = new Map(
    comments.map((comment) => [
      comment.comment_id,
      { ...comment, replies: [] },
    ])
  );
  const roots = [];

  for (const comment of commentsById.values()) {
    const parent = commentsById.get(comment.parent_comment_id);
    if (parent) {
      parent.replies.push(comment);
    } else if (comment.parent_comment_id == null) {
      roots.push(comment);
    }
  }

  return roots;
}

export default function ProductComments({ product }) {
  const [comments, setComments] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = useCallback(async (signal) => {
    const response = await fetch(
      `/api/user/comments?item_id=${encodeURIComponent(product.id)}`,
      { signal }
    );
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load product comments.");
    }

    setComments(Array.isArray(data.comments) ? data.comments : []);
    setIsAuthenticated(Boolean(data.is_authenticated));
    setLoadError("");
  }, [product.id]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        await loadComments(controller.signal);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Product comments error:", error);
          setLoadError("Comments could not be loaded. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [loadComments]);

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  async function submitComment(event, parentCommentId = null) {
    event.preventDefault();
    const text = parentCommentId === null ? commentText.trim() : replyText.trim();

    if (!text) {
      setSubmitError("Please enter a comment before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/user/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: product.id,
          parent_comment_id: parentCommentId,
          comment_text: text,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit your comment.");
      }

      setCommentText("");
      setReplyText("");
      setReplyingTo(null);
      setSubmitError("");
      window.alert("Your comment has been submitted for approval.");
    } catch (error) {
      console.error("Failed to submit product comment:", error);
      setSubmitError(error.message || "Failed to submit your comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderComment(comment, depth = 0) {
    return (
      <article
        key={comment.comment_id}
        className={`border border-[#D8D0C8] bg-white p-5 ${depth > 0 ? "ml-4 border-l-2 border-l-[#AC9C8D] sm:ml-8" : ""}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#322D29]">
              {comment.commenter_name || "Customer"}
            </p>
            <time className="mt-1 block text-xs text-[#AC9C8D]">
              {new Date(comment.created_at).toLocaleDateString()}
            </time>
          </div>
          {isAuthenticated && depth === 0 && (
            <button
              type="button"
              onClick={() => {
                setReplyingTo(
                  replyingTo === comment.comment_id ? null : comment.comment_id
                );
                setReplyText("");
                setSubmitError("");
              }}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#72383D] hover:underline"
              aria-label={`Reply to ${comment.commenter_name || "customer"}`}
            >
              <Reply size={14} />
              Reply
            </button>
          )}
        </div>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#6B625C]">
          {comment.comment_text}
        </p>

        {replyingTo === comment.comment_id && (
          <form
            onSubmit={(event) => void submitComment(event, comment.comment_id)}
            className="mt-4 space-y-3"
          >
            <label
              htmlFor={`reply-${comment.comment_id}`}
              className="sr-only"
            >
              Reply to this comment
            </label>
            <textarea
              id={`reply-${comment.comment_id}`}
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              maxLength={5000}
              rows={3}
              required
              placeholder="Write a reply..."
              className="w-full border border-[#D8D0C8] bg-[#FAF8F5] px-4 py-3 text-sm text-[#322D29] outline-none focus:border-[#72383D]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#72383D] px-5 py-2.5 text-xs font-semibold uppercase tracking-[1px] text-white transition hover:bg-[#322D29] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Reply"}
            </button>
          </form>
        )}

        {comment.replies.length > 0 && (
          <div className="mt-5 space-y-3">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </article>
    );
  }

  return (
    <section className="border-t border-[#D8D0C8] pt-14 md:pt-20">
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[3px] text-[#72383D]">
          Product Discussion
        </p>
        <h2 className="font-serif text-3xl text-[#322D29] md:text-4xl">
          Comments
        </h2>
        <p className="mt-3 text-sm text-[#6B625C]">
          Ask a question or share your thoughts about this product.
        </p>
      </div>

      <div className="border border-[#D8D0C8] bg-white p-5 md:p-7">
        {loading ? (
          <p className="text-sm text-[#6B625C]">Checking your account...</p>
        ) : isAuthenticated ? (
          <form onSubmit={(event) => void submitComment(event)} className="space-y-4">
            <label
              htmlFor={`product-comment-${product.id}`}
              className="block text-xs font-semibold uppercase tracking-[1px] text-[#322D29]"
            >
              Add a comment
            </label>
            <textarea
              id={`product-comment-${product.id}`}
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              maxLength={5000}
              rows={4}
              required
              placeholder="Write your comment..."
              className="w-full border border-[#D8D0C8] bg-[#FAF8F5] px-4 py-3 text-sm text-[#322D29] outline-none focus:border-[#72383D]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#72383D] px-7 py-3 text-xs font-semibold uppercase tracking-[1.5px] text-white transition hover:bg-[#322D29] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Post Comment"}
            </button>
          </form>
        ) : (
          <div className="bg-[#FAF8F5] p-5 text-sm text-[#6B625C]">
            <p>Sign in to your customer account to add a comment.</p>
            <Link
              href={`/user/login?next=%2Fuser%2Fproduct%2F${encodeURIComponent(product.id)}`}
              className="mt-3 inline-block font-semibold text-[#72383D] hover:underline"
            >
              Sign in
            </Link>
          </div>
        )}
        {submitError && (
          <p role="alert" className="mt-3 text-sm text-[#72383D]">
            {submitError}
          </p>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="inline-flex items-center gap-2 font-serif text-2xl text-[#322D29]">
            <MessageSquare size={20} />
            Customer Comments
          </h3>
          <span className="text-xs text-[#6B625C]">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </span>
        </div>

        {loadError ? (
          <div role="alert" className="border border-[#D8D0C8] bg-white p-6 text-sm text-[#72383D]">
            {loadError}
          </div>
        ) : loading ? (
          <div className="border border-[#D8D0C8] bg-white p-6 text-sm text-[#6B625C]">
            Loading comments...
          </div>
        ) : commentTree.length === 0 ? (
          <div className="border border-[#D8D0C8] bg-white p-8 text-center">
            <p className="text-sm text-[#6B625C]">No approved comments yet.</p>
            <p className="mt-2 text-xs text-[#AC9C8D]">
              Be the first to start the conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {commentTree.map((comment) => renderComment(comment))}
          </div>
        )}
      </div>
    </section>
  );
}
