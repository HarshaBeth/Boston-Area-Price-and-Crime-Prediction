-- Schema for crime aggregates used by the crime API.
-- Apply manually, e.g.:
--   psql "$CRIME_DB_URL" -f backend/crime_db/schema.sql

CREATE TABLE IF NOT EXISTS crime_monthly_zip (
    id SERIAL PRIMARY KEY,
    zip_code VARCHAR(5) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    incident_count INT NOT NULL,
    UNIQUE (zip_code, year, month)
);

CREATE TABLE IF NOT EXISTS crime_offense_mix (
    id SERIAL PRIMARY KEY,
    zip_code VARCHAR(5) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    offense_category VARCHAR(50) NOT NULL,
    incident_count INT NOT NULL,
    UNIQUE (zip_code, year, month, offense_category)
);

CREATE TABLE IF NOT EXISTS crime_zip_population (
    zip_code VARCHAR(5) PRIMARY KEY,
    population INT NOT NULL,
    source TEXT
);

CREATE INDEX IF NOT EXISTS idx_crime_monthly_zip_zip_year_month
    ON crime_monthly_zip (zip_code, year, month);

CREATE INDEX IF NOT EXISTS idx_crime_offense_mix_zip_year_month
    ON crime_offense_mix (zip_code, year, month);
