import "dotenv/config";
import JWT from "jsonwebtoken";
const { sign, verify } = JWT;

export function createToken(user) {
  const accessToken = sign({ username: user.username }, process.env.JWTSECRET);
  return accessToken;
}

export function validateToken(req, res, next) {
  console.log("Request Cookies", req.cookies);
  const accessToken = req.cookies["access-token"];
  if (!accessToken) {
    res.status(400).json({ message: "User Not Authenticated" });
  }

  try {
    const validateToken = verify(accessToken, process.env.JWTSECRET);
    if (validateToken) {
      req.authenticate = true;
      return next();
    }
  } catch (error) {
    console.error("Validation Error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
