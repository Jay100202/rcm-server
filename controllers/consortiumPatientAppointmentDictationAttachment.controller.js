var ConsortiumPatientAppointmentService = require('../services/consortiumPatientAppointment.service')
var ConsortiumPatientService = require('../services/consortiumPatient.service')
var ConsortiumUserService = require('../services/consortiumUser.service')
var ConsortiumService = require('../services/consortium.service')
var ConsortiumPatientAppointmentDictationAttachmentService = require('../services/consortiumPatientAppointmentDictationAttachment.service')
var ConsortiumLocationService = require('../services/consortiumLocation.service')
var TranscriptionStatusService = require('../services/transcriptionStatus.service')
var AppConfigUploadsModule = require('../appconfig-uploads-module');
var AppUploadService = require('../services/appUpload.service')
var ConsortiumPreliminaryAttachmentService = require('../services/consortiumPreliminaryAttachment.service')
var SystemPreliminaryAttachmentService = require('../services/systemPreliminaryAttachment.service')
var AppointmentStatusService = require('../services/appointmentStatus.service')
var SystemUserService = require('../services/systemUser.service')
var AppCommonService = require('../services/appcommon.service')
var AppDataSanitationService = require('../services/appDataSanitation.service');
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppConfigConst = require('../appconfig-const')
var AppConfigModuleName = require('../appconfig-module-name');
var mongodb = require("mongodb");
var mongoose = require('mongoose');
var moment = require("moment");
var momentTZ = require('moment-timezone');


// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT;
var thisModulename = AppConfigModuleName.MOD_CONSORTIUM_PATIENT_APPOINTMENT;

//------------------------------------------------------ConsortiumPatientAppointmentDictationAttachment-----------------------------------------

