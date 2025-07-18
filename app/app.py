"""Flask application for salary prediction and analytics."""

import base64
import io
import os

import joblib
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from flask import Flask, render_template, request

app = Flask(__name__)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
PROCESSED_DATA = os.path.join(BASE_DIR, "processed", "cleaned_data.csv")

# Load models and features
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

# Dropdown options
COUNTRIES = [
    "Germany", "United States of America", "India", "United Kingdom", "Other"
]
EDUCATION = [
    "Bachelor’s degree", "Master’s degree", "Post Grad", "Less than Bachelor’s"
]
EMPLOYMENT = [
    "Full-time", "Part-time", "Other"
]
MODEL_NAMES = list(MODELS.keys())

# Load analytics data once
analytics_df = pd.read_csv(PROCESSED_DATA)


@app.route("/", methods=["GET", "POST"])
def index():
    """Render the salary prediction form and display results.

    Returns:
        str: Rendered HTML template for the index page.
    """
    prediction = None
    selected_model = MODEL_NAMES[0]
    selected_country = COUNTRIES[0]
    selected_edlevel = EDUCATION[0]
    selected_employment = EMPLOYMENT[0]
    years_exp = ""

    if request.method == "POST":
        selected_model = request.form.get("model")
        selected_country = request.form.get("country")
        selected_edlevel = request.form.get("edlevel")
        selected_employment = request.form.get("employment")
        years_exp = request.form.get("experience")

        # Build input row as dict
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

        pipeline = MODELS[selected_model]
        pred = pipeline.predict(input_df)[0]
        prediction = f"{pred:,.2f}"

    return render_template(
        "index.html",
        prediction=prediction,
        countries=COUNTRIES,
        educations=EDUCATION,
        employments=EMPLOYMENT,
        models=MODEL_NAMES,
        selected_country=selected_country,
        selected_edlevel=selected_edlevel,
        selected_employment=selected_employment,
        selected_model=selected_model,
        years_exp=years_exp
    )


@app.route("/analytics")
def analytics():
    """Render the analytics page with visualizations.

    Returns:
        str: Rendered HTML template for the analytics page.
    """
    # Load processed data
    df = pd.read_csv(os.path.join(BASE_DIR, "processed", "cleaned_data.csv"))

    # Reconstruct Country, EdLevel, Employment from one-hot columns
    country_cols = [
        col for col in df.columns if col.startswith("Country_")
        ]
    edlevel_cols = [
        col for col in df.columns if col.startswith("EdLevel_")
        ]
    employment_cols = [
        col for col in df.columns if col.startswith("Employment_")
        ]

    def get_category(row, cols, prefix):
        for col in cols:
            if row[col] == 1:
                return col[len(prefix):]
        return "Unknown"

    df["Country"] = df.apply(
        lambda row: get_category(row, country_cols, "Country_"), axis=1
    )
    df["EdLevel"] = df.apply(
        lambda row: get_category(row, edlevel_cols, "EdLevel_"), axis=1
    )
    df["Employment"] = df.apply(
        lambda row: get_category(row, employment_cols, "Employment_"), axis=1
    )

    # 1. Salary distribution
    fig1, ax1 = plt.subplots(figsize=(5, 3.8))
    sns.histplot(df["ConvertedCompYearly"], bins=30, color="#1d2dfa", ax=ax1)
    ax1.set_title("Salary Distribution")
    ax1.set_xlabel("Salary (USD)")
    ax1.set_ylabel("Count")
    plt.tight_layout()
    buf1 = io.BytesIO()
    plt.savefig(buf1, format="png", bbox_inches='tight')
    buf1.seek(0)
    img1 = base64.b64encode(buf1.getvalue()).decode()
    plt.close(fig1)

    # 2. Top Countries by Avg Salary
    top_countries = (
        df.groupby("Country")["ConvertedCompYearly"]
        .mean()
        .sort_values(ascending=False)
        .head(5)
    )
    fig2, ax2 = plt.subplots(figsize=(5, 3.8))
    sns.barplot(
        x=top_countries.values,
        y=top_countries.index,
        palette="Blues_d",
        ax=ax2
    )
    ax2.set_title("Top 5 Countries by Avg Salary")
    ax2.set_xlabel("Avg Salary (USD)")
    ax2.set_ylabel("")
    plt.tight_layout()
    buf2 = io.BytesIO()
    plt.savefig(buf2, format="png", bbox_inches='tight')
    buf2.seek(0)
    img2 = base64.b64encode(buf2.getvalue()).decode()
    plt.close(fig2)

    # 3. Avg Salary by Education
    top_edu = (
        df.groupby("EdLevel")["ConvertedCompYearly"]
        .mean()
        .sort_values(ascending=False)
    )
    fig3, ax3 = plt.subplots(figsize=(5, 3.8))
    sns.barplot(x=top_edu.values, y=top_edu.index, palette="mako", ax=ax3)
    ax3.set_title("Avg Salary by Education")
    ax3.set_xlabel("Avg Salary (USD)")
    ax3.set_ylabel("")
    plt.tight_layout()
    buf3 = io.BytesIO()
    plt.savefig(buf3, format="png", bbox_inches='tight')
    buf3.seek(0)
    img3 = base64.b64encode(buf3.getvalue()).decode()
    plt.close(fig3)

    # 4. Avg Salary by Employment Type
    top_emp = (
        df.groupby("Employment")["ConvertedCompYearly"]
        .mean()
        .sort_values(ascending=False)
    )
    fig4, ax4 = plt.subplots(figsize=(5, 3.8))
    sns.barplot(x=top_emp.values, y=top_emp.index, palette="crest", ax=ax4)
    ax4.set_title("Avg Salary by Employment Type")
    ax4.set_xlabel("Avg Salary (USD)")
    ax4.set_ylabel("")
    plt.tight_layout()
    buf4 = io.BytesIO()
    plt.savefig(buf4, format="png", bbox_inches='tight')
    buf4.seek(0)
    img4 = base64.b64encode(buf4.getvalue()).decode()
    plt.close(fig4)

    return render_template(
        "analytics.html",
        salary_dist=img1,
        top_countries=img2,
        top_edu=img3,
        top_emp=img4
    )


if __name__ == "__main__":
    app.run(debug=True)
