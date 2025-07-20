"""Flask application for salary prediction and analytics."""

import os

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
PROCESSED_DATA = os.path.join(BASE_DIR, "..", "processed", "cleaned_data.csv")

MODELS = {
    "Random Forest": joblib.load(
        os.path.join(MODELS_DIR, "rf_pipeline.pkl")
    ),
    "Linear Regression": joblib.load(
        os.path.join(MODELS_DIR, "lr_pipeline.pkl")
    ),
    "XGBoost": joblib.load(
        os.path.join(MODELS_DIR, "xgb_pipeline.pkl")
    ),
}
FEATURES = joblib.load(os.path.join(MODELS_DIR, "features.pkl"))

COUNTRIES = [
    "Germany",
    "United States of America",
    "India",
    "United Kingdom",
    "Other"
]
EDUCATION = [
    "Bachelor’s degree",
    "Master’s degree",
    "Post Grad",
    "Less than Bachelor’s"
]
EMPLOYMENT = ["Full-time", "Part-time", "Other"]


@app.route('/')
def dashboard():
    """Render the dashboard page with statistics and filters.

    Returns:
        str: Rendered HTML template for the dashboard.
    """
    df = pd.read_csv(PROCESSED_DATA)
    stats = {
        'total_records': len(df),
        'avg_salary': int(df["ConvertedCompYearly"].mean()),
        'num_countries': df[
            [c for c in df.columns if c.startswith("Country_")]
        ].sum().sum(),
        'num_models': len(MODELS),
    }
    return render_template(
        'dashboard.html',
        stats=stats,
        countries=COUNTRIES,
        educations=EDUCATION,
        employments=EMPLOYMENT,
        models=list(MODELS.keys())
    )


@app.route('/api/ml-prediction', methods=['POST'])
def ml_prediction():
    """Make a machine learning prediction based on user input.

    Returns:
        dict: Prediction results and input data.
    """
    data = request.json
    model_name = data.get("model", "Random Forest")
    selected_country = data.get("country")
    selected_edlevel = data.get("education")
    selected_employment = data.get("employment")
    years_exp = data.get("experience")

    input_dict = {
        "YearsCodePro": float(years_exp) if years_exp else 0,
    }
    for country in COUNTRIES:
        input_dict[f"Country_{country}"] = (
            1 if selected_country == country else 0
        )
    for ed in EDUCATION:
        input_dict[f"EdLevel_{ed}"] = (
            1 if selected_edlevel == ed else 0
        )
    for emp in EMPLOYMENT:
        input_dict[f"Employment_{emp}"] = (
            1 if selected_employment == emp else 0
        )
    for col in FEATURES:
        if col not in input_dict:
            input_dict[col] = 0
    input_df = pd.DataFrame([input_dict])[FEATURES]
    pipeline = MODELS[model_name]
    pred = pipeline.predict(input_df)[0]
    return jsonify({
        "prediction": round(float(pred), 2),
        "model": model_name,
        "inputs": data
    })


@app.route('/api/chart-data/<chart_type>')
def get_chart_data(chart_type):
    """Get data for a specific chart type.

    Args:
        chart_type (str): The type of chart to retrieve data for.

    Returns:
        dict: The chart data.
    """
    df = pd.read_csv(PROCESSED_DATA)
    if chart_type == 'salary_distribution':
        hist, bin_edges = np.histogram(df["ConvertedCompYearly"], bins=30)
        ranges = [
            f"{int(bin_edges[i])}-{int(bin_edges[i+1])}"
            for i in range(len(bin_edges) - 1)
        ]
        return jsonify({
            "labels": ranges,
            "datasets": [
                {
                    "label": "Salary",
                    "data": hist.tolist()
                }
            ]
        })
    elif chart_type == 'top_countries':
        country_cols = [
            col for col in df.columns
            if col.startswith("Country_")
        ]

        def get_country(row):
            for col in country_cols:
                if row[col] == 1:
                    return col.replace("Country_", "")
            return "Other"
        df["Country"] = df.apply(get_country, axis=1)
        top_countries = (
            df.groupby("Country")["ConvertedCompYearly"]
            .mean()
            .sort_values(ascending=False)
            .head(5)
        )
        return jsonify({
            "labels": top_countries.index.tolist(),
            "datasets": [
                {
                    "label": "Avg Salary",
                    "data": [round(float(x), 2) for x in top_countries.values]
                }
            ]
        })
    elif chart_type == 'education_salary':
        edlevel_cols = [
            col for col in df.columns if col.startswith("EdLevel_")
        ]

        def get_ed(row):
            for col in edlevel_cols:
                if row[col] == 1:
                    return col.replace("EdLevel_", "")
            return "Other"
        df["EdLevel"] = df.apply(get_ed, axis=1)
        top_edu = (
            df.groupby("EdLevel")["ConvertedCompYearly"]
            .mean()
            .sort_values(ascending=False)
        )
        return jsonify({
            "labels": top_edu.index.tolist(),
            "datasets": [
                {
                    "label": "Avg Salary",
                    "data": [round(float(x), 2) for x in top_edu.values]
                }
            ]
        })
    elif chart_type == 'employment_salary':
        employment_cols = [
            col for col in df.columns if col.startswith("Employment_")
        ]

        def get_emp(row):
            for col in employment_cols:
                if row[col] == 1:
                    return col.replace("Employment_", "")
            return "Other"
        df["Employment"] = df.apply(get_emp, axis=1)
        top_emp = (
            df.groupby("Employment")["ConvertedCompYearly"]
            .mean()
            .sort_values(ascending=False)
        )
        return jsonify({
            "labels": top_emp.index.tolist(),
            "datasets": [
                {
                    "label": "Avg Salary",
                    "data": [round(float(x), 2) for x in top_emp.values]
                }
            ]
        })
    return jsonify({"error": "Invalid chart type"}), 400


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