exports.saveConsortiumPatientAppointmentDictationAttachment = async function(req, res, next) {
    console.log("Request received:", req.body);

    var consortiumPatientAppointmentId = req.body.consortiumPatientAppointment;
    var dictationRecordingPreliminaryAttachmentIdArr = req.body.dictationRecordingPreliminaryAttachmentIdArr;
    var dictationRecordingAttachmentIdArr = req.body.dictationRecordingAttachmentIdArr;
    
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
    console.log("System User:", systemUser, "System User ID:", systemUserId);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);
    console.log("Consortium User Request:", isConsortiumUserRequest, "Consortium User:", consortiumUser, "Consortium User ID:", consortiumUserId);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
        console.log("Invalid user");
    }
    else if(consortiumPatientAppointmentId && consortiumPatientAppointmentId != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        console.log("User has rights:", hasRights);
        
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
            console.log("Permission denied");
        }
        else
        {
            try
            {
                if(isConsortiumUserRequest === true)
                {   
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                }
                else
                {
                    await AppCommonService.setSystemUserAppAccessed(req);
                }

                var fetchedConsortiumPatientAppointment = await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(req, consortiumPatientAppointmentId,false);
                console.log("Fetched Consortium Patient Appointment:", fetchedConsortiumPatientAppointment);

                if(fetchedConsortiumPatientAppointment)
                {
                    let fetchedIsDictationUploadCompleted = fetchedConsortiumPatientAppointment.isDictationUploadCompleted;
                    console.log("Is Dictation Upload Completed:", fetchedIsDictationUploadCompleted);
                 
                    if(fetchedIsDictationUploadCompleted === true)
                    {
                        resStatus = -1;
                        resMsg = "The dictation attachment of this appointment has already been submitted.";
                        console.log("Dictation attachment already submitted");
                    }
                    else
                    {
                        let fetchedConsortium;
                        let fetchedConsortiumId;
                        if(isConsortiumUserRequest === true)
                        {   
                            fetchedConsortium = await AppCommonService.getConsortiumFromRequest(req);
                            fetchedConsortiumId = fetchedConsortium._id;
                        }
                        else
                        {
                            fetchedConsortium = await ConsortiumService.getConsortiumBaseObjectById(fetchedConsortiumPatientAppointment.consortium,false);
                            fetchedConsortiumId = fetchedConsortium._id;
                        }
                        console.log("Fetched Consortium:", fetchedConsortium);

                        let existingDictationRecordings = await ConsortiumPatientAppointmentDictationAttachmentService.getConsortiumPatientAppointmentDictationAttachmentListByConsortiumPatientAppointmentId(consortiumPatientAppointmentId);
                        console.log("Existing Dictation Recordings:", existingDictationRecordings);

                        if (existingDictationRecordings !== null && existingDictationRecordings.length > 0) {
                            await Promise.all(existingDictationRecordings.map(async (existingDictationRecording, attIndex) => {
                                const attachmentId = existingDictationRecording._id;
                                const attFilePathActual = existingDictationRecording.attFilePathActual;
                                const attFilePathThumb = existingDictationRecording.attFilePathThumb;
                                const attachmentIdIndex = dictationRecordingAttachmentIdArr.indexOf(attachmentId + '');
                                console.log("Processing existing dictation recording:", existingDictationRecording);

                                if(attachmentIdIndex < 0)
                                {
                                    await AppUploadService.removeConsortiumPatientAppointmentAttachment(fetchedConsortium,existingDictationRecording.isImage,attFilePathActual);
                                    if(existingDictationRecording.isImage)
                                    {
                                        await AppUploadService.removeConsortiumPatientAppointmentAttachment(fetchedConsortium,existingDictationRecording.isImage,attFilePathThumb);
                                    }

                                    await ConsortiumPatientAppointmentDictationAttachmentService.removeConsortiumPatientAppointmentDictationAttachment(attachmentId);
                                    console.log("Removed dictation recording:", attachmentId);
                                }
                            }));
                        }

                        if (dictationRecordingPreliminaryAttachmentIdArr !== null && dictationRecordingPreliminaryAttachmentIdArr !== undefined && dictationRecordingPreliminaryAttachmentIdArr.length > 0) {
                            await Promise.all((dictationRecordingPreliminaryAttachmentIdArr).map(async (preliminaryAttachmentId, attIndex) => {
                                if(preliminaryAttachmentId !== '')
                                {
                                    let preliminaryAttachment;
                                    if(isConsortiumUserRequest === true)
                                    {   
                                        preliminaryAttachment = await ConsortiumPreliminaryAttachmentService.findConsortiumPreliminaryAttachmentById(req, preliminaryAttachmentId);
                                    }
                                    else
                                    {
                                        preliminaryAttachment = await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(req, preliminaryAttachmentId);
                                    }
                                    console.log("Processing preliminary attachment:", preliminaryAttachment);

                                    if(preliminaryAttachment)
                                    {
                                        let profilePhotoFilePath = await AppUploadService.moveConsortiumPreliminaryAttachmentToConsortiumPatientAppointmentDictationAttachment(isConsortiumUserRequest,fetchedConsortium,preliminaryAttachment);
                                        let attFilePathActual,attFilePathThumb,attImageActualUrl,attImageThumbUrl,attFileUrl;
                                        if(preliminaryAttachment.isImage === true)
                                        {
                                            var compImageFilePath = await AppCommonService.compileUploadedImageFileNamesFromFileName(profilePhotoFilePath);
                                            if(compImageFilePath)
                                            {
                                                attFilePathActual = compImageFilePath.actual; 
                                                attFilePathThumb = compImageFilePath.thumb;    
                                                attImageActualUrl = await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT,attFilePathActual,fetchedConsortium); //
                                                attImageThumbUrl = await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT,attFilePathThumb,fetchedConsortium); //
                                            }
                                        }
                                        else
                                        {
                                            attFilePath = profilePhotoFilePath;
                                            attFileUrl = await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT,attFilePath,fetchedConsortium); //
                                        }
                                        const attFileUrlExpiresAt = AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); //
                                        let hasDuration = false;
                                        if(preliminaryAttachment.isAudio === true)
                                        {
                                            hasDuration = true;
                                        }
                                        var newAttachment = {
                                            consortium : fetchedConsortiumId,
                                            consortiumPatientAppointment : consortiumPatientAppointmentId,
                                            attFilePath: profilePhotoFilePath,
                                            attFileName: preliminaryAttachment.attFileName,
                                            isImage: preliminaryAttachment.isImage,
                                            attFileSizeBytes: preliminaryAttachment.attFileSizeBytes,
                                            attFilePathActual : attFilePathActual,
                                            attFilePathThumb : attFilePathThumb,
                                            isAudio : preliminaryAttachment.isAudio,
                                            hasDuration : hasDuration,
                                            attDurationInSeconds : preliminaryAttachment.attDurationInSeconds,
                                            attImageActualUrl: attImageActualUrl,
                                            attImageThumbUrl: attImageThumbUrl,
                                            attFileUrl: attFileUrl,
                                            attFileUrlExpiresAt: attFileUrlExpiresAt,
                                        };
                                        if(isConsortiumUserRequest === true)
                                        { 
                                            newAttachment.updatedByConsortiumUser = consortiumUserId;
                                        }
                                        else
                                        {
                                            newAttachment.updatedBySystemUser = systemUserId;
                                        }
                                        let savedConsortiumPatientAppointmentDictationAttachment = await ConsortiumPatientAppointmentDictationAttachmentService.saveConsortiumPatientAppointmentDictationAttachment(newAttachment);
                                        console.log("Saved new attachment:", savedConsortiumPatientAppointmentDictationAttachment);
                                    }
                                }
                            }));
                        }

                        let savedConsortiumPatientAppointment = await ConsortiumPatientAppointmentService.recalculateConsortiumPatientAppointmentDicationAttachmentData(consortiumPatientAppointmentId);
                        console.log("Recalculated Consortium Patient Appointment:", savedConsortiumPatientAppointment);

                        resStatus = 1;
                    }
                }
                else
                {
                    resStatus = -1;
                    resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful ";
                    console.log("Failed to retrieve Consortium Patient Appointment");
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
                console.log("Error:", e);
            }
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
        console.log("Invalid data");
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    console.log("Response:", responseObj);

    return res.status(httpStatus).json(responseObj);
}



