const express = require("express");
const router = express.Router();

// Import the Claim Denial Code Controller
const ClaimDenialCodeController = require("../../controllers/claimDenialCode.controller");

// Define routes for Claim Denial Code operations
router.get("/list", ClaimDenialCodeController.getClaimDenialCodeList);
router.post("/create", ClaimDenialCodeController.createClaimDenialCode);
router.put("/update/:id", ClaimDenialCodeController.updateClaimDenialCode);
router.delete("/delete/:id", ClaimDenialCodeController.deleteClaimDenialCode);

// Export the Router
module.exports = router;
