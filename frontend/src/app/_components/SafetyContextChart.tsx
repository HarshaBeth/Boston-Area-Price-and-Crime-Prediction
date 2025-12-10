"use client";

import type { SafetyContextResponse } from "@/lib/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type SafetyContextChartProps = {
  data: SafetyContextResponse;
};

export function SafetyContextChart({ data }: SafetyContextChartProps) {
  const chartData = data.metrics.map((m) => ({
    label: m.label,
    incidentsPer1000: m.incidentsPer1000,
  }));

  return (
    <div className="w-full space-y-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">
          Safety Context (Incidents per 1,000 residents – {data.zip})
        </h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="incidentsPer1000" name="Incidents per 1,000" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
