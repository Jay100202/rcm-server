var express = require("express");

var router = express.Router();

var ICDController = require("../../controllers/icd.controller");

router.get("/getIcdById", ICDController.getIcdById);
router.get("/getIcdByCode", ICDController.getIcdByCode);
router.post("/searchIcd", ICDController.getIcdBySearch);

module.exports = router;
