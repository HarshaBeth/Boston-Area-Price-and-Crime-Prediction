"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { predictPrice, PriceRequest } from "@/lib/api";
import LandingImage from "../../../public/background_housing2.jpg";

type PriceFormProps = {
  location: string; // from Landing
  setLocation: (location: string) => void;
  setPredPrice: (price: number | null) => void;
};

// Allowed ZIP codes as strings
const ZIP_STRINGS = [
  "02026",
  "02108",
  "02109",
  "02110",
  "02111",
  "02113",
  "02114",
  "02115",
  "02116",
  "02118",
  "02119",
  "02120",
  "02121",
  "02122",
  "02124",
  "02125",
  "02126",
  "02127",
  "02128",
  "02129",
  "02130",
  "02131",
  "02132",
  "02134",
  "02135",
  "02136",
  "02199",
  "02210",
  "02215",
  "02445",
  "02446",
  "02458",
  "02467",
];

// Map to label + numeric value (model expects int like 2134, 2026, etc.)
const ZIP_OPTIONS = ZIP_STRINGS.map((z) => ({
  label: z,
  value: Number(z),
}));

// AC encoding/decoding:
const AC_OPTIONS = [
  { label: "None", value: -1 },
  { label: "Central AC", value: 2 },
  { label: "Ductless AC", value: 1 },
  { label: "Yes (Other)", value: 0 },
];

// Heat encoding/decoding:
const HEAT_OPTIONS = [
  { label: "Hot Water / Steam", value: -2 },
  { label: "Forced Hot Air", value: 1 },
  { label: "Space Heat", value: -1 },
  { label: "Electric", value: -3 },
  { label: "None", value: 0 },
  { label: "Heat Pump", value: 2 },
  { label: "Other", value: 3 },
];

const KITCHEN_OPTIONS = [
  { label: "One Person Kitchen", value: 0 },
  { label: "1 Full Eat-In Kitchen", value: 1 },
  { label: "Full Eat-In Kitchen", value: 1 },
  { label: "2 Full Eat-In Kitchens", value: 2 },
  { label: "3 Full Eat-In Kitchens", value: 3 },
  { label: "0 Full Eat-In Kitchens (Kitchenette)", value: -1 },
  { label: "Pullman Kitchen (Narrow/Galley)", value: -2 },
  { label: "No Kitchen", value: -3 },
  { label: "4 Full Eat-In Kitchens", value: 4 },
  { label: "5 Full Eat-In Kitchens", value: 5 },
];

