var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var TranscriptionStatusController = require('../../controllers/transcriptionStatus.controller');

router.post('/selectList', TranscriptionStatusController.selectTranscriptionStatusList)

// Export the Router
module.exports = router;
