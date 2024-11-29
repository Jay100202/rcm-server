var express = require("express");

var router = express.Router();

var CoderController = require("../../controllers/coder.controller");

router.post("/table", CoderController.getPatientAppointments);

router.post("/create", CoderController.createEncounter);

router.post("/createnewEncounter", CoderController.createNewEncounter);

router.post("/ByStatus/:status", CoderController.getEncounterByStatus);

router.post("/update/:id", CoderController.updateEncounter);

router.delete("/remove/:id", CoderController.removeEncounter);

module.exports = router;
