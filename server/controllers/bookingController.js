import Booking from "../models/Booking.js"; 
import Car from "../models/Car.js";
import axios from "axios"; 

// ✅ Points to your Live Python AI Server on Render
const FLASK_ML_API_URL = process.env.FLASK_ML_API_URL || 'https://backend-flask-ml.onrender.com/predict_price';

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
// 2. HELPER: Get Dynamic Price (AI + Platform Fee + Intercity Fee)
// ----------------------------------------------------------------
const getDynamicPrice = async (carData, pickupDate, returnDate, userStartLoc, userEndLoc) => {
  // 1. Calculate Days
  const picked = new Date(pickupDate);
  const returned = new Date(returnDate);
  let noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
  
  if (noOfDays <= 0 || isNaN(noOfDays)) noOfDays = 1;

  // 2. Identify Base Price
  const basePrice = carData.pricePerDay || carData.price || carData.rentPerDay || 2000; 

  let calculatedPrice = 0;

  // 3. Try AI Prediction
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
    console.log(`Attempting AI prediction...`);
    const response = await axios.post(FLASK_ML_API_URL, mlInputData, { timeout: 4000 }); 
    
    if (response.data && response.data.predicted_price) {
        console.log("AI Price Success:", response.data.predicted_price);
        calculatedPrice = response.data.predicted_price;
    } else {
        throw new Error("AI result empty");
    }
  } catch (error) {
    console.error("Using Fallback Math:", error.message);
    // Fallback: Base Price * Days
    calculatedPrice = basePrice * noOfDays;
  }

  // ---------------------------------------------------------
  // 4. ADD FEES & ADJUSTMENTS
  // ---------------------------------------------------------
  
  const start = (userStartLoc || "").trim().toLowerCase();
  const end = (userEndLoc || "").trim().toLowerCase();

  // Rule 1: Intercity Fee (If locations differ)
  if (start && end && start !== end) {
      console.log("Different Location Detected! Adding Intercity Fee.");
      calculatedPrice += 2500; 
  }

  // Rule 2: Platform/Service Fee (Add ₹200)
  const PLATFORM_FEE = 200;
  calculatedPrice += PLATFORM_FEE;

  // Safety: Ensure minimum price is logical (e.g. at least ₹1500 total)
  if (calculatedPrice < (1500 * noOfDays)) {
      calculatedPrice = 1500 * noOfDays;
  }

  console.log("Final Adjusted Price:", calculatedPrice);
  return Math.round(calculatedPrice); 
};

// ----------------------------------------------------------------
// 3. API: Generate Price
// ----------------------------------------------------------------
export const generatePrice = async (req, res) => {
  try {
    const { car, pickupDate, returnDate, startLocation, endLocation } = req.body;
    
    const carData = await Car.findById(car).lean();
    if (!carData) return res.json({ success: false, message: "Car not found" });

    const calculatedPrice = await getDynamicPrice(carData, pickupDate, returnDate, startLocation, endLocation);
    
    // ✅ Sending 'totalPrice' to match frontend
    res.json({ success: true, totalPrice: calculatedPrice });
  } catch (error) {
    console.error("Generate Price Error:", error); 
    res.json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------
// 4. API: Create Booking
// ----------------------------------------------------------------
export const createBooking = async (req, res) => {
  try {
    const { car, pickupDate, returnDate, startLocation, endLocation, price, phone } = req.body;
    const { _id } = req.user; 

    if (!car || !pickupDate || !returnDate || !phone) {
        return res.json({ success: false, message: "Missing details: Phone, Car, or Dates required." });
    }

    const isAvailable = await checkAvailability(car, pickupDate, returnDate);
    if (!isAvailable) {
        return res.json({ success: false, message: "Car not available for these dates" });
    }

    const carData = await Car.findById(car).lean();
    if (!carData) return res.json({ success: false, message: "Car not found in database" });

    await Booking.create({
      car, 
      owner: carData.owner,
      user: _id,
      pickupDate: new Date(pickupDate),
      returnDate: new Date(returnDate),
      startLocation, 
      endLocation,
      price, 
      phone, 
      status: "pending" 
    });

    res.json({ success: true, message: "Booking Request Sent! Waiting for Owner." });
  } catch (error) {
    console.error("Create Booking Error:", error); 
    res.json({ success: false, message: error.message }); 
  }
};

// ----------------------------------------------------------------
// 5. Other API Functions (FULLY RESTORED)
// ----------------------------------------------------------------

export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;
        const cars = await Car.find({ location, isAvailable: true });

        const availableCars = [];
        for (const carItem of cars) { 
            const available = await checkAvailability(carItem._id, pickupDate, returnDate);
            if (available) availableCars.push(carItem);
        }
        res.json({ success: true, availableCars });
    } catch (error) { 
        res.json({ success: false, message: error.message }); 
    }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("car").sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) { 
      res.json({ success: false, message: error.message }); 
  }
};

export const getOwnerBookings = async (req, res) => {
    try {
      const bookings = await Booking.find({ owner: req.user._id }).populate("car user").sort({ createdAt: -1 });
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

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        await Booking.findByIdAndDelete(id);
        res.json({ success: true, message: "Booking cancelled" });
    } catch (error) { 
        res.json({ success: false, message: "Server Error" }); 
    }
};