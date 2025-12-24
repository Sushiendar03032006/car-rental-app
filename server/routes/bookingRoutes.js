import express from "express";
import { 
    changeBookingStatus, 
     checkAvailability, 
    createBooking, 
    getOwnerBookings, 
    getUserBookings, 
    generatePrice, 
    cancelBooking ,
    getDynamicPrice
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();


// PASTE THE TEST ROUTE HERE
bookingRouter.get("/test-flask", async (req, res) => {
    try {
        // Dummy data to simulate a car from your database
        const dummyCar = { category: "SUV", transmission: "Automatic", pricePerDay: 3000 };
        
        // Calling your helper function
        const price = await getDynamicPrice(
            dummyCar, 
            "2025-12-24T10:00:00", 
            "2025-12-25T10:00:00", 
            "Chennai", 
            "Bangalore"
        );
        
        res.json({ 
            success: true, 
            message: "Node.js successfully communicated with Flask",
            calculatedPrice: price 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: "Communication failed", 
            details: err.message 
        });
    }
});



bookingRouter.post('/check-availability', checkAvailability);
bookingRouter.post('/create', protect, createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/owner', protect, getOwnerBookings);
bookingRouter.post('/change-status', protect, changeBookingStatus);
bookingRouter.post('/generate-price', generatePrice);

// ✅ ADDED: Delete route with 'protect' middleware
bookingRouter.delete('/:id', protect, cancelBooking); 

export default bookingRouter;