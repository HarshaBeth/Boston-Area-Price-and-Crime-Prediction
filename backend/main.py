from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from pathlib import Path
import logging
from typing import List, Optional

app = FastAPI(title="Boston House Price API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Paths ---
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model_artifacts"

# --- Load artifacts with guardrails ---
model = None
scaler = None
numeric_cols = None
model_load_error = None

try:
    model = joblib.load(MODEL_DIR / "best_price_model.pkl")
    scaler = joblib.load(MODEL_DIR / "scaler_price_features.pkl")
    numeric_cols = list(joblib.load(MODEL_DIR / "scaler_numeric_columns.pkl"))
except Exception as exc:  # pragma: no cover - startup guard
    model_load_error = exc
    logging.exception("Failed to load price model artifacts")

class PriceRequest(BaseModel):
    ZIPCODE: int
    GROSS_AREA: float
    LIVING_AREA: float
    BED_RMS: int
    FULL_BTH: int
    HLF_BTH: int
    NUM_PARKING: int
    KITCHENS: int
    FIREPLACES: int
    KITCHEN_TYPE: int
    HEAT_TYPE: int
    AC_TYPE: int

class PriceResponse(BaseModel):
    predicted_price: float

@app.get("/")
def root():
    return {"message": "Boston price prediction API is running."}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None and scaler is not None and numeric_cols is not None,
        "model_error": str(model_load_error) if model_load_error else None,
    }

@app.post("/predict_price", response_model=PriceResponse)
def predict_price(req: PriceRequest):
    if model is None or scaler is None or numeric_cols is None:
        raise HTTPException(status_code=500, detail="Price model not loaded")

    payload = req.dict()
    logging.info("predict_price payload=%s", payload)

    data = pd.DataFrame([payload])
    logging.info("predict_price df columns=%s", list(data.columns))
    logging.info("predict_price numeric_cols=%s", numeric_cols)

    missing_cols = [col for col in numeric_cols if col not in data.columns]
    if missing_cols:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input features; expected columns: {numeric_cols}",
        )

    try:
        data[numeric_cols] = scaler.transform(data[numeric_cols])
    except Exception as exc:
        logging.exception("Scaling failed")
        raise HTTPException(status_code=500, detail="Failed to scale input") from exc

    try:
        pred = model.predict(data)[0]
    except Exception as exc:
        logging.exception("Model prediction failed")
        raise HTTPException(status_code=500, detail="Failed to generate prediction") from exc

    return PriceResponse(predicted_price=float(pred))
