import "dotenv/config";
import express from "express";
import userModel from "./models/userModel.js";
import bcrypt from "bcrypt";
import { createToken, validateToken } from "./jwt.js";
import cookieParser from "cookie-parser";
import connectDB from "./db.js";
await connectDB();
const app = express();
app.use(express.json());
app.use(express.json({ urlencoded: true }));
app.use(cookieParser());

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
  console.log("BODY", req.body);
  const user = userModel.findOne({ where: { username: username } });

  if (!user) res.status(400).json({ error: "User Doesn't Exist" });

  const dbPassword = user.password;
  bcrypt.compare(password, dbPassword).then((match) => {
    if (!match) {
      res.status(400).json({ error: "Wrong Username and Password Combination!" });
    } else {
      const accessToken = createToken(user);

      res.cookie("access-token", accessToken, {
        maxAge: 60 * 60 * 24 * 30 * 1000,
        httpOnly: true,
      });

      res.json("LOGGED IN");
    }
  });
});

app.get("/profile", validateToken, (req, res) => {
  res.json("profile");
});
//
app.listen(process.env.PORT, () => {
  console.log("SERVER STARTED SUCCESSFULLY AT", process.env.PORT);
});
