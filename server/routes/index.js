const router = require("express").Router();

// Exporting all routes generally
router.use("/", require("./auth"));
router.use("/", require("./user"));

module.exports = router;
