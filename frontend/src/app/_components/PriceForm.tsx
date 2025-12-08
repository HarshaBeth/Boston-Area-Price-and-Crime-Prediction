"use client";

import { useState, useEffect } from "react";
import { predictPrice, PriceRequest } from "@/lib/api";
import Image from "next/image";
import LandingImage from "../../../public/background_housing2.jpg";
import { Router } from "next/router";

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
  { label: "One Person Kitchen", value: 0 },                      // O
  { label: "1 Full Eat-In Kitchen", value: 1 },                  // 1F
  { label: "Full Eat-In Kitchen", value: 1 },                    // F
  { label: "2 Full Eat-In Kitchens", value: 2 },                 // 2F
  { label: "3 Full Eat-In Kitchens", value: 3 },                 // 3F
  { label: "0 Full Eat-In Kitchens (Kitchenette)", value: -1 }, // 0F
  { label: "Pullman Kitchen (Narrow/Galley)", value: -2 },       // P
  { label: "No Kitchen", value: -3 },                            // N
  { label: "4 Full Eat-In Kitchens", value: 4 },                 // 4F
  { label: "5 Full Eat-In Kitchens", value: 5 },                 // 5F
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

  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    // ZIPCODE, HEAT_TYPE, AC_TYPE come from <select>, still numeric
    if (name === "ZIPCODE" || name === "HEAT_TYPE" || name === "AC_TYPE" || name === "KITCHEN_TYPE") {
      setForm((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
      return;
    }

    // Other numeric fields
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
    <div className="w-full relative h-screen flex justify-center items-center">
        <Image
        src={LandingImage}
        alt="Landing"
        fill
        style={{ objectFit: "cover" }}
        className="absolute inset-0 z-0"
        priority
      />

      <div className="w-full relative z-50 max-w-7xl  flex space-x-4">
        <h2 className="text-8xl font-bold text-white w-[40%]">Boston&apos;s Residence Price Estimator</h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/30 backdrop-blur-md rounded-xl shadow-lg p-8 w-[60%]"
        >
          {/* ZIPCODE dropdown */}
          <div>
            <label className="block text-sm font-medium">ZIP Code</label>
            <select
              name="ZIPCODE"
              value={form.ZIPCODE}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-2 py-1 bg-transparent text-black"
            >
              {ZIP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="h-48">
              {opt.label}
            </option>
              ))}
            </select>
          </div>

          {/* GROSS_AREA (max 5000) */}
          <div>
            <label className="block text-sm font-medium">Gross Area (sq ft)</label>
            <input
              type="number"
              name="GROSS_AREA"
              value={form.GROSS_AREA}
              onChange={handleChange}
              min={0}
              max={5000}
              className="mt-1 w-full border rounded px-2 py-1 "
            />
          </div>

          {/* LIVING_AREA */}
          <div>
            <label className="block text-sm font-medium">Living Area (sq ft)</label>
            <input
              type="number"
              name="LIVING_AREA"
              value={form.LIVING_AREA}
              onChange={handleChange}
              min={0}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>

          {/* BED_RMS (0–17) */}
          <div>
            <label className="block text-sm font-medium">Bedrooms</label>
            <input
              type="number"
              name="BED_RMS"
              value={form.BED_RMS}
              onChange={handleChange}
              min={0}
              max={17}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>

          {/* FULL_BTH (0–8) */}
          <div>
            <label className="block text-sm font-medium">Full Bathrooms</label>
            <input
              type="number"
              name="FULL_BTH"
              value={form.FULL_BTH}
              onChange={handleChange}
              min={0}
              max={8}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>

          {/* HLF_BTH (0–10) */}
          <div>
            <label className="block text-sm font-medium">Half Bathrooms</label>
            <input
              type="number"
              name="HLF_BTH"
              value={form.HLF_BTH}
              onChange={handleChange}
              min={0}
              max={10}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>

          {/* NUM_PARKING (0–9) */}
          <div>
            <label className="block text-sm font-medium">Parking Spaces</label>
            <input
              type="number"
              name="NUM_PARKING"
              value={form.NUM_PARKING}
              onChange={handleChange}
              min={0}
              max={9}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>

          {/* KITCHENS (0–4) */}
          <div>
            <label className="block text-sm font-medium">Kitchens</label>
            <input
              type="number"
              name="KITCHENS"
              value={form.KITCHENS}
              onChange={handleChange}
              min={0}
              max={4}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>

          {/* FIREPLACES */}
          <div>
            <label className="block text-sm font-medium">Fireplaces</label>
            <input
              type="number"
              name="FIREPLACES"
              value={form.FIREPLACES}
              onChange={handleChange}
              min={0}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>

          {/* KITCHEN_TYPE - dropdown */}
          <div>
            <label className="block text-sm font-medium">Kitchen Type</label>
            <select
              name="KITCHEN_TYPE"
              value={form.KITCHEN_TYPE}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-2 py-1 bg-transparent text-black"
            >
              {KITCHEN_OPTIONS.map((opt) => (
                <option key={opt.label + opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* HEAT_TYPE – dropdown */}
          <div>
            <label className="block text-sm font-medium">Heat Type</label>
            <select
              name="HEAT_TYPE"
              value={form.HEAT_TYPE}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-2 py-1 bg-transparent text-black"

            >
              {HEAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
              ))}
            </select>
          </div>

          {/* AC_TYPE – dropdown */}
          <div>
            <label className="block text-sm font-medium bg-transparent">AC Type</label>
            <select
              name="AC_TYPE"
              value={form.AC_TYPE}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-2 py-1 bg-transparent text-black"
            >
              {AC_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-start">
            <button
              type="submit"
              className="mt-2 px-4 py-2 rounded bg-black text-white disabled:opacity-60"
              disabled={loading}
              onClick={(e) => {
                setTimeout(() => {
                  document.getElementById("residence_overview")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              {loading ? "Predicting..." : "Predict Price"}
            </button>
          </div>
        </form>

        {error && <div className="text-red-600 text-sm">{error}</div>}

      </div>
    </div>
  );
}
