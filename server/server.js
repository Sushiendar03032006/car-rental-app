import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js"; 
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import testimonialRouter from "./routes/testimonialroutes.js";

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