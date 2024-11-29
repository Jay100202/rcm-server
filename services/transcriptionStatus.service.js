var TranscriptionStatus = require('../models/transcriptionStatus.model');
var ConsortiumPatientAppointment = require('../models/consortiumPatientAppointment.model');
var ConsortiumPatientAppointmentTranscriptionStatusChangeLog = require('../models/consortiumPatientAppointmentTranscriptionStatusChangeLog.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this


exports.findTranscriptionStatusIdByCode = async function(statusCode)
{
    try {
        var resTranscriptionStatus = await exports.findTranscriptionStatusByCode(statusCode);
        var resTranscriptionStatusId;
        if(resTranscriptionStatus)
        {
            resTranscriptionStatusId = resTranscriptionStatus._id;
        }
        return resTranscriptionStatusId;
    } catch (e) {
        throw Error('Error while Fetching TranscriptionStatus' + e)
    }
}


exports.findTranscriptionStatusByCode = async function(statusCode)
{
    var options = {
        statusCode : statusCode,
        isActive : 1
    };

    try {
       var resTranscriptionStatus = await TranscriptionStatus.findOne(options);
       return resTranscriptionStatus;
    } catch (e) {
        throw Error('Error while Fetching TranscriptionStatus' + e)
    }
}

exports.findTranscriptionStatusById = async function(id)
{
    var options = {
        _id : new mongoose.Types.ObjectId(id),
        isActive : 1
    };

    try {
        let transcriptionStatus;
        if(mongodb.ObjectId.isValid(id))
        {
            transcriptionStatus = await TranscriptionStatus.findOne(options);
        }
            
       return transcriptionStatus;
    } catch (e) {
        throw Error('Error while Fetching TranscriptionStatus' + e)
    }
}


exports.findTranscriptionStatuses = async function()
{
    var options = {
        isActive : 1
    };

    try {
       var resTranscriptionStatuses = await TranscriptionStatus.find(options);
       return resTranscriptionStatuses;
    } catch (e) {
        throw Error('Error while Fetching TranscriptionStatus' + e)
    }
}


exports.findDefaultTranscriptionStatusId = async function()
{
    var options = {
        isDefault : true,
        isActive : 1
    };

    try {
        let transcriptionStatusId;
       var resTranscriptionStatus = await TranscriptionStatus.findOne(options);
       if(resTranscriptionStatus)
       {
            transcriptionStatusId = resTranscriptionStatus._id;
       }
       return transcriptionStatusId;
    } catch (e) {
        throw Error('Error while Fetching TranscriptionStatus' + e)
    }
}

exports.findCompletedTranscriptionStatusId = async function()
{
    var options = {
        isCompleted : true,
        isActive : 1
    };

    try {
        let transcriptionStatusId;
       var resTranscriptionStatus = await TranscriptionStatus.findOne(options);
       if(resTranscriptionStatus)
       {
            transcriptionStatusId = resTranscriptionStatus._id;
       }
       return transcriptionStatusId;
    } catch (e) {
        throw Error('Error while Fetching TranscriptionStatus' + e)
    }
}


exports.findSubmittedTranscriptionStatusId = async function()
{
    var options = {
        isSubmitted : true,
        isActive : 1
    };

    try {
        let transcriptionStatusId;
       var resTranscriptionStatus = await TranscriptionStatus.findOne(options);
       if(resTranscriptionStatus)
       {
            transcriptionStatusId = resTranscriptionStatus._id;
       }
       return transcriptionStatusId;
    } catch (e) {
        throw Error('Error while Fetching TranscriptionStatus' + e)
    }
}


exports.getTranscriptionStatusesForSelect = async function(){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$statusText',
        'textI': { '$toLower': '$statusText' },
        'statusCode':'$statusCode' ,
        'colorCode':'$colorCode' ,
        'isDefault':'$isDefault' ,
        'isMT':'$isMT' ,
        'isQA':'$isQA' ,
    };

    const sortOptions = {};
    sortOptions.statusText = 1;

    let fetchOptions = {};

    try {
        var transcriptionStatus = await TranscriptionStatus.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            transcriptionStatus.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return transcriptionStatus;
    } catch (e) {
        throw Error('Error while Paginating TranscriptionStatus ' + e)
    }
}


