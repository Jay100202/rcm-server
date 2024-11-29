var ConsortiumPatientService = require("../services/consortiumPatient.service");
var ConsortiumPatientAppointmentService = require("../services/consortiumPatientAppointment.service");
var ConsortiumUserService = require("../services/consortiumUser.service");
var ActivityPriorityService = require("../services/activityPriority.service");
var ActivityActionService = require("../services/activityAction.service");
var ConsortiumService = require("../services/consortium.service");
var ConsortiumPatientAppointmentDictationAttachmentService = require("../services/consortiumPatientAppointmentDictationAttachment.service");
var ConsortiumPatientAppointmentTranscriptionAttachmentService = require("../services/consortiumPatientAppointmentTranscriptionAttachment.service");
var SystemUserDaywiseWorkAllocationPatientAppointmentService = require("../services/systemUserDaywiseWorkAllocationPatientAppointment.service");
var SystemUserDaywiseWorkAllocationService = require("../services/systemUserDaywiseWorkAllocation.service");
var ConsortiumLocationService = require("../services/consortiumLocation.service");
var TranscriptionStatusService = require("../services/transcriptionStatus.service");
var TranscriptorRoleService = require("../services/transcriptorRole.service");
var ConsortiumSystemUserTeamService = require("../services/consortiumSystemUserTeam.service");
var AppConfigUploadsModule = require("../appconfig-uploads-module");
var AppUploadService = require("../services/appUpload.service");
var ConsortiumPreliminaryAttachmentService = require("../services/consortiumPreliminaryAttachment.service");
var SystemPreliminaryAttachmentService = require("../services/systemPreliminaryAttachment.service");
var AppointmentStatusService = require("../services/appointmentStatus.service");
var ActivityStatusService = require("../services/activityStatus.service");
var ActivityFileStatusService = require("../services/activityFileStatus.service");
var SystemUserService = require("../services/systemUser.service");
var AppCommonService = require("../services/appcommon.service");
var AppDataSanitationService = require("../services/appDataSanitation.service");
var AppConfigNotif = require("../appconfig-notif");
var AppConfigModule = require("../appconfig-module");
var AppConfigConst = require("../appconfig-const");
var AppConfigModuleName = require("../appconfig-module-name");
var mongodb = require("mongodb");
var mongoose = require("mongoose");
var moment = require("moment");
var momentTZ = require("moment-timezone");
const { getEncCptByPatientId } = require("../services/encCpt.service");
const { getEncIcdByPatientId } = require("../services/encIcd.service");
_ = require("lodash");

// Saving the context of this module inside the _the variable

_this = this;
var thisModule = AppConfigModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT;
var consortiumBulkDictationModule =
  AppConfigModule.MOD_CONSORTIUM_BULK_DICTATION;
var thisModulename = AppConfigModuleName.MOD_CONSORTIUM_PATIENT_APPOINTMENT;

exports.saveConsortiumPatientAppointment = async function (req, res) {
  var consortiumPatientAppointmentId = req.body.id;
  var consortiumId = req.body.consortium;
  var appointmentDate = req.body.appointmentDate;
  var consortiumUserDoctor = req.body.consortiumUser;
  var consortiumPatient = req.body.consortiumPatient;
  var startTime = req.body.startTime;
  var endTime = req.body.endTime;
  var notes = req.body.notes;
  var consortiumLocation = req.body.consortiumLocation;
  var transcriptionPreliminaryAttachmentIdArr =
    req.body.transcriptionPreliminaryAttachmentIdArr;
  var transcriptionAttachmentIdArr = req.body.transcriptionAttachmentIdArr;
  var appointmentPreliminaryAttachmentIdArr =
    req.body.appointmentPreliminaryAttachmentIdArr;
  var appointmentAttachmentIdArr = req.body.appointmentAttachmentIdArr;

  appointmentDate = await AppDataSanitationService.sanitizeDataTypeNumber(
    appointmentDate
  );
  startTime = await AppDataSanitationService.sanitizeDataTypeNumber(startTime);
  endTime = await AppDataSanitationService.sanitizeDataTypeNumber(endTime);

  if (!consortiumPatientAppointmentId) consortiumPatientAppointmentId = "";

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );

  if (isConsortiumUserRequest === true) {
    consortiumId = consortiumUser.consortium;
    consortiumLocation =
      await AppCommonService.getConsortiumLocationIdFromRequest(req);
  }

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    appointmentDate > 0 &&
    startTime > 0 &&
    endTime > 0 &&
    consortiumId !== undefined &&
    consortiumId !== "" &&
    consortiumLocation !== undefined &&
    consortiumLocation !== "" &&
    consortiumUserDoctor !== undefined &&
    consortiumUserDoctor !== "" &&
    consortiumPatient !== undefined &&
    consortiumPatient !== ""
  ) {
    var hasAddRights = false;
    var hasEditRights = false;
    if (isConsortiumUserRequest === true) {
      hasAddRights = await AppCommonService.checkConsortiumUserHasModuleRights(
        consortiumUser,
        thisModule,
        AppConfigModule.RIGHT_ADD
      );
      hasEditRights = await AppCommonService.checkConsortiumUserHasModuleRights(
        consortiumUser,
        thisModule,
        AppConfigModule.RIGHT_EDIT
      );
    } else {
      hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        thisModule,
        AppConfigModule.RIGHT_ADD
      );
      hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        thisModule,
        AppConfigModule.RIGHT_EDIT
      );
    }

    if (
      (consortiumPatientAppointmentId == "" && !hasAddRights) ||
      (consortiumPatientAppointmentId != "" && !hasEditRights)
    ) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        if (isConsortiumUserRequest === true) {
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        var existingConsortiumPatientAppointment =
          await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
            req,
            consortiumPatientAppointmentId,
            false
          );

        let existingAppointmentAttachments = [];

        if (existingConsortiumPatientAppointment) {
          existingAppointmentAttachments =
            existingConsortiumPatientAppointment.appointmentAttachments;
        }

        var consortiumPatientAppointment = {
          appointmentDate: appointmentDate,
          consortium: consortiumId,
          consortiumUser: consortiumUserDoctor,
          consortiumPatient: consortiumPatient,
          consortiumLocation: consortiumLocation,
          startTime: startTime,
          endTime: endTime,
          notes: notes,
        };

        if (isConsortiumUserRequest === true) {
          consortiumPatientAppointment.updatedByConsortiumUser =
            consortiumUserId;
        } else {
          consortiumPatientAppointment.updatedBySystemUser = systemUserId;
        }

        if (existingConsortiumPatientAppointment) {
          consortiumPatientAppointment.id = consortiumPatientAppointmentId;
        } else {
          consortiumPatientAppointment.isDeleted = 0;

          if (isConsortiumUserRequest === true) {
            consortiumPatientAppointment.createdByConsortiumUser =
              consortiumUserId;
          } else {
            consortiumPatientAppointment.createdBySystemUser = systemUserId;
          }
        }

        var fetchedConsortium;
        if (isConsortiumUserRequest === true) {
          fetchedConsortium = await AppCommonService.getConsortiumFromRequest(
            req
          );
        } else {
          fetchedConsortium =
            await ConsortiumService.getConsortiumBaseObjectById(
              consortiumId,
              false
            );
        }

        let appointmentAttachments = [];
        if (
          existingAppointmentAttachments !== null &&
          existingAppointmentAttachments.length > 0
        ) {
          await Promise.all(
            existingAppointmentAttachments.map(
              async (existingAppointmentAttachment, attIndex) => {
                const attachmentId = existingAppointmentAttachment._id;
                const attFilePathActual =
                  existingAppointmentAttachment.attFilePathActual;
                const attFilePathThumb =
                  existingAppointmentAttachment.attFilePathThumb;
                const attachmentIdIndex = appointmentAttachmentIdArr.indexOf(
                  attachmentId + ""
                );

                if (attachmentIdIndex < 0) {
                  await AppUploadService.removeConsortiumPatientAppointmentAttachment(
                    fetchedConsortium,
                    existingAppointmentAttachment.isImage,
                    attFilePathActual
                  );
                  if (existingAppointmentAttachment.isImage) {
                    await AppUploadService.removeConsortiumPatientAppointmentAttachment(
                      fetchedConsortium,
                      existingAppointmentAttachment.isImage,
                      attFilePathThumb
                    );
                  }
                } else {
                  // Find the corresponding preliminary attachment ID
                  const preliminaryAttachment =
                    appointmentPreliminaryAttachmentIdArr.find(
                      (preliminary) => preliminary.id === attachmentId + ""
                    );

                  // Update attType based on the found preliminary attachment
                  if (preliminaryAttachment) {
                    existingAppointmentAttachment.attType =
                      preliminaryAttachment.text;
                  }

                  appointmentAttachments.push(existingAppointmentAttachment);
                }
              }
            )
          );
        }

        if (
          appointmentPreliminaryAttachmentIdArr !== null &&
          appointmentPreliminaryAttachmentIdArr.length > 0
        ) {
          await Promise.all(
            appointmentPreliminaryAttachmentIdArr.map(
              async (preliminaryAttachmentId, attIndex) => {
                if (preliminaryAttachmentId.id !== "") {
                  let preliminaryAttachment;
                  if (isConsortiumUserRequest === true) {
                    preliminaryAttachment =
                      await ConsortiumPreliminaryAttachmentService.findConsortiumPreliminaryAttachmentById(
                        req,
                        preliminaryAttachmentId.id
                      );
                  } else {
                    preliminaryAttachment =
                      await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(
                        req,
                        preliminaryAttachmentId.id
                      );
                  }

                  if (preliminaryAttachment) {
                    let profilePhotoFilePath =
                      await AppUploadService.moveConsortiumPreliminaryAttachmentToConsortiumPatientAppointmentAttachment(
                        isConsortiumUserRequest,
                        fetchedConsortium,
                        preliminaryAttachment
                      );

                    let attFilePathActual,
                      attFilePathThumb,
                      attImageActualUrl,
                      attImageThumbUrl,
                      attFileUrl;
                    if (preliminaryAttachment.isImage === true) {
                      var compImageFilePath =
                        await AppCommonService.compileUploadedImageFileNamesFromFileName(
                          profilePhotoFilePath
                        );
                      if (compImageFilePath !== undefined) {
                        attFilePathActual = compImageFilePath.actual;
                        attFilePathThumb = compImageFilePath.thumb;

                        attImageActualUrl =
                          await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(
                            AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT,
                            attFilePathActual,
                            fetchedConsortium
                          ); //
                        attImageThumbUrl =
                          await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(
                            AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT,
                            attFilePathThumb,
                            fetchedConsortium
                          ); //
                      }
                    } else {
                      attFilePath = profilePhotoFilePath;
                      attFileUrl =
                        await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(
                          AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT,
                          attFilePath,
                          fetchedConsortium
                        ); //
                    }

                    const attFileUrlExpiresAt =
                      AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); //

                    var newAttachment = {
                      attFilePath: profilePhotoFilePath,
                      attType: preliminaryAttachmentId.text,
                      attFileName: preliminaryAttachment.attFileName,
                      isImage: preliminaryAttachment.isImage,
                      attFileSizeBytes: preliminaryAttachment.attFileSizeBytes,
                      attFilePathActual: attFilePathActual,
                      attFilePathThumb: attFilePathThumb,
                      attImageActualUrl: attImageActualUrl,
                      attImageThumbUrl: attImageThumbUrl,
                      attFileUrl: attFileUrl,
                      attFileUrlExpiresAt: attFileUrlExpiresAt,
                    };

                    appointmentAttachments.push(newAttachment);
                  }
                }
              }
            )
          );
        }

        consortiumPatientAppointment.appointmentAttachments =
          appointmentAttachments;

        let savedConsortiumPatientAppointment =
          await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
            consortiumPatientAppointment
          );

        if (savedConsortiumPatientAppointment) {
          // responseObj.savedConsortiumPatientAppointment = savedConsortiumPatientAppointment;
          responseObj.savedConsortiumPatientAppointmentId =
            savedConsortiumPatientAppointment._id;
          resStatus = 1;
          resMsg = AppCommonService.getSavedMessage(thisModulename);
        } else {
          resStatus = -1;
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
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

exports.getConsortiumPatientAppointmentDetails = async function (
  req,
  res,
  next
) {
  console.log("Function getConsortiumPatientAppointmentDetails called");
  console.log("Request body:", req.body);

  var id = req.body._id;
  console.log("Request body ID:", id);

  var withAllTranscriptionAttachments = req.body.withAllTranscriptionAttachments
    ? req.body.withAllTranscriptionAttachments &&
      typeof req.body.withAllTranscriptionAttachments === "boolean"
    : false;
  console.log(
    "With all transcription attachments:",
    withAllTranscriptionAttachments
  );

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var skipSend = AppCommonService.getSkipSendResponseValue(req);
  console.log("Skip send response value:", skipSend);

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
  console.log("System user:", systemUser);
  console.log("System user ID:", systemUserId);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );
  let sessConsortiumLocationId =
    await AppCommonService.getConsortiumLocationIdFromRequest(req);
  console.log("Is consortium user request:", isConsortiumUserRequest);
  console.log("Consortium user:", consortiumUser);
  console.log("Consortium user ID:", consortiumUserId);
  console.log("Session consortium location ID:", sessConsortiumLocationId);

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
    console.log("Invalid user");
  } else if (id && id != "") {
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
    console.log("User has rights:", hasRights);

    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
      console.log("Action permission denied");
    } else {
      try {
        if (isConsortiumUserRequest === true) {
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        await AppUploadService.checkAndGenerateModuleMultipleAttachmentExpiredSignedFileUrl(
          AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT,
          id
        );
        await AppUploadService.checkAndGenerateSecondaryModuleExpiredSignedFileUrl(
          AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT,
          id
        );
        await AppUploadService.checkAndGenerateSecondaryModuleExpiredSignedFileUrl(
          AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT,
          id
        );

        var fetchedConsortiumPatientAppointment =
          await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
            req,
            id
          );
        console.log(
          "Fetched consortium patient appointment:",
          fetchedConsortiumPatientAppointment
        );

        if (fetchedConsortiumPatientAppointment) {
          var appointmentStatusChangeLogs =
            await AppointmentStatusService.getAppointmentStatusChangeLogByPatientAppointment(
              id
            );
          var transcriptionStatusChangeLogs =
            await TranscriptionStatusService.getConsortiumPatientAppointmentTranscriptionStatusChangeLogByPatientAppointment(
              id
            );
          console.log(
            "Appointment status change logs:",
            appointmentStatusChangeLogs
          );
          console.log(
            "Transcription status change logs:",
            transcriptionStatusChangeLogs
          );

          let fetchedConsortium;
          let fetchedConsortiumId;
          if (isConsortiumUserRequest === true) {
            fetchedConsortium = await AppCommonService.getConsortiumFromRequest(
              req
            );
          } else {
            fetchedConsortium =
              await ConsortiumService.getConsortiumBaseObjectById(
                fetchedConsortiumPatientAppointment.consortium._id,
                false
              );
          }
          console.log("Fetched consortium:", fetchedConsortium);

          if (fetchedConsortium) {
            fetchedConsortiumId = fetchedConsortium._id;
          }

          let existingDictationRecordingAttachments =
            await ConsortiumPatientAppointmentDictationAttachmentService.findConsortiumPatientAppointmentDictationAttachmentByConsortiumPatientAppointmentId(
              fetchedConsortium,
              id
            );
          console.log(
            "Existing dictation recording attachments:",
            existingDictationRecordingAttachments
          );

          let systemUserDaywiseWorkAllocationLogs =
            await SystemUserDaywiseWorkAllocationService.getSystemUserDaywiseWorkAllocationLogByPatientAppointment(
              id
            );
          console.log(
            "System user daywise work allocation logs:",
            systemUserDaywiseWorkAllocationLogs
          );

          // Fetch ICD and CPT codes based on patient ID

          let icdCodes = await getEncIcdByPatientId(id);
          let cptCodes = await getEncCptByPatientId(id);
          console.log("ICD codes:", icdCodes);
          console.log("CPT codes:", cptCodes);

          resStatus = 1;
          responseObj.consortiumPatientAppointment =
            fetchedConsortiumPatientAppointment;
          responseObj.appointmentStatusChangeLogs = appointmentStatusChangeLogs;
          responseObj.transcriptionStatusChangeLogs =
            transcriptionStatusChangeLogs;
          responseObj.dictationRecordingAttachments =
            existingDictationRecordingAttachments;
          responseObj.systemUserDaywiseWorkAllocationLogs =
            systemUserDaywiseWorkAllocationLogs;
          responseObj.icdCodes = icdCodes;
          responseObj.cptCodes = cptCodes;

          let existingTranscriptionAttachments =
            await ConsortiumPatientAppointmentTranscriptionAttachmentService.findConsortiumPatientAppointmentTranscriptionAttachmentByConsortiumPatientAppointmentId(
              fetchedConsortium,
              id
            );
          console.log(
            "Existing transcription attachments:",
            existingTranscriptionAttachments
          );

          if (withAllTranscriptionAttachments === false) {
            if (
              existingTranscriptionAttachments &&
              existingTranscriptionAttachments.length > 0
            ) {
              existingTranscriptionAttachments = [
                existingTranscriptionAttachments[0],
              ];
            }
            responseObj.transcriptionAttachments =
              existingTranscriptionAttachments;
          } else {
            if (
              existingTranscriptionAttachments &&
              existingTranscriptionAttachments.length > 0
            ) {
              responseObj.latestTranscriptionAttachment =
                existingTranscriptionAttachments[0];
              responseObj.transcriptionAttachments =
                existingTranscriptionAttachments.slice(1);
            }
          }
        } else {
          resStatus = -1;
          resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful ";
          console.log("OrganizationPatientAppointment Retrieval Unsuccessful");
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
        console.log("Error:", e);
      }
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
    console.log("Invalid data");
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;
  console.log("Response object 1:", responseObj);

  if (skipSend === true) {
    return responseObj;
  } else {
    return res.status(httpStatus).json(responseObj);
  }
};

exports.getConsortiumPatientAppointmentAttachments = async function (
  req,
  res,
  next
) {
  var idArr = req.body.idArr;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );
  let sessConsortiumLocationId =
    await AppCommonService.getConsortiumLocationIdFromRequest(req);

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (idArr && idArr !== null && idArr.length > 0) {
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

    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        let consortiumPatientAppointmentAttachments = [];
        await Promise.all(
          idArr.map(async (id, idIndex) => {
            const compiledReq =
              AppCommonService.compileRequestWithSkipSendResponse(req);
            compiledReq.body._id = id;
            compiledReq.body.withAllTranscriptionAttachments = true;

            const consortiumPatientAppointmentDetailResponse =
              await exports.getConsortiumPatientAppointmentDetails(
                compiledReq,
                res,
                next
              );
            if (consortiumPatientAppointmentDetailResponse) {
              if (consortiumPatientAppointmentDetailResponse.status > 0) {
                let appointmentIdInt =
                  consortiumPatientAppointmentDetailResponse
                    .consortiumPatientAppointment.appointmentIdInt;
                // let appointmentAttachments = consortiumPatientAppointmentDetailResponse.consortiumPatientAppointment.appointmentAttachments;
                // let dictationRecordingAttachments = consortiumPatientAppointmentDetailResponse.dictationRecordingAttachments;
                let latestTranscriptionAttachment =
                  consortiumPatientAppointmentDetailResponse.latestTranscriptionAttachment;
                // let transcriptionAttachments = consortiumPatientAppointmentDetailResponse.transcriptionAttachments;

                // if(appointmentAttachments !== undefined && appointmentAttachments.length > 0)
                // {
                //     await Promise.all(appointmentAttachments.map(async (appointmentAttachment, appointmentAttachmentIndex) => {

                //         let attObj = {
                //             appointmentIdInt : appointmentIdInt,
                //             isImage : appointmentAttachment.isImage,
                //             attFileUrl : appointmentAttachment.attFileUrl,
                //             attImageActualUrl : appointmentAttachment.attImageActualUrl,
                //             attImageThumbUrl : appointmentAttachment.attImageThumbUrl,
                //             attFileUrlExpiresAt : appointmentAttachment.attFileUrlExpiresAt,
                //             attFileName : appointmentAttachment.attFileName,
                //         }

                //         consortiumPatientAppointmentAttachments.push(attObj);
                //     }));

                // }

                // if(dictationRecordingAttachments !== undefined && dictationRecordingAttachments.length > 0)
                // {
                //     await Promise.all(dictationRecordingAttachments.map(async (dictationRecordingAttachment, appointmentAttachmentIndex) => {

                //         let attObj = {
                //             appointmentIdInt : appointmentIdInt,
                //             isImage : dictationRecordingAttachment.isImage,
                //             attFileUrl : dictationRecordingAttachment.attFileUrl,
                //             attImageActualUrl : dictationRecordingAttachment.attImageActualUrl,
                //             attImageThumbUrl : dictationRecordingAttachment.attImageThumbUrl,
                //             attFileUrlExpiresAt : dictationRecordingAttachment.attFileUrlExpiresAt,
                //             attFileName : dictationRecordingAttachment.attFileName,
                //         }

                //         consortiumPatientAppointmentAttachments.push(attObj);
                //     }));

                // }

                let canMarkForFinalTranscriptionAttachmentDownloaded = false;
                if (
                  latestTranscriptionAttachment !== undefined &&
                  latestTranscriptionAttachment !== null
                ) {
                  let transcriptionStatus =
                    consortiumPatientAppointmentDetailResponse
                      .consortiumPatientAppointment.transcriptionStatus;
                  let isFinalTranscriptionAttachmentDownloaded =
                    consortiumPatientAppointmentDetailResponse
                      .consortiumPatientAppointment
                      .isFinalTranscriptionAttachmentDownloaded;

                  if (
                    isFinalTranscriptionAttachmentDownloaded === null &&
                    isFinalTranscriptionAttachmentDownloaded === undefined
                  ) {
                    isFinalTranscriptionAttachmentDownloaded = false;
                  }

                  if (
                    isFinalTranscriptionAttachmentDownloaded === false &&
                    transcriptionStatus
                  ) {
                    let statusCode = transcriptionStatus.statusCode;

                    if (
                      statusCode ===
                      AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_COMPLETED
                    ) {
                      canMarkForFinalTranscriptionAttachmentDownloaded = true;
                    }
                  }

                  if (
                    canMarkForFinalTranscriptionAttachmentDownloaded === true
                  ) {
                    let consortiumPatientAppointmentId =
                      consortiumPatientAppointmentDetailResponse
                        .consortiumPatientAppointment._id;

                    let consortiumPatientAppointmentObj = {
                      id: consortiumPatientAppointmentId,
                      isFinalTranscriptionAttachmentDownloaded: true,
                    };

                    await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
                      consortiumPatientAppointmentObj,
                      req
                    );
                  }

                  let attImageActualUrl;
                  let attImageThumbUrl;

                  if (
                    latestTranscriptionAttachment.attImageActualUrl !==
                    undefined
                  ) {
                    attImageActualUrl =
                      latestTranscriptionAttachment.attImageActualUrl;
                  }

                  if (
                    latestTranscriptionAttachment.attImageThumbUrl !== undefined
                  ) {
                    attImageThumbUrl =
                      latestTranscriptionAttachment.attImageThumbUrl;
                  }

                  if (latestTranscriptionAttachment.attImgUrl !== undefined) {
                    attImageActualUrl = latestTranscriptionAttachment.attImgUrl;
                  }

                  if (
                    latestTranscriptionAttachment.attImgThumbUrl !== undefined
                  ) {
                    attImageThumbUrl =
                      latestTranscriptionAttachment.attImgThumbUrl;
                  }

                  let attObj = {
                    appointmentIdInt: appointmentIdInt,
                    isImage: latestTranscriptionAttachment.isImage,
                    attFileUrl: latestTranscriptionAttachment.attFileUrl,
                    attImageActualUrl: attImageActualUrl,
                    attImageThumbUrl: attImageThumbUrl,
                    attFileUrlExpiresAt:
                      latestTranscriptionAttachment.attFileUrlExpiresAt,
                    attFileName: latestTranscriptionAttachment.attFileName,
                  };
                  consortiumPatientAppointmentAttachments.push(attObj);
                }

                // if(transcriptionAttachments !== undefined && transcriptionAttachments.length > 0)
                // {
                //     await Promise.all(transcriptionAttachments.map(async (transcriptionAttachment, appointmentAttachmentIndex) => {

                //         let attObj = {
                //             appointmentIdInt : appointmentIdInt,
                //             isImage : transcriptionAttachment.isImage,
                //             attFileUrl : transcriptionAttachment.attFileUrl,
                //             attImageActualUrl : transcriptionAttachment.attImageActualUrl,
                //             attImageThumbUrl : transcriptionAttachment.attImageThumbUrl,
                //             attFileUrlExpiresAt : transcriptionAttachment.attFileUrlExpiresAt,
                //             attFileName : transcriptionAttachment.attFileName,
                //         }

                //         consortiumPatientAppointmentAttachments.push(attObj);
                //     }));

                // }
              }
            }
          })
        );
        resStatus = 1;
        responseObj.consortiumPatientAppointmentAttachments =
          consortiumPatientAppointmentAttachments;
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
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

exports.getConsortiumPatientAppointments = async function (req, res, next) {
  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  let totalRecords = 0;
  let filteredRecords = 0;
  let totalAppointmentDuration = 0;
  let consortiumPatientAppointmentData = [];

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );
  let sessConsortiumLocationId =
    await AppCommonService.getConsortiumLocationIdFromRequest(req);
  responseObj.sessConsortiumLocationId = sessConsortiumLocationId;

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
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

    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        if (isConsortiumUserRequest === true) {
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        let consortiumPatientAppointmentsList =
          await ConsortiumPatientAppointmentService.getConsortiumPatientAppointments(
            req
          );

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

          totalAppointmentDuration = AppCommonService.secondsToHourMinuteSecond(
            totalAppointmentDurationInSeconds
          );
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointmentsList could not be fetched" + e;
      }
    }
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;
  responseObj.draw = 0;
  responseObj.recordsTotal = totalRecords;
  responseObj.recordsFiltered = filteredRecords;
  responseObj.totalAppointmentDuration = totalAppointmentDuration;
  responseObj.data = consortiumPatientAppointmentData;

  return res.status(httpStatus).json(responseObj);
};

