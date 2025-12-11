"use client";

import type { SafetyContextResponse } from "@/lib/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from "recharts";

type SafetyContextChartProps = {
  data: SafetyContextResponse;
};

export function SafetyContextChart({ data }: SafetyContextChartProps) {
  const chartData = data.metrics.map((m) => {
    const missing = Boolean(m.missingPopulation || m.incidentsPer1000 === null);
    const value = typeof m.incidentsPer1000 === "number" ? m.incidentsPer1000 : 0;
    return {
      ...m,
      value,
      missingPopulation: missing,
      displayValue: missing ? "N/A" : value.toFixed(2),
    };
  });

  const hasMissingPopulation = chartData.some((m) => m.missingPopulation);
  const numberFormatter = (v: number) => (Number.isFinite(v) ? v.toFixed(1) : "0");

  const tooltipFormatter = (value: number, _name: string, props: any) => {
    const payload = props?.payload;
    if (!payload) return value;
    if (payload.missingPopulation) {
      return ["N/A", "Incidents per 1,000 (population missing)"];
    }
    const rate =
      typeof payload.incidentsPer1000 === "number" ? payload.incidentsPer1000.toFixed(2) : value;
    const detail: string[] = [];
    if (payload.incidents !== undefined) detail.push(`${payload.incidents} incidents (12 mo)`);
    if (payload.population) detail.push(`population ${payload.population.toLocaleString()}`);
    const suffix = detail.length ? ` – ${detail.join(", ")}` : "";
    return [`${rate}${suffix}`, "Incidents per 1,000"];
  };

  const labelFormatter = (label: string, payload: any[]) => {
    const entry = payload?.[0]?.payload;
    if (entry?.missingPopulation) {
      return `${label} (population unavailable)`;
    }
    if (entry?.population) {
      return `${label} (pop ${entry.population.toLocaleString()})`;
    }
    return label;
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">
          Safety Context (Incidents per 1,000 residents – {data.zip})
        </h3>
        {hasMissingPopulation && (
          <p className="text-xs text-orange-500">
            Population unavailable for at least one metric; showing N/A instead of zero.
          </p>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={numberFormatter} />
            <Tooltip formatter={tooltipFormatter} labelFormatter={labelFormatter} />
            <Bar dataKey="value" name="Incidents per 1,000">
              {chartData.map((entry) => (
                <Cell key={entry.label} fill={entry.missingPopulation ? "#94a3b8" : "#82ca9d"} />
              ))}
              <LabelList
                dataKey="displayValue"
                position="top"
                formatter={(val: string, _1, props: any) =>
                  props?.payload?.missingPopulation ? "N/A" : val
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
