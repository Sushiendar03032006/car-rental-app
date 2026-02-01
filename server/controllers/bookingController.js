import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import mongoose from "mongoose";
import axios from "axios";

// ---------------- CONFIGURATION ----------------
// ---------------- PROFIT-OPTIMIZED CONFIGURATION ----------------
const CONFIG = {
  // Increased Base Rates
  BASE_FARE_PER_DAY: 550,       // Up from 350 (Covers maintenance + basic profit)
  DISTANCE_RATE_PER_KM: 28,      // Up from 24
  PLATFORM_FEE: 150,             // Up from 100
  MINIMUM_DISTANCE: 10.0,        // Up from 5.0 (Minimum billable distance)

  // Intracity (Local) Revenue Boost
  INTRACITY_BASE: 300,           // Up from 180 (Covers the cost of delivery/pickup)
  INTRACITY_PER_KM: 22,          // Up from 18
  INTRACITY_MAX_KM: 40,

  // Surge & Multipliers
  EXPRESS_BUFFER: 1.45,          // Higher premium for 1-day express trips
  INTERCITY_PER_KM: 26,          // Up from 22

  // Aggressive Category Multipliers
  CATEGORY_MULTIPLIER: {
    Hatchback: 1.8,
    Sedan: 2.2,                  // Significant gap between Hatch and Sedan
    SUV: 3.2,                    // SUVs have high maintenance; charge a premium
    Van: 2.9,
  },

  // Convenience Surcharge
  TRANSMISSION_SURCHARGE: {
    Manual: 150,
    Automatic: 400,              // High premium for driving ease
  },

  // NEW: Overall Profit Margin (Flat 15% added to total subtotal)
  SERVICE_MARGIN: 1.10
};
// ---------------- HELPERS (Math & Geocoding) ----------------
// FIXED: Corrected Math.edge error and ride classification mapping
const haversineMath = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  // FIX: Use Math.sqrt(1 - a) correctly
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c * 1.35).toFixed(2));
};

const getCoordinates = async (place) => {
  try {
    const url = "https://nominatim.openstreetmap.org/search";
    const response = await axios.get(url, {
      params: { q: place, format: "json", limit: 1 },
      headers: { "User-Agent": "CarRentalApp_MERN" },
      timeout: 3000,
    });
    if (response.data?.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
      };
    }
  } catch (e) {
    console.error("Geocoding error:", e.message);
  }
  return null;
};

const normalizeDateRange = (pickupDate, returnDate) => {
  const startUTC = new Date(pickupDate);
  startUTC.setUTCHours(0, 0, 0, 0);
  const endUTC = new Date(returnDate);
  endUTC.setUTCHours(23, 59, 59, 999);
  return { startUTC, endUTC };
};

// ---------------- AVAILABILITY HELPER ----------------

export const checkAvailability = async (
  carId,
  pickupDate,
  returnDate,
  session = null,
) => {
  const { startUTC, endUTC } = normalizeDateRange(pickupDate, returnDate);
  const query = {
    car: carId,
    status: { $in: ["pending", "confirmed"] },
    pickupDate: { $lt: endUTC },
    returnDate: { $gt: startUTC },
  };
  const conflict = session
    ? await Booking.findOne(query).session(session)
    : await Booking.findOne(query);

  return conflict === null;
};

// NEW HELPER: Fetches real road distance from OSRM
const getRoadDistance = async (coords1, coords2) => {
  try {
    // OSRM calculates the actual driving path
    const url = `http://router.project-osrm.org/route/v1/driving/${coords1.lon},${coords1.lat};${coords2.lon},${coords2.lat}?overview=false`;
    const response = await axios.get(url, { timeout: 4000 });

    if (response.data?.routes?.length > 0) {
      // Convert meters to KM
      return parseFloat((response.data.routes[0].distance / 1000).toFixed(2));
    }
  } catch (error) {
    console.error("OSRM API Error:", error.message);
  }
  return null;
};

