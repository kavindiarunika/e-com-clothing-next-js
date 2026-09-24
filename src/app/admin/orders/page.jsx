"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  X,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  CalendarDays,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [orderStatusFilter, setOrderStatusFilter] =
    useState("all");

  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/orders"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch orders."
        );
      }

      const data = await response.json();

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Fetch orders error:",
        error
      );

      alert("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // OPEN ORDER
  // ==========================================

  const openOrder = async (orderId) => {
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch order details."
        );
      }

      const data = await response.json();

      setSelectedOrder(data);
    } catch (error) {
      console.error(
        "Order details error:",
        error
      );

      alert("Failed to load order details.");
    }
  };

  // ==========================================
  // CLOSE ORDER
  // ==========================================

  const closeOrder = () => {
    setSelectedOrder(null);
  };

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================

  const updateOrderStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      setSaving(true);

      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            order_status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update order status."
        );
      }

      await fetchOrders();

      await openOrder(orderId);
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // UPDATE PAYMENT STATUS
  // ==========================================

  const updatePaymentStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      setSaving(true);

      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            payment_status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update payment status."
        );
      }

      await fetchOrders();

      await openOrder(orderId);
    } catch (error) {
      console.error(
        "Update payment status error:",
        error
      );

      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // FILTER ORDERS
  // ==========================================

  const filteredOrders = orders.filter(
    (order) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        String(order.order_id)
          .toLowerCase()
          .includes(searchText) ||
        String(
          order.customer_name || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          order.customer_email || ""
        )
          .toLowerCase()
          .includes(searchText);

      const matchesOrderStatus =
        orderStatusFilter === "all" ||
        order.order_status ===
          orderStatusFilter;

      const matchesPaymentStatus =
        paymentStatusFilter === "all" ||
        order.payment_status ===
          paymentStatusFilter;

      return (
        matchesSearch &&
        matchesOrderStatus &&
        matchesPaymentStatus
      );
    }
  );

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getOrderStatusClass = (status) => {
    return `order-status ${status}`;
  };

  const getPaymentStatusClass = (status) => {
    return `payment-status ${status}`;
  };

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

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "en-LK",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div className="admin-orders">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="orders-header">
        <div>
          <h1>Orders</h1>

          <p>
            Manage customer orders, payments and
            deliveries.
          </p>
        </div>
      </div>

      {/* =====================================
          FILTER BAR
      ====================================== */}

      <div className="orders-toolbar">

        <div className="orders-search">
          <Search size={18} />

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
          className="orders-filter"
          value={orderStatusFilter}
          onChange={(e) =>
            setOrderStatusFilter(
              e.target.value
            )
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
          className="orders-filter"
          value={paymentStatusFilter}
          onChange={(e) =>
            setPaymentStatusFilter(
              e.target.value
            )
          }
        >
          <option value="all">
            All Payments
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
      </div>

      {/* =====================================
          ORDERS TABLE
      ====================================== */}

      <div className="orders-table-card">
        <div className="orders-table-wrapper">

          <table className="orders-table">

            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="orders-empty"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="orders-empty"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(
                  (order) => (
                    <tr
                      key={order.order_id}
                    >

                      {/* ORDER */}

                      <td>
                        <div className="order-number">
                          #
                          {String(
                            order.order_id
                          ).padStart(
                            5,
                            "0"
                          )}
                        </div>
                      </td>

                      {/* CUSTOMER */}

                      <td>
                        <div className="order-customer">
                          <strong>
                            {order.customer_name ||
                              "Guest Customer"}
                          </strong>

                          <span>
                            {order.customer_email ||
                              "No email"}
                          </span>
                        </div>
                      </td>

                      {/* DATE */}

                      <td>
                        <div className="order-date">
                          <CalendarDays
                            size={14}
                          />

                          {formatDate(
                            order.order_date
                          )}
                        </div>
                      </td>

                      {/* ITEMS */}

                      <td>
                        <span className="order-items-count">
                          {order.item_count ||
                            0}{" "}
                          item
                          {Number(
                            order.item_count
                          ) !== 1
                            ? "s"
                            : ""}
                        </span>
                      </td>

                      {/* TOTAL */}

                      <td>
                        <strong className="order-total">
                          {formatMoney(
                            order.total_amount
                          )}
                        </strong>
                      </td>

                      {/* PAYMENT */}

                      <td>
                        <span
                          className={getPaymentStatusClass(
                            order.payment_status
                          )}
                        >
                          {order.payment_status}
                        </span>
                      </td>

                      {/* ORDER STATUS */}

                      <td>
                        <span
                          className={getOrderStatusClass(
                            order.order_status
                          )}
                        >
                          {order.order_status}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td>
                        <button
                          className="order-view-btn"
                          onClick={() =>
                            openOrder(
                              order.order_id
                            )
                          }
                        >
                          <Eye size={16} />

                          View
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}

            </tbody>

          </table>
        </div>
      </div>

      {/* =====================================
          ORDER DETAILS MODAL
      ====================================== */}

      {selectedOrder && (
        <div className="order-modal-overlay">

          <div className="order-modal">

            {/* MODAL HEADER */}

            <div className="order-modal-header">

              <div>
                <h2>
                  Order #
                  {String(
                    selectedOrder.order_id
                  ).padStart(5, "0")}
                </h2>

                <p>
                  {formatDate(
                    selectedOrder.order_date
                  )}
                </p>
              </div>

              <button
                className="order-modal-close"
                onClick={closeOrder}
              >
                <X size={20} />
              </button>

            </div>

            {/* ORDER STATUS CONTROLS */}

            <div className="order-status-controls">

              <div>
                <label>
                  Order Status
                </label>

                <select
                  value={
                    selectedOrder.order_status
                  }
                  disabled={saving}
                  onChange={(e) =>
                    updateOrderStatus(
                      selectedOrder.order_id,
                      e.target.value
                    )
                  }
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

              <div>
                <label>
                  Payment Status
                </label>

                <select
                  value={
                    selectedOrder.payment_status
                  }
                  disabled={saving}
                  onChange={(e) =>
                    updatePaymentStatus(
                      selectedOrder.order_id,
                      e.target.value
                    )
                  }
                >
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
              </div>

            </div>

            {/* CUSTOMER + ADDRESS */}

            <div className="order-info-grid">

              {/* CUSTOMER */}

              <div className="order-info-card">

                <div className="order-info-title">
                  <User size={18} />

                  <h3>Customer</h3>
                </div>

                <p>
                  <strong>
                    {selectedOrder.customer_name ||
                      "Guest Customer"}
                  </strong>
                </p>

                <p>
                  {selectedOrder.customer_email ||
                    "No email"}
                </p>

                {selectedOrder.customer_phone && (
                  <p>
                    {
                      selectedOrder.customer_phone
                    }
                  </p>
                )}

              </div>

              {/* SHIPPING */}

              <div className="order-info-card">

                <div className="order-info-title">
                  <Truck size={18} />

                  <h3>
                    Shipping Address
                  </h3>
                </div>

                <p className="order-address">
                  {selectedOrder.shipping_address ||
                    "No shipping address"}
                </p>

              </div>

              {/* BILLING */}

              <div className="order-info-card">

                <div className="order-info-title">
                  <MapPin size={18} />

                  <h3>
                    Billing Address
                  </h3>
                </div>

                <p className="order-address">
                  {selectedOrder.billing_address ||
                    "No billing address"}
                </p>

              </div>

              {/* PAYMENT */}

              <div className="order-info-card">

                <div className="order-info-title">
                  <CreditCard size={18} />

                  <h3>Payment</h3>
                </div>

                <p>
                  Status:{" "}
                  <strong>
                    {
                      selectedOrder.payment_status
                    }
                  </strong>
                </p>

              </div>

            </div>

            {/* ORDER ITEMS */}

            <div className="order-items-section">

              <div className="order-section-title">

                <Package size={18} />

                <h3>
                  Order Items
                </h3>

              </div>

              <div className="order-items-table-wrapper">

                <table className="order-items-table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Discount</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>

                    {selectedOrder.items?.map(
                      (item) => (
                        <tr
                          key={
                            item.order_item_id
                          }
                        >

                          <td>
                            <div className="order-item-product">

                              {item.main_image ? (
                                <img
                                  src={
                                    item.main_image
                                  }
                                  alt={
                                    item.product_title
                                  }
                                />
                              ) : (
                                <div className="order-item-image-placeholder">
                                  <Package
                                    size={18}
                                  />
                                </div>
                              )}

                              <div>
                                <strong>
                                  {
                                    item.product_title
                                  }
                                </strong>

                                {item.sku && (
                                  <span>
                                    SKU:{" "}
                                    {item.sku}
                                  </span>
                                )}
                              </div>

                            </div>
                          </td>

                          <td>
                            {item.qty}
                          </td>

                          <td>
                            {formatMoney(
                              item.unit_price
                            )}
                          </td>

                          <td>
                            {formatMoney(
                              item.discount
                            )}
                          </td>

                          <td>
                            <strong>
                              {formatMoney(
                                item.total_price
                              )}
                            </strong>
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* ORDER SUMMARY */}

            <div className="order-summary">

              <div className="order-summary-row">
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatMoney(
                    selectedOrder.subtotal
                  )}
                </strong>
              </div>

              <div className="order-summary-row">
                <span>
                  Discount
                </span>

                <strong>
                  -
                  {formatMoney(
                    selectedOrder.discount
                  )}
                </strong>
              </div>

              <div className="order-summary-row">
                <span>
                  Shipping Fee
                </span>

                <strong>
                  {formatMoney(
                    selectedOrder.shipping_fee
                  )}
                </strong>
              </div>

              <div className="order-summary-row order-grand-total">
                <span>
                  Total
                </span>

                <strong>
                  {formatMoney(
                    selectedOrder.total_amount
                  )}
                </strong>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}