"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesChart({
  data = [],
}) {
  return (
    <div className="admin-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5ddd5" />
          <XAxis dataKey="day" tick={{ fill: "#766d67", fontSize: 11 }} />
          <YAxis tick={{ fill: "#766d67", fontSize: 11 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#72383D"
            strokeWidth={3}
            dot={{ fill: "#72383D", strokeWidth: 0, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}