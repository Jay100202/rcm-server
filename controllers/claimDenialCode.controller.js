const ClaimDenialCodeService = require("../services/claimDenialCode.service");
const AppCommonService = require("../services/appcommon.service");
const AppConfigNotif = require("../appconfig-notif");
const AppConfigModule = require("../appconfig-module");
const AppConfigModuleName = require("../appconfig-module-name");

var thisModule = AppConfigModule.MOD_RCM;
var thisModulename = AppConfigModuleName.MOD_RCM;

exports.getClaimDenialCodeList = async function (req, res) {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if (!systemUser) {
      return res
        .status(401)
        .json({ status: -1, message: AppConfigNotif.INVALID_USER });
    }

    const claimDenialCodes =
      await ClaimDenialCodeService.getClaimDenialCodeList();
    res.json({ status: 1, message: "Success", data: claimDenialCodes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: -1, message: "Server Error" });
  }
};

exports.createClaimDenialCode = async function (req, res) {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      return res
        .status(401)
        .json({ status: -1, message: AppConfigNotif.INVALID_USER });
    }

    const hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_ADD
    );

    if (!hasAddRights) {
      return res
        .status(403)
        .json({ status: -1, message: AppConfigNotif.ACTION_PERMISSION_DENIED });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const claimData = {
      ...req.body,
      createdBy: systemUserId,
    };

    const createdClaimDenialCode =
      await ClaimDenialCodeService.createClaimDenialCode(claimData);
    res.json({
      status: 1,
      message: "Claim Denial Code Created",
      data: createdClaimDenialCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: -1, message: "Server Error" });
  }
};

exports.updateClaimDenialCode = async function (req, res) {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      return res
        .status(401)
        .json({ status: -1, message: AppConfigNotif.INVALID_USER });
    }

    const hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_EDIT
    );

    if (!hasEditRights) {
      return res
        .status(403)
        .json({ status: -1, message: AppConfigNotif.ACTION_PERMISSION_DENIED });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const id = req.params.id;
    const updatedData = {
      ...req.body,
      updatedBy: systemUserId,
    };

    const updatedClaimDenialCode =
      await ClaimDenialCodeService.updateClaimDenialCode(id, updatedData);
    res.json({
      status: 1,
      message: "Claim Denial Code Updated",
      data: updatedClaimDenialCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: -1, message: "Server Error" });
  }
};

exports.deleteClaimDenialCode = async function (req, res) {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if (!systemUser) {
      return res
        .status(401)
        .json({ status: -1, message: AppConfigNotif.INVALID_USER });
    }

    const hasDeleteRights =
      await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        thisModule,
        AppConfigModule.RIGHT_DELETE
      );

    if (!hasDeleteRights) {
      return res
        .status(403)
        .json({ status: -1, message: AppConfigNotif.ACTION_PERMISSION_DENIED });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const id = req.params.id;

    const deletedClaimDenialCode =
      await ClaimDenialCodeService.deleteClaimDenialCode(id);
    res.json({
      status: 1,
      message: "Claim Denial Code Deleted",
      data: deletedClaimDenialCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: -1, message: "Server Error" });
  }
};
