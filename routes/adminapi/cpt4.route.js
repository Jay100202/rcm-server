var express = require("express");

var router = express.Router();

var Cpt4Controller = require("../../controllers/cpt4.controller");

router.get("/getCpt4ById", Cpt4Controller.getCpt4ById);
router.get("/getCpt4ByCode", Cpt4Controller.getCpt4ByCode);
router.post("/searchCpt4", Cpt4Controller.getCpt4BySearch);

module.exports = router;
