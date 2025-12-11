Read me
Final Project YouTube Video: https://youtu.be/ZwULz597bu4

# Boston Housing & Crime Insights
> Next.js dashboards powered by FastAPI microservices for AI home valuations and neighborhood safety signals.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![React](https://img.shields.io/badge/React-19-149eca?logo=react) ![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi) ![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Status](https://img.shields.io/badge/status-active-success) ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## Overview
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

## Setup Installation

If you don't have make installed, do the following.
### Installing `make`

### macOS

```xcode-select --install```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install build-essential
```

### Windows (Git Bash)
1. Install Git for Windows: https://git-scm.com/downloads  
2. Open **Git Bash**  
3. Install `make`:
```bash
pacman -S make
```

After cloning the repository:

```bash
git clone <repository-url>
cd <project-folder>
```

To install all Python and Node dependencies and build the project, run:

```bash
make
```

## Available Make Commands

### Install dependencies only
```bash
make install
```

### Build backend and frontend
```bash
make build
```

### Clean temporary files and virtual environment
```bash
make clean
```

### Show all available targets
```bash
make help
```

---



## Features
- ZIP-focused search that evaluate pricing.
- FastAPI price service that loads a serialized ML model for instant home valuations.
- Interactive Next.js UI with charts, Leaflet maps, and responsive components.
- Local-first development: run everything with Node and Python, no containers required.

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


## Architecture
```
  User[Browser] --> Frontend[Next.js 15]
  Frontend -->|REST| PriceAPI[FastAPI Price API :8000]
  PriceAPI -->|load| Model[Trained Price Model (joblib/pkl)]
```



## Technology Stack
| Layer | Tech |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Leaflet/react-leaflet |
| Price API | FastAPI, Python 3.11+, joblib/scikit-learn artifacts |
| Tooling | npm, pip/venv, ESLint, Turbopack dev server |

## Folder Structure
```text
.
├── frontend/          # Next.js app (charts, maps, UI)
├── price-api/         # FastAPI service for price prediction (model artifacts)
└── README.md
```

## Local Development
### Prerequisites
- Node.js 20+ and npm
- Python 3.11+ with `pip` and `venv`

### 1) Clone
```bash
git clone https://github.com/HarshaBeth/Boston-Area-Price-and-Crime-Prediction.git
cd Boston-Area-Price-and-Crime-Prediction
```

### 2) Environment Variables
- Frontend (`frontend/.env.local`):
  ```env
  NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
  ```

### 3) Install & Run Services
- **Price API (FastAPI)**
  ```bash
  cd price-api
  python -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000
  ```

  You need to download the pretrained artifacts from the shared drive and place them in `backend/notebooks/`:
  - Drive folder: https://drive.google.com/drive/folders/1xpvKWYU9cxUxsiZlxglOHkv2lfV5RI2h?usp=sharing  
  - Required files:
    - `best_price_model.pkl`
    - `scaler_price_features.pkl`
    - `scaler_numeric_columns.pkl`

  Your layout should look like:
  ```text
  backend/
    notebooks/
      best_price_model.pkl
      scaler_price_features.pkl
      scaler_numeric_columns.pkl
      ... (notebooks, etc.)
  ```

- **Frontend (Next.js)**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
Open `http://localhost:3000` and the app will call the APIs via the URLs set in `.env.local`.


## Sample JSON Responses
```json
// Price prediction
{ "predicted_price": 912345.55 }

```


## Common Errors & Fixes
- **Port already in use**: change `PORT` in `.env` or stop the conflicting process.
- **Model file not found**: verify `MODEL_PATH`, `SCALER_PATH`, and `NUMERIC_COLS_PATH` point to actual artifacts.
- **Dataset path invalid**: ensure `CRIME_DATA_DIR` contains the expected CSV/JSON files.
- **CORS blocked**: update `CORS_ALLOW_ORIGINS` in API env files to include your frontend origin.
- **Env not loaded**: restart servers after editing `.env` files.


## Visualization of Data

###Price data visualizations:
<img width="1017" height="537" alt="Screenshot 2025-12-11 at 1 12 47 AM" src="https://github.com/user-attachments/assets/f3a7a520-455b-4062-8cf6-99dfb8f40b21" />
<img width="1018" height="558" alt="Screenshot 2025-12-11 at 1 13 26 AM" src="https://github.com/user-attachments/assets/5260c009-43c6-4842-8cda-d2464b2df5ad" />
<img width="1014" height="559" alt="Screenshot 2025-12-11 at 1 13 38 AM" src="https://github.com/user-attachments/assets/dfa801d7-1e59-4e47-8569-40112eeef252" />

Before modeling, we quickly view the average pricing per zipcode to understand if our model performs accordingly.
<img width="1004" height="426" alt="Screenshot 2025-12-11 at 1 13 59 AM" src="https://github.com/user-attachments/assets/28c97dbd-c6e8-4d77-8d11-0e13aee4e4bc" />

### Crime data visualizations:
<img width="1016" height="497" alt="Screenshot 2025-12-11 at 1 15 07 AM" src="https://github.com/user-attachments/assets/8c7aa939-1323-4af7-8159-d2c6688c573f" />
<img width="977" height="548" alt="Screenshot 2025-12-11 at 1 15 42 AM" src="https://github.com/user-attachments/assets/440bbb94-d0b7-4634-99f0-fe07dfce0d87" />
<img width="1015" height="547" alt="Screenshot 2025-12-11 at 1 15 55 AM" src="https://github.com/user-attachments/assets/ad4731da-00fa-461e-a07d-ec61a3e74606" />
<img width="1011" height="746" alt="Screenshot 2025-12-11 at 1 16 07 AM" src="https://github.com/user-attachments/assets/6f9aa27b-45e2-4bfe-b1e5-17edd4c2f03f" />




## Data processing and modeling
### Price prediction data processing steps:
- First, we explore our dataset and drop columns that we don't need.
- Next, we had noticed during visualization that some features were overlapping with the same data but with different names, e.g. ZIPCODE and ZIP_CODE. If we had simply removed all null values we would have lost a substantial amount of data, therefore, we saved crucial data by merging features.
- Then, we further explored the features and removed features that would be correlated to others, such as, bedrooms and total rooms. These 2 are related which is not ideal when training our models.
- Lastly, before giving our data to the model, we scaled the data, which is an important step.

  ### Modeling the price prediction model:
  - Initially we tested a linear regression model with polynomial curve fitting. Next, we trained multiple models to ensure we find the best results.
  
  ```
    models = {
    "Linear Regression": LinearRegression(),
    "Ridge": Ridge(alpha=1.0),
    "Lasso": Lasso(alpha=0.001),
    "Random Forest": RandomForestRegressor(n_estimators=500, random_state=42),
    "Gradient Boosting": GradientBoostingRegressor(random_state=42)
      }
  ```
  ```
   xgb_model = XGBRegressor(
    n_estimators=400,
    learning_rate=0.05,
    max_depth=8,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="reg:squarederror",
    n_jobs=-1)

```
  lgbm_model = LGBMRegressor(
    n_estimators=600,
    learning_rate=0.05,
    num_leaves=64,
    subsample=0.8,
    colsample_bytree=0.8)
```



- Next, we chose the evaluation metrics to be RMSE and R-squared.

### RandomForestRegressor price model (deployed)

For serving price predictions through the FastAPI backend, we use a **RandomForestRegressor** model from scikit-learn.

- **What it is**  
  Random Forest is an ensemble method: instead of a single decision tree, it trains many trees on slightly different samples of the data and **averages their predictions**. Each tree is a weak learner, but together they form a strong, robust model that generalizes well.

- **What it uses in this project**  
  The deployed RandomForestRegressor is trained on cleaned and engineered Boston property data. Input features include:
  - Location and size: `ZIPCODE`, `GROSS_AREA`, `LIVING_AREA`
  - Rooms and structure: `BED_RMS`, `FULL_BTH`, `HLF_BTH`, `NUM_PARKING`, `KITCHENS`, `FIREPLACES`
  - Encoded property characteristics such as `KITCHEN_TYPE`, `HEAT_TYPE`, `AC_TYPE`
  Before training, numeric features are **scaled** so that the model sees normalized values instead of raw magnitudes.

- **How it predicts a price**  
  1. During training, each tree learns a set of if–then splits (e.g., “if LIVING_AREA > X and ZIPCODE in Y, predict around Z dollars”) on a bootstrap sample of the data and a random subset of features at each split.  
  2. At inference time, a new property goes down every tree; each tree outputs its own price estimate.  
  3. The forest takes the **average of all tree outputs** as the final predicted price that is returned by the API.

- **Why we kept RandomForestRegressor**  
  In our experiments, RandomForestRegressor achieved the best R-squared score (~0.97) compared to linear models and gradient-boosted variants. It handles non-linear relationships, feature interactions, and outliers well, which fits this tabular housing dataset.

### Crime data model
- As mentioned in the youtube video, the dataset for crime did not match well enough with the price dataset. The primary keys were mismatched, crime dataset uses 'district' and price dataset uses 'zipcode'. Therefore, we haven't modeled the crime dataset; however, we have explored the dataset thoroughly enough to give anyone who looks at the repo a detailed understanding of the crime dataset per district.


## Results
- We got the highest R-squared score from the Random Forest Regressor, 0.97. This means the model was able to capture 97% of the variance in the data.
- Below is a plot that shows the actual versus predicted value:
<img width="584" height="582" alt="Screenshot 2025-12-11 at 1 26 50 AM" src="https://github.com/user-attachments/assets/85963736-85e7-4120-9c3d-7bcfa0cb7a34" />




## Contributing
- Fork the repo, create a feature branch, and keep PRs focused.
- Add/adjust tests or sample responses when changing endpoints.
- Run formatters/lint: `npm run lint` (frontend) and your preferred Python formatter (e.g., `ruff`/`black`) for APIs.
- Include a brief summary and screenshots for UI changes in your PR.

## Credits & Acknowledgements
- Boston crime data: Analyze Boston (public datasets).
- Boston property assessments: data.boston.gov.
- Leaflet/OpenStreetMap for mapping tiles and GeoJSON rendering.
- Contributors and the Boston open data community.

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
