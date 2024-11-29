const ICD = require("../models/icd.model");
const mongodb = require("mongodb");
const mongoose = require("mongoose");

// Get ICD by ID
exports.findIcdById = async function (req, id) {
  try {
    if (!mongodb.ObjectId.isValid(id)) {
      throw new Error("Invalid ICD ID format");
    }

    const icd = await ICD.findById(id).populate([
      { path: "createdBy", select: "userFullName" },
      { path: "updatedBy", select: "userFullName" },
    ]);

    return icd;
  } catch (error) {
    throw new Error("Error occurred while fetching ICD by ID: " + error);
  }
};

// Get ICD by Code
exports.findIcdByCode = async function (req, dx_code) {
  try {
    const icd = await ICD.findOne({ dx_code: dx_code }).populate([
      { path: "createdBy", select: "userFullName" },
      { path: "updatedBy", select: "userFullName" },
    ]);

    return icd;
  } catch (error) {
    throw new Error("Error occurred while fetching ICD by code: " + error);
  }
};

// Search ICD by Query
exports.searchIcd = async function (req, searchQuery) {
  try {
    const regex = new RegExp(searchQuery, "i");
    const icdList = await ICD.find({
      $or: [
        { dx_code: regex },
        { formatted_dx_code: regex },
        { short_desc: regex },
        { long_desc: regex },
      ],
      isDeleted: 0,
    })

    return icdList;
  } catch (error) {
    throw new Error("Error occurred while searching for ICDs: " + error);
  }
};
