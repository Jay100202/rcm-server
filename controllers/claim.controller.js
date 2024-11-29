const claimService = require("../services/claim.service");
const AppCommonService = require("../services/appcommon.service");
const AppConfigNotif = require("../appconfig-notif");
const AppConfigModule = require("../appconfig-module");
const AppConfigModuleName = require("../appconfig-module-name");

_this = this;

// Module and module name for claims
const thisModule = AppConfigModule.MOD_RCM;
const thisModulename = AppConfigModuleName.MOD_RCM;

exports.createClaim = async (req, res) => {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      return res.status(401).json({ message: AppConfigNotif.INVALID_USER });
    }

    const hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_ADD
    );

    if (!hasAddRights) {
      return res
        .status(403)
        .json({ message: AppConfigNotif.ACTION_PERMISSION_DENIED });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const newClaim = {
      ...req.body,
      createdBy: systemUserId,
    };

    const result = await claimService.createClaim(newClaim);
    res
      .status(201)
      .json({ message: "Claim created successfully", data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating claim" });
  }
};

exports.listClaimsExcel = async (req, res) => {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if (!systemUser) {
      return res.status(401).json({ message: AppConfigNotif.INVALID_USER });
    }

    const excelData = await claimService.listClaimsExcel(req.query);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${excelData.filename}`
    );

    await excelData.workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.getAllClaims = async (req, res) => {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if (!systemUser) {
      return res.status(401).json({ message: AppConfigNotif.INVALID_USER });
    }

    const claims = await claimService.getAllClaims();
    res
      .status(200)
      .json({ message: "Claims retrieved successfully", data: claims });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClaimById = async (req, res) => {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if (!systemUser) {
      return res.status(401).json({ message: AppConfigNotif.INVALID_USER });
    }

    const claim = await claimService.getClaimById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res
      .status(200)
      .json({ message: "Claim retrieved successfully", data: claim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClaim = async (req, res) => {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      return res.status(401).json({ message: AppConfigNotif.INVALID_USER });
    }

    const hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_EDIT
    );

    if (!hasEditRights) {
      return res
        .status(403)
        .json({ message: AppConfigNotif.ACTION_PERMISSION_DENIED });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const updatedClaim = {
      ...req.body,
      updatedBy: systemUserId,
    };

    const claim = await claimService.updateClaim(req.params.id, updatedClaim);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res
      .status(200)
      .json({ message: "Claim updated successfully", data: claim });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating claim" });
  }
};

exports.deleteClaim = async (req, res) => {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if (!systemUser) {
      return res.status(401).json({ message: AppConfigNotif.INVALID_USER });
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
        .json({ message: AppConfigNotif.ACTION_PERMISSION_DENIED });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const claim = await claimService.deleteClaim(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.status(200).json({ message: "Claim deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting claim" });
  }
};

exports.getClaimFormCMS1500Excel = async (req, res) => {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if (!systemUser) {
      return res.status(401).json({ message: AppConfigNotif.INVALID_USER });
    }

    const excelData = await claimService.getClaimFormCMS1500Excel(req.query);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${excelData.filename}`
    );

    await excelData.workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.getAgingDataExcel = async (req, res) => {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if (!systemUser) {
      return res.status(401).json({ message: AppConfigNotif.INVALID_USER });
    }

    const excelData = await claimService.getAgingDataExcel();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${excelData.filename}`
    );

    await excelData.workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.updatePrimaryClaimDenial = async (req, res) => {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      return res.status(401).json({ message: AppConfigNotif.INVALID_USER });
    }

    const hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_EDIT
    );

    if (!hasEditRights) {
      return res
        .status(403)
        .json({ message: AppConfigNotif.ACTION_PERMISSION_DENIED });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const result = await claimService.updatePrimaryClaimDenial(req.params.id, {
      ...req.body,
      updatedBy: systemUserId,
    });

    if (!result) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateSecondaryClaimDenial = async (req, res) => {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      return res.status(401).json({ message: AppConfigNotif.INVALID_USER });
    }

    const hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_EDIT
    );

    if (!hasEditRights) {
      return res
        .status(403)
        .json({ message: AppConfigNotif.ACTION_PERMISSION_DENIED });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const result = await claimService.updateSecondaryClaimDenial(
      req.params.id,
      {
        ...req.body,
        updatedBy: systemUserId,
      }
    );

    if (!result) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateTertiaryClaimDenial = async (req, res) => {
  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      return res.status(401).json({ message: AppConfigNotif.INVALID_USER });
    }

    const hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_EDIT
    );

    if (!hasEditRights) {
      return res
        .status(403)
        .json({ message: AppConfigNotif.ACTION_PERMISSION_DENIED });
    }

    await AppCommonService.setSystemUserAppAccessed(req);

    const result = await claimService.updateTertiaryClaimDenial(req.params.id, {
      ...req.body,
      updatedBy: systemUserId,
    });

    if (!result) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

