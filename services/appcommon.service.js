var AppConfig = require("../appconfig");
var AppConfigUploads = require("../appconfig-uploads");
var ConsortiumUserService = require("../services/consortiumUser.service");
var ConsortiumPatientService = require("../services/consortiumPatient.service");
var ConsortiumPatientAppointmentService = require("../services/consortiumPatientAppointment.service");
var ConsortiumChatThreadService = require("../services/consortiumChatThread.service");
var ConsortiumLocationService = require("../services/consortiumLocation.service");
var SystemUserService = require("../services/systemUser.service");
var SystemUserRoleService = require("../services/systemUserRole.service");
var SystemUserModuleService = require("../services/systemUserModule.service");
var ConsortiumUserRoleService = require("./consortiumUserRole.service");
var ConsortiumUserModuleService = require("./consortiumUserModule.service");
var ConsortiumService = require("../services/consortium.service");
var AppConfigModule = require("../appconfig-module");
var AppModuleIdLog = require("../models/appModuleIdLog.model");
var SessionType = require("../models/sessionType.model");
var crypto = require("crypto");
var AppConfigPrefix = require("../appconfig-prefix");
var AppConfigConst = require("../appconfig-const");
var moment = require("moment");
var momentTZ = require("moment-timezone");

// Saving the context of this module inside the _the variable
_this = this;

exports.getCurrentTimestamp = function () {
  var timestamp = Math.floor(Date.now());
  timestamp = Math.floor(timestamp / 1000);
  return timestamp;
};

exports.getTimestampFromDate = function (dtStr) {
  var dtObj = new Date(dtStr);
  var timestamp = Math.floor(dtObj.getTime());
  timestamp = Math.floor(timestamp / 1000);
  return timestamp;
};

exports.getTimezoneStrFromRequest = async function (req) {
  const tzStr = req.headers.tzstr;
  return tzStr;
};

exports.getTimezoneOffsetFromRequest = async function (req) {
  const tzofs = req.headers.tzofs;
  return tzofs;
};

exports.getTimezoneEnforcedMomentObj = async function (req, initUnixTs) {
  const tzofs = await exports.getTimezoneOffsetFromRequest(req);

  let momentObjWtTz = momentTZ();

  if (tzofs !== undefined) {
    const tzOffsetMin = parseInt(tzofs);

    // if(tzOffsetMin > 0)
    {
      momentObjWtTz.utcOffset(tzofs);
    }
  }

  if (initUnixTs !== undefined) {
    momentObjWtTz = momentObjWtTz.unix(initUnixTs);
  }

  return momentObjWtTz.clone();
};

exports.getSessionTypeFromRequest = async function (req) {
  const apiKey =
    req && req.headers && req.headers.apikey ? req.headers.apikey : "";
  const reqfrom =
    req && req.headers && req.headers.reqfrom ? req.headers.reqfrom : "";

  let sessionType;
  if (reqfrom === AppConfig.HDR_REQ_FROM_PANEL) {
    if (apiKey === AppConfig.HDR_API_KEY_PANEL_SUPER_USER) {
      sessionType = AppConfig.SESSION_TYPE_ID_WEB;
    }
  } else if (reqfrom === AppConfig.HDR_REQ_FROM_APP_USER) {
    if (apiKey === AppConfig.HDR_API_KEY_WEB_CONSORTIUM_USER) {
      sessionType = AppConfig.SESSION_TYPE_ID_WEB;
    } else if (apiKey === AppConfig.HDR_API_KEY_ANDROID_CONSORTIUM_USER) {
      sessionType = AppConfig.SESSION_TYPE_ID_ANDROID;
    } else if (apiKey === AppConfig.HDR_API_KEY_IOS_CONSORTIUM_USER) {
      sessionType = AppConfig.SESSION_TYPE_ID_IOS;
    }
  }

  let id = "";
  if (sessionType) {
    var options = {
      sessionTypeId: sessionType,
    };

    try {
      let type = await SessionType.findOne(options);
      if (type) {
        id = type._id;
      }
    } catch (e) {
      throw Error("Error while Fetchinf User Session Type " + e);
    }
  }
  return id;
};

exports.getIsRequestFromSystemUser = function (req) {
  const apikey =
    req && req.headers && req.headers.apikey ? req.headers.apikey : "";
  const reqfrom =
    req && req.headers && req.headers.reqfrom ? req.headers.reqfrom : "";
  let isSystemUserRequest = false;
  if (
    reqfrom === AppConfig.HDR_REQ_FROM_PANEL &&
    apikey === AppConfig.HDR_API_KEY_PANEL_SUPER_USER
  ) {
    isSystemUserRequest = true;
  }
  return isSystemUserRequest;
};

