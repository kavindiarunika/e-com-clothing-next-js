"use client";

import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  ArrowLeftRight,
} from "lucide-react";

export default function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedReturn, setSelectedReturn] = useState(null);

  const [editStatus, setEditStatus] = useState("pending");

  /* =========================================
     LOAD RETURNS
  ========================================= */

  const loadReturns = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/returns");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load returns"
        );
      }

      setReturns(data.returns || []);
    } catch (error) {
      console.error("Load returns error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  /* =========================================
     FILTER RETURNS
  ========================================= */

  useEffect(() => {
    let result = [...returns];

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      result = result.filter((item) =>
        [
          item.return_id,
          item.order_id,
          item.order_item_id,
          item.user_id,
          item.reason,
          item.description,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(searchValue)
          )
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (item) => item.status === statusFilter
      );
    }

    if (typeFilter !== "all") {
      result = result.filter(
        (item) =>
          item.request_type === typeFilter
      );
    }

    setFilteredReturns(result);
  }, [
    search,
    statusFilter,
    typeFilter,
    returns,
  ]);

  /* =========================================
     VIEW RETURN
  ========================================= */

  const openViewModal = (item) => {
    setSelectedReturn(item);
    setShowViewModal(true);
  };

  /* =========================================
     EDIT RETURN
  ========================================= */

  const openEditModal = (item) => {
    setSelectedReturn(item);
    setEditStatus(item.status || "pending");
    setShowEditModal(true);
  };

  /* =========================================
     UPDATE STATUS
  ========================================= */

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    if (!selectedReturn) return;

    try {
      setSaving(true);

      const response = await fetch(
        `/api/admin/returns/${selectedReturn.return_id}`,
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

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update return"
        );
      }

      setShowEditModal(false);
      setSelectedReturn(null);

      await loadReturns();
    } catch (error) {
      console.error(
        "Update return error:",
        error
      );

      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     DELETE RETURN
  ========================================= */

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete return request #${item.return_id}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/returns/${item.return_id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete return"
        );
      }

      await loadReturns();
    } catch (error) {
      console.error(
        "Delete return error:",
        error
      );

      alert(error.message);
    }
  };

  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleString();
  };

  /* =========================================
     REQUEST TYPE
  ========================================= */

  const getRequestTypeLabel = (type) => {
    if (type === "return") {
      return "Return";
    }

    if (type === "exchange") {
      return "Exchange";
    }

    return type || "-";
  };

  /* =========================================
     STATUS CLASS
  ========================================= */

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "return-status return-status-pending";

      case "approved":
        return "return-status return-status-approved";

      case "rejected":
        return "return-status return-status-rejected";

      case "completed":
        return "return-status return-status-completed";

      default:
        return "return-status";
    }
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="admin-return-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="return-page-header">

        <div>
          <h1>Returns & Exchanges</h1>

          <p>
            Manage customer return and exchange requests.
          </p>
        </div>

        <button
          type="button"
          className="return-refresh-btn"
          onClick={loadReturns}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <div className="return-summary">

        <div className="return-summary-card">

          <div className="return-summary-icon">
            <RotateCcw size={21} />
          </div>

          <div>
            <span>Total Requests</span>

            <strong>
              {returns.length}
            </strong>
          </div>

        </div>

        <div className="return-summary-card">

          <div className="return-summary-icon">
            <RotateCcw size={21} />
          </div>

          <div>
            <span>Pending</span>

            <strong>
              {
                returns.filter(
                  (item) =>
                    item.status === "pending"
                ).length
              }
            </strong>
          </div>

        </div>

        <div className="return-summary-card">

          <div className="return-summary-icon">
            <RotateCcw size={21} />
          </div>

          <div>
            <span>Approved</span>

            <strong>
              {
                returns.filter(
                  (item) =>
                    item.status === "approved"
                ).length
              }
            </strong>
          </div>

        </div>

        <div className="return-summary-card">

          <div className="return-summary-icon">
            <ArrowLeftRight size={21} />
          </div>

          <div>
            <span>Exchanges</span>

            <strong>
              {
                returns.filter(
                  (item) =>
                    item.request_type ===
                    "exchange"
                ).length
              }
            </strong>
          </div>

        </div>

      </div>

      {/* =========================================
          FILTERS
      ========================================= */}

      <div className="return-filters">

        <div className="return-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search returns..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          className="return-filter-select"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="approved">
            Approved
          </option>

          <option value="rejected">
            Rejected
          </option>

          <option value="completed">
            Completed
          </option>
        </select>

        <select
          className="return-filter-select"
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value)
          }
        >
          <option value="all">
            All Types
          </option>

          <option value="return">
            Return
          </option>

          <option value="exchange">
            Exchange
          </option>
        </select>

      </div>

      {/* =========================================
          TABLE
      ========================================= */}

      <div className="return-table-card">

        <div className="return-table-wrapper">

          <table className="return-table">

            <thead>
              <tr>
                <th>Request</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="8"
                    className="return-empty"
                  >
                    Loading return requests...
                  </td>
                </tr>

              ) : filteredReturns.length === 0 ? (

                <tr>
                  <td
                    colSpan="8"
                    className="return-empty"
                  >
                    <RotateCcw size={30} />

                    <span>
                      No return requests found.
                    </span>
                  </td>
                </tr>

              ) : (

                filteredReturns.map(
                  (item) => (

                    <tr
                      key={item.return_id}
                    >

                      {/* Request */}
                      <td>

                        <div className="return-info">

                          <div className="return-icon">

                            {item.request_type ===
                            "exchange" ? (
                              <ArrowLeftRight
                                size={18}
                              />
                            ) : (
                              <RotateCcw
                                size={18}
                              />
                            )}

                          </div>

                          <div>

                            <strong>
                              #{item.return_id}
                            </strong>

                            <span>
                              Item #
                              {item.order_item_id}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* Order */}
                      <td>

                        <span className="return-order">
                          #{item.order_id}
                        </span>

                      </td>

                      {/* Customer */}
                      <td>

                        <span className="return-customer">
                          #{item.user_id}
                        </span>

                      </td>

                      {/* Type */}
                      <td>

                        <span
                          className={
                            item.request_type ===
                            "exchange"
                              ? "return-type return-type-exchange"
                              : "return-type return-type-return"
                          }
                        >
                          {getRequestTypeLabel(
                            item.request_type
                          )}
                        </span>

                      </td>

                      {/* Reason */}
                      <td>

                        <div className="return-reason">

                          <strong>
                            {item.reason ||
                              "No reason provided"}
                          </strong>

                          {item.description && (
                            <span>
                              {item.description}
                            </span>
                          )}

                        </div>

                      </td>

                      {/* Status */}
                      <td>

                        <span
                          className={getStatusClass(
                            item.status
                          )}
                        >
                          {item.status}
                        </span>

                      </td>

                      {/* Requested */}
                      <td>

                        <span className="return-date">
                          {formatDate(
                            item.requested_at
                          )}
                        </span>

                      </td>

                      {/* Actions */}
                      <td>

                        <div className="return-actions">

                          <button
                            type="button"
                            className="return-action-btn"
                            title="View"
                            onClick={() =>
                              openViewModal(
                                item
                              )
                            }
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            className="return-action-btn"
                            title="Update Status"
                            onClick={() =>
                              openEditModal(
                                item
                              )
                            }
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="return-action-btn return-delete-btn"
                            title="Delete"
                            onClick={() =>
                              handleDelete(
                                item
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================================
          VIEW MODAL
      ========================================= */}

      {showViewModal &&
        selectedReturn && (

          <div className="return-modal-overlay">

            <div className="return-modal">

              <div className="return-modal-header">

                <div>
                  <h2>
                    Return Request #
                    {selectedReturn.return_id}
                  </h2>

                  <p>
                    View return or exchange details.
                  </p>
                </div>

                <button
                  type="button"
                  className="return-modal-close"
                  onClick={() =>
                    setShowViewModal(false)
                  }
                >
                  <X size={20} />
                </button>

              </div>

              <div className="return-view-content">

                <div className="return-view-top">

                  <div className="return-view-icon">

                    {selectedReturn.request_type ===
                    "exchange" ? (
                      <ArrowLeftRight
                        size={24}
                      />
                    ) : (
                      <RotateCcw
                        size={24}
                      />
                    )}

                  </div>

                  <div>

                    <h3>
                      {getRequestTypeLabel(
                        selectedReturn.request_type
                      )}
                    </h3>

                    <span>
                      Order #
                      {selectedReturn.order_id}
                    </span>

                  </div>

                </div>

                <div className="return-details-grid">

                  <div className="return-detail-item">
                    <span>
                      Return ID
                    </span>

                    <strong>
                      #{selectedReturn.return_id}
                    </strong>
                  </div>

                  <div className="return-detail-item">
                    <span>
                      Order ID
                    </span>

                    <strong>
                      #{selectedReturn.order_id}
                    </strong>
                  </div>

                  <div className="return-detail-item">
                    <span>
                      Order Item ID
                    </span>

                    <strong>
                      #{selectedReturn.order_item_id}
                    </strong>
                  </div>

                  <div className="return-detail-item">
                    <span>
                      Customer ID
                    </span>

                    <strong>
                      #{selectedReturn.user_id}
                    </strong>
                  </div>

                  <div className="return-detail-item">
                    <span>
                      Request Type
                    </span>

                    <strong>
                      {getRequestTypeLabel(
                        selectedReturn.request_type
                      )}
                    </strong>
                  </div>

                  <div className="return-detail-item">
                    <span>
                      Status
                    </span>

                    <strong>
                      <span
                        className={getStatusClass(
                          selectedReturn.status
                        )}
                      >
                        {selectedReturn.status}
                      </span>
                    </strong>
                  </div>

                  <div className="return-detail-item">
                    <span>
                      Requested At
                    </span>

                    <strong>
                      {formatDate(
                        selectedReturn.requested_at
                      )}
                    </strong>
                  </div>

                  <div className="return-detail-item">
                    <span>
                      Processed At
                    </span>

                    <strong>
                      {formatDate(
                        selectedReturn.processed_at
                      )}
                    </strong>
                  </div>

                </div>

                <div className="return-text-section">

                  <span>
                    Reason
                  </span>

                  <p>
                    {selectedReturn.reason ||
                      "No reason provided."}
                  </p>

                </div>

                <div className="return-text-section">

                  <span>
                    Description
                  </span>

                  <p>
                    {selectedReturn.description ||
                      "No description provided."}
                  </p>

                </div>

                <div className="return-modal-actions">

                  <button
                    type="button"
                    className="return-secondary-btn"
                    onClick={() =>
                      setShowViewModal(false)
                    }
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="return-primary-btn"
                    onClick={() => {
                      setShowViewModal(false);
                      openEditModal(
                        selectedReturn
                      );
                    }}
                  >
                    <Pencil size={15} />
                    Update Status
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      {/* =========================================
          EDIT STATUS MODAL
      ========================================= */}

      {showEditModal &&
        selectedReturn && (

          <div className="return-modal-overlay">

            <div className="return-modal return-edit-modal">

              <div className="return-modal-header">

                <div>

                  <h2>
                    Update Return Request
                  </h2>

                  <p>
                    Change the request status.
                  </p>

                </div>

                <button
                  type="button"
                  className="return-modal-close"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                >
                  <X size={20} />
                </button>

              </div>

              <form
                className="return-edit-content"
                onSubmit={handleUpdateStatus}
              >

                <div className="return-edit-preview">

                  <strong>
                    Request #
                    {selectedReturn.return_id}
                  </strong>

                  <span>
                    {getRequestTypeLabel(
                      selectedReturn.request_type
                    )}
                    {" • "}
                    Order #
                    {selectedReturn.order_id}
                  </span>

                </div>

                <div className="return-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(
                        e.target.value
                      )
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

                    <option value="completed">
                      Completed
                    </option>
                  </select>

                </div>

                <div className="return-modal-actions">

                  <button
                    type="button"
                    className="return-secondary-btn"
                    onClick={() =>
                      setShowEditModal(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="return-primary-btn"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Update Status"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

    </div>
  );
}