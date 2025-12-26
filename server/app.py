from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import requests
import math

app = Flask(__name__)
CORS(app)

# ---------------- CONFIGURATION ----------------
BASE_FARE_PER_DAY = 350
DISTANCE_RATE_PER_KM = 24
PLATFORM_FEE = 100
MINIMUM_DISTANCE = 5.0
INTRACITY_BASE = 180
INTRACITY_PER_KM = 18
INTRACITY_MAX_KM = 40
EXPRESS_BUFFER = 1.35
INTERCITY_PER_KM = 22

CATEGORY_MULTIPLIER = {
    "Hatchback": 1.7,
    "Sedan": 1.9,
    "SUV": 2.6,
    "Van": 2.3
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

# --- In your Flask app ---

def get_coordinates(place):
    key = f"geo_{place.lower().replace(' ', '')}"
    if key in CACHE:
        return CACHE[key]
    
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": place, "format": "json", "limit": 1}
    # IMPORTANT: Nominatim requires a unique User-Agent or they block you (503)
    headers = {"User-Agent": "MyCarRentalApp_User_12345"} 
    
    try:
        res = requests.get(url, params=params, headers=headers, timeout=3).json()
        if res:
            coords = (float(res[0]["lat"]), float(res[0]["lon"]))
            CACHE[key] = coords
            return coords
    except Exception as e:
        print(f"Geocoding error for {place}: {e}")
    
    return None # Fallback logic in get_distance handles this

# ... (rest of your imports and helpers)

def get_distance(start, end):
    try:
        c1, c2 = get_coordinates(start), get_coordinates(end)
        if not c1 or not c2:
            return 50.0  # Safe fallback distance if map fails
        
        # Short timeout so Node.js doesn't wait forever
        osrm = f"http://router.project-osrm.org/route/v1/driving/{c1[1]},{c1[0]};{c2[1]},{c2[0]}?overview=false"
        res = requests.get(osrm, timeout=3).json()
        
        if "routes" in res and len(res["routes"]) > 0:
            return round(res["routes"][0]["distance"] / 1000, 2)
        return haversine_math(c1[0], c1[1], c2[0], c2[1])
    except:
        return 75.0 # Ultimate fallback

# ... (rest of your routes)


def classify_ride(distance_km, days):
    if distance_km <= 30 and days == 1:
        return "INTRACITY"
    elif distance_km <= 60 and days == 1:
        return "EXPRESS"
    else:
        return "INTERCITY"

# ---------------- API ENDPOINTS ----------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/api/bookings/generate-price", methods=["POST"])
def generate_price():
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"success": False, "error": "No JSON data provided"}), 400

        # 1. Robust Key Extraction
        # This checks for both naming conventions and ensures we get a string back
        start_date_str = data.get("startDate") or data.get("pickupDate")
        end_date_str = data.get("endDate") or data.get("returnDate")
        start_location = data.get("startLocation")
        end_location = data.get("endLocation")

        # Validation Check
        if not start_date_str:
            return jsonify({"success": False, "error": "Missing startDate or pickupDate"}), 400
        if not end_date_str:
            return jsonify({"success": False, "error": "Missing endDate or returnDate"}), 400

        # 2. Robust ISO parsing
        try:
            # Replaces Z with +00:00 for ISO compliance
            start_dt = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
            end_dt = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
        except Exception as e:
            return jsonify({"success": False, "error": f"Date parsing failed: {str(e)}"}), 400

        # 3. Calculation Logic
        raw_distance = get_distance(start_location, end_location)
        distance_km = max(raw_distance, MINIMUM_DISTANCE)
        
        # Calculate days (ensure at least 1)
        duration = end_dt - start_dt
        days = max(math.ceil(duration.total_seconds() / 86400), 1)
        
        ride_type = classify_ride(distance_km, days)

        category = data.get("category", "Hatchback")
        transmission = data.get("transmission", "Manual")

        cat_mult = CATEGORY_MULTIPLIER.get(category, 1.0)
        trans_fee = TRANSMISSION_SURCHARGE.get(transmission, 0)
        
        # Peak hour surge (8-10 AM or 5-9 PM)
        surge = 1.25 if (8 <= start_dt.hour <= 10 or 17 <= start_dt.hour <= 21) else 1.0

        if ride_type == "INTRACITY":
            billable_km = min(distance_km, INTRACITY_MAX_KM)
            base = INTRACITY_BASE * cat_mult
            distance_cost = billable_km * INTRACITY_PER_KM
            buffer = 1.0
        elif ride_type == "EXPRESS":
            base = BASE_FARE_PER_DAY * cat_mult
            distance_cost = distance_km * DISTANCE_RATE_PER_KM
            buffer = EXPRESS_BUFFER
        else: # INTERCITY
            base = (BASE_FARE_PER_DAY * days) * cat_mult
            distance_cost = distance_km * INTERCITY_PER_KM
            buffer = 1.25 if distance_km < 150 else 1.35

        subtotal = base + distance_cost + trans_fee
        final_price = (subtotal * surge * buffer) + PLATFORM_FEE

        return jsonify({
            "success": True,
            "predicted_price": round(final_price),
            "distance_km": distance_km,
            "days_charged": days,
            "ride_type": ride_type
        })

    except Exception as e:
        # This will now catch the exact line and error type
        return jsonify({"success": False, "error": f"Server Error: {str(e)}"}), 500

if __name__ == "__main__":
    # CHANGE: Run on 5000, not 4000 (Node expects 5000)
    app.run(host="0.0.0.0", port=5005, debug=True)
