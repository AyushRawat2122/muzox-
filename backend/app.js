import express, { urlencoded } from "express";
import connect from "./src/database/dbConfig.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import User from "./src/models/user.models.js";
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

//Testing
function notValid(username, email, password) {
  return !username || !email || !password;
}
app.post("/test", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(username, email, password);

    if (notValid(username, email, password)) {
      return res.status(400).send({ message: "Invalid input" });
    }

    console.log("Valid input");

    const user = new User({ username, email, password });
    await user.save();
    console.log("User saved:", user);

    await User.findByIdAndDelete(user._id);
    console.log("User deleted");

    res
      .status(200)
      .send({ message: "User created and deleted (test complete)" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});
