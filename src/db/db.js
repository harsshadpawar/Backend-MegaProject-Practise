import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected !");
  } catch (error) {
    console.log("Mongodb connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
