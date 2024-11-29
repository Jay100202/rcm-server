var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ActivityStatusController = require('../../controllers/activityStatus.controller');

router.post('/selectList', ActivityStatusController.selectActivityStatusList)

// Export the Router
module.exports = router;
