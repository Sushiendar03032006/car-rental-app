import express from "express";
import { 
    changeBookingStatus, 
    checkAvailabilityOfCar, // Fixed name to match controller
    createBooking, 
    getOwnerBookings, 
    getUserBookings, 
    generatePrice, 
    cancelBooking,
    calculateInternalPrice // Imported the correct pricing helper
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

// ---------------------------------------------------------
// TEST ROUTE: Verifying Internal Math Logic
// ---------------------------------------------------------
bookingRouter.get("/test-pricing", async (req, res) => {
    try {
        const dummyCar = { category: "SUV", transmission: "Automatic" };
        
        // Calling the local math-based helper instead of an external Flask call
        const priceData = await calculateInternalPrice(
            dummyCar, 
            "2025-12-24T10:00:00", 
            "2025-12-25T10:00:00", 
            "Chennai", 
            "Bangalore"
        );
        
        res.json({ 
            success: true, 
            message: "Internal pricing engine is operational",
            calculatedData: priceData 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: "Pricing calculation failed", 
            details: err.message 
        });
    }
});

// ---------------------------------------------------------
// STANDARD ROUTES
// ---------------------------------------------------------

// Check if cars are available at a specific location/time
bookingRouter.post('/check-availability', checkAvailabilityOfCar);

// Create a new booking (Protected)
bookingRouter.post('/create', protect, createBooking);

// Get bookings for the logged-in user (customer)
bookingRouter.get('/user', protect, getUserBookings);

// Get bookings for the logged-in user (car owner)
bookingRouter.get('/owner', protect, getOwnerBookings);

// Update status (Confirm/Reject)
bookingRouter.post('/change-status', protect, changeBookingStatus);

// Calculate price for frontend display
bookingRouter.post('/generate-price', generatePrice);

// Cancel/Delete booking
bookingRouter.delete('/:id', protect, cancelBooking); 

export default bookingRouter;