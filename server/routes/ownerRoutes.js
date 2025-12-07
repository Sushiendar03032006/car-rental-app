import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js"; // ⭐ CRITICAL FIX: Import the upload middleware

// ⭐ CRITICAL FIX: Import all necessary controller functions
import { 
    changeRoleToOwner, 
    addCar, 
    getOwnerCars, 
    toggleCarAvailability, 
    deleteCar, 
    getDashboardData, 
    updateUserImage 
} from "../controllers/ownerController.js"; 

const ownerRouter = express.Router();


ownerRouter.get("/test", (req, res) => res.send("Owner route working ✅"));
ownerRouter.post("/changeRole",protect, changeRoleToOwner);

// The 'upload' middleware is now correctly defined in this file's scope
ownerRouter.post("/add-car", protect, upload.single("image"), addCar);

ownerRouter.get("/cars", protect, getOwnerCars)
ownerRouter.post("/toggle-car", protect, toggleCarAvailability)
ownerRouter.post("/delete-car", protect, deleteCar)

ownerRouter.get('/dashboard', protect, getDashboardData)
ownerRouter.post('/update-image', upload.single("image"), protect, updateUserImage)


console.log("✅ ownerRoutes.js loaded successfully");

export default ownerRouter;