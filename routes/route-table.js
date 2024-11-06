const express = require("express");
const tableController = require("../controllers/controller-table");
const router = express.Router();
// const passport = require("passport");

// const authentication = passport.authenticate("jwt", { session: false });

router.get("/", tableController.getTables);

module.exports = router;
