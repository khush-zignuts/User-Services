const express = require("express");
const {
  addItem,
  updateItem,
  deleteItem,
  getItemById,
  getAllItems,
} = require("../../controller/Item/ItemController");
const checkUser = require("../../middleware/checkUser");

const router = express.Router();

router.post("/addItem", checkUser, addItem);
router.post("/updateItem'", checkUser, updateItem);
router.post("/deleteItem/:id", checkUser, deleteItem);
router.get("/getItemById/:id", getItemById);
router.get("/getAllItems", getAllItems);

module.exports = router;
