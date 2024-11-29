var SystemPreliminaryAttachment = require('../models/systemPreliminaryAttachment.model');
var AppCommonService = require('./appcommon.service');
var AppUploadService = require('./appUpload.service');
var AppConfigConst = require('../appconfig-const');
var AppConfigUploads = require('../appconfig-uploads');
var mongoose = require('mongoose');
var mongodb = require("mongodb");
var moment = require("moment");
var momentTZ = require('moment-timezone');

// Saving the context of this module inside the _the variable
_this = this

exports.addSystemPreliminaryAttachment = async function(uplAttachment)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    var modAttachment = new SystemPreliminaryAttachment();
    modAttachment.createdAt = currTs;
    modAttachment.isImage = uplAttachment.isImage;
    modAttachment.attFilePath = uplAttachment.attFilePath;
    modAttachment.attImagePathActual = uplAttachment.attImagePathActual;
    modAttachment.attImagePathThumb = uplAttachment.attImagePathThumb;
    modAttachment.attFileUrl = uplAttachment.attFileUrl;
    modAttachment.attImageActualUrl = uplAttachment.attImageActualUrl;
    modAttachment.attImageThumbUrl = uplAttachment.attImageThumbUrl;
    modAttachment.attFileUrlExpiresAt = uplAttachment.attFileUrlExpiresAt;
    modAttachment.attFileName = uplAttachment.attFileName;
    modAttachment.attFileSizeBytes = uplAttachment.attFileSizeBytes;
    modAttachment.attDurationInSeconds = uplAttachment.attDurationInSeconds;
    modAttachment.isAudio = uplAttachment.isAudio;

    try{
        var savedAttachment = await modAttachment.save();
        return savedAttachment;
    }
    catch(e){
        throw Error("And Error occured while inserting the SystemPreliminaryAttachment "+ e);
    }
}

exports.removeSystemPreliminaryAttachment = async function(preliminaryAttachmentId)
{
    try{
        var preliminaryAttachment = await exports.getSystemPreliminaryAttachmentBaseObjectById(preliminaryAttachmentId, false);
        if(preliminaryAttachment)
        {
            const isImage = preliminaryAttachment.isImage;
            if(isImage === true)
            {
                await AppUploadService.removeSystemPreliminaryAttachment(isImage, preliminaryAttachment.attImagePathActual);
                await AppUploadService.removeSystemPreliminaryAttachment(isImage, preliminaryAttachment.attImagePathThumb);
            }
            else
            {
                await AppUploadService.removeSystemPreliminaryAttachment(isImage, preliminaryAttachment.attFilePath);
            }

            var deleteOptions = {
                _id : preliminaryAttachmentId
            };
            await SystemPreliminaryAttachment.deleteOne(deleteOptions);
        }
        return;
    }
    catch(e){
        throw Error("And Error occured while inserting the SystemPreliminaryAttachment "+ e);
    }
}

exports.getSystemPreliminaryAttachmentBaseObjectById = async function(preliminaryAttachmentId){
    // Options setup for the mongoose paginate
    
    var fetchOptions = {
        _id : preliminaryAttachmentId
    };

    try {
        var systemPreliminaryAttachment;
        if(mongodb.ObjectId.isValid(preliminaryAttachmentId))
        {
            systemPreliminaryAttachment = await SystemPreliminaryAttachment.findOne(fetchOptions);
        }
        return systemPreliminaryAttachment;
    } catch (e) {
        throw Error('Error while Fetching SystemPreliminaryAttachment' + e)
    }
}

exports.findSystemPreliminaryAttachmentById = async function(req, preliminaryAttachmentId)
{    
    var fetchOptions = {
        _id : new mongoose.Types.ObjectId(preliminaryAttachmentId)
    };

 
    const projectObj = {
        '_id': '$_id',
        'isImage': '$isImage',
        'attFilePath': '$attFilePath',
        'attImagePathActual': '$attImagePathActual',
        'attImagePathThumb': '$attImagePathThumb',
        'attFileName': '$attFileName',
        'attFileSizeBytes': '$attFileSizeBytes',
        'isAudio': '$isAudio',
        'attDurationInSeconds': '$attDurationInSeconds',
        'attFileUrlExpiresAt': '$attFileUrlExpiresAt',
        'createdAt': '$createdAt',
        'attFileUrl':'$attFileUrl',
        'attImgUrl':'$attImageActualUrl',
        'attImgThumbUrl': '$attImageThumbUrl',
    };

    const sortOptions = {
        createdAt: -1
    };

    try {
        var systemPreliminaryAttachment;
        if(mongodb.ObjectId.isValid(preliminaryAttachmentId))
        {
            const fetchedSystemPreliminaryAttachments = await SystemPreliminaryAttachment.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);

            if(fetchedSystemPreliminaryAttachments && fetchedSystemPreliminaryAttachments.length > 0)
            {
                systemPreliminaryAttachment = fetchedSystemPreliminaryAttachments[0];
            }
        }
        return systemPreliminaryAttachment;
    } catch (e) {
        throw Error('Error while Fetching SystemPreliminaryAttachment ' + e)
    }
}

exports.getAllSystemPreliminaryAttachments = async function(req)
{    
    var fetchOptions = {
    };

    const preliminaryAttachmentBaseUrl = AppUploadService.getSystemPreliminaryAttachmentFolderBaseUrl();

    const projectObj = {
        '_id': '$_id',
        'isImage': '$isImage',
        'attFilePath': '$attFilePath',
        'attImagePathActual': '$attImagePathActual',
        'attImagePathThumb': '$attImagePathThumb',
        'attFileName': '$attFileName',
        'attFileSizeBytes': '$attFileSizeBytes',
        'isAudio': '$isAudio',
        'attDurationInSeconds': '$attDurationInSeconds',
        'attFileUrlExpiresAt': '$attFileUrlExpiresAt',
        'createdAt': '$createdAt',
        'attFileUrl':'$attFileUrl',
        'attImgUrl':'$attImageActualUrl',
        'attImgThumbUrl': '$attImageThumbUrl'
    };

    const sortOptions = {
        createdAt: -1
    };

    try {
        var systemPreliminaryAttachments = await SystemPreliminaryAttachment.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        return systemPreliminaryAttachments;
    } catch (e) {
        throw Error('Error while Fetching SystemPreliminaryAttachment ' + e)
    }
}
