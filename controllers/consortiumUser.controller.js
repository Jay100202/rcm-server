var ConsortiumUserService = require('../services/consortiumUser.service');
var ConsortiumPatientAppointmentService = require('../services/consortiumPatientAppointment.service');
var ConsortiumChatThreadMessageService = require('../services/consortiumChatThreadMessage.service');
var ConsortiumChatThreadService = require('../services/consortiumChatThread.service');
var SystemUserService = require('../services/systemUser.service');
var AppCommonService = require('../services/appcommon.service');
var ConsortiumService = require('../services/consortium.service');
var AppDataSanitationService = require('../services/appDataSanitation.service');
var SystemPreliminaryAttachmentService = require('../services/systemPreliminaryAttachment.service');
var AppUploadService = require('../services/appUpload.service');
var AppConfigUploadsModule = require('../appconfig-uploads-module');
var AppConfigNotif = require('../appconfig-notif');
var AppConfigModule = require('../appconfig-module');
var AppConfigConst = require('../appconfig-const');
var AppConfigUploads = require('../appconfig-uploads');
var AppConfigAssets = require('../appconfig-assets');
var AppConfig = require('../appconfig');
var AppConfigModuleName = require('../appconfig-module-name');
var AppMailService = require('../services/appMail.service');
var mongodb = require("mongodb");
var mongoose = require('mongoose');
var fs = require('fs');

// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_CONSORTIUM_USER;
var thisModulename = AppConfigModuleName.MOD_CONSORTIUM_USER;

