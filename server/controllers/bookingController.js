import Booking from "../models/Booking.js"; 
import Car from "../models/Car.js";
import axios from "axios"; 

// ✅ UPDATED: Points to your Live Python AI Server on Render
// NOTE: We added '/predict_price' at the end because that is the specific function route
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
// 2. HELPER: Get Dynamic Price (ROBUST VERSION)
// ----------------------------------------------------------------
const getDynamicPrice = async (carData, pickupDate, returnDate, userStartLoc, userEndLoc) => {
  // 1. Calculate Days
  const picked = new Date(pickupDate);
  const returned = new Date(returnDate);
  let noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
  
  // Safety: Ensure minimum 1 day
  if (noOfDays <= 0 || isNaN(noOfDays)) noOfDays = 1;

  // 2. Identify Base Price (Handle different DB field names)
  // Check if your DB uses 'price', 'pricePerDay', or 'rentPerDay'
  const basePrice = carData.pricePerDay || carData.price || carData.rentPerDay || 2000; 

  console.log(`Calculating Price for: ${carData.brand} | Days: ${noOfDays} | Base: ${basePrice}`);

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
    // 3. Try AI Prediction
    console.log(`Attempting AI prediction at: ${FLASK_ML_API_URL}`);
    
    // Timeout set to 5 seconds. If Python app is sleeping, this prevents hanging.
    const response = await axios.post(FLASK_ML_API_URL, mlInputData, { timeout: 5000 }); 
    
    if (response.data && response.data.predicted_price) {
        console.log("AI Price Success:", response.data.predicted_price);
        return response.data.predicted_price;
    } else {
        throw new Error("AI returned empty result");
    }

  } catch (error) {
    // 4. FALLBACK: Standard Math
    console.error("AI Service Failed (Using Fallback):", error.message);
    
    // Simple logic: Base Price * Days
    const finalFallbackPrice = basePrice * noOfDays;
    
    console.log("Fallback Price Calculated:", finalFallbackPrice);
    return finalFallbackPrice; 
  }
};

// ----------------------------------------------------------------
// 3. API: Generate Price
// ----------------------------------------------------------------
export const generatePrice = async (req, res) => {
  try {
    const { car, pickupDate, returnDate, startLocation, endLocation } = req.body;
    
    const carData = await Car.findById(car).lean();
    if (!carData) return res.json({ success: false, message: "Car not found" });

    // Calculate Price (AI or Fallback)
    const calculatedPrice = await getDynamicPrice(carData, pickupDate, returnDate, startLocation, endLocation);
    
    console.log("Final Sent Price:", calculatedPrice);

    // ✅ Sending 'totalPrice' to match your frontend fix
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
// 5. Other API Functions
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