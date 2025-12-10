"""Load prepared crime artifacts into Postgres.

Run from project root, e.g.:

    CRIME_DB_URL=postgresql://user:pass@host:5432/dbname \\
        python backend/scripts/load_crime_to_postgres.py
"""

import os
import sys
from pathlib import Path

import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch


REPO_ROOT = Path(__file__).resolve().parents[2]
ARTIFACT_DIR = REPO_ROOT / "backend" / "artifacts" / "crime"


def load_csvs() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Read artifact CSVs into DataFrames."""
    monthly_df = pd.read_csv(ARTIFACT_DIR / "crime_monthly_zip.csv")
    offense_df = pd.read_csv(ARTIFACT_DIR / "crime_offense_mix.csv")
    totals_df = pd.read_csv(ARTIFACT_DIR / "crime_zip_totals.csv")
    return monthly_df, offense_df, totals_df


def truncate_tables(cur) -> None:
    cur.execute("TRUNCATE crime_monthly_zip;")
    cur.execute("TRUNCATE crime_offense_mix;")
    cur.execute("TRUNCATE crime_zip_population;")


def insert_monthly(cur, monthly_df: pd.DataFrame) -> int:
    records = [
        (str(r.zip_code).zfill(5), int(r.year), int(r.month), int(r.incident_count))
        for r in monthly_df.itertuples(index=False)
    ]
    execute_batch(
        cur,
        """
        INSERT INTO crime_monthly_zip (zip_code, year, month, incident_count)
        VALUES (%s, %s, %s, %s)
        """,
        records,
        page_size=1000,
    )
    return len(records)


def insert_offense(cur, offense_df: pd.DataFrame) -> int:
    records = [
        (
            str(r.zip_code).zfill(5),
            int(r.year),
            int(r.month),
            str(r.offense_category),
            int(r.incident_count),
        )
        for r in offense_df.itertuples(index=False)
    ]
    execute_batch(
        cur,
        """
        INSERT INTO crime_offense_mix
            (zip_code, year, month, offense_category, incident_count)
        VALUES (%s, %s, %s, %s, %s)
        """,
        records,
        page_size=1000,
    )
    return len(records)


def insert_population(cur, totals_df: pd.DataFrame) -> int:
    # Seed population as 0 for now; source marks placeholder origin.
    records = [
        (str(r.zip_code).zfill(5), 0, "placeholder_incident_totals_seed")
        for r in totals_df.itertuples(index=False)
    ]
    execute_batch(
        cur,
        """
        INSERT INTO crime_zip_population (zip_code, population, source)
        VALUES (%s, %s, %s)
        """,
        records,
        page_size=1000,
    )
    return len(records)


def main() -> None:
    db_url = os.getenv("CRIME_DB_URL")
    if not db_url:
        print("CRIME_DB_URL is required, e.g. postgresql://user:pass@host:5432/dbname")
        sys.exit(1)

    try:
        monthly_df, offense_df, totals_df = load_csvs()
    except Exception as exc:
        print(f"Failed to read artifacts from {ARTIFACT_DIR}: {exc}")
        sys.exit(1)

    conn = None
    try:
        conn = psycopg2.connect(db_url)
        with conn:
            with conn.cursor() as cur:
                truncate_tables(cur)

                m_rows = insert_monthly(cur, monthly_df)
                o_rows = insert_offense(cur, offense_df)
                p_rows = insert_population(cur, totals_df)

        print(f"Loaded {m_rows} rows into crime_monthly_zip")
        print(f"Loaded {o_rows} rows into crime_offense_mix")
        print(f"Loaded {p_rows} rows into crime_zip_population")
    except Exception as exc:
        if conn:
            conn.rollback()
        print(f"Error loading data into Postgres: {exc}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    main()
