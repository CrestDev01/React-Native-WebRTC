const { userModel } = require("../model");
const { sendResponse } = require("../utils/middleware");

// Fetch a specific user by ID
module.exports.user = async (req, res) => {
  try {
    const userData = await userModel.findOne({ _id: req?.params?.id });
    if (userData?.profileImage) {
      userData.profileImage = `${req.protocol}://${req.get(
        "host"
      )}/public/uploads/${userData.profileImage}`;
    }
    sendResponse(res, 200, "User found successfully.", userData);
  } catch (err) {
    sendResponse(res, 500, err.message);
  }
};

// Fetch all users except the authenticated user
module.exports.allUser = async (req, res) => {
  try {
    let userData = await userModel.find({ _id: { $ne: req?.userId } });
    userData = userData.map((user) => {
      if (user.profileImage) {
        user.profileImage = `${req.protocol}://${req.get(
          "host"
        )}/public/uploads/${user.profileImage}`;
      }
      return user;
    });

    sendResponse(res, 200, "User found successfully.", userData);
  } catch (err) {
    sendResponse(res, 500, err.message);
  }
};

// Update user profile image
module.exports.profile = async (req, res) => {
  try {
    const profileImage = req?.file?.filename;

    // Create new user with uploaded profile image
    const newUser = await userModel.findByIdAndUpdate(
      { _id: req.userId },
      { $set: { profileImage } }
    );

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
