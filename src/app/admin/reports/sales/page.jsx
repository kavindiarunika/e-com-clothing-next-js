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

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [selectedSale, setSelectedSale] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [saleDetailsLoading, setSaleDetailsLoading] = useState(false);

  const loadSales = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/reports/sales", {
        cache: "no-store",
      });
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
    let isActive = true;

    async function fetchInitialSales() {
      try {
        const response = await fetch("/api/admin/reports/sales", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load sales report");
        }

        if (isActive) setSales(data.sales || []);
      } catch (error) {
        console.error("Sales Report Error:", error);
        if (isActive) setSales([]);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void fetchInitialSales();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredSales = sales.filter((sale) => {
    const searchValue = search.trim().toLowerCase();
    const matchesSearch = !searchValue || [
      sale.order_id,
      sale.user_id,
      sale.customer_name,
      sale.customer_email,
      sale.customer_phone,
      sale.payment_status,
      sale.order_status,
      ...(sale.items || []).flatMap((item) => [
        item.product_title,
        item.sku,
      ]),
    ].some((value) => String(value || "").toLowerCase().includes(searchValue));

    const saleDate = new Date(sale.order_date);
    const matchesFromDate =
      !dateFrom || saleDate >= new Date(`${dateFrom}T00:00:00`);
    const matchesToDate =
      !dateTo || saleDate <= new Date(`${dateTo}T23:59:59`);

    return (
      matchesSearch &&
      (statusFilter === "all" || sale.order_status === statusFilter) &&
      (paymentFilter === "all" || sale.payment_status === paymentFilter) &&
      matchesFromDate &&
      matchesToDate
    );
  });

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

  const openViewModal = async (sale) => {
    setSelectedSale(sale);
    setShowViewModal(true);
    setSaleDetailsLoading(true);

    try {
      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(sale.order_id)}`,
        { cache: "no-store" }
      );

      if (!response.ok) return;

      const details = await response.json();
      setSelectedSale((currentSale) =>
        currentSale?.order_id === sale.order_id
          ? { ...currentSale, ...details }
          : currentSale
      );
    } catch (error) {
      console.error("Sales detail error:", error);
    } finally {
      setSaleDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedSale(null);
    setShowViewModal(false);
    setSaleDetailsLoading(false);
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
                <th>Products</th>
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
                    colSpan="11"
                    className="sales-report-empty"
                  >
                    Loading sales report...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
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
                        {sale.customer_name ||
                          (sale.user_id ? `Customer #${sale.user_id}` : "Guest")}
                      </span>
                      {sale.customer_email && (
                        <small className="sales-customer-email">
                          {sale.customer_email}
                        </small>
                      )}
                      {sale.customer_phone && (
                        <small className="sales-customer-email">
                          {sale.customer_phone}
                        </small>
                      )}
                    </td>

                    <td className="sales-product-cell">
                      {sale.items?.length ? (
                        <>
                          {sale.items.slice(0, 2).map((item) => (
                            <div className="sales-product-item" key={item.order_item_id}>
                              <strong>{item.product_title || `Product #${item.item_id}`}</strong>
                              <small>
                                SKU: {item.sku || "-"} | Qty: {item.qty}
                              </small>
                            </div>
                          ))}
                          {sale.items.length > 2 && (
                            <small className="sales-product-more">
                              +{sale.items.length - 2} more
                            </small>
                          )}
                        </>
                      ) : (
                        <span>-</span>
                      )}
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
                <span>Customer</span>
                <strong>
                  {selectedSale.customer_name ||
                    (selectedSale.user_id
                      ? `Customer #${selectedSale.user_id}`
                      : "Guest")}
                </strong>
              </div>

              <div className="sales-detail-item">
                <span>Email</span>
                <strong>{selectedSale.customer_email || "-"}</strong>
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
                <span>Payment Method</span>
                <strong>
                  {selectedSale.payment_method?.replaceAll("_", " ") || "-"}
                </strong>
              </div>

              <div className="sales-detail-item">
                <span>Items</span>
                <strong>{selectedSale.items?.length ?? selectedSale.item_count ?? 0}</strong>
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

            <div className="sales-details-grid">
              <div className="sales-detail-item">
                <span>Products</span>
                {saleDetailsLoading ? (
                  <strong>Loading items...</strong>
                ) : selectedSale.items?.length ? (
                  selectedSale.items.map((item) => (
                    <strong key={item.order_item_id}>
                      {item.product_title || `Product #${item.item_id}`} x {item.qty}
                    </strong>
                  ))
                ) : (
                  <strong>No item details available</strong>
                )}
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