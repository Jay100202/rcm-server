var ConsortiumPreliminaryAttachmentService = require('../services/consortiumPreliminaryAttachment.service')
var ConsortiumUserService = require('../services/consortiumUser.service')
var AppCommonService = require('../services/appcommon.service')
var AppUploadService = require('../services/appUpload.service')
var AppDataSanitationService = require('../services/appDataSanitation.service');
var AppConfigUploadsModule = require('../appconfig-uploads-module');
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppConfigConst = require('../appconfig-const')
var AppConfigModuleName = require('../appconfig-module-name');
var AppConfigUploads = require('../appconfig-uploads')
var mongodb = require("mongodb");
var mongoose = require('mongoose');
const ConsortiumPreliminaryAttachment = require('../models/consortiumPreliminaryAttachment.model');

// Saving the context of this module inside the _the variable
_this = this

exports.saveConsortiumPreliminaryAttachment = async function (req, res) {
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    if(!consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else 
    {
        try {
            await AppCommonService.setConsortiumUserAppAccessed(req);

            const uplAttachment = await AppUploadService.performConsortiumPreliminaryAttachmentFileUpload(req);
            if (uplAttachment !== undefined) {
                const savedConsortiumPreliminaryAttachment = await ConsortiumPreliminaryAttachmentService.addConsortiumPreliminaryAttachment(uplAttachment);

                if (savedConsortiumPreliminaryAttachment) {
                    resStatus = 1;
                    responseObj.preliminaryAttachment = savedConsortiumPreliminaryAttachment;
                    responseObj.id = savedConsortiumPreliminaryAttachment._id;
                }
                else {
                    resStatus = -1;
                    resMsg = AppConfigNotif.SERVER_ERROR;
                }
            }
            else {
                resStatus = -1;
                resMsg = AppConfigNotif.INVALID_DATA;
            }
        }
        catch (e) {
            resStatus = -1;
            resMsg = "OrganizationPreliminaryAttachment Retrieval Unsuccesful " + e;
        }
    }
    
    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
}

exports.saveConsortiumPreliminaryAudioAttachment = async function (req, res) {
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    if(!consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else 
    {
        try {
            await AppCommonService.setConsortiumUserAppAccessed(req);

            const uplAttachment = await AppUploadService.performConsortiumPreliminaryAttachmentAudioFileUpload(req);
            
            if (uplAttachment !== undefined) {
                const savedConsortiumPreliminaryAttachment = await ConsortiumPreliminaryAttachmentService.addConsortiumPreliminaryAttachment(uplAttachment);

                if (savedConsortiumPreliminaryAttachment) {
                    resStatus = 1;
                    responseObj.preliminaryAttachment = savedConsortiumPreliminaryAttachment;
                    responseObj.id = savedConsortiumPreliminaryAttachment._id;
                }
                else {
                    resStatus = -1;
                    resMsg = AppConfigNotif.SERVER_ERROR;
                }
            }
            else {
                resStatus = -1;
                resMsg = AppConfigNotif.INVALID_DATA;
            }
        }
        catch (e) {
            resStatus = -1;
            resMsg = "OrganizationPreliminaryAttachment Retrieval Unsuccesful " + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
}

exports.getConsortiumPreliminaryAttachmentDetails = async function (req, res, next) {
    var id = req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!consortiumUser )
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (id && id != "") {
        try {

            await AppCommonService.setConsortiumUserAppAccessed(req);

            var fetchedConsortiumPreliminaryAttachment = await ConsortiumPreliminaryAttachmentService.findConsortiumPreliminaryAttachmentById(req, id);
            
            if (fetchedConsortiumPreliminaryAttachment) {
                resStatus = 1;
                responseObj.preliminaryAttachment = fetchedConsortiumPreliminaryAttachment;
            }
            else {
                resStatus = -1;
                resMsg = "OrganizationPreliminaryAttachment Retrieval Unsuccesful ";
            }
        }
        catch (e) {
            resStatus = -1;
            resMsg = "OrganizationPreliminaryAttachment Retrieval Unsuccesful " + e;
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

exports.removeConsortiumPreliminaryAttachments = async function (req, res, next) {
    var idArr = req.body.idArr;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    let sessConsortium = await AppCommonService.getConsortiumFromRequest(req);

    if(!consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (idArr !== undefined && Array.isArray(idArr) && idArr.length > 0) {
       
        try {

            await AppCommonService.setConsortiumUserAppAccessed(req);
            
            await Promise.all((idArr).map(async (id) => {
                await ConsortiumPreliminaryAttachmentService.removeConsortiumPreliminaryAttachment(sessConsortium,id);
            }));

            resStatus = 1;
        }
        catch (e) {
            resStatus = -1;
            resMsg = "Attachment Deletion Unsuccesful" + e;
        }
    }
    else {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    return res.status(httpStatus).json({ status: resStatus, message: resMsg });
}


exports.saveConsortiumPreliminaryAudioAttachmentAsBase64 = async function (req, res) {
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var preliminaryAttachmentBase64Str = req.body.preliminaryAttachmentBase64Str;
    var attachedFileName = req.body.attachedFileName;
    var attachedFileSize = req.body.attachedFileSize;

    let sessConsortium = await AppCommonService.getConsortiumFromRequest(req);
    let sessConsortiumId = await AppCommonService.getConsortiumIdFromRequest(req);

   
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (preliminaryAttachmentBase64Str && preliminaryAttachmentBase64Str !== undefined && preliminaryAttachmentBase64Str !== "" && attachedFileName && attachedFileName !== undefined && attachedFileName !== "" && attachedFileSize && attachedFileSize !== undefined && !isNaN(attachedFileSize)) {
        try {

            await AppCommonService.setConsortiumUserAppAccessed(req);


            var sanPreliminaryAttachmentBase64Str = AppDataSanitationService.sanitizeDataTypeString(preliminaryAttachmentBase64Str);

            var attachedFileExt = AppCommonService.getFileExtensionFromFileName(attachedFileName);
            var consideredMimeTypeMap = AppConfigUploads.MIME_TYPE_MAP_FOR_AUDIO_ATTACHMENT_FROM_EXTENSION;
            const attachedFileContentType = consideredMimeTypeMap[attachedFileExt];
            
            var uplFilePath = await AppUploadService.uploadConsortiumPreliminaryAudioAttachmentBase64StringToPath(sessConsortium,sanPreliminaryAttachmentBase64Str, attachedFileExt, attachedFileContentType); 
            
            if(uplFilePath !== '')
            {
                var attFileUrl = await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_PRELIMINARY_ATTACHMENT,uplFilePath,sessConsortium);
    
                let attDurationInSeconds = await AppUploadService.getAudioDurationUsingFluent(attFileUrl);

                const uplAttachment = {
                    consortium: sessConsortiumId,
                    attFilePath: uplFilePath,
                    attImagePathActual: "",
                    attImagePathThumb: "",
                    attFileName: attachedFileName,
                    isImage: false,
                    attFileSizeBytes: attachedFileSize,
                    attDurationInSeconds: attDurationInSeconds,
                    isAudio: true
                };
 
                const savedConsortiumPreliminaryAttachment = await ConsortiumPreliminaryAttachmentService.addConsortiumPreliminaryAttachment(uplAttachment);

                if (savedConsortiumPreliminaryAttachment) {
                    resStatus = 1;
                    responseObj.preliminaryAttachment = savedConsortiumPreliminaryAttachment;
                    responseObj.id = savedConsortiumPreliminaryAttachment._id;
                }
                else {
                    resStatus = -1;
                    resMsg = AppConfigNotif.SERVER_ERROR;
                }
                
            }
            else
            {
                resStatus = -1;
                resMsg = AppConfigNotif.SERVER_ERROR;
            }
           
        }
        catch (e) {
            resStatus = -1;
            resMsg = "OrganizationPreliminaryAttachment Retrieval Unsuccesful " + e;
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