var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var TimeZoneOptionController = require('../../controllers/timeZoneOption.controller');

router.post('/selectList', TimeZoneOptionController.selectTimeZoneOptionList)

// Export the Router
module.exports = router;
