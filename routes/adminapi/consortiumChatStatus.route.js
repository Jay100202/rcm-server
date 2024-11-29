var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumChatStatusController = require('../../controllers/consortiumChatStatus.controller');

router.post('/selectList', ConsortiumChatStatusController.selectConsortiumChatStatusList)

// Export the Router
module.exports = router;
