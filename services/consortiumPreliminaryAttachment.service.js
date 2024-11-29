var ConsortiumPreliminaryAttachment = require('../models/consortiumPreliminaryAttachment.model');
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

exports.addConsortiumPreliminaryAttachment = async function(uplAttachment)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    var modAttachment = new ConsortiumPreliminaryAttachment();
    modAttachment.createdAt = currTs;
    modAttachment.consortium = uplAttachment.consortium;
    modAttachment.isImage = uplAttachment.isImage;
    modAttachment.attFilePath = uplAttachment.attFilePath;
    modAttachment.attImagePathActual = uplAttachment.attImagePathActual;
    modAttachment.attImagePathThumb = uplAttachment.attImagePathThumb;
    modAttachment.attFileName = uplAttachment.attFileName;
    modAttachment.attFileUrl = uplAttachment.attFileUrl;
    modAttachment.attImageActualUrl = uplAttachment.attImageActualUrl;
    modAttachment.attImageThumbUrl = uplAttachment.attImageThumbUrl;
    modAttachment.attFileUrlExpiresAt = uplAttachment.attFileUrlExpiresAt;
    modAttachment.attFileSizeBytes = uplAttachment.attFileSizeBytes;
    modAttachment.isAudio = uplAttachment.isAudio;
    modAttachment.attDurationInSeconds = uplAttachment.attDurationInSeconds;

    try{
        var savedAttachment = await modAttachment.save();
        return savedAttachment;
    }
    catch(e){
        throw Error("And Error occured while inserting the ConsortiumPreliminaryAttachment "+ e);
    }
}



exports.removeConsortiumPreliminaryAttachment = async function(consortium, preliminaryAttachmentId)
{
    try{
        let consortiumId = consortium ? consortium._id : '';
        var preliminaryAttachment = await exports.getConsortiumPreliminaryAttachmentBaseObjectById(consortiumId, preliminaryAttachmentId);
        if(preliminaryAttachment)
        {
            const isImage = preliminaryAttachment.isImage;
            const attFilePath = preliminaryAttachment.attFilePath;
            await AppUploadService.removeConsortiumPreliminaryAttachment(consortium, isImage, attFilePath);
            await preliminaryAttachment.remove();
        }
        return;
    }
    catch(e){
        throw Error("And Error occured while inserting the ConsortiumPreliminaryAttachment "+ e);
    }
}


exports.getConsortiumPreliminaryAttachmentBaseObjectById = async function(consortiumId, preliminaryAttachmentId){
    // Options setup for the mongoose paginate
    
    var fetchOptions = {
        _id : preliminaryAttachmentId,
        consortium: consortiumId
    };

    try {
        var consortiumPreliminaryAttachment;
        if(mongodb.ObjectId.isValid(preliminaryAttachmentId) && mongodb.ObjectId.isValid(consortiumId))
        {
            consortiumPreliminaryAttachment = await ConsortiumPreliminaryAttachment.findOne(fetchOptions);
        }
        return consortiumPreliminaryAttachment;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPreliminaryAttachment' + e)
    }
}


exports.findConsortiumPreliminaryAttachmentById = async function(req, preliminaryAttachmentId)
{
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);

    let sessConsortium;
    if(isConsortiumUserRequest === true)
    {
        sessConsortium = await AppCommonService.getConsortiumFromRequest(req);
    }

    let sessConsortiumId;
    if(sessConsortium)
    {
        sessConsortiumId = sessConsortium._id;
    }

    const preliminaryAttachmentBasePath = AppUploadService.getConsortiumPreliminaryAttachmentFolderBaseUrl(sessConsortium);

    var fetchOptions = {};

    if(mongodb.ObjectId.isValid(preliminaryAttachmentId) && mongodb.ObjectId.isValid(sessConsortiumId))
    {
        fetchOptions = {
            _id : new mongoose.Types.ObjectId(preliminaryAttachmentId),
            consortium : new mongoose.Types.ObjectId(sessConsortiumId)
        };
    }

    const projectObj = {
        '_id': '$_id',
        'isImage': '$isImage',
        'attFilePath': '$attFilePath',
        'attFileName': '$attFileName',
        'attFileSizeBytes': '$attFileSizeBytes',
        'createdAt': '$createdAt',
        'isAudio': '$isAudio',
        'attDurationInSeconds': '$attDurationInSeconds',
        'attImagePathActual': '$attImagePathActual',
        'attImagePathThumb': '$attImagePathThumb',
        'attFileUrl':'$attFileUrl',
        'attImgUrl': '$attImageActualUrl',
        'attImgThumbUrl': '$attImageThumbUrl',
        'attImgThumbUrl': '$attFileUrlExpiresAt',
    };

    const sortOptions = {
        createdAt: -1
    };

    try {
        var consortiumPreliminaryAttachment;
        if(mongodb.ObjectId.isValid(preliminaryAttachmentId) && mongodb.ObjectId.isValid(sessConsortiumId))
        {
            const fetchedConsortiumPreliminaryAttachments = await ConsortiumPreliminaryAttachment.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);

            if(fetchedConsortiumPreliminaryAttachments && fetchedConsortiumPreliminaryAttachments.length > 0)
            {
                consortiumPreliminaryAttachment = fetchedConsortiumPreliminaryAttachments[0];
            }
        }
        return consortiumPreliminaryAttachment;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPreliminaryAttachment ' + e)
    }
}


exports.getAllConsortiumPreliminaryAttachments = async function(req)
{
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);

    let sessConsortium;
    if(isConsortiumUserRequest === true)
    {
        sessConsortium = await AppCommonService.getConsortiumFromRequest(req);
    }


    let sessConsortiumId;
    if(sessConsortium)
    {
        sessConsortiumId = sessConsortium._id;
    }

    const preliminaryAttachmentBasePath = AppUploadService.getConsortiumPreliminaryAttachmentFolderBaseUrl(sessConsortium);

    const projectObj = {
        '_id': '$_id',
        'isImage': '$isImage',
        'attFilePath': '$attFilePath',
        'attFileName': '$attFileName',
        'attFileSizeBytes': '$attFileSizeBytes',
        'createdAt': '$createdAt',
        'isAudio': '$isAudio',
        'attDurationInSeconds': '$attDurationInSeconds',
        'attFileUrl':'$attFileUrl',
        'attImgUrl': '$attImageActualUrl',
        'attImgThumbUrl': '$attImageThumbUrl',
        'attImgThumbUrl': '$attFileUrlExpiresAt',
    };

    var fetchOptions = {
        consortium : new mongoose.Types.ObjectId(sessConsortiumId)
    };

    const sortOptions = {
        createdAt: -1
    };

    try {
        var consortiumPreliminaryAttachments = await ConsortiumPreliminaryAttachment.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        return consortiumPreliminaryAttachments;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPreliminaryAttachment ' + e)
    }
}



