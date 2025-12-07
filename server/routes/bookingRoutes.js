import express from "express";
import { 
    changeBookingStatus, 
    checkAvailabilityOfCar, 
    createBooking, 
    getOwnerBookings, 
    getUserBookings, 
    generatePrice, 
    cancelBooking 
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityOfCar);
bookingRouter.post('/create', protect, createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/owner', protect, getOwnerBookings);
bookingRouter.post('/change-status', protect, changeBookingStatus);
bookingRouter.post('/generate-price', generatePrice);

// ✅ ADDED: Delete route with 'protect' middleware
bookingRouter.delete('/:id', protect, cancelBooking); 

export default bookingRouter;