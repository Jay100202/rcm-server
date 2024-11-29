var AppointmentStatus = require('../models/appointmentStatus.model');
var ConsortiumPatientAppointment = require('../models/consortiumPatientAppointment.model');
var AppointmentStatusChangeLog = require('../models/appointmentStatusChangeLog.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');
var moment = require("moment");
var momentTZ = require('moment-timezone');


// Saving the context of this module inside the _the variable
_this = this


exports.getAppointmentStatusesForSelect = async function(req){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$statusText',
        'textI': { '$toLower': '$statusText' },
        'statusCode':'$statusCode' ,
        'priority':'$priority' ,
        'colorCode':'$colorCode' ,
        'isDefault':'$isDefault' ,
    };

    const sortOptions = {};
    sortOptions.priority = 1;

    let fetchOptions = {};

    try {
        var appointmentStatus = await AppointmentStatus.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            appointmentStatus.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return appointmentStatus;
    } catch (e) {
        throw Error('Error while Paginating AppointmentStatus ' + e)
    }
}


exports.findAppointmentStatusIdByCode = async function(statusCode)
{
    try {
        var resAppointmentStatus = await exports.findAppointmentStatusByCode(statusCode);
        var resAppointmentStatusId;
        if(resAppointmentStatus)
        {
            resAppointmentStatusId = resAppointmentStatus._id;
        }
        return resAppointmentStatusId;
    } catch (e) {
        throw Error('Error while Fetching AppointmentStatus' + e)
    }
}


exports.findAppointmentStatusByCode = async function(statusCode)
{
    var options = {
        statusCode : statusCode,
        isActive : 1
    };

    try {
       var resAppointmentStatus = await AppointmentStatus.findOne(options);
       return resAppointmentStatus;
    } catch (e) {
        throw Error('Error while Fetching AppointmentStatus' + e)
    }
}

exports.findDefaultAppointmentStatus = async function()
{
    var options = {
        isDefault : true,
        isActive : 1
    };

    try {
       var resAppointmentStatus = await AppointmentStatus.findOne(options);
       return resAppointmentStatus;
    } catch (e) {
        throw Error('Error while Fetching AppointmentStatus' + e)
    }
}


exports.findAppointmentStatusById = async function(appointmentStatusId)
{
    var options = {
        _id : new mongoose.Types.ObjectId(appointmentStatusId)
    };

    try {
        var resAppointmentStatus;
        if(mongodb.ObjectId.isValid(appointmentStatusId))
        {
            resAppointmentStatus = await AppointmentStatus.findOne(options);
        }
       return resAppointmentStatus;
    } catch (e) {
        throw Error('Error while Fetching AppointmentStatus' + e)
    }
}

//------------------------------------------------AppointmentStatusChangeLog-------------------------------------------------

exports.saveAppointmentStatusChangeLog = async function(appointmentStatusChangeLog)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    
    let modAppointmentStatusChangeLog = new AppointmentStatusChangeLog();
    
    modAppointmentStatusChangeLog.createdAt = currTs;

    if(appointmentStatusChangeLog.createdBySystemUser !== undefined)
    modAppointmentStatusChangeLog.createdBySystemUser = appointmentStatusChangeLog.createdBySystemUser;

    if(appointmentStatusChangeLog.createdByConsortiumUser !== undefined)
    modAppointmentStatusChangeLog.createdByConsortiumUser = appointmentStatusChangeLog.createdByConsortiumUser;

    if(appointmentStatusChangeLog.consortiumPatientAppointment !== undefined)
    modAppointmentStatusChangeLog.consortiumPatientAppointment = appointmentStatusChangeLog.consortiumPatientAppointment;

    if(appointmentStatusChangeLog.pastAppointmentStatus !== undefined)
    modAppointmentStatusChangeLog.pastAppointmentStatus = appointmentStatusChangeLog.pastAppointmentStatus;

    if(appointmentStatusChangeLog.updAppointmentStatus !== undefined)
    modAppointmentStatusChangeLog.updAppointmentStatus = appointmentStatusChangeLog.updAppointmentStatus;


    try{
        var savedAppointmentStatusChangeLog = await modAppointmentStatusChangeLog.save();
        var respAppointmentStatusChangeLog;
        if(savedAppointmentStatusChangeLog)
        {
            respAppointmentStatusChangeLog = JSON.parse(JSON.stringify(savedAppointmentStatusChangeLog));
        }
        return respAppointmentStatusChangeLog;
    }catch(e){
        throw Error("And Error occured while updating the AppointmentStatusChangeLog "+ e);
    }
}

exports.getAppointmentStatusChangeLogByPatientAppointment = async function(consortiumPatientAppointmentId){

    // Options setup for the mongoose paginate
    const populateOptions = [
        {
            path : 'pastAppointmentStatus',
            select : 'statusText colorCode priority'
        },
        {
            path : 'updAppointmentStatus',
            select : 'statusText colorCode priority'
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

        var appointmentStatusChangeLogs = [];
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentId))
        {
            appointmentStatusChangeLogs = await AppointmentStatusChangeLog.find(fetchOptions).populate(populateOptions).sort(sortOptions);
        }
        return appointmentStatusChangeLogs;
    } catch (e) {
        throw Error('Error while Fetching AppointmentStatus ' + e)
    }
}

