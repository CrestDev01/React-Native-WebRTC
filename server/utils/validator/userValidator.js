const { sendResponse } = require("../middleware"); // Importing sendResponse utility function
const Joi = require("joi"); // Importing Joi for schema validation

// Middleware function for validating signup request
const signUpValidation = (req, res, next) => {
  try {
    // Define Joi schema for signup data validation
    const schema = Joi.object({
      fullName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(5).required(),
    });

    // Validate request body against schema
    const { error } = schema.validate(req?.body, { abortEarly: false });

    // If validation error exists, send a 400 Bad Request response
    if (error) {
      sendResponse(res, 400, error?.message?.replace(/[^\w\s]/gi, ""));
    } else {
      next(); // Proceed to the next middleware/route handler if validation succeeds
    }
  } catch (err) {
    sendResponse(res, 500, err?.message); // Handle unexpected errors with a 500 Internal Server Error response
  }
};

// Middleware function for validating signin request
const signInValidation = (req, res, next) => {
  try {
    // Define Joi schema for signin data validation
    const schema = Joi.object({
      email: Joi.string().email().trim().required(),
      password: Joi.string().min(5).trim().required(),
    });

    // Validate request body against schema
    const { error } = schema.validate(req?.body, { abortEarly: false });

    // If validation error exists, send a 400 Bad Request response
    if (error) {
      sendResponse(res, 400, error?.message?.replace(/[^\w\s]/gi, ""));
    } else {
      next(); // Proceed to the next middleware/route handler if validation succeeds
    }
  } catch (err) {
    sendResponse(res, 500, err?.message); // Handle unexpected errors with a 500 Internal Server Error response
  }
};

// Exporting signup and signin validation middleware functions
module.exports = { signUpValidation, signInValidation };
