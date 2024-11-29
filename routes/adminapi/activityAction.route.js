var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ActivityActionController = require('../../controllers/activityAction.controller');

router.post('/selectList', ActivityActionController.selectActivityActionList)

// Export the Router
module.exports = router;
