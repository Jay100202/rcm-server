var ConsortiumPatientAppointmentDictationAttachment = require('../models/consortiumPatientAppointmentDictationAttachment.model');
var ConsortiumService = require('./consortium.service');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var AppUploadService = require('./appUpload.service');
var mongodb = require("mongodb");
var mongoose = require('mongoose');

// Saving the context of this module inside the _the variable
_this = this

// Async function to add ConsortiumPatientAppointmentDictationAttachment
exports.saveConsortiumPatientAppointmentDictationAttachment = async function(consortiumPatientAppointmentDictationAttachment)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modConsortiumPatientAppointmentDictationAttachment = null;
    if(mongodb.ObjectId.isValid(consortiumPatientAppointmentDictationAttachment.id))
    {
        try
        {
            modConsortiumPatientAppointmentDictationAttachment = await ConsortiumPatientAppointmentDictationAttachment.findById(consortiumPatientAppointmentDictationAttachment.id);
        }
        catch(e){
            throw Error("Error occured while Finding the ConsortiumPatientAppointmentDictationAttachment")
        }
    }

    let isAdd = false;
    if(!modConsortiumPatientAppointmentDictationAttachment){
        modConsortiumPatientAppointmentDictationAttachment = new ConsortiumPatientAppointmentDictationAttachment();
        modConsortiumPatientAppointmentDictationAttachment.createdAt = currTs;
     
        if(consortiumPatientAppointmentDictationAttachment.createdBySystemUser !== undefined)
        modConsortiumPatientAppointmentDictationAttachment.createdBySystemUser = consortiumPatientAppointmentDictationAttachment.createdBySystemUser
    
        if(consortiumPatientAppointmentDictationAttachment.createdByConsortiumUser !== undefined)
        modConsortiumPatientAppointmentDictationAttachment.createdByConsortiumUser = consortiumPatientAppointmentDictationAttachment.createdByConsortiumUser

        
        isAdd = true;
    }

    modConsortiumPatientAppointmentDictationAttachment.updatedAt = currTs;
    modConsortiumPatientAppointmentDictationAttachment.updatedBy = consortiumPatientAppointmentDictationAttachment.updatedBy;

    if(consortiumPatientAppointmentDictationAttachment.consortium !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.consortium = consortiumPatientAppointmentDictationAttachment.consortium

    if(consortiumPatientAppointmentDictationAttachment.consortiumPatientAppointment !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.consortiumPatientAppointment = consortiumPatientAppointmentDictationAttachment.consortiumPatientAppointment

    if(consortiumPatientAppointmentDictationAttachment.attFilePath !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.attFilePath = consortiumPatientAppointmentDictationAttachment.attFilePath

    if(consortiumPatientAppointmentDictationAttachment.attFilePathActual !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.attFilePathActual = consortiumPatientAppointmentDictationAttachment.attFilePathActual

    if(consortiumPatientAppointmentDictationAttachment.attFilePathThumb !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.attFilePathThumb = consortiumPatientAppointmentDictationAttachment.attFilePathThumb

    if(consortiumPatientAppointmentDictationAttachment.attFileName !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.attFileName = consortiumPatientAppointmentDictationAttachment.attFileName

    if(consortiumPatientAppointmentDictationAttachment.attFileSizeBytes !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.attFileSizeBytes = consortiumPatientAppointmentDictationAttachment.attFileSizeBytes

    if(consortiumPatientAppointmentDictationAttachment.attFileUrl !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.attFileUrl = consortiumPatientAppointmentDictationAttachment.attFileUrl

    if(consortiumPatientAppointmentDictationAttachment.attImageActualUrl !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.attImageActualUrl = consortiumPatientAppointmentDictationAttachment.attImageActualUrl

    if(consortiumPatientAppointmentDictationAttachment.attImageThumbUrl !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.attImageThumbUrl = consortiumPatientAppointmentDictationAttachment.attImageThumbUrl

    if(consortiumPatientAppointmentDictationAttachment.attFileUrlExpiresAt !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.attFileUrlExpiresAt = consortiumPatientAppointmentDictationAttachment.attFileUrlExpiresAt

    if(consortiumPatientAppointmentDictationAttachment.isImage !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.isImage = consortiumPatientAppointmentDictationAttachment.isImage

    if(consortiumPatientAppointmentDictationAttachment.hasDuration !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.hasDuration = consortiumPatientAppointmentDictationAttachment.hasDuration

    if(consortiumPatientAppointmentDictationAttachment.isAudio !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.isAudio = consortiumPatientAppointmentDictationAttachment.isAudio

    if(consortiumPatientAppointmentDictationAttachment.attDurationInSeconds !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.attDurationInSeconds = consortiumPatientAppointmentDictationAttachment.attDurationInSeconds

    if(consortiumPatientAppointmentDictationAttachment.notes !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.notes = consortiumPatientAppointmentDictationAttachment.notes


    if(consortiumPatientAppointmentDictationAttachment.updatedBySystemUser !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.updatedBySystemUser = consortiumPatientAppointmentDictationAttachment.updatedBySystemUser

    if(consortiumPatientAppointmentDictationAttachment.updatedByConsortiumUser !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.updatedByConsortiumUser = consortiumPatientAppointmentDictationAttachment.updatedByConsortiumUser

    if(consortiumPatientAppointmentDictationAttachment.isDeleted !== undefined)
    modConsortiumPatientAppointmentDictationAttachment.isDeleted = consortiumPatientAppointmentDictationAttachment.isDeleted


    try{
        var savedConsortiumPatientAppointmentDictationAttachment = await modConsortiumPatientAppointmentDictationAttachment.save();
        if(savedConsortiumPatientAppointmentDictationAttachment)
        {
            await ConsortiumService.recalculateConsortiumCount(savedConsortiumPatientAppointmentDictationAttachment.consortium);
        }
        return savedConsortiumPatientAppointmentDictationAttachment;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumPatientAppointmentDictationAttachment "+ e);
    }
}

exports.removeConsortiumPatientAppointmentDictationAttachment = async function(consortiumPatientAppointmentDictationAttachmentId)
{
    try{
        var consortiumPatientAppointmentDictationAttachment = await exports.getConsortiumPatientAppointmentDictationAttachmentBaseObjectById(consortiumPatientAppointmentDictationAttachmentId, true);
        if(consortiumPatientAppointmentDictationAttachment)
        {
            const isImage = consortiumPatientAppointmentDictationAttachment.isImage;
            let consortium = consortiumPatientAppointmentDictationAttachment.consortium;

            if(isImage === true)
            {
                await AppUploadService.removeConsortiumPatientAppointmentDictationAttachment(consortium,isImage, consortiumPatientAppointmentDictationAttachment.attFilePathActual);
                await AppUploadService.removeConsortiumPatientAppointmentDictationAttachment(consortium,isImage, consortiumPatientAppointmentDictationAttachment.attFilePathThumb);
            }
            else
            {
                await AppUploadService.removeConsortiumPatientAppointmentDictationAttachment(consortium,isImage, consortiumPatientAppointmentDictationAttachment.attFilePath);
            }
            consortiumPatientAppointmentDictationAttachment.remove();
        }
        return;
    }
    catch(e){
        throw Error("And Error occured while inserting the ConsortiumPatientAppointmentDictationAttachment "+ e);
    }
}

exports.getConsortiumPatientAppointmentDictationAttachmentBaseObjectById = async function(consortiumPatientAppointmentDictationAttachmentId,withPopulation){
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
        _id : new mongoose.Types.ObjectId(consortiumPatientAppointmentDictationAttachmentId)
    };

    try {
        var consortiumPatientAppointmentDictationAttachment;
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentDictationAttachmentId))
        {
            consortiumPatientAppointmentDictationAttachment = await ConsortiumPatientAppointmentDictationAttachment.findOne(fetchOptions).populate(populateOptions);
        }
        return consortiumPatientAppointmentDictationAttachment;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatientAppointmentDictationAttachment' + e)
    }
}

exports.findConsortiumPatientAppointmentDictationAttachmentByConsortiumPatientAppointmentId = async function(consortium,consortiumPatientAppointmentId)
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
        'createdAt': '$createdAt',
        'attFileUrl': '$attFileUrl',
        'attImgUrl': '$attImageActualUrl',
        'attImgThumbUrl': '$attImageThumbUrl',
        'attFileUrlExpiresAt': '$attFileUrlExpiresAt',
    };

    const sortOptions = {
        createdAt: -1
    };

    try {
        var consortiumPatientAppointmentDictationAttachment = [];
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentId))
        {
            let fetchedConsortiumPatientAppointmentDictationAttachments = await ConsortiumPatientAppointmentDictationAttachment.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);

            fetchedConsortiumPatientAppointmentDictationAttachments = await ConsortiumPatientAppointmentDictationAttachment.populate(fetchedConsortiumPatientAppointmentDictationAttachments, populateOptions);

            if(fetchedConsortiumPatientAppointmentDictationAttachments && fetchedConsortiumPatientAppointmentDictationAttachments.length > 0)
            {
                consortiumPatientAppointmentDictationAttachment = fetchedConsortiumPatientAppointmentDictationAttachments;
            }
        }
        return consortiumPatientAppointmentDictationAttachment;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatientAppointmentDictationAttachment ' + e)
    }
}

exports.getConsortiumPatientAppointmentDictationAttachmentListByConsortiumPatientAppointmentId = async function(consortiumPatientAppointmentId)
{    
    var fetchOptions = {
        consortiumPatientAppointment :  new mongoose.Types.ObjectId(consortiumPatientAppointmentId)
    };


    try {
        var consortiumPatientAppointmentDictationAttachments = []
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentId))
        {
            consortiumPatientAppointmentDictationAttachments = await ConsortiumPatientAppointmentDictationAttachment.find(fetchOptions);
        }
        return consortiumPatientAppointmentDictationAttachments;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatientAppointmentDictationAttachment ' + e)
    }
}


exports.getConsortiumPatientAppointmentDictationAttachmentTotalDicationDuration = async function(consortiumPatientAppointmentId)
{    
    const countProjectObj = {
        '_id': 0,
        'attDurationInSeconds':"$attDurationInSeconds",
        'attFileSizeBytes':"$attFileSizeBytes",
    };           

    var fetchOptions = {
        consortiumPatientAppointment :  new mongoose.Types.ObjectId(consortiumPatientAppointmentId)
    };


    try {
        let totalDictationUploadCount = 0;
        let totalDicationDurationInSeconds = 0;
        let totalDicationAttachmentFileSizeBytes = 0;
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentId))
        {
            let recordCntData =  await ConsortiumPatientAppointmentDictationAttachment.aggregate([
                {
                    $match: fetchOptions
                },
                {
                    $project: countProjectObj
                },
                {
                    $group: { 
                                _id: null,
                                totalDictationUploadCount: { $sum: 1 },
                                totalDicationDurationInSeconds: { $sum: '$attDurationInSeconds' },
                                totalDicationAttachmentFileSizeBytes: { $sum: '$attFileSizeBytes' },
                            }
                }
            ]);

            if(recordCntData && recordCntData.length > 0)
            {  
                const recCntObj = recordCntData[0];
                totalDictationUploadCount = recCntObj.totalDictationUploadCount;
                totalDicationDurationInSeconds = recCntObj.totalDicationDurationInSeconds;
                totalDicationAttachmentFileSizeBytes = recCntObj.totalDicationAttachmentFileSizeBytes;
                
            }
    
        }

        let response = {
            totalDictationUploadCount : totalDictationUploadCount,
            totalDicationDurationInSeconds : totalDicationDurationInSeconds,
            totalDicationAttachmentFileSizeBytes : totalDicationAttachmentFileSizeBytes,
        }

        return response;
       
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatientAppointmentDictationAttachment ' + e)
    }
}


