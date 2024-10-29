const express = require("express");
const verifyController = require("../controllers/verifyController");
const router = express.Router();

router.get("/verify-email/:token", verifyController.verifyEmail);

router.patch("/update-email", verifyController.updateEmail);

module.exports = router;