//------------------------------------------------ConsortiumPatientAppointmentTranscriptionStatusChangeLog-------------------------------------------------

exports.saveConsortiumPatientAppointmentTranscriptionStatusChangeLog = async function(consortiumPatientAppointmentTranscriptionStatusChangeLog)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modConsortiumPatientAppointmentTranscriptionStatusChangeLog = new ConsortiumPatientAppointmentTranscriptionStatusChangeLog();
    
    modConsortiumPatientAppointmentTranscriptionStatusChangeLog.createdAt = currTs;

    if(consortiumPatientAppointmentTranscriptionStatusChangeLog.createdBySystemUser !== undefined)
    modConsortiumPatientAppointmentTranscriptionStatusChangeLog.createdBySystemUser = consortiumPatientAppointmentTranscriptionStatusChangeLog.createdBySystemUser;

    if(consortiumPatientAppointmentTranscriptionStatusChangeLog.createdByConsortiumUser !== undefined)
    modConsortiumPatientAppointmentTranscriptionStatusChangeLog.createdByConsortiumUser = consortiumPatientAppointmentTranscriptionStatusChangeLog.createdByConsortiumUser;

    if(consortiumPatientAppointmentTranscriptionStatusChangeLog.consortiumPatientAppointment !== undefined)
    modConsortiumPatientAppointmentTranscriptionStatusChangeLog.consortiumPatientAppointment = consortiumPatientAppointmentTranscriptionStatusChangeLog.consortiumPatientAppointment;

    if(consortiumPatientAppointmentTranscriptionStatusChangeLog.pastTranscriptionStatus !== undefined)
    modConsortiumPatientAppointmentTranscriptionStatusChangeLog.pastTranscriptionStatus = consortiumPatientAppointmentTranscriptionStatusChangeLog.pastTranscriptionStatus;

    if(consortiumPatientAppointmentTranscriptionStatusChangeLog.pastTranscriptionStatusNotes !== undefined)
    modConsortiumPatientAppointmentTranscriptionStatusChangeLog.pastTranscriptionStatusNotes = consortiumPatientAppointmentTranscriptionStatusChangeLog.pastTranscriptionStatusNotes;

    if(consortiumPatientAppointmentTranscriptionStatusChangeLog.updTranscriptionStatus !== undefined)
    modConsortiumPatientAppointmentTranscriptionStatusChangeLog.updTranscriptionStatus = consortiumPatientAppointmentTranscriptionStatusChangeLog.updTranscriptionStatus;

    if(consortiumPatientAppointmentTranscriptionStatusChangeLog.updTranscriptionStatusNotes !== undefined)
    modConsortiumPatientAppointmentTranscriptionStatusChangeLog.updTranscriptionStatusNotes = consortiumPatientAppointmentTranscriptionStatusChangeLog.updTranscriptionStatusNotes;

    if(consortiumPatientAppointmentTranscriptionStatusChangeLog.systemUserDaywiseWorkAllocation !== undefined)
    modConsortiumPatientAppointmentTranscriptionStatusChangeLog.systemUserDaywiseWorkAllocation = consortiumPatientAppointmentTranscriptionStatusChangeLog.systemUserDaywiseWorkAllocation;


    try{
        var savedConsortiumPatientAppointmentTranscriptionStatusChangeLog = await modConsortiumPatientAppointmentTranscriptionStatusChangeLog.save();
        var respConsortiumPatientAppointmentTranscriptionStatusChangeLog;
        if(savedConsortiumPatientAppointmentTranscriptionStatusChangeLog)
        {
            respConsortiumPatientAppointmentTranscriptionStatusChangeLog = JSON.parse(JSON.stringify(savedConsortiumPatientAppointmentTranscriptionStatusChangeLog));
        }
        return respConsortiumPatientAppointmentTranscriptionStatusChangeLog;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumPatientAppointmentTranscriptionStatusChangeLog "+ e);
    }
}

