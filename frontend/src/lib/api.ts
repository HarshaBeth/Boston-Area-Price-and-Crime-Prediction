
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
