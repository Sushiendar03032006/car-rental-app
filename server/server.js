import express from "express";
import "dotenv/config";
import cors from "cors"; // ✅ Keep this import
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js"; 
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import testimonialRouter from "./routes/testimonialroutes.js";

// 1. Initialize App
const app = express();
const PORT = process.env.PORT || 4000;

// 2. Connect Database
connectDB();

// 3. ✅ CORS Configuration
const corsOptions = {
  origin: [
    'https://frontend-psp6a2xia-sushiendars-projects.vercel.app', // Your specific Vercel link
    'https://frontend-delta-coral-30.vercel.app', // Your other link (optional)
    'http://localhost:5173', // Vite local
    'http://localhost:3000'  // React generic local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// 4. Standard Middleware
app.use(express.json());

// 5. Routes
app.get("/", (req, res) => res.send("API is running..."));
app.use("/api/user", userRouter); 
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use('/api/testimonials', testimonialRouter);

// 6. Start Server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));