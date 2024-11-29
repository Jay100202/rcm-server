var express = require('express')
var router = express.Router()

var AppUploadService = require('../../services/appUpload.service');

const multerForOrgPreliminaryAttachmentUpload = AppUploadService.getMulterForConsortiumPreliminaryAttachmentUpload();
const multerForOrgPreliminaryAudioAttachmentUpload = AppUploadService.getMulterForConsortiumPreliminaryAttachmentUpload();

var ConsortiumPreliminaryAttachmentController = require('../../controllers/consortiumPreliminaryAttachment.controller');

// Map each API to the Controller Functions
router.post('/', multerForOrgPreliminaryAttachmentUpload.single("attFile"), ConsortiumPreliminaryAttachmentController.saveConsortiumPreliminaryAttachment)
router.post('/saveAudio', multerForOrgPreliminaryAudioAttachmentUpload.single("attFile"), ConsortiumPreliminaryAttachmentController.saveConsortiumPreliminaryAudioAttachment)
router.post('/discard', ConsortiumPreliminaryAttachmentController.removeConsortiumPreliminaryAttachments)
router.post('/detail', ConsortiumPreliminaryAttachmentController.getConsortiumPreliminaryAttachmentDetails)
router.post('/saveAudioAsBase64', ConsortiumPreliminaryAttachmentController.saveConsortiumPreliminaryAudioAttachmentAsBase64)

// Export the Router
module.exports = router;
