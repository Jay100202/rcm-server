var AppConfigModule = require("../appconfig-module");
var AppConfigModuleName = require("../appconfig-module-name");
var AppCommonService = require("../services/appcommon.service");
var CoderService = require("../services/coder.service");
var ConsortiumPatientAppointmentService = require("../services/consortiumPatientAppointment.service");
var AppConfigNotif = require("../appconfig-notif");
var EncIcd = require("../services/encIcd.service");
var EncCpt = require("../services/encCpt.service");
var claimDetailService = require("../services/claimDetail.service");
var claimService = require("../services/claim.service");
var AppointmentSchema = require("../models/consortiumPatientAppointment.model");
_ = require("lodash");

const ClaimFormService = require("../services/claimForm.service");
_this = this;
var thisModule = AppConfigModule.MOD_RCM;
var thisModulename = AppConfigModuleName.MOD_RCM;

exports.createClaimForm = async function (req, res) {
  const {
    id, // ClaimForm ID (for updating existing form)
    appointmentDetails,
    claimDetails,
    patientDetails,
    patientId,
    coderNotes,
    tableData,
    followUpNotes,
  } = req.body;

  let resStatus = 0;
  let resMsg = "";
  let httpStatus = 201;
  let responseObj = {};

  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = systemUser ? systemUser._id : null;

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
    } else {
      const hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        thisModule,
        AppConfigModule.RIGHT_ADD
      );
      const hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        thisModule,
        AppConfigModule.RIGHT_EDIT
      );

      if ((id && !hasEditRights) || (!id && !hasAddRights)) {
        resStatus = -1;
        resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
      } else {

       if(coderNotes && coderNotes !== ""){ let appointmentWithNotes = await AppointmentSchema.updateOne(
          { _id: appointmentDetails._id },
          { $push: { coderNotes: {
            notes : coderNotes,
            createdBy : systemUser.userFullName,
            createdAt : Date.now()
          } } } // Use $push to add new notes to the array// Use $push to add new notes to the array
        );
        }
        if(followUpNotes && followUpNotes !== ""){ let appointmentWithNotes = await AppointmentSchema.updateOne(
          { _id: appointmentDetails._id },
          { $push: { followUpNotes: {
            notes : followUpNotes,
            createdBy : systemUser.userFullName,
            createdAt : Date.now()
          } } } // Use $push to add new notes to the array// Use $push to add new notes to the array
        );
}

        // Prepare claim form data
        const claimFormData = {
          EligibilityStatus : claimDetails.EligibilityStatus,
          claimSubmissionDate : claimDetails.claimSubmissionDate,
          claimPaidDate : claimDetails.claimPaidDate,
          EligibilityVerificationNote : claimDetails.EligibilityVerificationNote,
          AuthorizationNumberandNotes : claimDetails.AuthorizationNumberandNotes,
          SchedulingProvider : claimDetails.SchedulingProvider,
          Location : claimDetails.Location,
          PlaceOfService : claimDetails.PlaceOfService,
          RenderingProvider1 : claimDetails.RenderingProvider1,
          RenderingProvider2 : claimDetails.RenderingProvider2,
          tableData : tableData,
          updatedBy: systemUserId,
          updatedAt: Date.now(),
          appointmentId: appointmentDetails._id
        };

        if (!id) {
          claimFormData.createdBy = systemUserId;
          claimFormData.createdAt = Date.now();
        }

        // Save or update the claim form
        const savedOrUpdatedClaimForm = await ClaimFormService.saveOrUpdateClaimForm(appointmentDetails._id, claimFormData);

        resStatus = 1;
        resMsg = id ? "Claim form updated successfully" : "Claim form created successfully";
        responseObj.data = savedOrUpdatedClaimForm;
      }
    }
  } catch (e) {
    resStatus = -1;
    resMsg = "Claim form operation unsuccessful: " + e.message;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.findClaimFormById = async function (req, res) {
  let resStatus = 0;
  let resMsg = "";
  let httpStatus = 200;
  let responseObj = {};

  try {
    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = systemUser ? systemUser._id : null;

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
    } else {
      const hasViewRights = await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        thisModule,
        AppConfigModule.RIGHT_VIEW
      );

      if (!hasViewRights) {
        resStatus = -1;
        resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
      } else {
        const  claimFormId  = req.body._id;

        if (!claimFormId) {
          resStatus = -1;
          resMsg = "Claim form ID is required.";
          httpStatus = 400;
        } else {
          // Fetch the claim form by ID
          const claimForm = await ClaimFormService.findClaimFormById(claimFormId);

          if (!claimForm) {
            resStatus = -1;
            resMsg = "Claim form not found.";
            httpStatus = 404;
          } else {
            resStatus = 1;
            resMsg = "Claim form fetched successfully.";
            responseObj.data = claimForm;
          }
        }
      }
    }
  } catch (e) {
    resStatus = -1;
    resMsg = "Error fetching claim form: " + e.message;
    httpStatus = 500;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.getPatientAppointments = async function (req, res, next) {
  console.log("getPatientAppointments called");

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  let totalRecords = 0;
  let filteredRecords = 0;
  let totalAppointmentDuration = 0;
  let consortiumPatientAppointmentData = [];

  try {
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    // console.log("systemUser:", systemUser);

    var isConsortiumUserRequest =
      await AppCommonService.getIsRequestFromConsortiumUser(req);
    // console.log("isConsortiumUserRequest:", isConsortiumUserRequest);

    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(
      req
    );
    // console.log("consortiumUser:", consortiumUser);

    var consortiumUserId =
      await AppCommonService.getConsortiumUserIdFromRequest(req);
    // console.log("consortiumUserId:", consortiumUserId);

    let sessConsortiumLocationId =
      await AppCommonService.getConsortiumLocationIdFromRequest(req);
    // console.log("sessConsortiumLocationId:", sessConsortiumLocationId);

    responseObj.sessConsortiumLocationId = sessConsortiumLocationId;

    if (!systemUser && !consortiumUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
      console.log("Invalid user");
    } else {
      var hasRights = false;
      if (isConsortiumUserRequest === true) {
        hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(
          consortiumUser,
          thisModule,
          AppConfigModule.RIGHT_VIEW
        );
      } else {
        hasRights = await AppCommonService.checkSystemUserHasModuleRights(
          systemUser,
          thisModule,
          AppConfigModule.RIGHT_VIEW
        );
      }
      // console.log("hasRights:", hasRights);

      if (!hasRights) {
        resStatus = -1;
        resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        console.log("Permission denied");
      } else {
        try {
          if (isConsortiumUserRequest === true) {
            await AppCommonService.setConsortiumUserAppAccessed(req);
          } else {
            await AppCommonService.setSystemUserAppAccessed(req);
          }

          let consortiumPatientAppointmentsList =
            await ClaimFormService.getConsortiumPatientAppointments(
              req,
              systemUser
            );
          // console.log(
          //   "consortiumPatientAppointmentsList:",
          //   consortiumPatientAppointmentsList
          // );

          resStatus = 1;
          if (consortiumPatientAppointmentsList != null) {
            consortiumPatientAppointmentData =
              consortiumPatientAppointmentsList.results;
            totalRecords = consortiumPatientAppointmentsList.totalRecords;
            filteredRecords = consortiumPatientAppointmentsList.filteredRecords;
            let totalAppointmentDurationInSeconds =
              consortiumPatientAppointmentsList.totalAppointmentDurationInSeconds;

            totalAppointmentDurationInSeconds = parseInt(
              totalAppointmentDurationInSeconds
            );
            totalAppointmentDuration =
              AppCommonService.secondsToHourMinuteSecond(
                totalAppointmentDurationInSeconds
              );
          }
        } catch (e) {
          resStatus = -1;
          resMsg =
            "OrganizationPatientAppointmentsList could not be fetched: " + e;
          console.error("Error fetching appointments:", e);
        }
      }
    }
  } catch (e) {
    resStatus = -1;
    resMsg = "Unexpected error: " + e;
    console.error("Unexpected error:", e);
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;
  responseObj.draw = 0;
  responseObj.recordsTotal = totalRecords;
  responseObj.recordsFiltered = filteredRecords;
  responseObj.totalAppointmentDuration = totalAppointmentDuration;
  responseObj.data = consortiumPatientAppointmentData;

  // console.log("responseObj:", responseObj);
  return res.status(httpStatus).json(responseObj);
};