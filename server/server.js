import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/mongodb.js";
import { authRouter } from "./routes/authRoutes.js";

const app = express();

const port = process.env.PORT || 8081;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true}));

app.get("/", (req, res) => {
  console.log("Server running..")
  res.send("API Working");
})
app.use("/api/auth", authRouter);
app.listen(port, () => {
  console.log(`Server listen at http://localhost:${8081}`);
})