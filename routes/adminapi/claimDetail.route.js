const express = require("express");
const router = express.Router();

// Import the ClaimDetail Controller
const ClaimDetailController = require("../../controllers/claimDetail.controller");

// Define routes
router.get("/:id", ClaimDetailController.getClaimDetailById);
router.post("/", ClaimDetailController.createClaimDetail);
router.put("/:id", ClaimDetailController.updateClaimDetail);
router.delete("/:id", ClaimDetailController.deleteClaimDetail);
router.post("/list-excel", ClaimDetailController.listClaimDetailExcel);
router.put("/primary-denial/:id", ClaimDetailController.updatePrimaryDenial);

// Export the Router
module.exports = router;
