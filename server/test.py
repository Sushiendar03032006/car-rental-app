import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:5000/predict_price"

def run_test(payload, description):
    print(f"--- Testing: {description} ---")
    try:
        response = requests.post(BASE_URL, json=payload)
        data = response.json()
        if data.get("success"):
            print(f"Result: ₹{data['predicted_price']} (Distance: {data['distance_km']} km)")
            return data['predicted_price']
        else:
            print(f"Error: {data.get('error')}")
            return None
    except Exception as e:
        print(f"Connection Failed: {e}")
        return None

def automated_suite():
    # 1. Base Case: Hatchback, 1 Day, Short Distance, Weekday, Off-peak
    base_payload = {
        "startDate": "2025-12-24T14:00:00", # Wednesday
        "endDate": "2025-12-25T14:00:00",
        "category": "Hatchback",
        "transmission": "Manual",
        "startLocation": "Madhavaram, Chennai",
        "endLocation": "Perambur, Chennai"
    }
    price_base = run_test(base_payload, "Base Case (Hatchback/Weekday/Short)")

    # 2. Peak Hour Surge: Change time to 9 AM (8-10 AM surge)
    peak_payload = base_payload.copy()
    peak_payload["startDate"] = "2025-12-24T09:00:00"
    price_peak = run_test(peak_payload, "Peak Hour Surge (9:00 AM)")

    # 3. Weekend Surge: Change date to Sunday
    weekend_payload = base_payload.copy()
    weekend_payload["startDate"] = "2025-12-28T14:00:00" # Sunday
    weekend_payload["endDate"] = "2025-12-29T14:00:00"
    price_weekend = run_test(weekend_payload, "Weekend Surge (Sunday)")

    # 4. Long Distance Surge: Chennai to Bangalore (~350km)
    long_dist_payload = base_payload.copy()
    long_dist_payload["endLocation"] = "Majestic, Bangalore"
    price_long = run_test(long_dist_payload, "Long Distance (Chennai -> Bangalore)")

    # 5. Luxury Automatic Surge
    luxury_payload = long_dist_payload.copy()
    luxury_payload["category"] = "Luxury"
    luxury_payload["transmission"] = "Automatic"
    price_luxury = run_test(luxury_payload, "Luxury + Automatic + Long Distance")

    # Summary of Comparisons
    print("\n" + "="*30)
    print("TEST SUMMARY")
    print("="*30)
    if price_peak and price_base:
        print(f"Peak Hour Increase: ₹{round(price_peak - price_base, 2)}")
    if price_long and price_base:
        print(f"Distance/Surge Difference: ₹{round(price_long - price_base, 2)}")
    if price_luxury and price_long:
        print(f"Luxury Upgrade Cost: ₹{round(price_luxury - price_long, 2)}")

if __name__ == "__main__":
    automated_suite()