//imports

import express  from "express";
import connect from "./src/database/dbConfig.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import userRouter from "./src/router/user.routes.js";
import SongRouter from "./src/router/song.routes.js";
dotenv.config({
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares

app.use(express.urlencoded({ extended: true,limit:'16kb' }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));


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
//Testing
app.use('/api/muzox-/user',userRouter);
app.use('/api/muzox-/songs',SongRouter);