exports.saveConsortiumUser = async function (req, res) {
    var consortiumUserId = req.body.id;
    var userFullName = req.body.userFullName;
    var consortiumId = req.body.consortium;
    var emailOfficial = req.body.emailOfficial;
    var emailPersonal = req.body.emailPersonal;
    var mobileNoOfficial = req.body.mobileNoOfficial;
    var mobileNoPersonal = req.body.mobileNoPersonal;
    var consortiumUserRole = req.body.consortiumUserRole;
    var consortiumUserType = req.body.consortiumUserType;
    var speciality = req.body.speciality;
    var consortiumLocationArr = req.body.consortiumLocationArr;
    var templatePreliminaryAttachmentIdArr = req.body.templatePreliminaryAttachmentIdArr;
    var templateAttachmentIdArr = req.body.templateAttachmentIdArr;
    var samplePreliminaryAttachmentIdArr = req.body.samplePreliminaryAttachmentIdArr;
    var sampleAttachmentIdArr = req.body.sampleAttachmentIdArr;

    if (!consortiumUserId)
        consortiumUserId = '';

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (userFullName !== undefined && userFullName !== "" && consortiumId !== undefined && consortiumId !== "" && emailOfficial !== undefined && emailOfficial !== "") {
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if ((consortiumUserId == "" && !hasAddRights) || (consortiumUserId != "" && !hasEditRights)) {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else {
            try {
                await AppCommonService.setSystemUserAppAccessed(req);

                var existingConsortiumUser = await ConsortiumUserService.findConsortiumUserById(req, consortiumUserId);
                let defaultConsortiumLocationId;
                let existingTemplateAttachments = [];
                let existingSampleAttachments = [];
                if (existingConsortiumUser) {
                    existingTemplateAttachments = existingConsortiumUser.templateAttachments;
                    existingSampleAttachments = existingConsortiumUser.sampleAttachments;

                    let defaultConsortiumLocation = existingConsortiumUser.defaultConsortiumLocation;
                    if (defaultConsortiumLocation) {
                        defaultConsortiumLocationId = defaultConsortiumLocation._id;
                    }
                }

                let consortiumLocationStrArr = [];
                let consortiumLocations = [];
                if (consortiumLocationArr !== undefined && consortiumLocationArr.length > 0) {
                    consortiumLocationArr.forEach(function (consortiumLocation) {
                        if (mongodb.ObjectId.isValid(consortiumLocation)) {
                            consortiumLocations.push(consortiumLocation);
                            consortiumLocationStrArr.push(consortiumLocation + '');
                        }
                    });
                }



                var consortiumUser = {
                    userFullName: userFullName,
                    consortium: consortiumId,
                    emailOfficial: emailOfficial,
                    emailPersonal: emailPersonal,
                    mobileNoOfficial: mobileNoOfficial,
                    mobileNoPersonal: mobileNoPersonal,
                    consortiumUserRole: consortiumUserRole,
                    consortiumUserType: consortiumUserType,
                    speciality: speciality,
                    consortiumLocations: consortiumLocations,
                    updatedBy: systemUserId
                };

                let password = AppCommonService.generatedSystemUserPassword();

                if (consortiumUserId == "") {
                    consortiumUser.password = password;
                    consortiumUser.createdBy = systemUserId;
                    consortiumUser.isDeleted = 0;
                }
                else {
                    consortiumUser.id = consortiumUserId;
                }


                let isConsortiumUserRequest = false;
                let fetchedConsortium = await ConsortiumService.getConsortiumBaseObjectById(consortiumId, false);

                let templateAttachments = [];
                if (existingTemplateAttachments !== null && existingTemplateAttachments.length > 0) {

                    await Promise.all(existingTemplateAttachments.map(async (existingTemplateAttachment, attIndex) => {

                        const attachmentId = existingTemplateAttachment._id;
                        const attFilePathActual = existingTemplateAttachment.attFilePathActual;
                        const attFilePathThumb = existingTemplateAttachment.attFilePathThumb;
                        const attachmentIdIndex = templateAttachmentIdArr.indexOf(attachmentId + '');

                        if (attachmentIdIndex < 0) {
                            await AppUploadService.removeConsortiumUserAttachment(fetchedConsortium, existingTemplateAttachment.isImage, attFilePathActual);
                            if (existingTemplateAttachment.isImage) {
                                await AppUploadService.removeConsortiumUserAttachment(fetchedConsortium, existingTemplateAttachment.isImage, attFilePathThumb);
                            }
                        }
                        else {
                            templateAttachments.push(existingTemplateAttachment);
                        }
                    }));
                }

                if (templatePreliminaryAttachmentIdArr !== null && templatePreliminaryAttachmentIdArr.length > 0) {
                    await Promise.all((templatePreliminaryAttachmentIdArr).map(async (preliminaryAttachmentId, attIndex) => {

                        if (preliminaryAttachmentId !== '') {
                            const preliminaryAttachment = await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(req, preliminaryAttachmentId);

                            if (preliminaryAttachment) {
                                let profilePhotoFilePath = await AppUploadService.moveConsortiumPreliminaryAttachmentToConsortiumUserAttachment(isConsortiumUserRequest, fetchedConsortium, preliminaryAttachment);

                                let attFilePathActual, attFilePathThumb, attImageActualUrl, attImageThumbUrl, attFileUrl;
                                if (preliminaryAttachment.isImage === true) {
                                    var compImageFilePath = await AppCommonService.compileUploadedImageFileNamesFromFileName(profilePhotoFilePath);

                                    if (compImageFilePath) {
                                        attFilePathActual = compImageFilePath.actual;
                                        attFilePathThumb = compImageFilePath.thumb;

                                        attImageActualUrl = await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_USER, attFilePathActual, fetchedConsortium); //
                                        attImageThumbUrl = await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_USER, attFilePathThumb, fetchedConsortium); //

                                    }
                                }
                                else {
                                    attFilePath = profilePhotoFilePath;
                                    attFileUrl = await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_USER, attFilePath, fetchedConsortium); //
                                }

                                const attFileUrlExpiresAt = AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); //

                                var newAttachment = {
                                    attFilePath: profilePhotoFilePath,
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

                                templateAttachments.push(newAttachment);
                            }
                        }

                    }));
                }

                consortiumUser.templateAttachments = templateAttachments;


                let sampleAttachments = [];
                if (existingSampleAttachments !== null && existingSampleAttachments.length > 0) {

                    await Promise.all(existingSampleAttachments.map(async (existingSampleAttachment, attIndex) => {

                        const attachmentId = existingSampleAttachment._id;
                        const attFilePathActual = existingSampleAttachment.attFilePathActual;
                        const attFilePathThumb = existingSampleAttachment.attFilePathThumb;
                        const attachmentIdIndex = sampleAttachmentIdArr.indexOf(attachmentId + '');

                        if (attachmentIdIndex < 0) {
                            await AppUploadService.removeConsortiumUserAttachment(fetchedConsortium, existingSampleAttachment.isImage, attFilePathActual);
                            if (existingSampleAttachment.isImage) {
                                await AppUploadService.removeConsortiumUserAttachment(fetchedConsortium, existingSampleAttachment.isImage, attFilePathThumb);
                            }
                        }
                        else {
                            sampleAttachments.push(existingSampleAttachment);
                        }
                    }));
                }

                if (samplePreliminaryAttachmentIdArr !== null && samplePreliminaryAttachmentIdArr.length > 0) {
                    await Promise.all((samplePreliminaryAttachmentIdArr).map(async (preliminaryAttachmentId, attIndex) => {

                        if (preliminaryAttachmentId !== '') {
                            const preliminaryAttachment = await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(req, preliminaryAttachmentId);

                            if (preliminaryAttachment) {
                                let profilePhotoFilePath = await AppUploadService.moveConsortiumPreliminaryAttachmentToConsortiumUserAttachment(isConsortiumUserRequest, fetchedConsortium, preliminaryAttachment);

                                let attFilePathActual, attFilePathThumb, attImageActualUrl, attImageThumbUrl, attFileUrl;
                                if (preliminaryAttachment.isImage === true) {
                                    var compImageFilePath = await AppCommonService.compileUploadedImageFileNamesFromFileName(profilePhotoFilePath);

                                    if (compImageFilePath) {
                                        attFilePathActual = compImageFilePath.actual;
                                        attFilePathThumb = compImageFilePath.thumb;

                                        attImageActualUrl = await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_USER, attFilePathActual, fetchedConsortium); //
                                        attImageThumbUrl = await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_USER, attFilePathThumb, fetchedConsortium); //

                                    }
                                }
                                else {
                                    attFilePath = profilePhotoFilePath;
                                    attFileUrl = await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_USER, attFilePath, fetchedConsortium); //
                                }

                                const attFileUrlExpiresAt = AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); //

                                var newAttachment = {
                                    attFilePath: profilePhotoFilePath,
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

                                sampleAttachments.push(newAttachment);
                            }
                        }

                    }));
                }

                consortiumUser.sampleAttachments = sampleAttachments;

                if (consortiumLocationStrArr.length > 0 && defaultConsortiumLocationId !== undefined && defaultConsortiumLocationId !== '') {
                    const consortiumLocationIdIndex = consortiumLocationStrArr.indexOf(defaultConsortiumLocationId + '');
                    if (consortiumLocationIdIndex < 0) {
                        consortiumUser.defaultConsortiumLocation = null;
                    }
                }


                let savedConsortiumUser = await ConsortiumUserService.saveConsortiumUser(consortiumUser);

                if (savedConsortiumUser) {
                    let savedConsortiumUserId = savedConsortiumUser._id;
                    let isAdd = savedConsortiumUser.isAdd;
                    if (isAdd === true) {
                        let fetchedConsortiumId = savedConsortiumUser.consortium;
                        await ConsortiumChatThreadMessageService.saveConsortiumChatThreadUserMetricForConsortiumUser(fetchedConsortiumId, savedConsortiumUserId);

                        await AppMailService.sendConsortiumUserCredentialsMail(savedConsortiumUserId, password);
                    }

                    responseObj.savedConsortiumUserId = savedConsortiumUserId;
                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);
                } else {
                    resStatus = -1;
                }


            }
            catch (e) {
                resStatus = -1;
                resMsg = "OrganizationUser Retrieval Unsuccesful " + e;
            }
        }
    }
    else {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
}

