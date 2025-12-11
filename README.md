# Boston Neighborhood Price and Crime Prediction

## Description

<p align="justify"> Boston, MA, is a lively city with roughly 45 million people entering the city every year. This includes tourists, new residents, students, and others. Given the rising population of Boston, it is imperative to have a secure system for newcomers to understand the city better. This project aims to assist people learn crucial information about their potential residency, based on factors like crime rate and housing rent.</p>

## 🚀 Quickstart (Docker + Makefile, recommended)

### Prerequisites
- Docker Desktop (or Docker Engine) installed and running — download at https://www.docker.com/products/docker-desktop/
- `make` available on your system (macOS/Linux ship it; on Windows use WSL or Git Bash; GNU Make info: https://www.gnu.org/software/make/)

### First-time setup on a new machine
```bash
git clone <repo-url>
cd Boston-Area-Price-and-Crime-Prediction

make setup-all
```
What `make setup-all` does:
- Builds Docker images for the database, ETL, price API, crime API, and frontend
- Starts PostgreSQL and runs the ETL container to apply schema + load crime aggregates

### Starting the app
```bash
make start
```
This starts Postgres, the price API (FastAPI on port 8000), the crime API (Express on port 4000), and the frontend (Next.js on port 3000). Open http://localhost:3000 in your browser.

### Stopping the app
```bash
make stop
```
Stops all containers but keeps the database volume and data.

### Reset everything (optional)
```bash
make clean
```
Stops containers and removes volumes (wipes the DB). Run `make setup-all` again to rebuild and reload data.

## Proposal

### Clear Goals

1. Enabling a search-based system that displays intended information based on the neighborhood
2. Building a UI for this search-based system
3. Crime & Safety visualization using historical Boston crime data: show a 5-year trend, recent offense mix, and incidents-per-1,000 “safety context” comparing the selected ZIP to the city average and other high-incident ZIPs (descriptive, not predictive)
4. Predict the overall rent in the neighborhood based on house features (with optional contextual historical crime statistics)
5. Providing users valuable information on residencies to be able to make evaluated decisions

### Data Collection

1. Data for Boston crime rates has to be collected
2. Data for Boston housing rents per area has to be collected
3. Datasets can be collected through Kaggle, Analyze Boston, and the U.S. Census
   The links to the dataset, up until the year 2025, are as follows:

- https://data.boston.gov/dataset/crime-incident-reports-august-2015-to-date-source-new-system
- https://data.boston.gov/dataset/property-assessment

### Modeling the project

1. Price prediction is a regression task; for crime we rely on descriptive aggregates and visualizations rather than predictive safety scores.
2. Price models will be tested on our dataset to get the most suitable model.

### Data Visualization

1. Time-series plot, understanding the crime rate over time
2. Time-of-day heatmap, helps understand which hours are safe/risky
3. Weekly crime bar plot (Monday-Sunday)
4. Correlation with time and crime type
5. Crime type frequencies
6. Scatter plot exploring features vs the house value
7. Analyze the influence of a house value being near the Charles River
8. Box plots for each feature to check for outliers and skewed data
9. Comparing house values based on different locations

### Test Plan

<p align="justify">The project is built on an aggregation of the Boston Crime Dataset and the Boston Housing Dataset. These are detailed datasets up until 2025 that are effective in providing realistic predictions. The datasets will be divided into training and testing sets, 80% and 20% respectively.</p>



# Crime and Housing Price Data Analysis

Link to YT explanation: https://youtu.be/Ly8c4S4XE5I

This project combines multiple years of crime records in Boston with housing price datasets. We perform preprocessing to clean the data and generate visualizations to better understand trends, distributions, and relationships.

🔍 **Crime & Safety panel (historical visualization, not predictive)**
- Uses past Boston crime data to compute and visualize:
  - 5-year monthly crime trend for the selected ZIP
  - Offense mix over the last 12 months (e.g., property vs. violent vs. other)
  - A “safety context” comparing the selected ZIP’s incidents-per-1,000 residents over the last 12 months to the city average and a couple of other high-incident ZIPs
- Charts are descriptive only; they are based purely on historical records and are intended as informational visualizations, not risk ratings or guarantees.

---

## Data Preprocessing

### Crime Data
- We merged datasets from 2015–2023, resulting in **~875,000 rows**.
- Null values were present in important columns (`OFFENSE_CODE_GROUP`, `UCR_PART`, `DISTRICT`, `STREET`) and were dropped to ensure consistency.
- Created two subsets:  
  - **`predict_offense_df`**: Used for crime type, district, and street analysis.  
  - **`predict_offense_time_df`**: Used for time-based crime analysis (hour of day, district, street).
- After cleaning, the datasets were reduced to manageable, non-null records.

### Housing Price Data
- We combined 10 fiscal year datasets (2015–2025) with **~1.5M rows** and **139 columns**.
- Key cleaning step: Dropped rows missing `TOTAL_VALUE` (property value), leaving **~528K records**.
- Explored specific features like `KITCHENS`, `FIREPLACES`, `HEAT_SYSTEM`, `GROSS_TAX`, etc., to evaluate usefulness for modeling.
- Removed underrepresented classes (e.g., extreme counts of `BED_RMS` or `FULL_BTH`) to balance the dataset.

---

## Visualizations and Insights

### Crime Data
1. **Crime Rate Over Time (Line Chart)**  
   - Shows monthly crime counts from 2015–2018.  
   - Noticeable seasonal fluctuations — crime tends to increase during summer months.  
   - Sharp spikes may indicate reporting or data collection issues.

2. **Heatmap (District vs Hour of Day)**  
   - Displays when and where crimes occur most often.  
   - Hotspots are visible in districts like **B2, C11, D4**.  
   - Crimes peak in afternoon/evening hours (around 3–8 PM).

3. **Weekly Crime Distribution (Bar Chart)**  
   - Crimes are fairly consistent Monday–Friday, with a slight peak on **Friday**.  
   - Drop observed on **Sunday**, indicating fewer reported incidents.

4. **Hourly Distribution of Top 5 Crime Types**  
   - Top crimes include *Larceny, Motor Vehicle Accident Response, Medical Assistance, Investigate Person*.  
   - Most frequent during the day (morning to evening hours).  
   - Evening time sees more incidents across all categories.

5. **Top 20 Crime Types (Bar Chart)**  
   - Most common: **Motor Vehicle Accident Response, Larceny, Medical Assistance**.  
   - Categories like *Other* are less meaningful for prediction and can be excluded.  
   - Helps identify which crime categories dominate city records.

---

### Housing Price Data
1. **House Value by Land Use (Boxplot)**  
   - Land use codes (R1, R2, R3, etc.) show distinct distributions of house values.  
   - Residential zones (R2, R3) cluster higher compared to mixed or commercial zones.  
   - Outliers suggest some properties are disproportionately high in value.

2. **House Value by ZIP Code (Boxplot)**  
   - Top 10 ZIP codes analyzed.  
   - Certain ZIP codes consistently show higher median property values.  
   - Outliers again suggest premium properties in certain areas.

3. **Distributions of Numeric Features (Histograms)**  
   - Features like `GROSS_AREA`, `LIVING_AREA`, and `YR_REMODEL` have skewed distributions.  
   - Most properties fall into typical ranges (e.g., ~2,000 sq. ft. gross area).  
   - Log or scaling transformations may be useful for modeling.

4. **Average House Value by ZIP Code (Bar Chart)**  
   - Clear differences across ZIP codes, with some areas like **2136, 2132** showing the highest averages.  
   - Useful for understanding regional price patterns.  

---

## Preliminary Results

- **Crime Data**: Clear temporal and spatial patterns observed. Crimes peak in the summer and evenings. Certain districts consistently have higher counts.  
- **Housing Price Data**: Strong regional variation in property values. Certain features (`ZIPCODE`, `LU`, `BED_RMS`, `FULL_BTH`) show potential predictive power.  
- **Next Steps**: Model building focuses on property price prediction; crime visualizations remain descriptive summaries of historical records.

---

## Notes
- Anomalies like spikes in crime counts (June/July 2025) need to be excluded from modeling to avoid misleading results.  
- Categories like `"Other"` in crime types or extreme rare counts in housing data were excluded to improve model performance.  
- Visualizations provide a solid understanding of trends before applying machine learning models.

## 🛠️ Advanced: Manual local dev (without Docker)

Note: This path is mainly for contributors who want to run everything directly on their machine. For most users, the Docker + Makefile quickstart above is recommended.

1. Backend (price API & scripts)
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```
2. Frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Crime ETL (requires GeoPandas deps)
   ```bash
   source .venv/bin/activate
   python backend/scripts/prepare_crime_data.py
   CRIME_DB_URL=postgresql://user:pass@localhost:5432/boston_crime python backend/scripts/load_crime_to_postgres.py
   ```
