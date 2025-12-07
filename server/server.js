import express from "express";
import "dotenv/config";

import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js"; 
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import testimonialRouter from "./routes/testimonialroutes.js";

// server.js

import cors from "cors"; // Ensure this is imported

// Add your Vercel URL to this list
const allowedOrigins = [
  "http://localhost:5173",  // For local testing
  "http://localhost:4000",
  "https://frontend-delta-coral-30.vercel.app"// 👈 ADD YOUR VERCEL URL HERE
         
];

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
  credentials: true // Important for cookies/sessions
}));

const app = express();
const PORT = process.env.PORT || 4000; // ✅ Changed to 4000 to avoid React conflict

// Connect Database
connectDB();

// Middleware
app.use(cors()); // Allow all origins for dev
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("API is running..."));
app.use("/api/user", userRouter); 
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);


// ... inside app.use section
app.use('/api/testimonials', testimonialRouter);

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));