exports.loadConsortiumPatientAppointmentDictationAttachments = async function(req, res, next) {
    var consortiumPatientAppointmentId = req.body.consortiumPatientAppointment;
  
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(consortiumPatientAppointmentId && consortiumPatientAppointmentId != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                
                if(isConsortiumUserRequest === true)
                {   
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                }
                else
                {
                    await AppCommonService.setSystemUserAppAccessed(req);
                }


                var fetchedConsortiumPatientAppointment = await ConsortiumPatientAppointmentService.findConsortiumPatientAppointmentById(req, consortiumPatientAppointmentId,false);
                if(fetchedConsortiumPatientAppointment)
                {
                 
                    let fetchedConsortium;
                    let fetchedConsortiumId;
                    if(isConsortiumUserRequest === true)
                    {   
                        fetchedConsortium = await AppCommonService.getConsortiumFromRequest(req);
                        fetchedConsortiumId = fetchedConsortium._id;
                    }
                    else
                    {
                        fetchedConsortium = await ConsortiumService.getConsortiumBaseObjectById(fetchedConsortiumPatientAppointment.consortium,false);
                        fetchedConsortiumId = fetchedConsortium._id;
                    }

                    let existingDictationRecordingAttachments = await ConsortiumPatientAppointmentDictationAttachmentService.findConsortiumPatientAppointmentDictationAttachmentByConsortiumPatientAppointmentId(fetchedConsortium,consortiumPatientAppointmentId);


                    resStatus = 1;
                    responseObj.consortiumPatientAppointment = fetchedConsortiumPatientAppointment;
                    responseObj.dictationRecordingAttachments = existingDictationRecordingAttachments;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationPatientAppointment Retrieval Unsuccesful " + e;
            }
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
}