const mongoose = require("mongoose");

// This is the schema definition for User
const userSchema = require("./userModel");

// Creating a Mongoose model named "User" based on userSchema
const userModel = mongoose.model("User", userSchema);

// Exporting the userModel for use in other parts of the application
module.exports = { userModel };
