const router = require("express").Router();
const { signUpValidation, signInValidation } = require("../utils/validator/userValidator");
const { signUp, signIn } = require("../controller/authController");

// Route for user signup
router.route("/signup").post(signUpValidation, signUp);

// Route for user signin
router.route("/signin").post(signInValidation, signIn);

module.exports = router;
