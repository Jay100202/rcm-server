const ICDService = require("../services/icd.service"); // Assuming you have this service for ICD-related logic
const AppCommonService = require("../services/appcommon.service");
const AppConfigNotif = require("../appconfig-notif");
const AppConfigModule = require("../appconfig-module");
const AppConfigModuleName = require("../appconfig-module-name");

_this = this;
var thisModule = AppConfigModule.MOD_ICD; // Assuming you have a module defined for ICD
var thisModulename = AppConfigModuleName.MOD_ICD;

// Get ICD by ID
exports.getIcdById = async function (req, res, next) {
  var id = req.body._id;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (id && id != "") {
    var hasRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_VIEW
    );
    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        await AppCommonService.setSystemUserAppAccessed(req);

        var fetchedICD = await ICDService.findIcdById(req, id);
        if (fetchedICD) {
          resStatus = 1;
          responseObj.icd = fetchedICD;
        } else {
          resStatus = -1;
          resMsg = "ICD Retrieval Unsuccessful";
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "ICD Retrieval Unsuccessful " + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

// Get ICD by Code
exports.getIcdByCode = async function (req, res, next) {
  var code = req.body.dx_code;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (code && code != "") {
    var hasRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_VIEW
    );
    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        await AppCommonService.setSystemUserAppAccessed(req);

        var fetchedICD = await ICDService.findIcdByCode(req, code);
        if (fetchedICD) {
          resStatus = 1;
          responseObj.icd = fetchedICD;
        } else {
          resStatus = -1;
          resMsg = "ICD Retrieval Unsuccessful";
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "ICD Retrieval Unsuccessful " + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

// Get ICD by Search
exports.getIcdBySearch = async function (req, res, next) {
  var searchQuery = req.body.searchQuery;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (searchQuery && searchQuery != "") {
    var hasRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_VIEW
    );
    // if (!hasRights) {
    //   resStatus = -1;
    //   resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    // } else {
      try {
        await AppCommonService.setSystemUserAppAccessed(req);

        var icdList = await ICDService.searchIcd(req, searchQuery);
        if (icdList) {
          resStatus = 1;
          responseObj.icdList = icdList;
        } else {
          resStatus = -1;
          resMsg = "ICD Retrieval Unsuccessful";
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "ICD Retrieval Unsuccessful " + e;
      }
    // }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};
