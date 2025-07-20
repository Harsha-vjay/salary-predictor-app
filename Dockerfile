FROM python:3.10-slim

WORKDIR /app

# Install required tools for downloading and unzipping files
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/*

# Download and unzip the Stack Overflow survey data
RUN mkdir -p data
RUN curl -L -o data/survey.zip "https://survey.stackoverflow.co/datasets/stack-overflow-developer-survey-2023.zip"
RUN unzip data/survey.zip -d data
RUN rm data/survey.zip

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app/app.py"]