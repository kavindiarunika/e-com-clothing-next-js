"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  X,
  Package,
  User,
  MapPin,
  CreditCard,
  CalendarDays,
  Truck,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [updating, setUpdating] = useState(false);

  /* =========================================
     LOAD ORDERS
  ========================================= */

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/orders");

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load orders."
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Orders Load Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================
     FILTER ORDERS
  ========================================= */

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchValue = search.toLowerCase();

      const customerName =
        `${order.first_name || ""} ${
          order.last_name || ""
        }`.toLowerCase();

      const customerEmail =
        order.email?.toLowerCase() || "";

      const orderId =
        String(order.order_id || "").toLowerCase();

      const matchesSearch =
        orderId.includes(searchValue) ||
        customerName.includes(searchValue) ||
        customerEmail.includes(searchValue);

      const matchesPayment =
        paymentFilter === "all" ||
        order.payment_status === paymentFilter;

      const matchesOrderStatus =
        orderStatusFilter === "all" ||
        order.order_status === orderStatusFilter;

      return (
        matchesSearch &&
        matchesPayment &&
        matchesOrderStatus
      );
    });
  }, [
    orders,
    search,
    paymentFilter,
    orderStatusFilter,
  ]);

  /* =========================================
     VIEW ORDER
  ========================================= */

  async function openOrder(orderId) {
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load order."
        );
      }

      setSelectedOrder(data.order);
      setShowModal(true);
    } catch (error) {
      console.error("Order Details Error:", error);
      alert(error.message);
    }
  }

  /* =========================================
     CLOSE MODAL
  ========================================= */

  function closeModal() {
    if (updating) return;

    setShowModal(false);
    setSelectedOrder(null);
  }

  /* =========================================
     UPDATE ORDER STATUS
  ========================================= */

  async function updateOrderStatus(orderStatus) {
    if (!selectedOrder) return;

    try {
      setUpdating(true);

      const response = await fetch(
        `/api/admin/orders/${selectedOrder.order_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_status: orderStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update order."
        );
      }

      setSelectedOrder((prev) => ({
        ...prev,
        order_status: orderStatus,
      }));

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === selectedOrder.order_id
            ? {
                ...order,
                order_status: orderStatus,
              }
            : order
        )
      );
    } catch (error) {
      console.error("Order Status Update Error:", error);
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  }

  /* =========================================
     PAYMENT STATUS CLASS
  ========================================= */

  function getPaymentClass(status) {
    switch (status) {
      case "paid":
        return "paid";

      case "failed":
        return "failed";

      case "refunded":
        return "refunded";

      default:
        return "pending";
    }
  }

  /* =========================================
     ORDER STATUS CLASS
  ========================================= */

  function getOrderStatusClass(status) {
    switch (status) {
      case "processing":
        return "processing";

      case "shipped":
        return "shipped";

      case "delivered":
        return "delivered";

      case "cancelled":
        return "cancelled";

      default:
        return "pending";
    }
  }

  /* =========================================
     FORMAT MONEY
  ========================================= */

  function formatMoney(value) {
    return `Rs. ${Number(value || 0).toLocaleString(
      "en-LK",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  }

  /* =========================================
     FORMAT DATE
  ========================================= */

  function formatDate(value) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "en-LK",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  /* =========================================
     CUSTOMER NAME
  ========================================= */

  function getCustomerName(order) {
    const name =
      `${order.first_name || ""} ${
        order.last_name || ""
      }`.trim();

    return name || "Guest Customer";
  }

  return (
    <div className="admin-orders-page">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="orders-page-header">

        <div>
          <h1>Orders</h1>

          <p>
            Manage customer orders and order status
          </p>
        </div>

        <div className="orders-total-count">
          {orders.length} Orders
        </div>

      </div>

      {/* =========================================
          FILTERS
      ========================================= */}

      <div className="orders-filters">

        {/* SEARCH */}

        <div className="orders-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search order, customer or email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {/* PAYMENT FILTER */}

        <select
          value={paymentFilter}
          onChange={(e) =>
            setPaymentFilter(e.target.value)
          }
          className="orders-filter-select"
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

        {/* ORDER STATUS FILTER */}

        <select
          value={orderStatusFilter}
          onChange={(e) =>
            setOrderStatusFilter(e.target.value)
          }
          className="orders-filter-select"
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

      </div>

      {/* =========================================
          TABLE
      ========================================= */}

      <div className="orders-table-card">

        {loading ? (
          <div className="orders-loading">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty">

            <div className="orders-empty-icon">
              <Package size={30} />
            </div>

            <h3>No orders found</h3>

            <p>
              There are no orders matching your search
              or filters.
            </p>

          </div>
        ) : (
          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>

                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredOrders.map((order) => (

                  <tr key={order.order_id}>

                    {/* ORDER */}

                    <td>

                      <div className="order-id-wrapper">

                        <span className="order-icon">
                          <Package size={17} />
                        </span>

                        <div>
                          <span className="order-id">
                            #{order.order_id}
                          </span>

                          <span className="order-subtext">
                            Order
                          </span>
                        </div>

                      </div>

                    </td>

                    {/* CUSTOMER */}

                    <td>

                      <div className="order-customer">

                        <div className="customer-avatar">
                          <User size={17} />
                        </div>

                        <div>

                          <span className="customer-name">
                            {getCustomerName(order)}
                          </span>

                          <span className="customer-email">
                            {order.email || "No email"}
                          </span>

                        </div>

                      </div>

                    </td>

                    {/* DATE */}

                    <td>

                      <div className="order-date">

                        <CalendarDays size={15} />

                        <span>
                          {formatDate(
                            order.order_date
                          )}
                        </span>

                      </div>

                    </td>

                    {/* TOTAL */}

                    <td>

                      <span className="order-total">
                        {formatMoney(
                          order.total_amount
                        )}
                      </span>

                    </td>

                    {/* PAYMENT */}

                    <td>

                      <span
                        className={`payment-status ${getPaymentClass(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status
                          ?.replace("_", " ")
                          .replace(/\b\w/g, (char) =>
                            char.toUpperCase()
                          )}
                      </span>

                    </td>

                    {/* ORDER STATUS */}

                    <td>

                      <span
                        className={`order-status ${getOrderStatusClass(
                          order.order_status
                        )}`}
                      >
                        {order.order_status
                          ?.replace("_", " ")
                          .replace(/\b\w/g, (char) =>
                            char.toUpperCase()
                          )}
                      </span>

                    </td>

                    {/* ACTION */}

                    <td>

                      <button
                        className="view-order-btn"
                        onClick={() =>
                          openOrder(order.order_id)
                        }
                      >
                        <Eye size={16} />
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* =========================================
          ORDER DETAILS MODAL
      ========================================= */}

      {showModal && selectedOrder && (

        <div
          className="order-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="order-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="order-modal-header">

              <div>

                <h2>
                  Order #{selectedOrder.order_id}
                </h2>

                <p>
                  {formatDate(
                    selectedOrder.order_date
                  )}
                </p>

              </div>

              <button
                className="order-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>

            </div>

            {/* ORDER DETAILS */}

            <div className="order-modal-content">

              {/* CUSTOMER */}

              <div className="order-detail-section">

                <div className="order-section-title">
                  <User size={17} />
                  Customer
                </div>

                <div className="order-customer-detail">

                  <strong>
                    {getCustomerName(
                      selectedOrder
                    )}
                  </strong>

                  <span>
                    {selectedOrder.email ||
                      "No email"}
                  </span>

                  {selectedOrder.phone && (
                    <span>
                      {selectedOrder.phone}
                    </span>
                  )}

                </div>

              </div>

              {/* PAYMENT */}

              <div className="order-detail-section">

                <div className="order-section-title">
                  <CreditCard size={17} />
                  Payment
                </div>

                <div className="order-status-row">

                  <span>
                    Payment Status
                  </span>

                  <span
                    className={`payment-status ${getPaymentClass(
                      selectedOrder.payment_status
                    )}`}
                  >
                    {selectedOrder.payment_status
                      ?.replace("_", " ")
                      .replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )}
                  </span>

                </div>

              </div>

              {/* ORDER STATUS */}

              <div className="order-detail-section">

                <div className="order-section-title">
                  <Truck size={17} />
                  Order Status
                </div>

                <select
                  value={
                    selectedOrder.order_status
                  }
                  onChange={(e) =>
                    updateOrderStatus(
                      e.target.value
                    )
                  }
                  disabled={updating}
                  className="order-status-select"
                >

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

              </div>

              {/* SHIPPING ADDRESS */}

              <div className="order-detail-section">

                <div className="order-section-title">
                  <MapPin size={17} />
                  Shipping Address
                </div>

                <div className="address-box">
                  {selectedOrder.shipping_address ||
                    "No shipping address available"}
                </div>

              </div>

              {/* BILLING ADDRESS */}

              <div className="order-detail-section">

                <div className="order-section-title">
                  <MapPin size={17} />
                  Billing Address
                </div>

                <div className="address-box">
                  {selectedOrder.billing_address ||
                    "No billing address available"}
                </div>

              </div>

              {/* PRICE SUMMARY */}

              <div className="order-summary">

                <h3>Order Summary</h3>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>
                    {formatMoney(
                      selectedOrder.subtotal
                    )}
                  </span>
                </div>

                <div className="summary-row">
                  <span>Discount</span>
                  <span>
                    -{" "}
                    {formatMoney(
                      selectedOrder.discount
                    )}
                  </span>
                </div>

                <div className="summary-row">
                  <span>Shipping Fee</span>
                  <span>
                    {formatMoney(
                      selectedOrder.shipping_fee
                    )}
                  </span>
                </div>

                <div className="summary-total">
                  <span>Total</span>
                  <strong>
                    {formatMoney(
                      selectedOrder.total_amount
                    )}
                  </strong>
                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="order-modal-footer">

              <button
                className="order-close-btn"
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