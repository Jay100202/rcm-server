var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ActivityFileStatusController = require('../../controllers/activityFileStatus.controller');

router.post('/selectList', ActivityFileStatusController.selectActivityFileStatusList)

// Export the Router
module.exports = router;
