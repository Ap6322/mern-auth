import express from "express";
import { login, logout, register, sendVerifyOtp, verifyEmail } from "../controllers/authController.js";
import { userAuth } from "../middleware/userAuth.js";

export const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-Otp',userAuth,sendVerifyOtp);
authRouter.post('/verify-account',userAuth, verifyEmail);