import "dotenv/config";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "./models/userModel.js";
import multer from "multer";
import connectDB from "./db.js";
import cookieParser from "cookie-parser";
import { createToken, validateToken } from "./jwt.js";
await connectDB();

const app = express();
app.use(cookieParser());

// Use both JSON and urlencoded middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Base Url Successfull");
});

//
app.post("/register", async (req, res) => {
  const { name, username, password } = req.body;
  console.log("Request Body", req.body);

  try {
    const hash = await bcrypt.hash(password, 8);
    const newUser = new userModel({
      name: name,
      username: username,
      password: hash,
    });

    newUser
      .save()
      .then((result) => {
        console.log("User saved:", result);
        res.json("User Saved");
      })
      .catch((error) => {
        console.error("Error saving user:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  } catch (err) {
    console.error("Error hashing password:", err);
    res.status(400).json({ error: err.message || "Something went wrong" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  try {
    // Find the user by username
    const user = await userModel.findOne({ username: username });

    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: "Wrong username and password combination" });
    } else {
      // Generate a token and set it as a cookie
      const accessToken = createToken(user);
      res.cookie("access-token", accessToken, { maxAge: 60 * 60 * 24 * 30 * 1000, httpOnly: true });
      res.status(200).json({ message: "Login successful" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//
app.get("/profile", validateToken, (req, res) => {
  res.json("profile");
});
app.listen(5000, () => {
  console.log("JWT- SERVER STARTED AT 5000");
});
