import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  message: { type: String, required: true },
  // We will use a default image or user image logic later
  rating: { type: Number, default: 5 } 
}, { timestamps: true });

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;