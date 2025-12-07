import express from "express";
// ⭐ FIX: Add 'getCars' to the import list
import { getCars, getUserData, loginUser, registerUser } from "../controllers/userController.js"; 
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);
userRouter.get('/data', protect, getUserData);

// The 'getCars' function is now defined in the scope of this file
userRouter.get('/cars', getCars) 

export default userRouter;