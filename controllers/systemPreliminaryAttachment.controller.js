var SystemPreliminaryAttachmentService = require('../services/systemPreliminaryAttachment.service')
var SystemUserService = require('../services/systemUser.service')
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
const SystemPreliminaryAttachment = require('../models/systemPreliminaryAttachment.model')

// Saving the context of this module inside the _the variable

_this = this

exports.saveSystemPreliminaryAttachment = async function (req, res) {
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var preliminaryAttachmentId = req.body.preliminaryAttachmentId;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
    var uplAttachment;
    if (req.file) {
        var orgFileSuffix = AppConfigUploads.STORAGE_UPLOADS_SUFFIX_ACTUAL;
        var systemFoldeBasePath = AppUploadService.getSystemPreliminaryAttachmentFolderBasePath() + AppConfigUploads.STORAGE_UPLOADS_FOLDER_ACTUAL;
       
        const reqFile = req.file;

        let filePath;
        let fileIsImage = false;
        let fileSize;
        if (reqFile['Key'] && reqFile['Key'] !== '') {
            fileIsImage = false;
            filePath = reqFile['Key'];
            fileSize = reqFile['size'];
        }
        else if (reqFile[orgFileSuffix] && reqFile[orgFileSuffix]['Key'] && reqFile[orgFileSuffix]['Key'] !== '') {
            fileIsImage = true;
            filePath = reqFile[orgFileSuffix]['Key'];
            fileSize = reqFile[orgFileSuffix]['size'];
        }

        if (filePath !== undefined && filePath !== '') {

            filePath = filePath.replace(systemFoldeBasePath, '');
            filePath = filePath.replace(AppConfigUploads.STORAGE_UPLOADS_SUFFIX_SEPARATOR + orgFileSuffix, '');

            const fileName = reqFile.originalname;
            
            const attImageUrlExpiresAt = AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); //
            let attFilePath = '', attImagePathActual = '', attImagePathThumb = '';
            let attFileUrl = '', attImageUrlActual = '', attImageUrlThumb = ''; //
            if(fileIsImage === true)
            {
                var compImageFilePath = AppCommonService.compileUploadedImageFileNamesFromFileName(filePath);
               
                if(compImageFilePath)
                {
                    attImagePathActual = compImageFilePath.actual; 
                    attImagePathThumb = compImageFilePath.thumb; 

                    var thmbFileSuffix = AppConfigUploads.STORAGE_UPLOADS_SUFFIX_THUMB;
                    if(req.file[thmbFileSuffix] && req.file[thmbFileSuffix]['Key'])
                    {
                        await AppUploadService.updateAssetFileACLToPublicReadable(req.file[thmbFileSuffix]['Key']);
                    }

                    attImageUrlActual = await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT,attImagePathActual); //
                    attImageUrlThumb = await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT,attImagePathThumb); //
            
                }

            }
            else
            {
                attFilePath = filePath;
                
                attFileUrl = await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT,attFilePath); //
            } 
           

            uplAttachment = {
                attFilePath: attFilePath,
                attImagePathActual: attImagePathActual,
                attImagePathThumb: attImagePathThumb,
                attFileUrl: attFileUrl,
                attImageActualUrl: attImageUrlActual,
                attImageThumbUrl: attImageUrlThumb,
                attFileName: fileName,
                isImage: fileIsImage,
                attFileSizeBytes: fileSize,
                attFileUrlExpiresAt: attImageUrlExpiresAt
            };
        }
    }
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    // responseObj.uplAttachment = uplAttachment;

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (uplAttachment !== undefined) {
        try {

            if(isConsortiumUserRequest === true)
            {   
                await AppCommonService.setConsortiumUserAppAccessed(req);
            }
            else
            {
                await AppCommonService.setSystemUserAppAccessed(req);
            }

            const savedSystemPreliminaryAttachment = await SystemPreliminaryAttachmentService.addSystemPreliminaryAttachment(uplAttachment);

            if (savedSystemPreliminaryAttachment) {
                const savedSystemPreliminaryAttachmentId = savedSystemPreliminaryAttachment._id;
                
                var fetchedSystemPreliminaryAttachment = await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(req, savedSystemPreliminaryAttachmentId);

                resStatus = 1;
                responseObj.preliminaryAttachment = fetchedSystemPreliminaryAttachment;
                responseObj.id = savedSystemPreliminaryAttachmentId;
            }
            else {
                resStatus = -1;
                resMsg = AppConfigNotif.SERVER_ERROR;
            }
        }
        catch (e) {
            resStatus = -1;
            resMsg = "SystemPreliminaryAttachment Retrieval Unsuccesful " + e;
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

exports.saveSystemPreliminaryAudioAttachment = async function (req, res) {
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var preliminaryAttachmentId = req.body.preliminaryAttachmentId;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
    var uplAttachment;
    if (req.file) {
        var orgFileSuffix = AppConfigUploads.STORAGE_UPLOADS_SUFFIX_ACTUAL;
        var systemFoldeBasePath = AppUploadService.getSystemPreliminaryAttachmentFolderBasePath() + AppConfigUploads.STORAGE_UPLOADS_FOLDER_ACTUAL;
       
        const reqFile = req.file;

        let filePath;
        let fileIsImage = false;
        let fileSize;
        if (reqFile['Key'] && reqFile['Key'] !== '') {
            fileIsImage = false;
            filePath = reqFile['Key'];
            fileSize = reqFile['size'];
        }
        else if (reqFile[orgFileSuffix] && reqFile[orgFileSuffix]['Key'] && reqFile[orgFileSuffix]['Key'] !== '') {
            fileIsImage = true;
            filePath = reqFile[orgFileSuffix]['Key'];
            fileSize = reqFile[orgFileSuffix]['size'];
        }

        if (filePath !== undefined && filePath !== '') {

            filePath = filePath.replace(systemFoldeBasePath, '');
            filePath = filePath.replace(AppConfigUploads.STORAGE_UPLOADS_SUFFIX_SEPARATOR + orgFileSuffix, '');

            const fileName = reqFile.originalname;
            
            const attImageUrlExpiresAt = AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); //
            let attFilePath = '', attImagePathActual = '', attImagePathThumb = '';
            let attFileUrl = '', attImageUrlActual = '', attImageUrlThumb = ''; //
            if(fileIsImage === true)
            {
                var compImageFilePath = AppCommonService.compileUploadedImageFileNamesFromFileName(filePath);
               
                if(compImageFilePath)
                {
                    attImagePathActual = compImageFilePath.actual; 
                    attImagePathThumb = compImageFilePath.thumb; 

                    var thmbFileSuffix = AppConfigUploads.STORAGE_UPLOADS_SUFFIX_THUMB;
                    if(req.file[thmbFileSuffix] && req.file[thmbFileSuffix]['Key'])
                    {
                        await AppUploadService.updateAssetFileACLToPublicReadable(req.file[thmbFileSuffix]['Key']);
                    }

                    attImageUrlActual = await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT,attImagePathActual); //
                    attImageUrlThumb = await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT,attImagePathThumb); //
            
                }

            }
            else
            {
                attFilePath = filePath;
                
                attFileUrl = await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT,attFilePath); //
            } 
 
            console.log('attFileUrl : ',attFileUrl);
            let attDurationInSeconds = await AppUploadService.getAudioDurationUsingFluent(attFileUrl);

            if(attDurationInSeconds !== undefined)
            {

                uplAttachment = {
                    attFilePath: attFilePath,
                    attImagePathActual: attImagePathActual,
                    attImagePathThumb: attImagePathThumb,
                    attFileUrl: attFileUrl,
                    attImageActualUrl: attImageUrlActual,
                    attImageThumbUrl: attImageUrlThumb,
                    attFileName: fileName,
                    isImage: fileIsImage,
                    attFileSizeBytes: fileSize,
                    attFileUrlExpiresAt: attImageUrlExpiresAt,
                    attDurationInSeconds : attDurationInSeconds,
                    isAudio : true,
                };
            }
        }
    }
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    // responseObj.uplAttachment = uplAttachment;

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (uplAttachment !== undefined) {
        try {

            if(isConsortiumUserRequest === true)
            {   
                await AppCommonService.setConsortiumUserAppAccessed(req);
            }
            else
            {
                await AppCommonService.setSystemUserAppAccessed(req);
            }

            const savedSystemPreliminaryAttachment = await SystemPreliminaryAttachmentService.addSystemPreliminaryAttachment(uplAttachment);

            if (savedSystemPreliminaryAttachment) {
                const savedSystemPreliminaryAttachmentId = savedSystemPreliminaryAttachment._id;
                
                var fetchedSystemPreliminaryAttachment = await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(req, savedSystemPreliminaryAttachmentId);

                resStatus = 1;
                responseObj.preliminaryAttachment = fetchedSystemPreliminaryAttachment;
                responseObj.id = savedSystemPreliminaryAttachmentId;
            }
            else {
                resStatus = -1;
                resMsg = AppConfigNotif.SERVER_ERROR;
            }
        }
        catch (e) {
            resStatus = -1;
            resMsg = "SystemPreliminaryAttachment Retrieval Unsuccesful " + e;
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



exports.getSystemPreliminaryAttachmentDetails = async function (req, res, next) {
    var id = req.body._id;

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
    else if (id && id != "") {
        try {

            if(isConsortiumUserRequest === true)
            {   
                await AppCommonService.setConsortiumUserAppAccessed(req);
            }
            else
            {
                await AppCommonService.setSystemUserAppAccessed(req);
            }

            var fetchedSystemPreliminaryAttachment = await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(req, id);
            if (fetchedSystemPreliminaryAttachment) {
                resStatus = 1;
                responseObj.preliminaryAttachment = fetchedSystemPreliminaryAttachment;
            }
            else {
                resStatus = -1;
                resMsg = "SystemPreliminaryAttachment Retrieval Unsuccesful ";
            }
        }
        catch (e) {
            resStatus = -1;
            resMsg = "SystemPreliminaryAttachment Retrieval Unsuccesful " + e;
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

exports.removeSystemPreliminaryAttachments = async function (req, res, next) {
    var idArr = req.body.idArr;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

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
    else if (idArr !== undefined && Array.isArray(idArr) && idArr.length > 0) {
       
        try {

            if(isConsortiumUserRequest === true)
            {   
                await AppCommonService.setConsortiumUserAppAccessed(req);
            }
            else
            {
                await AppCommonService.setSystemUserAppAccessed(req);
            }

            
            await Promise.all((idArr).map(async (id) => {
                await SystemPreliminaryAttachmentService.removeSystemPreliminaryAttachment(id);
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
 
exports.saveSystemPreliminaryAudioAttachmentAsBase64 = async function (req, res) {
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var preliminaryAttachmentBase64Str = req.body.preliminaryAttachmentBase64Str;
    var attachedFileName = req.body.attachedFileName;
    var attachedFileSize = req.body.attachedFileSize;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
    
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (preliminaryAttachmentBase64Str && preliminaryAttachmentBase64Str !== undefined && preliminaryAttachmentBase64Str !== "" && attachedFileName && attachedFileName !== undefined && attachedFileName !== "" && attachedFileSize && attachedFileSize !== undefined && !isNaN(attachedFileSize)) {
        try {

            await AppCommonService.setSystemUserAppAccessed(req);

            var sanPreliminaryAttachmentBase64Str = AppDataSanitationService.sanitizeDataTypeString(preliminaryAttachmentBase64Str);

            var attachedFileExt = AppCommonService.getFileExtensionFromFileName(attachedFileName);
            var consideredMimeTypeMap = AppConfigUploads.MIME_TYPE_MAP_FOR_AUDIO_ATTACHMENT_FROM_EXTENSION;
            const attachedFileContentType = consideredMimeTypeMap[attachedFileExt];
            
            var uplFilePath = await AppUploadService.uploadSystemPreliminaryAudioAttachmentBase64StringToPath(sanPreliminaryAttachmentBase64Str, attachedFileExt, attachedFileContentType); 

            if(uplFilePath !== '')
            {
                var attFileUrl = await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT,uplFilePath);
    
                let attDurationInSeconds = await AppUploadService.getAudioDurationUsingFluent(attFileUrl);

                const uplAttachment = {
                    attFilePath: uplFilePath,
                    attImagePathActual: "",
                    attImagePathThumb: "",
                    attFileUrl: attFileUrl,
                    attFileName: attachedFileName,
                    isImage: false,
                    attFileSizeBytes: attachedFileSize,
                    attDurationInSeconds: attDurationInSeconds,
                    isAudio: true
                };
                
                const savedSystemPreliminaryAttachment = await SystemPreliminaryAttachmentService.addSystemPreliminaryAttachment(uplAttachment);

                if (savedSystemPreliminaryAttachment) {
                    const savedSystemPreliminaryAttachmentId = savedSystemPreliminaryAttachment._id;
                    
                    var fetchedSystemPreliminaryAttachment = await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(req, savedSystemPreliminaryAttachmentId);

                    resStatus = 1;
                    responseObj.preliminaryAttachment = fetchedSystemPreliminaryAttachment;
                    responseObj.id = savedSystemPreliminaryAttachmentId;
                }
                else {
                    resStatus = -1;
                    resMsg = AppConfigNotif.SERVER_ERROR;
                }
            }
            else {
                resStatus = -1;
                resMsg = AppConfigNotif.SERVER_ERROR;
            }
        }
        catch (e) {
            resStatus = -1;
            resMsg = "SystemPreliminaryAttachment Retrieval Unsuccesful " + e;
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
 
exports.saveSystemPreliminaryAttachmentAsBase64 = async function (req, res) {
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var preliminaryAttachmentBase64Str = req.body.preliminaryAttachmentBase64Str;
    var attachedFileName = req.body.attachedFileName;
    var attachedFileSize = req.body.attachedFileSize;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if (preliminaryAttachmentBase64Str && preliminaryAttachmentBase64Str !== undefined && preliminaryAttachmentBase64Str !== "" && attachedFileName && attachedFileName !== undefined && attachedFileName !== "" && attachedFileSize && attachedFileSize !== undefined && !isNaN(attachedFileSize)) {
        try {

            await AppCommonService.setSystemUserAppAccessed(req);

            var sanPreliminaryAttachmentBase64Str = AppDataSanitationService.sanitizeDataTypeString(preliminaryAttachmentBase64Str);

            var attachedFileExt = AppCommonService.getFileExtensionFromFileName(attachedFileName);
            
            var uplFilePath = await AppUploadService.uploadSystemPreliminaryAttachmentBase64StringToPath(sanPreliminaryAttachmentBase64Str, attachedFileExt); 

            if(uplFilePath !== '')
            {
                let fileIsImage = AppCommonService.checkIfFileIsTypeImageFromFileName(attachedFileName);
                let attImagePathActual = "", attImagePathThumb = "", attFilePath = "";
                let attImageUrlActual = "", attImageUrlThumb = "", attFileUrl = "";
                if(fileIsImage === true)
                {
                    var compImageFilePath = AppCommonService.compileUploadedImageFileNamesFromFileName(uplFilePath);
                    
                    if(compImageFilePath)
                    {
                        attImagePathActual = compImageFilePath.actual; 
                        attImagePathThumb = compImageFilePath.thumb; 
    
                        await AppUploadService.updateAssetFileACLToPublicReadable(attImagePathThumb);
    
                        attImageUrlActual = await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT,attImagePathActual); //
                        attImageUrlThumb = await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT,attImagePathThumb); //                
                    }
                }
                else
                {
                    attFilePath = uplFilePath;
                    
                    attFileUrl = await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT,uplFilePath);
                }
    
                let attDurationInSeconds = 0, fileIsAudio = false;

                const uplAttachment = {
                    attFilePath: attFilePath,
                    attImagePathActual: attImagePathActual,
                    attImagePathThumb: attImagePathThumb,
                    attFileUrl: attFileUrl,
                    attImageUrlActual: attImageUrlActual,
                    attImageUrlThumb: attImageUrlThumb,
                    attFileName: attachedFileName,
                    isImage: fileIsImage,
                    attFileSizeBytes: attachedFileSize,
                    attDurationInSeconds: attDurationInSeconds,
                    isAudio: fileIsAudio
                };
                
                const savedSystemPreliminaryAttachment = await SystemPreliminaryAttachmentService.addSystemPreliminaryAttachment(uplAttachment);

                if (savedSystemPreliminaryAttachment) {
                    const savedSystemPreliminaryAttachmentId = savedSystemPreliminaryAttachment._id;
                    
                    var fetchedSystemPreliminaryAttachment = await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(req, savedSystemPreliminaryAttachmentId);

                    resStatus = 1;
                    responseObj.preliminaryAttachment = fetchedSystemPreliminaryAttachment;
                    responseObj.id = savedSystemPreliminaryAttachmentId;
                }
                else {
                    resStatus = -1;
                    resMsg = AppConfigNotif.SERVER_ERROR;
                }
            }
            else {
                resStatus = -1;
                resMsg = AppConfigNotif.SERVER_ERROR;
            }
        }
        catch (e) {
            resStatus = -1;
            resMsg = "SystemPreliminaryAttachment Retrieval Unsuccesful " + e;
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
