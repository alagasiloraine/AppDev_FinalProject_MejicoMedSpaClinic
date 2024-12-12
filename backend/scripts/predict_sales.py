import sys
import json
import joblib
import numpy as np
from datetime import datetime, timedelta

# Load the model
model = joblib.load('model/sales_prediction_model.joblib')

# Generate predictions for the next 12 months
def generate_monthly_predictions(start_date, initial_prediction):
  predictions = []
  current_date = start_date
  current_prediction = initial_prediction

  for i in range(12):
      predictions.append({
          'year': current_date.year,
          'month': current_date.month,
          'predicted_sales': round(current_prediction)
      })

      # Simple logic to vary predictions
      current_prediction *= (1 + (np.random.random() - 0.5) * 0.1)  # +/- 5% variation

      current_date += timedelta(days=32)
      current_date = current_date.replace(day=1)  # First day of next month

  return predictions

current_date = datetime.now()
initial_prediction = model.predict([[current_date.month, current_date.year, 1, 1, 0.5]])[0]
monthly_predictions = generate_monthly_predictions(current_date, initial_prediction)

# Prepare the response
response = {
  'nextMonthPrediction': round(initial_prediction),
  'monthlyPredictions': monthly_predictions
}

# Print the JSON response
print(json.dumps(response))