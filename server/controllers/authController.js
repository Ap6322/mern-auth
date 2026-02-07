import validator from "validator";
import { userModel } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { transporter } from "../config/nodemailer.js";
import crypto from "crypto";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const userExist = await userModel.findOne({ email });
    if (userExist) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    console.log(user);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL, // must be verified in Brevo
      to: email,
      subject: `Welcome to Aakash Tech! Your Account has been Created`,
      html: `
    <h2>Welcome to Aakash Tech</h2>
    <p>Your account has been successfully created with:</p>
    <p><b>Email:</b> ${email}</p>
    <br/>
    <p>Thanks for joining us!</p>
  `,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Welcome email sent:", info.messageId);
    } catch (mailErr) {
      console.error("❌ Error sending welcome email:", mailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter correct email & Password",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "Invalid email",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(500).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log("Logged in successfully");
    return res.json({ success: true, message: "User logged in successfully!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    console.log("Logged out successfully");
    return res.json({ success: true, message: "Logged Out Successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Send dverification OTP to the user's Email

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account Already Verified." });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    // Hash OTP before saving
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.verifyOtp = hashedOtp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL, // must be verified in Brevo
      to: user.email,
      subject: `Account Verification OTP`,
      html: `
    <h2>Welcome to Aakash Tech</h2>
    <p>Your OTP is ${otp}. Verify your account using this OTP.</p>
    <p>This OTP is valid for 10 Minutes only.</p>
    <p>Do not share with anyone</p>
    <p><b>Email:</b> ${user.email}</p>
    <br/>
    <p>Thanks for joining us!</p>
  `,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Verification OTP sent on email:", info.messageId);
    } catch (mailErr) {
      console.error("Email error:", mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Verification OTP sent to email",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
