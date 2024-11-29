const claimDetailService = require("../services/claimDetail.service");
var AppCommonService = require("../services/appcommon.service");
var AppConfigNotif = require("../appconfig-notif");
var AppConfigModule = require("../appconfig-module");
var AppConfigModuleName = require("../appconfig-module-name");

_this = this;
var thisModule = AppConfigModule.MOD_RCM;
var thisModulename = AppConfigModuleName.MOD_RCM;

exports.getClaimDetailById = async (req, res) => {
  let resStatus = 0;
  let resMsg = "";
  const responseObj = {};

  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
      return res.status(401).json({ status: resStatus, message: resMsg });
    }

    const { id } = req.params;
    const claimDetailRecord = await claimDetailService.getClaimDetailById(id);

    if (!claimDetailRecord) {
      return res.status(404).json({ message: "Claim detail not found" });
    }

    res.json(claimDetailRecord);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createClaimDetail = async (req, res) => {
  let resStatus = 0;
  let resMsg = "";
  const responseObj = {};

  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
      return res.status(401).json({ status: resStatus, message: resMsg });
    }

    const hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_ADD
    );

    if (!hasAddRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
      return res.status(403).json({ status: resStatus, message: resMsg });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const newClaimDetail = {
      ...req.body,
      createdBy: systemUserId,
    };

    const savedClaimDetail = await claimDetailService.createClaimDetail(
      newClaimDetail
    );

    resStatus = 1;
    resMsg = AppCommonService.getSavedMessage(thisModulename);
    responseObj.id = savedClaimDetail._id;

    res
      .status(201)
      .json({ status: resStatus, message: resMsg, data: responseObj });
  } catch (error) {
    console.error(error);
    resStatus = -1;
    resMsg = "Error creating claim detail";
    res.status(500).json({ status: resStatus, message: resMsg });
  }
};

exports.updateClaimDetail = async (req, res) => {
  let resStatus = 0;
  let resMsg = "";
  const responseObj = {};

  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
      return res.status(401).json({ status: resStatus, message: resMsg });
    }

    const hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_EDIT
    );

    if (!hasEditRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
      return res.status(403).json({ status: resStatus, message: resMsg });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const { id } = req.params;
    const updatedClaimDetail = {
      ...req.body,
      updatedBy: systemUserId,
    };

    const savedClaimDetail = await claimDetailService.updateClaimDetail(
      id,
      updatedClaimDetail
    );

    if (!savedClaimDetail) {
      return res.status(404).json({ message: "Claim detail not found" });
    }

    resStatus = 1;
    resMsg = "Updated Claim Detail"
    responseObj.id = savedClaimDetail._id;

    res.json({ status: resStatus, message: resMsg, data: savedClaimDetail });
  } catch (error) {
    console.error(error);
    resStatus = -1;
    resMsg = "Error updating claim detail";
    res.status(500).json({ status: resStatus, message: resMsg });
  }
};

exports.deleteClaimDetail = async (req, res) => {
  let resStatus = 0;
  let resMsg = "";
  const responseObj = {};

  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
      return res.status(401).json({ status: resStatus, message: resMsg });
    }

    const hasDeleteRights =
      await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        thisModule,
        AppConfigModule.RIGHT_DELETE
      );

    if (!hasDeleteRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
      return res.status(403).json({ status: resStatus, message: resMsg });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const { id } = req.params;
    const deletedClaimDetail = await claimDetailService.deleteClaimDetail(id);

    if (!deletedClaimDetail) {
      return res.status(404).json({ message: "Claim detail not found" });
    }

    resStatus = 1;
    resMsg = AppCommonService.getDeletedMessage(thisModulename);
    responseObj.id = deletedClaimDetail._id;

    res.json({ status: resStatus, message: resMsg, data: responseObj });
  } catch (error) {
    console.error(error);
    resStatus = -1;
    resMsg = "Error deleting claim detail";
    res.status(500).json({ status: resStatus, message: resMsg });
  }
};

exports.listClaimDetailExcel = async (req, res) => {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if (!systemUser) {
      return res.status(401).json({ message: AppConfigNotif.INVALID_USER });
    }

    const excelData = await claimDetailService.listClaimDetailExcel(req.query);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${excelData.filename}`
    );

    await excelData.workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updatePrimaryDenial = async (req, res) => {
  let resStatus = 0;
  let resMsg = "";
  const responseObj = {};

  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
      return res.status(401).json({ status: resStatus, message: resMsg });
    }

    const hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_EDIT
    );

    if (!hasEditRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
      return res.status(403).json({ status: resStatus, message: resMsg });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const { id } = req.params;
    const { denial_code, denial_reason } = req.body;

    const result = await claimDetailService.updatePrimaryDenial(id, {
      denial_code,
      denial_reason,
      updatedBy: systemUserId,
    });

    if (!result) {
      return res.status(404).json({ message: "Claim detail not found" });
    }

    resStatus = 1;
    resMsg = "Updated primary Denail"
    responseObj.id = result._id;

    res.json({ status: resStatus, message: resMsg, data: responseObj });
  } catch (error) {
    console.error(error);

    resStatus = -1;
    resMsg = "Error updating primary denial";
    if (error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ status: resStatus, message: "Invalid ID format" });
    }

    res.status(500).json({ status: resStatus, message: resMsg });
  }
};

exports.updateSecondaryDenial = async (req, res) => {
  let resStatus = 0;
  let resMsg = "";
  const responseObj = {};

  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
      return res.status(401).json({ status: resStatus, message: resMsg });
    }

    const hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_EDIT
    );

    if (!hasEditRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
      return res.status(403).json({ status: resStatus, message: resMsg });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const { id } = req.params;
    const { denial_code, denial_reason } = req.body;

    const result = await claimDetailService.updateSecondaryDenial(id, {
      denial_code,
      denial_reason,
      updatedBy: systemUserId,
    });

    if (!result) {
      return res.status(404).json({ message: "Claim detail not found" });
    }

    resStatus = 1;
    resMsg = "Updated Secondary Denial"
    responseObj.id = result.updatedClaimDetail._id;

    res.json({ status: resStatus, message: resMsg, data: responseObj });
  } catch (error) {
    console.error(error);

    resStatus = -1;
    resMsg = "Error updating secondary denial";
    if (error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ status: resStatus, message: "Invalid ID format" });
    }

    res.status(500).json({ status: resStatus, message: resMsg });
  }
};

exports.updateTertiaryDenial = async (req, res) => {
  let resStatus = 0;
  let resMsg = "";
  const responseObj = {};

  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
      return res.status(401).json({ status: resStatus, message: resMsg });
    }

    const hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_EDIT
    );

    if (!hasEditRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
      return res.status(403).json({ status: resStatus, message: resMsg });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const { id } = req.params;
    const { denial_code, denial_reason } = req.body;

    const result = await claimDetailService.updateTertiaryDenial(id, {
      denial_code,
      denial_reason,
      updatedBy: systemUserId,
    });

    if (!result) {
      return res.status(404).json({ message: "Claim detail not found" });
    }

    resStatus = 1;
    resMsg = "Updated Tertiary Denail"
    responseObj.id = result.updatedClaimDetail._id;

    res.json({ status: resStatus, message: resMsg, data: responseObj });
  } catch (error) {
    console.error(error);

    resStatus = -1;
    resMsg = "Error updating tertiary denial";
    if (error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ status: resStatus, message: "Invalid ID format" });
    }

    res.status(500).json({ status: resStatus, message: resMsg });
  }
};
