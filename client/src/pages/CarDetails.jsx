import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Loader from "../components/Loader";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const CarDetails = () => {
  const { id } = useParams();

  const {
    cars,
    axios,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
    user,
  } = useAppContext();

  const navigate = useNavigate();
  const [car, setCar] = useState(null);

  // Form States
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [estimatedPriceBreakdown, setEstimatedPriceBreakdown] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!searchTerm) return;

    const timer = setTimeout(() => {
      searchLocation(searchTerm, setStartLocation);
    }, 500); // wait 0.5s after typing stops

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (estimatedPrice) {
      const priceSection = document.getElementById("price-section");
      priceSection?.scrollIntoView({ behavior: "smooth" });
    }
  }, [estimatedPrice]);

  // ----------------------------------------------------------------
  // 1. Fetch Car Data
  // ----------------------------------------------------------------
  useEffect(() => {
    const fetchCarData = async () => {
      if (cars && cars.length > 0) {
        const foundCar = cars.find((c) => {
          const carId = c._id || c.id;
          return String(carId) === String(id);
        });

        if (foundCar) {
          setCar(foundCar);
          setStartLocation(foundCar.location);
          return;
        }
      }

      try {
        const { data } = await axios.get(`/api/user/cars`);
        if (data.success) {
          const found = data.cars.find((c) => c._id === id || c.id === id);
          if (found) setCar(found);
          else {
            toast.error("Car not found.");
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Error fetching car:", error);
        if (!car) toast.error("Could not load car details.");
      }
    };

    fetchCarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, cars]);

  const searchLocation = async (query, setter) => {
    if (!query) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const data = await res.json();

      if (data.length > 0) {
        setter(data[0].display_name);
      }
    } catch (err) {
      toast.error("Location search failed");
    }
  };

  // ----------------------------------------------------------------
  // 2. Generate Price (FIXED SECTION)
  // ----------------------------------------------------------------
  const handleGeneratePrice = async () => {
    if (!pickupDate || !returnDate)
      return toast.error("Select pickup and return dates");

    if (!startLocation || !endLocation)
      return toast.error("Enter start and end locations");

    if (new Date(returnDate) < new Date(pickupDate)) {
      return toast.error("Return date must be after pickup date");
    }

    setLoadingPrice(true);
    try {
      const { data } = await axios.post("/api/bookings/generate-price", {
        car: id,
        pickupDate,
        returnDate,
        startLocation,
        endLocation,
      });

      if (data.success) {
        console.log(
          "PRICE RECEIVED FROM BACKEND:",
          data.totalPrice,
          data.breakdown
        );
        setEstimatedPrice(data.totalPrice);
        setEstimatedPriceBreakdown(data.breakdown || null);
      } else {
        toast.error(data.message || "Price calculation failed");
        setEstimatedPrice(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Price calculation failed");
      setEstimatedPrice(null);
    } finally {
      setLoadingPrice(false);
    }
  };

  // ----------------------------------------------------------------
  // 3. Submit Booking
  // ----------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);

    if (!user) {
      setSubmitting(false);
      return toast.error("Login required");
    }

    if (!estimatedPrice) {
      setSubmitting(false);
      return toast.error("Generate price first");
    }

    try {
      const { data } = await axios.post("/api/bookings/create", {
        car: id,
        phone,
        pickupDate,
        returnDate,
        startLocation,
        endLocation,
        price: estimatedPrice,
      });

      if (data.success) {
        toast.success(data.message);
        navigate("/my-bookings");
      } else {
        toast.error(data.message);
        setEstimatedPrice(null); // force re-check
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("Car already booked for these dates");
        setEstimatedPrice(null);
      } else {
        toast.error("Booking failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!car) return <Loader />;

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-16 pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-gray-500 cursor-pointer hover:text-gray-800"
      >
        <img src={assets.arrow_icon} alt="" className="rotate-180 opacity-65" />
        Back to all cars
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* LEFT SIDE: CAR INFO */}
        <div className="lg:col-span-2">
          <img
            src={car.image}
            alt={car.name || "Car"}
            className="w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md"
          />

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">
                {car.brand} {car.model}
              </h1>
              <p className="text-gray-500 text-lg">
                {car.category} • {car.year}
              </p>
            </div>

            <hr className="border-borderColor my-6" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center bg-light p-4 rounded-lg">
                <img src={assets.users_icon} alt="" className="h-5 mb-2" />
                {car.seating_capacity} Seats
              </div>
              <div className="flex flex-col items-center bg-light p-4 rounded-lg">
                <img src={assets.fuel_icon} alt="" className="h-5 mb-2" />
                {car.fuel_type}
              </div>
              <div className="flex flex-col items-center bg-light p-4 rounded-lg">
                <img src={assets.car_icon} alt="" className="h-5 mb-2" />
                {car.transmission}
              </div>
              <div className="flex flex-col items-center bg-light p-4 rounded-lg">
                <img src={assets.location_icon} alt="" className="h-5 mb-2" />
                {car.location}
              </div>
            </div>

            <div>
              <h1 className="text-xl font-medium mb-3">Description</h1>
              <p className="text-gray-500">{car.description}</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: BOOKING FORM */}
        <form
          onSubmit={handleSubmit}
          className="shadow-lg h-max sticky top-24 rounded-xl p-6 space-y-5 text-gray-600 bg-white border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Book Your Ride</h3>
          </div>

          <hr className="border-borderColor my-4" />

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full mt-1 focus:outline-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full mt-1 focus:outline-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Start Location
              </label>
              <input
                type="text"
                value={startLocation}
                onChange={(e) => {
                  setStartLocation(e.target.value);
                }}
                className="border px-3 py-2 rounded-lg w-full mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                End Location
              </label>
              <input
                type="text"
                value={endLocation}
                onChange={(e) => {
                  setEndLocation(e.target.value);
                }}
                className="border px-3 py-2 rounded-lg w-full mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                className="border px-3 py-2 rounded-lg w-full mt-1 focus:outline-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                min={pickupDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="border px-3 py-2 rounded-lg w-full mt-1 focus:outline-blue-500"
                required
              />
            </div>
          </div>

          {/* PRICE CALCULATION SECTION */}
          {loadingPrice ? (
            <div className="text-center p-4 bg-blue-50 animate-pulse rounded-lg">
              <p className="text-blue-600 font-medium">
                Fetching Intercity Rates...
              </p>
            </div>
          ) : estimatedPrice ? (
            <div
              id="price-section"
              className="text-center bg-blue-50 border border-blue-100 py-4 rounded-lg animate-fade-in"
            >
              <p className="text-sm text-blue-600 font-medium">
                Total Dynamic Price
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                ₹{estimatedPrice}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Based on demand & distance
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGeneratePrice}
              disabled={
                loadingPrice ||
                !startLocation ||
                !endLocation ||
                !pickupDate ||
                !returnDate
              }
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                loadingPrice
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-gray-800 hover:bg-gray-900 text-white"
              }`}
            >
              {loadingPrice ? "Calculating Best Price..." : "Calculate Price"}
            </button>
          )}

          {/* FINAL BOOKING BUTTON (Only show if price is generated) */}
          {estimatedPrice && !loadingPrice && (
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-3 rounded-xl font-bold text-white shadow-md mt-2"
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </button>
          )}

    
        </form>
      </div>
    </div>
  );
};

export default CarDetails;
