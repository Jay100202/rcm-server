var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumPatientAppointmentDictationAttachmentController = require('../../controllers/consortiumPatientAppointmentDictationAttachment.controller');

router.post('/', ConsortiumPatientAppointmentDictationAttachmentController.saveConsortiumPatientAppointmentDictationAttachment)
router.post('/loadPatientAppointmentDictationAttachments', ConsortiumPatientAppointmentDictationAttachmentController.loadConsortiumPatientAppointmentDictationAttachments)

// Export the Router
module.exports = router;