exports.getStudentAppKeyFromRequest = function (req) {
  let reqAppKey;
  const appkey =
    req && req.headers && req.headers.appkey ? req.headers.appkey : "";
  const apikey =
    req && req.headers && req.headers.apikey ? req.headers.apikey : "";
  const reqfrom =
    req && req.headers && req.headers.reqfrom ? req.headers.reqfrom : "";
  if (reqfrom === AppConfig.HDR_REQ_FROM_PANEL) {
    if (appkey !== undefined && appkey !== "") {
      reqAppKey = appkey;
    }
  }
  return reqAppKey;
};

exports.generateSystemUserKeyForRequest = function (
  systemUserId,
  sessionToken
) {
  let userKey = systemUserId + "_" + sessionToken;
  userKey = exports.encryptStringData(userKey);
  return userKey;
};

exports.getSystemUserIdFromRequest = async function (req) {
  const encSystemUserId =
    req && req.headers && req.headers.sukey ? req.headers.sukey : "";
  let decSystemUserId;
  if (encSystemUserId !== undefined && encSystemUserId !== "") {
    const decUserKey = exports.decryptStringData(encSystemUserId);
    var arr = decUserKey.split("_");
    decSystemUserId = arr[0];
  }
  return decSystemUserId;
};

exports.getSystemUserSessionTokenFromRequest = async function (req) {
  const encSystemUserId =
    req && req.headers && req.headers.sukey ? req.headers.sukey : "";
  let sessionToken;
  if (encSystemUserId !== undefined && encSystemUserId !== "") {
    const decUserKey = exports.decryptStringData(encSystemUserId);
    var arr = decUserKey.split("_");
    sessionToken = arr[1];
  }
  return sessionToken;
};

exports.getSystemUserFromRequest = async function (req) {
  const decUserId = await exports.getSystemUserIdFromRequest(req);
  const sessionToken = await exports.getSystemUserSessionTokenFromRequest(req);
  let user;
  const userSession = await SystemUserService.getSystemUserSessionForRequest(
    decUserId,
    sessionToken
  );
  if (userSession) {
    user = await SystemUserService.findSystemUserById(decUserId, false);
  }
  return user;
};

exports.setSystemUserAppAccessed = async function (req) {
  await SystemUserService.saveSystemUserAppAccessedDetails(req);
};

exports.checkSystemUserHasModuleRights = async function (
  systemUser,
  moduleName,
  right
) {
  let hasRight = false;
  const module = await SystemUserModuleService.findModuleByName(moduleName);

  if (module) {
    const roleRights = await SystemUserRoleService.getRoleModuleRights(
      systemUser.role,
      module._id
    );
    if (roleRights) {
      let relevantRightVal = 0;
      if (right === AppConfigModule.RIGHT_ADD) {
        relevantRightVal = roleRights.add;
      } else if (right === AppConfigModule.RIGHT_VIEW) {
        relevantRightVal = roleRights.view;
      } else if (right === AppConfigModule.RIGHT_VIEW_ALL) {
        relevantRightVal = roleRights.viewAll;
      } else if (right === AppConfigModule.RIGHT_EDIT) {
        relevantRightVal = roleRights.edit;
      } else if (right === AppConfigModule.RIGHT_DELETE) {
        relevantRightVal = roleRights.delete;
      } else if (right === AppConfigModule.RIGHT_PRINT) {
        relevantRightVal = roleRights.print;
      } else if (right === AppConfigModule.RIGHT_EMAIL) {
        relevantRightVal = roleRights.email;
      } else if (right === AppConfigModule.RIGHT_DOWNLOAD) {
        relevantRightVal = roleRights.download;
      }

      if (relevantRightVal === 1) hasRight = true;
    }
  }

  return hasRight;
};

exports.encryptStringData = function (dataStr) {
  var cipher = crypto.createCipher(
    AppConfig.APP_CRYPT_ALGORITHM,
    AppConfig.APP_CRYPT_PASSWORD
  );

  var encStr = cipher.update(dataStr, "utf8", "hex");
  encStr += cipher.final("hex");

  return encStr;
};

exports.decryptStringData = function (encStr) {
  var dataStr = "";
  if (encStr && encStr !== "") {
    var decipher = crypto.createDecipher(
      AppConfig.APP_CRYPT_ALGORITHM,
      AppConfig.APP_CRYPT_PASSWORD
    );

    dataStr = decipher.update(encStr, "hex", "utf8");
    dataStr += decipher.final("utf8");
  }
  return dataStr;
};

