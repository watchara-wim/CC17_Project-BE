const express = require("express");
const authenController = require("../controllers/authenController");
const router = express.Router();

router.post("/register", authenController.registerUser);
router.post("/login", authenController.loginUser);

module.exports = router;