exports.getConsortiumUserDetails = async function (req, res, next) {
    var id = req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (id && id != "") {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        if (!hasRights) {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else {
            try {
                await AppCommonService.setSystemUserAppAccessed(req);

                await AppUploadService.checkAndGenerateModuleMultipleAttachmentExpiredSignedFileUrl(AppConfigUploadsModule.MOD_CONSORTIUM_USER, id);

                var fetchedConsortiumUser = await ConsortiumUserService.findConsortiumUserById(req, id);
                if (fetchedConsortiumUser) {
                    resStatus = 1;
                    responseObj.consortiumUser = fetchedConsortiumUser;
                }
                else {
                    resStatus = -1;
                    resMsg = "OrganizationUser Retrieval Unsuccesful ";
                }
            }
            catch (e) {
                resStatus = -1;
                resMsg = "OrganizationUser Retrieval Unsuccesful " + e;
            }
        }
    }
    else {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
}

exports.getConsortiumUsers = async function (req, res, next) {
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let consortiumUserData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if (!systemUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        if (!hasRights) {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else {
            try {
                await AppCommonService.setSystemUserAppAccessed(req);

                let consortiumUsersList = await ConsortiumUserService.getConsortiumUsers(req);

                resStatus = 1;
                if (consortiumUsersList != null) {
                    consortiumUserData = consortiumUsersList.results;
                    totalRecords = consortiumUsersList.totalRecords;
                    filteredRecords = consortiumUsersList.filteredRecords;
                }
            }
            catch (e) {
                resStatus = -1;
                resMsg = "OrganizationUsersList could not be fetched" + e;
            }
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = consortiumUserData;

    return res.status(httpStatus).json(responseObj)
}

exports.selectConsortiumUserList = async function (req, res, next) {
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive * 1 : 1;
    var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;

    let totalRecords = 0;
    let consortiumUserData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if (!systemUser && !consortiumUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else {
        try {

            await AppCommonService.setSystemUserAppAccessed(req);

            let consortiumUserList = await ConsortiumUserService.getConsortiumUsersForSelect(req);
            resStatus = 1;
            if (consortiumUserList != null) {
                totalRecords = consortiumUserList.length;
                consortiumUserData = consortiumUserList;

                if (forFilter) {
                    let consortiumUserObj = {};
                    consortiumUserObj.id = "";
                    consortiumUserObj.text = "All ConsortiumUsers";

                    consortiumUserData.unshift(consortiumUserObj);
                }
            }
        }
        catch (e) {
            resStatus = -1;
            resMsg = "OrganizationUsers could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = consortiumUserData;

    return res.status(httpStatus).json(responseObj)
}

exports.changeConsortiumUserStatus = async function (req, res, next) {
    var id = req.body._id;
    var isActive = req.body.isActive;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (id != "") {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if (!hasRights) {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else {
            try {
                await AppCommonService.setSystemUserAppAccessed(req);


                var consortiumUser = {
                    id,
                    isActive: isActive,
                    updatedBy: systemUserId
                }

                let savedConsortiumUser = await ConsortiumUserService.saveConsortiumUser(consortiumUser);

                resStatus = 1;
                resMsg = AppCommonService.getStatusChangedMessage();
            }
            catch (e) {
                resStatus = -1;
                resMsg = "OrganizationUser Status Change Unsuccesful" + e;
            }
        }
    }
    else {
        resStatus = -1;
        resMsg = "Invalid Data";
    }

    return res.status(httpStatus).json({ status: resStatus, message: resMsg });
}

exports.checkConsortiumUserEmailValidity = async function (req, res, next) {
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var emailOfficial = req.body.emailOfficial;
    var consortium = req.body.consortium;
    var id = req.body._id;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if (!systemUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (emailOfficial !== undefined && emailOfficial != "" && consortium !== undefined && emailOfficiaconsortiuml != "") {
        try {
            await AppCommonService.setSystemUserAppAccessed(req);

            let consortiumUser = await ConsortiumUserService.checkConsortiumUserEmailForDuplication(id, emailOfficial, consortium);
            if (consortiumUser) {
                resStatus = -1;
                resMsg = 'Organization User with the email already exists';
            }
            else {
                resStatus = 1;
            }
        }
        catch (e) {
            resStatus = -1;
            resMsg = "OrganizationUser could not be fetched" + e;
        }
    }
    else {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj)
}

exports.checkCanBeDeleted = async function (req, res, next) {
    var id = req.body._id;

    var skipSend = AppCommonService.getSkipSendResponseValue(req);

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if (!systemUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (id && id != "") {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_DELETE);
        if (!hasRights) {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else {
            try {
                await AppCommonService.setSystemUserAppAccessed(req);

                // let systemUser = await SystemUserService.checkIfSystemUserUsesConsortiumUser(id);
                // if(systemUser)
                // {
                // resStatus = -1;
                // resMsg = 'This ConsortiumUser is associated with super user';
                // }
                // else
                // {
                resStatus = 1;
                // }

            }
            catch (e) {
                resStatus = -1;
                resMsg = "OrganizationUser Status Change Unsuccesful" + e;
            }
        }
    }
    else {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    if (skipSend === true) {
        return responseObj;
    }
    else {
        return res.status(httpStatus).json(responseObj);
    }
}

exports.removeConsortiumUser = async function (req, res, next) {

    var id = req.params.id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (id != "") {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_DELETE);
        if (!hasRights) {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else {
            try {
                await AppCommonService.setSystemUserAppAccessed(req);

                const compiledReq = AppCommonService.compileRequestWithSkipSendResponse(req);
                compiledReq.body._id = id;
                const canBeDeletedResponse = await exports.checkCanBeDeleted(compiledReq, res, next);
                if (canBeDeletedResponse) {
                    if (canBeDeletedResponse.status > 0) {

                        var consortiumUser = {
                            id,
                            isDeleted: 1,
                            updatedBy: systemUserId
                        }

                        let savedConsortiumUser = await ConsortiumUserService.saveConsortiumUser(consortiumUser);

                        resStatus = 1;
                        resMsg = AppCommonService.getDeletedMessage(thisModulename);
                    }
                    else {
                        resStatus = canBeDeletedResponse.status;
                        resMsg = canBeDeletedResponse.message;
                    }
                }
                else {
                    resStatus = -1;
                    resMsg = AppConfigNotif.SERVER_ERROR;
                }

            }
            catch (e) {
                resStatus = -1;
                resMsg = "OrganizationUser Deletion Unsuccesful" + e;
            }
        }
    }
    else {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    return res.status(httpStatus).json({ status: resStatus, message: resMsg });
}


exports.selectConsortiumUserListForAppointment = async function (req, res, next) {
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    let hasAppointmentCount = req.body.hasAppointmentCount;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive * 1 : 1;

    let totalRecords = 0;
    let consortiumUserData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if (!systemUser && !consortiumUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else {
        try {

            await AppCommonService.setSystemUserAppAccessed(req);

            req.body.forAppointment = true;
            let consortiumUserList = await ConsortiumUserService.getConsortiumUsersForSelect(req);
            resStatus = 1;
            if (consortiumUserList != null) {
                consortiumUserData = consortiumUserList;

                if (hasAppointmentCount !== undefined && hasAppointmentCount === true) {
                    if (consortiumUserList !== undefined && consortiumUserList.length > 0) {
                        await Promise.all(consortiumUserList.map(async (consortiumUser, usrIndex) => {
                            var consUserIdArr = [consortiumUser.id];
                            let appointmentCount = await ConsortiumPatientAppointmentService.getConsortiumPatientAppointmentSummaryForDate(req, startDate, endDate, consUserIdArr);
                            consortiumUser.appointmentMetrics = appointmentCount;
                            consortiumUserData[usrIndex] = consortiumUser;
                        }));
                    }
                }


                totalRecords = consortiumUserList.length;
            }
        }
        catch (e) {
            resStatus = -1;
            resMsg = "OrganizationUsers could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = consortiumUserData;

    return res.status(httpStatus).json(responseObj)
}


exports.sendConsortiumUserCredentials = async function (req, res, next) {
    var id = req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if (!systemUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (id && id != "") {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        if (!hasRights) {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else {
            try {
                await AppCommonService.setSystemUserAppAccessed(req);

                var fetchedConsortiumUser = await ConsortiumUserService.findConsortiumUserById(req, id);
                if (fetchedConsortiumUser) {
                    resStatus = 1;
                    resMsg = "Credentials mailed successfully";

                    let password = AppCommonService.generatedSystemUserPassword();

                    var user = {
                        id: fetchedConsortiumUser._id,
                        password: password,
                        updatedBy: systemUserId
                    };
                    let savedConsortiumUser = await ConsortiumUserService.saveConsortiumUser(user);
                    await AppMailService.sendConsortiumUserCredentialsMail(fetchedConsortiumUser._id, password);
                }
                else {
                    resStatus = -1;
                    resMsg = "OrganizationUser Retrieval Unsuccesful ";
                }
            }
            catch (e) {
                resStatus = -1;
                resMsg = "OrganizationUser Retrieval Unsuccesful " + e;
            }
        }
    }
    else {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
}

exports.loadConsortiumUserLocationList = async function (req, res, next) {
    var id = req.body._id;
    var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let consortiumLocations = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);


    if (isConsortiumUserRequest === false) {
        consortiumUserId = id;
    }

    if (!systemUser && !consortiumUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (consortiumUserId && consortiumUserId != "") {

        var hasRights = false;
        if (isConsortiumUserRequest === true) {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        else {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }

        if (!hasRights) {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else {
            try {
                if (isConsortiumUserRequest === true) {
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                }
                else {
                    await AppCommonService.setSystemUserAppAccessed(req);
                }

                var fetchedConsortiumUser = await ConsortiumUserService.findConsortiumUserById(req, consortiumUserId);
                if (fetchedConsortiumUser) {
                    consortiumLocations = fetchedConsortiumUser.consortiumLocations;

                    let compliedConsortiumLocations = [];
                    if (consortiumLocations.length > 0) {
                        consortiumLocations.forEach(function (consortiumLocation) {
                            let id = consortiumLocation._id;
                            let text = consortiumLocation.locationName;
                            let isActive = consortiumLocation.isActive;

                            if (isActive > 0) {
                                compliedConsortiumLocations.push({
                                    id: id,
                                    text: text,
                                    timeZoneOption: consortiumLocation.timeZoneOption,
                                });
                            }

                        });
                    }

                    consortiumLocations = compliedConsortiumLocations;

                    if (forFilter) {
                        let consortiumLocationObj = {};
                        consortiumLocationObj.id = "";
                        consortiumLocationObj.text = "All ConsortiumLocations";

                        consortiumLocations.unshift(consortiumLocationObj);
                    }

                    resStatus = 1;

                }
                else {
                    resStatus = -1;
                    resMsg = "OrganizationUser Retrieval Unsuccesful ";
                }
            }
            catch (e) {
                resStatus = -1;
                resMsg = "OrganizationUser Retrieval Unsuccesful " + e;
            }
        }
    }
    else {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = consortiumLocations.length;
    responseObj.results = consortiumLocations;

    return res.status(httpStatus).json(responseObj);
}

exports.saveMultipleConsortiumUserTemplateAttachments = async function (req, res) {
    var consortiumUserId = req.body.consortiumUserId;
    var templatePreliminaryAttachmentIdArr = req.body.templatePreliminaryAttachmentIdArr;

    if (!consortiumUserId)
    consortiumUserId = '';

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
    var consortiumId = await AppCommonService.getConsortiumIdFromRequest(req);

    if (!systemUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (consortiumUserId && consortiumUserId !== undefined && consortiumUserId !== "" && Array.isArray(templatePreliminaryAttachmentIdArr) && templatePreliminaryAttachmentIdArr.length > 0) {
       
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if (!hasEditRights) {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else {
            try {
                await AppCommonService.setSystemUserAppAccessed(req);

                var existingConsortiumUser = await ConsortiumUserService.findConsortiumUserById(req, consortiumUserId);
                if (existingConsortiumUser) {

                    var templateAttachments = existingConsortiumUser.templateAttachments;

                    if(!Array.isArray(templateAttachments))
                    {
                        templateAttachments = [];
                    }

                    let isConsortiumUserRequest = false;
                    let fetchedConsortium = await ConsortiumService.getConsortiumBaseObjectById(consortiumId, false);                    

                    if (templatePreliminaryAttachmentIdArr !== null && templatePreliminaryAttachmentIdArr.length > 0) {
                        await Promise.all((templatePreliminaryAttachmentIdArr).map(async (preliminaryAttachmentId, attIndex) => {

                            if (preliminaryAttachmentId !== '') {
                                const preliminaryAttachment = await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(req, preliminaryAttachmentId);

                                if (preliminaryAttachment) {
                                    let profilePhotoFilePath = await AppUploadService.moveConsortiumPreliminaryAttachmentToConsortiumUserAttachment(isConsortiumUserRequest, fetchedConsortium, preliminaryAttachment);

                                    let attFilePathActual, attFilePathThumb, attImageActualUrl, attImageThumbUrl, attFileUrl;
                                    if (preliminaryAttachment.isImage === true) {
                                        var compImageFilePath = await AppCommonService.compileUploadedImageFileNamesFromFileName(profilePhotoFilePath);

                                        if (compImageFilePath) {
                                            attFilePathActual = compImageFilePath.actual;
                                            attFilePathThumb = compImageFilePath.thumb;

                                            attImageActualUrl = await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_USER, attFilePathActual, fetchedConsortium); //
                                            attImageThumbUrl = await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_USER, attFilePathThumb, fetchedConsortium); //

                                        }
                                    }
                                    else {
                                        attFilePath = profilePhotoFilePath;
                                        attFileUrl = await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_USER, attFilePath, fetchedConsortium); //
                                    }

                                    const attFileUrlExpiresAt = AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); //

                                    var newAttachment = {
                                        attFilePath: profilePhotoFilePath,
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

                                    templateAttachments.push(newAttachment);
                                }
                            }

                        }));
                    }

                    var updConsortiumUser = {
                        id: consortiumUserId,
                        templateAttachments: templateAttachments
                    };

                    let savedConsortiumUser = await ConsortiumUserService.saveConsortiumUser(updConsortiumUser);
    
                    if (savedConsortiumUser) {                        
                        resStatus = 1;
                        resMsg = AppCommonService.getSavedMessage(thisModulename);
                    } else {
                        resStatus = -1;
                        resMsg = AppConfigNotif.INVALID_DATA;
                    }
                }
                else {
                    resStatus = -1;
                    resMsg = AppConfigNotif.INVALID_DATA;
                }

            }
            catch (e) {
                resStatus = -1;
                resMsg = "OrganizationUser Retrieval Unsuccesful " + e;
            }
        }
    }
    else {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
}

exports.saveMultipleConsortiumUserSampleAttachments = async function (req, res) {
    var consortiumUserId = req.body.consortiumUserId;
    var samplePreliminaryAttachmentIdArr = req.body.samplePreliminaryAttachmentIdArr;

    if (!consortiumUserId)
    consortiumUserId = '';

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
    var consortiumId = await AppCommonService.getConsortiumIdFromRequest(req);

    if (!systemUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (consortiumUserId && consortiumUserId !== undefined && consortiumUserId !== "" && Array.isArray(samplePreliminaryAttachmentIdArr) && samplePreliminaryAttachmentIdArr.length > 0) {
        
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if (!hasEditRights) {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else {
            try {
                await AppCommonService.setSystemUserAppAccessed(req);

                var existingConsortiumUser = await ConsortiumUserService.findConsortiumUserById(req, consortiumUserId);
                if (existingConsortiumUser) {

                    var sampleAttachments = existingConsortiumUser.sampleAttachments;

                    if(!Array.isArray(sampleAttachments))
                    {
                        sampleAttachments = [];
                    }

                    let isConsortiumUserRequest = false;
                    let fetchedConsortium = await ConsortiumService.getConsortiumBaseObjectById(consortiumId, false);                    

                    if (samplePreliminaryAttachmentIdArr !== null && samplePreliminaryAttachmentIdArr.length > 0) {
                        await Promise.all((samplePreliminaryAttachmentIdArr).map(async (preliminaryAttachmentId, attIndex) => {

                            if (preliminaryAttachmentId !== '') {
                                const preliminaryAttachment = await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(req, preliminaryAttachmentId);

                                if (preliminaryAttachment) {
                                    let profilePhotoFilePath = await AppUploadService.moveConsortiumPreliminaryAttachmentToConsortiumUserAttachment(isConsortiumUserRequest, fetchedConsortium, preliminaryAttachment);

                                    let attFilePathActual, attFilePathThumb, attImageActualUrl, attImageThumbUrl, attFileUrl;
                                    if (preliminaryAttachment.isImage === true) {
                                        var compImageFilePath = await AppCommonService.compileUploadedImageFileNamesFromFileName(profilePhotoFilePath);

                                        if (compImageFilePath) {
                                            attFilePathActual = compImageFilePath.actual;
                                            attFilePathThumb = compImageFilePath.thumb;

                                            attImageActualUrl = await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_USER, attFilePathActual, fetchedConsortium); //
                                            attImageThumbUrl = await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_USER, attFilePathThumb, fetchedConsortium); //

                                        }
                                    }
                                    else {
                                        attFilePath = profilePhotoFilePath;
                                        attFileUrl = await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_USER, attFilePath, fetchedConsortium); //
                                    }

                                    const attFileUrlExpiresAt = AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); //

                                    var newAttachment = {
                                        attFilePath: profilePhotoFilePath,
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

                                    sampleAttachments.push(newAttachment);
                                }
                            }

                        }));
                    }

                    var updConsortiumUser = {
                        id: consortiumUserId,
                        sampleAttachments: sampleAttachments
                    };

                    let savedConsortiumUser = await ConsortiumUserService.saveConsortiumUser(updConsortiumUser);
    
                    if (savedConsortiumUser) {                        
                        resStatus = 1;
                        resMsg = AppCommonService.getSavedMessage(thisModulename);
                    } else {
                        resStatus = -1;
                        resMsg = AppConfigNotif.INVALID_DATA;
                    }
                }
                else {
                    resStatus = -1;
                    resMsg = AppConfigNotif.INVALID_DATA;
                }

            }
            catch (e) {
                resStatus = -1;
                resMsg = "OrganizationUser Retrieval Unsuccesful " + e;
            }
        }
    }
    else {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
}

exports.generateAndDownloadCompressedConsortiumUserTemplateAttachments = async function (req, res) {
    var consortiumUserId = req.body.consortiumUserId;

    if (!consortiumUserId)
    consortiumUserId = '';

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};
    var responseLogsObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
    var consortiumId = await AppCommonService.getConsortiumIdFromRequest(req);

    if (!systemUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (consortiumUserId && consortiumUserId !== undefined && consortiumUserId !== "") {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        if (!hasRights) {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else {
            try {
                await AppCommonService.setSystemUserAppAccessed(req);

                await AppUploadService.checkAndGenerateModuleMultipleAttachmentExpiredSignedFileUrl(AppConfigUploadsModule.MOD_CONSORTIUM_USER, consortiumUserId);

                var existingConsortiumUser = await ConsortiumUserService.findConsortiumUserById(req, consortiumUserId);
                if (existingConsortiumUser) {

                    var templateAttachments = existingConsortiumUser.templateAttachments;
                    
                    if(Array.isArray(templateAttachments) && templateAttachments.length > 0)
                    {
                        var consConsortium = existingConsortiumUser.consortium;
                        responseLogsObj.consConsortium = consConsortium;

                        if(consConsortium && consConsortium.isActive === 1 && consConsortium.isDeleted === 0)
                        {
                            var consortiumName = consConsortium.consortiumName;
                            var consortiumUserFullName = existingConsortiumUser.userFullName;

                            const tempLocalFileBasePath = AppConfigAssets.TEMP_UPLOADS_CONSORTIUM_USER_TEMPLATE_BULK_DOWNLOAD_BASE_PATH;
                            const tempLocalFileUrlFolderPath = AppConfigAssets.TEMP_UPLOADS_CONSORTIUM_USER_TEMPLATE_BULK_DOWNLOADABLE_URL_FOLDER_PATH;
                            const templateAttachmentBaseFolderPath = AppUploadService.getConsortiumUserAttachmentFolderBasePath(consConsortium) + AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
                            const currTs = AppCommonService.getCurrentTimestamp();
    
                            const zipForName = "Templates";
                            const zipFileExtension = ".zip";

                            var zipFileNameOnly = consortiumName + "_" + consortiumUserFullName + "_" + zipForName;//currTs;
                            zipFileNameOnly = zipFileNameOnly.replace(/[^a-zA-Z0-9-_]/g, '');

                            const zipFileNameForDownload = zipFileNameOnly + zipFileExtension;

                            const localZipFileName = zipFileNameOnly;
                            const localZipFilePath = tempLocalFileBasePath + localZipFileName;

                            const localZipFilePathWExtension = localZipFilePath + zipFileExtension;
                            const localZipFileNameWExtension = localZipFileName + zipFileExtension;                          
        
                            const toBeZippedAttachmentObjArr = [];
                            await Promise.all(templateAttachments.map(async (templateAttachment, attIndex) => {
        
                                var templateAttachmentFileName = templateAttachment.attFileName;
                                var templateAttachmentFilePath = templateAttachment.isImage === true ? templateAttachment.attFilePathActual : templateAttachment.attFilePath;
        
                                toBeZippedAttachmentObjArr[attIndex] = {
                                    attFileName: templateAttachmentFileName,
                                    attFilePath: templateAttachmentFilePath,
                                    baseFolder: templateAttachmentBaseFolderPath
                                };
                            }));
        
                            responseLogsObj.localZipFilePath = localZipFilePath;
                            responseLogsObj.toBeZippedAttachmentObjArr = toBeZippedAttachmentObjArr;
        
                            var zipCreationResponseLogs = await AppUploadService.createLocalZipWithCloudUploadedFiles(localZipFilePath, toBeZippedAttachmentObjArr);   
        
                            responseLogsObj.zipCreationResponseLogs = zipCreationResponseLogs;
    
                            // let zippedFileContent = await AppUploadService.getFileContentStringAsBase64FromLocalFilePath(localZipFilePathWExtension);
                        
                            // fs.unlink(localZipFilePathWExtension, function(err) {
                            //     if (err) throw err;
                            // });

                            const zippedFileUrlForDownload = AppConfig.SERVER_APP_URL + tempLocalFileUrlFolderPath + localZipFileNameWExtension;

                            resStatus = 1;
                            responseObj.fileName = zipFileNameForDownload;
                            // responseObj.fileContent = zippedFileContent;
                            responseObj.fileUrl = zippedFileUrlForDownload;
                        }
                        else {
                            resStatus = -1;
                            resMsg = AppConfigNotif.INVALID_DATA;
                        }

                    } 
                    else {
                        resStatus = -1;
                        resMsg = "No Template Attachment(s) Found";
                    }         
                }
                else {
                    resStatus = -1;
                    resMsg = AppConfigNotif.INVALID_DATA;
                }

            }
            catch (e) {
                resStatus = -1;
                resMsg = "OrganizationUser Retrieval Unsuccesful " + e;
            }
        }
    }
    else {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    // responseObj.responseLogsObj = responseLogsObj;
    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);

}

exports.generateAndDownloadCompressedConsortiumUserSampleAttachments = async function (req, res) {
    var consortiumUserId = req.body.consortiumUserId;

    if (!consortiumUserId)
    consortiumUserId = '';

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};
    var responseLogsObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
    var consortiumId = await AppCommonService.getConsortiumIdFromRequest(req);

    if (!systemUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (consortiumUserId && consortiumUserId !== undefined && consortiumUserId !== "") {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        if (!hasRights) {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else {
            try {
                await AppCommonService.setSystemUserAppAccessed(req);

                await AppUploadService.checkAndGenerateModuleMultipleAttachmentExpiredSignedFileUrl(AppConfigUploadsModule.MOD_CONSORTIUM_USER, consortiumUserId);

                var existingConsortiumUser = await ConsortiumUserService.findConsortiumUserById(req, consortiumUserId);
                if (existingConsortiumUser) {

                    var sampleAttachments = existingConsortiumUser.sampleAttachments;
                    
                    if(Array.isArray(sampleAttachments) && sampleAttachments.length > 0)
                    {
                        var consConsortium = existingConsortiumUser.consortium;
                        responseLogsObj.consConsortium = consConsortium;

                        if(consConsortium && consConsortium.isActive === 1 && consConsortium.isDeleted === 0)
                        {
                            var consortiumName = consConsortium.consortiumName;
                            var consortiumUserFullName = existingConsortiumUser.userFullName;

                            const tempLocalFileBasePath = AppConfigAssets.TEMP_UPLOADS_CONSORTIUM_USER_TEMPLATE_BULK_DOWNLOAD_BASE_PATH;
                            const tempLocalFileUrlFolderPath = AppConfigAssets.TEMP_UPLOADS_CONSORTIUM_USER_TEMPLATE_BULK_DOWNLOADABLE_URL_FOLDER_PATH;
                            const sampleAttachmentBaseFolderPath = AppUploadService.getConsortiumUserAttachmentFolderBasePath(consConsortium) + AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
                            const currTs = AppCommonService.getCurrentTimestamp();
    
                            const zipForName = "Samples";
                            const zipFileExtension = ".zip";

                            var zipFileNameOnly = consortiumName + "_" + consortiumUserFullName + "_" + zipForName;//currTs;
                            zipFileNameOnly = zipFileNameOnly.replace(/[^a-zA-Z0-9-_]/g, '');

                            const zipFileNameForDownload = zipFileNameOnly + zipFileExtension;

                            const localZipFileName = zipFileNameOnly;
                            const localZipFilePath = tempLocalFileBasePath + localZipFileName;

                            const localZipFilePathWExtension = localZipFilePath + zipFileExtension;
                            const localZipFileNameWExtension = localZipFileName + zipFileExtension;                          
        
                            const toBeZippedAttachmentObjArr = [];
                            await Promise.all(sampleAttachments.map(async (sampleAttachment, attIndex) => {
        
                                var sampleAttachmentFileName = sampleAttachment.attFileName;
                                var sampleAttachmentFilePath = sampleAttachment.isImage === true ? sampleAttachment.attFilePathActual : sampleAttachment.attFilePath;
        
                                toBeZippedAttachmentObjArr[attIndex] = {
                                    attFileName: sampleAttachmentFileName,
                                    attFilePath: sampleAttachmentFilePath,
                                    baseFolder: sampleAttachmentBaseFolderPath
                                };
                            }));
        
                            responseLogsObj.localZipFilePath = localZipFilePath;
                            responseLogsObj.toBeZippedAttachmentObjArr = toBeZippedAttachmentObjArr;
        
                            var zipCreationResponseLogs = await AppUploadService.createLocalZipWithCloudUploadedFiles(localZipFilePath, toBeZippedAttachmentObjArr);   
        
                            responseLogsObj.zipCreationResponseLogs = zipCreationResponseLogs;
    
                            // let zippedFileContent = await AppUploadService.getFileContentStringAsBase64FromLocalFilePath(localZipFilePathWExtension);
                        
                            // fs.unlink(localZipFilePathWExtension, function(err) {
                            //     if (err) throw err;
                            // });

                            const zippedFileUrlForDownload = AppConfig.SERVER_APP_URL + tempLocalFileUrlFolderPath + localZipFileNameWExtension;

                            resStatus = 1;
                            responseObj.fileName = zipFileNameForDownload;
                            // responseObj.fileContent = zippedFileContent;
                            responseObj.fileUrl = zippedFileUrlForDownload;
                        }
                        else {
                            resStatus = -1;
                            resMsg = AppConfigNotif.INVALID_DATA;
                        }

                    } 
                    else {
                        resStatus = -1;
                        resMsg = "No Sample Attachment(s) Found";
                    }         
                }
                else {
                    resStatus = -1;
                    resMsg = AppConfigNotif.INVALID_DATA;
                }

            }
            catch (e) {
                resStatus = -1;
                resMsg = "OrganizationUser Retrieval Unsuccesful " + e;
            }
        }
    }
    else {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    // responseObj.responseLogsObj = responseLogsObj;
    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);

}

exports.onAttchmentUrlDownloadCompleted = async function (req, res) {
    var fileUrl = req.body.fileUrl;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};
    var responseLogsObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
    var consortiumId = await AppCommonService.getConsortiumIdFromRequest(req);

    if (!systemUser) {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (fileUrl && fileUrl !== undefined && fileUrl !== "") {
        try {
            await AppCommonService.setSystemUserAppAccessed(req);

            var localFilePath = fileUrl + "";
            localFilePath.replace(AppConfig.SERVER_APP_URL, AppConfigAssets.PROJECT_FOLDER_BASE_PATH + "public/");

            fs.unlink(localFilePath, function(err) {
                if (err) throw err;
            });

        }
        catch (e) {
            resStatus = -1;
            resMsg = "OrganizationUser Retrieval Unsuccesful " + e;
        }
    }
    else {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    // responseObj.responseLogsObj = responseLogsObj;
    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);

}
