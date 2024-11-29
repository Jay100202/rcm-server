var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ActivityPriorityController = require('../../controllers/activityPriority.controller');

router.post('/selectList', ActivityPriorityController.selectActivityPriorityList)

// Export the Router
module.exports = router;
