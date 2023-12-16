import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  password: String,
});
const userModel = mongoose.model("user", userSchema);

export default userModel;
