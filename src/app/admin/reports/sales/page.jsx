"use client";

import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  ShoppingBag,
  Banknote,
  Tag,
  Truck,
  FileDown,
} from "lucide-react";

export default function SalesReportPage() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [selectedSale, setSelectedSale] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const loadSales = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/reports/sales");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load sales report");
      }

      setSales(data.sales || []);
    } catch (error) {
      console.error("Sales Report Error:", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    let result = [...sales];

    /* SEARCH */
    if (search.trim()) {
      const value = search.toLowerCase();

      result = result.filter((sale) => {
        return (
          String(sale.order_id).includes(value) ||
          String(sale.user_id || "").includes(value) ||
          String(sale.payment_status || "")
            .toLowerCase()
            .includes(value) ||
          String(sale.order_status || "")
            .toLowerCase()
            .includes(value)
        );
      });
    }

    /* ORDER STATUS */
    if (statusFilter !== "all") {
      result = result.filter(
        (sale) => sale.order_status === statusFilter
      );
    }

    /* PAYMENT STATUS */
    if (paymentFilter !== "all") {
      result = result.filter(
        (sale) => sale.payment_status === paymentFilter
      );
    }

    /* DATE FROM */
    if (dateFrom) {
      result = result.filter((sale) => {
        const saleDate = new Date(sale.order_date);
        const fromDate = new Date(`${dateFrom}T00:00:00`);

        return saleDate >= fromDate;
      });
    }

    /* DATE TO */
    if (dateTo) {
      result = result.filter((sale) => {
        const saleDate = new Date(sale.order_date);
        const toDate = new Date(`${dateTo}T23:59:59`);

        return saleDate <= toDate;
      });
    }

    setFilteredSales(result);
  }, [
    sales,
    search,
    statusFilter,
    paymentFilter,
    dateFrom,
    dateTo,
  ]);

  /* =========================
     REPORT TOTALS
  ========================= */

  const totalOrders = filteredSales.length;

  const totalSales = filteredSales.reduce(
    (total, sale) =>
      total + Number(sale.total_amount || 0),
    0
  );

  const totalDiscount = filteredSales.reduce(
    (total, sale) =>
      total + Number(sale.discount || 0),
    0
  );

  const totalShipping = filteredSales.reduce(
    (total, sale) =>
      total + Number(sale.shipping_fee || 0),
    0
  );

  const totalSubtotal = filteredSales.reduce(
    (total, sale) =>
      total + Number(sale.subtotal || 0),
    0
  );

  const formatCurrency = (value) => {
    return `Rs. ${Number(value || 0).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-LK",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-LK",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const openViewModal = (sale) => {
    setSelectedSale(sale);
    setShowViewModal(true);
  };

  const closeModal = () => {
    setSelectedSale(null);
    setShowViewModal(false);
  };

  const exportPdf = () => {
    window.print();
  };

  return (
    <div className="admin-sales-report-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="sales-report-header">
        <div>
          <h1>Sales Report</h1>
          <p>
            View and analyze your store sales performance.
          </p>
        </div>

        <div className="sales-report-header-actions">
          <button
            className="sales-report-export-btn"
            onClick={exportPdf}
            type="button"
          >
            <FileDown size={17} />
            Save PDF
          </button>

          <button
            className="sales-report-refresh-btn"
            onClick={loadSales}
            disabled={loading}
            type="button"
          >
            <RefreshCw
              size={17}
              className={loading ? "sales-spin" : ""}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="sales-summary">

        <div className="sales-summary-card">
          <div className="sales-summary-icon">
            <ShoppingBag size={21} />
          </div>

          <div>
            <span>Total Orders</span>
            <strong>{totalOrders}</strong>
          </div>
        </div>

        <div className="sales-summary-card">
          <div className="sales-summary-icon">
            <Banknote size={21} />
          </div>

          <div>
            <span>Total Sales</span>
            <strong>
              {formatCurrency(totalSales)}
            </strong>
          </div>
        </div>

        <div className="sales-summary-card">
          <div className="sales-summary-icon">
            <Tag size={21} />
          </div>

          <div>
            <span>Total Discount</span>
            <strong>
              {formatCurrency(totalDiscount)}
            </strong>
          </div>
        </div>

        <div className="sales-summary-card">
          <div className="sales-summary-icon">
            <Truck size={21} />
          </div>

          <div>
            <span>Shipping Revenue</span>
            <strong>
              {formatCurrency(totalShipping)}
            </strong>
          </div>
        </div>

      </div>

      {/* =========================
          FILTERS
      ========================= */}

      <div className="sales-report-filters">

        <div className="sales-report-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search order or customer..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          className="sales-report-filter-select"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">
            All Order Status
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="processing">
            Processing
          </option>

          <option value="shipped">
            Shipped
          </option>

          <option value="delivered">
            Delivered
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>

        <select
          className="sales-report-filter-select"
          value={paymentFilter}
          onChange={(e) =>
            setPaymentFilter(e.target.value)
          }
        >
          <option value="all">
            All Payment Status
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="paid">
            Paid
          </option>

          <option value="failed">
            Failed
          </option>

          <option value="refunded">
            Refunded
          </option>
        </select>

        <input
          type="date"
          className="sales-report-date"
          value={dateFrom}
          onChange={(e) =>
            setDateFrom(e.target.value)
          }
        />

        <input
          type="date"
          className="sales-report-date"
          value={dateTo}
          onChange={(e) =>
            setDateTo(e.target.value)
          }
        />

      </div>

      {/* =========================
          REPORT TABLE
      ========================= */}

      <div className="sales-report-table-card">

        <div className="sales-report-table-wrapper">

          <table className="sales-report-table">

            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Shipping</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="sales-report-empty"
                  >
                    Loading sales report...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="sales-report-empty"
                  >
                    No sales records found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (

                  <tr key={sale.order_id}>

                    <td>
                      <div className="sales-order-info">
                        <span className="sales-order-icon">
                          <ShoppingBag size={16} />
                        </span>

                        <strong>
                          #{sale.order_id}
                        </strong>
                      </div>
                    </td>

                    <td>
                      <span className="sales-customer">
                        #{sale.user_id || "Guest"}
                      </span>
                    </td>

                    <td>
                      <span className="sales-date">
                        {formatDate(
                          sale.order_date
                        )}
                      </span>
                    </td>

                    <td>
                      {formatCurrency(
                        sale.subtotal
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        sale.discount
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        sale.shipping_fee
                      )}
                    </td>

                    <td>
                      <strong className="sales-total">
                        {formatCurrency(
                          sale.total_amount
                        )}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`sales-status sales-payment-${sale.payment_status}`}
                      >
                        {sale.payment_status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`sales-status sales-order-${sale.order_status}`}
                      >
                        {sale.order_status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="sales-action-btn"
                        onClick={() =>
                          openViewModal(sale)
                        }
                        title="View Sale"
                      >
                        <Eye size={16} />
                      </button>
                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================
          VIEW MODAL
      ========================= */}

      {showViewModal && selectedSale && (
        <div
          className="sales-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="sales-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="sales-modal-header">

              <div>
                <h2>
                  Order #{selectedSale.order_id}
                </h2>

                <p>
                  Sales transaction details
                </p>
              </div>

              <button
                className="sales-modal-close"
                onClick={closeModal}
              >
                <X size={19} />
              </button>

            </div>

            <div className="sales-details-grid">

              <div className="sales-detail-item">
                <span>Order ID</span>
                <strong>
                  #{selectedSale.order_id}
                </strong>
              </div>

              <div className="sales-detail-item">
                <span>Customer ID</span>
                <strong>
                  #{selectedSale.user_id || "Guest"}
                </strong>
              </div>

              <div className="sales-detail-item">
                <span>Order Date</span>
                <strong>
                  {formatDateTime(
                    selectedSale.order_date
                  )}
                </strong>
              </div>

              <div className="sales-detail-item">
                <span>Subtotal</span>
                <strong>
                  {formatCurrency(
                    selectedSale.subtotal
                  )}
                </strong>
              </div>

              <div className="sales-detail-item">
                <span>Discount</span>
                <strong>
                  {formatCurrency(
                    selectedSale.discount
                  )}
                </strong>
              </div>

              <div className="sales-detail-item">
                <span>Shipping Fee</span>
                <strong>
                  {formatCurrency(
                    selectedSale.shipping_fee
                  )}
                </strong>
              </div>

              <div className="sales-detail-item">
                <span>Payment Status</span>

                <strong
                  className={`sales-status sales-payment-${selectedSale.payment_status}`}
                >
                  {selectedSale.payment_status}
                </strong>
              </div>

              <div className="sales-detail-item">
                <span>Order Status</span>

                <strong
                  className={`sales-status sales-order-${selectedSale.order_status}`}
                >
                  {selectedSale.order_status}
                </strong>
              </div>

            </div>

            <div className="sales-total-box">

              <span>Total Amount</span>

              <strong>
                {formatCurrency(
                  selectedSale.total_amount
                )}
              </strong>

            </div>

            <div className="sales-modal-actions">

              <button
                className="sales-close-btn"
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