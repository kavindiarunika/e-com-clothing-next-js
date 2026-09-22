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
} from "lucide-react";

import StatCard from "@/components/admin/StatCard";
import SalesChart from "@/components/admin/SalesChart";

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      const sessionResponse = await fetch("/api/admin/me", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!sessionResponse.ok) {
        router.replace("/admin/login");
        return;
      }

      const [dashboardResponse, productsResponse] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/products"),
      ]);

      const dashboardResult =
        await dashboardResponse.json();
      const productsResult =
        await productsResponse.json();

      if (dashboardResult.success) {
        setData(dashboardResult.data);
      }

      if (productsResult.success) {
        setProducts(productsResult.products.slice(0, 5));
      }
    }

    loadDashboard().catch(() => {
      router.replace("/admin/login");
    });
  }, [router]);

  if (!data) {
    return (
      <div className="loading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <main className="admin-page">

      <div className="page-header dashboard-heading">

        <div>
          <h1>Dashboard</h1>

          <p className="muted">
            A clear view of your store performance.
          </p>
        </div>

        <button className="dashboard-action">
          View reports
          <ArrowUpRight size={16} />
        </button>

      </div>

      <div className="stats-grid">

        <StatCard
          title="Total Revenue"
          value={`Rs. ${Number(
            data.stats.revenue
          ).toLocaleString()}`}
          icon={Banknote}
        />

        <StatCard
          title="Total Orders"
          value={data.stats.orders}
          icon={ShoppingBag}
        />

        <StatCard
          title="Customers"
          value={data.stats.customers}
          icon={Users}
        />

        <StatCard
          title="Products"
          value={data.stats.products}
          icon={Package}
        />

        <StatCard
          title="Low Stock"
          value={data.stats.lowStock}
          icon={AlertTriangle}
        />

      </div>

      <div className="dashboard-grid">

        <section className="admin-card dashboard-panel dashboard-sales-panel">

          <div className="card-header">
            <div>
              <p className="panel-kicker">PERFORMANCE</p>
              <h2>Sales overview</h2>
            </div>
            <span className="panel-period">Last 7 days</span>
          </div>

          <SalesChart
            data={data.sales}
          />

        </section>

        <section className="admin-card dashboard-panel">

          <div className="card-header">
            <div>
              <p className="panel-kicker">ACTIVITY</p>
              <h2>Recent orders</h2>
            </div>
            <Link href="/admin/orders">View all</Link>
          </div>

          <div className="recent-orders">

            {data.recentOrders.map(
              (order) => (
                <div
                  className="recent-order"
                  key={order.order_id}
                >

                  <div>
                    <strong>
                      #{order.order_id}
                    </strong>

                    <span>
                      {new Date(
                        order.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <strong>
                      Rs.{" "}
                      {Number(
                        order.total_amount
                      ).toLocaleString()}
                    </strong>

                    <span>
                      {order.status}
                    </span>
                  </div>

                </div>
              )
            )}

          </div>

        </section>

      </div>

      <section className="admin-card dashboard-panel recent-products-panel">
        <div className="card-header">
          <div>
            <p className="panel-kicker">CATALOG</p>
            <h2>Recent products</h2>
          </div>
          <Link href="/admin/products">Manage products</Link>
        </div>

        <div className="recent-products">
          {products.length === 0 ? (
            <p className="dashboard-empty">No products to display yet.</p>
          ) : (
            products.map((product) => (
              <div className="recent-product" key={product.product_id}>
                <div className="product-mark">
                  <Package size={18} />
                </div>
                <div>
                  <strong>{product.name || product.title}</strong>
                  <span>{product.status || "Active"}</span>
                </div>
                <b>
                  Rs. {Number(product.price || 0).toLocaleString()}
                </b>
              </div>
            ))
          )}
        </div>
      </section>

    </main>
  );
}