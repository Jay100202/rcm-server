var express = require('express')
var router = express.Router()

const EncounterController = require("../../controllers/encounter.controller");

router.post('/create', EncounterController.createEncounter);

router.post('/table', EncounterController.getEncounterList);

router.post('/ByStatus/:status', EncounterController.getEncounterByStatus);

router.post('/update/:id', EncounterController.updateEncounter);

router.delete('/remove/:id', EncounterController.removeEncounter);



module.exports = router;

