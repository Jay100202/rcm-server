var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumUserController = require('../../controllers/consortiumUser.controller');

router.post('/', ConsortiumUserController.saveConsortiumUser)
router.post('/table', ConsortiumUserController.getConsortiumUsers)
router.patch('/', ConsortiumUserController.changeConsortiumUserStatus)
router.delete('/:id', ConsortiumUserController.removeConsortiumUser)
router.post('/selectList', ConsortiumUserController.selectConsortiumUserList)
router.post('/selectListForAppointment', ConsortiumUserController.selectConsortiumUserListForAppointment)
router.post('/checkForDelete', ConsortiumUserController.checkCanBeDeleted)
router.post('/detail', ConsortiumUserController.getConsortiumUserDetails)
router.post('/checkEmail', ConsortiumUserController.checkConsortiumUserEmailValidity)
router.post('/sendCredentials', ConsortiumUserController.sendConsortiumUserCredentials)
router.post('/loadConsortiumUserLocationSelectList', ConsortiumUserController.loadConsortiumUserLocationList)

router.post('/templateAttachmentBulkUpload', ConsortiumUserController.saveMultipleConsortiumUserTemplateAttachments)
router.post('/sampleAttachmentBulkUpload', ConsortiumUserController.saveMultipleConsortiumUserSampleAttachments)

router.post('/templateAttachmentCompressedBulkDownload', ConsortiumUserController.generateAndDownloadCompressedConsortiumUserTemplateAttachments)
router.post('/sampleAttachmentCompressedBulkDownload', ConsortiumUserController.generateAndDownloadCompressedConsortiumUserSampleAttachments)

// router.post('/onAttchmentUrlDownloaded', ConsortiumUserController.onAttchmentUrlDownloadCompleted)


// Export the Router
module.exports = router;
