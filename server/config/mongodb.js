import mongoose from "mongoose";

export const connectDB = async() => {
    try {
        mongoose.connection.on("connected",()=> {
            console.log("Database Connected Successfully!")
        })
        mongoose.connection.on("error",(error)=> {
            console.error("Database disconnected!", error)
        })
        mongoose.connection.on("disconnected",()=> {
            console.warn("Database disconnected!")
        })
        await mongoose.connect(`${process.env.MONGODB_URI}`);
    } catch (error) {
        console.error("Initial MongoDB connection failed:", error)
        process.exit(1);
    }
}