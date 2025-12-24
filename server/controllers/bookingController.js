import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import axios from "axios";
import mongoose from "mongoose";

const FLASK_ML_API_URL = "http://127.0.0.1:5000/predict_price";

const formatForFlask = (date) => new Date(date).toISOString().split(".")[0];

// ------------------ DATE NORMALIZER ------------------
const normalizeDateRange = (pickupDate, returnDate) => {
  const startUTC = new Date(pickupDate);
  startUTC.setUTCHours(0, 0, 0, 0);

  const endUTC = new Date(returnDate);
  endUTC.setUTCHours(23, 59, 59, 999);

  return { startUTC, endUTC };
};

// ----------------------------------------------------------------
// 1. HELPER: Strict Check Availability (Unified Logic)
// ----------------------------------------------------------------
export const checkAvailability = async (carId, pickupDate, returnDate) => {
  const { startUTC, endUTC } = normalizeDateRange(pickupDate, returnDate);

  // MISTAKE FIX: Added status check to block BOTH confirmed and pending
  // Blocks any new booking if there is a non-cancelled overlap
  const conflictingBooking = await Booking.findOne({
    car: carId,
    status: { $ne: "cancelled" }, // Prevents multiple pending overlaps
    pickupDate: { $lte: endUTC }, // Existing starts before new ends
    returnDate: { $gte: startUTC }, // Existing ends after new starts
  });

  return conflictingBooking === null;
};

// ------------------ PRICE FROM FLASK ------------------
// --- bookingController.js ---

// bookingController.js
// --- In bookingController.js ---
export const getDynamicPrice = async (
  carData,
  pickupDate,
  returnDate,
  startLocation,
  endLocation
) => {
  try {
    const response = await axios.post(FLASK_ML_API_URL, {
      category: carData.category,
      transmission: carData.transmission,
      startDate: formatForFlask(pickupDate),
      endDate: formatForFlask(returnDate),
      startLocation: startLocation.trim(),
      endLocation: endLocation.trim(),
    });

    if (response.data?.success) {
      const predictedPrice = response.data.predicted_price;

     

      return {
        totalPrice:predictedPrice,
        breakdown:response.data.breakdown,
      };
    }

    throw new Error("Flask returned failure");
  } catch (error) {
    console.error("❌ FLASK ERROR:", error.message);
    throw new Error("Dynamic pricing service unavailable");
  }
};

// if (
//   startLocation &&
//   endLocation &&
//   startLocation.toLowerCase() !== endLocation.toLowerCase()
// ) {
//   price += 1500;
// }

// ------------------ GENERATE PRICE API ------------------
// Change this in bookingController.js
export const generatePrice = async (req, res) => {
  try {
    let { car, pickupDate, returnDate, startLocation, endLocation } = req.body;

    if (!startLocation || !endLocation) {
      return res.status(400).json({
        success: false,
        message: "Start and End locations are required",
      });
    }

    startLocation = startLocation.trim();
    endLocation = endLocation.trim();

    const carData = await Car.findById(car).lean();
    if (!carData)
      return res
        .status(404)
        .json({ success: false, message: "Car not found in Database" });

    // getDynamicPrice should return { totalPrice, breakdown }
    const priceData = await getDynamicPrice(
      carData,
      pickupDate,
      returnDate,
      startLocation,
      endLocation
    );

    res.json({
      success: true,
      totalPrice: priceData.totalPrice,
      breakdown: priceData.breakdown,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// CREATE BOOKING (ATOMIC + NO OVERLAP)
// --------------------------------------------------
// --- In bookingController.js ---
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { car, pickupDate, returnDate, startLocation, endLocation, phone } = req.body;
    const userId = req.user._id;

    const { startUTC, endUTC } = normalizeDateRange(pickupDate, returnDate);

    // 🔒 ATOMIC OVERLAP CHECK
    const conflict = await Booking.findOne(
      {
        car,
        status: { $in: ["pending", "confirmed"] },
        pickupDate: { $lt: endUTC },
        returnDate: { $gt: startUTC },
      },
      null,
      { session }
    );

    if (conflict) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ success: false, message: "Car already booked." });
    }

    const carData = await Car.findById(car).session(session).lean();
    if (!carData) throw new Error("Car not found");

    // 🚩 CHANGE 1: Get the object from Flask
    const priceData = await getDynamicPrice(
      carData,
      pickupDate,
      returnDate,
      startLocation.trim(),
      endLocation.trim()
    );

    // 🚩 CHANGE 2: Store only the numeric total in the 'price' field
    await Booking.create(
      [
        {
          car,
          owner: carData.owner,
          user: userId,
          pickupDate: startUTC,
          returnDate: endUTC,
          startLocation,
          endLocation,
          phone,
          price: priceData.totalPrice, // <--- FIX: Store the number, not the object
          status: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: "Booking request sent!" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Booking failed" });
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
        returnDate
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
export const cancelBooking = async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, {
      status: "cancelled",
    });
    res.json({ success: true, message: "Booking cancelled" });
  } catch {
    res.json({ success: false, message: "Server error" });
  }
};
