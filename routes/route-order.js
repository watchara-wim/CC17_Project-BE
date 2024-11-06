const express = require("express");
const orderController = require("../controllers/controller-order");
const router = express.Router();
const passport = require("passport");

const authentication = passport.authenticate("jwt", { session: false });

router.get("/", authentication, orderController.getAllOrders);

router.post("/", authentication, orderController.createOrder);

router.patch("/:id", authentication, orderController.updateOrder);

module.exports = router;
