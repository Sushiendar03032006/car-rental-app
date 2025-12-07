import Car from "../models/Car.js";
import User from "../models/user.js";
import Booking from "../models/Booking.js";
import imagekit from "../config/imageKit.js"; 
import fs from "fs";

// 1. ADD CAR (with Image Upload)
export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;
    // Frontend sends JSON string in FormData, so we parse it
    const carData = JSON.parse(req.body.carData); 
    const imageFile = req.file;

    if (!imageFile) return res.json({ success: false, message: "Image is required" });

    // Upload to ImageKit
    const fileBuffer = fs.readFileSync(imageFile.path);
    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: `car-${Date.now()}-${imageFile.originalname}`,
      folder: "/cars"
    });

    const image = uploadResponse.url;

    await Car.create({ ...carData, owner: _id, image });
    
    // Clean up local file
    fs.unlinkSync(imageFile.path);

    res.json({ success: true, message: "Car Added Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// 2. GET OWNER CARS
export const getOwnerCars = async (req, res) => {
    try {
        const cars = await Car.find({ owner: req.user._id });
        res.json({ success: true, cars });
    } catch (err) { res.json({ success: false, message: err.message }); }
};

// 3. CHANGE ROLE (Admin Only)
export const changeRoleToOwner = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === "msushiendar@gmail.com" && password === "susi@2006") {
            const user = await User.findOne({ email });
            if(user) {
                user.role = "owner";
                await user.save();
                return res.json({ success: true, message: "Role Updated to Owner" });
            }
        }
        res.json({ success: false, message: "Invalid Admin Credentials" });
    } catch (err) { res.json({ success: false, message: err.message }); }
};

// 4. DELETE CAR
export const deleteCar = async (req, res) => {
    try {
        const { carId } = req.body;
        await Car.findByIdAndDelete(carId);
        res.json({ success: true, message: "Car Deleted" });
    } catch (err) { res.json({ success: false, message: err.message }); }
};

// 5. ⚠️ FIX: GET DASHBOARD DATA (Calculates Pending, Confirmed, & Recent)
export const getDashboardData = async (req, res) => {
    try {
        const ownerId = req.user._id;
        console.log("----- DASHBOARD DEBUG -----");
        console.log("1. Logged In Owner ID:", ownerId);

        // 1. Check if ANY cars exist for this owner
        const totalCars = await Car.countDocuments({ owner: ownerId });
        console.log("2. Total Cars Found:", totalCars);

        // 2. Check if ANY bookings exist for this owner
        const totalBookings = await Booking.countDocuments({ owner: ownerId });
        console.log("3. Total Bookings Found:", totalBookings);

        // 3. Check Statuses (Using case-insensitive Regex to fix "Confirmed" vs "confirmed")
        const pendingBookings = await Booking.countDocuments({ 
            owner: ownerId, 
            status: { $regex: /^pending$/i } 
        });
        const confirmedBookings = await Booking.countDocuments({ 
            owner: ownerId, 
            status: { $regex: /^confirmed$/i } 
        });
        const cancelledBookings = await Booking.countDocuments({ 
            owner: ownerId, 
            status: { $regex: /^cancelled$/i } 
        });

        console.log("4. Status Counts -> Pending:", pendingBookings, "Confirmed:", confirmedBookings, "Cancelled:", cancelledBookings);

        // 4. Fetch Recent Bookings
        const recentBookings = await Booking.find({ owner: ownerId })
            .populate("car", "brand model image") 
            .populate("user", "name email")       
            .sort({ createdAt: -1 })              
            .limit(5);
        
        console.log("5. Recent Bookings Found:", recentBookings.length);

        // 5. Calculate Revenue
        const revenueData = await Booking.aggregate([
            { 
                $match: { 
                    owner: ownerId, 
                    // Match "confirmed" or "Confirmed"
                    status: { $regex: /^confirmed$/i } 
                } 
            },
            { $group: { _id: null, totalRevenue: { $sum: "$price" } } }
        ]);
        const monthlyRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
        console.log("6. Calculated Revenue:", monthlyRevenue);

        res.json({
            success: true,
            dashboardData: {
                totalCars,
                totalBookings,
                pendingBookings,
                completedBookings: confirmedBookings,
                cancelledBookings,
                recentBookings,
                monthlyRevenue
            }
        });

    } catch (err) { 
        console.error("DASHBOARD ERROR:", err);
        res.json({ success: false, message: err.message }); 
    }
};

// 6. TOGGLE AVAILABILITY
export const toggleCarAvailability = async (req, res) => {
    try {
        const { carId } = req.body;
        const car = await Car.findById(carId);
        if(car) {
            car.isAvailable = !car.isAvailable; 
            await car.save();
            res.json({ success: true, message: "Availability Toggled" });
        } else {
            res.json({ success: false, message: "Car not found" });
        }
    } catch (err) { res.json({ success: false, message: err.message }); }
};

// 7. UPDATE PROFILE IMAGE (Placeholder)
export const updateUserImage = async (req, res) => {
     res.json({ success: true, message: "Profile Image Updated" });
};