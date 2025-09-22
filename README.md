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

