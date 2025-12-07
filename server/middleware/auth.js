import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  try {
    // 1. Get token from header (Handle "Bearer <token>" format)
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    // 2. ✅ FIX: Use verify, not decode!
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};