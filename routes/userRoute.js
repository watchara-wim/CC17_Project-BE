const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const passport = require("passport");

const authentication = passport.authenticate("jwt", { session: false });

router.get("/profile", authentication, userController.getProfile);

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

router.patch("/update-profile", authentication, userController.updateProfile);
router.patch("/reset-password", userController.sendResetPassword);
router.patch("/reset-password/:token", userController.resetPassword);

module.exports = router;
