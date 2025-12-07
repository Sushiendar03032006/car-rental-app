from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime
import joblib, os
import googlemaps
from dotenv import load_dotenv

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor

load_dotenv()
app = Flask(__name__)
CORS(app) # Allow all origins

API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
gmaps = googlemaps.Client(key=API_KEY) if API_KEY else None
MODEL_PATH = "car_booking_model.pkl"

# --- Helpers & Model Training (Same as your provided code) ---
# I am condensing the training logic for brevity, assuming you keep the logic you provided.

def get_distance_km(start, end):
    if not gmaps or start.lower() == end.lower(): return 100.0
    try:
        res = gmaps.directions(start, end, mode="driving")
        return res[0]["legs"][0]["distance"]["value"] / 1000
    except: return 100.0

def train_model():
    # ... (Insert your build_training_data function here) ...
    # For now, let's assume the model exists or you run the training script once.
    pass 

# Load Model
if os.path.exists(MODEL_PATH):
    pipe = joblib.load(MODEL_PATH)
else:
    print("⚠️ Model not found. Please run training logic.")
    pipe = None

@app.route("/predict_price", methods=["POST"])
def predict_price():
    try:
        if not pipe: return jsonify({"error": "Model not loaded"}), 500
        
        incoming = request.json
        start_date = datetime.strptime(incoming.get("startDate"), "%Y-%m-%d")
        end_date = datetime.strptime(incoming.get("endDate"), "%Y-%m-%d")
        
        # Calculate days
        days = (end_date - start_date).days
        days = 1 if days < 1 else days

        # Calculate distance
        dist = get_distance_km(incoming.get("startLocation"), incoming.get("dropLocation"))

        # Prepare DataFrame
        data = {
            "brand": incoming.get("brand"),
            "year": incoming.get("year"),
            "category": incoming.get("category"),
            "seating_capacity": incoming.get("seatingCapacity"),
            "fuel_type": incoming.get("fuelType"),
            "transmission": incoming.get("transmission"),
            "demand_factor": incoming.get("demandFactor", "medium"),
            "rental_duration_days": days,
            "drop_off_distance_km": dist
        }
        
        df = pd.DataFrame([data])
        price = pipe.predict(df)[0]
        
        return jsonify({
            "predicted_price": round(price, 2),
            "total_km": dist,
            "days": days
        })

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)