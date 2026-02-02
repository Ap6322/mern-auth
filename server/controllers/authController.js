import validator from "validator";
import { userModel } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    const userExist = await userModel.findOne({email})
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

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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

export const login = async(req, res) => {
  try {
    const{email, password} = req.body;
    if(!email || !password){
      return res.status(400).json({success: false, message: "Please enter correct email & Password"});
    }
    const user = await userModel.findOne({email});
    if(!user) {
      return res.status(500).json({
      success: false,
      message: "Invalid email"
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) {
    return res.status(500).json({
      success: false,
      message: "Invalid password"
    });
  }

  const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log("Logged in successfully")
    return res.json({success: true, message: "User logged in successfully!"})

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

};
export const logout = async(req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    console.log("Logged out successfully")
    return res.json({success: true, message: "Logged Out Successfully"});
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}