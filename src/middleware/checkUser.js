require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const checkUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log("authHeader: ", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];
    // console.log("token: ", token);

    if (!token) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("decoded: ", decoded);

    const user = await User.findOne({
      where: { id: decoded.id },
      // attributes: ["id"],
    });
    // console.log("user: ", user);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    try {
      if (user.accessToken === token) {
        console.log("Token matches!");
      } else {
        console.log("Token does not match.");
      }
    } catch (error) {
      console.error({ message: "Unauthorized access" });
    }

    // // Set admin on request object
    req.user = user;

    next(); // Proceed if user
  } catch (error) {
    res.status(401).json({ message: "Unauthorized access" });
  }
};

module.exports = checkUser;
