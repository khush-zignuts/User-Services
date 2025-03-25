const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { STATUS_CODES, VALIDATION_RULES } = require("../../config/constant");
const { VALIDATION_RULES } = require("../../config/validationRules");

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
  signup: async (req, res) => {
    try {
      if (!validateRequest(req.body, VALIDATION_RULES.USER, res)) return;

      const { name, email, password, gender, country, city, companyName } =
        req.body;
      console.log("req.body: ", req.body);

      const existingUser = await User.findOne({ where: { email } });
      // const existingAdmin = await Admin.findOne({ where: { email } });

      if (existingUser) {
        return res.json({
          status: STATUS_CODES.BAD_REQUEST,
          message: "Email already in use",
          data: null,
          error: null,
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        gender,
        country,
        city,
        companyName,
      });

      res.json({
        status: STATUS_CODES.CREATED,
        message: "Account created successfully",
        data: newUser,
        error: null,
      });
    } catch (error) {
      console.log(error.message);
      res.json({
        status: STATUS_CODES.SERVER_ERROR,
        message: "Internal server error",
        data: null,
        error: error.message,
      });
    }
  },

  login: async (req, res) => {
    try {
      if (!validateRequest(req.body, VALIDATION_RULES.USER, res)) return;

      const { email, password } = req.body;
      // console.log(" req.body: ", req.body);

      // Validate input
      if (!email || !password) {
        return res.json({
          status: STATUS_CODES.BAD_REQUEST,
          message: "Email and password are required.",
          data: null,
          error: null,
        });
      }

      const user = await User.findOne({ where: { email } });
      // console.log("user: ", user);

      if (!user) {
        return res.json({
          status: STATUS_CODES.UNAUTHORIZED,
          message: "Invalid email or password",
          data: null,
          error: null,
        });
      }

      if (!user.isActive) {
        return res.json({
          status: STATUS_CODES.FORBIDDEN,
          message: "Account is deactivated.",
          data: null,
          error: null,
        });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.json({
          status: STATUS_CODES.UNAUTHORIZED,
          message: "Invalid email or password",
          data: null,
          error: null,
        });
      }

      const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: "1d",
      });

      user.accessToken = token;
      await user.save(); // ✅ Fixed: Now correctly updating instance

      res.json({
        status: STATUS_CODES.OK,
        message: "Login successful",
        data: { token },
        error: null,
      });
    } catch (error) {
      console.log(error.message);
      res.json({
        status: STATUS_CODES.SERVER_ERROR,
        message: "Internal server error",
        data: null,
        error: error.message,
      });
    }
  },

  logout: async (req, res) => {
    try {
      if (!validateRequest(req.body, VALIDATION_RULES.USER, res)) return;

      const { userId } = req.params;

      if (!userId) {
        return res.json({
          status: STATUS_CODES.BAD_REQUEST,
          message: "Invalid credentials",
          data: null,
          error: null,
        });
      }
      // Find user by ID
      const user = await User.findOne({ where: { id: userId } });

      if (!user) {
        return res.json({
          status: STATUS_CODES.NOT_FOUND,
          message: "Invalid credentials",
          data: null,
          error: null,
        });
      }
      if (user.accessToken === null) {
        return res.json({
          status: STATUS_CODES.BAD_REQUEST,
          message: "Already logged out",
          data: null,
          error: null,
        });
      }
      // Set accessToken to NULL (logout)
      await User.update(
        { accessToken: null, isActive: false },
        { where: { id: userId } }
      );

      return res.json({
        status: STATUS_CODES.OK,
        message: "Logout successful",
        data: null,
        error: null,
      });
    } catch (error) {
      console.error("Logout error:", error);
      return res.json({
        status: STATUS_CODES.SERVER_ERROR,
        message: "Server error",
        data: null,
        error: error.message,
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      if (!validateRequest(req.body, VALIDATION_RULES.USER, res)) return;

      const { userId, name, password, gender, country, city, companyName } =
        req.body;

      // Retrieve the user by ID
      const user = await User.findOne({
        where: { id: userId },
      });

      // Check if the user exists
      if (!user) {
        return res.json({
          status: STATUS_CODES.NOT_FOUND,
          message: "User not found",
          data: null,
          error: null,
        });
      }
      // Check if the user is deleted or inactive
      if (user.isDeleted) {
        return res.json({
          status: STATUS_CODES.FORBIDDEN,
          message: "User deleted",
          data: null,
          error: null,
        });
      }

      if (!user.isActive) {
        return res.json({
          status: STATUS_CODES.FORBIDDEN,
          message: "User inactive",
          data: null,
          error: null,
        });
      }

      // Extract fields from request body

      // Validate input lengths
      if (name && name.length > 30) {
        return res.json({
          status: STATUS_CODES.BAD_REQUEST,
          message: "Name length exceeded",
          data: null,
          error: null,
        });
      }

      if (companyName && companyName.length > 64) {
        return res.json({
          status: STATUS_CODES.BAD_REQUEST,
          message: "Company name length exceeded",
          data: null,
          error: null,
        });
      }

      if (req.body.email) {
        return res.json({
          status: STATUS_CODES.BAD_REQUEST,
          message: "Email cannot be updated",
          data: null,
          error: null,
        });
      }

      // Update fields if provided
      if (name) user.name = name;
      if (country) user.country = country;
      if (gender) user.gender = gender;
      if (city) user.city = city;
      if (companyName) user.companyName = companyName;

      // Update password if provided
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      // Save the updated user
      await user.save();

      // Construct the response object with only the specified fields
      const updatedUser = {
        userId: user.id,
        name: user.name,
        password: user.password, // Note: Consider omitting the password in the response for security reasons
        gender: user.gender,
        country: user.country,
        city: user.city,
        companyName: user.companyName,
      };

      res.json({
        status: STATUS_CODES.SUCCESS,
        message: "Profile updated successfully",
        data: updatedUser,
        error: null,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.json({
        status: STATUS_CODES.SERVER_ERROR,
        message: "Server error",
        data: null,
        error: error.message,
      });
    }
  },
};
