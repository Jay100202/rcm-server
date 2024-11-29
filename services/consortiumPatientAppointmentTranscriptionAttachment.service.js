var ConsortiumPatientAppointmentTranscriptionAttachment = require('../models/consortiumPatientAppointmentTranscriptionAttachment.model');
var ConsortiumService = require('./consortium.service');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var AppUploadService = require('./appUpload.service');
var mongodb = require("mongodb");
var mongoose = require('mongoose');

// Saving the context of this module inside the _the variable
_this = this

// Async function to add ConsortiumPatientAppointmentTranscriptionAttachment
exports.saveConsortiumPatientAppointmentTranscriptionAttachment = async function(consortiumPatientAppointmentTranscriptionAttachment)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modConsortiumPatientAppointmentTranscriptionAttachment = null;
    if(mongodb.ObjectId.isValid(consortiumPatientAppointmentTranscriptionAttachment.id))
    {
        try
        {
            modConsortiumPatientAppointmentTranscriptionAttachment = await ConsortiumPatientAppointmentTranscriptionAttachment.findById(consortiumPatientAppointmentTranscriptionAttachment.id);
        }
        catch(e){
            throw Error("Error occured while Finding the ConsortiumPatientAppointmentTranscriptionAttachment")
        }
    }

    let isAdd = false;

    if(!modConsortiumPatientAppointmentTranscriptionAttachment){
        modConsortiumPatientAppointmentTranscriptionAttachment = new ConsortiumPatientAppointmentTranscriptionAttachment();
        modConsortiumPatientAppointmentTranscriptionAttachment.createdAt = currTs;
     
        if(consortiumPatientAppointmentTranscriptionAttachment.createdBySystemUser !== undefined)
        modConsortiumPatientAppointmentTranscriptionAttachment.createdBySystemUser = consortiumPatientAppointmentTranscriptionAttachment.createdBySystemUser
    
        if(consortiumPatientAppointmentTranscriptionAttachment.createdByConsortiumUser !== undefined)
        modConsortiumPatientAppointmentTranscriptionAttachment.createdByConsortiumUser = consortiumPatientAppointmentTranscriptionAttachment.createdByConsortiumUser
        
        let genVersionNo = await exports.getCurrentHighestConsortiumPatientAppointmentTranscriptionAttachmentVersionNo(consortiumPatientAppointmentTranscriptionAttachment.consortiumPatientAppointment);
        modConsortiumPatientAppointmentTranscriptionAttachment.versionNo = genVersionNo + 1;    

        isAdd = true;
    }

    modConsortiumPatientAppointmentTranscriptionAttachment.updatedAt = currTs;
    modConsortiumPatientAppointmentTranscriptionAttachment.updatedBy = consortiumPatientAppointmentTranscriptionAttachment.updatedBy;

    if(consortiumPatientAppointmentTranscriptionAttachment.consortium !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.consortium = consortiumPatientAppointmentTranscriptionAttachment.consortium

    if(consortiumPatientAppointmentTranscriptionAttachment.consortiumPatientAppointment !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.consortiumPatientAppointment = consortiumPatientAppointmentTranscriptionAttachment.consortiumPatientAppointment

    if(consortiumPatientAppointmentTranscriptionAttachment.attFilePath !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.attFilePath = consortiumPatientAppointmentTranscriptionAttachment.attFilePath

    if(consortiumPatientAppointmentTranscriptionAttachment.attFilePathActual !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.attFilePathActual = consortiumPatientAppointmentTranscriptionAttachment.attFilePathActual

    if(consortiumPatientAppointmentTranscriptionAttachment.attFilePathThumb !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.attFilePathThumb = consortiumPatientAppointmentTranscriptionAttachment.attFilePathThumb

    if(consortiumPatientAppointmentTranscriptionAttachment.attFileName !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.attFileName = consortiumPatientAppointmentTranscriptionAttachment.attFileName

    if(consortiumPatientAppointmentTranscriptionAttachment.attFileUrl !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.attFileUrl = consortiumPatientAppointmentTranscriptionAttachment.attFileUrl

    if(consortiumPatientAppointmentTranscriptionAttachment.attImageActualUrl !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.attImageActualUrl = consortiumPatientAppointmentTranscriptionAttachment.attImageActualUrl

    if(consortiumPatientAppointmentTranscriptionAttachment.attImageThumbUrl !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.attImageThumbUrl = consortiumPatientAppointmentTranscriptionAttachment.attImageThumbUrl

    if(consortiumPatientAppointmentTranscriptionAttachment.attFileUrlExpiresAt !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.attFileUrlExpiresAt = consortiumPatientAppointmentTranscriptionAttachment.attFileUrlExpiresAt

    if(consortiumPatientAppointmentTranscriptionAttachment.attFileSizeBytes !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.attFileSizeBytes = consortiumPatientAppointmentTranscriptionAttachment.attFileSizeBytes

    if(consortiumPatientAppointmentTranscriptionAttachment.isImage !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.isImage = consortiumPatientAppointmentTranscriptionAttachment.isImage

    if(consortiumPatientAppointmentTranscriptionAttachment.hasDuration !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.hasDuration = consortiumPatientAppointmentTranscriptionAttachment.hasDuration

    if(consortiumPatientAppointmentTranscriptionAttachment.isAudio !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.isAudio = consortiumPatientAppointmentTranscriptionAttachment.isAudio

    if(consortiumPatientAppointmentTranscriptionAttachment.attDurationInSeconds !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.attDurationInSeconds = consortiumPatientAppointmentTranscriptionAttachment.attDurationInSeconds

    if(consortiumPatientAppointmentTranscriptionAttachment.notes !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.notes = consortiumPatientAppointmentTranscriptionAttachment.notes

    if(consortiumPatientAppointmentTranscriptionAttachment.systemUser !== undefined)
    {
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentTranscriptionAttachment.systemUser))
        {
            modConsortiumPatientAppointmentTranscriptionAttachment.systemUser = consortiumPatientAppointmentTranscriptionAttachment.systemUser;
        }
        else
        {
            modConsortiumPatientAppointmentTranscriptionAttachment.systemUser = null;
        }
    }

    if(consortiumPatientAppointmentTranscriptionAttachment.transcriptorRole !== undefined)
    {
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentTranscriptionAttachment.transcriptorRole))
        {
            modConsortiumPatientAppointmentTranscriptionAttachment.transcriptorRole = consortiumPatientAppointmentTranscriptionAttachment.transcriptorRole;
        }
        else
        {
            modConsortiumPatientAppointmentTranscriptionAttachment.transcriptorRole = null;
        }
    }

    if(consortiumPatientAppointmentTranscriptionAttachment.transcriptionStatus !== undefined)
    {
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentTranscriptionAttachment.transcriptionStatus))
        {
            modConsortiumPatientAppointmentTranscriptionAttachment.transcriptionStatus = consortiumPatientAppointmentTranscriptionAttachment.transcriptionStatus;
        }
        else
        {
            modConsortiumPatientAppointmentTranscriptionAttachment.transcriptionStatus = null;
        }
    }
    
    
    if(consortiumPatientAppointmentTranscriptionAttachment.systemUserDaywiseWorkAllocation !== undefined)
    {
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentTranscriptionAttachment.systemUserDaywiseWorkAllocation))
        {
            modConsortiumPatientAppointmentTranscriptionAttachment.systemUserDaywiseWorkAllocation = consortiumPatientAppointmentTranscriptionAttachment.systemUserDaywiseWorkAllocation;
        }
        else
        {
            modConsortiumPatientAppointmentTranscriptionAttachment.systemUserDaywiseWorkAllocation = null;
        }
    }
    

    if(consortiumPatientAppointmentTranscriptionAttachment.activityStartedAt !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.activityStartedAt = consortiumPatientAppointmentTranscriptionAttachment.activityStartedAt

    if(consortiumPatientAppointmentTranscriptionAttachment.activityEndedAt !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.activityEndedAt = consortiumPatientAppointmentTranscriptionAttachment.activityEndedAt

    if(consortiumPatientAppointmentTranscriptionAttachment.activityDurationInSeconds !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.activityDurationInSeconds = consortiumPatientAppointmentTranscriptionAttachment.activityDurationInSeconds

    if(consortiumPatientAppointmentTranscriptionAttachment.updatedBySystemUser !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.updatedBySystemUser = consortiumPatientAppointmentTranscriptionAttachment.updatedBySystemUser

    if(consortiumPatientAppointmentTranscriptionAttachment.updatedByConsortiumUser !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.updatedByConsortiumUser = consortiumPatientAppointmentTranscriptionAttachment.updatedByConsortiumUser

    if(consortiumPatientAppointmentTranscriptionAttachment.isDeleted !== undefined)
    modConsortiumPatientAppointmentTranscriptionAttachment.isDeleted = consortiumPatientAppointmentTranscriptionAttachment.isDeleted


    try{
        var savedConsortiumPatientAppointmentTranscriptionAttachment = await modConsortiumPatientAppointmentTranscriptionAttachment.save();
        if(savedConsortiumPatientAppointmentTranscriptionAttachment)
        {
            await ConsortiumService.recalculateConsortiumCount(savedConsortiumPatientAppointmentTranscriptionAttachment.consortium);
        }
        return savedConsortiumPatientAppointmentTranscriptionAttachment;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumPatientAppointmentTranscriptionAttachment "+ e);
    }
}


exports.getCurrentHighestConsortiumPatientAppointmentTranscriptionAttachmentVersionNo = async function(consortiumPatientAppointmentId){

	let selectArr = [ 'versionNo' ];

    let sortOptions = {
        versionNo: -1
       
    };
    
    let options = {
        consortiumPatientAppointment : new mongoose.Types.ObjectId(consortiumPatientAppointmentId),
        isDeleted : 0
	};

    try {

        let highestConsortiumPatientAppointmentTranscriptionAttachmentVersionNo = 0;
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentId)) 
        {
            var consortiumPatientAppointmentTranscriptionAttachment = await ConsortiumPatientAppointmentTranscriptionAttachment.findOne(options).sort(sortOptions).select(selectArr);
            if(consortiumPatientAppointmentTranscriptionAttachment) {
                if(consortiumPatientAppointmentTranscriptionAttachment.versionNo !== undefined && consortiumPatientAppointmentTranscriptionAttachment.versionNo !== null)
                {
                    highestConsortiumPatientAppointmentTranscriptionAttachmentVersionNo = consortiumPatientAppointmentTranscriptionAttachment.versionNo;
                }
            }
        }
    
        return highestConsortiumPatientAppointmentTranscriptionAttachmentVersionNo;
    } catch (e) {
        throw Error('Error while Fetching highestConsortiumPatientAppointmentTranscriptionAttachmentVersionNo' + e)
    }
}


exports.removeConsortiumPatientAppointmentTranscriptionAttachment = async function(consortiumPatientAppointmentTranscriptionAttachmentId)
{
    try{
        var consortiumPatientAppointmentTranscriptionAttachment = await exports.getConsortiumPatientAppointmentTranscriptionAttachmentBaseObjectById(consortiumPatientAppointmentTranscriptionAttachmentId, true);
        if(consortiumPatientAppointmentTranscriptionAttachment)
        {
            const isImage = consortiumPatientAppointmentTranscriptionAttachment.isImage;
            let consortium = consortiumPatientAppointmentTranscriptionAttachment.consortium;

            if(isImage === true)
            {
                await AppUploadService.removeConsortiumPatientAppointmentTranscriptionAttachment(consortium,isImage, consortiumPatientAppointmentTranscriptionAttachment.attFilePathActual);
                await AppUploadService.removeConsortiumPatientAppointmentTranscriptionAttachment(consortium,isImage, consortiumPatientAppointmentTranscriptionAttachment.attFilePathThumb);
            }
            else
            {
                await AppUploadService.removeConsortiumPatientAppointmentTranscriptionAttachment(consortium,isImage, consortiumPatientAppointmentTranscriptionAttachment.attFilePath);
            }
            consortiumPatientAppointmentTranscriptionAttachment.remove();
        }
        return;
    }
    catch(e){
        throw Error("And Error occured while inserting the ConsortiumPatientAppointmentTranscriptionAttachment "+ e);
    }
}

exports.getConsortiumPatientAppointmentTranscriptionAttachmentBaseObjectById = async function(consortiumPatientAppointmentTranscriptionAttachmentId,withPopulation){
      // Options setup for the mongoose paginate
      let populateOptions = [ ];
      if(withPopulation !== undefined && withPopulation === true)
      {
          populateOptions = [
              {
                  path : 'consortium',
                  select : 'consortiumName consortiumId'
              },
          ];
      }
    
    var fetchOptions = {
        _id : new mongoose.Types.ObjectId(consortiumPatientAppointmentTranscriptionAttachmentId)
    };

    try {
        var consortiumPatientAppointmentTranscriptionAttachment;
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentTranscriptionAttachmentId))
        {
            consortiumPatientAppointmentTranscriptionAttachment = await ConsortiumPatientAppointmentTranscriptionAttachment.findOne(fetchOptions).populate(populateOptions);
        }
        return consortiumPatientAppointmentTranscriptionAttachment;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatientAppointmentTranscriptionAttachment' + e)
    }
}

exports.findConsortiumPatientAppointmentTranscriptionAttachmentByConsortiumPatientAppointmentId = async function(consortium,consortiumPatientAppointmentId)
{    

    const populateOptions = [
        {
            path : 'createdBySystemUser',
            select : 'userFullName'
        },
        {
            path : 'updatedBySystemUser',
            select : 'userFullName'
        },
        {
            path : 'createdByConsortiumUser',
            select : 'userFullName'
        },
        {
            path : 'updatedByConsortiumUser',
            select : 'userFullName'
        },
        {
            path : 'transcriptorRole',
            select : 'roleName'
        },
        {
            path : 'transcriptionStatus',
        }
    ];

    var fetchOptions = {
        consortiumPatientAppointment : new mongoose.Types.ObjectId(consortiumPatientAppointmentId),
        isDeleted : 0
    };


    const projectObj = {
        '_id': '$_id',
        'consortium': '$consortium',
        'consortiumPatientAppointment': '$consortiumPatientAppointment',
        'versionNo': '$versionNo',
        'attFilePath': '$attFilePath',
        'attFilePathActual': '$attFilePathActual',
        'attFilePathThumb': '$attFilePathThumb',
        'attFileName': '$attFileName',
        'attFileSizeBytes': '$attFileSizeBytes',
        'hasDuration': '$hasDuration',
        'isAudio': '$isAudio',
        'isImage': '$isImage',
        'attDurationInSeconds': '$attDurationInSeconds',
        'notes': '$notes',
        'createdBySystemUser': '$createdBySystemUser',
        'createdByConsortiumUser': '$createdByConsortiumUser',
        'updatedBySystemUser': '$updatedBySystemUser',
        'updatedByConsortiumUser': '$updatedByConsortiumUser',
        'transcriptorRole': '$transcriptorRole',
        'transcriptionStatus': '$transcriptionStatus',
        'createdAt': '$createdAt',
        'attFileUrl': '$attFileUrl',
        'attImgUrl': '$attImageActualUrl',
        'attImgThumbUrl': '$attImageThumbUrl',
        'attFileUrlExpiresAt': '$attFileUrlExpiresAt',
    };

    const sortOptions = {
        versionNo: -1
    };

    try {
        var consortiumPatientAppointmentTranscriptionAttachment = [];
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentId))
        {
            let fetchedConsortiumPatientAppointmentTranscriptionAttachments = await ConsortiumPatientAppointmentTranscriptionAttachment.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);

            fetchedConsortiumPatientAppointmentTranscriptionAttachments = await ConsortiumPatientAppointmentTranscriptionAttachment.populate(fetchedConsortiumPatientAppointmentTranscriptionAttachments, populateOptions);

            if(fetchedConsortiumPatientAppointmentTranscriptionAttachments && fetchedConsortiumPatientAppointmentTranscriptionAttachments.length > 0)
            {
                consortiumPatientAppointmentTranscriptionAttachment = fetchedConsortiumPatientAppointmentTranscriptionAttachments;
            }
        }
        return consortiumPatientAppointmentTranscriptionAttachment;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatientAppointmentTranscriptionAttachment ' + e)
    }
}

exports.getConsortiumPatientAppointmentTranscriptionAttachmentListByConsortiumPatientAppointmentId = async function(consortiumPatientAppointmentId)
{    
    var fetchOptions = {
        consortiumPatientAppointment :  new mongoose.Types.ObjectId(consortiumPatientAppointmentId)
    };


    try {
        var consortiumPatientAppointmentTranscriptionAttachments = []
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentId))
        {
            consortiumPatientAppointmentTranscriptionAttachments = await ConsortiumPatientAppointmentTranscriptionAttachment.find(fetchOptions);
        }
        return consortiumPatientAppointmentTranscriptionAttachments;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatientAppointmentTranscriptionAttachment ' + e)
    }
}




