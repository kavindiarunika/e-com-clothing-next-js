"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  TicketPercent,
} from "lucide-react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [editingCoupon, setEditingCoupon] =
    useState(null);

  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    minimum_order_amount: "0",
    maximum_discount: "",
    usage_limit: "",
    start_date: "",
    end_date: "",
    status: "active",
  });

  // ==========================================
  // LOAD COUPONS
  // ==========================================

  const loadCoupons = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/coupons"
      );

      const data = await response.json();

      if (data.success) {
        setCoupons(data.coupons || []);
      } else {
        alert(
          data.message || "Failed to load coupons"
        );
      }
    } catch (error) {
      console.error(
        "Coupons loading error:",
        error
      );

      alert("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setForm({
      code: "",
      title: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      minimum_order_amount: "0",
      maximum_discount: "",
      usage_limit: "",
      start_date: "",
      end_date: "",
      status: "active",
    });

    setEditingCoupon(null);
  };

  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code || "",
      title: coupon.title || "",
      description: coupon.description || "",
      discount_type:
        coupon.discount_type || "percentage",
      discount_value:
        coupon.discount_value ?? "",
      minimum_order_amount:
        coupon.minimum_order_amount ?? "0",
      maximum_discount:
        coupon.maximum_discount ?? "",
      usage_limit:
        coupon.usage_limit ?? "",
      start_date: coupon.start_date
        ? formatDateTimeForInput(
            coupon.start_date
          )
        : "",
      end_date: coupon.end_date
        ? formatDateTimeForInput(
            coupon.end_date
          )
        : "",
      status: coupon.status || "active",
    });

    setShowModal(true);
  };

  // ==========================================
  // FORMAT DATETIME FOR INPUT
  // ==========================================

  const formatDateTimeForInput = (date) => {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "";
    }

    const year = value.getFullYear();

    const month = String(
      value.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      value.getDate()
    ).padStart(2, "0");

    const hours = String(
      value.getHours()
    ).padStart(2, "0");

    const minutes = String(
      value.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SUBMIT FORM
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.coupon_id}`
        : "/api/admin/coupons";

      const method = editingCoupon
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          title: form.title.trim(),
          description:
            form.description.trim(),

          discount_type:
            form.discount_type,

          discount_value:
            Number(form.discount_value),

          minimum_order_amount:
            Number(
              form.minimum_order_amount || 0
            ),

          maximum_discount:
            form.maximum_discount === ""
              ? null
              : Number(
                  form.maximum_discount
                ),

          usage_limit:
            form.usage_limit === ""
              ? null
              : Number(form.usage_limit),

          start_date:
            form.start_date || null,

          end_date:
            form.end_date || null,

          status: form.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        resetForm();
        loadCoupons();
      } else {
        alert(
          data.message ||
            "Failed to save coupon"
        );
      }
    } catch (error) {
      console.error(
        "Coupon save error:",
        error
      );

      alert("Failed to save coupon");
    }
  };

  // ==========================================
  // DELETE COUPON
  // ==========================================

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete coupon "${coupon.code}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/coupons/${coupon.coupon_id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        loadCoupons();
      } else {
        alert(
          data.message ||
            "Failed to delete coupon"
        );
      }
    } catch (error) {
      console.error(
        "Coupon delete error:",
        error
      );

      alert("Failed to delete coupon");
    }
  };

  // ==========================================
  // FILTER COUPONS
  // ==========================================

  const filteredCoupons = coupons.filter(
    (coupon) => {
      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        String(coupon.code || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(coupon.title || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(coupon.description || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        coupon.status === statusFilter;

      return (
        matchesSearch && matchesStatus
      );
    }
  );

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (value) => {
    return `Rs. ${Number(
      value || 0
    ).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "-";
    }

    return value.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // DISCOUNT DISPLAY
  // ==========================================

  const getDiscountText = (coupon) => {
    if (
      coupon.discount_type ===
      "percentage"
    ) {
      return `${Number(
        coupon.discount_value
      )}%`;
    }

    return formatMoney(
      coupon.discount_value
    );
  };

  return (
    <div className="admin-coupon-page">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="coupon-page-header">

        <div>
          <h1>Coupons</h1>

          <p>
            Create and manage discount coupons
            for your store.
          </p>
        </div>

        <button
          className="add-coupon-btn"
          onClick={handleAdd}
        >
          <Plus size={17} />

          Add Coupon
        </button>

      </div>

      {/* ======================================
          FILTERS
      ====================================== */}

      <div className="coupon-filters">

        <div className="coupon-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search coupon code or title..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

        <select
          className="coupon-status-filter"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>

      </div>

      {/* ======================================
          TABLE
      ====================================== */}

      <div className="coupon-table-card">

        <div className="coupon-table-wrapper">

          <table className="coupon-table">

            <thead>
              <tr>
                <th>Coupon</th>
                <th>Discount</th>
                <th>Minimum Order</th>
                <th>Usage</th>
                <th>Validity</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="coupon-empty"
                  >
                    Loading coupons...
                  </td>
                </tr>
              ) : filteredCoupons.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="coupon-empty"
                  >
                    No coupons found.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map(
                  (coupon) => (
                    <tr
                      key={
                        coupon.coupon_id
                      }
                    >

                      {/* COUPON */}

                      <td>

                        <div className="coupon-info">

                          <div className="coupon-icon">
                            <TicketPercent
                              size={18}
                            />
                          </div>

                          <div>

                            <strong>
                              {coupon.code}
                            </strong>

                            <span>
                              {coupon.title ||
                                "No title"}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* DISCOUNT */}

                      <td>

                        <div className="coupon-discount">

                          <strong>
                            {getDiscountText(
                              coupon
                            )}
                          </strong>

                          <span>
                            {
                              coupon.discount_type
                            }
                          </span>

                        </div>

                      </td>

                      {/* MINIMUM ORDER */}

                      <td>
                        {formatMoney(
                          coupon.minimum_order_amount
                        )}
                      </td>

                      {/* USAGE */}

                      <td>

                        <div className="coupon-usage">

                          <strong>
                            {
                              coupon.used_count
                            }
                          </strong>

                          <span>
                            /
                            {coupon.usage_limit ??
                              "∞"}
                          </span>

                        </div>

                      </td>

                      {/* VALIDITY */}

                      <td>

                        <div className="coupon-validity">

                          <span>
                            {formatDate(
                              coupon.start_date
                            )}
                          </span>

                          <span>
                            →
                          </span>

                          <span>
                            {formatDate(
                              coupon.end_date
                            )}
                          </span>

                        </div>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`coupon-status ${
                            coupon.status ===
                            "active"
                              ? "coupon-status-active"
                              : "coupon-status-inactive"
                          }`}
                        >
                          {coupon.status ===
                          "active"
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>

                      {/* CREATED */}

                      <td>
                        {formatDate(
                          coupon.created_at
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="coupon-actions">

                          <button
                            className="coupon-action-btn"
                            title="Edit"
                            onClick={() =>
                              handleEdit(
                                coupon
                              )
                            }
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            className="coupon-action-btn coupon-delete-btn"
                            title="Delete"
                            onClick={() =>
                              handleDelete(
                                coupon
                              )
                            }
                          >
                            <Trash2
                              size={16}
                            />
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

      {/* ======================================
          ADD / EDIT MODAL
      ====================================== */}

      {showModal && (
        <div className="coupon-modal-overlay">

          <div className="coupon-modal">

            {/* MODAL HEADER */}

            <div className="coupon-modal-header">

              <div>
                <h2>
                  {editingCoupon
                    ? "Edit Coupon"
                    : "Add Coupon"}
                </h2>

                <p>
                  {editingCoupon
                    ? "Update coupon details."
                    : "Create a new discount coupon."}
                </p>
              </div>

              <button
                className="coupon-modal-close"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              className="coupon-form"
              onSubmit={handleSubmit}
            >

              {/* CODE */}

              <div className="coupon-form-group">

                <label>
                  Coupon Code *
                </label>

                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="SUMMER20"
                  required
                  maxLength={50}
                />

              </div>

              {/* TITLE */}

              <div className="coupon-form-group">

                <label>
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Summer Sale"
                  maxLength={150}
                />

              </div>

              {/* DESCRIPTION */}

              <div className="coupon-form-group coupon-full-width">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Get 20% off on your summer collection..."
                  rows="3"
                />

              </div>

              {/* DISCOUNT TYPE */}

              <div className="coupon-form-group">

                <label>
                  Discount Type *
                </label>

                <select
                  name="discount_type"
                  value={
                    form.discount_type
                  }
                  onChange={handleChange}
                  required
                >
                  <option value="percentage">
                    Percentage
                  </option>

                  <option value="fixed">
                    Fixed Amount
                  </option>
                </select>

              </div>

              {/* DISCOUNT VALUE */}

              <div className="coupon-form-group">

                <label>
                  Discount Value *
                </label>

                <input
                  type="number"
                  name="discount_value"
                  value={
                    form.discount_value
                  }
                  onChange={handleChange}
                  placeholder={
                    form.discount_type ===
                    "percentage"
                      ? "20"
                      : "1000"
                  }
                  min="0"
                  step="0.01"
                  required
                />

              </div>

              {/* MINIMUM ORDER */}

              <div className="coupon-form-group">

                <label>
                  Minimum Order Amount
                </label>

                <input
                  type="number"
                  name="minimum_order_amount"
                  value={
                    form.minimum_order_amount
                  }
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />

              </div>

              {/* MAXIMUM DISCOUNT */}

              <div className="coupon-form-group">

                <label>
                  Maximum Discount
                </label>

                <input
                  type="number"
                  name="maximum_discount"
                  value={
                    form.maximum_discount
                  }
                  onChange={handleChange}
                  placeholder="Optional"
                  min="0"
                  step="0.01"
                />

              </div>

              {/* USAGE LIMIT */}

              <div className="coupon-form-group">

                <label>
                  Usage Limit
                </label>

                <input
                  type="number"
                  name="usage_limit"
                  value={
                    form.usage_limit
                  }
                  onChange={handleChange}
                  placeholder="Unlimited"
                  min="1"
                />

              </div>

              {/* START DATE */}

              <div className="coupon-form-group">

                <label>
                  Start Date
                </label>

                <input
                  type="datetime-local"
                  name="start_date"
                  value={
                    form.start_date
                  }
                  onChange={handleChange}
                />

              </div>

              {/* END DATE */}

              <div className="coupon-form-group">

                <label>
                  End Date
                </label>

                <input
                  type="datetime-local"
                  name="end_date"
                  value={
                    form.end_date
                  }
                  onChange={handleChange}
                />

              </div>

              {/* STATUS */}

              <div className="coupon-form-group">

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

              {/* ACTIONS */}

              <div className="coupon-form-actions">

                <button
                  type="button"
                  className="coupon-cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="coupon-submit-btn"
                >
                  {editingCoupon
                    ? "Update Coupon"
                    : "Add Coupon"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}