exports.getConsortiumPatientAppointmentTranscriptionStatusChangeLogByPatientAppointment = async function(consortiumPatientAppointmentId){

    // Options setup for the mongoose paginate
    const populateOptions = [
        {
            path : 'pastTranscriptionStatus',
            select : 'statusText colorCode'
        },
        {
            path : 'updTranscriptionStatus',
            select : 'statusText colorCode'
        },
        {
            path : 'createdBySystemUser',
            select : 'userFullName'
        },
        {
            path : 'createdByConsortiumUser',
            select : 'userFullName'
        },
    ];

    var fetchOptions = {
        consortiumPatientAppointment : new mongoose.Types.ObjectId(consortiumPatientAppointmentId)
    };

   
    let sortOptions = {
        'createdAt' : -1
    }

    try {

        var consortiumPatientAppointmentTranscriptionStatusChangeLogs = [];
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentId))
        {
            consortiumPatientAppointmentTranscriptionStatusChangeLogs = await ConsortiumPatientAppointmentTranscriptionStatusChangeLog.find(fetchOptions).populate(populateOptions).sort(sortOptions);
        }
        return consortiumPatientAppointmentTranscriptionStatusChangeLogs;
    } catch (e) {
        throw Error('Error while Fetching TranscriptionStatus ' + e)
    }
}

exports.updateTranscriptionStatus = async function(consortiumPatientAppointmentId, updTranscriptionStatusId,updTranscriptionStatusNotes, systemUserId,consortiumUserId,systemUserDaywiseWorkAllocationId)
{
    var consortiumPatientAppointment;
    try
    {
        consortiumPatientAppointment = await ConsortiumPatientAppointment.findById(consortiumPatientAppointmentId);
    }
    catch(e)
    {
        throw Error("Error occured while Finding the transcription");
    }

    if(!consortiumPatientAppointment){
        return null;
    }

    try
    {
        let pastTranscriptionStatusId  = consortiumPatientAppointment.transcriptionStatus;
        let pastTranscriptionStatusNotes  = consortiumPatientAppointment.transcriptionStatusNotes;
         
        const currTs = await AppCommonService.getCurrentTimestamp();
    
        consortiumPatientAppointment.transcriptionStatus = updTranscriptionStatusId;

        let savedConsortiumPatientAppointment = await consortiumPatientAppointment.save();

        const insConsortiumPatientAppointmentTranscriptionStatusChangeLog = new ConsortiumPatientAppointmentTranscriptionStatusChangeLog();
        insConsortiumPatientAppointmentTranscriptionStatusChangeLog.consortiumPatientAppointment = consortiumPatientAppointmentId;
        insConsortiumPatientAppointmentTranscriptionStatusChangeLog.pastTranscriptionStatus = pastTranscriptionStatusId;
        insConsortiumPatientAppointmentTranscriptionStatusChangeLog.pastTranscriptionStatusNotes = pastTranscriptionStatusNotes;
        insConsortiumPatientAppointmentTranscriptionStatusChangeLog.updTranscriptionStatus = updTranscriptionStatusId;
        insConsortiumPatientAppointmentTranscriptionStatusChangeLog.updTranscriptionStatusNotes = updTranscriptionStatusNotes;
        insConsortiumPatientAppointmentTranscriptionStatusChangeLog.createdAt = currTs;

        if(mongodb.ObjectId.isValid(systemUserDaywiseWorkAllocationId))
        {
            insConsortiumPatientAppointmentTranscriptionStatusChangeLog.systemUserDaywiseWorkAllocation = systemUserDaywiseWorkAllocationId;
        }

        if(mongodb.ObjectId.isValid(systemUserId))
        {
            insConsortiumPatientAppointmentTranscriptionStatusChangeLog.createdBySystemUser = systemUserId;
        }

        if(mongodb.ObjectId.isValid(consortiumUserId))
        {
            insConsortiumPatientAppointmentTranscriptionStatusChangeLog.createdByConsortiumUser = consortiumUserId;
        }

        let savedConsortiumPatientAppointmentTranscriptionStatusChangeLog = await insConsortiumPatientAppointmentTranscriptionStatusChangeLog.save();

        return savedConsortiumPatientAppointmentTranscriptionStatusChangeLog;
    }
    catch(e)
    {
        throw Error("And Error occured while updating the ConsortiumPatientAppointment" + e);
        return null;
    }
}

