var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ReportController = require('../../controllers/report.controller');

router.post('/selectReportColumnsList', ReportController.selectReportColumnsList)
router.post('/fetchData', ReportController.getReports)

// Export the Router
module.exports = router;
