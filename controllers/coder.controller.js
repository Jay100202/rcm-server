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

// Saving the context of this module inside the _the variable

_this = this;
var thisModule = AppConfigModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT;
var consortiumBulkDictationModule =
  AppConfigModule.MOD_CONSORTIUM_BULK_DICTATION;
var thisModulename = AppConfigModuleName.MOD_CONSORTIUM_PATIENT_APPOINTMENT;
var thismoduleicdcptname = AppConfigModuleName.MOD_CODER_ICT_CP;

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
            await CoderService.getConsortiumPatientAppointments(
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

exports.createEncounter = async function (req, res) {
  const patientId = req.body.patientId;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (patientId !== undefined && patientId !== "") {
    var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_ADD
    );
    var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_EDIT
    );
    if (!hasAddRights || !hasEditRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        await AppCommonService.setSystemUserAppAccessed(req);

        let savedEncounter = await CoderService.createEncounter(
          req,
          systemUser.userFullName
        );

        ///////////////////////////////////////
        let { patientId, icdDetails, cptDetails } = req.body;

        const icdPromises = icdDetails.map((data) => {
          EncIcd.createEncIcd(data, patientId, savedEncounter._id);
        });

        const cptPromises = cptDetails.map(async (data) => {
          EncCpt.createEncCpt(data, patientId, savedEncounter._id);
          let claimDetailData = {
            patientId: patientId,
            encounterId: savedEncounter._id,
            cptId: data.cptId,
            cptCode: data.cptCode,
            modifier: data.modifier1,
            modifier2: data.modifier2,
            modifier3: data.modifier3,
            modifier4: data.modifier4,
            chargeAmount: data.units * data.rate,
            units: data.units,
            createdBy: systemUserId,
          };

          await claimDetailService.createClaimDetail(claimDetailData);
        });

        await Promise.all([...icdPromises, ...cptPromises]);

        const claimDetails =
          await claimDetailService.getClaimDetailByEncounterId(
            savedEncounter._id
          );
        const totalChargeAmount = await claimDetails.reduce(
          (sum, detail) => sum + detail.chargeAmount,
          0
        );

        const existingClaim = await claimService.getClaimByEncounterId(
          savedEncounter._id
        );

        if (existingClaim) {
          await claimService.updateClaim(existingClaim._id, {
            chargeAmount: totalChargeAmount,
          });
          await claimDetailService.updateManyClaimDetails(
            savedEncounter._id,
            existingClaim._id
          );
        } else {
          let newDataClaim = {
            encounterId: savedEncounter._id,
            patientId: patientId,
            chargeAmount: totalChargeAmount,
          };
          await claimService.createClaim(newDataClaim);
          // await claimDetailService.updateManyClaimDetails(savedEncounter._id,existingClaim._id);
        }

        ////////////////////////////////////////

        if (savedEncounter) {
          let savedEncounterId = savedEncounter._id;

          resStatus = 1;
          resMsg = AppCommonService.getSavedMessage(thisModulename);
          responseObj.id = savedEncounterId;
        } else {
          resStatus = -1;
          resMsg = AppConfigNotif.SERVER_ERROR;
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "Encounter Retrieval Unsuccesful " + e;
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

exports.createNewEncounter = async function (req, res) {
  const {
    appointmentDetails,
    cptData,
    icdData,
    notes,
    patientDetails,
    coderNotes,
  } = req.body;

  let resStatus = 0;
  let resMsg = "";
  let httpStatus = 201;
  let responseObj = {};

  // console.log("Request Body:", req.body);

  try {
    console.log("Starting createNewEncounter function");

    const systemUser = await AppCommonService.getSystemUserFromRequest(req);
    const systemUserId = systemUser ? systemUser._id : null;

    // console.log("System User:", systemUser);
    // console.log("System User ID:", systemUserId);

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
      console.log("Invalid user");
    } else if (patientDetails && patientDetails._id) {
      console.log("Patient Details:", patientDetails);

      const hasAddRights =
        await AppCommonService.checkSystemUserHasModuleRights(
          systemUser,
          thisModule,
          AppConfigModule.RIGHT_ADD
        );
      const hasEditRights =
        await AppCommonService.checkSystemUserHasModuleRights(
          systemUser,
          thisModule,
          AppConfigModule.RIGHT_EDIT
        );

      // console.log("Has Add Rights:", hasAddRights);
      // console.log("Has Edit Rights:", hasEditRights);

      if (!hasAddRights || !hasEditRights) {
        resStatus = -1;
        resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        console.log("Permission denied");
      } else {
        await AppCommonService.setSystemUserAppAccessed(req);
        if(coderNotes && coderNotes !== ""){  let appointmentWithNotes = await AppointmentSchema.updateOne(
          { _id: appointmentDetails._id },
          { $push: { coderNotes: {
            notes : coderNotes,
            createdBy : systemUser.userFullName,
            createdAt : Date.now()
          } } } // Use $push to add new notes to the array// Use $push to add new notes to the array
        );}
        let savedEncounter = await CoderService.createEncounter(
          req,
          systemUser.userFullName,
          systemUserId // Pass the ObjectId here
        );

        console.log("Saved Encounter:", savedEncounter);

        if (savedEncounter) {
          const patientId = patientDetails._id;
          const savedEncounterId = savedEncounter._id;

          const encIcdById = await EncIcd.getEncIcdByAppointmentId(
            appointmentDetails._id
          );

          const encCptById = await EncCpt.getEncCptByAppointmentId(
            appointmentDetails._id
          );

          console.log("encIcdById", encIcdById);
          console.log("encCptById", encCptById);

          const removeEncIcd = await encIcdById.forEach((data) => {
            const found = icdData.some((it) => it.dx_code === data.dx_code);
            if (!found) {
              EncIcd.deleteEncIcd(data._id);
            }
          });

          const removeEncCpt = await encCptById.forEach((data) => {
            const found = cptData.some((it) => it.Code === data.Code);
            if (!found) {
              EncCpt.deleteEncCpt(data._id);
            }
          });

          const icdPromises = icdData.map((data) =>
            EncIcd.createEncIcd(data, patientId, appointmentDetails._id)
          );
          const cptPromises = cptData.map(async (data) => {
            // console.log("CPT Data:", data);
            // Validate units and rate
            // Validate units and rate as strings
            // if (isNaN(Number(data.units)) || isNaN(Number(data.rate))) {
            //   throw new Error(
            //     `Invalid units or rate for CPT code ${data.Code}`
            //   );
            // }

            // console.log("CPT Data:", data);
            // console.log("data.units:", data.units);
            // console.log("data.rate:", data.Price);

            let chargeAmount = data.units * data.Price;
            // console.log("Charge Amount:", chargeAmount);

            // Validate chargeAmount
            // if (isNaN(chargeAmount)) {
            //   throw new Error(
            //     `Invalid chargeAmount calculated for CPT code ${data.Code}`
            //   );
            // }

            // Create EncCpt
            await EncCpt.createEncCpt(
              data,
              patientId,
              appointmentDetails._id,
              chargeAmount
            );
            // console.log("Created EncCpt:", data);

            let claimDetailData = {
              patientId: patientId,
              encounterId: appointmentDetails._id,
              cptId: data.cptId,
              cptCode: data.cptCode,
              modifier: data.modifier1,
              modifier2: data.modifier2,
              modifier3: data.modifier3,
              modifier4: data.modifier4,
              chargeAmount: chargeAmount,
              units: data.units,
              createdBy: systemUserId,
            };
            await claimDetailService.createClaimDetail(claimDetailData);
            // console.log("Created Claim Detail:", claimDetailData);
          });

          await Promise.all([...icdPromises, ...cptPromises]);

          const claimDetails =
            await claimDetailService.getClaimDetailByEncounterId(
              savedEncounterId
            );
          const totalChargeAmount = await claimDetails.reduce(
            (sum, detail) => sum + detail.chargeAmount,
            0
          );

          // console.log("Total Charge Amount:", totalChargeAmount);

          const existingClaim = await claimService.getClaimByEncounterId(
            savedEncounterId
          );

          if (existingClaim) {
            await claimService.updateClaim(existingClaim._id, {
              chargeAmount: totalChargeAmount,
            });
            await claimDetailService.updateManyClaimDetails(
              savedEncounterId,
              existingClaim._id
            );
            console.log("Updated existing claim");
          } else {
            let newDataClaim = {
              appointmentId: appointmentDetails._id,
              patientId: patientId,
              chargeAmount: totalChargeAmount,
            };
            await claimService.createClaim(newDataClaim);
            console.log("Created new claim:", newDataClaim);
          }

          resStatus = 1;
          resMsg = AppCommonService.getSavedMessage("Coder ");
          responseObj.id = savedEncounterId;
        } else {
          resStatus = -1;
          resMsg = AppConfigNotif.SERVER_ERROR;
          console.log("Server error while saving encounter");
        }
      }
    } else {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_DATA;
      console.log("Invalid data");
    }
  } catch (e) {
    resStatus = -1;
    resMsg = "Encounter Retrieval Unsuccessful " + e;
    console.error("Error:", e);
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  console.log("Response Object:", responseObj);

  return res.status(httpStatus).json(responseObj);
};

exports.getEncounterByStatus = async (req, res) => {
  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  let totalRecords = 0;
  let filteredRecords = 0;
  let EncounterData = [];

  var skipSend = AppCommonService.getSkipSendResponseValue(req);
  var forExport = req.body.forExport ? req.body.forExport : false;

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else {
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
        let EncounterList = await CoderService.getEncounterByStatus(req);

        resStatus = 1;
        if (EncounterList != null) {
          EncounterData = EncounterList;
        }

        if (forExport === true) {
          let appFilters = [];

          responseObj.appFilters = appFilters;
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "Encounter could not be fetched" + e;
      }
    }
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;
  responseObj.draw = 0;
  responseObj.recordsTotal = EncounterData[0].total;
  responseObj.recordsFiltered = filteredRecords;
  responseObj.data = EncounterData[0].data;

  if (skipSend === true) {
    return responseObj;
  } else {
    return res.status(httpStatus).json(responseObj);
  }
};

exports.updateEncounter = async (req, res) => {
  const patientId = req.body.patientId;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (patientId !== undefined && patientId !== "") {
    var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_ADD
    );
    var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_EDIT
    );
    if (!hasAddRights || !hasEditRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        await AppCommonService.setSystemUserAppAccessed(req);

        const id = req.params.id;
        const { patientId, icdDetails, cptDetails } = req.body;

        let updatedEncounter = await CoderService.updateEncounter(req);

        ///////////////////////////////////////

        if (icdDetails && icdDetails.length > 0) {
          const existingIcdDetails = await EncIcd.getEncIcdByEncounterId(id);

          const newIcdDetails = icdDetails.filter((detail) => !detail._id);
          const updatedIcdDetails = icdDetails.filter((detail) => detail._id);

          // Create new icd_details
          const newIcdPromises = newIcdDetails.map((data) => {
            EncIcd.createEncIcd(data, patientId, updatedEncounter._id);
          });

          // Update existing icd_details
          const updateIcdPromises = updatedIcdDetails.map((data) => {
            return EncIcd.updateEncIcd(data._id, data);
          });

          // Delete icd_details not in the update list
          const updateIcdIds = updatedIcdDetails.map((detail) => detail._id);
          const deleteIcdPromises = existingIcdDetails
            .filter((detail) => !updateIcdIds.includes(detail._id.toString()))
            .map((detail) => EncIcd.deleteEncIcd(detail._id));

          await Promise.all([
            ...newIcdPromises,
            ...updateIcdPromises,
            ...deleteIcdPromises,
          ]);
        }

        // Handle cpt_details updates
        if (cptDetails && cptDetails.length > 0) {
          const existingCptDetails = await EncCpt.getEncCptByEncounterId(id);

          const newCptDetails = cptDetails.filter((detail) => !detail._id);
          const updatedCptDetails = cptDetails.filter((detail) => detail._id);

          // Create new cpt_details
          const newCptPromises = newCptDetails.map(async (data) => {
            EncCpt.createEncCpt(data, patientId, updatedEncounter._id);

            let claimDetailData = {
              patientId: patientId,
              encounterId: updatedEncounter._id,
              cptId: data.cptId,
              cptCode: data.cptCode,
              modifier: data.modifier1,
              modifier2: data.modifier2,
              modifier3: data.modifier3,
              modifier4: data.modifier4,
              chargeAmount: data.units * data.rate,
              units: data.units,
              createdBy: systemUserId,
            };

            await claimDetailService.createClaimDetail(claimDetailData);
          });

          // Update existing cpt_details and corresponding claim_details
          const updateCptPromises = updatedCptDetails.map(async (data) => {
            await EncCpt.updateEncCpt(data._id, data);

            const claimDetail = await claimDetailService.findOneClaimDetails(
              updatedEncounter._id,
              data.cptCode
            );

            if (claimDetail) {
              await claimDetailService.updateOneClaimDetail(
                claimDetail._id,
                data
              );
            }
          });

          // Delete cpt_details and corresponding claim_details not in the update list
          const updateCptIds = updatedCptDetails.map((detail) => detail._id);
          const deleteCptPromises = existingCptDetails
            .filter((detail) => !updateCptIds.includes(detail._id.toString()))
            .map(async (detail) => {
              await EncCpt.deleteEncCpt(detail._id);
              await claimDetailService.deleteClaimDetailByEncId(
                updatedEncounter._id,
                detail.cptCode
              );
            });

          await Promise.all([
            ...newCptPromises,
            ...updateCptPromises,
            ...deleteCptPromises,
          ]);
        }

        // Calculate total charge_amount for the encounter
        const claimDetails =
          await claimDetailService.getClaimDetailByEncounterId(
            updatedEncounter._id
          );
        const totalChargeAmount = claimDetails.reduce(
          (sum, detail) => sum + detail.chargeAmount,
          0
        );

        // Update the claim with the total charge_amount
        const existingClaim = await claimService.getClaimByEncounterId(
          updatedEncounter._id
        );

        if (existingClaim) {
          await claimService.updateClaimById(
            existingClaim._id,
            totalChargeAmount
          );
          await claimDetailService.updateClaimIdClaimDetail(
            updatedEncounter._id,
            existingClaim._id
          );
        } else {
          const newClaim = await claimService.createClaimTotalAmount(
            updatedEncounter._id,
            patientId,
            totalChargeAmount
          );
          await claimDetailService.updateClaimIdClaimDetail(
            updatedEncounter._id,
            newClaim._id
          );
        }
        ////////////////////////////////////////

        if (updatedEncounter) {
          let updatedEncounterId = updatedEncounter._id;

          resStatus = 1;
          resMsg = AppCommonService.getSavedMessage(thisModulename);
          responseObj.id = updatedEncounterId;
        } else {
          resStatus = -1;
          resMsg = AppConfigNotif.SERVER_ERROR;
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "Encounter Retrieval Unsuccesful " + e;
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

exports.removeEncounter = async function (req, res, next) {
  var Id = req.params.id;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (Id != "") {
    var hasRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_DELETE
    );
    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        await AppCommonService.setSystemUserAppAccessed(req);

        let deleteEncounter = await CoderService.removeEncounter(
          Id,
          systemUser
        );
        resStatus = 1;
        resMsg = AppCommonService.getDeletedMessage(thisModulename);
      } catch (e) {
        resStatus = -1;
        resMsg = "Encounter Deletion Unsuccesful" + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  return res.status(httpStatus).json({ status: resStatus, message: resMsg });
};
