var express = require("express");

var router = express.Router();

var PlaceOfServiceController = require("../../controllers/placeOfService.controller");

router.post("/table", PlaceOfServiceController.placeOfServiceList);

router.post("/selectList", PlaceOfServiceController.selectPlaceOfServiceList);

module.exports = router;
