const router = require("express").Router();
const { allUser, user, profile } = require("../controller/userController");
const { authenticate } = require("../utils/middleware");
const multer = require("multer");
const path = require("path");

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage });

// Route to get all users except the authenticated user
router.route("/user").get(authenticate, allUser);

// Route to get user details by ID
router.route("/:id").get(authenticate, user);

// Route to change user profile image
router.route("/profile").put(upload.single("profileImage"), authenticate, profile);

module.exports = router;
