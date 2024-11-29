var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var TranscriptorRoleController = require('../../controllers/transcriptorRole.controller');

router.post('/selectList', TranscriptorRoleController.selectTranscriptorRoleList)

// Export the Router
module.exports = router;
