import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const bookingSchema = new mongoose.Schema({
    car: {type: ObjectId, ref: "Car", required: true},
    user: {type: ObjectId, ref: "User", required: true},
    owner: {type: ObjectId, ref: "User", required: true},
    
    pickupDate: {type: Date, required: true},
    returnDate: {type: Date, required: true},
    
    // ✅ ADDED: Store location details from the booking form
    startLocation: {type: String, default: ""},
    endLocation: {type: String, default: ""},

    // ✅ ADDED: Store Customer Phone Number
    phone: {type: String, required: true},

    status: {type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending"},
    
    // ✅ This handles your Dynamic Price
    price: {type: Number, required: true}
},{timestamps: true})

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking