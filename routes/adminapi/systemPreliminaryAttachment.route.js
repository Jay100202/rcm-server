var express = require('express')
var router = express.Router()

var AppUploadService = require('../../services/appUpload.service');

const multerForOrgPreliminaryAttachmentUpload = AppUploadService.getMulterForSystemPreliminaryAttachmentUpload();
const multerForOrgPreliminaryAudioAttachmentUpload = AppUploadService.getMulterForSystemPreliminaryAudioAttachmentUpload();

var SystemPreliminaryAttachmentController = require('../../controllers/systemPreliminaryAttachment.controller');

// Map each API to the Controller Functions
router.post('/', multerForOrgPreliminaryAttachmentUpload.single("attFile"), SystemPreliminaryAttachmentController.saveSystemPreliminaryAttachment)
router.post('/saveAudio', multerForOrgPreliminaryAudioAttachmentUpload.single("attFile"), SystemPreliminaryAttachmentController.saveSystemPreliminaryAudioAttachment)
router.post('/discard', SystemPreliminaryAttachmentController.removeSystemPreliminaryAttachments)
router.post('/detail', SystemPreliminaryAttachmentController.getSystemPreliminaryAttachmentDetails)
router.post('/saveAudioAsBase64', SystemPreliminaryAttachmentController.saveSystemPreliminaryAudioAttachmentAsBase64)
router.post('/saveAsBase64', SystemPreliminaryAttachmentController.saveSystemPreliminaryAttachmentAsBase64)



// Export the Router
module.exports = router;
