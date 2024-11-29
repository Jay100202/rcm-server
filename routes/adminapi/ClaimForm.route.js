const express = require("express");
const router = express.Router();
const ClaimFormController = require("../../controllers/claimForm.controller")

router.post("/", ClaimFormController.createClaimForm);
router.post("/detail", ClaimFormController.findClaimFormById);
router.post("/table", ClaimFormController.getPatientAppointments);

module.exports = router;
