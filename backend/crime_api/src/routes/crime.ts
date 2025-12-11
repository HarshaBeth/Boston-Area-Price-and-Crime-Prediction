import { Router, Request, Response } from "express";
import { query } from "../db";

const router = Router();
export default router;
const DEBUG = process.env.CRIME_API_DEBUG === "1";

function normalizeZip(zipParam?: string | string[]): string | null {
  if (!zipParam || Array.isArray(zipParam)) return null;
  const cleaned = zipParam.trim();
  if (!cleaned) return null;
  const padded = cleaned.padStart(5, "0");
  if (padded.length !== 5) return null;
  return padded;
}

function monthIndex(year: number, month: number): number {
  return year * 12 + (month - 1);
}

router.get("/trend", async (req: Request, res: Response) => {
  const zip = normalizeZip(req.query.zip as string | undefined);
  if (!zip) {
    return res.status(400).json({ error: "zip is required and must be 5 characters" });
  }

  try {
    const { rows } = await query<{ year: number; month: number; incident_count: number }>(
      `SELECT year, month, incident_count
       FROM crime_monthly_zip
       WHERE zip_code = $1
       ORDER BY year, month`,
      [zip],
    );

    if (!rows.length) {
      return res.status(404).json({ error: "No data for zip" });
    }

    const latest = rows[rows.length - 1];
    const latestIdx = monthIndex(Number(latest.year), Number(latest.month));
    const cutoffIdx = latestIdx - 59; // last 60 months inclusive

    const points = rows
      .filter((r) => monthIndex(Number(r.year), Number(r.month)) >= cutoffIdx)
      .map((r) => ({
        year: Number(r.year),
        month: Number(r.month),
        count: Number(r.incident_count),
      }));

    // YOY change using last 24 months (recent 12 vs previous 12)
    const recentCutoff = latestIdx - 11;
    const previousCutoff = latestIdx - 23;

    let recentSum = 0;
    let previousSum = 0;
    rows.forEach((r: { year: number; month: number; incident_count: number }) => {
      const idx = monthIndex(Number(r.year), Number(r.month));
      const count = Number(r.incident_count);
      if (idx >= recentCutoff && idx <= latestIdx) {
        recentSum += count;
      } else if (idx >= previousCutoff && idx < recentCutoff) {
        previousSum += count;
      }
    });

    const yoy =
      previousSum > 0 ? Number((((recentSum - previousSum) / previousSum) * 100).toFixed(1)) : null;

    return res.status(200).json({
      zip,
      points,
      yearOverYearChangePercent: yoy,
    });
  } catch (err: any) {
    console.error("Error in /api/crime/trend", err);
    return res.status(500).json({
      error: "Internal server error",
      detail: DEBUG ? String(err?.message ?? err) : undefined,
      stack: DEBUG ? err?.stack : undefined,
    });
  }
});

router.get("/offense-mix", async (req: Request, res: Response) => {
  const zip = normalizeZip(req.query.zip as string | undefined);
  if (!zip) {
    return res.status(400).json({ error: "zip is required and must be 5 characters" });
  }

  try {
    const { rows } = await query<{
      year: number;
      month: number;
      offense_category: string;
      incident_count: number;
    }>(
      `SELECT year, month, offense_category, incident_count
       FROM crime_offense_mix
       WHERE zip_code = $1
       ORDER BY year, month`,
      [zip],
    );

    if (!rows.length) {
      return res.status(404).json({ error: "No data for zip" });
    }

    const latest = rows[rows.length - 1];
    const latestIdx = monthIndex(Number(latest.year), Number(latest.month));
    const cutoffIdx = latestIdx - 11; // last 12 months

    const grouped: Record<number, { year: number; month: number; categories: Record<string, number> }> =
      {};

    rows.forEach((r: { year: number; month: number; offense_category: string; incident_count: number }) => {
      const idx = monthIndex(Number(r.year), Number(r.month));
      if (idx < cutoffIdx) return;
      const key = idx;
      if (!grouped[key]) {
        grouped[key] = {
          year: Number(r.year),
          month: Number(r.month),
          categories: {},
        };
      }
      grouped[key].categories[r.offense_category] = Number(r.incident_count);
    });

    const months = Object.values(grouped).sort(
      (a, b) => monthIndex(a.year, a.month) - monthIndex(b.year, b.month),
    );

    return res.status(200).json({
      zip,
      months,
    });
  } catch (err: any) {
    console.error("Error in /api/crime/offense-mix", err);
    return res.status(500).json({
      error: "Internal server error",
      detail: DEBUG ? String(err?.message ?? err) : undefined,
      stack: DEBUG ? err?.stack : undefined,
    });
  }
});

