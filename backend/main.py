from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from pathlib import Path
import logging
from functools import lru_cache

app = FastAPI(title="Boston House Price API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Paths ---
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model_artifacts"

logger = logging.getLogger("price-api")
logging.basicConfig(level=logging.INFO)


@lru_cache(maxsize=1)
def get_artifacts():
    """
    Lazy-load model artifacts once, using mmap for the model to keep
    memory usage under control inside the container.
    """
    model_path = MODEL_DIR / "best_price_model.pkl"
    scaler_path = MODEL_DIR / "scaler_price_features.pkl"
    cols_path = MODEL_DIR / "scaler_numeric_columns.pkl"

    logger.info("Loading price model artifacts from %s", MODEL_DIR)

    try:
        # memory-map the big model
        model = joblib.load(model_path, mmap_mode="r")
        scaler = joblib.load(scaler_path)
        numeric_cols = list(joblib.load(cols_path))
    except Exception as exc:
        logger.exception("Failed to load price model artifacts")
        raise RuntimeError(f"Failed to load model artifacts: {exc}") from exc

    return model, scaler, numeric_cols


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
    # Try loading artifacts once and report status
    try:
        model, scaler, numeric_cols = get_artifacts()
        ok = model is not None and scaler is not None and bool(numeric_cols)
        err = None
    except Exception as exc:
        ok = False
        err = str(exc)

    return {
        "status": "ok",
        "model_loaded": ok,
        "model_error": err,
    }


@app.post("/predict_price", response_model=PriceResponse)
def predict_price(req: PriceRequest):
    try:
        model, scaler, numeric_cols = get_artifacts()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Price model not loaded: {exc}")

    payload = req.dict()
    logger.info("predict_price payload=%s", payload)

    data = pd.DataFrame([payload])

    missing_cols = [col for col in numeric_cols if col not in data.columns]
    if missing_cols:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input features; expected numeric columns: {numeric_cols}",
        )

    try:
        data[numeric_cols] = scaler.transform(data[numeric_cols])
    except Exception as exc:
        logger.exception("Scaling failed")
        raise HTTPException(status_code=500, detail="Failed to scale input") from exc

    try:
        pred = model.predict(data)[0]
    except Exception as exc:
        logger.exception("Model prediction failed")
        raise HTTPException(status_code=500, detail="Failed to generate prediction") from exc

    return PriceResponse(predicted_price=float(pred))
