from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import requests
import math

app = Flask(__name__)
CORS(app)

# ---------------- CONFIGURATION ----------------

# Base pricing
BASE_FARE_PER_DAY = 350
DISTANCE_RATE_PER_KM = 24
PLATFORM_FEE = 100
MINIMUM_DISTANCE = 5.0

# Intracity
INTRACITY_BASE = 180
INTRACITY_PER_KM = 18
INTRACITY_MAX_KM = 40

# Express
EXPRESS_BUFFER = 1.35

# Intercity
INTERCITY_PER_KM = 22

# Category multiplier
CATEGORY_MULTIPLIER = {
    "Hatchback": 1.5,
    "Sedan": 1.9,
    "SUV": 2.3,
    "Luxury": 3.5
}

TRANSMISSION_SURCHARGE = {
    "Manual": 100,
    "Automatic": 200
}

CACHE = {}

# ---------------- HELPERS ----------------

def haversine_math(lat1, lon1, lat2, lon2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c * 1.35, 2)

def get_coordinates(place):
    key = f"geo_{place.lower().replace(' ', '')}"
    if key in CACHE:
        return CACHE[key]

    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": place, "format": "json", "limit": 1}
    headers = {"User-Agent": "ReliablePricingEngine"}

    try:
        res = requests.get(url, params=params, headers=headers, timeout=5).json()
        if res:
            coords = (float(res[0]["lat"]), float(res[0]["lon"]))
            CACHE[key] = coords
            return coords
    except:
        pass

    return None

def get_distance(start, end):
    c1, c2 = get_coordinates(start), get_coordinates(end)
    if not c1 or not c2:
        return 75.0

    try:
        osrm = f"http://router.project-osrm.org/route/v1/driving/{c1[1]},{c1[0]};{c2[1]},{c2[0]}?overview=false"
        res = requests.get(osrm, timeout=5).json()
        if "routes" in res:
            return round(res["routes"][0]["distance"] / 1000, 2)
    except:
        pass

    return haversine_math(c1[0], c1[1], c2[0], c2[1])

def classify_ride(distance_km, days):
    if distance_km <= 30 and days == 1:
        return "INTRACITY"
    elif distance_km <= 60 and days == 1:
        return "EXPRESS"
    else:
        return "INTERCITY"

# ---------------- MAIN API ----------------

@app.route("/predict_price", methods=["POST"])
def predict_price():
    try:
        data = request.get_json()

        # Distance
        raw_distance = get_distance(data["startLocation"], data["endLocation"])
        distance_km = max(raw_distance, MINIMUM_DISTANCE)

        # Duration
        start_dt = datetime.fromisoformat(data["startDate"])
        end_dt = datetime.fromisoformat(data["endDate"])
        days = max(math.ceil((end_dt - start_dt).total_seconds() / 86400), 1)

        ride_type = classify_ride(distance_km, days)

        category = data.get("category", "Hatchback")
        transmission = data.get("transmission", "Manual")

        cat_mult = CATEGORY_MULTIPLIER.get(category, 1.0)
        trans_fee = TRANSMISSION_SURCHARGE.get(transmission, 0)

        surge = 1.25 if (8 <= start_dt.hour <= 10 or 17 <= start_dt.hour <= 21) else 1.0

        # Pricing Logic
        if ride_type == "INTRACITY":
            billable_km = min(distance_km, INTRACITY_MAX_KM)
            base = INTRACITY_BASE * cat_mult
            distance_cost = billable_km * INTRACITY_PER_KM
            buffer = 1.0

        elif ride_type == "EXPRESS":
            billable_km = distance_km
            base = BASE_FARE_PER_DAY * cat_mult
            distance_cost = billable_km * DISTANCE_RATE_PER_KM
            buffer = EXPRESS_BUFFER

        else:  # INTERCITY
            billable_km = distance_km
            base = (BASE_FARE_PER_DAY * days) * cat_mult
            distance_cost = billable_km * INTERCITY_PER_KM
            buffer = 1.25 if distance_km < 150 else 1.35

        subtotal = base + distance_cost + trans_fee
        final_price = (subtotal * surge * buffer) + PLATFORM_FEE

        return jsonify({
            "success": True,
            "ride_type": ride_type,
            "predicted_price": round(final_price),
            "distance_km": distance_km,
            "days_charged": days,
            "breakdown": {
                "base_fare": round(base),
                "distance_cost": round(distance_cost),
                "transmission_fee": trans_fee,
                "surge_multiplier": surge,
                "buffer_multiplier": buffer,
                "platform_fee": PLATFORM_FEE
            }
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ---------------- RUN ----------------

if __name__ == "__main__":
    app.run(debug=True, port=5000, threaded=True)
