const CPT4Service = require("../services/cpt4.service");
const AppCommonService = require("../services/appcommon.service");
const AppConfigNotif = require("../appconfig-notif");
const AppConfigModule = require("../appconfig-module");
const AppConfigModuleName = require("../appconfig-module-name");

_this = this;
var thisModule = AppConfigModule.MOD_CPT4; // Assuming you have a module defined for CPT4
var thisModulename = AppConfigModuleName.MOD_CPT4;

// Get CPT4 by ID
exports.getCpt4ById = async function (req, res, next) {
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

        var fetchedCPT4 = await CPT4Service.findCpt4ById(req, id);
        if (fetchedCPT4) {
          resStatus = 1;
          responseObj.cpt4 = fetchedCPT4;
        } else {
          resStatus = -1;
          resMsg = "CPT4 Retrieval Unsuccessful";
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "CPT4 Retrieval Unsuccessful " + e;
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

// Get CPT4 by Code
exports.getCpt4ByCode = async function (req, res, next) {
  var code = req.body.Code;

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

        var fetchedCPT4 = await CPT4Service.findCpt4ByCode(req, code);
        if (fetchedCPT4) {
          resStatus = 1;
          responseObj.cpt4 = fetchedCPT4;
        } else {
          resStatus = -1;
          resMsg = "CPT4 Retrieval Unsuccessful";
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "CPT4 Retrieval Unsuccessful " + e;
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

// Get CPT4 by Search
exports.getCpt4BySearch = async function (req, res, next) {
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

        var cpt4List = await CPT4Service.searchCpt4(req, searchQuery);
        if (cpt4List) {
          resStatus = 1;
          responseObj.cpt4List = cpt4List;
        } else {
          resStatus = -1;
          resMsg = "CPT4 Retrieval Unsuccessful";
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "CPT4 Retrieval Unsuccessful " + e;
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
