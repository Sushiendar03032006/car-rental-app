import Booking from "../models/Booking.js"; 
import Car from "../models/Car.js";
import axios from "axios"; 

const FLASK_ML_API_URL = process.env.FLASK_ML_API_URL || 'http://127.0.0.1:5000/predict_price';

// ----------------------------------------------------------------
// 1. HELPER: Check Availability
// ----------------------------------------------------------------
const checkAvailability = async (carId, pickupDate, returnDate) => {
  const start = new Date(pickupDate);
  const end = new Date(returnDate);

  const bookings = await Booking.find({
    car: carId, 
    status: "confirmed", 
    $or: [
       { pickupDate: { $lte: end }, returnDate: { $gte: start } }
    ]
  });
  return bookings.length === 0;
};

// ----------------------------------------------------------------
// 2. HELPER: Get Dynamic Price
// ----------------------------------------------------------------
const getDynamicPrice = async (carData, pickupDate, returnDate, userStartLoc, userEndLoc) => {
  const picked = new Date(pickupDate);
  const returned = new Date(returnDate);
  const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));

  const mlInputData = {
    brand: carData.brand,
    year: carData.year,
    category: carData.category,
    seatingCapacity: carData.seating_capacity, 
    fuelType: carData.fuel_type,
    transmission: carData.transmission,
    startLocation: userStartLoc || carData.location,
    dropLocation: userEndLoc || carData.location, 
    startDate: pickupDate,
    endDate: returnDate,
    demandFactor: "medium"
  };

  try {
    const response = await axios.post(FLASK_ML_API_URL, mlInputData);
    return response.data.predicted_price;
  } catch (error) {
    console.error("ML Fallback:", error.message);
    return carData.pricePerDay * (noOfDays || 1); 
  }
};

// ----------------------------------------------------------------
// 3. API: Generate Price
// ----------------------------------------------------------------
export const generatePrice = async (req, res) => {
  try {
    const { car, pickupDate, returnDate, startLocation, endLocation } = req.body;
    
    // 'car' is the ID sent from frontend
    const carData = await Car.findById(car).lean();
    if (!carData) return res.json({ success: false, message: "Car not found" });

    const price = await getDynamicPrice(carData, pickupDate, returnDate, startLocation, endLocation);
    
    res.json({ success: true, price });
  } catch (error) {
    console.error(error); 
    res.json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------
// 4. API: Create Booking (FIXED)
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 4. API: Create Booking (FIXED: NOW SAVES PHONE)
// ----------------------------------------------------------------
export const createBooking = async (req, res) => {
  try {
    // ✅ 1. EXTRACT 'phone' from req.body
    const { car, pickupDate, returnDate, startLocation, endLocation, price, phone } = req.body;
    const { _id } = req.user; 

    // Validate inputs
    if (!car || !pickupDate || !returnDate || !phone) {
        return res.json({ success: false, message: "Missing details: Phone, Car, or Dates required." });
    }

    // 2. Check Availability
    const isAvailable = await checkAvailability(car, pickupDate, returnDate);
    if (!isAvailable) {
        return res.json({ success: false, message: "Car not available for these dates" });
    }

    // 3. Get Car Owner Details
    const carData = await Car.findById(car).lean();
    if (!carData) return res.json({ success: false, message: "Car not found in database" });

    // 4. Create the Booking
    await Booking.create({
      car, 
      owner: carData.owner,
      user: _id,
      pickupDate: new Date(pickupDate),
      returnDate: new Date(returnDate),
      startLocation, 
      endLocation,
      price, 
      phone, // ✅ CRITICAL FIX: Save the phone number here
      status: "pending" 
    });

    res.json({ success: true, message: "Booking Request Sent! Waiting for Owner." });
  } catch (error) {
    console.error("Create Booking Error:", error); 
    res.json({ success: false, message: error.message }); 
  }
};

// ----------------------------------------------------------------
// 5. Other API Functions
// ----------------------------------------------------------------

export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;
        const cars = await Car.find({ location, isAvailable: true });

        const availableCars = [];
        // Renamed variable to avoid confusion
        for (const carItem of cars) { 
            const available = await checkAvailability(carItem._id, pickupDate, returnDate);
            if (available) availableCars.push(carItem);
        }
        res.json({ success: true, availableCars });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("car").sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) { res.json({ success: false, message: error.message }); }
};

export const getOwnerBookings = async (req, res) => {
    try {
      const bookings = await Booking.find({ owner: req.user._id }).populate("car user").sort({ createdAt: -1 });
      res.json({ success: true, bookings });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

export const changeBookingStatus = async (req, res) => {
    try {
      const { bookingId, status } = req.body;
      await Booking.findByIdAndUpdate(bookingId, { status });
      res.json({ success: true, message: "Status Updated" });
    } catch (error) { res.json({ success: false, message: error.message }); }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        await Booking.findByIdAndDelete(id);
        res.json({ success: true, message: "Booking cancelled" });
    } catch (error) { res.json({ success: false, message: "Server Error" }); }
};