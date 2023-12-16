import "dotenv/config";
import pkg from "jsonwebtoken";
const { sign, verify } = pkg;
export function createToken(user) {
  const accessToken = sign({ username: user.username }, process.env.JWTSECRET);
  return accessToken;
}

export const validateToken = (req, res, next) => {
  const accessToken = req.cookies["access-token"];
  if (!accessToken) {
    return res.status(400).json({ error: "User not Aunthenticated" });
  }
  try {
    const validToken = verify(accessToken, process.env.JWTSECRET);
    if (validToken) {
      req.authenticated = true;
      return next();
    }
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};