router.get("/safety-context", async (req: Request, res: Response) => {
  const zip = normalizeZip(req.query.zip as string | undefined);
  if (!zip) {
    return res.status(400).json({ error: "zip is required and must be 5 characters" });
  }

  try {
    const latestResult = await query<{ year: number; month: number }>(
      `SELECT year, month
       FROM crime_monthly_zip
       ORDER BY year DESC, month DESC
       LIMIT 1`,
    );
    const latestRow = latestResult.rows[0];
    if (!latestRow || latestRow.year === null || latestRow.month === null) {
      return res.status(404).json({ error: "No data available" });
    }

    const latestIdx = monthIndex(Number(latestRow.year), Number(latestRow.month));
    const cutoffIdx = latestIdx - 11; // last 12 months

    const incidentsResult = await query<{
      zip_code: string;
      year: number;
      month: number;
      incident_count: number;
    }>(`SELECT zip_code, year, month, incident_count FROM crime_monthly_zip`);

    const popResult = await query<{ zip_code: string; population: number }>(
      `SELECT zip_code, population FROM crime_zip_population`,
    );

    const populationMap = new Map<string, number>();
    popResult.rows.forEach((r: { zip_code: string; population: number }) => {
      const normalized = normalizeZip(r.zip_code);
      if (!normalized) return;
      const pop = Number(r.population);
      if (Number.isFinite(pop) && pop > 0) {
        populationMap.set(normalized, pop);
      }
    });
    if (!populationMap.size) {
      console.warn("[crime_api] safety-context population table is empty");
    }
    if (!populationMap.has(zip)) {
      console.warn(`[crime_api] safety-context missing population for target ZIP ${zip}`);
    }

    const totals = new Map<string, number>();
    incidentsResult.rows.forEach(
      (r: { zip_code: string; year: number; month: number; incident_count: number }) => {
        const normalized = normalizeZip(r.zip_code);
        if (!normalized) return;
        const idx = monthIndex(Number(r.year), Number(r.month));
        if (idx < cutoffIdx || idx > latestIdx) return;
        const current = totals.get(normalized) || 0;
        totals.set(normalized, current + Number(r.incident_count));
      },
    );

    const targetIncidents = totals.get(zip) || 0;
    const targetPop = populationMap.get(zip);
    const targetRate =
      targetPop && targetPop > 0 ? Number(((targetIncidents / targetPop) * 1000).toFixed(2)) : null;

    const cityEntries = Array.from(totals.entries()).filter(([z]) => populationMap.has(z));
    let cityIncidents = 0;
    let cityPopulation = 0;
    cityEntries.forEach(([z, count]) => {
      const pop = populationMap.get(z) || 0;
      cityIncidents += count;
      cityPopulation += pop;
    });
    const cityRate =
      cityPopulation > 0 ? Number(((cityIncidents / cityPopulation) * 1000).toFixed(2)) : null;

    const neighborCandidates = cityEntries
      .filter(([z]) => z !== zip)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    const metrics = [
      {
        label: "This ZIP",
        incidentsPer1000: targetRate,
        incidents: targetIncidents,
        population: targetPop,
        missingPopulation: !targetPop || targetPop <= 0,
      },
      {
        label: "City average",
        incidentsPer1000: cityRate,
        incidents: cityIncidents,
        population: cityPopulation,
        contributingZips: cityEntries.length,
        missingPopulation: cityPopulation <= 0,
      },
      ...neighborCandidates.map(([z]) => {
        const pop = populationMap.get(z) || 0;
        const incidentTotal = totals.get(z) || 0;
        const rate = pop > 0 ? Number(((incidentTotal / pop) * 1000).toFixed(2)) : null;
        return {
          label: `Neighbor ZIP ${z}`,
          incidentsPer1000: rate,
          incidents: incidentTotal,
          population: pop,
          missingPopulation: pop <= 0,
        };
      }),
    ];

    console.info(
      "[crime_api] safety-context target zip=%s incidents=%d pop=%s rate=%s",
      zip,
      targetIncidents,
      targetPop ?? "missing",
      targetRate ?? "n/a",
    );
    console.info(
      "[crime_api] safety-context city incidents=%d pop=%d rate=%s contributors=%d",
      cityIncidents,
      cityPopulation,
      cityRate ?? "n/a",
      cityEntries.length,
    );
    console.info(
      "[crime_api] safety-context neighbor zips=%s",
      neighborCandidates.map(([z]) => z).join(",") || "none",
    );

    return res.status(200).json({
      zip,
      metrics,
    });
  } catch (err: any) {
    console.error("Error in /api/crime/safety-context", err);
    return res.status(500).json({
      error: "Internal server error",
      detail: DEBUG ? String(err?.message ?? err) : undefined,
      stack: DEBUG ? err?.stack : undefined,
    });
  }
});

// Keep router exported as default for mounting at /api/crime
