const express = require("express");
const verifyController = require("../controllers/verifyController");
const router = express.Router();

router.get("/verify-email/:token", verifyController.verifyEmail);
router.patch("/update-email", verifyController.updateEmail);

router.patch("/reset-password", verifyController.sendResetPassword);
router.patch("/reset-password/:token", verifyController.resetPassword);

module.exports = router;
