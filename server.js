import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import userModel from "./models/userModel.js";
import bcrypt from "bcrypt";
import { createToken, validateToken } from "./jwt.js";
import cookieParser from "cookie-parser";
import connectDB from "./db.js";
await connectDB();
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json("Base Route ");
});

app.post("/register", (req, res) => {
  const { name, username, password } = req.body;
  console.log("REQUEST BODY", req.body);
  try {
    bcrypt.hash(password, 10).then((hash) => {
      const user = new userModel({
        name: name,
        username: username,
        password: hash,
      });
      user
        .save()
        .then((result) => {
          console.log(result);
          res.json({ message: "User Saved Successfully" });
        })
        .catch((error) => {
          console.log("User Saving Error", error);
          res.status(500).json({ message: "Internal Server Error" });
        });
    });
  } catch (error) {
    res.status(400).json({ error: err.message || "Something went wrong" });
  }
});

//
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userModel.findOne({ username: username });

    if (!user) {
      return res.status(400).json({ error: "No User Exist" });
    }

    const dbPassword = user.password;

    const match = await bcrypt.compare(password, dbPassword);

    if (!match) {
      return res.status(400).json({ error: "Wrong Password" });
    } else {
      const accessToken = createToken(user);
      res.cookie("access-token", accessToken, { maxAge: 60 * 60 * 24 * 30 * 1000, httpOnly: true });
      res.json("Logged IN");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.get("/profile", validateToken, (req, res) => {
  res.json("profile");
});
//

app.get("/set-cookie", (req, res) => {
  res.cookie("myNewCookie", "Thisismynewcookie", {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    path: "/d",
    domain: "localhost",
  });
  res.cookie("acookie", "randompassword");
  res.json("Cookie Setted");
});

app.get("/get-cookie", (req, res) => {
  console.log(req.cookies);
  res.json({ cookie: req.cookies, message: "Cookie Here" });
});

app.get("/del-cookie", (req, res) => {
  res.clearCookie("alsocookie");
  res.clearCookie("myNewCookie");
  res.json("Cookie Cleared");
});
//
app.listen(process.env.PORT, () => {
  console.log("SERVER STARTED SUCCESSFULLY AT", process.env.PORT);
});
