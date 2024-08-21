// Importing Mongoose library
const mongoose = require("mongoose");

// Defining an asynchronous function to connect to the database
const connectDB = async () => {
  try {
    // Attempting to connect to MongoDB using the URL from environment variables
    await mongoose.connect(process?.env?.MONGODB_URL);
    console.log("Database connected..."); // Logging success message if connection is successful
  } catch (error) {
    console.log(error?.message); // Logging the error message if connection fails
  }
};

// Exporting the connectDB function to be used in other parts of the application
module.exports = connectDB;


// 
