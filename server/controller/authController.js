const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userModel } = require("../model");
const { sendResponse } = require("../utils/middleware");

// SignUp API endpoint
module.exports.signUp = async (req, res) => {
  try {
    let { fullName, email, password } = req?.body;
    // Check if user already exists
    const user = await userModel.findOne({ fullName, email });
    if (user) {
      sendResponse(res, 400, "User already exists");
    } else {
      // Hash the password before storing
      password = await bcrypt.hash(password, parseInt(process?.env?.SALT));
      // Create a new user
      await userModel.create({
        fullName,
        email,
        password,
        profileImage: "",
      });
      sendResponse(res, 201, "User added successfully.", {});
    }
  } catch (err) {
    sendResponse(res, 500, err.message);
  }
};

// SignIn API endpoint
module.exports.signIn = async (req, res) => {
  try {
    let { email, password } = req?.body;
    // Find user by email
    let user = await userModel.findOne({ email });
    if (!user) {
      sendResponse(res, 400, "Please provide valid login credentials.");
    } else {
      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        sendResponse(res, 400, "Please provide valid login credentials.");
      } else {
        // Generate JWT token for authenticated user
        user = JSON.parse(JSON.stringify(user));
        const payload = {
          _id: user?._id,
        };
        const token = jwt.sign(payload, process?.env?.JWT_SECRET);
        user["token"] = token; // Attach token to user object
        sendResponse(res, 200, "User login successfully.", user);
      }
    }
  } catch (err) {
    sendResponse(res, 500, err.message);
  }
};