exports.getConsortiumPatientAppointmentMetrics = async function (
  req,
  res,
  next
) {
  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );
  let sessConsortiumLocationId =
    await AppCommonService.getConsortiumLocationIdFromRequest(req);

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
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

    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        if (isConsortiumUserRequest === true) {
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        let metrics =
          await ConsortiumPatientAppointmentService.getConsortiumPatientAppointmentMetrics(
            req
          );

        responseObj.metrics = metrics;
        resStatus = 1;
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointmentsList could not be fetched" + e;
      }
    }
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.selectConsortiumPatientAppointmentList = async function (
  req,
  res,
  next
) {
  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive * 1 : 1;
  var forFilter = req.body.forFilter
    ? req.body.forFilter && typeof req.body.forFilter === "boolean"
    : false;

  let totalRecords = 0;
  let consortiumPatientAppointmentData = [];

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else {
    try {
      if (isConsortiumUserRequest === true) {
        await AppCommonService.setConsortiumUserAppAccessed(req);
        consortium = consortiumUser.consortium;
      } else {
        await AppCommonService.setSystemUserAppAccessed(req);
      }

      let consortiumPatientAppointmentList =
        await ConsortiumPatientAppointmentService.getConsortiumPatientAppointmentsForSelect(
          req,
          onlyActiveStatus
        );

      resStatus = 1;
      if (consortiumPatientAppointmentList != null) {
        totalRecords = consortiumPatientAppointmentList.length;
        consortiumPatientAppointmentData = consortiumPatientAppointmentList;

        if (forFilter) {
          let consortiumPatientAppointmentObj = {};
          consortiumPatientAppointmentObj.id = "";
          consortiumPatientAppointmentObj.text =
            "All ConsortiumPatientAppointments";

          consortiumPatientAppointmentData.unshift(
            consortiumPatientAppointmentObj
          );
        }
      }
    } catch (e) {
      resStatus = -1;
      resMsg = "OrganizationPatientAppointments could not be fetched" + e;
    }
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;
  responseObj.total_count = totalRecords;
  responseObj.results = consortiumPatientAppointmentData;

  return res.status(httpStatus).json(responseObj);
};

exports.changeConsortiumPatientAppointmentStatus = async function (
  req,
  res,
  next
) {
  var id = req.body._id;
  var isActive = req.body.isActive;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (id != "") {
    var hasRights = false;
    if (isConsortiumUserRequest === true) {
      hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(
        consortiumUser,
        thisModule,
        AppConfigModule.RIGHT_EDIT
      );
    } else {
      hasRights = await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        thisModule,
        AppConfigModule.RIGHT_EDIT
      );
    }

    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        if (isConsortiumUserRequest === true) {
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        var existingConsortiumPatientAppointment =
          await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
            req,
            id,
            false
          );
        if (existingConsortiumPatientAppointment) {
          var consortiumPatientAppointment = {
            id: existingConsortiumPatientAppointment._id,
            isActive: isActive,
          };

          if (isConsortiumUserRequest === true) {
            consortiumPatientAppointment.updatedByConsortiumUser =
              consortiumUserId;
          } else {
            consortiumPatientAppointment.updatedBySystemUser = systemUserId;
          }

          let savedConsortiumPatientAppointment =
            await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
              consortiumPatientAppointment
            );

          resStatus = 1;
          resMsg = AppCommonService.getStatusChangedMessage();
        } else {
          resStatus = -1;
          resMsg = "OrganizationPatientAppointment Status Change Unsuccesful";
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Status Change Unsuccesful" + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = "Invalid Data";
  }

  return res.status(httpStatus).json({ status: resStatus, message: resMsg });
};

exports.checkCanBeDeleted = async function (req, res, next) {
  var id = req.body._id;

  var skipSend = AppCommonService.getSkipSendResponseValue(req);

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (id && id != "") {
    var hasRights = false;
    if (isConsortiumUserRequest === true) {
      hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(
        consortiumUser,
        thisModule,
        AppConfigModule.RIGHT_DELETE
      );
    } else {
      hasRights = await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        thisModule,
        AppConfigModule.RIGHT_DELETE
      );
    }

    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        if (isConsortiumUserRequest === true) {
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        var existingConsortiumPatientAppointment =
          await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
            req,
            id,
            false
          );
        if (existingConsortiumPatientAppointment) {
          let arrivedAt = existingConsortiumPatientAppointment.arrivedAt;
          if (arrivedAt > 0) {
            resStatus = -1;
            resMsg =
              "The patient has already arrived, you cannot delete this appointment";
          } else {
            resStatus = 1;
          }
        } else {
          {
            resStatus = -1;
            resMsg = "OrganizationPatientAppointment Status Change Unsuccesful";
          }
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Status Change Unsuccesful" + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  if (skipSend === true) {
    return responseObj;
  } else {
    return res.status(httpStatus).json(responseObj);
  }
};

exports.removeConsortiumPatientAppointment = async function (req, res, next) {
  var id = req.params.id;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (id != "") {
    var hasRights = false;
    if (isConsortiumUserRequest === true) {
      hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(
        consortiumUser,
        thisModule,
        AppConfigModule.RIGHT_DELETE
      );
    } else {
      hasRights = await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        thisModule,
        AppConfigModule.RIGHT_DELETE
      );
    }
    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        if (isConsortiumUserRequest === true) {
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        const compiledReq =
          AppCommonService.compileRequestWithSkipSendResponse(req);
        compiledReq.body._id = id;
        const canBeDeletedResponse = await exports.checkCanBeDeleted(
          compiledReq,
          res,
          next
        );
        if (canBeDeletedResponse) {
          if (canBeDeletedResponse.status > 0) {
            var consortiumPatientAppointment = {
              id,
              isDeleted: 1,
            };

            if (isConsortiumUserRequest === true) {
              consortiumPatientAppointment.updatedByConsortiumUser =
                consortiumUserId;
            } else {
              consortiumPatientAppointment.updatedBySystemUser = systemUserId;
            }

            let savedConsortiumPatientAppointment =
              await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
                consortiumPatientAppointment
              );

            resStatus = 1;
            resMsg = AppCommonService.getDeletedMessage(thisModulename);
          } else {
            resStatus = canBeDeletedResponse.status;
            resMsg = canBeDeletedResponse.message;
          }
        } else {
          resStatus = -1;
          resMsg = AppConfigNotif.SERVER_ERROR;
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Deletion Unsuccesful" + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  return res.status(httpStatus).json({ status: resStatus, message: resMsg });
};

exports.selectAppointmentStatusList = async function (req, res, next) {
  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive * 1 : 1;
  var forFilter = req.body.forFilter
    ? req.body.forFilter && typeof req.body.forFilter === "boolean"
    : false;

  let totalRecords = 0;
  let appointmentStatusData = [];

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else {
    try {
      if (isConsortiumUserRequest === true) {
        await AppCommonService.setConsortiumUserAppAccessed(req);
        consortium = consortiumUser.consortium;
      } else {
        await AppCommonService.setSystemUserAppAccessed(req);
      }

      let appointmentStatuses =
        await AppointmentStatusService.getAppointmentStatusesForSelect(req);

      resStatus = 1;
      if (appointmentStatuses != null) {
        totalRecords = appointmentStatuses.length;
        appointmentStatusData = appointmentStatuses;
      }
    } catch (e) {
      resStatus = -1;
      resMsg = "OrganizationPatientAppointments could not be fetched" + e;
    }
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;
  responseObj.total_count = totalRecords;
  responseObj.results = appointmentStatusData;

  return res.status(httpStatus).json(responseObj);
};

exports.getRelevantAppointments = async function (req, res, next) {
  console.log("Request received:", req.body);

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var selectDateTs = req.body.selectedDate;
  var viewType = req.body.viewType;
  var consortiumUserIdArr = req.body.consortiumUserIdArr;
  var activeStartDateTs = req.body.activeStartDateTs;
  var activeEndDateTs = req.body.activeEndDateTs;
  var consortiumPatientId = req.body.consortiumPatientId;
  var consortiumLocationId = req.body.consortiumLocationId;

  console.log("Initial variables set");

  let appointmentData = [];
  let compiledData = [];
  let userWiseBifurcatedData = {};
  let statusWiseBifurcatedData = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  console.log("System user:", systemUser);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  console.log("Is consortium user request:", isConsortiumUserRequest);

  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  console.log("Consortium user:", consortiumUser);

  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );
  console.log("Consortium user ID:", consortiumUserId);

  if (isConsortiumUserRequest === true) {
    consortiumLocationId =
      await AppCommonService.getConsortiumLocationIdFromRequest(req);
    console.log("Consortium location ID:", consortiumLocationId);
  }

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
    console.log("Invalid user");
  } else {
    try {
      if (isConsortiumUserRequest === true) {
        await AppCommonService.setConsortiumUserAppAccessed(req);
        consortium = consortiumUser.consortium;
        console.log("Consortium user accessed");
      } else {
        await AppCommonService.setSystemUserAppAccessed(req);
        console.log("System user accessed");
      }

      let appointmentList =
        await ConsortiumPatientAppointmentService.fetchCalendarConsortiumPatientAppointments(
          selectDateTs,
          viewType,
          consortiumUserIdArr,
          activeStartDateTs,
          activeEndDateTs,
          consortiumPatientId,
          consortiumLocationId
        );
      console.log("Appointment list fetched:", appointmentList);

      resStatus = 1;

      if (appointmentList) {
        appointmentData = appointmentList;
        let appointmentListCount = appointmentList.length - 1;
        if (appointmentList && appointmentList.length > 0) {
          await Promise.all(
            appointmentList.map(async (calendarEvent, calendarEventIndex) => {
              if (calendarEvent && calendarEvent.consortiumPatient) {
                let fullName = calendarEvent.consortiumPatient.fullName;
                let consortiumPatientId = calendarEvent.consortiumPatient._id;

                let consortiumId = calendarEvent.consortium._id;

                let patientName = fullName;
                let appointmentIdWithPrefix =
                  AppCommonService.getConsortiumPatientAppointmentIdWithPrefix(
                    calendarEvent.appointmentId
                  );

                let appointmentWithId = "",
                  appointmentWithName = "";
                let consortiumUser = calendarEvent.consortiumUser;
                if (consortiumUser) {
                  appointmentWithId = consortiumUser._id;
                  appointmentWithName = consortiumUser.userFullName;
                }

                compUserObj = {
                  id: appointmentWithId,
                  text: appointmentWithName,
                };

                let appointmentStatusColor = calendarEvent.appointmentStatus
                  ? calendarEvent.appointmentStatus.colorCode
                  : "";
                let appointmentStatusId = calendarEvent.appointmentStatus
                  ? calendarEvent.appointmentStatus._id
                  : "";
                let appointmentStatusText = calendarEvent.appointmentStatus
                  ? calendarEvent.appointmentStatus.statusText
                  : "";

                let compColorObj = {
                  primary: appointmentStatusColor,
                  secondary: appointmentStatusColor,
                };

                let title = appointmentIdWithPrefix + " : " + patientName;

                const startDate = calendarEvent.startTime;
                const endDate = calendarEvent.endTime;

                const calEntry = {};
                calEntry.isAppointment = true;
                calEntry.consortiumId = consortiumId;
                calEntry.id = calendarEvent._id;
                calEntry.startTs = startDate;
                calEntry.endTs = endDate;
                calEntry.title = title;
                calEntry.patientId = consortiumPatientId;
                calEntry.patientName = patientName;
                calEntry.color = compColorObj;
                calEntry.appointmentWithName = appointmentWithName;
                calEntry.appointmentWithId = appointmentWithId;
                calEntry.consortiumLocation =
                  calendarEvent.consortiumPatient.consortiumLocation;
                calEntry.draggable = false;
                calEntry.meta = {
                  user: compUserObj,
                };
                calEntry.resizable = {
                  beforeStart: false,
                  afterEnd: false,
                };

                if (userWiseBifurcatedData[appointmentWithId] === undefined) {
                  userWiseBifurcatedData[appointmentWithId] = {
                    totalAppointmentCount: 0,
                    userName: appointmentWithName,
                  };
                }

                let appointmentIncrementVal = 1;

                userWiseBifurcatedData[
                  appointmentWithId
                ].totalAppointmentCount =
                  userWiseBifurcatedData[appointmentWithId]
                    .totalAppointmentCount + appointmentIncrementVal;

                if (
                  statusWiseBifurcatedData[appointmentStatusId] === undefined
                ) {
                  statusWiseBifurcatedData[appointmentStatusId] = {
                    totalAppointmentCount: 0,
                    statusText: appointmentStatusText,
                    colorCode: appointmentStatusColor,
                  };
                }

                statusWiseBifurcatedData[
                  appointmentStatusId
                ].totalAppointmentCount =
                  statusWiseBifurcatedData[appointmentStatusId]
                    .totalAppointmentCount + 1;

                compiledData.push(calEntry);
                lastEndTs = endDate;

                console.log("Calendar event processed:", calEntry);
              }
            })
          );
        }
      }

      // Debugging logs
      console.log("View Type:", viewType);
      console.log("Appointment Data:", appointmentData);
      console.log("Compiled Data:", compiledData);
      console.log("User Wise Bifurcated Data:", userWiseBifurcatedData);
      console.log("Status Wise Bifurcated Data:", statusWiseBifurcatedData);
    } catch (e) {
      resStatus = -1;
      resMsg = "OrganizationPatientAppointments could not be fetched" + e;
      console.log("Error fetching appointments:", e);
    }
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;
  responseObj.compiledData = compiledData;
  responseObj.appointmentData = appointmentData;
  responseObj.userWiseBifurcatedData = userWiseBifurcatedData;
  responseObj.statusWiseBifurcatedData = statusWiseBifurcatedData;

  console.log("Response object 2:", responseObj);

  return res.status(httpStatus).json(responseObj);
};

exports.getConsortiumPatientAppointmentCalendarMetrics = async function (
  req,
  res,
  next
) {
  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var consDate = req.body.consDate;
  var consEndDate = req.body.consEndDate; // Extract consEndDate from request body
  var consortiumUserIdArr = req.body.consortiumUserIdArr;
  var consortiumPatientId = req.body.consortiumPatientId;
  var consortiumLocationId = req.body.consortiumLocationId;

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );

  if (isConsortiumUserRequest === true) {
    consortiumLocationId =
      await AppCommonService.getConsortiumLocationIdFromRequest(req);
  }

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else {
    try {
      if (isConsortiumUserRequest === true) {
        await AppCommonService.setConsortiumUserAppAccessed(req);
        consortium = consortiumUser.consortium;
      } else {
        await AppCommonService.setSystemUserAppAccessed(req);
      }

      var consortiumUserMongoIdArr = [];
      if (consortiumUserIdArr !== undefined && consortiumUserIdArr.length > 0) {
        consortiumUserIdArr.forEach((indConsortiumUserId) => {
          if (mongodb.ObjectId.isValid(indConsortiumUserId)) {
            consortiumUserMongoIdArr.push(
              new mongoose.Types.ObjectId(indConsortiumUserId)
            );
          }
        });
      }

      let consStartDtTm, consEndDtTm;
      if (consDate !== undefined && consDate >= 0) {
        const selectedDt = moment.unix(consDate);
        consStartDtTm = selectedDt.startOf("day").unix();
      }
      if (consEndDate !== undefined && consEndDate >= 0) {
        const selectedEndDt = moment.unix(consEndDate);
        consEndDtTm = selectedEndDt.endOf("day").unix();
      }

      const appStatusIdPendingId =
        await AppointmentStatusService.findAppointmentStatusIdByCode(
          AppConfigConst.APPOINTMENT_STATUS_CODE_PENDING
        );
      const appStatusIdWalkInId =
        await AppointmentStatusService.findAppointmentStatusIdByCode(
          AppConfigConst.APPOINTMENT_STATUS_CODE_WALK_IN
        );
      const appStatusIdConsultedId =
        await AppointmentStatusService.findAppointmentStatusIdByCode(
          AppConfigConst.APPOINTMENT_STATUS_CODE_CONSULTED
        );

      let allAppointments =
        await ConsortiumPatientAppointmentService.fetchCalendarConsortiumPatientAppointmentForMetrics(
          consStartDtTm,
          consEndDtTm,
          consortiumUserMongoIdArr,
          consortiumPatientId,
          consortiumLocationId
        );
      let pendingAppointments =
        await ConsortiumPatientAppointmentService.fetchCalendarConsortiumPatientAppointmentForMetrics(
          consStartDtTm,
          consEndDtTm,
          consortiumUserMongoIdArr,
          appStatusIdPendingId,
          consortiumPatientId,
          consortiumLocationId
        );
      let walkInAppointments =
        await ConsortiumPatientAppointmentService.fetchCalendarConsortiumPatientAppointmentForMetrics(
          consStartDtTm,
          consEndDtTm,
          consortiumUserMongoIdArr,
          appStatusIdWalkInId,
          consortiumPatientId,
          consortiumLocationId
        );
      let consultedAppointments =
        await ConsortiumPatientAppointmentService.fetchCalendarConsortiumPatientAppointmentForMetrics(
          consStartDtTm,
          consEndDtTm,
          consortiumUserMongoIdArr,
          appStatusIdConsultedId,
          consortiumPatientId,
          consortiumLocationId
        );

      let allAppointmentCount = allAppointments.length;
      let pendingAppointmentCount = pendingAppointments.length;
      let walkInAppointmentCount = walkInAppointments.length;
      let consultedAppointmentCount = consultedAppointments.length;

      responseObj.metrics = {
        all: allAppointmentCount,
        pending: pendingAppointmentCount,
        walkIn: walkInAppointmentCount,
        consulted: consultedAppointmentCount,
      };

      responseObj.appointmentList = {
        all: allAppointments,
        pending: pendingAppointments,
        walkIn: walkInAppointments,
        consulted: consultedAppointments,
      };
      resStatus = 1;
    } catch (e) {
      resStatus = -1;
      resMsg = "OrganizationPatientAppointments could not be fetched: " + e;
      console.error("Error fetching appointments:", e);
    }
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.setConsortiumPatientAppointmentStatusAsWalkIn = async function (
  req,
  res,
  next
) {
  var id = req.body._id;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (id && id != "") {
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

    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        if (isConsortiumUserRequest === true) {
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        var fetchedConsortiumPatientAppointment =
          await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
            req,
            id
          );
        if (fetchedConsortiumPatientAppointment) {
          const currAppointmentStatusCode =
            fetchedConsortiumPatientAppointment.appointmentStatus.statusCode;

          const canMarkForWalkIn =
            await ConsortiumPatientAppointmentService.canMarkConsortiumPatientAppointmentForWalkIn(
              currAppointmentStatusCode
            );

          if (canMarkForWalkIn === true) {
            await ConsortiumPatientAppointmentService.setConsortiumPatientAppointmentStatusAsWalkIn(
              fetchedConsortiumPatientAppointment._id,
              systemUserId,
              consortiumUserId
            );

            resStatus = 1;
            resMsg =
              "Patient Appointment status marked as Walk-In successfully";
          } else {
            resStatus = -1;
            resMsg = "This appointment cannot be marked for Walk-In";
          }
        } else {
          resStatus = -1;
          resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful ";
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
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

exports.setConsortiumPatientAppointmentStatusAsConsulted = async function (
  req,
  res,
  next
) {
  var id = req.body._id;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (id && id != "") {
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

    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        if (isConsortiumUserRequest === true) {
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        var fetchedConsortiumPatientAppointment =
          await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
            req,
            id
          );
        if (fetchedConsortiumPatientAppointment) {
          const currAppointmentStatusCode =
            fetchedConsortiumPatientAppointment.appointmentStatus.statusCode;

          const canMarkForConsulted =
            await ConsortiumPatientAppointmentService.canMarkConsortiumPatientAppointmentForConsulted(
              currAppointmentStatusCode
            );

          if (canMarkForConsulted === true) {
            await ConsortiumPatientAppointmentService.setConsortiumPatientAppointmentStatusAsConsulted(
              fetchedConsortiumPatientAppointment._id,
              systemUserId,
              consortiumUserId
            );

            const currTs = await AppCommonService.getCurrentTimestamp();

            let transcriptionStatusAssignmentPendingId =
              await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                AppConfigConst.TRANSCRIPTION_STATUS_CODE_ASSIGNMENT_PENDING
              );

            if (transcriptionStatusAssignmentPendingId) {
              let dictationRecordingAttachmentMetric =
                await ConsortiumPatientAppointmentDictationAttachmentService.getConsortiumPatientAppointmentDictationAttachmentTotalDicationDuration(
                  id
                );

              let totalDictationUploadCount =
                dictationRecordingAttachmentMetric.totalDictationUploadCount;
              let totalDicationDurationInSeconds =
                dictationRecordingAttachmentMetric.totalDicationDurationInSeconds;
              let totalDicationAttachmentFileSizeBytes =
                dictationRecordingAttachmentMetric.totalDicationAttachmentFileSizeBytes;

              var consortiumPatientAppointment = {
                id: id,
                isDictationUploadCompleted: true,
                dictationUploadCompletedAt: currTs,
                totalDictationUploadCount: totalDictationUploadCount,
                totalDicationDurationInSeconds: totalDicationDurationInSeconds,
                totalDicationAttachmentFileSizeBytes:
                  totalDicationAttachmentFileSizeBytes,
              };

              let savedConsortiumPatientAppointment =
                await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
                  consortiumPatientAppointment
                );
              if (savedConsortiumPatientAppointment) {
                let updTranscriptionStatusNotes;
                await TranscriptionStatusService.updateTranscriptionStatus(
                  id,
                  transcriptionStatusAssignmentPendingId,
                  updTranscriptionStatusNotes,
                  systemUserId,
                  consortiumUserId
                );
              }
            }

            resStatus = 1;
            resMsg =
              "Patient Appointment status marked as Consulted successfully";
          } else {
            resStatus = -1;
            resMsg = "This appointment cannot be marked for Consulted";
          }
        } else {
          resStatus = -1;
          resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful ";
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
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

exports.performConsortiumPatientAppointmentImport = async function (req, res) {
  var consortiumId = req.body.consortium;
  var consortiumLocationId = req.body.consortiumLocation;
  var consortiumPatientIdArr = req.body.consortiumPatientIdArr;
  var consortiumUserDoctorNameArr = req.body.consortiumUserDoctorNameArr;
  var appointmentDateArr = req.body.appointmentDateArr;
  var startTimeArr = req.body.startTimeArr;
  var startTimeStrArr = req.body.startTimeStrArr;
  var endTimeArr = req.body.endTimeArr;
  var endTimeStrArr = req.body.endTimeStrArr;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );

  if (isConsortiumUserRequest === true) {
    consortiumId = consortiumUser.consortium;
    consortiumLocationId =
      await AppCommonService.getConsortiumLocationIdFromRequest(req);
  }

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    consortiumPatientIdArr !== undefined &&
    consortiumPatientIdArr.length > 0 &&
    consortiumId !== undefined &&
    consortiumId !== null &&
    consortiumId !== "" &&
    consortiumLocationId !== undefined &&
    consortiumLocationId !== null &&
    consortiumLocationId !== ""
  ) {
    var hasAddRights = false;
    var hasEditRights = false;
    if (isConsortiumUserRequest === true) {
      hasAddRights = await AppCommonService.checkConsortiumUserHasModuleRights(
        consortiumUser,
        thisModule,
        AppConfigModule.RIGHT_ADD
      );
      hasEditRights = await AppCommonService.checkConsortiumUserHasModuleRights(
        consortiumUser,
        thisModule,
        AppConfigModule.RIGHT_EDIT
      );
    } else {
      hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        thisModule,
        AppConfigModule.RIGHT_ADD
      );
      hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        thisModule,
        AppConfigModule.RIGHT_EDIT
      );
    }

    if (!hasAddRights || !hasEditRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        await AppCommonService.setSystemUserAppAccessed(req);

        let isValidConsortiumJobType = false;
        var fetchedConsortium = await ConsortiumService.findConsortiumById(
          req,
          consortiumId
        );
        if (fetchedConsortium) {
          let consortiumJobTypes = fetchedConsortium.consortiumJobTypes;

          for (let i = 0; i < consortiumJobTypes.length; i++) {
            let consortiumJobType = consortiumJobTypes[i];
            let typeCode = consortiumJobType.typeCode;
            if (typeCode === AppConfigConst.CONSORTIUM_JOB_TYPE_APPOINTMENT) {
              isValidConsortiumJobType = true;
            }
          }
        }

        var importValidityStatusArr = [];
        var importValidityStatusMsgArr = [];

        var mappedInsConsortiumPatientAppointmentRecordsArr = [];

        if (isValidConsortiumJobType === true) {
          resStatus = 1;
          resMsg = AppCommonService.getSavedMessage(thisModulename);

          await Promise.all(
            consortiumPatientIdArr.map(
              async (consortiumPatientIdStr, srIndex) => {
                var consortiumPatientAppointmentValidityMsg = "Success";
                var sanConsortiumPatientIdStr =
                  AppDataSanitationService.sanitizeDataTypeString(
                    consortiumPatientIdStr
                  );
                var isValidConsortiumPatientAppointmentRecord = false;

                var appointmentDate = appointmentDateArr[srIndex];
                var consortiumUserDoctorName =
                  consortiumUserDoctorNameArr[srIndex];
                var startTime = startTimeArr[srIndex];
                var startTimeStr = startTimeStrArr[srIndex];
                var endTime = endTimeArr[srIndex];
                var endTimeStr = endTimeStrArr[srIndex];

                appointmentDate =
                  AppDataSanitationService.sanitizeDataTypeNumber(
                    appointmentDate
                  );
                startTime =
                  AppDataSanitationService.sanitizeDataTypeNumber(startTime);
                endTime =
                  AppDataSanitationService.sanitizeDataTypeNumber(endTime);
                consortiumUserDoctorName =
                  AppDataSanitationService.sanitizeDataTypeString(
                    consortiumUserDoctorName
                  );

                var startTimeInt = 0;
                if (startTimeStr !== undefined && startTimeStr !== "") {
                  try {
                    startTimeInt = parseInt(startTimeStr.replace(":", ""));
                  } catch (e) {
                    startTimeInt = 0;
                  }
                }

                var endTimeInt = 0;
                if (endTimeStr !== undefined && endTimeStr !== "") {
                  try {
                    endTimeInt = parseInt(endTimeStr.replace(":", ""));
                  } catch (e) {
                    endTimeInt = 0;
                  }
                }

                let patientIdArr = [];
                let fetchedConsortiumPatientArr = [];
                let consortiumPatientId;
                if (sanConsortiumPatientIdStr !== "") {
                  fetchedConsortiumPatientArr =
                    await ConsortiumPatientService.getConsortiumPatientListByIdString(
                      sanConsortiumPatientIdStr,
                      consortiumId
                    );
                  if (
                    fetchedConsortiumPatientArr &&
                    fetchedConsortiumPatientArr.length === 1
                  ) {
                    consortiumPatientId = fetchedConsortiumPatientArr[0]._id;
                    isValidConsortiumPatientAppointmentRecord = true;
                  } else {
                    if (fetchedConsortiumPatientArr.length > 1) {
                      await Promise.all(
                        fetchedConsortiumPatientArr.map(
                          async (consortiumPatient, attIndex) => {
                            patientIdArr.push(consortiumPatient.patientIdStr);
                          }
                        )
                      );
                    }
                  }
                }

                let consortiumUserDoctorId;
                if (consortiumUserDoctorName !== "") {
                  let fetchedConsortiumUser =
                    await ConsortiumUserService.validateConsortiumUserForImport(
                      consortiumUserDoctorName,
                      consortiumId,
                      consortiumLocationId
                    );
                  if (fetchedConsortiumUser) {
                    consortiumUserDoctorId = fetchedConsortiumUser._id;
                  }
                }

                let isValidTime = false;
                if (startTimeInt === 0 && endTimeInt === 0) {
                  isValidTime = false;
                } else {
                  isValidTime =
                    await ConsortiumLocationService.validateConsortiumLocationSlotTime(
                      consortiumLocationId,
                      consortiumId,
                      startTimeInt,
                      endTimeInt
                    );
                }

                if (isValidConsortiumPatientAppointmentRecord === false) {
                  if (fetchedConsortiumPatientArr.length === 0) {
                    consortiumPatientAppointmentValidityMsg =
                      "Patient does not exist.";
                  } else {
                    consortiumPatientAppointmentValidityMsg =
                      "Multiple patients exists with same name (" +
                      patientIdArr.toString() +
                      "). Kindly book this appointment manually.";
                  }
                } else if (consortiumUserDoctorId === undefined) {
                  isValidConsortiumPatientAppointmentRecord = false;
                  consortiumPatientAppointmentValidityMsg =
                    "Provider does not exist or provider type is not valid to add appointment.";
                } else if (isValidTime === false) {
                  isValidConsortiumPatientAppointmentRecord = false;
                  consortiumPatientAppointmentValidityMsg =
                    "Invalid time slot.";
                } else if (appointmentDate <= 0) {
                  isValidConsortiumPatientAppointmentRecord = false;
                  consortiumPatientAppointmentValidityMsg =
                    "Invalid date. (Format MM/DD/YYYY)";
                } else if (startTime <= 0) {
                  isValidConsortiumPatientAppointmentRecord = false;
                  consortiumPatientAppointmentValidityMsg =
                    "Invalid start time.";
                } else if (endTime <= 0) {
                  isValidConsortiumPatientAppointmentRecord = false;
                  consortiumPatientAppointmentValidityMsg = "Invalid end time.";
                }

                if (isValidConsortiumPatientAppointmentRecord === true) {
                  var insConsortiumPatientAppointment = {
                    appointmentDate: appointmentDate,
                    consortium: consortiumId,
                    consortiumUser: consortiumUserDoctorId,
                    consortiumPatient: consortiumPatientId,
                    consortiumLocation: consortiumLocationId,
                    startTime: startTime,
                    endTime: endTime,
                    isDeleted: 0,
                    isActive: 1,
                    // isValidTime : isValidTime,
                  };

                  if (isConsortiumUserRequest === true) {
                    insConsortiumPatientAppointment.createdByConsortiumUser =
                      consortiumUserId;
                    insConsortiumPatientAppointment.updatedByConsortiumUser =
                      consortiumUserId;
                  } else {
                    insConsortiumPatientAppointment.createdBySystemUser =
                      systemUserId;
                    insConsortiumPatientAppointment.updatedBySystemUser =
                      systemUserId;
                  }

                  mappedInsConsortiumPatientAppointmentRecordsArr.push({
                    srIndex: srIndex,
                    insConsortiumPatientAppointment:
                      insConsortiumPatientAppointment,
                  });
                } else {
                  resStatus = -1;
                }

                importValidityStatusArr[srIndex] =
                  isValidConsortiumPatientAppointmentRecord;
                importValidityStatusMsgArr[srIndex] =
                  consortiumPatientAppointmentValidityMsg;
              }
            )
          );

          let tempMappedInsConsortiumPatientAppointmentRecordsArr =
            mappedInsConsortiumPatientAppointmentRecordsArr;

          // responseObj.tempMappedInsConsortiumPatientAppointmentRecordsArr = tempMappedInsConsortiumPatientAppointmentRecordsArr;

          if (tempMappedInsConsortiumPatientAppointmentRecordsArr.length > 0) {
            let currMaxId =
              await ConsortiumPatientAppointmentService.getCurrentHighestConsortiumPatientAppointmentId(
                consortiumId
              );
            await Promise.all(
              tempMappedInsConsortiumPatientAppointmentRecordsArr.map(
                async (
                  mappedConsortiumPatientAppointmentRecord,
                  recordIndex
                ) => {
                  let isValidConsortiumPatientAppointmentRecord = true;
                  let consortiumPatientAppointmentValidityMsg = "Success";

                  currMaxId += 1;
                  let srIndex =
                    mappedConsortiumPatientAppointmentRecord.srIndex;
                  let insConsortiumPatientAppointment =
                    mappedConsortiumPatientAppointmentRecord.insConsortiumPatientAppointment;

                  insConsortiumPatientAppointment.appointmentId = currMaxId;
                  let savedConsortiumPatientAppointment =
                    await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
                      insConsortiumPatientAppointment
                    );

                  if (savedConsortiumPatientAppointment) {
                    let savedConsortiumPatientAppointmentId =
                      savedConsortiumPatientAppointment._id;
                    responseObj.id = savedConsortiumPatientAppointmentId;
                  } else {
                    isValidConsortiumPatientAppointmentRecord = false;
                    consortiumPatientAppointmentValidityMsg =
                      AppConfigNotif.SERVER_ERROR;
                  }

                  importValidityStatusArr[srIndex] =
                    isValidConsortiumPatientAppointmentRecord;
                  importValidityStatusMsgArr[srIndex] =
                    consortiumPatientAppointmentValidityMsg;
                }
              )
            );

            await AppCommonService.generateConsortiumPatientAppointmentIdForImport(
              currMaxId,
              consortiumId
            );
          }

          if (resStatus === 1) {
            resMsg = "All the appointment details were successfully imported";
          } else if (resStatus === -1) {
            resMsg =
              "Some the appointment details were invalid. Kindly import them manually.";
          }
        } else {
          resStatus = -1;
          resMsg = "Invalid consortium job type.";
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;
  responseObj.importValidityStatusArr = importValidityStatusArr;
  responseObj.importValidityStatusMsgArr = importValidityStatusMsgArr;

  return res.status(httpStatus).json(responseObj);
};

exports.modifyConsortiumPatientAppointmentTranscriptionNotes = async function (
  req,
  res,
  next
) {
  var id = req.body._id;
  var additionalTranscriptionNotes = req.body.additionalTranscriptionNotes;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var skipSend = AppCommonService.getSkipSendResponseValue(req);

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );
  let sessConsortiumLocationId =
    await AppCommonService.getConsortiumLocationIdFromRequest(req);

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    id &&
    id != "" &&
    additionalTranscriptionNotes &&
    additionalTranscriptionNotes !== undefined &&
    additionalTranscriptionNotes !== ""
  ) {
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

    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        if (isConsortiumUserRequest === true) {
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        var consortiumPatientAppointment = {
          id: id,
          additionalTranscriptionNotes: additionalTranscriptionNotes,
        };

        if (isConsortiumUserRequest === true) {
          consortiumPatientAppointment.updatedByConsortiumUser =
            consortiumUserId;
        } else {
          consortiumPatientAppointment.updatedBySystemUser = systemUserId;
        }

        let savedConsortiumPatientAppointment =
          await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
            consortiumPatientAppointment
          );

        resStatus = 1;
        resMsg = "Patient appointment notes saved.";
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  if (skipSend === true) {
    return responseObj;
  } else {
    return res.status(httpStatus).json(responseObj);
  }
};
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------

exports.getConsortiumPatientAppointmentListForTranscriptionAssignment =
  async function (req, res, next) {
    let filTranscriptionStatus = req.body.filTranscriptionStatus;
    let filStartTranscriptionAllocationDate =
      req.body.filStartTranscriptionAllocationDate;
    let filEndTranscriptionAllocationDate =
      req.body.filEndTranscriptionAllocationDate;
    let filConsortiumLocation = req.body.filConsortiumLocation;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let consortiumPatientAppointmentData = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var tzStr = await AppCommonService.getTimezoneStrFromRequest(req);

    var skipSend = AppCommonService.getSkipSendResponseValue(req);

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

          if (
            filConsortiumLocation &&
            filConsortiumLocation !== undefined &&
            filConsortiumLocation !== ""
          ) {
          }

          let consTimelineStartDt;
          let consTimelineEndDt;
          if (
            filStartTranscriptionAllocationDate !== undefined &&
            filStartTranscriptionAllocationDate > 0
          ) {
            consTimelineStartDt = filStartTranscriptionAllocationDate;
          } else {
            consTimelineStartDt = momentTZ().tz(tzStr).startOf("day").unix();
          }

          if (
            filEndTranscriptionAllocationDate !== undefined &&
            filEndTranscriptionAllocationDate > 0
          ) {
            consTimelineEndDt = filEndTranscriptionAllocationDate;
          } else {
            consTimelineEndDt = momentTZ().tz(tzStr).endOf("day").unix();
          }

          responseObj.consTimelineStartDt = consTimelineStartDt;
          responseObj.consTimelineEndDt = consTimelineEndDt;

          req.body.forExport = true;
          req.body.filIsDictationUploadCompleted = true;
          req.body.sortBy = "col2";
          req.body.sortOrder = "desc";
          req.body.filStartTranscriptionAllocationDate = consTimelineStartDt;
          req.body.filEndTranscriptionAllocationDate = consTimelineEndDt;

          let consortiumPatientAppointmentsList =
            await ConsortiumPatientAppointmentService.getConsortiumPatientAppointments(
              req
            );

          let totalAppointmentDicationDurationInSeconds = 0;
          let totalAppointmentCount = 0;

          resStatus = 1;
          if (consortiumPatientAppointmentsList != null) {
            let consortiumPatientAppointments =
              consortiumPatientAppointmentsList.results;

            if (
              consortiumPatientAppointments &&
              consortiumPatientAppointments.length > 0
            ) {
              await Promise.all(
                consortiumPatientAppointments.map(
                  async (
                    consortiumPatientAppointment,
                    consortiumPatientAppointmentIndex
                  ) => {
                    consortiumPatientAppointment = JSON.parse(
                      JSON.stringify(consortiumPatientAppointment)
                    );

                    let consortiumPatientAppointmentId =
                      consortiumPatientAppointment._id;
                    let transcriptionAllocationDate =
                      consortiumPatientAppointment.transcriptionAllocationDate;
                    let totalDicationDurationInSeconds =
                      consortiumPatientAppointment.totalDicationDurationInSeconds;
                    let totalDicationAttachmentFileSizeBytes =
                      consortiumPatientAppointment.totalDicationAttachmentFileSizeBytes;
                    let totalDictationUploadCount =
                      consortiumPatientAppointment.totalDictationUploadCount;
                    let submittedTranscriptionAttachment =
                      consortiumPatientAppointment.submittedTranscriptionAttachment;
                    let locationId =
                      consortiumPatientAppointment.consortiumLocation._id;
                    let locationName =
                      consortiumPatientAppointment.consortiumLocation
                        .locationName;
                    let duplicatedBasePatientAppointment =
                      consortiumPatientAppointment.duplicatedBasePatientAppointment;

                    if (
                      duplicatedBasePatientAppointment !== undefined &&
                      duplicatedBasePatientAppointment !== null
                    ) {
                      consortiumPatientAppointment.duplicatedBasePatientAppointment.appointmentIdInt =
                        consortiumPatientAppointment.duplicatedBasePatientAppointment.appointmentId;
                      consortiumPatientAppointment.duplicatedBasePatientAppointment.appointmentId =
                        AppCommonService.getConsortiumPatientAppointmentIdWithPrefix(
                          consortiumPatientAppointment
                            .duplicatedBasePatientAppointment.appointmentId
                        );
                    }

                    let fetchedTranscriptionStatusCode =
                      consortiumPatientAppointment.transcriptionStatus
                        .statusCode;

                    totalDicationDurationInSeconds = parseInt(
                      totalDicationDurationInSeconds
                    );

                    let totalDicationDuration =
                      AppCommonService.secondsToHourMinuteSecond(
                        totalDicationDurationInSeconds
                      );
                    consortiumPatientAppointment.totalDicationDuration =
                      totalDicationDuration;
                    consortiumPatientAppointment.totalDicationDurationInSecondsInt =
                      totalDicationDurationInSeconds;

                    totalAppointmentDicationDurationInSeconds +=
                      totalDicationDurationInSeconds;
                    totalAppointmentCount += 1;

                    let consortium = consortiumPatientAppointment.consortium;

                    let ongoinActivityStatus;
                    if (
                      fetchedTranscriptionStatusCode ===
                      AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED
                    ) {
                      let mtAssignedToId =
                        consortiumPatientAppointment.mtAssignedTo !== null &&
                        consortiumPatientAppointment.mtAssignedTo !== undefined
                          ? consortiumPatientAppointment.mtAssignedTo._id
                          : "";

                      if (mongodb.ObjectId.isValid(mtAssignedToId)) {
                        let systemUserDaywiseWorkAllocationPatientAppointmentMT =
                          await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                            AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT,
                            consortiumPatientAppointmentId,
                            mtAssignedToId
                          );

                        if (
                          systemUserDaywiseWorkAllocationPatientAppointmentMT
                        ) {
                          ongoinActivityStatus =
                            systemUserDaywiseWorkAllocationPatientAppointmentMT.activityStatus;
                        }
                      }
                    } else if (
                      fetchedTranscriptionStatusCode ===
                      AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA1_ASSIGNED
                    ) {
                      let qa1AssignedToId =
                        consortiumPatientAppointment.qa1AssignedTo !== null &&
                        consortiumPatientAppointment.qa1AssignedTo !== undefined
                          ? consortiumPatientAppointment.qa1AssignedTo._id
                          : "";

                      if (mongodb.ObjectId.isValid(qa1AssignedToId)) {
                        let systemUserDaywiseWorkAllocationPatientAppointmentQA1 =
                          await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                            AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA,
                            consortiumPatientAppointmentId,
                            qa1AssignedToId
                          );

                        if (
                          systemUserDaywiseWorkAllocationPatientAppointmentQA1
                        ) {
                          ongoinActivityStatus =
                            systemUserDaywiseWorkAllocationPatientAppointmentQA1.activityStatus;
                        }
                      }
                    } else if (
                      fetchedTranscriptionStatusCode ===
                      AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA2_ASSIGNED
                    ) {
                      let qa2AssignedToId =
                        consortiumPatientAppointment.qa2AssignedTo !== null &&
                        consortiumPatientAppointment.qa2AssignedTo !== undefined
                          ? consortiumPatientAppointment.qa2AssignedTo._id
                          : "";

                      if (mongodb.ObjectId.isValid(qa2AssignedToId)) {
                        let systemUserDaywiseWorkAllocationPatientAppointmentQA2 =
                          await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                            AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA,
                            consortiumPatientAppointmentId,
                            qa2AssignedToId
                          );

                        if (
                          systemUserDaywiseWorkAllocationPatientAppointmentQA2
                        ) {
                          ongoinActivityStatus =
                            systemUserDaywiseWorkAllocationPatientAppointmentQA2.activityStatus;
                        }
                      }
                    } else if (
                      fetchedTranscriptionStatusCode ===
                      AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA3_ASSIGNED
                    ) {
                      let qa3AssignedToId =
                        consortiumPatientAppointment.qa3AssignedTo !== null &&
                        consortiumPatientAppointment.qa3AssignedTo !== undefined
                          ? consortiumPatientAppointment.qa3AssignedTo._id
                          : "";

                      if (mongodb.ObjectId.isValid(qa3AssignedToId)) {
                        let systemUserDaywiseWorkAllocationPatientAppointmentQA3 =
                          await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                            AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA,
                            consortiumPatientAppointmentId,
                            qa3AssignedToId
                          );

                        if (
                          systemUserDaywiseWorkAllocationPatientAppointmentQA3
                        ) {
                          ongoinActivityStatus =
                            systemUserDaywiseWorkAllocationPatientAppointmentQA3.activityStatus;
                        }
                      }
                    }

                    consortiumPatientAppointment.ongoinActivityStatus =
                      ongoinActivityStatus;

                    if (consortium) {
                      let consortiumShortCode = consortium.consortiumShortCode;

                      if (
                        consortiumPatientAppointmentData[
                          consortiumShortCode
                        ] === undefined ||
                        consortiumPatientAppointmentData[
                          consortiumShortCode
                        ] === null
                      ) {
                        consortiumPatientAppointmentData[consortiumShortCode] =
                          {
                            transcriptionAllocationDate:
                              AppCommonService.timestampToDispViewDateTime(
                                transcriptionAllocationDate
                              ),
                            totalDicationDuration: 0,
                            totalDicationAttachmentFileSizeBytes: 0,
                            totalDictationUploadCount: 0,
                            totalPatientAppointmentCount: 0,
                            consortiumIdInt: consortium.consortiumId,
                            consortiumName: consortium.consortiumName,
                            consortiumShortCode: consortium.consortiumShortCode,
                          };
                      }

                      if (
                        consortiumPatientAppointmentData[consortiumShortCode][
                          locationId
                        ] === undefined ||
                        consortiumPatientAppointmentData[consortiumShortCode][
                          locationId
                        ] === null
                      ) {
                        consortiumPatientAppointmentData[consortiumShortCode][
                          locationId
                        ] = {
                          locationName: locationName,
                          transcriptionAllocationDate:
                            AppCommonService.timestampToDispViewDateTime(
                              transcriptionAllocationDate
                            ),
                          totalDicationDuration: 0,
                          totalDicationAttachmentFileSizeBytes: 0,
                          totalDictationUploadCount: 0,
                          totalPatientAppointmentCount: 0,
                          patientAppointmentList: [],
                        };
                      }

                      consortiumPatientAppointmentData[consortiumShortCode][
                        "totalDicationDuration"
                      ] += totalDicationDurationInSeconds;
                      consortiumPatientAppointmentData[consortiumShortCode][
                        "totalDicationAttachmentFileSizeBytes"
                      ] += totalDicationAttachmentFileSizeBytes;
                      consortiumPatientAppointmentData[consortiumShortCode][
                        "totalDictationUploadCount"
                      ] += totalDictationUploadCount;
                      consortiumPatientAppointmentData[consortiumShortCode][
                        "totalPatientAppointmentCount"
                      ] += 1;

                      consortiumPatientAppointmentData[consortiumShortCode][
                        locationId
                      ]["totalDicationDuration"] +=
                        totalDicationDurationInSeconds;
                      consortiumPatientAppointmentData[consortiumShortCode][
                        locationId
                      ]["totalDicationAttachmentFileSizeBytes"] +=
                        totalDicationAttachmentFileSizeBytes;
                      consortiumPatientAppointmentData[consortiumShortCode][
                        locationId
                      ]["totalDictationUploadCount"] +=
                        totalDictationUploadCount;
                      consortiumPatientAppointmentData[consortiumShortCode][
                        locationId
                      ]["totalPatientAppointmentCount"] += 1;

                      consortiumPatientAppointmentData[consortiumShortCode][
                        locationId
                      ]["patientAppointmentList"].push(
                        consortiumPatientAppointment
                      );
                    }
                  }
                )
              );
            }

            responseObj.totalAppointmentDicationDuration =
              AppCommonService.secondsToHourMinuteSecond(
                totalAppointmentDicationDurationInSeconds
              );
            responseObj.totalAppointmentCount = totalAppointmentCount;
            totalRecords = consortiumPatientAppointmentsList.totalRecords;
            filteredRecords = consortiumPatientAppointmentsList.filteredRecords;
          }
        } catch (e) {
          resStatus = -1;
          resMsg =
            "OrganizationPatientAppointmentsList could not be fetched" + e;
        }
      }
    }

    let consortiumPatientAppointmentDataList = [];
    if (consortiumPatientAppointmentData !== null) {
      consortiumPatientAppointmentDataList = Object.values(
        consortiumPatientAppointmentData
      );
      if (consortiumPatientAppointmentDataList.length > 0) {
        await Promise.all(
          consortiumPatientAppointmentDataList.map(
            async (
              consortiumPatientAppointment,
              consortiumPatientAppointmentIndex
            ) => {
              let consortiumLocations = [];
              let locationkeysArr = Object.keys(consortiumPatientAppointment);
              if (locationkeysArr.length > 0) {
                await Promise.all(
                  locationkeysArr.map(
                    async (locationkey, locationkeysIndex) => {
                      if (mongodb.ObjectId.isValid(locationkey)) {
                        let locationObj =
                          consortiumPatientAppointment[locationkey];
                        locationObj.totalDicationDuration =
                          AppCommonService.secondsToHourMinuteSecond(
                            locationObj.totalDicationDuration
                          );

                        let patientAppointmentList =
                          locationObj.patientAppointmentList;
                        patientAppointmentList.sort(function (a, b) {
                          return a.appointmentIdInt - b.appointmentIdInt;
                        });

                        locationObj.patientAppointmentList =
                          patientAppointmentList;

                        consortiumLocations.push(locationObj);
                        delete consortiumPatientAppointment[locationkey];
                      }
                    }
                  )
                );
              }
              consortiumLocations.sort(function (a, b) {
                return a.locationName.localeCompare(b.locationName);
              });
              consortiumPatientAppointment.totalDicationDuration =
                AppCommonService.secondsToHourMinuteSecond(
                  consortiumPatientAppointment.totalDicationDuration
                );
              consortiumPatientAppointment.consortiumLocations =
                consortiumLocations;
            }
          )
        );
      }

      consortiumPatientAppointmentDataList.sort(function (a, b) {
        return a.consortiumShortCode.localeCompare(b.consortiumShortCode);
      });
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = consortiumPatientAppointmentDataList;

    if (skipSend === true) {
      return responseObj;
    } else {
      return res.status(httpStatus).json(responseObj);
    }
  };

