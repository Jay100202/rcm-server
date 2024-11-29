const express = require("express");
const router = express.Router();

// Import the Claim Controller
const ClaimController = require("../../controllers/claim.controller");

// Define routes
router.get("/", ClaimController.getAllClaims); // Route to get all claims
router.get("/:id", ClaimController.getClaimById); // Route to get a claim by ID
router.post("/", ClaimController.createClaim); // Route to create a new claim
router.put("/:id", ClaimController.updateClaim); // Route to update an existing claim
router.delete("/:id", ClaimController.deleteClaim); // Route to delete a claim
router.post("/list-excel", ClaimController.listClaimsExcel); // Route to export claims list to Excel
router.post("/form-cms1500-excel", ClaimController.getClaimFormCMS1500Excel); // Route to export CMS-1500 claims to Excel
router.post("/aging-data-excel", ClaimController.getAgingDataExcel); // Route to export aging data to Excel
router.put("/primary-denial/:id", ClaimController.updatePrimaryClaimDenial); // Route to update primary claim denial
router.put("/secondary-denial/:id", ClaimController.updateSecondaryClaimDenial); // Route to update secondary claim denial
router.put("/tertiary-denial/:id", ClaimController.updateTertiaryClaimDenial); // Route to update tertiary claim denial

// Export the Router
module.exports = router;
