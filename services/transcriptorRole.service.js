var TranscriptorRole = require("../models/transcriptorRole.model");
var AppUploadService = require("./appUpload.service");
var AppConfig = require("../appconfig");
var bcrypt = require("bcrypt");
var AppCommonService = require("./appcommon.service");
var AppMailService = require("./appMail.service");
var mongodb = require("mongodb");
var AppConfigConst = require("../appconfig-const");
var AppDataSanitationService = require("../services/appDataSanitation.service");
var moment = require("moment");
var momentTZ = require("moment-timezone");

// Saving the context of this module inside the _the variable
_this = this;

exports.getTranscriptorRolesForSelect = async function () {
  const projectObj = {
    _id: "$_id",
    id: "$_id",
    text: "$roleName",
    textI: { $toLower: "$roleName" },
    roleCode: "$roleCode",
    isQA: "$isQA",
    isMT: "$isMT",
    level: "$level",
  };

  const sortOptions = {};
  sortOptions.textI = 1;

  let fetchOptions = {};

  try {
    var transcriptorRole = await TranscriptorRole.aggregate([
      { $match: fetchOptions },
    ])
      .project(projectObj)
      .sort(sortOptions);

    transcriptorRole.forEach(function (v) {
      delete v.textI;
      delete v._id;
    });

    return transcriptorRole;
  } catch (e) {
    throw Error("Error while Paginating TranscriptorRole " + e);
  }
};

exports.findTranscriptorRoleById = async function (id) {
  var options = {
    _id: new mongoose.Types.ObjectId(id),
  };

  try {
    var transcriptorRole;
    if (mongodb.ObjectId.isValid(id)) {
      transcriptorRole = await TranscriptorRole.findOne(options);
    }
    return transcriptorRole;
  } catch (e) {
    throw Error("Error while Fetching TranscriptorRole " + e);
  }
};

exports.findTranscriptionistRole = async function () {
  var options = {
    isDeleted: 0,
    isQA: false,
  };

  try {
    var transcriptorRole = await TranscriptorRole.findOne(options);
    return transcriptorRole;
  } catch (e) {
    throw Error("Error while Fetching TranscriptorRole " + e);
  }
};

exports.findTranscriptorRoleByCode = async function (roleCode) {
  var options = {
    roleCode: roleCode,
  };

  try {
    var transcriptorRole = await TranscriptorRole.findOne(options);
    return transcriptorRole;
  } catch (e) {
    throw Error("Error while Fetching TranscriptorRole " + e);
  }
};

exports.findTranscriptorRoleIdByRoleCode = async function (roleCode) {
  var resTranscriptorRole = await exports.findTranscriptorRoleByCode(roleCode);
  var resTranscriptorRoleId;
  if (resTranscriptorRole) {
    resTranscriptorRoleId = resTranscriptorRole._id;
  }
  return resTranscriptorRoleId;
};

exports.getTranscriptorRoleByCode = async function (listCode) {
  try {
    let transcriptorRole = await TranscriptorRole.findOne({
      roleCode: listCode,
    });
    return transcriptorRole;
  } catch (e) {
    throw Error("Error occurred while fetching the transcriptor role: " + e);
  }
};

exports.getBillerRoleByCode = async function (listCode) {
  try {
    let transcriptorRole = await TranscriptorRole.findOne({
      roleCode: listCode,
    });
    return transcriptorRole;
  } catch (e) {
    throw Error("Error occurred while fetching the transcriptor role: " + e);
  }
};
