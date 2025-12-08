# backend_app.py
# -------------------------------------------------
# Flask backend for dynamic car booking price prediction
# -------------------------------------------------

from flask import Flask, request, jsonify
from datetime import datetime
import pandas as pd
import numpy as np
import joblib, os
import googlemaps
from dotenv import load_dotenv
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from flask_cors import CORS

# --- Load environment ---
load_dotenv()
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

if not API_KEY:
    print("⚠ GOOGLE_MAPS_API_KEY not found → Using fallback distance")
    gmaps = None
else:
    gmaps = googlemaps.Client(key=API_KEY)
    print("Google Maps client initialized.")

MODEL_PATH = "car_booking_model.pkl"

# -------------------------------------------------
# Distance Function
# -------------------------------------------------
def get_distance_km(start_location, drop_location):
    print(f"Calculating Distance: {start_location} -> {drop_location}")

    if not start_location or not drop_location:
        return 0.0

    # If start and end are the same, assume local usage (min 30km package)
    if start_location.strip().lower() == drop_location.strip().lower():
        return 30.0

    if gmaps is None:
        return 150.0 # Fallback default

    try:
        directions = gmaps.directions(start_location, drop_location, mode="driving")
        if not directions:
            return 150.0
        
        km = round(directions[0]['legs'][0]['distance']['value'] / 1000, 2)
        print("Distance (km):", km)
        return km
    except Exception as e:
        print("❌ Maps Error:", e)
        return 150.0

# -------------------------------------------------
# Build & Train Model
# -------------------------------------------------
def build_training_data(n_rows=1500):
    np.random.seed(42)
    brands = ["Tata", "Toyota", "Ford", "Honda", "Hyundai", "Jeep"]
    categories = ["SUV", "Sedan", "Hatchback", "Van"]
    fuel_types = ["Petrol", "Diesel", "Hybrid", "Electric"]
    transmissions = ["Manual", "Automatic", "Semi-Automatic"]
    demand_factors = ["low", "medium", "high"]

    rows = []
    for _ in range(n_rows):
        brand = np.random.choice(brands)
        category = np.random.choice(categories)
        fuel = np.random.choice(fuel_types)
        transmission = np.random.choice(transmissions)
        demand = np.random.choice(demand_factors, p=[0.3, 0.5, 0.2])
        year = np.random.randint(2015, 2025)
        seating = np.random.choice([2, 4, 5, 7])
        rental_days = np.random.randint(1, 30)
        base_daily_rate = np.random.randint(300, 1200)

        is_one_way = np.random.choice([0, 1], p=[0.6, 0.4])
        drop_km = 0 if is_one_way == 0 else np.random.randint(10, 3000)
        per_km_fee = np.random.uniform(8, 20)

        price = base_daily_rate * rental_days + drop_km * per_km_fee
        if drop_km > 800: price *= 1.25

        rows.append({
            "brand": brand, "year": year, "category": category,
            "seating_capacity": seating, "fuel_type": fuel,
            "transmission": transmission, "demand_factor": demand,
            "rental_duration_days": rental_days, "drop_off_distance_km": drop_km,
            "target_price": round(price, 2)
        })
    return pd.DataFrame(rows)

def train_model():
    df = build_training_data()
    X = df.drop(columns=["target_price"])
    y = df["target_price"]

    preprocessor = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), ["brand", "category", "fuel_type", "transmission", "demand_factor"]),
        ("num", "passthrough", ["year", "seating_capacity", "rental_duration_days", "drop_off_distance_km"])
    ])

    model = Pipeline([
        ("pre", preprocessor),
        ("rf", RandomForestRegressor(n_estimators=100, random_state=42)),
    ])

    model.fit(X, y)
    joblib.dump(model, MODEL_PATH)
    print("✔ Model trained & saved.")
    return model

# Load Model
if os.path.exists(MODEL_PATH):
    pipe = joblib.load(MODEL_PATH)
    print("✔ Model loaded.")
else:
    pipe = train_model()

# -------------------------------------------------
# Prediction Logic
# -------------------------------------------------
def predict_booking_price(data):
    # 1. Calculate Days
    start_date = datetime.strptime(data["start_date"], "%Y-%m-%d")
    end_date = datetime.strptime(data["end_date"], "%Y-%m-%d")
    rental_days = (end_date - start_date).days
    if rental_days < 1: rental_days = 1
    
    # 2. Calculate Distance
    distance = get_distance_km(data["start_location"], data["return_location"])

    # 3. AI Prediction
    ml_input = pd.DataFrame([{
        "brand": data["brand"], "year": data["year"], "category": data["category"],
        "seating_capacity": data["seating_capacity"], "fuel_type": data["fuel_type"],
        "transmission": data["transmission"], "demand_factor": data.get("demand_factor", "medium"),
        "rental_duration_days": rental_days, "drop_off_distance_km": distance
    }])
    
    ml_price = float(pipe.predict(ml_input)[0])

    # 4. Final Calculation (AI Price + Driver/Distance adjustments)
    # We allow the AI price to be the baseline, but ensure minimum costs are covered
    final_price = ml_price 
    
    # Ensure minimums
    if final_price < (500 * rental_days):
        final_price = 500 * rental_days

    return round(final_price, 2)

# -------------------------------------------------
# Flask Routes
# -------------------------------------------------
app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {"message": "Car Rental AI Running"}

@app.route("/predict_price", methods=["POST"])
def predict_price():
    try:
        incoming = request.json or {}
        required = ["brand", "category", "start_date", "end_date", "start_location", "return_location"]
        if any(f not in incoming for f in required):
            return {"error": "Missing required fields"}, 400

        price = predict_booking_price(incoming)
        return jsonify({"predicted_price": price})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # HOST=0.0.0.0 is REQUIRED for Render
    app.run(host="0.0.0.0", port=5000)