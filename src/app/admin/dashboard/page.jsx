
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Package,
  ShoppingBag,
  Users,
  Banknote,
  AlertTriangle,
  ArrowUpRight,
  Tag,
  Search,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [soldProducts, setSoldProducts] = useState([]);
  const [soldProductsPeriod, setSoldProductsPeriod] = useState("today");
  const [soldProductsLoading, setSoldProductsLoading] = useState(true);
  const [soldProductsError, setSoldProductsError] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productStatus, setProductStatus] = useState("all");
  const [productCategory, setProductCategory] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // LOAD DASHBOARD
  // ============================================

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        // ============================================
        // CHECK ADMIN SESSION
        // ============================================

        const sessionResponse = await fetch("/api/admin/me", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!sessionResponse.ok) {
          router.replace("/admin/login");
          return;
        }

        // ============================================
        // LOAD DASHBOARD, PRODUCTS AND OFFERS
        // ============================================

        const [
          dashboardResponse,
          productsResponse,
          offersResponse,
        ] = await Promise.all([
          fetch("/api/admin/dashboard", {
            cache: "no-store",
          }),

          fetch("/api/admin/products", {
            cache: "no-store",
          }),

          fetch("/api/admin/offers", {
            cache: "no-store",
          }),
        ]);

        // ============================================
        // CHECK RESPONSES
        // ============================================

        if (!dashboardResponse.ok) {
          throw new Error(
            "Failed to load dashboard data."
          );
        }

        if (!productsResponse.ok) {
          throw new Error(
            "Failed to load products."
          );
        }

        if (!offersResponse.ok) {
          throw new Error(
            "Failed to load offers."
          );
        }

        // ============================================
        // CONVERT RESPONSES TO JSON
        // ============================================

        const dashboardResult =
          await dashboardResponse.json();

        const productsResult =
          await productsResponse.json();

        const offersResult =
          await offersResponse.json();

        // ============================================
        // DASHBOARD DATA
        // ============================================

        if (dashboardResult.success) {
          setData(dashboardResult.data);
        } else {
          throw new Error(
            dashboardResult.message ||
              "Failed to load dashboard."
          );
        }

        // ============================================
        // PRODUCTS
        // ============================================

        setProducts(
          Array.isArray(productsResult.products)
            ? productsResult.products
            : Array.isArray(productsResult.data)
              ? productsResult.data
              : []
        );

        // ============================================
        // OFFERS
        // ============================================

        if (offersResult.success) {
          setOffers(
            Array.isArray(offersResult.offers)
              ? offersResult.offers.slice(0, 5)
              : []
          );
        }
      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        );

        setError(
          err.message ||
            "Something went wrong while loading dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSoldProducts() {
      try {
        setSoldProductsLoading(true);
        setSoldProductsError("");

        const response = await fetch(
          `/api/admin/dashboard/sold-products?period=${encodeURIComponent(soldProductsPeriod)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load sold products.");
        }

        setSoldProducts(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Sold products loading error:", error);
          setSoldProductsError(
            error.message || "Failed to load sold products."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setSoldProductsLoading(false);
        }
      }
    }

    void loadSoldProducts();

    return () => controller.abort();
  }, [soldProductsPeriod]);

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-dashboard-state">
          <div className="dashboard-loader"></div>

          <p>
            Reading store data...
          </p>
        </div>
      </main>
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (error) {
    return (
      <main className="admin-page">
        <div className="admin-dashboard-error">
          {error}
        </div>
      </main>
    );
  }

  // ============================================
  // SAFETY VALUES
  // ============================================

  const stats = data?.stats || {};
  const productCategories = Array.from(
    new Map(
      products
        .filter((product) => product.category_name || product.category)
        .map((product) => {
          const name = product.category_name || product.category;
          const value = product.category_id ?? name;
          return [String(value), name];
        })
    )
  );
  const searchText = productSearch.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const categoryName = product.category_name || product.category || "";
    const matchesSearch = [
      product.title,
      product.name,
      product.sku,
      categoryName,
      product.status,
    ].some((value) => String(value || "").toLowerCase().includes(searchText));
    const matchesStatus =
      productStatus === "all" ||
      String(product.status || "active").toLowerCase() === productStatus;
    const categoryValue = String(
      product.category_id ?? categoryName
    );
    const matchesCategory =
      productCategory === "all" || categoryValue === productCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });
  const hasProductFilters = Boolean(
    searchText || productStatus !== "all" || productCategory !== "all"
  );
  const visibleProducts = hasProductFilters
    ? filteredProducts
    : filteredProducts.slice(0, 5);

  // ============================================
  // DASHBOARD
  // ============================================

  return (
    <main className="admin-page">

      {/* ============================================
          PAGE HEADER
      ============================================ */}

      <div className="page-header dashboard-heading">

        <div>
          <h1>
            Dashboard
          </h1>

          <p className="muted">
            A clear view of your store performance.
          </p>
        </div>

        <Link
          href="/admin/reports/sales"
          className="dashboard-action"
        >
          View reports

          <ArrowUpRight size={16} />
        </Link>

      </div>

      <section className="admin-card dashboard-panel">
        <div className="card-header">
          <div>
            <p className="panel-kicker">SALES</p>
            <h2>Products sold</h2>
          </div>

          <div className="dashboard-sold-products-header">
            <label className="dashboard-sold-products-filter">
              <span>Period</span>
              <select
                value={soldProductsPeriod}
                onChange={(event) => setSoldProductsPeriod(event.target.value)}
                aria-label="Filter products sold by period"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="twoMonths">Last 60 days</option>
              </select>
            </label>
            <span className="panel-period">
              {soldProducts.length} products
            </span>
          </div>
        </div>

        <div className="dashboard-table-wrapper">
          <table className="dashboard-table dashboard-sold-products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Quantity sold</th>
              </tr>
            </thead>
            <tbody>
              {soldProductsLoading ? (
                <tr>
                  <td colSpan={4} className="dashboard-table-empty">
                    Loading sold products...
                  </td>
                </tr>
              ) : soldProductsError ? (
                <tr>
                  <td colSpan={4} className="dashboard-table-empty">
                    {soldProductsError}
                  </td>
                </tr>
              ) : soldProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="dashboard-table-empty">
                    No paid sales found for this period.
                  </td>
                </tr>
              ) : (
                soldProducts.map((product) => (
                  <tr key={product.item_id}>
                    <td>
                      <strong>{product.title}</strong>
                    </td>
                    <td>{product.sku || "-"}</td>
                    <td>{product.category_name || "-"}</td>
                    <td>{Number(product.quantity_sold).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================
          STAT CARDS
      ============================================ */}

      <div className="stats-grid">

        {/* TOTAL REVENUE */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon">
            <Banknote size={21} />
          </div>

          <div className="dashboard-stat-content">

            <span>
              Total Revenue
            </span>

            <strong>
              Rs.{" "}
              {Number(
                stats.revenue || 0
              ).toLocaleString()}
            </strong>

          </div>

        </div>


        {/* TOTAL ORDERS */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon">
            <ShoppingBag size={21} />
          </div>

          <div className="dashboard-stat-content">

            <span>
              Total Orders
            </span>

            <strong>
              {Number(
                stats.orders || 0
              ).toLocaleString()}
            </strong>

          </div>

        </div>


        {/* CUSTOMERS */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon">
            <Users size={21} />
          </div>

          <div className="dashboard-stat-content">

            <span>
              Customers
            </span>

            <strong>
              {Number(
                stats.customers || 0
              ).toLocaleString()}
            </strong>

          </div>

        </div>


        {/* PRODUCTS */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon">
            <Package size={21} />
          </div>

          <div className="dashboard-stat-content">

            <span>
              Products
            </span>

            <strong>
              {Number(
                stats.products || 0
              ).toLocaleString()}
            </strong>

          </div>

        </div>


        {/* LOW STOCK */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon dashboard-warning-icon">
            <AlertTriangle size={21} />
          </div>

          <div className="dashboard-stat-content">

            <span>
              Low Stock
            </span>

            <strong>
              {Number(
                stats.lowStock || 0
              ).toLocaleString()}
            </strong>

          </div>

        </div>

      </div>


      {/* ============================================
          RECENT OFFERS
      ============================================ */}

      <section
        className="admin-card dashboard-panel"
        style={{
          marginBottom: "20px",
        }}
      >

        <div className="card-header">

          <div>

            <p className="panel-kicker">
              MARKETING
            </p>

            <h2>
              Recent offers
            </h2>

          </div>


          <div className="dashboard-panel-right">

            <span className="panel-period">
              {offers.length} entries
            </span>

            <Link href="/admin/offers">
              Manage offers
            </Link>

          </div>

        </div>


        <div className="dashboard-table-wrapper">

          <table className="dashboard-table">

            <thead>

              <tr>

                <th>
                  Offer
                </th>

                <th>
                  Code
                </th>

                <th>
                  Discount
                </th>

                <th>
                  Start Date
                </th>

                <th>
                  End Date
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {offers.map((offer) => (

                <tr
                  key={
                    offer.offer_id ||
                    offer.id ||
                    offer.coupon_id
                  }
                >

                  {/* OFFER */}

                  <td>

                    <div className="dashboard-product-name">

                      <div className="product-mark">
                        <Tag size={17} />
                      </div>

                      <strong>
                        {offer.name ||
                          offer.title ||
                          offer.offer_name ||
                          "Unnamed Offer"}
                      </strong>

                    </div>

                  </td>


                  {/* CODE */}

                  <td>
                    {offer.code ||
                      offer.coupon_code ||
                      "-"}
                  </td>


                  {/* DISCOUNT */}

                  <td className="dashboard-table-price">

                    {offer.discount_type ===
                    "percentage" ||
                    offer.discount_type ===
                    "percent"
                      ? `${offer.discount || 0}%`
                      : `Rs. ${Number(
                          offer.discount || 0
                        ).toLocaleString()}`}

                  </td>


                  {/* START DATE */}

                  <td>

                    {offer.start_date
                      ? new Date(
                          offer.start_date
                        ).toLocaleDateString()
                      : "-"}

                  </td>


                  {/* END DATE */}

                  <td>

                    {offer.end_date
                      ? new Date(
                          offer.end_date
                        ).toLocaleDateString()
                      : "-"}

                  </td>


                  {/* STATUS */}

                  <td>

                    <span
                      className={`dashboard-status status-${String(
                        offer.status ||
                          "active"
                      ).toLowerCase()}`}
                    >

                      {offer.status ||
                        "Active"}

                    </span>

                  </td>

                </tr>

              ))}


              {/* EMPTY */}

              {offers.length === 0 && (

                <tr>

                  <td
                    colSpan={6}
                    className="dashboard-table-empty"
                  >
                    No offers found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* ============================================
          RECENT PRODUCTS
      ============================================ */}

      <section className="admin-card dashboard-panel">

        <div className="card-header">

          <div>

            <p className="panel-kicker">
              CATALOG
            </p>

            <h2>
              Recent products
            </h2>

          </div>


          <div className="dashboard-panel-right">

            <span className="panel-period">
              {visibleProducts.length} of {products.length} products
            </span>

            <Link href="/admin/products">
              Manage products
            </Link>

          </div>

        </div>


        <div className="dashboard-product-filters">
          <label className="dashboard-product-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search products..."
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              aria-label="Search products"
            />
          </label>

          <select
            value={productStatus}
            onChange={(event) => setProductStatus(event.target.value)}
            aria-label="Filter products by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of stock</option>
          </select>

          <select
            value={productCategory}
            onChange={(event) => setProductCategory(event.target.value)}
            aria-label="Filter products by category"
          >
            <option value="all">All categories</option>
            {productCategories.map(([value, name]) => (
              <option key={value} value={value}>{name}</option>
            ))}
          </select>
        </div>

        <div className="dashboard-table-wrapper">

          <table className="dashboard-table">

            <thead>

              <tr>

                <th>
                  Product
                </th>

                <th>
                  SKU
                </th>

                <th>
                  Category
                </th>

                <th>
                  Price
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {visibleProducts.map((product) => (

                <tr
                  key={
                    product.product_id ||
                    product.item_id ||
                    product.id
                  }
                >

                  {/* PRODUCT */}

                  <td>

                    <div className="dashboard-product-name">

                      <div className="product-mark">
                        <Package size={17} />
                      </div>

                      <strong>
                        {product.name ||
                          product.title ||
                          "Unnamed Product"}
                      </strong>

                    </div>

                  </td>


                  {/* SKU */}

                  <td>
                    {product.sku || "-"}
                  </td>


                  {/* CATEGORY */}

                  <td>
                    {product.category_name ||
                      product.category ||
                      "-"}
                  </td>


                  {/* PRICE */}

                  <td className="dashboard-table-price">

                    Rs.{" "}

                    {Number(
                      product.price || 0
                    ).toLocaleString()}

                  </td>


                  {/* STATUS */}

                  <td>

                    <span
                      className={`dashboard-status status-${String(
                        product.status ||
                          "active"
                      ).toLowerCase()}`}
                    >

                      {product.status ||
                        "Active"}

                    </span>

                  </td>

                </tr>

              ))}


              {/* EMPTY */}

              {visibleProducts.length === 0 && (

                <tr>

                  <td
                    colSpan={5}
                    className="dashboard-table-empty"
                  >
                    {products.length === 0
                      ? "No products found."
                      : "No products match these filters."}
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

    </main>
  );
}
