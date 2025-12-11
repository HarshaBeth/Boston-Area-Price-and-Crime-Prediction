"use client";

import React, { useEffect, useMemo, useState } from "react";
import ZipMap from "./ZipMap";
import {
  getCrimeTrend,
  getOffenseMix,
  getSafetyContext,
  type CrimeTrendResponse,
  type OffenseMixResponse,
  type SafetyContextResponse,
} from "@/lib/api";
import { CrimeTrendChart } from "./CrimeTrendChart";
import { OffenseMixChart } from "./OffenseMixChart";
import { SafetyContextChart } from "./SafetyContextChart";

type EvaluationProps = {
  location?: string;
  predPrice?: number | null;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const IconDollar = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M12 2v20" strokeLinecap="round" />
    <path d="M8 7.5c0-1.94 1.79-3.5 4-3.5s4 1.56 4 3.5S14.21 11 12 11s-4 1.56-4 3.5S10.21 18 12 18s4-1.56 4-3.5" strokeLinecap="round" />
  </svg>
);

const OverviewSidePanel = ({
  normalizedZip,
  hasLocation,
  displayedPrice,
  priceRatio,
}: {
  normalizedZip: string | null;
  hasLocation: boolean;
  displayedPrice: number;
  priceRatio: number;
}) => (
  <aside
    className={`relative z-10 w-full max-w-[460px] flex-shrink-0 overflow-y-auto border-r border-white/10 bg-white/5 px-10 py-12 backdrop-blur-xl ${
      !hasLocation ? "opacity-25" : ""
    }`}
  >
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-200/70">
          Boston {!hasLocation && "· Pending"} {hasLocation && `· ${normalizedZip}`}
        </p>
        <h1 className="text-3xl font-semibold text-white">Residence Overview</h1>
      </div>

      <EstimatedPriceCard displayedPrice={displayedPrice} priceRatio={priceRatio} dimmed={!hasLocation} />

      <ZipAndStatusCard hasLocation={hasLocation} normalizedZip={normalizedZip} />
    </div>
  </aside>
);

