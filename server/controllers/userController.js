import * as SibApiV3Sdk from '@getbrevo/brevo';
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Car from "../models/Car.js";

// ----------------------------------------------------------------
// 1. Initialize Brevo API
// ----------------------------------------------------------------
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

// Helper: Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};



// ----------------------------------------------------------------
// 1. REGISTER USER
// ----------------------------------------------------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.json({ success: false, message: "Fill all the fields (Password must be 8+ chars)" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user (default role is 'user')
    const user = await User.create({ 
        name, 
        email, 
        password: hashedPassword,
        role: "user" 
    });
    
    const token = generateToken(user._id);
    
    // Return token and user info
    res.json({ 
        success: true, 
        token, 
        user: { name: user.name, email: user.email, role: user.role } 
    });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------
// 2. LOGIN USER (FIXED OWNER LOGIC)
// ----------------------------------------------------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // 2. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    // 3. ✅ OWNER LOGIC (FIXED)
    // If the email is YOURS, we promote to owner immediately.
    // We do NOT check for a specific password anymore.
    if (email.toLowerCase() === "msushiendar@gmail.com") {
      if (user.role !== "owner") {
        user.role = "owner";
        await user.save(); // Save role change to DB
        console.log(`User ${user.email} promoted to OWNER`);
      }
    }

    const token = generateToken(user._id);

    // 4. Send Response
    // We allow the frontend to see the role immediately
    res.json({ 
        success: true, 
        token, 
        user: { 
            name: user.name, 
            email: user.email, 
            role: user.role 
        } 
    });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------
// 3. GET USER DATA
// ----------------------------------------------------------------
export const getUserData = async (req, res) => {
  try {
    // req.user is set by your authMiddleware
    const { user } = req;
    res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------------------
// 4. GET AVAILABLE CARS (User View)
// ----------------------------------------------------------------
export const getCars = async (req, res) => {
  try {
    // Find cars where isAvailable is true
    const cars = await Car.find({ isAvailable: true });
    res.json({ success: true, cars });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


// ----------------------------------------------------------------
// 5. FORGOT PASSWORD (SEND EMAIL)
// ----------------------------------------------------------------
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const secret = process.env.JWT_SECRET + user.password;
        const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '15m' });

        const link = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}`;

        // Create the SendSmtpEmail object
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = "Password Reset Link";
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Password Reset Request</h2>
                <p>Hello ${user.name},</p>
                <p>You requested to reset your password. Click the button below to proceed:</p>
                <a href="${link}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                <p>This link will expire in 15 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>`;
        sendSmtpEmail.sender = { "name": "Car Rental App", "email": "msushiendar@gmail.com" }; // Must be a verified sender in Brevo
        sendSmtpEmail.to = [{ "email": user.email }];

        // Send the email via API
        await apiInstance.sendTransacEmail(sendSmtpEmail);

        res.json({ success: true, message: "Reset link sent to your email" });

    } catch (error) {
        console.error("Brevo Error:", error);
        res.json({ success: false, message: error.message });
    }
};
// ----------------------------------------------------------------
// 6. RESET PASSWORD (VERIFY & UPDATE)
// ----------------------------------------------------------------
export const resetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) return res.json({ success: false, message: "User not found" });

        // Reconstruct the same secret used to sign the token
        const secret = process.env.JWT_SECRET + user.password;
        
        // Verify token
        jwt.verify(token, secret);

        // If valid, hash new password and save
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: "Password updated successfully!" });

    } catch (error) {
        res.json({ success: false, message: "Link expired or invalid" });
    }
};