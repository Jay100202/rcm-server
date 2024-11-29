var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumChatThreadController = require('../../controllers/consortiumChatThread.controller');

router.post('/', ConsortiumChatThreadController.saveConsortiumChatThread)
router.post('/table', ConsortiumChatThreadController.getConsortiumChatThreads)
router.patch('/', ConsortiumChatThreadController.changeConsortiumChatThreadStatus)
router.delete('/:id', ConsortiumChatThreadController.removeConsortiumChatThread)
router.post('/selectList', ConsortiumChatThreadController.selectConsortiumChatThreadList)
router.post('/checkForDelete', ConsortiumChatThreadController.checkCanBeDeleted)
router.post('/detail', ConsortiumChatThreadController.getConsortiumChatThreadDetails)
router.post('/checkTopicName', ConsortiumChatThreadController.checkConsortiumChatThreadTopicValidity)

router.post('/threadMessage/', ConsortiumChatThreadController.saveConsortiumChatThreadMessage)
router.post('/setAsRead', ConsortiumChatThreadController.setConsortiumChatThreadAsRead)
router.post('/setAsClosed', ConsortiumChatThreadController.setConsortiumChatThreadAsClosed)
router.post('/setAsReopened', ConsortiumChatThreadController.setConsortiumChatThreadAsReopened)
router.post('/info', ConsortiumChatThreadController.getConsortiumChatThreadInformation)
router.post('/selectStatusList', ConsortiumChatThreadController.selectConsortiumChatThreadStatusList)


// Export the Router
module.exports = router;
