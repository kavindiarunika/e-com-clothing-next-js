"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Search,
  RefreshCw,
  Eye,
  Plus,
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [showTransactionModal, setShowTransactionModal] =
    useState(false);

  const [selectedInventory, setSelectedInventory] =
    useState(null);

  const [transactions, setTransactions] = useState([]);

  const [transactionForm, setTransactionForm] = useState({
    transaction_type: "adjustment",
    quantity: "",
    reference_id: "",
    note: "",
  });

  // ==========================================
  // LOAD INVENTORY
  // ==========================================

  const loadInventory = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/inventory");

      const data = await response.json();

      if (data.success) {
        setInventory(data.inventory || []);
      } else {
        alert(data.message || "Failed to load inventory");
      }
    } catch (error) {
      console.error("Inventory loading error:", error);
      alert("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // ==========================================
  // GET STOCK STATUS
  // ==========================================

  const getStockStatus = (item) => {
    const available = Number(item.available_quantity || 0);

    if (available <= 0) {
      return {
        label: "Out of Stock",
        className: "inventory-status-out",
      };
    }

    if (available <= 5) {
      return {
        label: "Low Stock",
        className: "inventory-status-low",
      };
    }

    return {
      label: "In Stock",
      className: "inventory-status-active",
    };
  };

  // ==========================================
  // FILTER INVENTORY
  // ==========================================

  const filteredInventory = inventory.filter((item) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      String(item.inventory_id || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(item.variant_id || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(item.product_title || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(item.sku || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(item.size_name || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(item.color_name || "")
        .toLowerCase()
        .includes(searchValue);

    const stockStatus = getStockStatus(item);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "in_stock" &&
        stockStatus.label === "In Stock") ||
      (statusFilter === "low_stock" &&
        stockStatus.label === "Low Stock") ||
      (statusFilter === "out_of_stock" &&
        stockStatus.label === "Out of Stock");

    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // VIEW TRANSACTIONS
  // ==========================================

  const viewTransactions = async (item) => {
    try {
      setSelectedInventory(item);

      const response = await fetch(
        `/api/admin/inventory/${item.variant_id}/transactions`
      );

      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);
        setShowTransactionModal(true);
      } else {
        alert(
          data.message || "Failed to load transactions"
        );
      }
    } catch (error) {
      console.error(
        "Transaction loading error:",
        error
      );

      alert("Failed to load transactions");
    }
  };

  // ==========================================
  // ADD INVENTORY TRANSACTION
  // ==========================================

  const handleTransactionSubmit = async (event) => {
    event.preventDefault();

    if (!selectedInventory) {
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/inventory/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            variant_id: selectedInventory.variant_id,
            transaction_type:
              transactionForm.transaction_type,
            quantity: Number(transactionForm.quantity),
            reference_id:
              transactionForm.reference_id
                ? Number(transactionForm.reference_id)
                : null,
            note: transactionForm.note,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setTransactionForm({
          transaction_type: "adjustment",
          quantity: "",
          reference_id: "",
          note: "",
        });

        await loadInventory();

        await viewTransactions(selectedInventory);
      } else {
        alert(
          data.message ||
            "Failed to add inventory transaction"
        );
      }
    } catch (error) {
      console.error(
        "Transaction error:",
        error
      );

      alert("Failed to add transaction");
    }
  };

  // ==========================================
  // SUMMARY
  // ==========================================

  const totalItems = inventory.length;

  const totalQuantity = inventory.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const totalReserved = inventory.reduce(
    (sum, item) =>
      sum + Number(item.reserved_quantity || 0),
    0
  );

  const totalAvailable = inventory.reduce(
    (sum, item) =>
      sum + Number(item.available_quantity || 0),
    0
  );

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="admin-inventory-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="inventory-page-header">

        <div>
          <h1>Inventory</h1>

          <p>
            Manage product stock and inventory
            transactions.
          </p>
        </div>

        <button
          className="inventory-refresh-btn"
          onClick={loadInventory}
          disabled={loading}
        >
          <RefreshCw size={17} />

          Refresh
        </button>

      </div>

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div className="inventory-summary">

        <div className="inventory-summary-card">

          <div className="inventory-summary-icon">
            <Package size={20} />
          </div>

          <div>
            <span>Total Variants</span>

            <strong>{totalItems}</strong>
          </div>

        </div>

        <div className="inventory-summary-card">

          <div className="inventory-summary-icon">
            <ArrowDownToLine size={20} />
          </div>

          <div>
            <span>Total Quantity</span>

            <strong>{totalQuantity}</strong>
          </div>

        </div>

        <div className="inventory-summary-card">

          <div className="inventory-summary-icon">
            <ArrowUpFromLine size={20} />
          </div>

          <div>
            <span>Reserved</span>

            <strong>{totalReserved}</strong>
          </div>

        </div>

        <div className="inventory-summary-card">

          <div className="inventory-summary-icon">
            <Package size={20} />
          </div>

          <div>
            <span>Available</span>

            <strong>{totalAvailable}</strong>
          </div>

        </div>

      </div>

      {/* ======================================
          FILTERS
      ====================================== */}

      <div className="inventory-filters">

        <div className="inventory-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search product, SKU, variant..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="inventory-select"
        >
          <option value="all">
            All Stock
          </option>

          <option value="in_stock">
            In Stock
          </option>

          <option value="low_stock">
            Low Stock
          </option>

          <option value="out_of_stock">
            Out of Stock
          </option>
        </select>

      </div>

      {/* ======================================
          TABLE
      ====================================== */}

      <div className="inventory-table-card">

        <div className="inventory-table-wrapper">

          <table className="inventory-table">

            <thead>
              <tr>

                <th>Inventory</th>

                <th>Product / Variant</th>

                <th>SKU</th>

                <th>Quantity</th>

                <th>Reserved</th>

                <th>Available</th>

                <th>Status</th>

                <th>Updated</th>

                <th>Actions</th>

              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="inventory-empty"
                  >
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="inventory-empty"
                  >
                    No inventory found.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {

                  const stockStatus =
                    getStockStatus(item);

                  return (
                    <tr
                      key={item.inventory_id}
                    >

                      {/* INVENTORY */}

                      <td>

                        <div className="inventory-id">
                          #{item.inventory_id}
                        </div>

                        <small>
                          Variant #{item.variant_id}
                        </small>

                      </td>

                      {/* PRODUCT */}

                      <td>

                        <div className="inventory-product">

                          <div className="inventory-product-icon">
                            <Package size={18} />
                          </div>

                          <div>

                            <strong>
                              {item.product_title ||
                                "Product"}
                            </strong>

                            <span>
                              {item.size_name ||
                                "No Size"}

                              {" · "}

                              {item.color_name ||
                                "No Color"}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* SKU */}

                      <td>
                        {item.sku || "-"}
                      </td>

                      {/* QUANTITY */}

                      <td>
                        <strong>
                          {Number(
                            item.quantity || 0
                          )}
                        </strong>
                      </td>

                      {/* RESERVED */}

                      <td>
                        {Number(
                          item.reserved_quantity || 0
                        )}
                      </td>

                      {/* AVAILABLE */}

                      <td>

                        <strong
                          className={
                            Number(
                              item.available_quantity ||
                                0
                            ) <= 0
                              ? "inventory-danger-number"
                              : ""
                          }
                        >
                          {Number(
                            item.available_quantity ||
                              0
                          )}
                        </strong>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`inventory-status ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>

                      </td>

                      {/* DATE */}

                      <td>
                        {formatDate(
                          item.updated_at
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="inventory-actions">

                          <button
                            className="inventory-action-btn"
                            title="View Transactions"
                            onClick={() =>
                              viewTransactions(item)
                            }
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            className="inventory-action-btn"
                            title="Add Transaction"
                            onClick={() => {
                              setSelectedInventory(
                                item
                              );

                              setTransactions([]);

                              setShowTransactionModal(
                                true
                              );
                            }}
                          >
                            <Plus size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ======================================
          TRANSACTION MODAL
      ====================================== */}

      {showTransactionModal &&
        selectedInventory && (
          <div className="inventory-modal-overlay">

            <div className="inventory-modal">

              <div className="inventory-modal-header">

                <div>

                  <h2>Inventory Transaction</h2>

                  <p>
                    {selectedInventory.product_title ||
                      "Product"}

                    {" · Variant #"}

                    {selectedInventory.variant_id}
                  </p>

                </div>

                <button
                  className="inventory-modal-close"
                  onClick={() =>
                    setShowTransactionModal(false)
                  }
                >
                  <X size={20} />
                </button>

              </div>

              {/* CURRENT STOCK */}

              <div className="inventory-current-stock">

                <div>
                  <span>Quantity</span>
                  <strong>
                    {selectedInventory.quantity}
                  </strong>
                </div>

                <div>
                  <span>Reserved</span>
                  <strong>
                    {
                      selectedInventory.reserved_quantity
                    }
                  </strong>
                </div>

                <div>
                  <span>Available</span>
                  <strong>
                    {
                      selectedInventory.available_quantity
                    }
                  </strong>
                </div>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleTransactionSubmit}
                className="inventory-transaction-form"
              >

                <div className="inventory-form-group">

                  <label>
                    Transaction Type
                  </label>

                  <select
                    value={
                      transactionForm.transaction_type
                    }
                    onChange={(event) =>
                      setTransactionForm({
                        ...transactionForm,
                        transaction_type:
                          event.target.value,
                      })
                    }
                  >
                    <option value="purchase">
                      Purchase
                    </option>

                    <option value="sale">
                      Sale
                    </option>

                    <option value="return">
                      Return
                    </option>

                    <option value="adjustment">
                      Adjustment
                    </option>
                  </select>

                </div>

                <div className="inventory-form-group">

                  <label>
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    required
                    value={
                      transactionForm.quantity
                    }
                    onChange={(event) =>
                      setTransactionForm({
                        ...transactionForm,
                        quantity:
                          event.target.value,
                      })
                    }
                    placeholder="Enter quantity"
                  />

                </div>

                <div className="inventory-form-group">

                  <label>
                    Reference ID
                  </label>

                  <input
                    type="number"
                    value={
                      transactionForm.reference_id
                    }
                    onChange={(event) =>
                      setTransactionForm({
                        ...transactionForm,
                        reference_id:
                          event.target.value,
                      })
                    }
                    placeholder="Optional"
                  />

                </div>

                <div className="inventory-form-group">

                  <label>
                    Note
                  </label>

                  <textarea
                    rows="3"
                    value={
                      transactionForm.note
                    }
                    onChange={(event) =>
                      setTransactionForm({
                        ...transactionForm,
                        note: event.target.value,
                      })
                    }
                    placeholder="Add a note..."
                  />

                </div>

                <div className="inventory-form-actions">

                  <button
                    type="button"
                    className="inventory-cancel-btn"
                    onClick={() =>
                      setShowTransactionModal(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="inventory-submit-btn"
                  >
                    Add Transaction
                  </button>

                </div>

              </form>

              {/* TRANSACTION HISTORY */}

              {transactions.length > 0 && (
                <div className="inventory-history">

                  <h3>
                    Transaction History
                  </h3>

                  <div className="inventory-history-list">

                    {transactions.map(
                      (transaction) => (
                        <div
                          className="inventory-history-item"
                          key={
                            transaction.transaction_id
                          }
                        >

                          <div>

                            <strong>
                              {
                                transaction.transaction_type
                              }
                            </strong>

                            <span>
                              {transaction.note ||
                                "No note"}
                            </span>

                          </div>

                          <div>

                            <strong>
                              {transaction.quantity}
                            </strong>

                            <span>
                              {formatDate(
                                transaction.created_at
                              )}
                            </span>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

          </div>
        )}

    </div>
  );
}