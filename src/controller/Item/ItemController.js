const { STATUS_CODES } = require("../../config/constant");
const { VALIDATION_RULES } = require("../../config/validationRules");
const Item = require("../../models/Item");

const Validator = require("validatorjs");
const validateRequest = (data, rules, res) => {
  const validation = new Validator(data, rules);
  if (validation.fails()) {
    res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ message: validation.errors.all() });
    return false;
  }
  return true;
};

module.exports = {
  addItem: async (req, res) => {
    try {
      if (!validateRequest(req.body, VALIDATION_RULES.ITEM, res)) return;

      const { name, category, subcategory, description } = req.body;

      // Check if the item already exists
      const existingItem = await Item.findOne({
        where: { name, category, subcategory, isDeleted: false },
      });
      if (existingItem) {
        return res.json({
          status: STATUS_CODES.CONFLICT,
          message: "Item already exists.",
          data: null,
          error: null,
        });
      }

      const newItem = await Item.create({
        name,
        category,
        subcategory,
        description,
      });
      return res.json({
        status: STATUS_CODES.CREATED,
        message: "Item added successfully",
        data: newItem,
        error: null,
      });
    } catch (error) {
      console.error("Error adding item:", error);
      return res.json({
        status: STATUS_CODES.SERVER_ERROR,
        message: "Internal server error",
        data: null,
        error: error.message,
      });
    }
  },
  // Update an existing item
  updateItem: async (req, res) => {
    try {
      if (!validateRequest(req.body, VALIDATION_RULES.ITEM, res)) return;

      const { id, name, category, subcategory, description } = req.body;
      console.log("req.body: ", req.body);
      const item = await Item.findOne({ where: { id, isDeleted: false } });

      if (!item) {
        return res.json({
          status: STATUS_CODES.NOT_FOUND,
          message: "Item not found.",
          data: null,
          error: null,
        });
      }

      item.name = name || item.name;
      item.category = category || item.category;
      item.subcategory = subcategory || item.subcategory;
      item.description = description || item.description;

      await item.save();

      return res.json({
        status: STATUS_CODES.SUCCESS,
        message: "Item updated successfully.",
        data: item,
        error: null,
      });
    } catch (error) {
      console.error("Error updating item:", error);
      return res.json({
        status: STATUS_CODES.SERVER_ERROR,
        message: "Internal server error.",
        data: null,
        error: error.message,
      });
    }
  },
  // Delete an item
  deleteItem: async (req, res) => {
    try {
      if (!validateRequest(req.body, VALIDATION_RULES.ITEM, res)) return;
      const { id } = req.params;
      const [deleted] = await Item.update(
        { isDeleted: true },
        { where: { id, isDeleted: false } }
      );
      if (deleted) {
        return res.json({
          status: STATUS_CODES.SUCCESS,
          message: "Item marked as deleted successfully",
          data: null,
          error: null,
        });
      }
      return res.json({
        status: STATUS_CODES.NOT_FOUND,
        message: "Item not found or already deleted",
        data: null,
        error: null,
      });
    } catch (error) {
      console.error("Error marking item as deleted:", error);
      return res.json({
        status: STATUS_CODES.SERVER_ERROR,
        message: "Internal server error",
        data: null,
        error: error.message,
      });
    }
  },
  // Retrieve an item by ID
  getItemById: async (req, res) => {
    try {
      if (!validateRequest(req.body, VALIDATION_RULES.ITEM, res)) return;

      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { id } = req.params;

      const { count, rows: item } = await Item.findAndCountAll({
        where: { id, isDeleted: false },
        attributes: ["id", "name", "category", "subcategory", "description"],
        offset: parseInt(offset, 10),
        limit: parseInt(limit, 10),
      });

      if (item) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: "Item retrieved successfully",
          data: item,
          totalRecords: count,
          currentPage: parseInt(page, 10),
          totalPages: Math.ceil(count / limit),
          error: null,
        });
      }

      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: "Item not found",
        data: null,
        error: null,
      });
    } catch (error) {
      console.error("Error retrieving item:", error);
      return res.json({
        status: STATUS_CODES.SERVER_ERROR,
        message: "Internal server error",
        data: null,
        error: error.message,
      });
    }
  },
  // Retrieve all items
  getAllItems: async (req, res) => {
    try {
      if (!validateRequest(req.body, VALIDATION_RULES.ITEM, res)) return;

      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: items } = await Item.findAndCountAll({
        where: { isDeleted: false },
        attributes: ["id", "name", "category", "subcategory", "description"],
        offset: parseInt(offset, 10),
        limit: parseInt(limit, 10),
      });

      if (items) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: "Items retrieved successfully",
          data: items,
          totalRecords: count,
          currentPage: parseInt(page, 10),
          totalPages: Math.ceil(count / limit),
          error: null,
        });
      }
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: "Items not found",
        data: null,
        error: null,
      });
    } catch (error) {
      console.error("Error retrieving items:", error);
      return res.json({
        status: STATUS_CODES.SERVER_ERROR,
        message: "Internal server error",
        data: null,
        error: error.message,
      });
    }
  },
};
