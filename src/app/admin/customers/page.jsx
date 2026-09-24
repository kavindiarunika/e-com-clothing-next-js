"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Users,
  X,
  Eye,
} from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    status: "active",
  });

  /* =========================================
     LOAD CUSTOMERS
  ========================================= */

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/customers");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load customers"
        );
      }

      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Load customers error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  /* =========================================
     FILTER CUSTOMERS
  ========================================= */

  useEffect(() => {
    let result = [...customers];

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      result = result.filter((customer) =>
        [
          customer.user_id,
          customer.first_name,
          customer.last_name,
          customer.email,
          customer.phone,
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
        (customer) =>
          customer.status === statusFilter
      );
    }

    setFilteredCustomers(result);
  }, [search, statusFilter, customers]);

  /* =========================================
     OPEN ADD MODAL
  ========================================= */

  const openAddModal = () => {
    setEditingCustomer(null);

    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      status: "active",
    });

    setShowModal(true);
  };

  /* =========================================
     OPEN EDIT MODAL
  ========================================= */

  const openEditModal = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      email: customer.email || "",
      password: "",
      phone: customer.phone || "",
      status: customer.status || "active",
    });

    setShowModal(true);
  };

  /* =========================================
     VIEW CUSTOMER
  ========================================= */

  const openViewModal = (customer) => {
    setViewingCustomer(customer);
    setShowViewModal(true);
  };

  /* =========================================
     FORM CHANGE
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
     SAVE CUSTOMER
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name.trim()) {
      alert("First name is required.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Email is required.");
      return;
    }

    if (!editingCustomer && !formData.password) {
      alert("Password is required for a new customer.");
      return;
    }

    try {
      setSaving(true);

      const url = editingCustomer
        ? `/api/admin/customers/${editingCustomer.user_id}`
        : "/api/admin/customers";

      const method = editingCustomer
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save customer"
        );
      }

      setShowModal(false);
      setEditingCustomer(null);

      await loadCustomers();
    } catch (error) {
      console.error("Save customer error:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     DELETE CUSTOMER
  ========================================= */

  const handleDelete = async (customer) => {
    const customerName = [
      customer.first_name,
      customer.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        customerName || customer.email
      }?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/customers/${customer.user_id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete customer"
        );
      }

      await loadCustomers();
    } catch (error) {
      console.error("Delete customer error:", error);
      alert(error.message);
    }
  };

  /* =========================================
     CUSTOMER NAME
  ========================================= */

  const getCustomerName = (customer) => {
    const name = [
      customer.first_name,
      customer.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return name || "Unnamed Customer";
  };

  /* =========================================
     INITIALS
  ========================================= */

  const getInitials = (customer) => {
    const name = getCustomerName(customer);

    if (name === "Unnamed Customer") {
      return "C";
    }

    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  /* =========================================
     STATUS CLASS
  ========================================= */

  const getStatusClass = (status) => {
    if (status === "active") {
      return "customer-status customer-status-active";
    }

    return "customer-status customer-status-inactive";
  };

  /* =========================================
     DATE FORMAT
  ========================================= */

  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleDateString();
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="admin-customer-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="customer-page-header">

        <div>
          <h1>Customers</h1>

          <p>
            Manage your VELORA customers and accounts.
          </p>
        </div>

        <div className="customer-header-actions">

          <button
            type="button"
            className="customer-refresh-btn"
            onClick={loadCustomers}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            className="customer-add-btn"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add Customer
          </button>

        </div>

      </div>

      {/* =========================================
          SUMMARY
      ========================================= */}

      <div className="customer-summary">

        <div className="customer-summary-card">

          <div className="customer-summary-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Total Customers</span>

            <strong>
              {customers.length}
            </strong>
          </div>

        </div>

        <div className="customer-summary-card">

          <div className="customer-summary-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Active Customers</span>

            <strong>
              {
                customers.filter(
                  (customer) =>
                    customer.status === "active"
                ).length
              }
            </strong>
          </div>

        </div>

        <div className="customer-summary-card">

          <div className="customer-summary-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Inactive Customers</span>

            <strong>
              {
                customers.filter(
                  (customer) =>
                    customer.status === "inactive"
                ).length
              }
            </strong>
          </div>

        </div>

      </div>

      {/* =========================================
          FILTERS
      ========================================= */}

      <div className="customer-filters">

        <div className="customer-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          className="customer-filter-select"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
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

      {/* =========================================
          CUSTOMER TABLE
      ========================================= */}

      <div className="customer-table-card">

        <div className="customer-table-wrapper">

          <table className="customer-table">

            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="6"
                    className="customer-empty"
                  >
                    Loading customers...
                  </td>
                </tr>

              ) : filteredCustomers.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="customer-empty"
                  >
                    <Users size={30} />

                    <span>
                      No customers found.
                    </span>
                  </td>
                </tr>

              ) : (

                filteredCustomers.map(
                  (customer) => (

                    <tr
                      key={customer.user_id}
                    >

                      {/* Customer */}
                      <td>

                        <div className="customer-info">

                          <div className="customer-avatar">
                            {getInitials(customer)}
                          </div>

                          <div className="customer-details">

                            <strong>
                              {getCustomerName(
                                customer
                              )}
                            </strong>

                            <span>
                              #{customer.user_id}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* Email */}
                      <td>

                        <span className="customer-email">
                          {customer.email || "-"}
                        </span>

                      </td>

                      {/* Phone */}
                      <td>

                        <span className="customer-phone">
                          {customer.phone || "-"}
                        </span>

                      </td>

                      {/* Status */}
                      <td>

                        <span
                          className={getStatusClass(
                            customer.status
                          )}
                        >
                          {customer.status}
                        </span>

                      </td>

                      {/* Joined */}
                      <td>

                        <span className="customer-date">
                          {formatDate(
                            customer.created_at
                          )}
                        </span>

                      </td>

                      {/* Actions */}
                      <td>

                        <div className="customer-actions">

                          <button
                            type="button"
                            className="customer-action-btn"
                            title="View Customer"
                            onClick={() =>
                              openViewModal(
                                customer
                              )
                            }
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            className="customer-action-btn"
                            title="Edit Customer"
                            onClick={() =>
                              openEditModal(
                                customer
                              )
                            }
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="customer-action-btn customer-delete-btn"
                            title="Delete Customer"
                            onClick={() =>
                              handleDelete(
                                customer
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
          ADD / EDIT MODAL
      ========================================= */}

      {showModal && (

        <div className="customer-modal-overlay">

          <div className="customer-modal">

            <div className="customer-modal-header">

              <div>

                <h2>
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>

                <p>
                  {editingCustomer
                    ? "Update customer information."
                    : "Add a new customer account."}
                </p>

              </div>

              <button
                type="button"
                className="customer-modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            <form
              className="customer-form"
              onSubmit={handleSubmit}
            >

              {/* Name */}
              <div className="customer-form-row">

                <div className="customer-form-group">

                  <label>
                    First Name *
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First name"
                    required
                  />

                </div>

                <div className="customer-form-group">

                  <label>
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last name"
                  />

                </div>

              </div>

              {/* Email */}
              <div className="customer-form-group">

                <label>
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                  required
                />

              </div>

              {/* Phone */}
              {!editingCustomer && (
                <div className="customer-form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Account password"
                    required
                  />
                </div>
              )}

              {/* Phone */}
              <div className="customer-form-group">

                <label>
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="07X XXXXXXX"
                />

              </div>

              {/* Status */}
              <div className="customer-form-group">

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
              <div className="customer-modal-actions">

                <button
                  type="button"
                  className="customer-cancel-btn"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="customer-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCustomer
                    ? "Update Customer"
                    : "Add Customer"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================================
          VIEW CUSTOMER MODAL
      ========================================= */}

      {showViewModal &&
        viewingCustomer && (

          <div className="customer-modal-overlay">

            <div className="customer-modal customer-view-modal">

              <div className="customer-modal-header">

                <div>

                  <h2>
                    Customer Details
                  </h2>

                  <p>
                    View customer account information.
                  </p>

                </div>

                <button
                  type="button"
                  className="customer-modal-close"
                  onClick={() =>
                    setShowViewModal(false)
                  }
                >
                  <X size={20} />
                </button>

              </div>

              <div className="customer-view-content">

                <div className="customer-view-profile">

                  <div className="customer-view-avatar">
                    {getInitials(
                      viewingCustomer
                    )}
                  </div>

                  <div>

                    <h3>
                      {getCustomerName(
                        viewingCustomer
                      )}
                    </h3>

                    <span>
                      Customer #
                      {viewingCustomer.user_id}
                    </span>

                  </div>

                </div>

                <div className="customer-details-grid">

                  <div className="customer-detail-item">

                    <span>
                      First Name
                    </span>

                    <strong>
                      {viewingCustomer.first_name ||
                        "-"}
                    </strong>

                  </div>

                  <div className="customer-detail-item">

                    <span>
                      Last Name
                    </span>

                    <strong>
                      {viewingCustomer.last_name ||
                        "-"}
                    </strong>

                  </div>

                  <div className="customer-detail-item">

                    <span>
                      Email
                    </span>

                    <strong>
                      {viewingCustomer.email ||
                        "-"}
                    </strong>

                  </div>

                  <div className="customer-detail-item">

                    <span>
                      Phone
                    </span>

                    <strong>
                      {viewingCustomer.phone ||
                        "-"}
                    </strong>

                  </div>

                  <div className="customer-detail-item">

                    <span>
                      Status
                    </span>

                    <strong>
                      <span
                        className={getStatusClass(
                          viewingCustomer.status
                        )}
                      >
                        {viewingCustomer.status}
                      </span>
                    </strong>

                  </div>

                  <div className="customer-detail-item">

                    <span>
                      Joined Date
                    </span>

                    <strong>
                      {formatDate(
                        viewingCustomer.created_at
                      )}
                    </strong>

                  </div>

                </div>

                <div className="customer-view-actions">

                  <button
                    type="button"
                    className="customer-cancel-btn"
                    onClick={() =>
                      setShowViewModal(false)
                    }
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="customer-save-btn"
                    onClick={() => {
                      setShowViewModal(false);
                      openEditModal(
                        viewingCustomer
                      );
                    }}
                  >
                    <Pencil size={15} />
                    Edit Customer
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}