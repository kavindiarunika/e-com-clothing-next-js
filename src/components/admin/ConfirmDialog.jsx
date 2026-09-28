"use client";

export default function ConfirmDialog({
  open,
  title = "Delete record?",
  message = "Are you sure you want to delete this record?",
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <h2>{title}</h2>

        <p>{message}</p>

        <div className="admin-modal-actions">
          <button
            className="admin-button secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="admin-button danger"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}