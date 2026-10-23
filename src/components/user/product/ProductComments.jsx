"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImagePlus, Reply, Send, X } from "lucide-react";

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
  const [imageFiles, setImageFiles] = useState([]);
  const previewUrls = useRef(new Set());

  useEffect(() => {
    const activePreviewUrls = previewUrls.current;
    return () => {
      activePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
      activePreviewUrls.clear();
    };
  }, []);

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

  function handleImageSelection(event) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (imageFiles.length + selectedFiles.length > 2) {
      setSubmitError("You can add up to two images to a comment.");
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size === 0 ||
        file.size > 5 * 1024 * 1024
    );

    if (invalidFile) {
      setSubmitError("Choose JPEG, PNG, or WebP images up to 5 MB each.");
      return;
    }

    setSubmitError("");
    const selectedImages = selectedFiles.map((file) => {
      const url = URL.createObjectURL(file);
      previewUrls.current.add(url);
      return { file, url };
    });
    setImageFiles((current) => [...current, ...selectedImages]);
  }

  async function submitComment(event, parentCommentId = null) {
    event.preventDefault();
    const text = parentCommentId === null ? commentText.trim() : replyText.trim();
    const attachedImages = parentCommentId === null ? imageFiles : [];

    if (!text && attachedImages.length === 0) {
      setSubmitError("Write a comment or attach an image before sending.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData();
      formData.append("item_id", String(product.id));
      formData.append("comment_text", text);
      if (parentCommentId !== null) {
        formData.append("parent_comment_id", String(parentCommentId));
      }
      attachedImages.forEach(({ file }) => formData.append("images", file));

      const response = await fetch("/api/user/comments", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit your comment.");
      }

      if (!data.comment) {
        throw new Error("Your comment was submitted but could not be displayed.");
      }

      setComments((current) => [...current, data.comment]);
      setCommentText("");
      setReplyText("");
      attachedImages.forEach(({ url }) => {
        URL.revokeObjectURL(url);
        previewUrls.current.delete(url);
      });
      setImageFiles([]);
      setReplyingTo(null);
      setSubmitError("");
      window.alert("Your comment has been posted.");
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
        className={`border border-[#E7DEDC] bg-white p-5 ${depth > 0 ? "ml-4 border-l-2 border-l-[#e63e62] sm:ml-8" : ""}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#292524]">
              {comment.commenter_name || "Customer"}
            </p>
            <time className="mt-1 block text-xs text-[#e63e62]">
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
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#e63e62] hover:underline"
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

        {comment.images?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {comment.images.map((src, index) => (
              <a
                key={`${comment.comment_id}-image-${index}`}
                href={src}
                target="_blank"
                rel="noreferrer"
                className="relative block h-24 w-24 overflow-hidden rounded-lg border border-[#FAF6F5] sm:h-28 sm:w-28"
              >
                <Image
                  src={src}
                  alt={`Image ${index + 1} attached to comment by ${comment.commenter_name || "customer"}`}
                  fill
                  unoptimized
                  sizes="112px"
                  className="object-cover transition duration-200 hover:scale-105"
                />
              </a>
            ))}
          </div>
        )}

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
              className="w-full border border-[#E7DEDC] bg-[#FAF6F5] px-4 py-3 text-sm text-[#292524] outline-none focus:border-[#e63e62]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#e63e62] px-5 py-2.5 text-xs font-semibold uppercase tracking-[1px] text-white transition hover:bg-[#A96870] disabled:cursor-not-allowed disabled:opacity-60"
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
    <section className="border-t border-[#E7DEDC] pt-8 md:pt-10">
      <div className="border border-[#E7DEDC] bg-white p-4 md:p-5">
        {loading ? (
          <p className="text-sm text-[#6B625C]">Checking your account...</p>
        ) : (
          <form
            onSubmit={(event) => void submitComment(event)}
            className="space-y-3"
          >
            <label
              htmlFor={`product-comment-${product.id}`}
              className="sr-only"
            >
              Add a comment
            </label>
            {imageFiles.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {imageFiles.map(({ file, url }, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#FAF6F5]"
                  >
                    <Image
                      src={url}
                      alt={`Selected comment image ${index + 1}`}
                      fill
                      unoptimized
                      sizes="64px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`Remove image ${index + 1}`}
                      disabled={isSubmitting}
                      onClick={() => {
                        URL.revokeObjectURL(url);
                        previewUrls.current.delete(url);
                        setImageFiles((current) =>
                          current.filter((_, fileIndex) => fileIndex !== index)
                        );
                      }}
                      className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              <textarea
                id={`product-comment-${product.id}`}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                maxLength={5000}
                rows={2}
                disabled={!isAuthenticated || isSubmitting}
                placeholder={
                  isAuthenticated
                    ? "Write your comment..."
                    : "Sign in to add a comment..."
                }
                className="min-h-12 flex-1 resize-y rounded-xl border border-[#FAF6F5] bg-[#FAF6F5] px-4 py-3 text-sm text-[#292524] outline-none transition placeholder:text-[#e63e62] focus:border-[#e63e62] focus:ring-2 focus:ring-[#e63e62]/10 disabled:cursor-not-allowed disabled:opacity-75"
              />
              {isAuthenticated && (
                <>
                  <input
                    id={`product-comment-images-${product.id}`}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={isSubmitting}
                    onChange={handleImageSelection}
                    className="sr-only"
                  />
                  <label
                    htmlFor={`product-comment-images-${product.id}`}
                    title="Attach up to two images"
                    className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E7DEDC] text-[#e63e62] transition focus-within:ring-2 focus-within:ring-[#e63e62] focus-within:ring-offset-2 ${isSubmitting ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-[#e63e62] hover:bg-[#FAF6F5]"}`}
                  >
                    <ImagePlus size={19} aria-hidden="true" />
                    <span className="sr-only">Attach up to two images</span>
                  </label>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-label={isSubmitting ? "Sending comment" : "Send comment"}
                    title={isSubmitting ? "Sending comment" : "Send comment"}
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e63e62] text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#5E2B30] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e63e62] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={18} aria-hidden="true" />
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <Link
                  href={`/user/login?next=%2Fuser%2Fproduct%2F${encodeURIComponent(product.id)}`}
                  className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#e63e62] px-5 text-xs font-semibold uppercase tracking-[1px] text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#5E2B30] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e63e62] focus-visible:ring-offset-2"
                >
                  Sign in
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
              )}
            </div>
          </form>
        )}
        {submitError && (
          <p role="alert" className="mt-3 text-sm text-[#e63e62]">
            {submitError}
          </p>
        )}
      </div>

      <div className="mt-4">
        {loadError ? (
          <div role="alert" className="border border-[#E7DEDC] bg-white p-5 text-sm text-[#e63e62]">
            {loadError}
          </div>
        ) : loading ? (
          <div className="border border-[#E7DEDC] bg-white p-5 text-sm text-[#6B625C]">
            Loading comments...
          </div>
        ) : commentTree.length === 0 ? (
          <div className="border border-[#E7DEDC] bg-white p-5 text-center text-sm text-[#6B625C]">
            No comments yet.
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
