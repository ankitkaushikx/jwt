import mongoose from "mongoose";
const connectDB = async () => {
  try {
    const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@transercluster.wx8lrro.mongodb.net/jwt?retryWrites=true&w=majority`;
    await mongoose.connect(uri);
    console.log("DATABASE CONNECTED SUCCESSFULLY...");
  } catch (error) {
    console.error("Database Connection Error", error);
  }
};

export default connectDB;
