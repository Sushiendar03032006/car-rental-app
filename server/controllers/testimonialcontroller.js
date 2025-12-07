import Testimonial from "../models/testimonial.js";


// Get all testimonials
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 }); // Newest first
    res.json({ success: true, testimonials });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Add a new testimonial
export const addTestimonial = async (req, res) => {
  try {
    const { name, location, message } = req.body;
    
    const newTestimonial = new Testimonial({
      name,
      location,
      message
    });

    await newTestimonial.save();
    res.json({ success: true, message: "Review added successfully!" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};