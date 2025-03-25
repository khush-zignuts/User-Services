const express = require("express");
const router = express.Router();
const userAuthRoutes = require("./Auth/userAuthRoutes");
const itemRoutes = require("./item/itemRoutes");

//authentication
router.use("/auth", userAuthRoutes);

//items
router.use("/item", itemRoutes);

module.exports = router;