// UPDATE: calculateInternalPrice to use the API
export const calculateInternalPrice = async (carData, pickupDate, returnDate, startLoc, endLoc) => {
  const c1 = await getCoordinates(startLoc);
  const c2 = await getCoordinates(endLoc);
  
  // Default fallback if map fails (Increase to 20km for safety)
  let distanceKm = startLoc.toLowerCase() === endLoc.toLowerCase() ? 5.0 : 20.0; 

  if (c1 && c2) {
    const roadDist = await getRoadDistance(c1, c2);
    if (roadDist) {
      distanceKm = roadDist; 
    } else {
      // Fallback: Haversine but with a smaller "Road Factor" (1.15 instead of 1.35)
      // Since OSRM is primary, haversine is just the backup.
      distanceKm = haversineMath(c1.lat, c1.lon, c2.lat, c2.lon) / 1.15; 
    }
  }

  // Ensure minimum billing distance
  distanceKm = Math.max(distanceKm, CONFIG.MINIMUM_DISTANCE);

  const startDt = new Date(pickupDate);
  const endDt = new Date(returnDate);
  const days = Math.max(Math.ceil((endDt - startDt) / (1000 * 60 * 60 * 24)), 1);

  const catMult = CONFIG.CATEGORY_MULTIPLIER[carData.category] || 1.0;
  const transFee = CONFIG.TRANSMISSION_SURCHARGE[carData.transmission] || 0;
  const hour = startDt.getHours();
  
  // Peak surge logic: 8-10 AM or 5-9 PM
  const surge = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 21) ? 1.30 : 1.0; // 30% surge

  let base, distCost, buffer;

  if (distanceKm <= 30 && days === 1) {
    // INTRACITY
    base = CONFIG.INTRACITY_BASE * catMult;
    distCost = Math.min(distanceKm, CONFIG.INTRACITY_MAX_KM) * CONFIG.INTRACITY_PER_KM;
    buffer = 1.1; // Flat 10% convenience buffer for local rides
  } else if (distanceKm <= 60 && days === 1) {
    // EXPRESS
    base = CONFIG.BASE_FARE_PER_DAY * catMult;
    distCost = distanceKm * CONFIG.DISTANCE_RATE_PER_KM;
    buffer = CONFIG.EXPRESS_BUFFER;
  } else {
    // INTERCITY
    base = (CONFIG.BASE_FARE_PER_DAY * days) * catMult;
    distCost = distanceKm * CONFIG.INTERCITY_PER_KM;
    // Buffer increases for longer trips to cover wear and tear
    buffer = distanceKm < 150 ? 1.35 : 1.45; 
  }

  // Profit Calculation
  const subtotal = (base + distCost + transFee);
  // Apply Surge -> Apply Profit Margin -> Add Platform Fee
  const finalPrice = Math.round((subtotal * surge * buffer * CONFIG.SERVICE_MARGIN) + CONFIG.PLATFORM_FEE);

  return {
    totalPrice: finalPrice,
    distance_km: distanceKm,
    ride_type: distanceKm <= 30 && days === 1 ? "INTRACITY" : distanceKm <= 60 && days === 1 ? "EXPRESS" : "INTERCITY",
    days_charged: days
  };
};
// ---------------- API EXPORTS ----------------

export const generatePrice = async (req, res) => {
  try {
    const { car, pickupDate, returnDate, startLocation, endLocation } =
      req.body;
    const carData = await Car.findById(car).lean();
    if (!carData)
      return res.status(404).json({ success: false, message: "Car not found" });

    const priceData = await calculateInternalPrice(
      carData,
      pickupDate,
      returnDate,
      startLocation.trim(),
      endLocation.trim(),
    );
    // Send success: true and the price data
    res.json({
      success: true,
      totalPrice: priceData.totalPrice, // This must match the frontend key
      distance_km: priceData.distance_km,
      ride_type: priceData.ride_type,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { car, pickupDate, returnDate, startLocation, endLocation, phone } =
      req.body;
    const { startUTC, endUTC } = normalizeDateRange(pickupDate, returnDate);

    const isAvailable = await checkAvailability(
      car,
      pickupDate,
      returnDate,
      session,
    );
    if (!isAvailable) {
      await session.abortTransaction();
      return res
        .status(409)
        .json({ success: false, message: "Car already booked." });
    }

    const carData = await Car.findById(car).session(session).lean();
    const priceData = await calculateInternalPrice(
      carData,
      pickupDate,
      returnDate,
      startLocation.trim(),
      endLocation.trim(),
    );

    await Booking.create(
      [
        {
          car,
          owner: carData.owner,
          user: req.user._id,
          pickupDate: startUTC,
          returnDate: endUTC,
          startLocation,
          endLocation,
          phone,
          price: priceData.totalPrice,
          status: "pending",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    res.json({ success: true, message: "Booking request sent!" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: "Booking failed" });
  } finally {
    session.endSession();
  }
};

export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;
    const cars = await Car.find({ location, isAvailable: true });

    const availableCars = [];
    for (const carItem of cars) {
      const available = await checkAvailability(
        carItem._id,
        pickupDate,
        returnDate,
      );
      if (available) availableCars.push(carItem);
    }
    res.json({ success: true, availableCars });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("car")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate("car user")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const changeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    await Booking.findByIdAndUpdate(bookingId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// --------------------------------------------------
// CANCEL BOOKING (SAFE)
// --------------------------------------------------
// --------------------------------------------------
// CANCEL BOOKING (ACTUAL DELETE)
// --------------------------------------------------
export const cancelBooking = async (req, res) => {
  try {
    // Change from findByIdAndUpdate to findByIdAndDelete
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, message: "Booking permanently deleted" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error during deletion" });
  }
};
