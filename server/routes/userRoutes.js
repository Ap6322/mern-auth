import express from "express";
import { getUserData } from "../controllers/userController.js";
import { userAuth } from "../middleware/userAuth.js";

export const userRouter = express.Router();

userRouter.get('/data',userAuth, getUserData);