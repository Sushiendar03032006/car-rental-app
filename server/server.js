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

// ... imports

// 3. ✅ Smart CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like Postman or mobile apps)
    if (!origin) return callback(null, true);

    // 2. Allow Localhost (for development)
    if (origin.includes('localhost')) {
      return callback(null, true);
    }

    // 3. Allow ANY Vercel deployment (Production & Previews)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // 4. Block everything else
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ... rest of your code

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