var express = require('express')
var router = express.Router()

const BillingStatusController = require("../../controllers/billingStatus.controller");

router.post('/create', BillingStatusController.createBillingStatus);

router.post('/table', BillingStatusController.billingStatusList);

router.post('/update/:id', BillingStatusController.updateBillingStatus);

router.delete('/remove/:id', BillingStatusController.deleteBillingStatus);



module.exports = router;

