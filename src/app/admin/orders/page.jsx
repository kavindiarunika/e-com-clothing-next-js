"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Search,
  Eye,
  X,
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
    const response = await fetch("/api/admin/orders");
    if (!response.ok) {
      throw new Error("Failed to fetch orders.");
    }

    return response.json();
  };

  useEffect(() => {
    let isMounted = true;
    const refreshOrders = () => {
      fetchOrders()
        .then((data) => {
          if (isMounted) setOrders(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          if (!isMounted) return;
          console.error("Fetch orders error:", error);
          alert("Failed to load orders.");
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    refreshOrders();

    const socket = io({ autoConnect: false, withCredentials: true });
    socket.on("orders:created", refreshOrders);
    socket.on("orders:updated", refreshOrders);
    socket.connect();

    return () => {
      isMounted = false;
      socket.disconnect();
    };
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
    <main className="admin-page orders-page">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="admin-page-header">
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
                    colSpan="7"
                    className="orders-empty"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="7"
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
                          <span className="order-items-count">
                            {order.item_count || 0} item
                            {Number(order.item_count) !== 1 ? "s" : ""}
                          </span>
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

            <section className="order-modal-customer">
              <h3>Customer Details</h3>
              <dl>
                <div>
                  <dt>Name</dt>
                  <dd>{selectedOrder.customer_name || "Guest Customer"}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{selectedOrder.customer_email || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{selectedOrder.customer_phone || "Not provided"}</dd>
                </div>
              </dl>
            </section>

          </div>

        </div>
      )}

    </main>
  );
}