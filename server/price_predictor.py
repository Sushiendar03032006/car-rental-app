# backend_app.py
# -------------------------------------------------
# Flask backend for dynamic car booking price prediction
# Clean version with important logs only
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
# Distance Function (Clean Logs)
# -------------------------------------------------
def get_distance_km(start_location, drop_location):

    print("\n--- Distance Calculation ---")
    print("Start:", start_location)
    print("End:", drop_location)

    if not start_location or not drop_location:
        print("⚠ Missing location → 0 km")
        return 0.0

    if gmaps is None:
        print("⚠ Maps offline → Using fallback 100 km")
        return 100.0

    try:
        directions = gmaps.directions(start_location, drop_location, mode="driving")

        if not directions:
            print("❌ NOT_FOUND → Using fallback 100 km")
            return 100.0

        km = round(directions[0]['legs'][0]['distance']['value'] / 1000, 2)
        print("Distance (km):", km)
        return km

    except Exception as e:
        print("❌ Maps Error:", e, "→ 100 km fallback")
        return 100.0


# -------------------------------------------------
# Build Synthetic Training Data
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

        if drop_km > 800:
            price *= 1.25

        rows.append({
            "brand": brand,
            "year": year,
            "category": category,
            "seating_capacity": seating,
            "fuel_type": fuel,
            "transmission": transmission,
            "demand_factor": demand,
            "rental_duration_days": rental_days,
            "drop_off_distance_km": drop_km,
            "target_price": round(price, 2)
        })

    return pd.DataFrame(rows)


# -------------------------------------------------
# Model Training
# -------------------------------------------------
def train_model():
    df = build_training_data()
    X = df.drop(columns=["target_price"])
    y = df["target_price"]

    cat_cols = ["brand", "category", "fuel_type", "transmission", "demand_factor"]
    num_cols = ["year", "seating_capacity", "rental_duration_days", "drop_off_distance_km"]

    preprocessor = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
        ("num", "passthrough", num_cols)
    ])

    model = Pipeline([
        ("pre", preprocessor),
        ("rf", RandomForestRegressor(n_estimators=200, random_state=42)),
    ])

    model.fit(X, y)
    joblib.dump(model, MODEL_PATH)

    print("✔ Model trained & saved.")
    return model


# Load or train model
if os.path.exists(MODEL_PATH):
    pipe = joblib.load(MODEL_PATH)
    print("✔ Model loaded.")
else:
    pipe = train_model()


# -------------------------------------------------
# Price Calculation (Clean Logs)
# -------------------------------------------------
def predict_booking_price(data):

    print("\n--- Price Calculation ---")

    # Rental Days
    start_date = datetime.strptime(data["start_date"], "%Y-%m-%d")
    end_date = datetime.strptime(data["end_date"], "%Y-%m-%d")
    rental_days = max(1, (end_date - start_date).days)
    data["rental_duration_days"] = rental_days
    print("Rental Days:", rental_days)

    # Distance
    distance = get_distance_km(data["start_location"], data["return_location"])
    data["drop_off_distance_km"] = distance
    print("Distance KM:", distance)

    # Per KM Rate
    rates = {"Hatchback": (8, 11), "Sedan": (10, 13), "SUV": (12, 18), "Van": (14, 20)}
    min_r, max_r = rates.get(data["category"], (10, 15))
    per_km = round((min_r + max_r) / 2, 2)
    print("Per KM:", per_km)

    # Daily Base
    base_map = {"Hatchback": 400, "Sedan": 600, "SUV": 900, "Van": 1000}
    brand_adj = {"Toyota": 1.05, "Jeep": 1.12, "Tata": 0.92, "Honda": 1.02}
    daily_base = int(base_map.get(data["category"], 600) * brand_adj.get(data["brand"], 1))
    print("Daily Base:", daily_base)

    # ML Prediction
    features = ["brand", "year", "category", "seating_capacity", "fuel_type",
                "transmission", "demand_factor", "rental_duration_days",
                "drop_off_distance_km"]

    ml_input = pd.DataFrame([{k: data[k] for k in features}])
    ml_price = float(pipe.predict(ml_input)[0])
    print("ML Price:", ml_price)

    # Final Price Calculation
    distance_cost = distance * per_km
    driver_allowance = 300 * rental_days

    final_price = ml_price + distance_cost + driver_allowance
    final_price = round(final_price, 2)

    print("Final Price:", final_price)

    return {
        "predicted_price": final_price,
        "total_km": distance,
        "per_km_rate": per_km,
        "distance_cost": round(distance_cost, 2),
        "driver_allowance": driver_allowance,
        "daily_base": daily_base,
        "ml_price": ml_price,
    }


# -------------------------------------------------
# Flask API
# -------------------------------------------------
app = Flask(__name__)
CORS(app, resources={r"/predict_price": {"origins": "*"}})


@app.route("/")
def home():
    return {"message": "Car Booking Price Prediction API Running"}


@app.route("/predict_price", methods=["POST"])
def predict_price():
    incoming = request.json or {}

    data = {
        "brand": incoming.get("brand"),
        "year": incoming.get("year", 2023),
        "category": incoming.get("category"),
        "seating_capacity": incoming.get("seatingCapacity"),
        "fuel_type": incoming.get("fuelType"),
        "transmission": incoming.get("transmission"),
        "start_location": incoming.get("startLocation"),
        "return_location": incoming.get("dropLocation"),
        "start_date": incoming.get("startDate"),
        "end_date": incoming.get("endDate"),
        "demand_factor": incoming.get("demandFactor", "medium"),
    }

    required = ["brand", "category", "start_date", "end_date",
                "start_location", "return_location"]

    missing = [r for r in required if not data.get(r)]
    if missing:
        return {"error": f"Missing fields: {missing}"}, 400

    result = predict_booking_price(data)
    return jsonify(result)


# -------------------------------------------------
if __name__ == "__main__":
    print("🚀 Backend Running on port 5000")
    app.run(debug=True, port=5000)
