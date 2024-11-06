const express = require("express");
const reservationController = require("../controllers/controller-reservation");
const router = express.Router();
const passport = require("passport");

const authentication = passport.authenticate("jwt", { session: false });

router.get("/", authentication, reservationController.getAllReservations);
router.get("/user", authentication, reservationController.getReservationByUser);
router.get("/:id", authentication, reservationController.getReservationById);

router.post("/", authentication, reservationController.createReservation);

router.patch("/:id", authentication, reservationController.updateReservation);

module.exports = router;
