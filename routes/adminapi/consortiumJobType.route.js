var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumJobTypeController = require('../../controllers/consortiumJobType.controller');

router.post('/selectList', ConsortiumJobTypeController.selectConsortiumJobTypeList)

// Export the Router
module.exports = router;
