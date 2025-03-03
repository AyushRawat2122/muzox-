import mongoose from "mongoose";

export const connect = async () => {

  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {

    const errorMsg = "MONGO_URI environment variable is not defined.";

    console.error(errorMsg);

    throw new Error(errorMsg);

  }

  try {

    await mongoose.connect(mongoURI, {

    });

    mongoose.connection.on("connected", () => {

      console.info(`Mongoose connected to ${mongoURI}`);

    });

    mongoose.connection.on("error", (error) => {

      console.error("Mongoose connection error:", error);

    });

    console.info("MongoDB connection established successfully.");

  } catch (error) {

    console.error("Failed to connect to MongoDB:", error);

    throw error;

  }

};

export default connect;
