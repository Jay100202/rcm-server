var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var GenderController = require('../../controllers/gender.controller');

router.post('/selectList', GenderController.selectGenderList)

// Export the Router
module.exports = router;
