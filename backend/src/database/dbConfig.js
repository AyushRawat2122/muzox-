// src/database/dbConfig.js
import mongoose from "mongoose";

let isConnected = false;

export const connect = async () => {
  console.log("🔁 connect() called, readyState:", mongoose.connection.readyState);

  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    const errorMsg = "MONGO_URI environment variable is not defined.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Already connected?
  if (isConnected || mongoose.connection.readyState === 1) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  try {
    await mongoose.connect(mongoURI);

    isConnected = true;
    console.log("🚀 MongoDB connection established successfully.");

    mongoose.connection.on("connected", () => {
      console.log("✅ Mongoose connected");
      isConnected = true;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ Mongoose disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.info("🔁 Mongoose reconnected");
      isConnected = true;
    });

    mongoose.connection.on("error", (error) => {
      console.error("❌ Mongoose connection error:", error);
      isConnected = false;
    });

  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    throw error;
  }
};

export default connect;
