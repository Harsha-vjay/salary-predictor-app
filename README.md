# Developer Salary Dashboard

A web application to analyze and visualize the 2023 Stack Overflow Developer Survey, built with Flask and Docker. This dashboard provides interactive insights into developer salaries across a variety of factors such as country, experience, and technology stack.

## Features

- Uploads and processes the latest Stack Overflow Developer Survey data
- Interactive data visualizations (salary by country, role, experience, etc.)
- Predictive salary estimation based on user input
- Dockerized for easy deployment
- Automated data download for large files

## Demo

[Live Demo](https://salary-predictor-app.onrender.com/)

## Table of Contents

- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

## Project Structure
/app
    /static
        css/
            style.css
        js/
            dashboard.js
    /templates
        base.html
        dashboard.html
    app.py
/data
	survey_results_public.csv
/models
    features.pkl
    rf_pipeline.pkl
    lr_pipeline.pkl
    xgb_pipeline.pkl
/notebook
	exploration.ipynb
	modelling.ipynb
/processed
    cleaned_data.csv
	actual_vs_predicted.csv
	model_results.csv
/venv
.dockerignore
.gitignore
Dockerfile
README.md
requirements.txt

- **app.py**: Main Flask application
- **Dockerfile**: Deployment instructions
- **requirements.txt**: Python dependencies
- **data/**: Stores the survey dataset
- **static/**: Static assets (CSS, JS)
- **templates/**: HTML templates


## Installation

1. **Clone the repo:**
    ```sh
    git clone https://github.com/Harsha-vjay/salary-predictor-app.git
    cd salary-predictor-app
    ```

2. **(Optional) Create a virtual environment:**
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. **Install dependencies:**
    ```sh
    pip install -r requirements.txt
    ```

4. **Download the dataset manually (if not using Docker):**
    - Download from [Stack Overflow Survey 2023](https://survey.stackoverflow.co/datasets/stack-overflow-developer-survey-2023.zip)
    - Extract `survey_results_public.csv` into the `data/` directory


## Running Locally

```sh
python app.py
```
- App will run on http://localhost:5000


### Running with Docker

```sh
docker build -t salary-dashboard .
docker run -p 5000:5000 salary-dashboard
```

- The dataset will be downloaded automatically during the Docker build.

## Deployment
This app can be easily deployed on Render or any platform supporting Docker.

## Usage
Navigate to the dashboard
Explore salary trends by country, experience, and more
Use the salary predictor tool to estimate your developer salary

## Tech Stack
Backend: Python, Flask, Pandas
Frontend: HTML, CSS, Bootstrap, Chart.js/Plotly

### Deployment: 
- Docker, Render

### Data: 
- Stack Overflow Developer Survey 2024

## Contributing
Pull requests and issues are welcome! Please open an issue first to discuss what you would like to change.

License
[MIT License](https://mit-license.org/)



Credits:

Stack Overflow Developer Survey dataset
Harsha Vijaya Kumar
