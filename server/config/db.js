import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("✅ MongoDB Connected"));
    
    // Ensure your .env has MONGODB_URI
    await mongoose.connect(`${process.env.MONGODB_URI}/car-rental`);
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;