"use client";

import type { OffenseMixResponse } from "@/lib/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type OffenseMixChartProps = {
  data: OffenseMixResponse;
};

export function OffenseMixChart({ data }: OffenseMixChartProps) {
  const chartData = data.months.map((m) => ({
    label: `${m.year}-${String(m.month).padStart(2, "0")}`,
    ...m.categories,
  }));

  const categories = Array.from(
    new Set(
      data.months.flatMap((m) => Object.keys(m.categories || {}))
    )
  );

  return (
    <div className="w-full space-y-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">Offense Mix (Last 12 Months – {data.zip})</h3>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} stackOffset="none">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            {categories.map((cat, idx) => (
              <Bar key={cat} dataKey={cat} stackId="offense" fill={`hsl(${(idx * 60) % 360}, 65%, 60%)`} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
