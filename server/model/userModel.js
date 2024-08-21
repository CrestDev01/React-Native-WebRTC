const mongoose = require("mongoose");

// Defining the schema structure for the User entity
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String, // Assuming storing image URL as a string
    },
  },
  {
    collection: "User",   // Name of the MongoDB collection
    timestamps: true,     // Adds createdAt and updatedAt fields
    versionKey: false,    // Removes the __v field added by default
  }
);

module.exports = userSchema;