exports.getConsortiumPatientAppointmentTranscriptionStatusChangeLogById = async function(consortiumPatientAppointmentTranscriptionStatusChangeLogId,withPopulation = false){

    // Options setup for the mongoose paginate
    let populateOptions = [];

    if(withPopulation !== undefined && withPopulation === true)
    {
        populateOptions = [
            {
                path : 'pastTranscriptionStatus',
                select : 'statusText colorCode'
            },
            {
                path : 'updTranscriptionStatus',
                select : 'statusText colorCode'
            },
            {
                path : 'createdBySystemUser',
                select : 'userFullName'
            },
            {
                path : 'createdByConsortiumUser',
                select : 'userFullName'
            },
        ];
    }
 
    /*Initialization of options for querying data*/
    var options = {
        _id: consortiumPatientAppointmentTranscriptionStatusChangeLogId,
    };

    var sortOptions = {
        createdAt: -1
    };

    try {
        var consortiumPatientAppointmentTranscriptionStatusChangeLog;
        if (mongodb.ObjectId.isValid(consortiumPatientAppointmentTranscriptionStatusChangeLogId)) {
            /* Fetch relevant record with populating details */
            consortiumPatientAppointmentTranscriptionStatusChangeLog = await ConsortiumPatientAppointmentTranscriptionStatusChangeLog.findOne(options).populate(populateOptions).sort(sortOptions);
        }
        return consortiumPatientAppointmentTranscriptionStatusChangeLog;
    } catch (e) {
        throw Error('Error while Fetching consortiumPatientAppointmentTranscriptionStatusChangeLog' + e)
    }
  
}


exports.checkIfTranscriptionStatusIsFirst = async function(consortiumPatientAppointmentId,consortiumPatientAppointmentTranscriptionStatusChangeLogId,logCreatedAt){


    /*Initialization of options for querying data*/
    var options = {
        consortiumPatientAppointment: consortiumPatientAppointmentId,
        _id: { $nin : [ consortiumPatientAppointmentTranscriptionStatusChangeLogId ] },
        createdAt: { $lte : logCreatedAt }
    };

    var sortOptions = {
        createdAt: -1
    };

    try {
        var consortiumPatientAppointmentTranscriptionStatusChangeLog;
        if (mongodb.ObjectId.isValid(consortiumPatientAppointmentId)) {
            /* Fetch relevant record with populating details */
            consortiumPatientAppointmentTranscriptionStatusChangeLog = await ConsortiumPatientAppointmentTranscriptionStatusChangeLog.findOne(options).sort(sortOptions);
        }
        return consortiumPatientAppointmentTranscriptionStatusChangeLog;
    } catch (e) {
        throw Error('Error while Fetching consortiumPatientAppointmentTranscriptionStatusChangeLog' + e)
    }
  
}

exports.checkIfTranscriptionStatusIsLast = async function(consortiumPatientAppointmentId,consortiumPatientAppointmentTranscriptionStatusChangeLogId,logCreatedAt){

    /*Initialization of options for querying data*/
    var options = {
        consortiumPatientAppointment: consortiumPatientAppointmentId,
        _id: { $nin : [ consortiumPatientAppointmentTranscriptionStatusChangeLogId ] },
        createdAt: { $gte : logCreatedAt }
    };

    var sortOptions = {
        createdAt: -1
    };

    try {
        var consortiumPatientAppointmentTranscriptionStatusChangeLog;
        if (mongodb.ObjectId.isValid(consortiumPatientAppointmentId)) {
            /* Fetch relevant record with populating details */
            consortiumPatientAppointmentTranscriptionStatusChangeLog = await ConsortiumPatientAppointmentTranscriptionStatusChangeLog.findOne(options).sort(sortOptions);
        }
        return consortiumPatientAppointmentTranscriptionStatusChangeLog;
    } catch (e) {
        throw Error('Error while Fetching consortiumPatientAppointmentTranscriptionStatusChangeLog' + e)
    }
  
}


exports.deleteConsortiumPatientAppointmentTranscriptionStatusChangeLog = async function(id)
{
    var options = {
        _id : id,
    }
    try {
       await ConsortiumPatientAppointmentTranscriptionStatusChangeLog.deleteOne(options);
    } catch (e) {
        throw Error('Error while Fetching Prospective' + e)
    }
}