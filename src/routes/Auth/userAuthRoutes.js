const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  updateUser,
  logout,
} = require("../../controller/Auth/UserAuthController");
const checkUser = require("../../middleware/checkUser");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout/:userId", checkUser, logout);
router.post("/updateUser", checkUser, updateUser);

module.exports = router;
