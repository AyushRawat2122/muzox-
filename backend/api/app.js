//imports
import cors from "cors";
import express from "express";
import connect from "../src/database/dbConfig.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import errorHandler from "../src/middlewares/errorHandler.js";
import userRouter from "../src/router/user.routes.js";
import SongRouter from "../src/router/song.routes.js";
import PlaylistRouter from "../src/router/playlist.routes.js";
import mongoose from "mongoose";

mongoose.set("debug", true);
dotenv.config({});

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: [
      "https://muzox.vercel.app",
      "https://muzox-2l00mz7wk-ayushs-projects-dc209762.vercel.app",
      "https://localhost:5173",
    ],
    credentials: true, // Cookies allow karni ho toh
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Jo methods allow karni ho
    allowedHeaders: ["Content-Type", "Authorization"], // Jo headers allow karne ho
  })
);
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
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

app.get("/", (req, res) => {
  res.send("hii");
});

//Testing
app.use("/api/muzox-/user", userRouter);
app.use("/api/muzox-/songs", SongRouter);
app.use("/api/muzox-/playlist", PlaylistRouter);

//error in json format :}

app.use(errorHandler);

export default app;
