"use client";

import type { CrimeTrendResponse } from "@/lib/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type CrimeTrendChartProps = {
  data: CrimeTrendResponse;
};

export function CrimeTrendChart({ data }: CrimeTrendChartProps) {
  const chartData = data.points.map((p) => ({
    year: p.year,
    month: p.month,
    label: `${p.year}-${String(p.month).padStart(2, "0")}`,
    count: p.count,
  }));

  const yoy = data.yearOverYearChangePercent;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">5-Year Crime Trend ({data.zip})</h3>
        {yoy !== null && (
          <span
            className={`text-sm ${
              yoy > 0 ? "text-red-600" : yoy < 0 ? "text-green-600" : "text-gray-500"
            }`}
          >
            YoY: {yoy > 0 ? "+" : ""}
            {yoy}%
          </span>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" name="Incidents" stroke="#8884d8" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