exports.updateAppointmentStatus = async function(consortiumPatientAppointmentId, updAppointmentStatusId, systemUserId,consortiumUserId,updTranscriptionStatusNotes)
{
    var consortiumPatientAppointment;
    try
    {
        consortiumPatientAppointment = await ConsortiumPatientAppointment.findById(consortiumPatientAppointmentId);
    }
    catch(e)
    {
        throw Error("Error occured while Finding the appointment");
    }

    if(!consortiumPatientAppointment){
        return null;
    }

    const currTs = await AppCommonService.getCurrentTimestamp();
    var tzStr = AppConfig.SYSTEM_DEFAULT_TIMEZONE_STR;

    let transcriptionAllocationDate;
    let appointmentStatus = await exports.findAppointmentStatusById(updAppointmentStatusId);
    if(appointmentStatus)
    {
        let statusCode = appointmentStatus.statusCode;
        if(statusCode === AppConfigConst.APPOINTMENT_STATUS_CODE_CONSULTED)
        {
            transcriptionAllocationDate  = momentTZ().tz(tzStr).startOf('day').unix();;
        }
    }
    try
    {
        let pastAppointmentStatusId  = consortiumPatientAppointment.appointmentStatus;
        let pastTranscriptionStatusNotes  = consortiumPatientAppointment.transcriptionStatusNotes;
         
        consortiumPatientAppointment.appointmentStatus = updAppointmentStatusId;
        consortiumPatientAppointment.transcriptionStatusNotes = updTranscriptionStatusNotes;

        if(transcriptionAllocationDate !== undefined)
        {
            consortiumPatientAppointment.transcriptionAllocationDate = transcriptionAllocationDate;
        }

        let savedConsortiumPatientAppointment = await consortiumPatientAppointment.save();

        const insAppointmentStatusChangeLog = new AppointmentStatusChangeLog();
        insAppointmentStatusChangeLog.consortiumPatientAppointment = consortiumPatientAppointmentId;
        insAppointmentStatusChangeLog.pastAppointmentStatus = pastAppointmentStatusId;
        insAppointmentStatusChangeLog.pastAppointmentStatusNotes = pastTranscriptionStatusNotes;
        insAppointmentStatusChangeLog.updAppointmentStatus = updAppointmentStatusId;
        insAppointmentStatusChangeLog.updAppointmentStatusNotes = updTranscriptionStatusNotes;
        insAppointmentStatusChangeLog.createdAt = currTs;

        if(systemUserId)
        {
            insAppointmentStatusChangeLog.createdBySystemUser = systemUserId;
        }

        if(consortiumUserId)
        {
            insAppointmentStatusChangeLog.createdByConsortiumUser = consortiumUserId;
        }

        let savedAppointmentStatusChangeLog = await insAppointmentStatusChangeLog.save();
        return savedAppointmentStatusChangeLog;
    }
    catch(e)
    {
        throw Error("And Error occured while updating the ConsortiumPatientAppointment" + e);
        return null;
    }
}

exports.getAppointmentStatusChangeLogById = async function(appointmentStatusChangeLogId,withPopulation = false){

    // Options setup for the mongoose paginate
    let populateOptions = [];

    if(withPopulation !== undefined && withPopulation === true)
    {
        populateOptions = [
            {
                path : 'pastAppointmentStatus',
                select : 'statusText colorCode priority'
            },
            {
                path : 'updAppointmentStatus',
                select : 'statusText colorCode priority'
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
        _id: appointmentStatusChangeLogId,
    };

    var sortOptions = {
        createdAt: -1
    };

    try {
        var appointmentStatusChangeLog;
        if (mongodb.ObjectId.isValid(appointmentStatusChangeLogId)) {
            /* Fetch relevant record with populating details */
            appointmentStatusChangeLog = await AppointmentStatusChangeLog.findOne(options).populate(populateOptions).sort(sortOptions);
        }
        return appointmentStatusChangeLog;
    } catch (e) {
        throw Error('Error while Fetching appointmentStatusChangeLog' + e)
    }
  
}


exports.checkIfAppointmentStatusIsFirst = async function(appointmentId,appointmentStatusChangeLogId,logCreatedAt){


    /*Initialization of options for querying data*/
    var options = {
        appointment: appointmentId,
        _id: { $nin : [ appointmentStatusChangeLogId ] },
        createdAt: { $lte : logCreatedAt }
    };

    var sortOptions = {
        createdAt: -1
    };

    try {
        var appointmentStatusChangeLog;
        if (mongodb.ObjectId.isValid(appointmentStatusChangeLogId)) {
            /* Fetch relevant record with populating details */
            appointmentStatusChangeLog = await AppointmentStatusChangeLog.findOne(options).sort(sortOptions);
        }
        return appointmentStatusChangeLog;
    } catch (e) {
        throw Error('Error while Fetching appointmentStatusChangeLog' + e)
    }
  
}

exports.checkIfAppointmentStatusIsLast = async function(appointmentId,appointmentStatusChangeLogId,logCreatedAt){

    /*Initialization of options for querying data*/
    var options = {
        appointment: appointmentId,
        _id: { $nin : [ appointmentStatusChangeLogId ] },
        createdAt: { $gte : logCreatedAt }
    };

    var sortOptions = {
        createdAt: -1
    };

    try {
        var appointmentStatusChangeLog;
        if (mongodb.ObjectId.isValid(appointmentStatusChangeLogId)) {
            /* Fetch relevant record with populating details */
            appointmentStatusChangeLog = await AppointmentStatusChangeLog.findOne(options).sort(sortOptions);
        }
        return appointmentStatusChangeLog;
    } catch (e) {
        throw Error('Error while Fetching appointmentStatusChangeLog' + e)
    }
  
}


exports.deleteAppointmentStatusChangeLog = async function(id)
{
    var options = {
        _id : id,
    }
    try {
       await AppointmentStatusChangeLog.deleteOne(options);
    } catch (e) {
        throw Error('Error while Fetching Prospective' + e)
    }
}