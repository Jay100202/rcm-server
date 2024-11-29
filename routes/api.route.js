var express = require('express')

var router = express.Router()

var consortiumUserProfileOperationsRoute = require('./api/consortiumUserProfileOperations.route')


router.use('/consortiumUserProfileOps', consortiumUserProfileOperationsRoute);

module.exports = router;
