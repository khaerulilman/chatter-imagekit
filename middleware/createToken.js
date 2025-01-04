import jwt from "jsonwebtoken";
import db from "../config/db.js";

const getAdjustedWIBTime = (utcDate) => {
  const offsetAdjustedWIB = 6 * 60 * 60 * 1000; // UTC+6 (reduced 1 hour from standard UTC+7)
  return new Date(utcDate.getTime() + offsetAdjustedWIB);
};


const authenticateUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  try {
    const currentTimeUTC = new Date(); // Current time in UTC
    const currentTimeWIB = getAdjustedWIBTime(currentTimeUTC); // Convert to adjusted WIB

    // Check if the token is in the blacklist
    const blacklistedToken = await db`
      SELECT * FROM token_blacklist 
      WHERE token = ${token} 
      AND expires_at > ${currentTimeWIB.toISOString()}
    `;

    if (blacklistedToken.length > 0) {
      return res.status(400).json({ message: "Token has been invalidated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};


export default authenticateUser;
