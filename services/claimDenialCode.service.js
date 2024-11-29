const ClaimDenialCode = require("../models/ClaimDenailCode.model");
const mongoose = require("mongoose");

exports.getClaimDenialCodeList = async function () {
  try {
    const claimDenialCodes = await ClaimDenialCode.find();
    return claimDenialCodes;
  } catch (error) {
    throw new Error("Error fetching claim denial codes: " + error.message);
  }
};

exports.createClaimDenialCode = async function (claimData) {
  try {
    const newClaimDenialCode = new ClaimDenialCode(claimData);
    const savedClaimDenialCode = await newClaimDenialCode.save();
    return savedClaimDenialCode;
  } catch (error) {
    throw new Error("Error creating claim denial code: " + error.message);
  }
};

exports.updateClaimDenialCode = async function (id, updatedData) {
  try {
    const updatedClaimDenialCode = await ClaimDenialCode.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );
    return updatedClaimDenialCode;
  } catch (error) {
    throw new Error("Error updating claim denial code: " + error.message);
  }
};

exports.deleteClaimDenialCode = async function (id) {
  try {
    const deletedClaimDenialCode = await ClaimDenialCode.findByIdAndDelete(id);
    return deletedClaimDenialCode;
  } catch (error) {
    throw new Error("Error deleting claim denial code: " + error.message);
  }
};
