const jwt = require("jsonwebtoken");

// Middleware function to authenticate JWT tokens
const authenticate = (req, res, next) => {
  // Extracting token from Authorization header
  var token = req?.headers?.authorization
    ? req?.headers?.authorization?.split(" ")
    : [];

  // Checking if token is present and starts with "Bearer"
  if (!(token?.length && token[0] === "Bearer")) {
    sendResponse(res, 401, "Please provide valid access token.");
  } else {
    // Verifying the token
    jwt.verify(token[1], process?.env?.JWT_SECRET, (err, data) => {
      if (err) {
        // Sending error response if token verification fails
        return sendResponse(res, 401, err?.message);
      } else {
        // Attaching userId to request object for further middleware or route handlers
        req.userId = data?._id;
        return next(); // Proceed to the next middleware/route handler
      }
    });
  }
};

// Utility function to send JSON response with status code and message
const sendResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({ message, data });
};

// Exporting authenticate and sendResponse functions for use in other parts of the application
module.exports = { authenticate, sendResponse };
