const express = require("express");
const verifyController = require("../controllers/verifyController");
const router = express.Router();

router.get("/verify-email/:token", verifyController.verifyEmail);
router.patch("/reset-password/:token", verifyController.resetPassword);
router.patch("reset-password", verifyController.sendResetPassword);

module.exports = router;