exports.getConsortiumUserListForTranscriptionAssignment = async function (
  req,
  res,
  next
) {
  var consortiumPatientAppointmentIdArr =
    req.body.consortiumPatientAppointmentIdArr;
  var listCode = req.body.listCode;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    consortiumPatientAppointmentIdArr &&
    consortiumPatientAppointmentIdArr != undefined &&
    consortiumPatientAppointmentIdArr.length > 0 &&
    listCode !== undefined &&
    listCode !== ""
  ) {
    await AppCommonService.setSystemUserAppAccessed(req);

    var consortiumArr =
      await ConsortiumPatientAppointmentService.validateConsortiumPatientAppointmentListForTranscriptionAssignment(
        consortiumPatientAppointmentIdArr
      );
    let consortiumSystemUserIdArr = [];
    if (consortiumArr && consortiumArr.length > 0) {
      await Promise.all(
        consortiumArr.map(async (consortium, consortiumIndex) => {
          var systemUserArr =
            await ConsortiumSystemUserTeamService.getConsortiumSystemUserIdArrByConsortiumId(
              consortium,
              consortiumSystemUserIdArr
            );

          if (consortiumSystemUserIdArr.length > 0) {
            consortiumSystemUserIdArr = _.intersectionBy(
              consortiumSystemUserIdArr,
              systemUserArr
            );
          } else {
            consortiumSystemUserIdArr =
              consortiumSystemUserIdArr.concat(systemUserArr);
          }
        })
      );
    }

    req.body.incIdArr = consortiumSystemUserIdArr;

    if (listCode === AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT) {
      let mtUserList = await SystemUserService.getMTSystemUsersForSelect(req);
      responseObj.mtUserList = mtUserList;
    }
    if (listCode === AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA) {
      let qaUserList = await SystemUserService.getQASystemUsersForSelect(req);
      responseObj.qaUserList = qaUserList;
    }

    resStatus = 1;
    // responseObj.systemUserIdArr = consortiumSystemUserIdArr;
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.getConsortiumUserListForTranscriptionCoder = async function (
  req,
  res,
  next
) {
  var listCode = req.body.listCode;

  console.log("Incoming request body:", req.body);

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (listCode !== undefined && listCode !== "") {
    await AppCommonService.setSystemUserAppAccessed(req);

    // Fetch transcriptor role _id using listCode
    let transcriptorRole =
      await TranscriptorRoleService.getTranscriptorRoleByCode(listCode);
    console.log("Fetched transcriptor role:", transcriptorRole);

    if (transcriptorRole) {
      let transcriptorRoleId = transcriptorRole._id;

      // Fetch system users based on transcriptor role _id
      let coderUserList =
        await SystemUserService.getSystemUsersByTranscriptorRoleId(
          transcriptorRoleId
        );
      responseObj.coderUserList = coderUserList;

      resStatus = 1;
    } else {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_ROLE_CODE;
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  console.log("Response object 3:", responseObj);

  return res.status(httpStatus).json(responseObj);
};

exports.getConsortiumUserListForBiller = async function (req, res, next) {
  var listCode = req.body.listCode;

  console.log("Incoming request body:", req.body);

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (listCode !== undefined && listCode !== "") {
    await AppCommonService.setSystemUserAppAccessed(req);

    // Fetch biller role _id using listCode
    let billerRole = await TranscriptorRoleService.getBillerRoleByCode(
      listCode
    );
    console.log("Fetched biller role:", billerRole);

    if (billerRole) {
      let billerRoleId = billerRole._id;

      // Fetch system users based on biller role _id
      let billerUserList =
        await SystemUserService.getSystemUsersByTranscriptorRoleId(
          billerRoleId
        );
      responseObj.billerUserList = billerUserList;

      resStatus = 1;
    } else {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_ROLE_CODE;
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  console.log("Response object 4:", responseObj);

  return res.status(httpStatus).json(responseObj);
};

exports.setConsortiumPatientAppointmentTranscriptionStatusAsTranscriptionAssigned =
  async function (req, res, next) {
    var consortiumPatientAppointmentIdArr =
      req.body.consortiumPatientAppointmentIdArr;
    var mtAssignedTo = req.body.mtAssignedTo;
    var qa1AssignedTo = req.body.qa1AssignedTo;
    var qa2AssignedTo = req.body.qa2AssignedTo;
    var qa3AssignedTo = req.body.qa3AssignedTo;
    var activityPriority = req.body.activityPriority;
    var transcriptionStatusNotes = req.body.transcriptionStatusNotes;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
    } else if (
      consortiumPatientAppointmentIdArr &&
      consortiumPatientAppointmentIdArr != undefined &&
      consortiumPatientAppointmentIdArr.length > 0 &&
      ((mtAssignedTo !== undefined && mtAssignedTo !== "") ||
        (qa1AssignedTo !== undefined && qa1AssignedTo !== "") ||
        (qa2AssignedTo !== undefined && qa2AssignedTo !== "") ||
        (qa3AssignedTo !== undefined && qa3AssignedTo !== ""))
    ) {
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

          await Promise.all(
            consortiumPatientAppointmentIdArr.map(
              async (
                consortiumPatientAppointmentId,
                patientAppointmentIndex
              ) => {
                var fetchedConsortiumPatientAppointment =
                  await ConsortiumPatientAppointmentService.validateConsortiumPatientAppointmentForTranscriptionAssignment(
                    consortiumPatientAppointmentId
                  );
                if (fetchedConsortiumPatientAppointment) {
                  // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_fetchedConsortiumPatientAppointment_'] = fetchedConsortiumPatientAppointment;
                  if (
                    activityPriority === undefined ||
                    activityPriority === null ||
                    activityPriority === ""
                  ) {
                    activityPriority =
                      await ActivityPriorityService.findDefaultActivityPriorityId();
                  }
                  let totalDicationDurationInSeconds =
                    fetchedConsortiumPatientAppointment.totalDicationDurationInSeconds;

                  let transcriptionStatusAssignId =
                    await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                      AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED
                    );

                  const currTs = await AppCommonService.getCurrentTimestamp();

                  let updConsortiumPatientAppointment = {
                    id: consortiumPatientAppointmentId,
                    mtAssignedTo: mtAssignedTo,
                    mtAssignedBy: systemUserId,
                    mtAssignedAt: currTs,
                    activityPriority: activityPriority,
                  };

                  if (mongodb.ObjectId.isValid(mtAssignedTo)) {
                    updConsortiumPatientAppointment.mtAssignedTo = mtAssignedTo;
                    updConsortiumPatientAppointment.mtAssignedAt = currTs;
                    updConsortiumPatientAppointment.mtAssignedBy = systemUserId;
                  }

                  if (mongodb.ObjectId.isValid(qa1AssignedTo)) {
                    updConsortiumPatientAppointment.qa1AssignedTo =
                      qa1AssignedTo;
                    updConsortiumPatientAppointment.qa1AssignedAt = currTs;
                    updConsortiumPatientAppointment.qa1AssignedBy =
                      systemUserId;
                  }

                  if (mongodb.ObjectId.isValid(qa2AssignedTo)) {
                    updConsortiumPatientAppointment.qa2AssignedTo =
                      qa2AssignedTo;
                    updConsortiumPatientAppointment.qa2AssignedAt = currTs;
                    updConsortiumPatientAppointment.qa2AssignedBy =
                      systemUserId;
                  }

                  if (mongodb.ObjectId.isValid(qa3AssignedTo)) {
                    updConsortiumPatientAppointment.qa3AssignedTo =
                      qa3AssignedTo;
                    updConsortiumPatientAppointment.qa3AssignedAt = currTs;
                    updConsortiumPatientAppointment.qa3AssignedBy =
                      systemUserId;
                  }
                  // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_updConsortiumPatientAppointment_'] = updConsortiumPatientAppointment;

                  let savedConsortiumPatientAppointment =
                    await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
                      updConsortiumPatientAppointment
                    );

                  // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedConsortiumPatientAppointment_'] = savedConsortiumPatientAppointment;

                  if (savedConsortiumPatientAppointment) {
                    let createdBySystemUser =
                      savedConsortiumPatientAppointment.createdBySystemUser;
                    let createdByConsortiumUser =
                      savedConsortiumPatientAppointment.createdByConsortiumUser;
                    let savedTranscriptionStatusChangeLog =
                      await TranscriptionStatusService.updateTranscriptionStatus(
                        consortiumPatientAppointmentId,
                        transcriptionStatusAssignId,
                        transcriptionStatusNotes,
                        createdBySystemUser,
                        createdByConsortiumUser
                      );

                    // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedTranscriptionStatusChangeLog_'] = savedTranscriptionStatusChangeLog;

                    if (savedTranscriptionStatusChangeLog) {
                      const consTodayStartDt = moment().startOf("day").unix();
                      let defaultActivityStatusId =
                        await ActivityStatusService.findDefaultActivityStatusId();
                      let pendingActivityStatusId =
                        await ActivityStatusService.findActivityStatusIdByCode(
                          AppConfigConst.ACTIVITY_STATUS_PENDING_CODE
                        );

                      let transcriptorRoleIdForMT =
                        await TranscriptorRoleService.findTranscriptorRoleIdByRoleCode(
                          AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT
                        );
                      let transcriptorRoleIdForQA =
                        await TranscriptorRoleService.findTranscriptorRoleIdByRoleCode(
                          AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA
                        );

                      if (mongodb.ObjectId.isValid(mtAssignedTo)) {
                        let systemUserDaywiseWorkAllocationForMT =
                          await SystemUserDaywiseWorkAllocationService.createAndFetchSystemUserDaywiseWorkAllocationBySystemUserId(
                            mtAssignedTo,
                            consTodayStartDt
                          );
                        // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_systemUserDaywiseWorkAllocationForMT_'] = systemUserDaywiseWorkAllocationForMT;

                        if (systemUserDaywiseWorkAllocationForMT) {
                          // let fetchedMtAssignedTo = await SystemUserService.findSystemUserById(mtAssignedTo,false);

                          let systemUserDaywiseWorkAllocationPatientAppointmentForMT =
                            {
                              systemUserDaywiseWorkAllocation:
                                systemUserDaywiseWorkAllocationForMT._id,
                              consortiumPatientAppointment:
                                consortiumPatientAppointmentId,
                              transcriptorRole: transcriptorRoleIdForMT, // MT
                              activityReceivedAt: currTs,
                              activityReceivedFrom: systemUserId,
                              activityPriority: activityPriority,
                              activityStatus: pendingActivityStatusId,
                              activityDurationInSeconds:
                                totalDicationDurationInSeconds,
                            };

                          let savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT =
                            await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                              systemUserDaywiseWorkAllocationPatientAppointmentForMT
                            );
                          if (
                            savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT
                          ) {
                            await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                              mtAssignedTo,
                              consTodayStartDt
                            );

                            let systemUserDaywiseWorkAllocationLog = {
                              consortiumPatientAppointment:
                                consortiumPatientAppointmentId,
                              actionCode:
                                AppConfigConst.TRANSCRIPTION_LOG_ACTION_ASSIGNED,
                              updTranscriptorRole:
                                savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT.transcriptorRole,
                              updTranscriptionAllocationDate:
                                savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT.activityReceivedAt,
                              systemUserDaywiseWorkAllocationPatientAppointment:
                                savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT._id,
                              createdBy: systemUserId,
                            };

                            await SystemUserDaywiseWorkAllocationService.saveSystemUserDaywiseWorkAllocationLog(
                              systemUserDaywiseWorkAllocationLog
                            );
                          }

                          // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT_'] = savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT;
                        }
                      }

                      if (mongodb.ObjectId.isValid(qa1AssignedTo)) {
                        let systemUserDaywiseWorkAllocationForQA1 =
                          await SystemUserDaywiseWorkAllocationService.createAndFetchSystemUserDaywiseWorkAllocationBySystemUserId(
                            qa1AssignedTo,
                            consTodayStartDt
                          );
                        // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_systemUserDaywiseWorkAllocationForQA1_'] = systemUserDaywiseWorkAllocationForQA1;

                        if (systemUserDaywiseWorkAllocationForQA1) {
                          // let fetchedMtQA1AssignedTo = await SystemUserService.findSystemUserById(qa1AssignedTo,false);

                          let systemUserDaywiseWorkAllocationPatientAppointmentForQA1 =
                            {
                              systemUserDaywiseWorkAllocation:
                                systemUserDaywiseWorkAllocationForQA1._id,
                              consortiumPatientAppointment:
                                consortiumPatientAppointmentId,
                              transcriptorRole: transcriptorRoleIdForQA,
                              activityDurationInSeconds:
                                totalDicationDurationInSeconds,
                              activityPriority: activityPriority,
                              activityStatus: defaultActivityStatusId,
                            };

                          let savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA1 =
                            await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                              systemUserDaywiseWorkAllocationPatientAppointmentForQA1
                            );

                          if (
                            savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA1
                          ) {
                            await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                              qa1AssignedTo,
                              consTodayStartDt
                            );
                          }
                          // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA1_'] = savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA1;
                        }
                      }

                      if (mongodb.ObjectId.isValid(qa2AssignedTo)) {
                        let systemUserDaywiseWorkAllocationForQA2 =
                          await SystemUserDaywiseWorkAllocationService.createAndFetchSystemUserDaywiseWorkAllocationBySystemUserId(
                            qa2AssignedTo,
                            consTodayStartDt
                          );
                        // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_systemUserDaywiseWorkAllocationForQA2_'] = systemUserDaywiseWorkAllocationForQA2;

                        if (systemUserDaywiseWorkAllocationForQA2) {
                          // let fetchedMtQA2AssignedTo = await SystemUserService.findSystemUserById(qa2AssignedTo,false);

                          let systemUserDaywiseWorkAllocationPatientAppointmentForQA2 =
                            {
                              systemUserDaywiseWorkAllocation:
                                systemUserDaywiseWorkAllocationForQA2._id,
                              consortiumPatientAppointment:
                                consortiumPatientAppointmentId,
                              transcriptorRole: transcriptorRoleIdForQA,
                              activityDurationInSeconds:
                                totalDicationDurationInSeconds,
                              activityPriority: activityPriority,
                              activityStatus: defaultActivityStatusId,
                            };

                          let savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA2 =
                            await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                              systemUserDaywiseWorkAllocationPatientAppointmentForQA2
                            );

                          if (
                            savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA2
                          ) {
                            await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                              qa2AssignedTo,
                              consTodayStartDt
                            );
                          }
                          // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA2_'] = savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA2;
                        }
                      }

                      if (mongodb.ObjectId.isValid(qa3AssignedTo)) {
                        let systemUserDaywiseWorkAllocationForQA3 =
                          await SystemUserDaywiseWorkAllocationService.createAndFetchSystemUserDaywiseWorkAllocationBySystemUserId(
                            qa3AssignedTo,
                            consTodayStartDt
                          );
                        // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_systemUserDaywiseWorkAllocationForQA3_'] = systemUserDaywiseWorkAllocationForQA3;

                        if (systemUserDaywiseWorkAllocationForQA3) {
                          // let fetchedMtQA3AssignedTo = await SystemUserService.findSystemUserById(qa3AssignedTo,false);

                          let systemUserDaywiseWorkAllocationPatientAppointmentForQA3 =
                            {
                              systemUserDaywiseWorkAllocation:
                                systemUserDaywiseWorkAllocationForQA3._id,
                              consortiumPatientAppointment:
                                consortiumPatientAppointmentId,
                              transcriptorRole: transcriptorRoleIdForQA,
                              activityDurationInSeconds:
                                totalDicationDurationInSeconds,
                              activityPriority: activityPriority,
                              activityStatus: defaultActivityStatusId,
                            };

                          let savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA3 =
                            await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                              systemUserDaywiseWorkAllocationPatientAppointmentForQA3
                            );

                          if (
                            savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA3
                          ) {
                            await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                              qa3AssignedTo,
                              consTodayStartDt
                            );
                          }

                          // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA3_'] = savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA3;
                        }
                      }
                    }
                  }
                } else {
                  var fetchedConsortiumPatientAppointment =
                    await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
                      req,
                      consortiumPatientAppointmentId,
                      false
                    );
                  if (fetchedConsortiumPatientAppointment) {
                    let isDictationUploadCompleted =
                      fetchedConsortiumPatientAppointment.isDictationUploadCompleted;
                    let totalDicationDurationInSeconds =
                      fetchedConsortiumPatientAppointment.totalDicationDurationInSeconds;
                    let activityPriorityId =
                      fetchedConsortiumPatientAppointment.activityPriority;
                    let transcriptionStatusId =
                      fetchedConsortiumPatientAppointment.transcriptionStatus;

                    let fetchedTranscriptionStatus =
                      await TranscriptionStatusService.findTranscriptionStatusById(
                        transcriptionStatusId
                      );
                    let fetchedTranscriptionStatusCode =
                      fetchedTranscriptionStatus.statusCode;
                    // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'fetchedTranscriptionStatus'] = fetchedTranscriptionStatus;

                    if (isDictationUploadCompleted === true) {
                      let mtAssignedToId =
                        fetchedConsortiumPatientAppointment.mtAssignedTo !==
                          null &&
                        fetchedConsortiumPatientAppointment.mtAssignedTo !==
                          undefined
                          ? fetchedConsortiumPatientAppointment.mtAssignedTo
                          : "";
                      let qa1AssignedToId =
                        fetchedConsortiumPatientAppointment.qa1AssignedTo !==
                          null &&
                        fetchedConsortiumPatientAppointment.qa1AssignedTo !==
                          undefined
                          ? fetchedConsortiumPatientAppointment.qa1AssignedTo
                          : "";
                      let qa2AssignedToId =
                        fetchedConsortiumPatientAppointment.qa2AssignedTo !==
                          null &&
                        fetchedConsortiumPatientAppointment.qa2AssignedTo !==
                          undefined
                          ? fetchedConsortiumPatientAppointment.qa2AssignedTo
                          : "";
                      let qa3AssignedToId =
                        fetchedConsortiumPatientAppointment.qa3AssignedTo !==
                          null &&
                        fetchedConsortiumPatientAppointment.qa3AssignedTo !==
                          undefined
                          ? fetchedConsortiumPatientAppointment.qa3AssignedTo
                          : "";

                      const currTs =
                        await AppCommonService.getCurrentTimestamp();

                      let isValidRecord = false;
                      let isMTUpdated = false;
                      let isQA1Updated = false;
                      let isQA2Updated = false;
                      let isQA3Updated = false;

                      let updConsortiumPatientAppointment = {
                        id: consortiumPatientAppointmentId,
                      };

                      let activityReceivedFromQA1;
                      let activityReceivedFromQA2;
                      let activityReceivedFromQA3;

                      // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_mtAssignedTo'] = mtAssignedTo;

                      if (mongodb.ObjectId.isValid(mtAssignedTo)) {
                        if (mtAssignedToId === "") {
                          updConsortiumPatientAppointment.mtAssignedTo =
                            mtAssignedTo;
                          updConsortiumPatientAppointment.mtAssignedAt = currTs;
                          updConsortiumPatientAppointment.mtAssignedBy =
                            systemUserId;
                          isValidRecord = true;
                          isMTUpdated = true;
                        } else {
                          if (mtAssignedTo + "" !== mtAssignedToId + "") {
                            let systemUserDaywiseWorkAllocationPatientAppointmentMT =
                              await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCodeForDeallocation(
                                AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT,
                                consortiumPatientAppointmentId,
                                mtAssignedToId
                              );

                            // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_systemUserDaywiseWorkAllocationPatientAppointmentMT'] = systemUserDaywiseWorkAllocationPatientAppointmentMT;

                            if (
                              systemUserDaywiseWorkAllocationPatientAppointmentMT !==
                                undefined &&
                              systemUserDaywiseWorkAllocationPatientAppointmentMT !==
                                null
                            ) {
                              let fetchedSystemUser =
                                systemUserDaywiseWorkAllocationPatientAppointmentMT
                                  .systemUserDaywiseWorkAllocation.systemUser;
                              let fetchedConsDate =
                                systemUserDaywiseWorkAllocationPatientAppointmentMT
                                  .systemUserDaywiseWorkAllocation.consDate;
                              let transcriptorRole =
                                systemUserDaywiseWorkAllocationPatientAppointmentMT.transcriptorRole;

                              let removedSystemUserDaywiseWorkAllocationPatientAppointmentMT =
                                await SystemUserDaywiseWorkAllocationPatientAppointmentService.removeSystemUserDaywiseWorkAllocationPatientAppointmentById(
                                  systemUserDaywiseWorkAllocationPatientAppointmentMT._id
                                );
                              // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_removedSystemUserDaywiseWorkAllocationPatientAppointmentMT'] = removedSystemUserDaywiseWorkAllocationPatientAppointmentMT;
                              if (
                                removedSystemUserDaywiseWorkAllocationPatientAppointmentMT
                              ) {
                                let systemUserDaywiseWorkAllocationMT =
                                  await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                                    fetchedSystemUser,
                                    fetchedConsDate
                                  );
                                // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_systemUserDaywiseWorkAllocationMT'] = systemUserDaywiseWorkAllocationMT;

                                let systemUserDaywiseWorkAllocationLogMT = {
                                  consortiumPatientAppointment:
                                    consortiumPatientAppointmentId,
                                  actionCode:
                                    AppConfigConst.TRANSCRIPTION_LOG_ACTION_DEASSIGNED,
                                  updTranscriptorRole: transcriptorRole,
                                  createdBy: systemUserId,
                                };

                                let savedSystemUserDaywiseWorkAllocationLogMT =
                                  await SystemUserDaywiseWorkAllocationService.saveSystemUserDaywiseWorkAllocationLog(
                                    systemUserDaywiseWorkAllocationLogMT
                                  );
                                // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedSystemUserDaywiseWorkAllocationLogMT'] = savedSystemUserDaywiseWorkAllocationLogMT;

                                updConsortiumPatientAppointment.mtAssignedTo =
                                  mtAssignedTo;
                                updConsortiumPatientAppointment.mtAssignedAt =
                                  currTs;
                                updConsortiumPatientAppointment.mtAssignedBy =
                                  systemUserId;
                                isValidRecord = true;
                                isMTUpdated = true;
                              }
                            }
                          }
                        }
                      }

                      if (mongodb.ObjectId.isValid(qa1AssignedTo)) {
                        if (qa1AssignedToId === "") {
                          updConsortiumPatientAppointment.qa1AssignedTo =
                            qa1AssignedTo;
                          updConsortiumPatientAppointment.qa1AssignedAt =
                            currTs;
                          updConsortiumPatientAppointment.qa1AssignedBy =
                            systemUserId;
                          isValidRecord = true;
                          isQA1Updated = true;
                        } else {
                          if (qa1AssignedTo + "" !== qa1AssignedToId + "") {
                            let systemUserDaywiseWorkAllocationPatientAppointmentQA1 =
                              await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCodeForDeallocation(
                                AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA,
                                consortiumPatientAppointmentId,
                                qa1AssignedToId
                              );

                            if (
                              systemUserDaywiseWorkAllocationPatientAppointmentQA1 !==
                                undefined &&
                              systemUserDaywiseWorkAllocationPatientAppointmentQA1 !==
                                null
                            ) {
                              let fetchedSystemUser =
                                systemUserDaywiseWorkAllocationPatientAppointmentQA1
                                  .systemUserDaywiseWorkAllocation.systemUser;
                              let fetchedConsDate =
                                systemUserDaywiseWorkAllocationPatientAppointmentQA1
                                  .systemUserDaywiseWorkAllocation.consDate;
                              let transcriptorRole =
                                systemUserDaywiseWorkAllocationPatientAppointmentQA1.transcriptorRole;
                              activityReceivedFromQA1 =
                                systemUserDaywiseWorkAllocationPatientAppointmentQA1.activityReceivedFrom;

                              let removedSystemUserDaywiseWorkAllocationPatientAppointmentQA1 =
                                await SystemUserDaywiseWorkAllocationPatientAppointmentService.removeSystemUserDaywiseWorkAllocationPatientAppointmentById(
                                  systemUserDaywiseWorkAllocationPatientAppointmentQA1._id
                                );
                              // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_removedSystemUserDaywiseWorkAllocationPatientAppointmentQA1'] = removedSystemUserDaywiseWorkAllocationPatientAppointmentQA1;
                              if (
                                removedSystemUserDaywiseWorkAllocationPatientAppointmentQA1
                              ) {
                                let systemUserDaywiseWorkAllocationQA1 =
                                  await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                                    fetchedSystemUser,
                                    fetchedConsDate
                                  );
                                // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_systemUserDaywiseWorkAllocationQA1'] = systemUserDaywiseWorkAllocationQA1;

                                let systemUserDaywiseWorkAllocationLog = {
                                  consortiumPatientAppointment:
                                    consortiumPatientAppointmentId,
                                  actionCode:
                                    AppConfigConst.TRANSCRIPTION_LOG_ACTION_DEASSIGNED,
                                  updTranscriptorRole: transcriptorRole,
                                  createdBy: systemUserId,
                                };

                                let savedSystemUserDaywiseWorkAllocationLogQA1 =
                                  await SystemUserDaywiseWorkAllocationService.saveSystemUserDaywiseWorkAllocationLog(
                                    systemUserDaywiseWorkAllocationLog
                                  );
                                // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedSystemUserDaywiseWorkAllocationLogQA1'] = savedSystemUserDaywiseWorkAllocationLogQA1;

                                updConsortiumPatientAppointment.qa1AssignedTo =
                                  qa1AssignedTo;
                                updConsortiumPatientAppointment.qa1AssignedAt =
                                  currTs;
                                updConsortiumPatientAppointment.qa1AssignedBy =
                                  systemUserId;
                                isValidRecord = true;
                                isQA1Updated = true;
                              }
                            }
                          }
                        }
                      }

                      if (mongodb.ObjectId.isValid(qa2AssignedTo)) {
                        if (qa2AssignedToId === "") {
                          updConsortiumPatientAppointment.qa2AssignedTo =
                            qa2AssignedTo;
                          updConsortiumPatientAppointment.qa2AssignedAt =
                            currTs;
                          updConsortiumPatientAppointment.qa2AssignedBy =
                            systemUserId;
                          isValidRecord = true;
                          isQA2Updated = true;
                        } else {
                          if (qa2AssignedTo + "" !== qa2AssignedToId + "") {
                            let systemUserDaywiseWorkAllocationPatientAppointmentQA2 =
                              await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCodeForDeallocation(
                                AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA,
                                consortiumPatientAppointmentId,
                                qa2AssignedToId
                              );
                            if (
                              systemUserDaywiseWorkAllocationPatientAppointmentQA2 !==
                                undefined &&
                              systemUserDaywiseWorkAllocationPatientAppointmentQA2 !==
                                null
                            ) {
                              let fetchedSystemUser =
                                systemUserDaywiseWorkAllocationPatientAppointmentQA2
                                  .systemUserDaywiseWorkAllocation.systemUser;
                              let fetchedConsDate =
                                systemUserDaywiseWorkAllocationPatientAppointmentQA2
                                  .systemUserDaywiseWorkAllocation.consDate;
                              let transcriptorRole =
                                systemUserDaywiseWorkAllocationPatientAppointmentQA2.transcriptorRole;
                              activityReceivedFromQA2 =
                                systemUserDaywiseWorkAllocationPatientAppointmentQA2.activityReceivedFrom;

                              let removedSystemUserDaywiseWorkAllocationPatientAppointment =
                                await SystemUserDaywiseWorkAllocationPatientAppointmentService.removeSystemUserDaywiseWorkAllocationPatientAppointmentById(
                                  systemUserDaywiseWorkAllocationPatientAppointmentQA2._id
                                );
                              // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_removedSystemUserDaywiseWorkAllocationPatientAppointment'] = removedSystemUserDaywiseWorkAllocationPatientAppointment;
                              if (
                                removedSystemUserDaywiseWorkAllocationPatientAppointment
                              ) {
                                let systemUserDaywiseWorkAllocation =
                                  await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                                    fetchedSystemUser,
                                    fetchedConsDate
                                  );
                                // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_systemUserDaywiseWorkAllocation'] = systemUserDaywiseWorkAllocation;

                                let systemUserDaywiseWorkAllocationLog = {
                                  consortiumPatientAppointment:
                                    consortiumPatientAppointmentId,
                                  actionCode:
                                    AppConfigConst.TRANSCRIPTION_LOG_ACTION_DEASSIGNED,
                                  updTranscriptorRole: transcriptorRole,
                                  createdBy: systemUserId,
                                };

                                let savedSystemUserDaywiseWorkAllocationLog =
                                  await SystemUserDaywiseWorkAllocationService.saveSystemUserDaywiseWorkAllocationLog(
                                    systemUserDaywiseWorkAllocationLog
                                  );
                                // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedSystemUserDaywiseWorkAllocationLog'] = savedSystemUserDaywiseWorkAllocationLog;

                                updConsortiumPatientAppointment.qa2AssignedTo =
                                  qa2AssignedTo;
                                updConsortiumPatientAppointment.qa2AssignedAt =
                                  currTs;
                                updConsortiumPatientAppointment.qa2AssignedBy =
                                  systemUserId;
                                isValidRecord = true;
                                isQA2Updated = true;
                              }
                            }
                          }
                        }
                      }

                      if (mongodb.ObjectId.isValid(qa3AssignedTo)) {
                        if (qa3AssignedToId === "") {
                          updConsortiumPatientAppointment.qa3AssignedTo =
                            qa3AssignedTo;
                          updConsortiumPatientAppointment.qa3AssignedAt =
                            currTs;
                          updConsortiumPatientAppointment.qa3AssignedBy =
                            systemUserId;
                          isValidRecord = true;
                          isQA3Updated = true;
                        } else {
                          if (qa3AssignedTo + "" !== qa3AssignedToId + "") {
                            let systemUserDaywiseWorkAllocationPatientAppointmentQA3 =
                              await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCodeForDeallocation(
                                AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA,
                                consortiumPatientAppointmentId,
                                qa3AssignedToId
                              );
                            if (
                              systemUserDaywiseWorkAllocationPatientAppointmentQA3 !==
                                undefined &&
                              systemUserDaywiseWorkAllocationPatientAppointmentQA3 !==
                                null
                            ) {
                              let fetchedSystemUser =
                                systemUserDaywiseWorkAllocationPatientAppointmentQA3
                                  .systemUserDaywiseWorkAllocation.systemUser;
                              let fetchedConsDate =
                                systemUserDaywiseWorkAllocationPatientAppointmentQA3
                                  .systemUserDaywiseWorkAllocation.consDate;
                              let transcriptorRole =
                                systemUserDaywiseWorkAllocationPatientAppointmentQA3.transcriptorRole;
                              activityReceivedFromQA3 =
                                systemUserDaywiseWorkAllocationPatientAppointmentQA3.activityReceivedFrom;

                              let removedSystemUserDaywiseWorkAllocationPatientAppointment =
                                await SystemUserDaywiseWorkAllocationPatientAppointmentService.removeSystemUserDaywiseWorkAllocationPatientAppointmentById(
                                  systemUserDaywiseWorkAllocationPatientAppointmentQA3._id
                                );
                              // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_removedSystemUserDaywiseWorkAllocationPatientAppointment'] = removedSystemUserDaywiseWorkAllocationPatientAppointment;
                              if (
                                removedSystemUserDaywiseWorkAllocationPatientAppointment
                              ) {
                                let systemUserDaywiseWorkAllocation =
                                  await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                                    fetchedSystemUser,
                                    fetchedConsDate
                                  );
                                // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_systemUserDaywiseWorkAllocation'] = systemUserDaywiseWorkAllocation;

                                let systemUserDaywiseWorkAllocationLog = {
                                  consortiumPatientAppointment:
                                    consortiumPatientAppointmentId,
                                  actionCode:
                                    AppConfigConst.TRANSCRIPTION_LOG_ACTION_DEASSIGNED,
                                  updTranscriptorRole: transcriptorRole,
                                  createdBy: systemUserId,
                                };

                                let savedSystemUserDaywiseWorkAllocationLog =
                                  await SystemUserDaywiseWorkAllocationService.saveSystemUserDaywiseWorkAllocationLog(
                                    systemUserDaywiseWorkAllocationLog
                                  );
                                // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedSystemUserDaywiseWorkAllocationLog'] = savedSystemUserDaywiseWorkAllocationLog;

                                updConsortiumPatientAppointment.qa3AssignedTo =
                                  qa3AssignedTo;
                                updConsortiumPatientAppointment.qa3AssignedAt =
                                  currTs;
                                updConsortiumPatientAppointment.qa3AssignedBy =
                                  systemUserId;
                                isValidRecord = true;
                                isQA3Updated = true;
                              }
                            }
                          }
                        }
                      }

                      // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_isValidRecord_'] = isValidRecord;
                      if (isValidRecord === true) {
                        // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_updConsortiumPatientAppointment_'] = updConsortiumPatientAppointment;

                        let savedConsortiumPatientAppointment =
                          await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
                            updConsortiumPatientAppointment
                          );

                        // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedConsortiumPatientAppointment_'] = savedConsortiumPatientAppointment;

                        if (savedConsortiumPatientAppointment) {
                          let updTranscriptionStatusAssignId;
                          const consTodayStartDt = moment()
                            .startOf("day")
                            .unix();
                          let defaultActivityStatusId =
                            await ActivityStatusService.findDefaultActivityStatusId();
                          let pendingActivityStatusId =
                            await ActivityStatusService.findActivityStatusIdByCode(
                              AppConfigConst.ACTIVITY_STATUS_PENDING_CODE
                            );

                          let transcriptorRoleIdForMT =
                            await TranscriptorRoleService.findTranscriptorRoleIdByRoleCode(
                              AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT
                            );
                          let transcriptorRoleIdForQA =
                            await TranscriptorRoleService.findTranscriptorRoleIdByRoleCode(
                              AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA
                            );

                          let assignedToNextStakeholder = false;

                          if (isMTUpdated === true) {
                            if (mongodb.ObjectId.isValid(mtAssignedTo)) {
                              let systemUserDaywiseWorkAllocationForMT =
                                await SystemUserDaywiseWorkAllocationService.createAndFetchSystemUserDaywiseWorkAllocationBySystemUserId(
                                  mtAssignedTo,
                                  consTodayStartDt
                                );

                              // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_systemUserDaywiseWorkAllocationForMT_'] = systemUserDaywiseWorkAllocationForMT;

                              if (systemUserDaywiseWorkAllocationForMT) {
                                // let fetchedMtAssignedTo = await SystemUserService.findSystemUserById(mtAssignedTo,false);

                                let systemUserDaywiseWorkAllocationPatientAppointmentForMT =
                                  {
                                    systemUserDaywiseWorkAllocation:
                                      systemUserDaywiseWorkAllocationForMT._id,
                                    consortiumPatientAppointment:
                                      consortiumPatientAppointmentId,
                                    transcriptorRole: transcriptorRoleIdForMT,
                                    activityReceivedAt: currTs,
                                    activityReceivedFrom: systemUserId,
                                    activityPriority: activityPriorityId,
                                    activityStatus: pendingActivityStatusId,
                                    activityDurationInSeconds:
                                      totalDicationDurationInSeconds,
                                  };

                                let savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT =
                                  await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                                    systemUserDaywiseWorkAllocationPatientAppointmentForMT
                                  );
                                if (
                                  savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT
                                ) {
                                  await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                                    mtAssignedTo,
                                    consTodayStartDt
                                  );

                                  let systemUserDaywiseWorkAllocationLog = {
                                    consortiumPatientAppointment:
                                      consortiumPatientAppointmentId,
                                    actionCode:
                                      AppConfigConst.TRANSCRIPTION_LOG_ACTION_ASSIGNED,
                                    updTranscriptorRole:
                                      savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT.transcriptorRole,
                                    updTranscriptionAllocationDate:
                                      savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT.activityReceivedAt,
                                    systemUserDaywiseWorkAllocationPatientAppointment:
                                      savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT._id,
                                    createdBy: systemUserId,
                                  };

                                  await SystemUserDaywiseWorkAllocationService.saveSystemUserDaywiseWorkAllocationLog(
                                    systemUserDaywiseWorkAllocationLog
                                  );
                                }

                                // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT_'] = savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT;
                              }
                            }
                          }

                          if (isQA1Updated === true) {
                            if (mongodb.ObjectId.isValid(qa1AssignedTo)) {
                              let systemUserDaywiseWorkAllocationForQA1 =
                                await SystemUserDaywiseWorkAllocationService.createAndFetchSystemUserDaywiseWorkAllocationBySystemUserId(
                                  qa1AssignedTo,
                                  consTodayStartDt
                                );

                              // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_systemUserDaywiseWorkAllocationForQA1_'] = systemUserDaywiseWorkAllocationForQA1;

                              if (systemUserDaywiseWorkAllocationForQA1) {
                                if (
                                  activityReceivedFromQA1 === undefined &&
                                  fetchedTranscriptionStatusCode ===
                                    AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED
                                ) {
                                  if (
                                    mongodb.ObjectId.isValid(mtAssignedToId)
                                  ) {
                                    let completedSystemUserDaywiseWorkAllocationPatientAppointmentMT =
                                      await SystemUserDaywiseWorkAllocationPatientAppointmentService.findCompletedSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                                        AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT,
                                        consortiumPatientAppointmentId,
                                        mtAssignedToId
                                      );
                                    if (
                                      completedSystemUserDaywiseWorkAllocationPatientAppointmentMT
                                    ) {
                                      activityReceivedFromQA1 = mtAssignedToId;
                                      updTranscriptionStatusAssignId =
                                        await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                                          AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA1_ASSIGNED
                                        );
                                      assignedToNextStakeholder = true;
                                    }
                                  }
                                }

                                // let fetchedMtQA1AssignedTo = await SystemUserService.findSystemUserById(qa1AssignedTo,false);

                                let systemUserDaywiseWorkAllocationPatientAppointmentForQA1 =
                                  {
                                    systemUserDaywiseWorkAllocation:
                                      systemUserDaywiseWorkAllocationForQA1._id,
                                    consortiumPatientAppointment:
                                      consortiumPatientAppointmentId,
                                    transcriptorRole: transcriptorRoleIdForQA,
                                    activityDurationInSeconds:
                                      totalDicationDurationInSeconds,
                                    activityPriority: activityPriorityId,
                                    activityStatus: defaultActivityStatusId,
                                    activityReceivedAt: currTs,
                                    activityReceivedFrom:
                                      activityReceivedFromQA1,
                                  };

                                let savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA1 =
                                  await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                                    systemUserDaywiseWorkAllocationPatientAppointmentForQA1
                                  );

                                if (
                                  savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA1
                                ) {
                                  await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                                    qa1AssignedTo,
                                    consTodayStartDt
                                  );
                                }

                                // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA1_'] = savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA1;
                              }
                            }
                          }

                          if (isQA2Updated === true) {
                            if (mongodb.ObjectId.isValid(qa2AssignedTo)) {
                              let systemUserDaywiseWorkAllocationForQA2 =
                                await SystemUserDaywiseWorkAllocationService.createAndFetchSystemUserDaywiseWorkAllocationBySystemUserId(
                                  qa2AssignedTo,
                                  consTodayStartDt
                                );

                              // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_systemUserDaywiseWorkAllocationForQA2_'] = systemUserDaywiseWorkAllocationForQA2;

                              if (systemUserDaywiseWorkAllocationForQA2) {
                                if (
                                  activityReceivedFromQA2 === undefined &&
                                  assignedToNextStakeholder === false
                                ) {
                                  if (
                                    fetchedTranscriptionStatusCode ===
                                    AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED
                                  ) {
                                    if (
                                      mongodb.ObjectId.isValid(mtAssignedToId)
                                    ) {
                                      let completedSystemUserDaywiseWorkAllocationPatientAppointmentMT =
                                        await SystemUserDaywiseWorkAllocationPatientAppointmentService.findCompletedSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                                          AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT,
                                          consortiumPatientAppointmentId,
                                          mtAssignedToId
                                        );
                                      if (
                                        completedSystemUserDaywiseWorkAllocationPatientAppointmentMT
                                      ) {
                                        activityReceivedFromQA2 =
                                          mtAssignedToId;

                                        updTranscriptionStatusAssignId =
                                          await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                                            AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA2_ASSIGNED
                                          );
                                        assignedToNextStakeholder = true;
                                      }
                                    }
                                  } else if (
                                    fetchedTranscriptionStatusCode ===
                                    AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA1_ASSIGNED
                                  ) {
                                    if (
                                      mongodb.ObjectId.isValid(qa1AssignedToId)
                                    ) {
                                      let completedSystemUserDaywiseWorkAllocationPatientAppointmentQA1 =
                                        await SystemUserDaywiseWorkAllocationPatientAppointmentService.findCompletedSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                                          AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA,
                                          consortiumPatientAppointmentId,
                                          qa1AssignedToId
                                        );
                                      if (
                                        completedSystemUserDaywiseWorkAllocationPatientAppointmentQA1
                                      ) {
                                        activityReceivedFromQA2 =
                                          qa1AssignedToId;

                                        updTranscriptionStatusAssignId =
                                          await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                                            AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA2_ASSIGNED
                                          );
                                        assignedToNextStakeholder = true;
                                      }
                                    }
                                  }
                                }

                                // let fetchedMtQA2AssignedTo = await SystemUserService.findSystemUserById(qa2AssignedTo,false);

                                let systemUserDaywiseWorkAllocationPatientAppointmentForQA2 =
                                  {
                                    systemUserDaywiseWorkAllocation:
                                      systemUserDaywiseWorkAllocationForQA2._id,
                                    consortiumPatientAppointment:
                                      consortiumPatientAppointmentId,
                                    transcriptorRole: transcriptorRoleIdForQA,
                                    activityDurationInSeconds:
                                      totalDicationDurationInSeconds,
                                    activityPriority: activityPriorityId,
                                    activityStatus: defaultActivityStatusId,
                                    activityReceivedAt: currTs,
                                    activityReceivedFrom:
                                      activityReceivedFromQA2,
                                  };

                                let savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA2 =
                                  await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                                    systemUserDaywiseWorkAllocationPatientAppointmentForQA2
                                  );

                                if (
                                  savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA2
                                ) {
                                  await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                                    qa2AssignedTo,
                                    consTodayStartDt
                                  );
                                }
                                // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA2_'] = savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA2;
                              }
                            }
                          }

                          if (isQA3Updated === true) {
                            if (mongodb.ObjectId.isValid(qa3AssignedTo)) {
                              let systemUserDaywiseWorkAllocationForQA3 =
                                await SystemUserDaywiseWorkAllocationService.createAndFetchSystemUserDaywiseWorkAllocationBySystemUserId(
                                  qa3AssignedTo,
                                  consTodayStartDt
                                );

                              // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_systemUserDaywiseWorkAllocationForQA3_'] = systemUserDaywiseWorkAllocationForQA3;

                              if (systemUserDaywiseWorkAllocationForQA3) {
                                if (
                                  activityReceivedFromQA3 === undefined &&
                                  assignedToNextStakeholder === false
                                ) {
                                  if (
                                    fetchedTranscriptionStatusCode ===
                                    AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED
                                  ) {
                                    if (
                                      mongodb.ObjectId.isValid(mtAssignedToId)
                                    ) {
                                      let completedSystemUserDaywiseWorkAllocationPatientAppointmentMT =
                                        await SystemUserDaywiseWorkAllocationPatientAppointmentService.findCompletedSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                                          AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT,
                                          consortiumPatientAppointmentId,
                                          mtAssignedToId
                                        );
                                      if (
                                        completedSystemUserDaywiseWorkAllocationPatientAppointmentMT
                                      ) {
                                        activityReceivedFromQA3 =
                                          mtAssignedToId;

                                        updTranscriptionStatusAssignId =
                                          await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                                            AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA3_ASSIGNED
                                          );
                                        assignedToNextStakeholder = true;
                                      }
                                    }
                                  } else if (
                                    fetchedTranscriptionStatusCode ===
                                    AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA1_ASSIGNED
                                  ) {
                                    if (
                                      mongodb.ObjectId.isValid(qa1AssignedToId)
                                    ) {
                                      let completedSystemUserDaywiseWorkAllocationPatientAppointmentQA1 =
                                        await SystemUserDaywiseWorkAllocationPatientAppointmentService.findCompletedSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                                          AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA,
                                          consortiumPatientAppointmentId,
                                          qa1AssignedToId
                                        );
                                      if (
                                        completedSystemUserDaywiseWorkAllocationPatientAppointmentQA1
                                      ) {
                                        activityReceivedFromQA3 =
                                          qa1AssignedToId;
                                        updTranscriptionStatusAssignId =
                                          await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                                            AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA3_ASSIGNED
                                          );
                                        assignedToNextStakeholder = true;
                                      }
                                    }
                                  } else if (
                                    fetchedTranscriptionStatusCode ===
                                    AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA2_ASSIGNED
                                  ) {
                                    if (
                                      mongodb.ObjectId.isValid(qa2AssignedToId)
                                    ) {
                                      let completedSystemUserDaywiseWorkAllocationPatientAppointmentQA2 =
                                        await SystemUserDaywiseWorkAllocationPatientAppointmentService.findCompletedSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                                          AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA,
                                          consortiumPatientAppointmentId,
                                          qa2AssignedToId
                                        );
                                      if (
                                        completedSystemUserDaywiseWorkAllocationPatientAppointmentQA2
                                      ) {
                                        activityReceivedFromQA3 =
                                          qa2AssignedToId;
                                        updTranscriptionStatusAssignId =
                                          await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                                            AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA3_ASSIGNED
                                          );
                                        assignedToNextStakeholder = true;
                                      }
                                    }
                                  }
                                }

                                // let fetchedMtQA3AssignedTo = await SystemUserService.findSystemUserById(qa3AssignedTo,false);

                                let systemUserDaywiseWorkAllocationPatientAppointmentForQA3 =
                                  {
                                    systemUserDaywiseWorkAllocation:
                                      systemUserDaywiseWorkAllocationForQA3._id,
                                    consortiumPatientAppointment:
                                      consortiumPatientAppointmentId,
                                    transcriptorRole: transcriptorRoleIdForQA,
                                    activityDurationInSeconds:
                                      totalDicationDurationInSeconds,
                                    activityPriority: activityPriorityId,
                                    activityStatus: defaultActivityStatusId,
                                    activityReceivedAt: currTs,
                                    activityReceivedFrom:
                                      activityReceivedFromQA3,
                                  };

                                let savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA3 =
                                  await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                                    systemUserDaywiseWorkAllocationPatientAppointmentForQA3
                                  );

                                if (
                                  savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA3
                                ) {
                                  await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                                    qa3AssignedTo,
                                    consTodayStartDt
                                  );
                                }

                                // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA3_'] = savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA3;
                              }
                            }
                          }

                          // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_updTranscriptionStatusAssignId_'] = updTranscriptionStatusAssignId;

                          if (
                            mongodb.ObjectId.isValid(
                              updTranscriptionStatusAssignId
                            )
                          ) {
                            let savedTranscriptionStatusChangeLog =
                              await TranscriptionStatusService.updateTranscriptionStatus(
                                consortiumPatientAppointmentId,
                                updTranscriptionStatusAssignId,
                                transcriptionStatusNotes,
                                systemUserId
                              );

                            // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedTranscriptionStatusChangeLog_'] = savedTranscriptionStatusChangeLog;
                          }
                        }
                      }
                    }
                  }
                }
              }
            )
          );
          resStatus = 1;
        } catch (e) {
          resStatus = -1;
          resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
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

exports.assignRolesToConsortiumPatientAppointment = async function (
  req,
  res,
  next
) {
  console.log("req.body", req.body);
  var consortiumPatientAppointmentIdArr =
    req.body.consortiumPatientAppointmentIdArr;
  var roles = {
    coderId: req.body.assignCoder,
    coderQAId: req.body.AssignQAcoder,
    billerId: req.body.BillerAssign,
    billerQAId: req.body.BillerQAassign,
  };

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 200; // HTTP status code for OK
  var responseObj = {};

  try {
    console.log("Fetching system user from request...");
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    console.log("System user:", systemUser);
    if (!systemUser) {
      throw new Error(AppConfigNotif.INVALID_USER);
    }

    console.log("Checking user rights...");
    var hasRights = await AppCommonService.checkSystemUserHasModuleRights(
      systemUser,
      thisModule,
      AppConfigModule.RIGHT_EDIT
    );
    console.log("User has rights:", hasRights);

    if (!hasRights) {
      throw new Error(AppConfigNotif.ACTION_PERMISSION_DENIED);
    }

    console.log("Validating consortiumPatientAppointmentIdArr...");
    if (
      !Array.isArray(consortiumPatientAppointmentIdArr) ||
      consortiumPatientAppointmentIdArr.length === 0
    ) {
      throw new Error(AppConfigNotif.INVALID_DATA);
    }

    console.log("Iterating over appointment IDs...");
    await Promise.all(
      consortiumPatientAppointmentIdArr.map(async (appointmentId) => {
        var fetchedAppointment =
          await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
            req,
            appointmentId,
            true
          );
        if (!fetchedAppointment) {
          console.error(`Appointment ID ${appointmentId} not found`);
          throw new Error(`Appointment ID ${appointmentId} not found`);
        }

        console.log(
          `Fetched appointment for ID ${appointmentId}:`,
          fetchedAppointment
        );

        // Assign roles
        var updateResult =
          await ConsortiumPatientAppointmentService.assignRolesToAppointment(
            appointmentId,
            roles
          );
        if (!updateResult) {
          console.error(
            `Failed to assign roles for Appointment ID ${appointmentId}`
          );
          throw new Error(
            `Failed to assign roles for Appointment ID ${appointmentId}`
          );
        }

        console.log(
          `Roles assigned successfully for Appointment ID ${appointmentId}:`,
          updateResult
        );
      })
    );

    resStatus = 1; // Success
    resMsg = "Roles assigned successfully to the appointments";
  } catch (error) {
    console.error("Error occurred:", error);
    httpStatus = 500; // HTTP status code for Internal Server Error
    resStatus = -1;
    resMsg = "Error assigning roles to appointments: " + error.message;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  console.log("Response object 5:", responseObj);
  return res.status(httpStatus).json(responseObj);
};

exports.changeConsortiumPatientAppointmentListActivityPriority =
  async function (req, res, next) {
    var consortiumPatientAppointmentIdArr =
      req.body.consortiumPatientAppointmentIdArr;
    var activityPriorityId = req.body.activityPriority;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
    } else if (
      consortiumPatientAppointmentIdArr &&
      consortiumPatientAppointmentIdArr != undefined &&
      consortiumPatientAppointmentIdArr.length > 0 &&
      activityPriorityId !== undefined &&
      activityPriorityId !== ""
    ) {
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

          await Promise.all(
            consortiumPatientAppointmentIdArr.map(
              async (
                consortiumPatientAppointmentId,
                patientAppointmentIndex
              ) => {
                var fetchedConsortiumPatientAppointment =
                  await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
                    req,
                    consortiumPatientAppointmentId,
                    false
                  );
                if (fetchedConsortiumPatientAppointment) {
                  let updConsortiumPatientAppointment = {
                    id: consortiumPatientAppointmentId,
                    activityPriority: activityPriorityId,
                    updatedBySystemUser: systemUserId,
                  };

                  // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_updConsortiumPatientAppointment_'] = updConsortiumPatientAppointment;

                  let savedConsortiumPatientAppointment =
                    await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
                      updConsortiumPatientAppointment
                    );

                  // responseObj['patientAppointmentIndex_'+patientAppointmentIndex+'_savedConsortiumPatientAppointment_'] = savedConsortiumPatientAppointment;

                  if (savedConsortiumPatientAppointment) {
                    let isDictationUploadCompleted =
                      fetchedConsortiumPatientAppointment.isDictationUploadCompleted;

                    if (isDictationUploadCompleted === true) {
                      let mtAssignedToId =
                        fetchedConsortiumPatientAppointment.mtAssignedTo !==
                          null &&
                        fetchedConsortiumPatientAppointment.mtAssignedTo !==
                          undefined
                          ? fetchedConsortiumPatientAppointment.mtAssignedTo
                          : "";
                      let qa1AssignedToId =
                        fetchedConsortiumPatientAppointment.qa1AssignedTo !==
                          null &&
                        fetchedConsortiumPatientAppointment.qa1AssignedTo !==
                          undefined
                          ? fetchedConsortiumPatientAppointment.qa1AssignedTo
                          : "";
                      let qa2AssignedToId =
                        fetchedConsortiumPatientAppointment.qa2AssignedTo !==
                          null &&
                        fetchedConsortiumPatientAppointment.qa2AssignedTo !==
                          undefined
                          ? fetchedConsortiumPatientAppointment.qa2AssignedTo
                          : "";
                      let qa3AssignedToId =
                        fetchedConsortiumPatientAppointment.qa3AssignedTo !==
                          null &&
                        fetchedConsortiumPatientAppointment.qa3AssignedTo !==
                          undefined
                          ? fetchedConsortiumPatientAppointment.qa3AssignedTo
                          : "";

                      if (mongodb.ObjectId.isValid(mtAssignedToId)) {
                        let systemUserDaywiseWorkAllocationPatientAppointmentMT =
                          await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                            AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT,
                            consortiumPatientAppointmentId,
                            mtAssignedToId
                          );
                        if (
                          systemUserDaywiseWorkAllocationPatientAppointmentMT
                        ) {
                          let systemUserDaywiseWorkAllocationPatientAppointmentForMT =
                            {
                              id: systemUserDaywiseWorkAllocationPatientAppointmentMT._id,
                              activityPriority: activityPriorityId,
                            };

                          let savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT =
                            await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                              systemUserDaywiseWorkAllocationPatientAppointmentForMT
                            );
                        }
                      }

                      if (mongodb.ObjectId.isValid(qa1AssignedToId)) {
                        let systemUserDaywiseWorkAllocationPatientAppointmentQA1 =
                          await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                            AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA,
                            consortiumPatientAppointmentId,
                            qa1AssignedToId
                          );
                        if (
                          systemUserDaywiseWorkAllocationPatientAppointmentQA1
                        ) {
                          let systemUserDaywiseWorkAllocationPatientAppointmentForQA1 =
                            {
                              id: systemUserDaywiseWorkAllocationPatientAppointmentQA1._id,
                              activityPriority: activityPriorityId,
                            };

                          let savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA1 =
                            await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                              systemUserDaywiseWorkAllocationPatientAppointmentForQA1
                            );
                        }
                      }

                      if (mongodb.ObjectId.isValid(qa2AssignedToId)) {
                        let systemUserDaywiseWorkAllocationPatientAppointmentQA2 =
                          await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                            AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA,
                            consortiumPatientAppointmentId,
                            qa2AssignedToId
                          );
                        if (
                          systemUserDaywiseWorkAllocationPatientAppointmentQA2
                        ) {
                          let systemUserDaywiseWorkAllocationPatientAppointmentForQA2 =
                            {
                              id: systemUserDaywiseWorkAllocationPatientAppointmentQA2._id,
                              activityPriority: activityPriorityId,
                            };

                          let savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA2 =
                            await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                              systemUserDaywiseWorkAllocationPatientAppointmentForQA2
                            );
                        }
                      }

                      if (mongodb.ObjectId.isValid(qa3AssignedToId)) {
                        let systemUserDaywiseWorkAllocationPatientAppointmentQA3 =
                          await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                            AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA,
                            consortiumPatientAppointmentId,
                            qa3AssignedToId
                          );
                        if (
                          systemUserDaywiseWorkAllocationPatientAppointmentQA3
                        ) {
                          let systemUserDaywiseWorkAllocationPatientAppointmentForQA3 =
                            {
                              id: systemUserDaywiseWorkAllocationPatientAppointmentQA3._id,
                              activityPriority: activityPriorityId,
                            };

                          let savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA3 =
                            await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                              systemUserDaywiseWorkAllocationPatientAppointmentForQA3
                            );
                        }
                      }
                    }
                  }
                }
              }
            )
          );

          resStatus = 1;
        } catch (e) {
          resStatus = -1;
          resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
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

exports.getSystemUserAssignedWorkPoolList = async function (req, res, next) {
  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else {
    await AppCommonService.setSystemUserAppAccessed(req);

    var fetchedConsortiumPatientAppointment =
      await ConsortiumPatientAppointmentService.getConsortiumPatientAppointmentForSystemUserAssignedWorkPoolList(
        req
      );

    resStatus = 1;
    responseObj.consortiumPatientAppointmentList =
      fetchedConsortiumPatientAppointment;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.getSystemUserAssignedWorkPoolListForCompletedTask = async function (
  req,
  res,
  next
) {
  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else {
    await AppCommonService.setSystemUserAppAccessed(req);

    var fetchedConsortiumPatientAppointment =
      await ConsortiumPatientAppointmentService.getConsortiumPatientAppointmentForSystemUserAssignedWorkPoolTranscriptionCompletedList(
        req
      );

    resStatus = 1;
    responseObj.consortiumPatientAppointmentList =
      fetchedConsortiumPatientAppointment;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.getSystemUserWorkPoolList = async function (req, res, next) {
  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else {
    await AppCommonService.setSystemUserAppAccessed(req);

    var fetchedConsortiumPatientAppointmentData =
      await SystemUserDaywiseWorkAllocationPatientAppointmentService.getWorkPoolList(
        req
      );
    if (fetchedConsortiumPatientAppointmentData) {
      resStatus = 1;
      responseObj.consortiumPatientAppointmentList =
        fetchedConsortiumPatientAppointmentData.results;
      responseObj.totalActivityDuration =
        fetchedConsortiumPatientAppointmentData.totalActivityDuration;
      responseObj.totalAppointmentCount =
        fetchedConsortiumPatientAppointmentData.totalAppointmentCount;
    }
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.validateWorkTimeForUserTaskAssignment = async function (
  req,
  res,
  next
) {
  var consortiumPatientAppointmentIdArr =
    req.body.consortiumPatientAppointmentIdArr;
  var systemUserIdReq = req.body.systemUserId;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    systemUserIdReq &&
    systemUserIdReq !== "" &&
    consortiumPatientAppointmentIdArr &&
    consortiumPatientAppointmentIdArr != undefined &&
    consortiumPatientAppointmentIdArr.length > 0
  ) {
    await AppCommonService.setSystemUserAppAccessed(req);

    var consortiumPatientAppointmentTotalDicationDurationInMinutes =
      await ConsortiumPatientAppointmentService.getDicationDurationFromConsortiumPatientAppointmentIdArr(
        consortiumPatientAppointmentIdArr
      );
    var assignedPatientAppointmentTotalDicationDurationInMinutes =
      await ConsortiumPatientAppointmentService.getConsortiumPatientAppointmentTotalDicationDuration(
        req
      );

    let systemUserAudioMinutes = 0;
    let systemUserName = "";
    let fetchedSystemUser = await SystemUserService.findSystemUserById(
      systemUserIdReq,
      false
    );
    if (fetchedSystemUser) {
      systemUserAudioMinutes = fetchedSystemUser.audioMinutes;
      systemUserName = fetchedSystemUser.userFullName;
    }

    let performDurationOverride = true;
    if (systemUserAudioMinutes > 0) {
      let spareTime =
        systemUserAudioMinutes -
        assignedPatientAppointmentTotalDicationDurationInMinutes;

      if (
        spareTime >= consortiumPatientAppointmentTotalDicationDurationInMinutes
      ) {
        performDurationOverride = false;
      } else {
        resMsg =
          "Dictation will exceed " +
          systemUserName +
          " capacity. Do you want to assign the file?";
      }
    } else {
      resMsg =
        "Working hours not assigned to " +
        systemUserName +
        ",are you sure you want to assign this user?";
    }

    responseObj.performDurationOverride = performDurationOverride;
    resStatus = 1;
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.preloadConsortiumPatientAppointmentForStartAndStopActivity =
  async function (req, res, next) {
    console.log(
      "Function preloadConsortiumPatientAppointmentForStartAndStopActivity called"
    );

    var consortiumPatientAppointmentId = req.body.consortiumPatientAppointment;
    console.log(
      "consortiumPatientAppointmentId:",
      consortiumPatientAppointmentId
    );

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
    console.log("systemUser:", systemUser);
    console.log("systemUserId:", systemUserId);

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
      console.log("Invalid user");
    } else if (
      consortiumPatientAppointmentId &&
      consortiumPatientAppointmentId != undefined &&
      consortiumPatientAppointmentId !== ""
    ) {
      await AppCommonService.setSystemUserAppAccessed(req);
      console.log("System user app accessed");

      await AppUploadService.checkAndGenerateModuleExpiredSignedFileUrl(
        AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT,
        consortiumPatientAppointmentId
      );
      await AppUploadService.checkAndGenerateSecondaryModuleExpiredSignedFileUrl(
        AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT,
        consortiumPatientAppointmentId
      );
      await AppUploadService.checkAndGenerateSecondaryModuleExpiredSignedFileUrl(
        AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT,
        consortiumPatientAppointmentId
      );

      var fetchedConsortiumPatientAppointment =
        await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
          req,
          consortiumPatientAppointmentId
        );
      console.log(
        "fetchedConsortiumPatientAppointment:",
        fetchedConsortiumPatientAppointment
      );

      if (fetchedConsortiumPatientAppointment) {
        let roleCode =
          fetchedConsortiumPatientAppointment.transcriptionStatus.roleCode;
        let transcriptionStatusCode =
          fetchedConsortiumPatientAppointment.transcriptionStatus.statusCode;
        let mtAssignedTo =
          fetchedConsortiumPatientAppointment.mtAssignedTo !== null &&
          fetchedConsortiumPatientAppointment.mtAssignedTo !== undefined
            ? fetchedConsortiumPatientAppointment.mtAssignedTo._id
            : "";
        let consortiumUserId =
          fetchedConsortiumPatientAppointment.consortiumUser._id;

        console.log("roleCode:", roleCode);
        console.log("transcriptionStatusCode:", transcriptionStatusCode);
        console.log("mtAssignedTo:", mtAssignedTo);
        console.log("consortiumUserId:", consortiumUserId);

        await AppUploadService.checkAndGenerateModuleMultipleAttachmentExpiredSignedFileUrl(
          AppConfigUploadsModule.MOD_CONSORTIUM_USER,
          consortiumUserId
        );

        let sampleAttachments = [];
        let templateAttachments = [];
        let fetchedConsortiumUser =
          await ConsortiumUserService.findConsortiumUserById(
            req,
            consortiumUserId,
            true
          );
        console.log("fetchedConsortiumUser:", fetchedConsortiumUser);

        if (fetchedConsortiumUser) {
          sampleAttachments = fetchedConsortiumUser.sampleAttachments;
          templateAttachments = fetchedConsortiumUser.templateAttachments;
        }

        let fetchedConsortiumId =
          fetchedConsortiumPatientAppointment.consortium._id;
        let fetchedConsortium =
          await ConsortiumService.getConsortiumBaseObjectById(
            fetchedConsortiumId,
            false
          );
        console.log("fetchedConsortium:", fetchedConsortium);

        let existingDictationRecordingAttachments =
          await ConsortiumPatientAppointmentDictationAttachmentService.findConsortiumPatientAppointmentDictationAttachmentByConsortiumPatientAppointmentId(
            fetchedConsortium,
            consortiumPatientAppointmentId
          );
        let existingTranscriptionAttachments =
          await ConsortiumPatientAppointmentTranscriptionAttachmentService.findConsortiumPatientAppointmentTranscriptionAttachmentByConsortiumPatientAppointmentId(
            fetchedConsortium,
            consortiumPatientAppointmentId
          );
        console.log(
          "existingDictationRecordingAttachments:",
          existingDictationRecordingAttachments
        );
        console.log(
          "existingTranscriptionAttachments:",
          existingTranscriptionAttachments
        );

        let canMarkForStartActivity = false;
        let canMarkForStopActivity = false;
        let canMarkForDuplicateDictation = false;

        let areAppointmentDetailsFilled =
          fetchedConsortiumPatientAppointment.areAppointmentDetailsFilled;
        console.log(
          "areAppointmentDetailsFilled:",
          areAppointmentDetailsFilled
        );

        if (areAppointmentDetailsFilled === true) {
          let systemUserDaywiseWorkAllocationPatientAppointment =
            await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
              roleCode,
              consortiumPatientAppointmentId,
              systemUserId
            );
          console.log(
            "systemUserDaywiseWorkAllocationPatientAppointment:",
            systemUserDaywiseWorkAllocationPatientAppointment
          );

          if (systemUserDaywiseWorkAllocationPatientAppointment) {
            let qa1AssignedTo =
              fetchedConsortiumPatientAppointment.qa1AssignedTo !== null &&
              fetchedConsortiumPatientAppointment.qa1AssignedTo !== undefined
                ? fetchedConsortiumPatientAppointment.qa1AssignedTo._id
                : "";
            let qa2AssignedTo =
              fetchedConsortiumPatientAppointment.qa2AssignedTo !== null &&
              fetchedConsortiumPatientAppointment.qa2AssignedTo !== undefined
                ? fetchedConsortiumPatientAppointment.qa2AssignedTo._id
                : "";
            let qa3AssignedTo =
              fetchedConsortiumPatientAppointment.qa3AssignedTo !== null &&
              fetchedConsortiumPatientAppointment.qa3AssignedTo !== undefined
                ? fetchedConsortiumPatientAppointment.qa3AssignedTo._id
                : "";
            console.log("qa1AssignedTo1234:", qa1AssignedTo);
            console.log("qa2AssignedTo:", qa2AssignedTo);
            console.log("qa3AssignedTo:", qa3AssignedTo);

            let isValid = false;
            if (roleCode === AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA) {
              console.log("roleCodessssssssssssssssssss:", roleCode);
              if (
                transcriptionStatusCode ===
                AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA1_ASSIGNED
              ) {
                if (systemUserId + "" === qa1AssignedTo + "") {
                  isValid = true;
                }
              } else if (
                transcriptionStatusCode ===
                AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA2_ASSIGNED
              ) {
                if (systemUserId + "" === qa2AssignedTo + "") {
                  isValid = true;
                }
              } else if (
                transcriptionStatusCode ===
                AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA3_ASSIGNED
              ) {
                if (systemUserId + "" === qa3AssignedTo + "") {
                  isValid = true;
                }
              }
            } else {
              console.log("roleCodecscscvsdcscscscs:", roleCode);
              isValid = true;
            }

            console.log("isValid:", isValid);

            if (isValid === true) {
              let activityStartedAt =
                systemUserDaywiseWorkAllocationPatientAppointment.activityStartedAt;
              let activityEndedAt =
                systemUserDaywiseWorkAllocationPatientAppointment.activityEndedAt;

              activityStartedAt =
                await AppDataSanitationService.sanitizeDataTypeNumber(
                  activityStartedAt
                );
              activityEndedAt =
                await AppDataSanitationService.sanitizeDataTypeNumber(
                  activityEndedAt
                );

              console.log("activityStartedAt:", activityStartedAt);
              console.log("activityEndedAt:", activityEndedAt);

              if (
                (activityStartedAt === 0 && activityEndedAt === 0) ||
                (activityStartedAt > 0 && activityEndedAt > 0)
              ) {
                canMarkForStartActivity = true;
              }

              if (activityStartedAt > 0 && activityEndedAt === 0) {
                canMarkForStopActivity = true;
              }
            }
          }
        }

        let activityFileStatuses = [];
        if (canMarkForStopActivity === true) {
          activityFileStatuses =
            await ActivityFileStatusService.getActivityFileStatusesForSelect();
        }

        let transcriptionAttachment;
        if (
          existingTranscriptionAttachments &&
          existingTranscriptionAttachments.length > 0
        ) {
          transcriptionAttachment = existingTranscriptionAttachments[0];
        }

        if (systemUserId + "" === mtAssignedTo + "") {
          canMarkForDuplicateDictation = true;
        }

        resStatus = 1;
        responseObj.consortiumPatientAppointment =
          fetchedConsortiumPatientAppointment;
        responseObj.dictationRecordingAttachments =
          existingDictationRecordingAttachments;
        responseObj.transcriptionAttachment = transcriptionAttachment;
        responseObj.templateAttachments = templateAttachments;
        responseObj.sampleAttachments = sampleAttachments;
        responseObj.canMarkForStartActivity = canMarkForStartActivity;
        responseObj.canMarkForStopActivity = canMarkForStopActivity;
        responseObj.canMarkForDuplicateDictation = canMarkForDuplicateDictation;
        responseObj.areAppointmentDetailsFilled = areAppointmentDetailsFilled;
        responseObj.activityFileStatuses = activityFileStatuses;
      } else {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful ";
        console.log("OrganizationPatientAppointment Retrieval Unsuccessful");
      }
    } else {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_DATA;
      console.log("Invalid data");
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    console.log("responseObj:", responseObj);

    return res.status(httpStatus).json(responseObj);
  };

exports.preloadActivityActionForStopActivity = async function (req, res, next) {
  var consortiumPatientAppointmentId = req.body.consortiumPatientAppointment;
  var activityFileStatusId = req.body.activityFileStatusId;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    consortiumPatientAppointmentId &&
    consortiumPatientAppointmentId != undefined &&
    consortiumPatientAppointmentId !== "" &&
    activityFileStatusId !== undefined &&
    activityFileStatusId !== ""
  ) {
    await AppCommonService.setSystemUserAppAccessed(req);

    let activityFileStatusCode;
    if (activityFileStatusId) {
      let fetchedActivityFileStatus =
        await ActivityFileStatusService.findActivityFileStatusById(
          activityFileStatusId
        );
      if (fetchedActivityFileStatus) {
        activityFileStatusCode = fetchedActivityFileStatus.statusCode;
      }
    }

    var fetchedConsortiumPatientAppointment =
      await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
        req,
        consortiumPatientAppointmentId
      );
    if (fetchedConsortiumPatientAppointment) {
      let roleCode =
        fetchedConsortiumPatientAppointment.transcriptionStatus.roleCode;

      let activityActions =
        await ActivityActionService.getActivityActionsForSelect();

      if (activityActions !== null && activityActions.length > 0) {
        activityActions = JSON.parse(JSON.stringify(activityActions));

        await Promise.all(
          activityActions.map(async (activityAction, activityActionIndex) => {
            let actionCode = activityAction.actionCode;

            let isEnabled = false;

            if (
              activityFileStatusCode ===
              AppConfigConst.ACTIVITY_FILE_STATUS_CODE_PENDING
            ) {
              if (actionCode === AppConfigConst.ACTIVITY_ACTION_CODE_EDIT) {
                isEnabled = true;
              } else if (
                actionCode ===
                  AppConfigConst.ACTIVITY_ACTION_CODE_SEND_BACK_TO_MT ||
                actionCode ===
                  AppConfigConst.ACTIVITY_ACTION_CODE_SEND_BACK_TO_QA
              ) {
                if (roleCode === AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA) {
                  let mtAssignedTo =
                    fetchedConsortiumPatientAppointment.mtAssignedTo !== null &&
                    fetchedConsortiumPatientAppointment.mtAssignedTo !==
                      undefined
                      ? fetchedConsortiumPatientAppointment.mtAssignedTo._id
                      : "";
                  let qa1AssignedTo =
                    fetchedConsortiumPatientAppointment.qa1AssignedTo !==
                      null &&
                    fetchedConsortiumPatientAppointment.qa1AssignedTo !==
                      undefined
                      ? fetchedConsortiumPatientAppointment.qa1AssignedTo._id
                      : "";
                  let qa2AssignedTo =
                    fetchedConsortiumPatientAppointment.qa2AssignedTo !==
                      null &&
                    fetchedConsortiumPatientAppointment.qa2AssignedTo !==
                      undefined
                      ? fetchedConsortiumPatientAppointment.qa2AssignedTo._id
                      : "";
                  let qa3AssignedTo =
                    fetchedConsortiumPatientAppointment.qa3AssignedTo !==
                      null &&
                    fetchedConsortiumPatientAppointment.qa3AssignedTo !==
                      undefined
                      ? fetchedConsortiumPatientAppointment.qa3AssignedTo._id
                      : "";

                  if (
                    actionCode ===
                    AppConfigConst.ACTIVITY_ACTION_CODE_SEND_BACK_TO_MT
                  ) {
                    if (
                      systemUserId + "" === qa1AssignedTo + "" ||
                      systemUserId + "" === qa2AssignedTo + "" ||
                      systemUserId + "" === qa3AssignedTo + ""
                    ) {
                      if (mtAssignedTo !== "") {
                        isEnabled = true;
                      }
                    }
                  } else if (
                    actionCode ===
                    AppConfigConst.ACTIVITY_ACTION_CODE_SEND_BACK_TO_QA
                  ) {
                    if (systemUserId + "" === qa2AssignedTo + "") {
                      if (qa1AssignedTo !== "") {
                        isEnabled = true;
                      }
                    } else if (systemUserId + "" === qa3AssignedTo + "") {
                      if (qa1AssignedTo !== "" || qa2AssignedTo !== "") {
                        isEnabled = true;
                      }
                    }
                  }
                }
              }
            } else {
              if (
                actionCode ===
                  AppConfigConst.ACTIVITY_ACTION_CODE_SEND_BACK_TO_MT ||
                actionCode ===
                  AppConfigConst.ACTIVITY_ACTION_CODE_SEND_BACK_TO_QA
              ) {
                isEnabled = false;
              } else {
                isEnabled = true;
              }
            }

            delete activityAction.isMTApplicable;
            delete activityAction.isQAApplicable;
            activityAction.isEnabled = isEnabled;
          })
        );
      }

      resStatus = 1;
      responseObj.activityActions = activityActions;
    } else {
      resStatus = -1;
      resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful ";
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.validateConsortiumPatientAppointmentForStartActivity = async function (
  req,
  res,
  next
) {
  var consortiumPatientAppointmentId = req.body.consortiumPatientAppointment;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  var skipSend = AppCommonService.getSkipSendResponseValue(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    consortiumPatientAppointmentId &&
    consortiumPatientAppointmentId != undefined &&
    consortiumPatientAppointmentId !== ""
  ) {
    await AppCommonService.setSystemUserAppAccessed(req);

    var fetchedConsortiumPatientAppointment =
      await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
        req,
        consortiumPatientAppointmentId,
        false
      );
    if (fetchedConsortiumPatientAppointment) {
      let areAppointmentDetailsFilled =
        fetchedConsortiumPatientAppointment.areAppointmentDetailsFilled;
      if (areAppointmentDetailsFilled === true) {
        let systemUserDaywiseWorkAllocationPatientAppointments =
          await SystemUserDaywiseWorkAllocationPatientAppointmentService.findRunningConsortiumPatientAppointmentActivity(
            systemUserId,
            consortiumPatientAppointmentId
          );
        if (
          systemUserDaywiseWorkAllocationPatientAppointments &&
          systemUserDaywiseWorkAllocationPatientAppointments.length > 0
        ) {
          let systemUserDaywiseWorkAllocationPatientAppointment =
            systemUserDaywiseWorkAllocationPatientAppointments[0];
          if (systemUserDaywiseWorkAllocationPatientAppointment) {
            let consortiumPatientAppointment =
              systemUserDaywiseWorkAllocationPatientAppointment.consortiumPatientAppointment;
            let appointmentId =
              AppCommonService.getConsortiumPatientAppointmentIdWithPrefix(
                consortiumPatientAppointment.appointmentId
              );

            resMsg =
              "System user already working on other activity of " +
              appointmentId;
          } else {
            resMsg = "System user already working on other activity.";
          }
          resStatus = -1;
        } else {
          resStatus = 1;
        }
      } else {
        resStatus = 1;
        resMsg =
          "Appointment details are insufficient, fill all required details first.";
      }
    } else {
      resStatus = -1;
      resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful ";
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  if (skipSend === true) {
    return responseObj;
  } else {
    return res.status(httpStatus).json(responseObj);
  }
};

exports.setSystemUserDaywiseWorkAllocationActivityAsStarted = async function (
  req,
  res,
  next
) {
  var consortiumPatientAppointmentId = req.body.consortiumPatientAppointment;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    consortiumPatientAppointmentId &&
    consortiumPatientAppointmentId != undefined &&
    consortiumPatientAppointmentId !== ""
  ) {
    await AppCommonService.setSystemUserAppAccessed(req);

    const compiledReq =
      AppCommonService.compileRequestWithSkipSendResponse(req);
    compiledReq.body.consortiumPatientAppointment =
      consortiumPatientAppointmentId;
    const isValidForStartActivityResponse =
      await exports.validateConsortiumPatientAppointmentForStartActivity(
        compiledReq,
        res,
        next
      );
    if (isValidForStartActivityResponse) {
      if (isValidForStartActivityResponse.status > 0) {
        var fetchedConsortiumPatientAppointment =
          await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
            req,
            consortiumPatientAppointmentId
          );
        if (fetchedConsortiumPatientAppointment) {
          let roleCode =
            fetchedConsortiumPatientAppointment.transcriptionStatus.roleCode;

          let systemUserDaywiseWorkAllocationPatientAppointment =
            await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
              roleCode,
              consortiumPatientAppointmentId,
              systemUserId
            );

          if (systemUserDaywiseWorkAllocationPatientAppointment) {
            let activityStartedAt =
              systemUserDaywiseWorkAllocationPatientAppointment.activityStartedAt;
            let activityEndedAt =
              systemUserDaywiseWorkAllocationPatientAppointment.activityEndedAt;

            activityStartedAt =
              await AppDataSanitationService.sanitizeDataTypeNumber(
                activityStartedAt
              );
            activityEndedAt =
              await AppDataSanitationService.sanitizeDataTypeNumber(
                activityEndedAt
              );

            if (activityStartedAt > 0 && activityEndedAt === 0) {
              resStatus = 1;
              resMsg = "System user already working on this activity.";
            } else {
              const currTs = await AppCommonService.getCurrentTimestamp();

              let inProgressActivityStatusId =
                await ActivityStatusService.findActivityStatusIdByCode(
                  AppConfigConst.ACTIVITY_STATUS_IN_PROGRESS_CODE
                );

              let updSystemUserDaywiseWorkAllocationPatientAppointment = {
                id: systemUserDaywiseWorkAllocationPatientAppointment._id,
                activityStartedAt: currTs,
                activityStatus: inProgressActivityStatusId,
                activityEndedAt: 0,
              };

              let savedSystemUserDaywiseWorkAllocationPatientAppointment =
                await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                  updSystemUserDaywiseWorkAllocationPatientAppointment
                );

              if (savedSystemUserDaywiseWorkAllocationPatientAppointment) {
                responseObj.savedSystemUserDaywiseWorkAllocationPatientAppointment =
                  savedSystemUserDaywiseWorkAllocationPatientAppointment;

                let systemUserDaywiseWorkAllocationLog = {
                  consortiumPatientAppointment: consortiumPatientAppointmentId,
                  actionCode: AppConfigConst.TRANSCRIPTION_LOG_ACTION_STARTED,
                  updTranscriptorRole:
                    savedSystemUserDaywiseWorkAllocationPatientAppointment.transcriptorRole,
                  updTranscriptionAllocationDate:
                    savedSystemUserDaywiseWorkAllocationPatientAppointment.activityReceivedAt,
                  systemUserDaywiseWorkAllocationPatientAppointment:
                    savedSystemUserDaywiseWorkAllocationPatientAppointment._id,
                  createdBy: systemUserId,
                };

                let savedSystemUserDaywiseWorkAllocationLog =
                  await SystemUserDaywiseWorkAllocationService.saveSystemUserDaywiseWorkAllocationLog(
                    systemUserDaywiseWorkAllocationLog
                  );
                responseObj.savedSystemUserDaywiseWorkAllocationLog =
                  savedSystemUserDaywiseWorkAllocationLog;
              }

              resStatus = 1;
              resMsg = "Activity started successfully.";
            }
          } else {
            resStatus = -1;
            resMsg =
              "System user day wise work allocation patient appointment retrieval unsuccesful ";
          }
        } else {
          resStatus = -1;
          resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful ";
        }
      } else {
        resStatus = -1;
        resMsg = isValidForStartActivityResponse.message;
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

exports.setSystemUserDaywiseWorkAllocationActivityAsStop = async function (
  req,
  res,
  next
) {
  var consortiumPatientAppointmentId = req.body.consortiumPatientAppointment;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    consortiumPatientAppointmentId &&
    consortiumPatientAppointmentId != undefined &&
    consortiumPatientAppointmentId !== ""
  ) {
    await AppCommonService.setSystemUserAppAccessed(req);

    var fetchedConsortiumPatientAppointment =
      await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
        req,
        consortiumPatientAppointmentId
      );
    if (fetchedConsortiumPatientAppointment) {
      let roleCode =
        fetchedConsortiumPatientAppointment.transcriptionStatus.roleCode;

      let systemUserDaywiseWorkAllocationPatientAppointment =
        await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
          roleCode,
          consortiumPatientAppointmentId,
          systemUserId
        );

      if (systemUserDaywiseWorkAllocationPatientAppointment) {
        let activityStartedAt =
          systemUserDaywiseWorkAllocationPatientAppointment.activityStartedAt;
        let activityEndedAt =
          systemUserDaywiseWorkAllocationPatientAppointment.activityEndedAt;

        activityStartedAt =
          await AppDataSanitationService.sanitizeDataTypeNumber(
            activityStartedAt
          );
        activityEndedAt = await AppDataSanitationService.sanitizeDataTypeNumber(
          activityEndedAt
        );

        if (activityStartedAt > 0 && activityEndedAt === 0) {
          const currTs = await AppCommonService.getCurrentTimestamp();

          let completedActivityStatusId =
            await ActivityStatusService.findActivityStatusIdByCode(
              AppConfigConst.ACTIVITY_STATUS_COMPLETED_CODE
            );

          let updSystemUserDaywiseWorkAllocationPatientAppointment = {
            id: systemUserDaywiseWorkAllocationPatientAppointment._id,
            activityEndedAt: currTs,
            activityStatus: completedActivityStatusId,
          };

          let savedSystemUserDaywiseWorkAllocationPatientAppointment =
            await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
              updSystemUserDaywiseWorkAllocationPatientAppointment
            );

          responseObj.savedSystemUserDaywiseWorkAllocationPatientAppointment =
            savedSystemUserDaywiseWorkAllocationPatientAppointment;

          resStatus = 1;
          resMsg = "Activity completed successfully.";
        }
      } else {
        resStatus = -1;
        resMsg =
          "System user day wise work allocation patient appointment retrieval unsuccesful ";
      }
    } else {
      resStatus = -1;
      resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful ";
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.saveConsortiumPatientAppointmentTranscriptionAttachment =
  async function (req, res, next) {
    var consortiumPatientAppointmentId = req.body.consortiumPatientAppointment;
    var transcriptionPreliminaryAttachmentId =
      req.body.transcriptionPreliminaryAttachmentId;
    var activityActionId = req.body.activityActionId;
    var activityFileStatusId = req.body.activityFileStatusId;
    var createDuplicatedDictationAppointment =
      req.body.createDuplicatedDictationAppointment;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
    } else if (
      consortiumPatientAppointmentId &&
      consortiumPatientAppointmentId != undefined &&
      consortiumPatientAppointmentId !== "" &&
      activityActionId !== null &&
      activityActionId !== undefined &&
      activityActionId !== "" &&
      activityFileStatusId !== null &&
      activityFileStatusId !== undefined &&
      activityFileStatusId !== "" &&
      transcriptionPreliminaryAttachmentId &&
      transcriptionPreliminaryAttachmentId !== undefined &&
      transcriptionPreliminaryAttachmentId !== ""
    ) {
      await AppCommonService.setSystemUserAppAccessed(req);

      var fetchedConsortiumPatientAppointment =
        await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
          req,
          consortiumPatientAppointmentId,
          true
        );
      if (fetchedConsortiumPatientAppointment) {
        let consortium = fetchedConsortiumPatientAppointment.consortium;
        let consortiumId = consortium._id;

        let fetchedActivityAction =
          await ActivityActionService.findActivityActionById(activityActionId);
        let fetchedActivityActionCode;
        if (fetchedActivityAction) {
          fetchedActivityActionCode = fetchedActivityAction.actionCode;
        }

        let fetchedActivityFileStatus =
          await ActivityFileStatusService.findActivityFileStatusById(
            activityFileStatusId
          );
        let fetchedActivityFileStatusCode;
        if (fetchedActivityFileStatus) {
          fetchedActivityFileStatusCode = fetchedActivityFileStatus.statusCode;
        }

        let fetchedTranscriptionStatusId =
          fetchedConsortiumPatientAppointment.transcriptionStatus._id;
        let transcriptionStatusCode =
          fetchedConsortiumPatientAppointment.transcriptionStatus.statusCode;
        let roleCode =
          fetchedConsortiumPatientAppointment.transcriptionStatus.roleCode;
        let fetchedTranscriptorRole =
          await TranscriptorRoleService.findTranscriptorRoleByCode(roleCode);

        let systemUserDaywiseWorkAllocationPatientAppointment =
          await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
            roleCode,
            consortiumPatientAppointmentId,
            systemUserId
          );

        if (
          systemUserDaywiseWorkAllocationPatientAppointment &&
          fetchedActivityActionCode !== undefined &&
          fetchedActivityFileStatusCode !== undefined
        ) {
          let systemUserDaywiseWorkAllocation =
            systemUserDaywiseWorkAllocationPatientAppointment.systemUserDaywiseWorkAllocation;
          let systemUserDaywiseWorkAllocationId =
            systemUserDaywiseWorkAllocation._id;

          let activityStartedAt =
            systemUserDaywiseWorkAllocationPatientAppointment.activityStartedAt;
          let activityEndedAt =
            systemUserDaywiseWorkAllocationPatientAppointment.activityEndedAt;
          let activityDurationInSeconds =
            systemUserDaywiseWorkAllocationPatientAppointment.activityDurationInSeconds;

          activityStartedAt =
            await AppDataSanitationService.sanitizeDataTypeNumber(
              activityStartedAt
            );
          activityEndedAt =
            await AppDataSanitationService.sanitizeDataTypeNumber(
              activityEndedAt
            );

          const currTs = await AppCommonService.getCurrentTimestamp();

          responseObj.activityStartedAt = activityStartedAt;
          responseObj.activityEndedAt = activityEndedAt;

          if (activityStartedAt > 0 && activityEndedAt === 0) {
            activityEndedAt = currTs;

            let submittedTranscriptionAttachmentId;
            if (
              transcriptionPreliminaryAttachmentId !== undefined &&
              transcriptionPreliminaryAttachmentId !== ""
            ) {
              let preliminaryAttachment =
                await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(
                  req,
                  transcriptionPreliminaryAttachmentId
                );

              if (preliminaryAttachment) {
                let profilePhotoFilePath =
                  await AppUploadService.moveConsortiumPreliminaryAttachmentToConsortiumPatientAppointmentTranscriptionAttachment(
                    false,
                    consortium,
                    preliminaryAttachment
                  );

                let attFilePathActual,
                  attFilePathThumb,
                  attImageActualUrl,
                  attImageThumbUrl,
                  attFileUrl;
                if (preliminaryAttachment.isImage === true) {
                  var compImageFilePath =
                    await AppCommonService.compileUploadedImageFileNamesFromFileName(
                      profilePhotoFilePath
                    );

                  if (compImageFilePath) {
                    attFilePathActual = compImageFilePath.actual;
                    attFilePathThumb = compImageFilePath.thumb;

                    attImageActualUrl =
                      await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(
                        AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT,
                        attFilePathActual,
                        consortium
                      ); //
                    attImageThumbUrl =
                      await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(
                        AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT,
                        attFilePathThumb,
                        consortium
                      ); //
                  }
                } else {
                  attFilePath = profilePhotoFilePath;
                  attFileUrl =
                    await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(
                      AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT,
                      attFilePath,
                      consortium
                    ); //
                }

                const attFileUrlExpiresAt =
                  AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); //

                let hasDuration = false;
                if (preliminaryAttachment.isAudio === true) {
                  hasDuration = true;
                }

                let transcriptorRoleId = systemUser.transcriptorRole;

                var newAttachment = {
                  consortium: consortiumId,
                  consortiumPatientAppointment: consortiumPatientAppointmentId,
                  attFilePath: profilePhotoFilePath,
                  attFileName: preliminaryAttachment.attFileName,
                  isImage: preliminaryAttachment.isImage,
                  attFileSizeBytes: preliminaryAttachment.attFileSizeBytes,
                  attFilePathActual: attFilePathActual,
                  attFilePathThumb: attFilePathThumb,
                  isAudio: preliminaryAttachment.isAudio,
                  hasDuration: hasDuration,
                  attDurationInSeconds:
                    preliminaryAttachment.attDurationInSeconds,
                  systemUser: systemUserId,
                  transcriptorRole: transcriptorRoleId,
                  updatedBySystemUser: systemUserId,
                  systemUserDaywiseWorkAllocation:
                    systemUserDaywiseWorkAllocationId,
                  activityStartedAt: activityStartedAt,
                  activityEndedAt: activityEndedAt,
                  transcriptionStatus: fetchedTranscriptionStatusId,
                  activityDurationInSeconds: activityDurationInSeconds,
                  attImageActualUrl: attImageActualUrl,
                  attImageThumbUrl: attImageThumbUrl,
                  attFileUrl: attFileUrl,
                  attFileUrlExpiresAt: attFileUrlExpiresAt,
                };

                console.log("newAttachment", newAttachment);

                let savedConsortiumPatientAppointmentTranscriptionAttachment =
                  await ConsortiumPatientAppointmentTranscriptionAttachmentService.saveConsortiumPatientAppointmentTranscriptionAttachment(
                    newAttachment
                  );
                if (savedConsortiumPatientAppointmentTranscriptionAttachment) {
                  submittedTranscriptionAttachmentId =
                    savedConsortiumPatientAppointmentTranscriptionAttachment._id;
                }
              }
            }

            let mtActivityAction;
            let qa1ActivityAction;
            let qa2ActivityAction;
            let qa3ActivityAction;

            if (
              submittedTranscriptionAttachmentId !== undefined &&
              submittedTranscriptionAttachmentId !== ""
            ) {
              let mtAssignedTo =
                fetchedConsortiumPatientAppointment.mtAssignedTo !== null &&
                fetchedConsortiumPatientAppointment.mtAssignedTo !== undefined
                  ? fetchedConsortiumPatientAppointment.mtAssignedTo._id
                  : "";
              let qa1AssignedTo =
                fetchedConsortiumPatientAppointment.qa1AssignedTo !== null &&
                fetchedConsortiumPatientAppointment.qa1AssignedTo !== undefined
                  ? fetchedConsortiumPatientAppointment.qa1AssignedTo._id
                  : "";
              let qa2AssignedTo =
                fetchedConsortiumPatientAppointment.qa2AssignedTo !== null &&
                fetchedConsortiumPatientAppointment.qa2AssignedTo !== undefined
                  ? fetchedConsortiumPatientAppointment.qa2AssignedTo._id
                  : "";
              let qa3AssignedTo =
                fetchedConsortiumPatientAppointment.qa3AssignedTo !== null &&
                fetchedConsortiumPatientAppointment.qa3AssignedTo !== undefined
                  ? fetchedConsortiumPatientAppointment.qa3AssignedTo._id
                  : "";

              if (
                systemUserId + "" === mtAssignedTo + "" &&
                transcriptionStatusCode ===
                  AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED
              ) {
                mtActivityAction = activityActionId;
              } else if (
                systemUserId + "" === qa1AssignedTo + "" &&
                transcriptionStatusCode ===
                  AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA1_ASSIGNED
              ) {
                qa1ActivityAction = activityActionId;
              } else if (
                systemUserId + "" === qa2AssignedTo + "" &&
                transcriptionStatusCode ===
                  AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA2_ASSIGNED
              ) {
                qa2ActivityAction = activityActionId;
              } else if (
                systemUserId + "" === qa3AssignedTo + "" &&
                transcriptionStatusCode ===
                  AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA3_ASSIGNED
              ) {
                qa3ActivityAction = activityActionId;
              }

              let updOngoingActivityAction = activityActionId;
              let updOngoingActivityFileStatus = activityFileStatusId;
              let updOngoingActivityStakeholder = systemUserId;
              let updOngoingActivityTranscriptorRole =
                fetchedTranscriptorRole._id;

              let pendingActivityStatusId =
                await ActivityStatusService.findActivityStatusIdByCode(
                  AppConfigConst.ACTIVITY_STATUS_PENDING_CODE
                );
              let completedActivityStatusId =
                await ActivityStatusService.findActivityStatusIdByCode(
                  AppConfigConst.ACTIVITY_STATUS_COMPLETED_CODE
                );

              let transcriptionStatusForQA1 = false;
              let transcriptionStatusForQA2 = false;
              let transcriptionStatusForQA3 = false;
              let transcriptionStatusForMT = false;
              let transcriptionStatusId;

              responseObj.fetchedActivityFileStatusCode =
                fetchedActivityFileStatusCode;
              responseObj.fetchedActivityActionCode = fetchedActivityActionCode;

              if (
                fetchedActivityFileStatusCode ===
                AppConfigConst.ACTIVITY_FILE_STATUS_CODE_PENDING
              ) {
                if (
                  fetchedActivityActionCode ===
                  AppConfigConst.ACTIVITY_ACTION_CODE_SEND_BACK_TO_MT
                ) {
                  if (
                    systemUserId + "" === qa1AssignedTo + "" ||
                    systemUserId + "" === qa2AssignedTo + "" ||
                    (systemUserId + "" === qa3AssignedTo + "" &&
                      transcriptionStatusCode !==
                        AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED)
                  ) {
                    if (mtAssignedTo !== "") {
                      transcriptionStatusForMT = true;
                    }
                  }
                } else if (
                  fetchedActivityActionCode ===
                  AppConfigConst.ACTIVITY_ACTION_CODE_SEND_BACK_TO_QA
                ) {
                  if (systemUserId + "" === qa2AssignedTo + "") {
                    if (qa1AssignedTo !== "") {
                      transcriptionStatusForQA1 = true;
                    }
                  } else if (systemUserId + "" === qa3AssignedTo + "") {
                    if (
                      qa2AssignedTo !== null &&
                      qa2AssignedTo !== undefined &&
                      qa2AssignedTo !== ""
                    ) {
                      transcriptionStatusForQA2 = true;
                    } else if (qa1AssignedTo !== "") {
                      transcriptionStatusForQA1 = true;
                    }
                  }
                }
              } else if (
                fetchedActivityFileStatusCode ===
                AppConfigConst.ACTIVITY_FILE_STATUS_CODE_COMPLETED
              ) {
                if (
                  fetchedActivityActionCode ===
                    AppConfigConst.ACTIVITY_ACTION_CODE_EDIT ||
                  fetchedActivityActionCode ===
                    AppConfigConst.ACTIVITY_ACTION_CODE_FLAG_OFF ||
                  fetchedActivityActionCode ===
                    AppConfigConst.ACTIVITY_ACTION_CODE_CLEAR
                ) {
                  if (
                    systemUserId + "" === mtAssignedTo + "" &&
                    transcriptionStatusCode ===
                      AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED
                  ) {
                    if (qa1AssignedTo !== "") {
                      transcriptionStatusForQA1 = true;
                    } else if (qa2AssignedTo !== "") {
                      transcriptionStatusForQA2 = true;
                    } else if (qa3AssignedTo !== "") {
                      transcriptionStatusForQA3 = true;
                    }
                  } else if (
                    systemUserId + "" === qa1AssignedTo + "" &&
                    qa1AssignedTo !== "" &&
                    transcriptionStatusCode ===
                      AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA1_ASSIGNED
                  ) {
                    if (qa2AssignedTo !== "") {
                      transcriptionStatusForQA2 = true;
                    } else if (qa3AssignedTo !== "") {
                      transcriptionStatusForQA3 = true;
                    }
                  } else if (
                    systemUserId + "" === qa2AssignedTo + "" &&
                    transcriptionStatusCode ===
                      AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA2_ASSIGNED
                  ) {
                    if (qa3AssignedTo !== "") {
                      transcriptionStatusForQA3 = true;
                    }
                  } else if (
                    fetchedActivityActionCode ===
                      AppConfigConst.ACTIVITY_ACTION_CODE_CLEAR &&
                    systemUserId + "" === qa3AssignedTo + ""
                  ) {
                    transcriptionStatusId =
                      await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                        AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_COMPLETED
                      );
                  }
                }
              }

              if (transcriptionStatusForQA1 === true) {
                transcriptionStatusId =
                  await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                    AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA1_ASSIGNED
                  );
              } else if (transcriptionStatusForQA2 === true) {
                transcriptionStatusId =
                  await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                    AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA2_ASSIGNED
                  );
              } else if (transcriptionStatusForQA3 === true) {
                transcriptionStatusId =
                  await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                    AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA3_ASSIGNED
                  );
              } else if (transcriptionStatusForMT === true) {
                transcriptionStatusId =
                  await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                    AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED
                  );
              }

              responseObj.transcriptionStatusId = transcriptionStatusId;

              if (
                transcriptionStatusId !== null &&
                transcriptionStatusId !== undefined &&
                transcriptionStatusId !== ""
              ) {
                const currTs = await AppCommonService.getCurrentTimestamp();

                let createdBySystemUser = systemUserId;
                let createdByConsortiumUser;
                let transcriptionStatusNotes = "";
                let savedTranscriptionStatusChangeLog =
                  await TranscriptionStatusService.updateTranscriptionStatus(
                    consortiumPatientAppointmentId,
                    transcriptionStatusId,
                    transcriptionStatusNotes,
                    createdBySystemUser,
                    createdByConsortiumUser
                  );

                responseObj.savedTranscriptionStatusChangeLog =
                  savedTranscriptionStatusChangeLog;

                let fetchedSystemUserDaywiseWorkAllocationPatientAppointment;
                let roleCodeForQA = AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA;
                let roleCodeForMT = AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT;

                if (transcriptionStatusForQA1 === true) {
                  fetchedSystemUserDaywiseWorkAllocationPatientAppointment =
                    await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                      roleCodeForQA,
                      consortiumPatientAppointmentId,
                      qa1AssignedTo
                    );
                } else if (transcriptionStatusForQA2 === true) {
                  fetchedSystemUserDaywiseWorkAllocationPatientAppointment =
                    await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                      roleCodeForQA,
                      consortiumPatientAppointmentId,
                      qa2AssignedTo
                    );
                } else if (transcriptionStatusForQA3 === true) {
                  fetchedSystemUserDaywiseWorkAllocationPatientAppointment =
                    await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                      roleCodeForQA,
                      consortiumPatientAppointmentId,
                      qa3AssignedTo
                    );
                } else if (transcriptionStatusForMT === true) {
                  fetchedSystemUserDaywiseWorkAllocationPatientAppointment =
                    await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode(
                      roleCodeForMT,
                      consortiumPatientAppointmentId,
                      mtAssignedTo
                    );
                }

                responseObj.fetchedSystemUserDaywiseWorkAllocationPatientAppointment =
                  fetchedSystemUserDaywiseWorkAllocationPatientAppointment;

                if (fetchedSystemUserDaywiseWorkAllocationPatientAppointment) {
                  let updSystemUserDaywiseWorkAllocationPatientAppointment = {
                    id: fetchedSystemUserDaywiseWorkAllocationPatientAppointment._id,
                    activityReceivedAt: currTs,
                    activityReceivedFrom: systemUserId,
                    activityStatus: pendingActivityStatusId,
                  };

                  let savedSystemUserDaywiseWorkAllocationPatientAppointment =
                    await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                      updSystemUserDaywiseWorkAllocationPatientAppointment
                    );

                  if (savedSystemUserDaywiseWorkAllocationPatientAppointment) {
                    fetchedSystemUserDaywiseWorkAllocationPatientAppointment =
                      await SystemUserDaywiseWorkAllocationPatientAppointmentService.findSystemUserDaywiseWorkAllocationPatientAppointmentById(
                        savedSystemUserDaywiseWorkAllocationPatientAppointment._id
                      );
                    if (
                      fetchedSystemUserDaywiseWorkAllocationPatientAppointment
                    ) {
                      let fetchedConsDate =
                        fetchedSystemUserDaywiseWorkAllocationPatientAppointment
                          .systemUserDaywiseWorkAllocation.consDate;
                      let fetchedSystemUser =
                        fetchedSystemUserDaywiseWorkAllocationPatientAppointment
                          .systemUserDaywiseWorkAllocation.systemUser;

                      await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                        fetchedSystemUser,
                        fetchedConsDate
                      );
                    }

                    let systemUserDaywiseWorkAllocationLog = {
                      consortiumPatientAppointment:
                        consortiumPatientAppointmentId,
                      actionCode:
                        AppConfigConst.TRANSCRIPTION_LOG_ACTION_ASSIGNED,
                      updTranscriptorRole:
                        savedSystemUserDaywiseWorkAllocationPatientAppointment.transcriptorRole,
                      pastTranscriptorRole:
                        fetchedSystemUserDaywiseWorkAllocationPatientAppointment
                          .transcriptorRole._id,
                      updTranscriptionAllocationDate:
                        savedSystemUserDaywiseWorkAllocationPatientAppointment.activityReceivedAt,
                      pastTranscriptionAllocationDate:
                        fetchedSystemUserDaywiseWorkAllocationPatientAppointment.activityReceivedAt,
                      systemUserDaywiseWorkAllocationPatientAppointment:
                        savedSystemUserDaywiseWorkAllocationPatientAppointment._id,
                      createdBy: systemUserId,
                    };

                    let savedSystemUserDaywiseWorkAllocationLog =
                      await SystemUserDaywiseWorkAllocationService.saveSystemUserDaywiseWorkAllocationLog(
                        systemUserDaywiseWorkAllocationLog
                      );
                    responseObj.savedSystemUserDaywiseWorkAllocationLog =
                      savedSystemUserDaywiseWorkAllocationLog;
                  }
                }
              }

              let updSystemUserDaywiseWorkAllocationPatientAppointment = {
                id: systemUserDaywiseWorkAllocationPatientAppointment._id,
                activityEndedAt: activityEndedAt,
                activityStatus: completedActivityStatusId,
                activityAction: fetchedActivityAction._id,
                activityFileStatus: fetchedActivityFileStatus._id,
              };

              responseObj.updSystemUserDaywiseWorkAllocationPatientAppointment =
                updSystemUserDaywiseWorkAllocationPatientAppointment;

              let savedSystemUserDaywiseWorkAllocationPatientAppointment =
                await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                  updSystemUserDaywiseWorkAllocationPatientAppointment
                );

              responseObj.savedSystemUserDaywiseWorkAllocationPatientAppointment =
                savedSystemUserDaywiseWorkAllocationPatientAppointment;

              if (savedSystemUserDaywiseWorkAllocationPatientAppointment) {
                let systemUserDaywiseWorkAllocationLog = {
                  consortiumPatientAppointment: consortiumPatientAppointmentId,
                  actionCode: AppConfigConst.TRANSCRIPTION_LOG_ACTION_STOPPED,
                  updTranscriptorRole:
                    savedSystemUserDaywiseWorkAllocationPatientAppointment.transcriptorRole,
                  updTranscriptionAllocationDate:
                    savedSystemUserDaywiseWorkAllocationPatientAppointment.activityReceivedAt,
                  systemUserDaywiseWorkAllocationPatientAppointment:
                    savedSystemUserDaywiseWorkAllocationPatientAppointment._id,
                  createdBy: systemUserId,
                };

                let savedSystemUserDaywiseWorkAllocationLog =
                  await SystemUserDaywiseWorkAllocationService.saveSystemUserDaywiseWorkAllocationLog(
                    systemUserDaywiseWorkAllocationLog
                  );

                responseObj.savedSystemUserDaywiseWorkAllocationLog1 =
                  savedSystemUserDaywiseWorkAllocationLog;

                var updConsortiumPatientAppointment = {
                  id: consortiumPatientAppointmentId,
                  submittedTranscriptionAttachment:
                    submittedTranscriptionAttachmentId,
                  ongoingActivityAction: updOngoingActivityAction,
                  ongoingActivityFileStatus: updOngoingActivityFileStatus,
                  ongoingActivityStakeholder: updOngoingActivityStakeholder,
                  ongoingActivityTranscriptorRole:
                    updOngoingActivityTranscriptorRole,
                  mtActivityAction: mtActivityAction,
                  qa1ActivityAction: qa1ActivityAction,
                  qa2ActivityAction: qa2ActivityAction,
                  qa3ActivityAction: qa3ActivityAction,
                  updatedBySystemUser: systemUserId,
                };

                let savedConsortiumPatientAppointment =
                  await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
                    updConsortiumPatientAppointment
                  );
                if (savedConsortiumPatientAppointment) {
                  responseObj.savedConsortiumPatientAppointment =
                    savedConsortiumPatientAppointment;
                  if (
                    createDuplicatedDictationAppointment !== undefined &&
                    createDuplicatedDictationAppointment !== null &&
                    createDuplicatedDictationAppointment === true
                  ) {
                    const compiledReq =
                      AppCommonService.compileRequestWithSkipSendResponse(req);
                    compiledReq.body.consortiumPatientAppointment =
                      savedConsortiumPatientAppointment._id;
                    const duplicateConsortiumPatientAppointmentResponse =
                      await exports.duplicateConsortiumPatientAppointmentDictations(
                        compiledReq,
                        res,
                        next
                      );
                    if (duplicateConsortiumPatientAppointmentResponse) {
                      if (
                        duplicateConsortiumPatientAppointmentResponse.status > 0
                      ) {
                        responseObj.duplicateConsortiumPatientAppointmentId =
                          duplicateConsortiumPatientAppointmentResponse.id;
                      }
                    }
                  }
                }
              }

              resStatus = 1;
              resMsg = "Activity completed successfully.";
            } else {
              resStatus = -1;
              resMsg = "Invalid Attachment File.";
            }
          } else {
            resStatus = -1;
            resMsg = "Activity not stated yet.";
          }
        } else {
          resStatus = -1;
          resMsg =
            "System user day wise work allocation patient appointment retrieval unsuccesful ";
        }
      } else {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful ";
      }
    } else {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
  };

