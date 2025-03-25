const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Import DB connection
const CommonFields = require("./CommanFields");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM("Male", "Female", "Other"),
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  companyName: {
    type: DataTypes.STRING(64),
    allowNull: true,
    required: false,
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ...CommonFields,
});

module.exports = User;