const EstimatedPriceCard = ({
  displayedPrice,
  priceRatio,
  dimmed,
}: {
  displayedPrice: number;
  priceRatio: number;
  dimmed?: boolean;
}) => (
  <div
    className={`space-y-4 rounded-2xl border border-white/12 bg-white/7 p-6 shadow-inner shadow-white/5 ${
      dimmed ? "opacity-55" : ""
    }`}
  >
    <div className="flex items-center justify-between text-sm text-slate-100/80">
      <span className="inline-flex items-center gap-2">
        <IconDollar className="h-4 w-4" />
        Estimated price
      </span>
      <span className="text-xs rounded-full bg-white/10 px-3 py-1 text-slate-100/80">AI prediction</span>
    </div>
    <div className="flex items-end justify-between">
      <div className="text-4xl font-bold tracking-tight text-white">{formatCurrency(displayedPrice)}</div>
      <p className="text-xs text-slate-200/70">of $3M cap</p>
    </div>
    <div className="space-y-1">
      <div className="h-2 w-full rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-[#0e54ff] via-[#3b82f6] to-[#22d3ee] shadow-[0_0_20px_-6px_rgba(62,148,255,0.8)]"
          style={{ width: `${Math.max(8, priceRatio * 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-[0.68rem] text-slate-200/70">
        <span>$0</span>
        <span>$3M</span>
      </div>
    </div>
    <p className="text-xs text-slate-200/70">Pricing blended from comparable Boston ZIP data and recent closings.</p>
  </div>
);

const ZipAndStatusCard = ({
  hasLocation,
  normalizedZip,
}: {
  hasLocation: boolean;
  normalizedZip: string | null;
}) => (
  <div className="grid grid-cols-2 gap-3 text-sm text-slate-100/80">
    <div className={`rounded-xl border border-white/10 bg-white/6 px-4 py-3 ${!hasLocation ? "opacity-55" : ""}`}>
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-200/70">ZIP</p>
      <p className="text-lg font-semibold text-white">{hasLocation ? normalizedZip : "— — —"}</p>
    </div>
    <div className={`rounded-xl border border-white/10 bg-white/6 px-4 py-3 ${!hasLocation ? "opacity-55" : ""}`}>
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-200/70">Status</p>
      <p className="text-lg font-semibold text-emerald-200">{hasLocation ? "Ready" : "Awaiting selection"}</p>
    </div>
  </div>
);

function Evaluation({ location, predPrice }: EvaluationProps) {
  const normalizedZip = location && location.trim() !== "" ? location.trim().padStart(5, "0") : null;

  const [crimeTrend, setCrimeTrend] = useState<CrimeTrendResponse | null>(null);
  const [offenseMix, setOffenseMix] = useState<OffenseMixResponse | null>(null);
  const [safetyContext, setSafetyContext] = useState<SafetyContextResponse | null>(null);
  const [crimeLoading, setCrimeLoading] = useState(false);
  const [crimeError, setCrimeError] = useState<string | null>(null);

  useEffect(() => {
    if (!normalizedZip) {
      setCrimeTrend(null);
      setOffenseMix(null);
      setSafetyContext(null);
      setCrimeError(null);
      setCrimeLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCrime(zip: string) {
      setCrimeLoading(true);
      setCrimeError(null);
      try {
        const [trend, mix, context] = await Promise.all([
          getCrimeTrend(zip),
          getOffenseMix(zip),
          getSafetyContext(zip),
        ]);

        if (cancelled) return;

        setCrimeTrend(trend);
        setOffenseMix(mix);
        setSafetyContext(context);
      } catch (err) {
        console.error("Error loading crime data", err);
        if (!cancelled) {
          setCrimeError("Crime data unavailable for this ZIP.");
          setCrimeTrend(null);
          setOffenseMix(null);
          setSafetyContext(null);
        }
      } finally {
        if (!cancelled) {
          setCrimeLoading(false);
        }
      }
    }

    loadCrime(normalizedZip);

    return () => {
      cancelled = true;
    };
  }, [normalizedZip]);

  const hasLocation = Boolean(normalizedZip);
  const displayedPrice = useMemo(() => {
    if (predPrice) return predPrice;
    return 850000;
  }, [predPrice]);

  const priceRatio = Math.min(1, displayedPrice / 1500000);

  return (
    <section
      className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-[#050914] via-[#0a152b] to-[#0c1f3f] text-slate-50"
      id="residence_overview"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(129,140,248,0.14),transparent_40%),radial-gradient(circle_at_40%_75%,rgba(14,84,255,0.16),transparent_52%)]" />
      </div>

      <div className="relative flex min-h-screen w-full">
        <OverviewSidePanel
          normalizedZip={normalizedZip}
          hasLocation={hasLocation}
          displayedPrice={displayedPrice}
          priceRatio={priceRatio}
        />

        <div className={`relative flex-1 ${!hasLocation ? "opacity-40" : ""}`}>
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#050914]/65 to-transparent" />
          <div className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
            Select a Location
          </div>
          <div className="relative h-screen w-full overflow-hidden bg-slate-900/40">
            <ZipMap selectedZip={normalizedZip} />
          </div>
        </div>

        {!hasLocation && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-white/70">
            <div className="flex flex-col items-center gap-4 text-center text-slate-800">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 shadow-lg shadow-slate-900/20">
                <svg className="h-14 w-14 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 21s7-5.5 7-11.5S16.627 2 12 2 5 5.5 5 9.5 12 21 12 21Z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
              </div>
              <p className="text-2xl font-semibold text-slate-900">Select Location for Evaluation...</p>
            </div>
          </div>
        )}
      </div>

      {normalizedZip && (
        <section className="mx-auto max-w-6xl px-6 py-12 space-y-4">
          <h2 className="text-xl font-semibold text-white">Crime &amp; Safety</h2>

          {crimeLoading && <p className="text-sm text-gray-300">Loading crime data…</p>}

          {crimeError && <p className="text-sm text-red-400">{crimeError}</p>}

          {!crimeLoading && !crimeError && (
            <div className="space-y-6">
              {crimeTrend && <CrimeTrendChart data={crimeTrend} />}
              {offenseMix && <OffenseMixChart data={offenseMix} />}
              {safetyContext && <SafetyContextChart data={safetyContext} />}
            </div>
          )}
        </section>
      )}
    </section>
  );
}

export default Evaluation;
