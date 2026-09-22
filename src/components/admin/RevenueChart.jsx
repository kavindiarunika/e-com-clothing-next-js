"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueChart({
  data = [],
}) {
  return (
    <div className="admin-chart-card">
      <div className="admin-card-title">
        Revenue
      </div>

      <div className="admin-chart">
        <ResponsiveContainer
          width="100%"
          height={320}
        >
          <AreaChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="date"
            />

            <YAxis />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1C1C1C"
              fill="#E5E2DC"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}