import requests

BASE_URL = "http://127.0.0.1:5005/api/bookings/generate-price"

def run_test(payload, description):
    print(f"\n--- Testing: {description} ---")
    try:
        response = requests.post(BASE_URL, json=payload, timeout=10)
        data = response.json()
        if data.get("success"):
            print(f"✅ Success!")
            print(f"   Price: ₹{data['predicted_price']}")
            print(f"   Type:  {data['ride_type']}")
            print(f"   Dist:  {data['distance_km']} km")
            return data["predicted_price"]
        else:
            print(f"❌ API Error: {data.get('error')}")
            return None
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        return None

def automated_suite():
    # Example payload using 'pickupDate' to test the fallback logic
    base_payload = {
        "pickupDate": "2025-12-24T14:00:00",
        "returnDate": "2025-12-25T14:00:00",
        "startLocation": "Adyar, Chennai",
        "endLocation": "Katpadi,Vellore",
        "category": "SUV",
        "transmission": "Automatic"
    }

    p1 = run_test(base_payload, "Normal Hour Case")

    # Test Peak Hour Surge (9 AM)
    peak_payload = base_payload.copy()
    peak_payload["pickupDate"] = "2025-12-24T09:00:00"
    p2 = run_test(peak_payload, "Peak Hour Surge (9 AM)")

    # Test ISO format with 'Z'
    iso_payload = base_payload.copy()
    iso_payload["pickupDate"] = "2025-12-24T10:00:00Z"
    iso_payload["returnDate"] = "2025-12-25T10:00:00Z"
    p3 = run_test(iso_payload, "ISO String with 'Z'")

if __name__ == "__main__":
    automated_suite()