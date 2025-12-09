"""Prepare Boston crime data for Postgres loading and frontend charts.

Run from the project root:
    python backend/scripts/prepare_crime_data.py

Reads yearly crime CSVs, cleans fields, maps offenses into a small category
set, spatially joins points to ZIP polygons (from frontend/public/
boston_zipcodes.geojson), and writes aggregated artifacts:
    backend/artifacts/crime/crime_monthly_zip.csv
    backend/artifacts/crime/crime_offense_mix.csv
    backend/artifacts/crime/crime_zip_totals.csv
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import geopandas as gpd
import pandas as pd
from shapely.geometry import Point


REPO_ROOT = Path(__file__).resolve().parents[2]
CRIME_DIR = REPO_ROOT / "backend" / "datasets" / "crime_datasets"
GEOJSON_PATH = REPO_ROOT / "frontend" / "public" / "boston_zipcodes.geojson"
ARTIFACT_DIR = REPO_ROOT / "backend" / "artifacts" / "crime"


def map_offense(offense_description: str) -> str:
    """Map a raw offense description to a simplified category."""
    if not isinstance(offense_description, str) or not offense_description.strip():
        return "other"

    text = offense_description.lower()

    rules: List[Tuple[str, Iterable[str]]] = [
        ("assault", ["assault", "battery", "affray", "threat", "homicide", "manslaughter"]),
        ("robbery", ["robbery"]),
        ("burglary", ["burglary", "breaking and entering", "b&e", "b & e"]),
        (
            "vehicle_theft",
            ["motor vehicle", "auto theft", "carjacking", "mv theft", "stolen mv"],
        ),
        (
            "vandalism",
            ["vandalism", "property damage", "malicious destruction", "graffiti"],
        ),
        ("theft", ["larceny", "theft", "shoplifting", "stolen", "pickpocket"]),
        ("fraud", ["fraud", "counterfeit", "forgery", "scam", "identity theft"]),
        (
            "drugs",
            ["drug", "narcot", "controlled substance", "heroin", "cocaine", "marijuana"],
        ),
        ("weapons", ["weapon", "firearm", "gun", "knife", "ammunition"]),
        ("disorder", ["disorderly", "disturbance", "noise complaint"]),
    ]

    for category, needles in rules:
        if any(needle in text for needle in needles):
            return category

    return "other"


def load_raw_crime_frames() -> pd.DataFrame:
    """Load and concatenate all yearly crime CSVs."""
    csv_paths = sorted(CRIME_DIR.glob("*.csv"))
    if not csv_paths:
        raise FileNotFoundError(f"No CSV files found in {CRIME_DIR}")

    frames = []
    for path in csv_paths:
        df = pd.read_csv(
            path,
            dtype=str,
            usecols=[
                "INCIDENT_NUMBER",
                "OFFENSE_DESCRIPTION",
                "OCCURRED_ON_DATE",
                "YEAR",
                "MONTH",
                "Lat",
                "Long",
            ],
        )
        df["source_file"] = path.name
        frames.append(df)

    return pd.concat(frames, ignore_index=True)


def clean_and_enrich(df: pd.DataFrame) -> pd.DataFrame:
    """Standardize fields and derive helper columns."""
    initial_rows = len(df)

    df = df.copy()
    df.rename(
        columns={"INCIDENT_NUMBER": "incident_id", "OFFENSE_DESCRIPTION": "offense_raw"},
        inplace=True,
    )

    df["incident_id"] = df["incident_id"].astype(str).str.strip()
    df["offense_raw"] = df["offense_raw"].astype(str).str.strip()

    df["occurred_at"] = pd.to_datetime(df["OCCURRED_ON_DATE"], errors="coerce")
    df["year"] = df["occurred_at"].dt.year
    df["month"] = df["occurred_at"].dt.month
    df["year_month"] = df["occurred_at"].dt.to_period("M").astype(str)

    df["lat"] = pd.to_numeric(df["Lat"], errors="coerce")
    df["lng"] = pd.to_numeric(df["Long"], errors="coerce")

    df["offense_category"] = df["offense_raw"].apply(map_offense)

    # Drop rows missing essential fields before spatial join.
    missing_coord = df["lat"].isna() | df["lng"].isna()
    missing_date = df["occurred_at"].isna()
    df = df[~missing_coord & ~missing_date].copy()

    print(f"Loaded {initial_rows} rows; dropped {missing_coord.sum()} for missing coords; "
          f"dropped {missing_date.sum()} for invalid dates.")

    return df


def attach_zip_codes(df: pd.DataFrame) -> pd.DataFrame:
    """Spatially join crime points to ZIP code polygons."""
    if not GEOJSON_PATH.exists():
        raise FileNotFoundError(f"ZIP GeoJSON not found at {GEOJSON_PATH}")

    zips = gpd.read_file(GEOJSON_PATH)[["ZIP5", "geometry"]]
    zips = zips.rename(columns={"ZIP5": "zip_code"})
    zips["zip_code"] = zips["zip_code"].astype(str).str.zfill(5)

    points = gpd.GeoDataFrame(
        df,
        geometry=[Point(xy) for xy in zip(df["lng"], df["lat"])],
        crs="EPSG:4326",
    )

    joined = gpd.sjoin(points, zips, how="left", predicate="within")
    missing_zip = joined["zip_code"].isna().sum()
    if missing_zip:
        print(f"Rows without ZIP after spatial join: {missing_zip}")

    joined = joined.drop(columns=["index_right"])
    return pd.DataFrame(joined)


def write_artifacts(df: pd.DataFrame) -> None:
    """Write aggregated CSV artifacts."""
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    df_valid_zip = df.dropna(subset=["zip_code"]).copy()
    df_valid_zip["zip_code"] = df_valid_zip["zip_code"].astype(str).str.zfill(5)

    monthly = (
        df_valid_zip.groupby(["zip_code", "year", "month"])
        .size()
        .reset_index(name="incident_count")
    )
    offense_mix = (
        df_valid_zip.groupby(["zip_code", "year", "month", "offense_category"])
        .size()
        .reset_index(name="incident_count")
    )
    totals = (
        df_valid_zip.groupby("zip_code")
        .size()
        .reset_index(name="incident_total")
    )

    monthly.to_csv(ARTIFACT_DIR / "crime_monthly_zip.csv", index=False)
    offense_mix.to_csv(ARTIFACT_DIR / "crime_offense_mix.csv", index=False)
    totals.to_csv(ARTIFACT_DIR / "crime_zip_totals.csv", index=False)

    print("Wrote artifacts:")
    print(f"  {ARTIFACT_DIR / 'crime_monthly_zip.csv'} ({len(monthly)} rows)")
    print(f"  {ARTIFACT_DIR / 'crime_offense_mix.csv'} ({len(offense_mix)} rows)")
    print(f"  {ARTIFACT_DIR / 'crime_zip_totals.csv'} ({len(totals)} rows)")


def main() -> None:
    try:
        raw_df = load_raw_crime_frames()
        cleaned = clean_and_enrich(raw_df)
        with_zips = attach_zip_codes(cleaned)

        matched = with_zips.dropna(subset=["zip_code"])
        print(f"Rows after ZIP join: {len(with_zips)}; matched ZIPs: {len(matched)}")

        write_artifacts(with_zips)
    except Exception as exc:  # pragma: no cover - simple CLI runner
        print(f"Error preparing crime data: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
