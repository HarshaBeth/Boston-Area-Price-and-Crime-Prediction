
export type PriceRequest = {
  ZIPCODE: number;
  GROSS_AREA: number;
  LIVING_AREA: number;
  BED_RMS: number;
  FULL_BTH: number;
  HLF_BTH: number;
  NUM_PARKING: number;
  KITCHENS: number;
  FIREPLACES: number;
  KITCHEN_TYPE: number;
  HEAT_TYPE: number;
  AC_TYPE: number;
};

export type PriceResponse = {
  predicted_price: number;
};

export async function predictPrice(payload: PriceRequest): Promise<PriceResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const res = await fetch(`${baseUrl}/predict_price`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

const CRIME_API_BASE_URL =
  process.env.NEXT_PUBLIC_CRIME_API_BASE_URL || "http://localhost:4000";

export interface CrimeTrendPoint {
  year: number;
  month: number;
  count: number;
}

export interface CrimeTrendResponse {
  zip: string;
  points: CrimeTrendPoint[];
  yearOverYearChangePercent: number | null;
}

export interface OffenseMixMonth {
  year: number;
  month: number;
  categories: Record<string, number>;
}

export interface OffenseMixResponse {
  zip: string;
  months: OffenseMixMonth[];
}

export interface CrimeSafetyMetric {
  label: string;
  incidentsPer1000: number | null;
  incidents?: number;
  population?: number | null;
  missingPopulation?: boolean;
  contributingZips?: number;
}

export interface SafetyContextResponse {
  zip: string;
  metrics: CrimeSafetyMetric[];
}

export async function getCrimeTrend(zip: string): Promise<CrimeTrendResponse> {
  const res = await fetch(
    `${CRIME_API_BASE_URL}/api/crime/trend?zip=${encodeURIComponent(zip)}`
  );

  if (!res.ok) {
    throw new Error(`Crime API error: ${res.status}`);
  }

  return res.json();
}

export async function getOffenseMix(zip: string): Promise<OffenseMixResponse> {
  const res = await fetch(
    `${CRIME_API_BASE_URL}/api/crime/offense-mix?zip=${encodeURIComponent(zip)}`
  );

  if (!res.ok) {
    throw new Error(`Crime API error: ${res.status}`);
  }

  return res.json();
}

export async function getSafetyContext(zip: string): Promise<SafetyContextResponse> {
  const res = await fetch(
    `${CRIME_API_BASE_URL}/api/crime/safety-context?zip=${encodeURIComponent(zip)}`
  );

  if (!res.ok) {
    throw new Error(`Crime API error: ${res.status}`);
  }

  return res.json();
}
