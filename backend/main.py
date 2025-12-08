from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from pathlib import Path

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
MODEL_DIR = BASE_DIR / "notebooks"

# --- Load artifacts ---
model = joblib.load(MODEL_DIR / "best_price_model.pkl")
scaler = joblib.load(MODEL_DIR / "scaler_price_features.pkl")
numeric_cols = joblib.load(MODEL_DIR / "scaler_numeric_columns.pkl")

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

@app.post("/predict_price", response_model=PriceResponse)
def predict_price(req: PriceRequest):
    data = pd.DataFrame([req.dict()])
    data[numeric_cols] = scaler.transform(data[numeric_cols])
    pred = model.predict(data)[0]
    return PriceResponse(predicted_price=float(pred))