export default function PriceForm({ location, setLocation, setPredPrice }: PriceFormProps) {
  // Try to match Landing location to a known ZIP, otherwise first option
  const initialZip =
    location && ZIP_STRINGS.includes(location) ? Number(location) : ZIP_OPTIONS[0].value;

  const [form, setForm] = useState<PriceRequest>({
    ZIPCODE: initialZip,
    GROSS_AREA: 2000,
    LIVING_AREA: 1500,
    BED_RMS: 3,
    FULL_BTH: 2,
    HLF_BTH: 1,
    NUM_PARKING: 1,
    KITCHENS: 1,
    FIREPLACES: 0,
    KITCHEN_TYPE: 1,
    HEAT_TYPE: 0,
    AC_TYPE: -1,
  });

  const [, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labelClass =
    "text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-slate-50/80";
  const inputClass =
    "mt-2 w-full h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-sm md:text-base text-slate-50 placeholder:text-slate-200/70 shadow-inner shadow-white/5 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30 outline-none transition";

  // If location (ZIP) from Landing becomes one of the valid ZIPs, update form
  useEffect(() => {
    if (location && ZIP_STRINGS.includes(location)) {
      setForm((prev) => ({ ...prev, ZIPCODE: Number(location) }));
    }
  }, [location]);

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "ZIPCODE" || name === "HEAT_TYPE" || name === "AC_TYPE" || name === "KITCHEN_TYPE") {
      setForm((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
      return;
    }

    let num = Number(value);

    switch (name) {
      case "NUM_PARKING":
        num = clamp(num, 0, 9);
        break;
      case "KITCHENS":
        num = clamp(num, 0, 4);
        break;
      case "HLF_BTH":
        num = clamp(num, 0, 10);
        break;
      case "FULL_BTH":
        num = clamp(num, 0, 8);
        break;
      case "BED_RMS":
        num = clamp(num, 0, 17);
        break;
      case "GROSS_AREA":
        num = clamp(num, 0, 5000);
        break;
      case "LIVING_AREA":
        num = clamp(num, 0, 5000);
        break;
      default:
        break;
    }

    setForm((prev) => ({
      ...prev,
      [name]: num,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);
    setLocation(form.ZIPCODE.toString());

    try {
      const res = await predictPrice(form);
      setPrediction(res.predicted_price);
      setPredPrice(res.predicted_price);
    } catch (err) {
      console.error(err);
      setError("Failed to get prediction from server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative isolate overflow-hidden text-slate-50">
      <Image
        src={LandingImage}
        alt="Boston brownstone street"
        fill
        priority
        className="absolute inset-0 -z-30 object-cover"
      />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(56,189,248,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.22)_0%,rgba(7,19,46,0.6)_28%,rgba(6,12,32,0.65)_65%,rgba(8,11,26,0.7)_100%)] mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_45%,rgba(255,255,255,0)_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_58%,rgba(14,84,255,0.16),transparent_52%),radial-gradient(circle_at_82%_72%,rgba(6,182,212,0.18),transparent_52%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-12 px-6 py-14 sm:px-10 lg:flex-row lg:items-start lg:gap-16 lg:py-20">
        <div className="flex-1 space-y-8 lg:pt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-50/90 shadow-sm shadow-cyan-400/15 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            AI valuation & insights
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-3 text-slate-100/75">
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl lg:text-[4.8rem]">
              Boston&apos;s Residence Price Estimator
            </h1>
            <p className="max-w-2xl text-lg text-slate-100/80">
              Explore Boston neighborhoods with AI-powered crime and pricing insights.
            </p>
          </div>

          <div className="grid w-full max-w-xl grid-cols-2 gap-4 text-sm text-slate-100/90">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm shadow-sm shadow-slate-900/30">
              <div className="text-[0.72rem] uppercase tracking-[0.14em] text-slate-100/70">Coverage</div>
              <div className="text-lg font-semibold text-white">30+ Boston ZIPs</div>
            </div>

          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 w-full max-w-4xl lg:max-w-5xl translate-y-4 rounded-[32px] border border-white/20 bg-white/12 p-10 shadow-[0_35px_140px_-60px_rgba(6,10,25,0.9)] backdrop-blur-2xl transition"
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-100/70">Price Estimator</p>
              <p className="text-2xl font-semibold text-white">Property Details</p>
              <p className="text-sm text-slate-200/80">AI-powered home valuation</p>
            </div>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200 shadow-sm shadow-cyan-400/20">
              Live
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>ZIP Code</label>
              <select
                name="ZIPCODE"
                value={form.ZIPCODE}
                onChange={handleChange}
                className={inputClass}
              >
                {ZIP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="text-slate-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Gross Area (sq ft)</label>
              <input
                type="number"
                name="GROSS_AREA"
                value={form.GROSS_AREA}
                onChange={handleChange}
                min={0}
                max={5000}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Living Area (sq ft)</label>
              <input
                type="number"
                name="LIVING_AREA"
                value={form.LIVING_AREA}
                onChange={handleChange}
                min={0}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Bedrooms</label>
              <input
                type="number"
                name="BED_RMS"
                value={form.BED_RMS}
                onChange={handleChange}
                min={0}
                max={17}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Full Bathrooms</label>
              <input
                type="number"
                name="FULL_BTH"
                value={form.FULL_BTH}
                onChange={handleChange}
                min={0}
                max={8}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Half Bathrooms</label>
              <input
                type="number"
                name="HLF_BTH"
                value={form.HLF_BTH}
                onChange={handleChange}
                min={0}
                max={10}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Parking Spaces</label>
              <input
                type="number"
                name="NUM_PARKING"
                value={form.NUM_PARKING}
                onChange={handleChange}
                min={0}
                max={9}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Kitchens</label>
              <input
                type="number"
                name="KITCHENS"
                value={form.KITCHENS}
                onChange={handleChange}
                min={0}
                max={4}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Fireplaces</label>
              <input
                type="number"
                name="FIREPLACES"
                value={form.FIREPLACES}
                onChange={handleChange}
                min={0}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Kitchen Type</label>
              <select
                name="KITCHEN_TYPE"
                value={form.KITCHEN_TYPE}
                onChange={handleChange}
                className={inputClass}
              >
                {KITCHEN_OPTIONS.map((opt) => (
                  <option key={opt.label + opt.value} value={opt.value} className="text-slate-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Heat Type</label>
              <select
                name="HEAT_TYPE"
                value={form.HEAT_TYPE}
                onChange={handleChange}
                className={inputClass}
              >
                {HEAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="text-slate-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>AC Type</label>
              <select
                name="AC_TYPE"
                value={form.AC_TYPE}
                onChange={handleChange}
                className={inputClass}
              >
                {AC_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="text-slate-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4b2c23] via-[#8b3a2b] to-[#d45a2c] text-white font-semibold shadow-[0_6px_24px_rgba(76,44,35,0.4)] hover:shadow-[0_10px_32px_rgba(139,58,43,0.45)] hover:brightness-110 active:scale-[0.98] transition-all duration-300"
                disabled={loading}
                onClick={() => {
                  setTimeout(() => {
                    document.getElementById("residence_overview")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              >
                {loading ? "Predicting..." : "Predict Price"}
              </button>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-rose-200">{error}</p>}
        </form>
      </div>
    </section>
  );
}
