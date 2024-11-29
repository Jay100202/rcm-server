var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var TempOperationsController = require('../../controllers/tempOperations.controller');

// Map each API to the Controller Functions

// router.post('/updateConsortiumPatientId', TempOperationsController.updateConsortiumPatientId)
router.post('/checkAndScheduleSystemUserNotification', TempOperationsController.checkAndScheduleSystemUserNotification)
// router.post('/fillTimeZoneOption', TempOperationsController.fillTimeZoneOption)

// Export the Router
module.exports = router;