exports.encryptStringDataNew = function (text) {
  let iv = crypto.randomBytes(AppConfig.APP_CRYPT_IV_LENGTH);
  let cipher = crypto.createCipheriv(
    AppConfig.APP_CRYPT_ALGORITHM,
    Buffer.from(AppConfig.APP_CRYPT_PASSWORD, "hex"),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

exports.decryptStringDataNew = function (text) {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(
    AppConfig.APP_CRYPT_ALGORITHM,
    Buffer.from(AppConfig.APP_CRYPT_PASSWORD, "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

exports.generateAppIdForModule = async function (moduleCode, currMaxId) {
  try {
    var appID;

    var fetchOptions = {
      moduleCode: moduleCode,
      isActive: 1,
    };

    let appModuleIdLog = await AppModuleIdLog.findOne(fetchOptions);

    if (!appModuleIdLog || appModuleIdLog === undefined) {
      const insAppModuleIdLog = new AppModuleIdLog();
      insAppModuleIdLog.moduleCode = moduleCode;
      insAppModuleIdLog.currentId = 0;
      insAppModuleIdLog.isActive = 1;
      await insAppModuleIdLog.save();
      appModuleIdLog = await AppModuleIdLog.findOne(fetchOptions);
    }

    if (appModuleIdLog) {
      let ongoingId = appModuleIdLog.currentId;
      appID = ongoingId + 1;

      if (currMaxId >= appID) {
        appID = currMaxId + 1;
      } else {
        // Do we wish to go back ??
      }

      appModuleIdLog.currentId = appID;
      await appModuleIdLog.save();
    }
    // console.log('appModuleIdLog : ',appModuleIdLog);
    // console.log('appID : ',appID);

    return appID;
  } catch (e) {
    throw Error("Error while Generating appID For " + moduleCode + " " + e);
  }
};

exports.sanitizeObjectIdData = function (data) {
  let dataObj = null;

  if (data) {
    dataObj = data;
  }

  return dataObj;
};

exports.sanitizeStringData = function (data) {
  let dataStr = "";

  if (data) {
    dataStr = data;
  }

  return dataStr;
};

exports.sanitizeNumberData = function (data) {
  let dataNum = 0;

  if (data) {
    dataNum = data * 1;
  }

  return dataNum;
};

exports.sanitizeDateTimeData = function (data) {
  let dataDateTime = 0;

  if (data) {
    dataDateTime = data * 1;
    dataDateTime = Math.trunc(dataDateTime);
  }

  return dataDateTime;
};

exports.sanitizeTimeStampData = function (dtData) {
  let dataTimeStamp = 0;

  if (dtData) {
    dataTimeStamp = dtData * 1;
    dataTimeStamp = Math.trunc(dataTimeStamp);
  }

  return dataTimeStamp;
};

exports.getSkipSendResponseValue = function (req) {
  var skipSend = false;
  var tempSkipSend = req.body[AppConfigConst.PARAM_SKIP_RESPONSE];
  if (
    tempSkipSend &&
    typeof tempSkipSend === "boolean" &&
    tempSkipSend === true
  ) {
    skipSend = tempSkipSend;
  }
  return skipSend;
};

exports.compileRequestWithSkipSendResponse = function (req) {
  let compiledReq;
  if (req) {
    compiledReq = req;
    compiledReq.body[AppConfigConst.PARAM_SKIP_RESPONSE] = true;
  }
  return compiledReq;
};

exports.getSavedMessage = function (moduleName) {
  let savedMessage = "";
  if (moduleName !== undefined && moduleName !== "") {
    savedMessage = moduleName + " saved";
  }
  return savedMessage;
};

exports.getDeletedMessage = function (moduleName) {
  let deletedMessage = "";
  if (moduleName !== undefined && moduleName !== "") {
    deletedMessage = moduleName + " deleted";
  }
  return deletedMessage;
};

exports.getRemovedMessage = function (moduleName) {
  let removedMessage = "";
  if (moduleName !== undefined && moduleName !== "") {
    removdeMessage = moduleName + " removed";
  }
  return removedMessage;
};

exports.getStatusChangedMessage = function () {
  let statusChangedMessage = "Status changed";
  return statusChangedMessage;
};

exports.getSubmittedMessage = function (moduleName) {
  let savedMessage = "";
  if (moduleName !== undefined && moduleName !== "") {
    savedMessage = moduleName + " is submitted";
  }
  return savedMessage;
};

exports.getSubmittedForReviewMessage = function (moduleName) {
  let savedMessage = "";
  if (moduleName !== undefined && moduleName !== "") {
    savedMessage = moduleName + " is submitted for review";
  }
  return savedMessage;
};

exports.getAgeStrFromDOB = function (dob) {
  let ageStr = "";
  if (dob) {
    const ageYears = moment().diff(dob * 1000, "years");
    ageStr = ageYears + " yr";
    if (ageYears > 1) {
      ageStr += "s";
    }
  }
  return ageStr;
};

exports.getSizeInKBFromBytes = function (sizeBytes) {
  let sizeKb = 0;
  if (sizeBytes !== undefined && sizeBytes > 0) {
    sizeKb = sizeBytes * 0.001;
    sizeKb = Math.ceil(sizeKb);
    if (sizeKb < 0) {
      sizeKb = 0;
    }
  }
  return sizeKb;
};

exports.getFileExtensionFromFileName = function (fileName) {
  let fileExtension = "";

  if (fileName && fileName !== "") {
    var fileExt = fileName.substr(fileName.lastIndexOf(".") + 1);

    if (fileExt && fileExt !== "") {
      fileExtension = fileExt;
      fileExtension = fileExtension.toLowerCase();
    }
  }

  return fileExtension;
};

exports.getIfFileIsImageFromFileName = function (fileName) {
  let fileIsImage = false;
  let fileExtension = exports.getFileExtensionFromFileName(fileName);

  if (fileExtension && fileExtension !== "") {
    var fileExtensionLower = fileExtension.toLowerCase();

    var imgFileExtensiionArr = AppConfigUploads.FILE_TYPE_IMAGE_EXTENSION_ARRAY;

    if (imgFileExtensiionArr.indexOf(fileExtensionLower) >= 0) {
      fileIsImage = true;
    }
  }

  return fileIsImage;
};

exports.getMinutesFromHoursAndMinutes = function (hours, minutes) {
  let minuteCount = 0;
  const minDivider = 60;
  if (hours && hours > 0) {
    minuteCount += hours * minDivider;
  }
  if (minutes && minutes > 0) {
    minuteCount += minutes;
  }
  return minuteCount;
};

exports.getHourMinuteObjFromMinutes = function (minuteCount) {
  let hours = 0,
    minutes = 0;
  let hourMinuteStr = "";
  const minDivider = 60;
  if (minuteCount && minuteCount > 0) {
    if (minuteCount >= minDivider) {
      hours = Math.floor(minuteCount / minDivider);
      minuteCount = minuteCount - hours * minDivider;
      minutes = minuteCount % minDivider;
    } else {
      minutes = minuteCount;
    }

    if (hours > 0) {
      hourMinuteStr += hourMinuteStr !== "" ? " " : "";
      hourMinuteStr += hours;
      hourMinuteStr += hours > 1 ? " hours" : " hour";
    }

    if (minutes > 0) {
      hourMinuteStr += hourMinuteStr !== "" ? " " : "";
      hourMinuteStr += minutes;
      hourMinuteStr += minutes > 1 ? " minutes" : " minute";
    }
  }

  const hrMinObj = {
    hours: hours,
    minutes: minutes,
    hourMinuteStr: hourMinuteStr,
  };
  return hrMinObj;
};

exports.generatedSystemUserPassword = function () {
  var strLength = 6;
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < strLength; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

exports.generatedUserSessionToken = function () {
  return Math.floor(1000 + Math.random() * 9000);
};

exports.truncateWithEllipses = function (text, max) {
  return text.substr(0, max - 1) + (text.length > max ? "..." : "");
};

exports.getAverageFromValues = function (totalVal, countVal) {
  let averageVal = 0;
  if (totalVal > 0 && countVal > 0) {
    averageVal = totalVal / countVal;
    averageVal = Math.round((averageVal + Number.EPSILON) * 100) / 100;
  }
  return averageVal;
};

exports.getPercentageFromValues = function (condVal, totalVal) {
  let percentVal = 0;
  if (totalVal > 0 && condVal > 0) {
    percentVal = (condVal / totalVal) * 100;
    percentVal = Math.round((percentVal + Number.EPSILON) * 100) / 100;
  }
  return percentVal;
};

exports.formulateTimeStringFor12HrFormat = function (timeStr) {
  let formattedTimeStr = "";

  if (timeStr !== undefined && timeStr !== null && timeStr !== "") {
    timeStr = timeStr.toString().trim();
    var timeParts = timeStr.split(":");
    if (timeParts.length === 2) {
      var hrPart = timeParts[0] * 1;
      var minPart = timeParts[1] * 1;

      var newDateObj = moment().startOf("day");
      newDateObj.set("hours", hrPart);
      newDateObj.set("minutes", minPart);

      formattedTimeStr = newDateObj.format("hh:mm A");
    }
  }

  return formattedTimeStr;
};

exports.formulateTruncatedDecimalNumber = function (value) {
  let formattedValueNum = exports.formulateTruncatedDecimalNumberUptoNDigits(
    3,
    value
  );
  return formattedValueNum;
};

exports.formulateTruncatedDecimalNumberUptoNDigits = function (
  noOfDigits,
  value
) {
  let formattedValueNum;
  if (!Number.isNaN(value)) {
    const consRoundOffParam = Math.pow(10, noOfDigits);
    formattedValueNum = Number(value);
    formattedValueNum =
      Math.round((formattedValueNum + Number.EPSILON) * consRoundOffParam) /
      consRoundOffParam;
  }
  return formattedValueNum;
};

exports.compileUploadedImageFileNamesFromFileName = function (fileName) {
  var compiledUploadedImageFileNames;
  var fileNameParts =
    exports.getFileNameAndExtensionDivisionFromFileName(fileName);
  if (fileNameParts) {
    let fileExtension = fileNameParts.ext;
    let fileOnlyName = fileNameParts.name;

    let compActualFileName =
      fileOnlyName +
      AppConfigUploads.STORAGE_UPLOADS_SUFFIX_ACTUAL_W_SEPARATOR +
      "." +
      fileExtension;
    let compThumbFileName =
      fileOnlyName +
      AppConfigUploads.STORAGE_UPLOADS_SUFFIX_THUMB_W_SEPARATOR +
      "." +
      fileExtension;

    compiledUploadedImageFileNames = {
      actual: compActualFileName,
      thumb: compThumbFileName,
    };
  }

  return compiledUploadedImageFileNames;
};

exports.getFileNameAndExtensionDivisionFromFileName = function (fileName) {
  var fileNameParts;

  if (fileName && fileName !== "") {
    var fileExt = fileName.substr(fileName.lastIndexOf(".") + 1);

    if (fileExt && fileExt !== "") {
      let fileExtension = fileExt;
      fileExtension = fileExtension.toLowerCase();

      let fileOnlyName = fileName.replace("." + fileExt, "");

      fileNameParts = {
        ext: fileExtension,
        name: fileOnlyName,
      };
    }
  }

  return fileNameParts;
};

exports.generateConsortiumId = async function () {
  try {
    const currMaxId = await ConsortiumService.getCurrentHighestConsortiumId();
    return await exports.generateAppIdForModule("CONSORTIUM", currMaxId);
  } catch (e) {
    throw Error(
      "Error while Generating ConsortiumId For " + "CONSORTIUM" + " " + e
    );
  }
};

exports.getConsortiumPrefixText = function () {
  return AppConfigPrefix.CONSORTIUM;
};

exports.getConsortiumIdWithPrefix = function (consortiumId) {
  let consortiumIdWithPrefix = "";
  if (consortiumId !== undefined && consortiumId > 0) {
    consortiumIdWithPrefix = AppConfigPrefix.CONSORTIUM + consortiumId;
  }
  return consortiumIdWithPrefix;
};

exports.getIsRequestFromSystemUser = function (req) {
  const apikey =
    req && req.headers && req.headers.apikey ? req.headers.apikey : "";
  const reqfrom =
    req && req.headers && req.headers.reqfrom ? req.headers.reqfrom : "";
  let isSystemUserRequest = false;
  if (
    reqfrom === AppConfig.HDR_REQ_FROM_PANEL &&
    apikey === AppConfig.HDR_API_KEY_PANEL_SUPER_USER
  ) {
    isSystemUserRequest = true;
  }
  return isSystemUserRequest;
};

exports.getCalendarStartTimestamp = function (activeStartDateTs) {
  var newDate = new Date(activeStartDateTs * 1000);
  newDate.setHours(10);
  newDate.setMinutes(0);
  newDate.setSeconds(0);
  var timestamp = Math.floor(newDate.getTime());
  timestamp = Math.floor(timestamp / 1000);
  return timestamp;
};

exports.getCalendarEndTimestamp = function (activeStartDateTs) {
  var newDate = new Date(activeStartDateTs * 1000);
  newDate.setHours(19);
  newDate.setMinutes(0);
  newDate.setSeconds(0);
  var timestamp = Math.floor(newDate.getTime());
  timestamp = Math.floor(timestamp / 1000);
  return timestamp;
};

//------------------------------------------------------------------------------------ConsortiumUser--------------------------------------------------------------

exports.checkConsortiumUserHasModuleRights = async function (
  consortiumUser,
  moduleName,
  right
) {
  let hasRight = false;
  const module = await ConsortiumUserModuleService.findModuleByName(moduleName);
  if (module) {
    const roleRights = await ConsortiumUserRoleService.getRoleModuleRights(
      consortiumUser.consortiumUserRole,
      module._id
    );

    if (roleRights) {
      let relevantRightVal = 0;
      if (right === AppConfigModule.RIGHT_ADD) {
        relevantRightVal = roleRights.add;
      } else if (right === AppConfigModule.RIGHT_VIEW) {
        relevantRightVal = roleRights.view;
      } else if (right === AppConfigModule.RIGHT_VIEW_ALL) {
        relevantRightVal = roleRights.viewAll;
      } else if (right === AppConfigModule.RIGHT_EDIT) {
        relevantRightVal = roleRights.edit;
      } else if (right === AppConfigModule.RIGHT_DELETE) {
        relevantRightVal = roleRights.delete;
      } else if (right === AppConfigModule.RIGHT_PRINT) {
        relevantRightVal = roleRights.print;
      } else if (right === AppConfigModule.RIGHT_EMAIL) {
        relevantRightVal = roleRights.email;
      } else if (right === AppConfigModule.RIGHT_DOWNLOAD) {
        relevantRightVal = roleRights.download;
      }

      if (relevantRightVal === 1) hasRight = true;
    }
  }

  return hasRight;
};

exports.generateConsortiumUserKeyForRequest = function (
  consortiumId,
  consortiumUserId,
  sessionToken
) {
  let userKey = consortiumId + "_" + consortiumUserId + "_" + sessionToken;
  userKey = exports.encryptStringData(userKey);
  return userKey;
};

exports.getIsRequestFromConsortiumUser = function (req) {
  let isConsortiumUserRequest = false;
  const apikey =
    req && req.headers && req.headers.apikey ? req.headers.apikey : "";
  const reqfrom =
    req && req.headers && req.headers.reqfrom ? req.headers.reqfrom : "";
  if (
    reqfrom === AppConfig.HDR_REQ_FROM_APP_USER &&
    AppConfig.VALID_HDR_API_KEY_CONSORTIUM_USER_APP_ARR.indexOf(apikey) >= 0
  ) {
    isConsortiumUserRequest = true;
  }
  return isConsortiumUserRequest;
};

exports.getConsortiumIdFromRequest = async function (req) {
  const encConsortiumUserId =
    req && req.headers && req.headers.cukey ? req.headers.cukey : "";
  let decConsortiumId;
  if (encConsortiumUserId !== undefined && encConsortiumUserId !== "") {
    const decUserKey = exports.decryptStringData(encConsortiumUserId);
    var arr = decUserKey.split("_");
    decConsortiumId = arr[0];
  }
  return decConsortiumId;
};

exports.getConsortiumUserIdFromRequest = async function (req) {
  const encConsortiumUserId =
    req && req.headers && req.headers.cukey ? req.headers.cukey : "";
  let decConsortiumUserId;
  if (encConsortiumUserId !== undefined && encConsortiumUserId !== "") {
    const decUserKey = exports.decryptStringData(encConsortiumUserId);

    var arr = decUserKey.split("_");
    decConsortiumUserId = arr[1];
  }
  return decConsortiumUserId;
};

exports.getConsortiumUserSessionTokenFromRequest = async function (req) {
  const encConsortiumUserId =
    req && req.headers && req.headers.cukey ? req.headers.cukey : "";
  let sessionToken;
  if (encConsortiumUserId !== undefined && encConsortiumUserId !== "") {
    const decUserKey = exports.decryptStringData(encConsortiumUserId);
    var arr = decUserKey.split("_");
    sessionToken = arr[2];
  }
  return sessionToken;
};

exports.getConsortiumLocationIdFromRequest = async function (req) {
  const encConsortiumLocationId =
    req && req.headers && req.headers.clkey ? req.headers.clkey : "";
  let consortiumLocationId;
  if (encConsortiumLocationId !== undefined && encConsortiumLocationId !== "") {
    consortiumLocationId = exports.decryptStringData(encConsortiumLocationId);
  }
  return consortiumLocationId;
};

exports.getConsortiumLocationFromRequest = async function (req) {
  const consortiumLocationId = await exports.getConsortiumLocationIdFromRequest(
    req
  );
  var fetchedConsortiumLocation;
  if (consortiumLocationId !== undefined && consortiumLocationId !== "") {
    fetchedConsortiumLocation =
      await ConsortiumLocationService.findConsortiumLocationById(req, id);
  }
  return fetchedConsortiumLocation;
};

exports.getConsortiumUserFromRequest = async function (req) {
  const decUserId = await exports.getConsortiumUserIdFromRequest(req);
  const sessionToken = await exports.getConsortiumUserSessionTokenFromRequest(
    req
  );
  let user;
  const userSession =
    await ConsortiumUserService.getConsortiumUserSessionForRequest(
      decUserId,
      sessionToken
    );
  if (userSession) {
    user = await ConsortiumUserService.findConsortiumUserById(
      req,
      decUserId,
      false
    );
  }
  return user;
};

exports.getConsortiumFromRequest = async function (req) {
  const decConsortiumId = await exports.getConsortiumIdFromRequest(req);
  let consortium = await ConsortiumService.getConsortiumBaseObjectById(
    decConsortiumId
  );
  return consortium;
};

exports.setConsortiumUserAppAccessed = async function (req) {
  await ConsortiumUserService.saveConsortiumUserAppAccessedDetails(req);
};

//------------------------------------------------------------------------------------ConsortiumPatient--------------------------------------------------------------

exports.generateConsortiumPatientId = async function (consortiumId) {
  try {
    var appID;
    const currMaxId =
      await ConsortiumPatientService.getCurrentHighestConsortiumPatientId(
        consortiumId
      );
    const consortium = await ConsortiumService.getConsortiumBaseObjectById(
      consortiumId
    );

    if (consortium) {
      let ongoingId = consortium.consortiumPatientCurrentId;
      if (ongoingId === null || ongoingId === undefined || isNaN(ongoingId)) {
        ongoingId = 0;
      }
      appID = ongoingId + 1;

      if (currMaxId >= appID) {
        appID = currMaxId + 1;
      } else {
        // Do we wish to go back ??
      }

      consortium.consortiumPatientCurrentId = appID;
      consortium.save();
    }

    return appID;
  } catch (e) {
    throw Error(
      "Error while Generating Id For " + "CONSORTIUMPATIENT" + " " + e
    );
  }
};

exports.generateConsortiumPatientIdForImport = async function (
  consortiumId,
  currMaxId
) {
  try {
    var appID;
    const consortium = await ConsortiumService.getConsortiumBaseObjectById(
      consortiumId
    );

    if (consortium) {
      let ongoingId = consortium.consortiumPatientCurrentId;
      if (ongoingId === null || ongoingId === undefined || isNaN(ongoingId)) {
        ongoingId = 0;
      }
      appID = ongoingId + 1;

      if (currMaxId >= appID) {
        appID = currMaxId + 1;
      } else {
        // Do we wish to go back ??
      }

      consortium.consortiumPatientCurrentId = appID;
      consortium.save();
    }

    return appID;
  } catch (e) {
    throw Error(
      "Error while Generating Id For " + "CONSORTIUMPATIENT" + " " + e
    );
  }
};

exports.getConsortiumPatientPrefixText = function () {
  return AppConfigPrefix.CONSORTIUM_PATIENT;
};

exports.getConsortiumPatientIdWithPrefix = function (consortiumPatientId) {
  let consortiumPatientIdWithPrefix = "";
  if (consortiumPatientId !== undefined && consortiumPatientId > 0) {
    consortiumPatientIdWithPrefix =
      AppConfigPrefix.CONSORTIUM_PATIENT + consortiumPatientId;
  }
  return consortiumPatientIdWithPrefix;
};

//------------------------------------------------------------------------------------ConsortiumPatientAppointment--------------------------------------------------------------

exports.generateConsortiumPatientAppointmentId = async function (consortiumId) {
  try {
    var appID;
    const currMaxId =
      await ConsortiumPatientAppointmentService.getCurrentHighestConsortiumPatientAppointmentId(
        consortiumId
      );
    const consortium = await ConsortiumService.getConsortiumBaseObjectById(
      consortiumId
    );

    if (consortium) {
      let ongoingId = consortium.consortiumPatientAppointmentCurrentId;
      if (ongoingId === null || ongoingId === undefined || isNaN(ongoingId)) {
        ongoingId = 0;
      }
      appID = ongoingId + 1;

      if (currMaxId >= appID) {
        appID = currMaxId + 1;
      } else {
        // Do we wish to go back ??
      }

      consortium.consortiumPatientAppointmentCurrentId = appID;
      consortium.save();
    }

    return appID;
  } catch (e) {
    throw Error(
      "Error while Generating Id For " + "CONSORTIUMPATIENT" + " " + e
    );
  }
};

exports.generateConsortiumPatientAppointmentIdForImport = async function (
  currMaxId,
  consortiumId
) {
  try {
    var appID;
    const consortium = await ConsortiumService.getConsortiumBaseObjectById(
      consortiumId
    );

    if (consortium) {
      let ongoingId = consortium.consortiumPatientAppointmentCurrentId;
      if (ongoingId === null || ongoingId === undefined || isNaN(ongoingId)) {
        ongoingId = 0;
      }
      appID = ongoingId + 1;

      if (currMaxId >= appID) {
        appID = currMaxId + 1;
      } else {
        // Do we wish to go back ??
      }

      consortium.consortiumPatientAppointmentCurrentId = appID;
      consortium.save();
    }

    return appID;
  } catch (e) {
    throw Error(
      "Error while Generating Id For " + "CONSORTIUMPATIENT" + " " + e
    );
  }
};

exports.getConsortiumPatientAppointmentPrefixText = function () {
  return AppConfigPrefix.CONSORTIUM_PATIENT_APPOINTMENT;
};

exports.getConsortiumPatientAppointmentIdWithPrefix = function (
  consortiumPatientAppointmentId
) {
  let consortiumPatientAppointmentIdWithPrefix = "";
  if (
    consortiumPatientAppointmentId !== undefined &&
    consortiumPatientAppointmentId > 0
  ) {
    consortiumPatientAppointmentIdWithPrefix =
      AppConfigPrefix.CONSORTIUM_PATIENT_APPOINTMENT +
      consortiumPatientAppointmentId;
  }
  return consortiumPatientAppointmentIdWithPrefix;
};

exports.assignCoderToAppointment = async function (appointmentId, coderId) {
  try {
    // Find the appointment by ID and update it
    const updateResult = await ConsortiumPatientAppointment.findByIdAndUpdate(
      appointmentId,
      {
        $set: { coderAssignedTo: coderId }, // Update the 'coderAssignedTo' field with the new coder ID
      },
      {
        new: true, // Option to return the updated document
      }
    );

    // Check if the update was successful
    if (!updateResult) {
      throw new Error(
        `No appointment found with ID ${appointmentId} or failed to assign coder.`
      );
    }

    return updateResult; // Return the updated appointment document
  } catch (error) {
    console.error("Error assigning coder to appointment:", error);
    throw error; // Propagate the error
  }
};

//------------------------------------------------------------------------------------ConsortiumChatThread--------------------------------------------------------------

exports.generateConsortiumChatThreadId = async function (consortiumId) {
  try {
    var appID;
    const currMaxId =
      await ConsortiumChatThreadService.getCurrentHighestConsortiumChatThreadId(
        consortiumId
      );
    const consortium = await ConsortiumService.getConsortiumBaseObjectById(
      consortiumId
    );

    if (consortium) {
      let ongoingId = consortium.consortiumChatThreadCurrentId;

      if (ongoingId === null || ongoingId === undefined || isNaN(ongoingId)) {
        ongoingId = 0;
      }
      appID = ongoingId + 1;

      if (currMaxId >= appID) {
        appID = currMaxId + 1;
      } else {
        // Do we wish to go back ??
      }

      consortium.consortiumChatThreadCurrentId = appID;
      consortium.save();
    }

    return appID;
  } catch (e) {
    throw Error(
      "Error while Generating Id For " + "CONSORTIUMCHATTHREAD" + " " + e
    );
  }
};

exports.getConsortiumChatThreadPrefixText = function () {
  return AppConfigPrefix.CONSORTIUM_CHAT_THREAD;
};

exports.getConsortiumChatThreadIdWithPrefix = function (
  consortiumChatThreadId
) {
  let consortiumChatThreadIdWithPrefix = "";
  if (consortiumChatThreadId !== undefined && consortiumChatThreadId > 0) {
    consortiumChatThreadIdWithPrefix =
      AppConfigPrefix.CONSORTIUM_CHAT_THREAD + consortiumChatThreadId;
  }
  return consortiumChatThreadIdWithPrefix;
};

exports.getClonedRequestObject = function (req) {
  var compReqObj;
  if (req) {
    compReqObj = {};
    compReqObj.body = JSON.parse(JSON.stringify(req.body));
    compReqObj.headers = JSON.parse(JSON.stringify(req.headers));
  }
  return compReqObj;
};

exports.timestampToDispViewDate = function (timestamp) {
  let formattedValue = "";

  if (timestamp && timestamp > 0) {
    // const dtObj = moment.unix(timestamp);
    const dtObj = momentTZ
      .unix(timestamp)
      .tz(AppConfig.SYSTEM_DEFAULT_TIMEZONE_STR);
    formattedValue = dtObj.format("DD-MM-YYYY");
  }

  return formattedValue;
};

exports.timestampToDispViewDateForReport = function (timestamp) {
  let formattedValue = "";

  if (timestamp && timestamp > 0) {
    // const dtObj = moment.unix(timestamp);
    const dtObj = momentTZ
      .unix(timestamp)
      .tz(AppConfig.SYSTEM_DEFAULT_TIMEZONE_STR);
    formattedValue = dtObj.format("MM-DD-YYYY");
  }

  return formattedValue;
};

exports.timestampToDispViewDateTime = function (timestamp) {
  let formattedValue = "";

  if (timestamp && timestamp > 0) {
    // const dtObj = moment.unix(timestamp);
    const dtObj = momentTZ
      .unix(timestamp)
      .tz(AppConfig.SYSTEM_DEFAULT_TIMEZONE_STR);
    formattedValue = dtObj.format("DD-MM-YYYY hh:mm a");
  }

  return formattedValue;
};

exports.timestampToDispViewTime = function (timestamp) {
  let formattedValue = "";

  if (timestamp && timestamp > 0) {
    // const dtObj = moment.unix(timestamp);
    const dtObj = momentTZ
      .unix(timestamp)
      .tz(AppConfig.SYSTEM_DEFAULT_TIMEZONE_STR);
    formattedValue = dtObj.format("hh:mm a");
  }

  return formattedValue;
};

exports.secondsToMinutesSeconds = function (totalSeconds) {
  if (Number(totalSeconds) !== undefined && Number(totalSeconds) !== null) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
};

exports.secondsToHourMinuteSecond = function (totalSeconds) {
  if (Number(totalSeconds) !== undefined && Number(totalSeconds) !== null) {
    var hour = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = (totalSeconds % 3600) % 60;

    return `${hour.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
};

exports.convertNumberValueToAlphabet = function (numberVal) {
  let alphabetVal = "";
  while (numberVal >= 0) {
    alphabetVal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[numberVal % 26] + alphabetVal;
    numberVal = Math.floor(numberVal / 26) - 1;
  }
  return alphabetVal;
};

exports.checkIfFileIsTypeImageFromFileName = function (fileName) {
  var isFileTypeImage = false;
  var fileExt = exports.getFileExtensionFromFileName(fileName);

  if (AppConfigUploads.IMG_EXTENSION_ARR.indexOf(fileExt) >= 0) {
    isFileTypeImage = true;
  }

  return isFileTypeImage;
};
