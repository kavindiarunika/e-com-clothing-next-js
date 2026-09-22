"use client";

import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import StatCard from "@/components/admin/StatCard";

export default function SalesReportPage() {
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Sales Reports</h1>
          <p>
            Analyze your store sales performance.
          </p>
        </div>

        <select className="admin-select">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Revenue"
          value="Rs. 1,245,000"
          subtitle="Current period"
          icon={DollarSign}
        />

        <StatCard
          title="Orders"
          value="1,248"
          subtitle="Current period"
          icon={ShoppingCart}
        />

        <StatCard
          title="Average Order"
          value="Rs. 9,976"
          subtitle="Per order"
          icon={TrendingUp}
        />
      </div>

      <div className="admin-card report-card">
        <div className="card-header">
          <div>
            <h3>Monthly Revenue</h3>
            <p>Revenue breakdown</p>
          </div>
        </div>

        <div className="report-chart">
          {[
            ["Jan", 35],
            ["Feb", 50],
            ["Mar", 45],
            ["Apr", 60],
            ["May", 70],
            ["Jun", 65],
            ["Jul", 80],
            ["Aug", 90],
            ["Sep", 75],
          ].map(([month, height]) => (
            <div
              className="report-bar-wrapper"
              key={month}
            >
              <div
                className="report-bar"
                style={{
                  height: `${height}%`,
                }}
              />

              <span>{month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}