# Boston Neighborhood Price and Crime Prediction

## Description

<p align="justify"> Boston, MA, is a lively city with roughly 45 million people entering the city every year. This includes tourists, new residents, students, and others. Given the rising population of Boston, it is imperative to have a secure system for newcomers to understand the city better. This project aims to assist people learn crucial information about their potential residency, based on factors like crime rate and housing rent.</p>

## Proposal

### Clear Goals

1. Enabling a search-based system that displays intended information based on the neighborhood
2. Building a UI for this search-based system
3. Predict the crime rate and type of crime based on the searched neighborhood
4. Predict the overall rent in the neighborhood based on house features and crime rate
5. Providing users valuable information on residencies to be able to make evaluated decisions

### Data Collection

1. Data for Boston crime rates has to be collected
2. Data for Boston housing rents per area has to be collected
3. Datasets can be collected through Kaggle, Analyze Boston, and the U.S. Census
   The links to the dataset, up until the year 2025, are as follows:

- https://data.boston.gov/dataset/crime-incident-reports-august-2015-to-date-source-new-system
- https://data.boston.gov/dataset/property-assessment

### Modeling the project

1. Price prediction and crime prediction are regression tasks, hence, we will implement Linear Regression, Logistic Regression, and Random Forest Regression.
2. These models will be tested on our dataset to get the most suitable model.

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

This project combines multiple years of crime records in Boston with housing price datasets. We perform preprocessing to clean the data and generate visualizations to better understand trends, distributions, and relationships.

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
- **Next Steps**: Model building can leverage these cleaned datasets, focusing on time, location, and property attributes to predict outcomes (crime likelihood or property prices).

---

## Notes
- Anomalies like spikes in crime counts (June/July 2025) need to be excluded from modeling to avoid misleading results.  
- Categories like `"Other"` in crime types or extreme rare counts in housing data were excluded to improve model performance.  
- Visualizations provide a solid understanding of trends before applying machine learning models.
