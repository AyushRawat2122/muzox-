import express, { urlencoded } from "express";
import connect from "./database/dbConfig.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config({
  debug: process.env.DEBUG,
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/welcome-to-my-app", (req, res) => {
  res.send("Welcome to my app");
});

const startServer = async () => {
  try {
    await connect();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
