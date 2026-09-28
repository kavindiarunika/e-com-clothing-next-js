
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
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);

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

        if (productsResult.success) {
          setProducts(
            Array.isArray(productsResult.products)
              ? productsResult.products.slice(0, 5)
              : []
          );
        }

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
              {products.length} entries
            </span>

            <Link href="/admin/products">
              Manage products
            </Link>

          </div>

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

              {products.map((product) => (

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

              {products.length === 0 && (

                <tr>

                  <td
                    colSpan={5}
                    className="dashboard-table-empty"
                  >
                    No products found.
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