exports.changeTranscriptionAllocationDate = async function (req, res, next) {
  var consortiumPatientAppointmentIdArr =
    req.body.consortiumPatientAppointmentIdArr;
  let transcriptionAllocationDate = req.body.transcriptionAllocationDate;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    consortiumPatientAppointmentIdArr &&
    consortiumPatientAppointmentIdArr != undefined &&
    consortiumPatientAppointmentIdArr.length > 0 &&
    transcriptionAllocationDate !== undefined &&
    transcriptionAllocationDate > 0
  ) {
    await AppCommonService.setSystemUserAppAccessed(req);

    var consortiumPatientAppointmentList =
      await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentByIdArr(
        consortiumPatientAppointmentIdArr
      );
    if (
      consortiumPatientAppointmentList &&
      consortiumPatientAppointmentList.length > 0
    ) {
      await Promise.all(
        consortiumPatientAppointmentList.map(
          async (
            consortiumPatientAppointment,
            consortiumPatientAppointmentIndex
          ) => {
            consortiumPatientAppointment.transcriptionAllocationDate =
              transcriptionAllocationDate;
            let savedConsortiumPatientAppointment =
              await consortiumPatientAppointment.save();
          }
        )
      );
    }

    resStatus = 1;
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.validateConsortiumPatientAppointmentForTranscriptionAssignment =
  async function (req, res, next) {
    var consortiumPatientAppointmentIdArr =
      req.body.consortiumPatientAppointmentIdArr;

    var validityStatusArr = [];
    var validityStatusMsgArr = [];

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
    } else if (
      consortiumPatientAppointmentIdArr &&
      consortiumPatientAppointmentIdArr != undefined &&
      consortiumPatientAppointmentIdArr.length > 0
    ) {
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

          let inValidRecordCount = 0;
          await Promise.all(
            consortiumPatientAppointmentIdArr.map(
              async (
                consortiumPatientAppointmentId,
                patientAppointmentIndex
              ) => {
                var consortiumPatientAppointmentValidityMsg = "";
                let isValidRecord = false;

                var fetchedConsortiumPatientAppointment =
                  await ConsortiumPatientAppointmentService.validateConsortiumPatientAppointmentForTranscriptionAssignment(
                    consortiumPatientAppointmentId
                  );
                if (fetchedConsortiumPatientAppointment) {
                  isValidRecord = true;
                } else {
                  inValidRecordCount++;
                  consortiumPatientAppointmentValidityMsg =
                    "Patient appointment not valid for transcription assignment.";
                }

                // validityStatusArr[patientAppointmentIndex] = isValidRecord;
                // validityStatusMsgArr[patientAppointmentIndex] = consortiumPatientAppointmentValidityMsg;
              }
            )
          );

          if (inValidRecordCount > 0) {
            resMsg =
              "Some of the patient appointment not valid for transcription assignment.";
          }

          resStatus = 1;
        } catch (e) {
          resStatus = -1;
          resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
        }
      }
    } else {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_DATA;
    }

    //   responseObj.validityStatusArr = validityStatusArr;
    //   responseObj.validityStatusMsgArr = validityStatusMsgArr;
    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
  };

