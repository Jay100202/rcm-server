const CPT4 = require("../models/cpt4.model");
const mongodb = require("mongodb");
const mongoose = require("mongoose");

// Get CPT4 by ID
exports.findCpt4ById = async function (req, id) {
  try {
    if (!mongodb.ObjectId.isValid(id)) {
      throw new Error("Invalid CPT4 ID format");
    }

    const cpt4 = await CPT4.findById(id).populate([
      { path: "createdBy", select: "userFullName" },
      { path: "updatedBy", select: "userFullName" },
    ]);

    return cpt4;
  } catch (error) {
    throw new Error("Error occurred while fetching CPT4 by ID: " + error);
  }
};

// Get CPT4 by Code
exports.findCpt4ByCode = async function (req, code) {
  try {
    const cpt4 = await CPT4.findOne({ Code: code }).populate([
      { path: "createdBy", select: "userFullName" },
      { path: "updatedBy", select: "userFullName" },
    ]);

    return cpt4;
  } catch (error) {
    throw new Error("Error occurred while fetching CPT4 by code: " + error);
  }
};

// Search CPT4 by Query
exports.searchCpt4 = async function (req, searchQuery) {
  try {
    const regex = new RegExp(searchQuery, "i");
    const cpt4List = await CPT4.find({
      $or: [{ Code: regex }, { Description: regex }],
      isDeleted: 0,
    })

    return cpt4List;
  } catch (error) {
    throw new Error("Error occurred while searching for CPT4s: " + error);
  }
};
