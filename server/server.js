import express from "express";
import "dotenv/config";
import cors from "cors"; 
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js"; 
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import testimonialRouter from "./routes/testimonialroutes.js";

// 1. ✅ Initialize App FIRST (This was the error!)
const app = express();
const PORT = process.env.PORT || 4000;

// 2. Connect Database
connectDB();

// 3. Define Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
  "https://frontend-delta-coral-30.vercel.app" // Your Vercel URL
];

// 4. ✅ Apply CORS Middleware (Use app AFTER initializing it)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true 
}));

// 5. Standard Middleware
app.use(express.json());

// 6. Routes
app.get("/", (req, res) => res.send("API is running..."));
app.use("/api/user", userRouter); 
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use('/api/testimonials', testimonialRouter);

// 7. Start Server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));