exports.getSystemUserWorkReport = async function (req, res, next) {
  let filStartTranscriptionAllocationDate =
    req.body.filStartTranscriptionAllocationDate;
  let filEndTranscriptionAllocationDate =
    req.body.filEndTranscriptionAllocationDate;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  let compReq = AppCommonService.getClonedRequestObject(req);
  var tzStr = await AppCommonService.getTimezoneStrFromRequest(req);

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else {
    await AppCommonService.setSystemUserAppAccessed(req);

    let consTimelineStartDt;
    let consTimelineEndDt;
    if (
      filStartTranscriptionAllocationDate !== undefined &&
      filStartTranscriptionAllocationDate > 0
    ) {
      consTimelineStartDt = filStartTranscriptionAllocationDate;
    } else {
      consTimelineStartDt = momentTZ().tz(tzStr).startOf("day").unix();
    }

    if (
      filEndTranscriptionAllocationDate !== undefined &&
      filEndTranscriptionAllocationDate > 0
    ) {
      consTimelineEndDt = filEndTranscriptionAllocationDate;
    } else {
      consTimelineEndDt = momentTZ().tz(tzStr).endOf("day").unix();
    }

    compReq.body.forExport = true;
    compReq.body.filIsDictationUploadCompleted = true;
    compReq.body.sortBy = "col1";
    compReq.body.sortOrder = "asc";
    compReq.body.filStartTranscriptionAllocationDate = consTimelineStartDt;
    compReq.body.filEndTranscriptionAllocationDate = consTimelineEndDt;
    compReq.body.filSystemUser = systemUserId;

    let consortiumPatientAppointments = [];
    let consortiumPatientAppointmentsList =
      await ConsortiumPatientAppointmentService.getConsortiumPatientAppointments(
        compReq
      );
    let consortiumTotalAppointmentDicationDuration = 0;
    let consortiumTotalAppointmentCount = 0;

    if (consortiumPatientAppointmentsList != null) {
      consortiumPatientAppointments = consortiumPatientAppointmentsList.results;

      if (
        consortiumPatientAppointments &&
        consortiumPatientAppointments.length > 0
      ) {
        consortiumPatientAppointments = JSON.parse(
          JSON.stringify(consortiumPatientAppointments)
        );
        await Promise.all(
          consortiumPatientAppointments.map(
            async (
              consortiumPatientAppointment,
              consortiumPatientAppointmentIndex
            ) => {
              let totalDicationDurationInSeconds =
                consortiumPatientAppointment.totalDicationDurationInSeconds;
              let appointmentDate =
                consortiumPatientAppointment.appointmentDate;
              let transcriptionAllocationDate =
                consortiumPatientAppointment.transcriptionAllocationDate;

              consortiumTotalAppointmentDicationDuration +=
                totalDicationDurationInSeconds;
              consortiumTotalAppointmentCount += 1;

              if (appointmentDate > 0) {
                appointmentDate =
                  await AppCommonService.timestampToDispViewDateForReport(
                    appointmentDate
                  );
              }

              if (transcriptionAllocationDate > 0) {
                transcriptionAllocationDate =
                  await AppCommonService.timestampToDispViewDateForReport(
                    transcriptionAllocationDate
                  );
              }

              totalDicationDurationInSeconds = parseInt(
                totalDicationDurationInSeconds
              );
              let totalDicationDuration =
                AppCommonService.secondsToHourMinuteSecond(
                  totalDicationDurationInSeconds
                );

              consortiumPatientAppointment.appointmentDate = appointmentDate;
              consortiumPatientAppointment.transcriptionAllocationDate =
                transcriptionAllocationDate;
              consortiumPatientAppointment.totalDicationDuration =
                totalDicationDuration;
            }
          )
        );
      }
    }

    consortiumTotalAppointmentDicationDuration = parseInt(
      consortiumTotalAppointmentDicationDuration
    );
    consortiumTotalAppointmentDicationDuration =
      AppCommonService.secondsToHourMinuteSecond(
        consortiumTotalAppointmentDicationDuration
      );

    responseObj.data = consortiumPatientAppointments;
    responseObj.consortiumTotalAppointmentDicationDuration =
      consortiumTotalAppointmentDicationDuration;
    responseObj.consortiumTotalAppointmentCount =
      consortiumTotalAppointmentCount;

    resStatus = 1;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.validateConsortiumLocationSlotTime = async function (req, res, next) {
  var consortiumLocationId = req.body.consortiumLocation;
  var consortiumId = req.body.consortium;
  var startTime = req.body.startTime;
  var endTime = req.body.endTime;

  var startTimeInt = 0;
  if (startTime !== undefined && startTime !== "") {
    try {
      startTimeInt = parseInt(startTime.replace(":", ""));
    } catch (e) {
      startTimeInt = 0;
    }
  }

  var endTimeInt = 0;
  if (endTime !== undefined && endTime !== "") {
    try {
      endTimeInt = parseInt(endTime.replace(":", ""));
    } catch (e) {
      endTimeInt = 0;
    }
  }

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );

  if (isConsortiumUserRequest === true) {
    consortiumId = consortiumUser.consortium;
    consortiumLocationId =
      await AppCommonService.getConsortiumLocationIdFromRequest(req);
  }

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    consortiumLocationId &&
    consortiumLocationId !== undefined &&
    consortiumLocationId != "" &&
    consortiumId &&
    consortiumId !== undefined &&
    consortiumId != "" &&
    startTimeInt &&
    startTimeInt !== undefined &&
    startTimeInt != "" &&
    endTimeInt &&
    endTimeInt !== undefined &&
    endTimeInt != ""
  ) {
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

    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        if (isConsortiumUserRequest === true) {
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        var isValidTime =
          await ConsortiumLocationService.validateConsortiumLocationSlotTime(
            consortiumLocationId,
            consortiumId,
            startTimeInt,
            endTimeInt
          );

        if (isValidTime) {
          resStatus = 1;
        } else {
          resStatus = -1;
          resMsg = "Invalid time slot.";
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationLocation Retrieval Unsuccesful " + e;
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

exports.saveAdhocConsortiumPatientAppointment = async function (req, res) {
  var consortiumId = req.body.consortium;
  var appointmentDate = req.body.appointmentDate;
  var consortiumUserDoctor = req.body.consortiumUser;
  var consortiumLocation = req.body.consortiumLocation;
  var dictationRecordingPreliminaryAttachmentIdArr =
    req.body.dictationRecordingPreliminaryAttachmentIdArr;

  appointmentDate = await AppDataSanitationService.sanitizeDataTypeNumber(
    appointmentDate
  );

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );

  if (isConsortiumUserRequest === true) {
    consortiumId = consortiumUser.consortium;
    consortiumLocation =
      await AppCommonService.getConsortiumLocationIdFromRequest(req);
  }

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    appointmentDate > 0 &&
    consortiumId !== undefined &&
    consortiumId !== "" &&
    consortiumLocation !== undefined &&
    consortiumLocation !== "" &&
    consortiumUserDoctor &&
    consortiumUserDoctor !== undefined &&
    consortiumUserDoctor !== ""
  ) {
    var hasAddRights = false;
    if (isConsortiumUserRequest === true) {
      hasAddRights = await AppCommonService.checkConsortiumUserHasModuleRights(
        consortiumUser,
        consortiumBulkDictationModule,
        AppConfigModule.RIGHT_ADD
      );
    } else {
      hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        consortiumBulkDictationModule,
        AppConfigModule.RIGHT_ADD
      );
    }

    if (!hasAddRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        var fetchedConsortium;
        if (isConsortiumUserRequest === true) {
          fetchedConsortium = await AppCommonService.getConsortiumFromRequest(
            req
          );
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          fetchedConsortium =
            await ConsortiumService.getConsortiumBaseObjectById(
              consortiumId,
              false
            );
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        let transcriptionStatusAssignmentPendingId =
          await TranscriptionStatusService.findTranscriptionStatusIdByCode(
            AppConfigConst.TRANSCRIPTION_STATUS_CODE_ASSIGNMENT_PENDING
          );

        if (
          dictationRecordingPreliminaryAttachmentIdArr !== null &&
          dictationRecordingPreliminaryAttachmentIdArr.length > 0
        ) {
          let currMaxId =
            await ConsortiumPatientAppointmentService.getCurrentHighestConsortiumPatientAppointmentId(
              consortiumId
            );

          await Promise.all(
            dictationRecordingPreliminaryAttachmentIdArr.map(
              async (preliminaryAttachmentId, attIndex) => {
                if (preliminaryAttachmentId !== "") {
                  let preliminaryAttachment;
                  if (isConsortiumUserRequest === true) {
                    preliminaryAttachment =
                      await ConsortiumPreliminaryAttachmentService.findConsortiumPreliminaryAttachmentById(
                        req,
                        preliminaryAttachmentId
                      );
                  } else {
                    preliminaryAttachment =
                      await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(
                        req,
                        preliminaryAttachmentId
                      );
                  }

                  if (preliminaryAttachment) {
                    let attachmentFilePath =
                      await AppUploadService.moveConsortiumPreliminaryAttachmentToConsortiumPatientAppointmentDictationAttachment(
                        isConsortiumUserRequest,
                        fetchedConsortium,
                        preliminaryAttachment
                      );

                    let attFilePathActual,
                      attFilePathThumb,
                      attImageActualUrl,
                      attImageThumbUrl,
                      attFileUrl,
                      attType;
                    if (preliminaryAttachment.isImage === true) {
                      var compImageFilePath =
                        await AppCommonService.compileUploadedImageFileNamesFromFileName(
                          attachmentFilePath
                        );

                      if (compImageFilePath) {
                        attFilePathActual = compImageFilePath.actual;
                        attFilePathThumb = compImageFilePath.thumb;

                        attImageActualUrl =
                          await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(
                            AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT,
                            attFilePathActual,
                            fetchedConsortium
                          ); //
                        attImageThumbUrl =
                          await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(
                            AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT,
                            attFilePathThumb,
                            fetchedConsortium
                          ); //
                      }
                    } else {
                      attFilePath = attachmentFilePath;
                      attFileUrl =
                        await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(
                          AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT,
                          attFilePath,
                          fetchedConsortium
                        ); //
                    }

                    const attFileUrlExpiresAt =
                      AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); //

                    let hasDuration = false;
                    if (preliminaryAttachment.isAudio === true) {
                      hasDuration = true;
                    }

                    const currTs = await AppCommonService.getCurrentTimestamp();
                    var consortiumPatientAppointment = {
                      appointmentDate: appointmentDate,
                      consortium: consortiumId,
                      consortiumUser: consortiumUserDoctor,
                      consortiumLocation: consortiumLocation,
                      areAppointmentDetailsFilled: false,
                      isBulkDictationAppointment: true,
                      isDeleted: 0,
                      isDictationUploadCompleted: true,
                      dictationUploadCompletedAt: currTs,
                      totalDictationUploadCount: 1,
                      totalDicationDurationInSeconds:
                        preliminaryAttachment.attDurationInSeconds,
                      totalDicationAttachmentFileSizeBytes:
                        preliminaryAttachment.attFileSizeBytes,
                    };

                    if (isConsortiumUserRequest === true) {
                      consortiumPatientAppointment.updatedByConsortiumUser =
                        consortiumUserId;
                      consortiumPatientAppointment.createdByConsortiumUser =
                        consortiumUserId;
                    } else {
                      consortiumPatientAppointment.updatedBySystemUser =
                        systemUserId;
                      consortiumPatientAppointment.createdBySystemUser =
                        systemUserId;
                    }

                    currMaxId += 1;
                    consortiumPatientAppointment.appointmentId = currMaxId;

                    let savedConsortiumPatientAppointment =
                      await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
                        consortiumPatientAppointment
                      );
                    if (savedConsortiumPatientAppointment) {
                      let consortiumPatientAppointmentId =
                        savedConsortiumPatientAppointment._id;
                      responseObj["attIndex_" + attIndex] =
                        consortiumPatientAppointmentId;

                      await ConsortiumPatientAppointmentService.setConsortiumPatientAppointmentStatusAsConsulted(
                        consortiumPatientAppointmentId,
                        systemUserId,
                        consortiumUserId
                      );

                      if (transcriptionStatusAssignmentPendingId) {
                        let updTranscriptionStatusNotes;
                        await TranscriptionStatusService.updateTranscriptionStatus(
                          consortiumPatientAppointmentId,
                          transcriptionStatusAssignmentPendingId,
                          updTranscriptionStatusNotes,
                          systemUserId,
                          consortiumUserId
                        );
                      }

                      var newAttachment = {
                        attType: preliminaryAttachmentId.text,
                        consortium: consortiumId,
                        consortiumPatientAppointment:
                          consortiumPatientAppointmentId,
                        attFilePath: attachmentFilePath,
                        attFileName: preliminaryAttachment.attFileName,
                        isImage: preliminaryAttachment.isImage,
                        attFileSizeBytes:
                          preliminaryAttachment.attFileSizeBytes,
                        attFilePathActual: attFilePathActual,
                        attFilePathThumb: attFilePathThumb,
                        isAudio: preliminaryAttachment.isAudio,
                        hasDuration: hasDuration,
                        attDurationInSeconds:
                          preliminaryAttachment.attDurationInSeconds,
                        attImageActualUrl: attImageActualUrl,
                        attImageThumbUrl: attImageThumbUrl,
                        attFileUrl: attFileUrl,
                        attFileUrlExpiresAt: attFileUrlExpiresAt,
                      };

                      if (isConsortiumUserRequest === true) {
                        newAttachment.updatedByConsortiumUser =
                          consortiumUserId;
                      } else {
                        newAttachment.updatedBySystemUser = systemUserId;
                      }

                      let savedConsortiumPatientAppointmentDictationAttachment =
                        await ConsortiumPatientAppointmentDictationAttachmentService.saveConsortiumPatientAppointmentDictationAttachment(
                          newAttachment
                        );
                    }
                  }
                }
              }
            )
          );

          await AppCommonService.generateConsortiumPatientAppointmentIdForImport(
            currMaxId,
            consortiumId
          );
        }

        resStatus = 1;
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
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

exports.updateConsortiumPatientAppointmentDetails = async function (
  req,
  res,
  next
) {
  var consortiumPatientAppointmentId = req.body.consortiumPatientAppointment;
  var patientFirstName = req.body.patientFirstName;
  var patientLastName = req.body.patientLastName;
  var patientBirthDate = req.body.patientBirthDate;
  var patientMRNumber = req.body.patientMRNumber;

  if (!consortiumPatientAppointmentId) consortiumPatientAppointmentId = "";

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    consortiumPatientAppointmentId &&
    consortiumPatientAppointmentId != "" &&
    patientFirstName &&
    patientFirstName != ""
  ) {
    var hasEditRights = false;
    if (isConsortiumUserRequest === true) {
      hasEditRights = await AppCommonService.checkConsortiumUserHasModuleRights(
        consortiumUser,
        thisModule,
        AppConfigModule.RIGHT_EDIT
      );
    } else {
      hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(
        systemUser,
        thisModule,
        AppConfigModule.RIGHT_EDIT
      );
    }

    if (!hasEditRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        if (isConsortiumUserRequest === true) {
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        var fetchedConsortiumPatientAppointment =
          await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
            req,
            consortiumPatientAppointmentId
          );
        if (fetchedConsortiumPatientAppointment) {
          let fetchedAreAppointmentDetailsFilled =
            fetchedConsortiumPatientAppointment.areAppointmentDetailsFilled;

          if (fetchedAreAppointmentDetailsFilled === false) {
            let patientFullName = patientLastName + ", " + patientFirstName;

            var consortiumPatientAppointment = {
              id: consortiumPatientAppointmentId,
              patientFullName: patientFullName,
              patientFirstName: patientFirstName,
              patientLastName: patientLastName,
              patientBirthDate: patientBirthDate,
              patientMRNumber: patientMRNumber,
              areAppointmentDetailsFilled: true,
            };

            if (isConsortiumUserRequest === true) {
              consortiumPatientAppointment.updatedByConsortiumUser =
                consortiumUserId;
            } else {
              consortiumPatientAppointment.updatedBySystemUser = systemUserId;
            }

            responseObj.consortiumPatientAppointment =
              consortiumPatientAppointment;
            let savedConsortiumPatientAppointment =
              await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
                consortiumPatientAppointment,
                req
              );
            responseObj.savedConsortiumPatientAppointment =
              savedConsortiumPatientAppointment;
            if (savedConsortiumPatientAppointment) {
              responseObj.savedConsortiumPatientAppointmentId =
                savedConsortiumPatientAppointment._id;
              resStatus = 1;
              resMsg = AppCommonService.getSavedMessage(thisModulename);
            } else {
              resStatus = -1;
            }
          } else {
            resStatus = -1;
          }
        } else {
          resStatus = -1;
          resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful ";
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
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

exports.duplicateConsortiumPatientAppointmentDictations = async function (
  req,
  res,
  next
) {
  var consortiumPatientAppointmentId = req.body.consortiumPatientAppointment;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var skipSend = AppCommonService.getSkipSendResponseValue(req);

  var systemUser = await AppCommonService.getSystemUserFromRequest(req);
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(
    req
  );
  let sessConsortiumLocationId =
    await AppCommonService.getConsortiumLocationIdFromRequest(req);

  if (!systemUser && !consortiumUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (
    consortiumPatientAppointmentId &&
    consortiumPatientAppointmentId != ""
  ) {
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

    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        if (isConsortiumUserRequest === true) {
          await AppCommonService.setConsortiumUserAppAccessed(req);
        } else {
          await AppCommonService.setSystemUserAppAccessed(req);
        }

        var fetchedConsortiumPatientAppointment =
          await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(
            req,
            consortiumPatientAppointmentId,
            false
          );
        if (fetchedConsortiumPatientAppointment) {
          let fetchedIsDuplicatedDictationAppointment =
            fetchedConsortiumPatientAppointment.isDuplicatedDictationAppointment !==
              undefined &&
            fetchedConsortiumPatientAppointment.isDuplicatedDictationAppointment !==
              null
              ? fetchedConsortiumPatientAppointment.isDuplicatedDictationAppointment
              : false;

          let duplicatedBasePatientAppointment;
          if (fetchedIsDuplicatedDictationAppointment === true) {
            duplicatedBasePatientAppointment =
              fetchedConsortiumPatientAppointment.duplicatedBasePatientAppointment;
          } else {
            duplicatedBasePatientAppointment =
              fetchedConsortiumPatientAppointment._id;
          }

          let fetchedConsortium;
          let fetchedConsortiumId;
          if (isConsortiumUserRequest === true) {
            fetchedConsortium = await AppCommonService.getConsortiumFromRequest(
              req
            );
          } else {
            fetchedConsortium =
              await ConsortiumService.getConsortiumBaseObjectById(
                fetchedConsortiumPatientAppointment.consortium,
                false
              );
          }

          if (fetchedConsortium) {
            fetchedConsortiumId = fetchedConsortium._id;
          }

          let existingDictationRecordingAttachments =
            await ConsortiumPatientAppointmentDictationAttachmentService.findConsortiumPatientAppointmentDictationAttachmentByConsortiumPatientAppointmentId(
              fetchedConsortium,
              consortiumPatientAppointmentId
            );
          if (existingDictationRecordingAttachments.length > 0) {
            let transcriptionStatusAssignmentPendingId =
              await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                AppConfigConst.TRANSCRIPTION_STATUS_CODE_ASSIGNMENT_PENDING
              );
            let totalDictationUploadCount =
              existingDictationRecordingAttachments.length;

            const currTs = await AppCommonService.getCurrentTimestamp();

            var newConsortiumPatientAppointment = {
              appointmentDate:
                fetchedConsortiumPatientAppointment.appointmentDate,
              startTime: fetchedConsortiumPatientAppointment.startTime,
              endTime: fetchedConsortiumPatientAppointment.endTime,
              notes: fetchedConsortiumPatientAppointment.notes,
              consortium: fetchedConsortiumId,
              consortiumUser:
                fetchedConsortiumPatientAppointment.consortiumUser,
              consortiumLocation:
                fetchedConsortiumPatientAppointment.consortiumLocation,
              areAppointmentDetailsFilled: false,
              isBulkDictationAppointment: true,
              isDeleted: 0,
              isDictationUploadCompleted: true,
              dictationUploadCompletedAt: currTs,
              totalDictationUploadCount: totalDictationUploadCount,
              totalDicationDurationInSeconds: 0,
              totalDicationAttachmentFileSizeBytes:
                fetchedConsortiumPatientAppointment.attFileSizeBytes,
              mtAssignedTo: fetchedConsortiumPatientAppointment.mtAssignedTo,
              mtAssignedAt: currTs,
              mtAssignedBy: fetchedConsortiumPatientAppointment.mtAssignedBy,
              activityPriority:
                fetchedConsortiumPatientAppointment.activityPriority,
              isDuplicatedDictationAppointment: true,
              duplicatedBasePatientAppointment:
                duplicatedBasePatientAppointment,
            };

            if (isConsortiumUserRequest === true) {
              newConsortiumPatientAppointment.updatedByConsortiumUser =
                consortiumUserId;
              newConsortiumPatientAppointment.createdByConsortiumUser =
                consortiumUserId;
            } else {
              newConsortiumPatientAppointment.updatedBySystemUser =
                systemUserId;
              newConsortiumPatientAppointment.createdBySystemUser =
                systemUserId;
            }

            if (
              mongodb.ObjectId.isValid(
                fetchedConsortiumPatientAppointment.qa1AssignedTo
              )
            ) {
              newConsortiumPatientAppointment.qa1AssignedTo =
                fetchedConsortiumPatientAppointment.qa1AssignedTo;
              newConsortiumPatientAppointment.qa1AssignedAt = currTs;
              newConsortiumPatientAppointment.qa1AssignedBy =
                fetchedConsortiumPatientAppointment.qa1AssignedBy;
            }

            if (
              mongodb.ObjectId.isValid(
                fetchedConsortiumPatientAppointment.qa2AssignedTo
              )
            ) {
              newConsortiumPatientAppointment.qa2AssignedTo =
                fetchedConsortiumPatientAppointment.qa2AssignedTo;
              newConsortiumPatientAppointment.qa2AssignedAt = currTs;
              newConsortiumPatientAppointment.qa2AssignedBy =
                fetchedConsortiumPatientAppointment.qa2AssignedBy;
            }

            if (
              mongodb.ObjectId.isValid(
                fetchedConsortiumPatientAppointment.qa3AssignedTo
              )
            ) {
              newConsortiumPatientAppointment.qa3AssignedTo =
                fetchedConsortiumPatientAppointment.qa3AssignedTo;
              newConsortiumPatientAppointment.qa3AssignedAt = currTs;
              newConsortiumPatientAppointment.qa3AssignedBy =
                fetchedConsortiumPatientAppointment.qa3AssignedBy;
            }

            let savedConsortiumPatientAppointment =
              await ConsortiumPatientAppointmentService.saveConsortiumPatientAppointment(
                newConsortiumPatientAppointment
              );
            if (savedConsortiumPatientAppointment) {
              let savedConsortiumPatientAppointmentId =
                savedConsortiumPatientAppointment._id;
              let activityPriority =
                savedConsortiumPatientAppointment.activityPriority;
              let mtAssignedTo = savedConsortiumPatientAppointment.mtAssignedTo;
              let qa1AssignedTo =
                savedConsortiumPatientAppointment.qa1AssignedTo;
              let qa2AssignedTo =
                savedConsortiumPatientAppointment.qa2AssignedTo;
              let qa3AssignedTo =
                savedConsortiumPatientAppointment.qa3AssignedTo;
              let totalDicationDurationInSeconds =
                savedConsortiumPatientAppointment.totalDicationDurationInSeconds;

              responseObj.id = savedConsortiumPatientAppointmentId;

              await ConsortiumPatientAppointmentService.setConsortiumPatientAppointmentStatusAsConsulted(
                savedConsortiumPatientAppointmentId,
                systemUserId,
                consortiumUserId
              );

              if (transcriptionStatusAssignmentPendingId) {
                let updTranscriptionStatusNotes;
                await TranscriptionStatusService.updateTranscriptionStatus(
                  savedConsortiumPatientAppointmentId,
                  transcriptionStatusAssignmentPendingId,
                  updTranscriptionStatusNotes,
                  systemUserId,
                  consortiumUserId
                );
              }

              await Promise.all(
                existingDictationRecordingAttachments.map(
                  async (existingDictationRecordingAttachment, attIndex) => {
                    let profilePhotoFilePath =
                      await AppUploadService.copyConsortiumPatientAppointmentDictationAttachment(
                        fetchedConsortium,
                        existingDictationRecordingAttachment
                      );

                    let attFilePathActual,
                      attFilePathThumb,
                      attImageActualUrl,
                      attImageThumbUrl,
                      attFileUrl;
                    if (existingDictationRecordingAttachment.isImage === true) {
                      var compImageFilePath =
                        await AppCommonService.compileUploadedImageFileNamesFromFileName(
                          profilePhotoFilePath
                        );

                      if (compImageFilePath) {
                        attFilePathActual = compImageFilePath.actual;
                        attFilePathThumb = compImageFilePath.thumb;

                        attImageActualUrl =
                          await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(
                            AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT,
                            attFilePathActual,
                            fetchedConsortium
                          ); //
                        attImageThumbUrl =
                          await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(
                            AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT,
                            attFilePathThumb,
                            fetchedConsortium
                          ); //
                      }
                    } else {
                      attFilePath = profilePhotoFilePath;
                      attFileUrl =
                        await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(
                          AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT,
                          attFilePath,
                          fetchedConsortium
                        ); //
                    }

                    const attFileUrlExpiresAt =
                      AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); //

                    let hasDuration = false;
                    if (existingDictationRecordingAttachment.isAudio === true) {
                      hasDuration = true;
                    }

                    var newAttachment = {
                      consortium: fetchedConsortiumId,
                      consortiumPatientAppointment:
                        savedConsortiumPatientAppointmentId,
                      attFilePath: profilePhotoFilePath,
                      attFileName:
                        existingDictationRecordingAttachment.attFileName,
                      isImage: existingDictationRecordingAttachment.isImage,
                      attFileSizeBytes:
                        existingDictationRecordingAttachment.attFileSizeBytes,
                      attFilePathActual: attFilePathActual,
                      attFilePathThumb: attFilePathThumb,
                      isAudio: existingDictationRecordingAttachment.isAudio,
                      hasDuration: hasDuration,
                      attDurationInSeconds: 0,
                      attImageActualUrl: attImageActualUrl,
                      attImageThumbUrl: attImageThumbUrl,
                      attFileUrl: attFileUrl,
                      attFileUrlExpiresAt: attFileUrlExpiresAt,
                    };

                    if (isConsortiumUserRequest === true) {
                      newAttachment.updatedByConsortiumUser = consortiumUserId;
                      newAttachment.createdByConsortiumUser = consortiumUserId;
                    } else {
                      newAttachment.updatedBySystemUser = systemUserId;
                      newAttachment.createdBySystemUser = systemUserId;
                    }

                    let savedConsortiumPatientAppointmentDictationAttachment =
                      await ConsortiumPatientAppointmentDictationAttachmentService.saveConsortiumPatientAppointmentDictationAttachment(
                        newAttachment
                      );
                    // responseObj['attIndex_',attIndex] = savedConsortiumPatientAppointmentDictationAttachment;
                  }
                )
              );

              let transcriptionStatusAssignId =
                await TranscriptionStatusService.findTranscriptionStatusIdByCode(
                  AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED
                );

              if (transcriptionStatusAssignId) {
                let createdBySystemUser =
                  savedConsortiumPatientAppointment.createdBySystemUser;
                let createdByConsortiumUser =
                  savedConsortiumPatientAppointment.createdByConsortiumUser;
                let savedTranscriptionStatusChangeLog =
                  await TranscriptionStatusService.updateTranscriptionStatus(
                    savedConsortiumPatientAppointmentId,
                    transcriptionStatusAssignId,
                    "",
                    createdBySystemUser,
                    createdByConsortiumUser
                  );

                if (savedTranscriptionStatusChangeLog) {
                  const consTodayStartDt = moment().startOf("day").unix();
                  let defaultActivityStatusId =
                    await ActivityStatusService.findDefaultActivityStatusId();
                  let pendingActivityStatusId =
                    await ActivityStatusService.findActivityStatusIdByCode(
                      AppConfigConst.ACTIVITY_STATUS_PENDING_CODE
                    );

                  let transcriptorRoleIdForMT =
                    await TranscriptorRoleService.findTranscriptorRoleIdByRoleCode(
                      AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT
                    );
                  let transcriptorRoleIdForQA =
                    await TranscriptorRoleService.findTranscriptorRoleIdByRoleCode(
                      AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA
                    );

                  if (mongodb.ObjectId.isValid(mtAssignedTo)) {
                    let systemUserDaywiseWorkAllocationForMT =
                      await SystemUserDaywiseWorkAllocationService.createAndFetchSystemUserDaywiseWorkAllocationBySystemUserId(
                        mtAssignedTo,
                        consTodayStartDt
                      );

                    if (systemUserDaywiseWorkAllocationForMT) {
                      let systemUserDaywiseWorkAllocationPatientAppointmentForMT =
                        {
                          systemUserDaywiseWorkAllocation:
                            systemUserDaywiseWorkAllocationForMT._id,
                          consortiumPatientAppointment:
                            savedConsortiumPatientAppointmentId,
                          transcriptorRole: transcriptorRoleIdForMT, // MT
                          activityReceivedAt: currTs,
                          activityReceivedFrom: systemUserId,
                          activityPriority: activityPriority,
                          activityStatus: pendingActivityStatusId,
                          activityDurationInSeconds:
                            totalDicationDurationInSeconds,
                        };

                      let savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT =
                        await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                          systemUserDaywiseWorkAllocationPatientAppointmentForMT
                        );

                      if (
                        savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT
                      ) {
                        await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                          mtAssignedTo,
                          consTodayStartDt
                        );

                        let systemUserDaywiseWorkAllocationLog = {
                          consortiumPatientAppointment:
                            savedConsortiumPatientAppointmentId,
                          actionCode:
                            AppConfigConst.TRANSCRIPTION_LOG_ACTION_ASSIGNED,
                          updTranscriptorRole:
                            savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT.transcriptorRole,
                          updTranscriptionAllocationDate:
                            savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT.activityReceivedAt,
                          systemUserDaywiseWorkAllocationPatientAppointment:
                            savedSystemUserDaywiseWorkAllocationPatientAppointmentForMT._id,
                          createdBy: systemUserId,
                        };

                        await SystemUserDaywiseWorkAllocationService.saveSystemUserDaywiseWorkAllocationLog(
                          systemUserDaywiseWorkAllocationLog
                        );
                      }
                    }
                  }

                  if (mongodb.ObjectId.isValid(qa1AssignedTo)) {
                    let systemUserDaywiseWorkAllocationForQA1 =
                      await SystemUserDaywiseWorkAllocationService.createAndFetchSystemUserDaywiseWorkAllocationBySystemUserId(
                        qa1AssignedTo,
                        consTodayStartDt
                      );

                    if (systemUserDaywiseWorkAllocationForQA1) {
                      let systemUserDaywiseWorkAllocationPatientAppointmentForQA1 =
                        {
                          systemUserDaywiseWorkAllocation:
                            systemUserDaywiseWorkAllocationForQA1._id,
                          consortiumPatientAppointment:
                            savedConsortiumPatientAppointmentId,
                          transcriptorRole: transcriptorRoleIdForQA,
                          activityDurationInSeconds:
                            totalDicationDurationInSeconds,
                          activityPriority: activityPriority,
                          activityStatus: defaultActivityStatusId,
                        };

                      let savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA1 =
                        await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                          systemUserDaywiseWorkAllocationPatientAppointmentForQA1
                        );

                      if (
                        savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA1
                      ) {
                        await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                          qa1AssignedTo,
                          consTodayStartDt
                        );
                      }
                    }
                  }

                  if (mongodb.ObjectId.isValid(qa2AssignedTo)) {
                    let systemUserDaywiseWorkAllocationForQA2 =
                      await SystemUserDaywiseWorkAllocationService.createAndFetchSystemUserDaywiseWorkAllocationBySystemUserId(
                        qa2AssignedTo,
                        consTodayStartDt
                      );

                    if (systemUserDaywiseWorkAllocationForQA2) {
                      let systemUserDaywiseWorkAllocationPatientAppointmentForQA2 =
                        {
                          systemUserDaywiseWorkAllocation:
                            systemUserDaywiseWorkAllocationForQA2._id,
                          consortiumPatientAppointment:
                            savedConsortiumPatientAppointmentId,
                          transcriptorRole: transcriptorRoleIdForQA,
                          activityDurationInSeconds:
                            totalDicationDurationInSeconds,
                          activityPriority: activityPriority,
                          activityStatus: defaultActivityStatusId,
                        };

                      let savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA2 =
                        await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                          systemUserDaywiseWorkAllocationPatientAppointmentForQA2
                        );

                      if (
                        savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA2
                      ) {
                        await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                          qa2AssignedTo,
                          consTodayStartDt
                        );
                      }
                    }
                  }

                  if (mongodb.ObjectId.isValid(qa3AssignedTo)) {
                    let systemUserDaywiseWorkAllocationForQA3 =
                      await SystemUserDaywiseWorkAllocationService.createAndFetchSystemUserDaywiseWorkAllocationBySystemUserId(
                        qa3AssignedTo,
                        consTodayStartDt
                      );

                    if (systemUserDaywiseWorkAllocationForQA3) {
                      let systemUserDaywiseWorkAllocationPatientAppointmentForQA3 =
                        {
                          systemUserDaywiseWorkAllocation:
                            systemUserDaywiseWorkAllocationForQA3._id,
                          consortiumPatientAppointment:
                            savedConsortiumPatientAppointmentId,
                          transcriptorRole: transcriptorRoleIdForQA,
                          activityDurationInSeconds:
                            totalDicationDurationInSeconds,
                          activityPriority: activityPriority,
                          activityStatus: defaultActivityStatusId,
                        };

                      let savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA3 =
                        await SystemUserDaywiseWorkAllocationPatientAppointmentService.saveSystemUserDaywiseWorkAllocationPatientAppointment(
                          systemUserDaywiseWorkAllocationPatientAppointmentForQA3
                        );

                      if (
                        savedSystemUserDaywiseWorkAllocationPatientAppointmentForQA3
                      ) {
                        await SystemUserDaywiseWorkAllocationService.recalculateSystemUserDaywiseWorkAllocation(
                          qa3AssignedTo,
                          consTodayStartDt
                        );
                      }
                    }
                  }
                }
              }
            }
          }

          resStatus = 1;
        } else {
          resStatus = -1;
          resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful ";
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  if (skipSend === true) {
    return responseObj;
  } else {
    return res.status(httpStatus).json(responseObj);
  }
};
