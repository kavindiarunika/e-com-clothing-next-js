"use client";

import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  CreditCard,
  Banknote,
  Wallet,
  Landmark,
} from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // =========================================================
  // LOAD PAYMENTS
  // =========================================================

  const loadPayments = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/payments");
      const data = await response.json();

      if (data.success) {
        setPayments(data.payments || []);
      } else {
        console.error(data.message);
        setPayments([]);
      }
    } catch (error) {
      console.error("Failed to load payments:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // =========================================================
  // PAYMENT METHOD LABEL
  // =========================================================

  const getMethodLabel = (method) => {
    switch (method) {
      case "card":
        return "Card";

      case "payhere":
        return "PayHere";

      case "cash_on_delivery":
        return "Cash on Delivery";

      case "bank_transfer":
        return "Bank Transfer";

      default:
        return method || "-";
    }
  };

  // =========================================================
  // PAYMENT ICON
  // =========================================================

  const getMethodIcon = (method) => {
    switch (method) {
      case "card":
        return <CreditCard size={18} />;

      case "payhere":
        return <Wallet size={18} />;

      case "cash_on_delivery":
        return <Banknote size={18} />;

      case "bank_transfer":
        return <Landmark size={18} />;

      default:
        return <CreditCard size={18} />;
    }
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "successful":
        return "Successful";

      case "pending":
        return "Pending";

      case "failed":
        return "Failed";

      case "refunded":
        return "Refunded";

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
  // CURRENCY FORMAT
  // =========================================================

  const formatAmount = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================================================
  // FILTER PAYMENTS
  // =========================================================

  const filteredPayments = payments.filter((payment) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      String(payment.payment_id || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(payment.order_id || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(payment.transaction_id || "")
        .toLowerCase()
        .includes(searchValue);

    const matchesMethod =
      methodFilter === "all" ||
      payment.payment_method === methodFilter;

    const matchesStatus =
      statusFilter === "all" ||
      payment.payment_status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalPayments = payments.length;

  const successfulPayments = payments.filter(
    (payment) => payment.payment_status === "successful"
  ).length;

  const pendingPayments = payments.filter(
    (payment) => payment.payment_status === "pending"
  ).length;

  const successfulAmount = payments
    .filter((payment) => payment.payment_status === "successful")
    .reduce((total, payment) => {
      return total + Number(payment.amount || 0);
    }, 0);

  // =========================================================
  // VIEW PAYMENT
  // =========================================================

  const handleView = async (paymentId) => {
    try {
      const response = await fetch(
        `/api/admin/payments/${paymentId}`
      );

      const data = await response.json();

      if (data.success) {
        setSelectedPayment(data.payment);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Failed to load payment:", error);
    }
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  return (
    <div className="admin-payment-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="payment-page-header">
        <div>
          <h1>Payments</h1>

          <p>
            Manage and monitor customer payment transactions.
          </p>
        </div>

        <button
          className="payment-refresh-btn"
          onClick={loadPayments}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "payment-spin" : ""}
          />

          Refresh
        </button>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="payment-summary">

        <div className="payment-summary-card">
          <div className="payment-summary-icon">
            <CreditCard size={21} />
          </div>

          <div>
            <span>Total Payments</span>
            <strong>{totalPayments}</strong>
          </div>
        </div>

        <div className="payment-summary-card">
          <div className="payment-summary-icon">
            <Wallet size={21} />
          </div>

          <div>
            <span>Successful</span>
            <strong>{successfulPayments}</strong>
          </div>
        </div>

        <div className="payment-summary-card">
          <div className="payment-summary-icon">
            <Banknote size={21} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingPayments}</strong>
          </div>
        </div>

        <div className="payment-summary-card">
          <div className="payment-summary-icon">
            <Landmark size={21} />
          </div>

          <div>
            <span>Successful Amount</span>

            <strong>
              {formatAmount(successfulAmount)}
            </strong>
          </div>
        </div>

      </div>

      {/* =====================================================
          FILTER SECTION
      ====================================================== */}

      <div className="payment-filters">

        <div className="payment-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search payment ID, order ID or transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="payment-filter-select"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="all">All Methods</option>
          <option value="card">Card</option>
          <option value="payhere">PayHere</option>
          <option value="cash_on_delivery">
            Cash on Delivery
          </option>
          <option value="bank_transfer">
            Bank Transfer
          </option>
        </select>

        <select
          className="payment-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="successful">Successful</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

      </div>

      {/* =====================================================
          PAYMENT TABLE
      ====================================================== */}

      <div className="payment-table-card">

        <div className="payment-table-wrapper">

          <table className="payment-table">

            <thead>
              <tr>
                <th>Payment</th>
                <th>Order</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Paid At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="payment-empty"
                  >
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="payment-empty"
                  >
                    No payments found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.payment_id}>

                    {/* PAYMENT */}
                    <td>
                      <div className="payment-info">

                        <div className="payment-icon">
                          {getMethodIcon(
                            payment.payment_method
                          )}
                        </div>

                        <div>
                          <strong>
                            #{payment.payment_id}
                          </strong>

                          <span>
                            {formatDate(payment.created_at)}
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* ORDER */}
                    <td>
                      <span className="payment-order-id">
                        #{payment.order_id}
                      </span>
                    </td>

                    {/* METHOD */}
                    <td>
                      <span className="payment-method">
                        {getMethodLabel(
                          payment.payment_method
                        )}
                      </span>
                    </td>

                    {/* TRANSACTION */}
                    <td>
                      <span className="payment-transaction">
                        {payment.transaction_id || "-"}
                      </span>
                    </td>

                    {/* AMOUNT */}
                    <td>
                      <strong className="payment-amount">
                        {formatAmount(payment.amount)}
                      </strong>
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`payment-status payment-status-${payment.payment_status}`}
                      >
                        {getStatusLabel(
                          payment.payment_status
                        )}
                      </span>
                    </td>

                    {/* PAID AT */}
                    <td>
                      <span className="payment-date">
                        {formatDate(payment.paid_at)}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td>
                      <button
                        className="payment-action-btn"
                        onClick={() =>
                          handleView(payment.payment_id)
                        }
                        title="View Payment"
                      >
                        <Eye size={17} />
                      </button>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          VIEW PAYMENT MODAL
      ====================================================== */}

      {showModal && selectedPayment && (
        <div
          className="payment-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="payment-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="payment-modal-header">

              <div>
                <h2>Payment Details</h2>

                <p>
                  Payment #{selectedPayment.payment_id}
                </p>
              </div>

              <button
                className="payment-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>

            </div>

            <div className="payment-detail-top">

              <div className="payment-detail-icon">
                {getMethodIcon(
                  selectedPayment.payment_method
                )}
              </div>

              <div>
                <span>Payment Amount</span>

                <strong>
                  {formatAmount(
                    selectedPayment.amount
                  )}
                </strong>
              </div>

            </div>

            <div className="payment-details-grid">

              <div className="payment-detail-item">
                <span>Payment ID</span>
                <strong>
                  #{selectedPayment.payment_id}
                </strong>
              </div>

              <div className="payment-detail-item">
                <span>Order ID</span>
                <strong>
                  #{selectedPayment.order_id}
                </strong>
              </div>

              <div className="payment-detail-item">
                <span>Payment Method</span>
                <strong>
                  {getMethodLabel(
                    selectedPayment.payment_method
                  )}
                </strong>
              </div>

              <div className="payment-detail-item">
                <span>Transaction ID</span>
                <strong>
                  {selectedPayment.transaction_id || "-"}
                </strong>
              </div>

              <div className="payment-detail-item">
                <span>Payment Status</span>

                <span
                  className={`payment-status payment-status-${selectedPayment.payment_status}`}
                >
                  {getStatusLabel(
                    selectedPayment.payment_status
                  )}
                </span>
              </div>

              <div className="payment-detail-item">
                <span>Amount</span>
                <strong>
                  {formatAmount(
                    selectedPayment.amount
                  )}
                </strong>
              </div>

              <div className="payment-detail-item">
                <span>Paid At</span>
                <strong>
                  {formatDate(
                    selectedPayment.paid_at
                  )}
                </strong>
              </div>

              <div className="payment-detail-item">
                <span>Created At</span>
                <strong>
                  {formatDate(
                    selectedPayment.created_at
                  )}
                </strong>
              </div>

            </div>

            <div className="payment-modal-actions">

              <button
                className="payment-close-btn"
                onClick={closeModal}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}