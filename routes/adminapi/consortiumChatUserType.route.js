var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumChatUserTypeController = require('../../controllers/consortiumChatUserType.controller');

router.post('/selectList', ConsortiumChatUserTypeController.selectConsortiumChatUserTypeList)

// Export the Router
module.exports = router;
