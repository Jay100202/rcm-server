var SystemUserDaywiseWorkAllocation = require('../models/systemUserDaywiseWorkAllocation.model');
var SystemUserDaywiseWorkAllocationLog = require('../models/systemUserDaywiseWorkAllocationLog.model');
var SystemUserDaywiseWorkAllocationPatientAppointmentService = require('./systemUserDaywiseWorkAllocationPatientAppointment.service')
var ActivityStatusService = require('./activityStatus.service')
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');
var moment = require("moment");
var momentTZ = require('moment-timezone');

// Saving the context of this module inside the _the variable
_this = this


exports.saveSystemUserDaywiseWorkAllocation = async function(systemUserDaywiseWorkAllocation)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modSystemUserDaywiseWorkAllocation = new SystemUserDaywiseWorkAllocation();
    
    modSystemUserDaywiseWorkAllocation.createdAt = currTs;

    if(systemUserDaywiseWorkAllocation.systemUser !== undefined)
    modSystemUserDaywiseWorkAllocation.systemUser = systemUserDaywiseWorkAllocation.systemUser;

    if(systemUserDaywiseWorkAllocation.consDate !== undefined)
    modSystemUserDaywiseWorkAllocation.consDate = systemUserDaywiseWorkAllocation.consDate;

    if(systemUserDaywiseWorkAllocation.assignedActivityCount !== undefined)
    modSystemUserDaywiseWorkAllocation.assignedActivityCount = systemUserDaywiseWorkAllocation.assignedActivityCount;

    if(systemUserDaywiseWorkAllocation.assignedActivityDurationInSeconds !== undefined)
    modSystemUserDaywiseWorkAllocation.assignedActivityDurationInSeconds = systemUserDaywiseWorkAllocation.assignedActivityDurationInSeconds;

    if(systemUserDaywiseWorkAllocation.completedActivityCount !== undefined)
    modSystemUserDaywiseWorkAllocation.completedActivityCount = systemUserDaywiseWorkAllocation.completedActivityCount;

    if(systemUserDaywiseWorkAllocation.completedActivityDurationInSeconds !== undefined)
    modSystemUserDaywiseWorkAllocation.completedActivityDurationInSeconds = systemUserDaywiseWorkAllocation.completedActivityDurationInSeconds;

    if(systemUserDaywiseWorkAllocation.pendingActivityCount !== undefined)
    modSystemUserDaywiseWorkAllocation.pendingActivityCount = systemUserDaywiseWorkAllocation.pendingActivityCount;

    if(systemUserDaywiseWorkAllocation.pendingActivityDurationInSeconds !== undefined)
    modSystemUserDaywiseWorkAllocation.pendingActivityDurationInSeconds = systemUserDaywiseWorkAllocation.pendingActivityDurationInSeconds;

    if(systemUserDaywiseWorkAllocation.updatedAt !== undefined)
    modSystemUserDaywiseWorkAllocation.updatedAt = systemUserDaywiseWorkAllocation.updatedAt;

    try{
        var savedSystemUserDaywiseWorkAllocation = await modSystemUserDaywiseWorkAllocation.save();
        var respSystemUserDaywiseWorkAllocation;
        if(savedSystemUserDaywiseWorkAllocation)
        {
            respSystemUserDaywiseWorkAllocation = JSON.parse(JSON.stringify(savedSystemUserDaywiseWorkAllocation));
        }
        return respSystemUserDaywiseWorkAllocation;
    }catch(e){
        throw Error("And Error occured while updating the SystemUserDaywiseWorkAllocation "+ e);
    }
}


exports.findSystemUserDaywiseWorkAllocationBySystemUserIdAndDate = async function(systemUserId,consDate){

    // Options setup for the mongoose paginate
    const populateOptions = [
        {
            path : 'systemUser',
            select : 'systemUserName'
        },
    ];

    var options = {
        systemUser : new mongoose.Types.ObjectId(systemUserId),
        consDate : consDate
    }
    try {
       var systemUserDaywiseWorkAllocation;
       if(mongodb.ObjectId.isValid(systemUserId)) {
        systemUserDaywiseWorkAllocation = await SystemUserDaywiseWorkAllocation.findOne(options).populate(populateOptions);
       }
       return systemUserDaywiseWorkAllocation;
    } catch (e) {
        throw Error('Error while Fetching SystemUserDaywiseWorkAllocation' + e)
    }
}


exports.createAndFetchSystemUserDaywiseWorkAllocationBySystemUserId = async function(systemUserId,consDate){

    if(mongodb.ObjectId.isValid(systemUserId)) {

        let systemUserDaywiseWorkAllocation = await exports.findSystemUserDaywiseWorkAllocationBySystemUserIdAndDate(systemUserId,consDate);
       
        if(systemUserDaywiseWorkAllocation)
        {
            return systemUserDaywiseWorkAllocation;
        }
        else
        {
            const currTs = await AppCommonService.getCurrentTimestamp();

            let createSystemUserDaywiseWorkAllocation = {
                systemUser : systemUserId,
                consDate : consDate,
                assignedActivityCount : 0,
                assignedActivityDurationInSeconds : 0,
                completedActivityCount : 0,
                completedActivityDurationInSeconds : 0,
                pendingActivityCount : 0,
                pendingActivityDurationInSeconds : 0,
                updatedAt : currTs,
            }
    

            let newSystemUserDaywiseWorkAllocation = await exports.saveSystemUserDaywiseWorkAllocation(createSystemUserDaywiseWorkAllocation);
            return newSystemUserDaywiseWorkAllocation;
        }
      
    }
}


exports.findSystemUserDaywiseWorkAllocationListBySystemUserId = async function(systemUserId){

    // Options setup for the mongoose paginate
    const populateOptions = [
        {
            path : 'systemUser',
            select : 'systemUserName'
        },
    ];

    var options = {
        systemUser : new mongoose.Types.ObjectId(systemUserId),
    }
    try {
       var systemUserDaywiseWorkAllocation;
       if(mongodb.ObjectId.isValid(systemUserId)) {
        systemUserDaywiseWorkAllocation = await SystemUserDaywiseWorkAllocation.find(options).populate(populateOptions);
       }
       return systemUserDaywiseWorkAllocation;
    } catch (e) {
        throw Error('Error while Fetching SystemUserDaywiseWorkAllocation' + e)
    }
}


exports.recalculateSystemUserDaywiseWorkAllocation = async function(systemUserId,consDate){

    if(mongodb.ObjectId.isValid(systemUserId)) {

        let systemUserDaywiseWorkAllocation = await exports.findSystemUserDaywiseWorkAllocationBySystemUserIdAndDate(systemUserId,consDate);
       
        if(systemUserDaywiseWorkAllocation)
        {
            let systemUserDaywiseWorkAllocationId = systemUserDaywiseWorkAllocation._id;

            let pendingActivityStatusId = await ActivityStatusService.findActivityStatusIdByCode(AppConfigConst.ACTIVITY_STATUS_PENDING_CODE);
            let assignedActivityMetric = await SystemUserDaywiseWorkAllocationPatientAppointmentService.getSystemUserDaywiseWorkAllocationPatientAppointmentAssignedActivityMetric(systemUserDaywiseWorkAllocationId,pendingActivityStatusId);
       
            var assignedActivityCount = 0,assignedActivityDurationInSeconds = 0;
            if(assignedActivityMetric)
            {
                assignedActivityCount = assignedActivityMetric.totalActivityCountCount;
                assignedActivityDurationInSeconds = assignedActivityMetric.totalActivityDurationInSeconds;
            }

            let inProgressActivityStatusId = await ActivityStatusService.findActivityStatusIdByCode(AppConfigConst.ACTIVITY_STATUS_IN_PROGRESS_CODE);
            let pendingActivityMetric = await SystemUserDaywiseWorkAllocationPatientAppointmentService.getSystemUserDaywiseWorkAllocationPatientAppointmentAssignedActivityMetric(systemUserDaywiseWorkAllocationId,inProgressActivityStatusId);
       
            var pendingActivityCount = 0,pendingActivityDurationInSeconds = 0;
            if(pendingActivityMetric)
            {
                pendingActivityCount = pendingActivityMetric.totalActivityCountCount;
                pendingActivityDurationInSeconds = pendingActivityMetric.totalActivityDurationInSeconds;
            }

            let completedActivityStatusId = await ActivityStatusService.findActivityStatusIdByCode(AppConfigConst.ACTIVITY_STATUS_COMPLETED_CODE);
            let completedActivityMetric = await SystemUserDaywiseWorkAllocationPatientAppointmentService.getSystemUserDaywiseWorkAllocationPatientAppointmentAssignedActivityMetric(systemUserDaywiseWorkAllocationId,completedActivityStatusId);
       
            var completedActivityCount = 0,completedActivityDurationInSeconds = 0;
            if(completedActivityMetric)
            {
                completedActivityCount = completedActivityMetric.totalActivityCountCount;
                completedActivityDurationInSeconds = completedActivityMetric.totalActivityDurationInSeconds;
            }

            systemUserDaywiseWorkAllocation.assignedActivityCount = assignedActivityCount;
            systemUserDaywiseWorkAllocation.assignedActivityDurationInSeconds = assignedActivityDurationInSeconds;
            systemUserDaywiseWorkAllocation.pendingActivityCount = pendingActivityCount;
            systemUserDaywiseWorkAllocation.pendingActivityDurationInSeconds = pendingActivityDurationInSeconds;
            systemUserDaywiseWorkAllocation.completedActivityCount = completedActivityCount;
            systemUserDaywiseWorkAllocation.completedActivityDurationInSeconds = completedActivityDurationInSeconds;

           
            return await systemUserDaywiseWorkAllocation.save();
        }
        
    }
}


//--------------------------------------------------------------SystemUserDaywiseWorkAllocationLog-------------------------------------------------------------------------


exports.saveSystemUserDaywiseWorkAllocationLog = async function(systemUserDaywiseWorkAllocationLog)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    
    let modSystemUserDaywiseWorkAllocationLog = new SystemUserDaywiseWorkAllocationLog();
    
    modSystemUserDaywiseWorkAllocationLog.createdAt = currTs;

    if(systemUserDaywiseWorkAllocationLog.createdBy !== undefined)
    modSystemUserDaywiseWorkAllocationLog.createdBy = systemUserDaywiseWorkAllocationLog.createdBy;

    if(systemUserDaywiseWorkAllocationLog.consortiumPatientAppointment !== undefined)
    modSystemUserDaywiseWorkAllocationLog.consortiumPatientAppointment = systemUserDaywiseWorkAllocationLog.consortiumPatientAppointment;

    if(systemUserDaywiseWorkAllocationLog.actionCode !== undefined)
    modSystemUserDaywiseWorkAllocationLog.actionCode = systemUserDaywiseWorkAllocationLog.actionCode;

    if(systemUserDaywiseWorkAllocationLog.pastTranscriptorRole !== undefined)
    modSystemUserDaywiseWorkAllocationLog.pastTranscriptorRole = systemUserDaywiseWorkAllocationLog.pastTranscriptorRole;

    if(systemUserDaywiseWorkAllocationLog.updTranscriptorRole !== undefined)
    modSystemUserDaywiseWorkAllocationLog.updTranscriptorRole = systemUserDaywiseWorkAllocationLog.updTranscriptorRole;

    if(systemUserDaywiseWorkAllocationLog.pastTranscriptionAllocationDate !== undefined)
    modSystemUserDaywiseWorkAllocationLog.pastTranscriptionAllocationDate = systemUserDaywiseWorkAllocationLog.pastTranscriptionAllocationDate;

    if(systemUserDaywiseWorkAllocationLog.updTranscriptionAllocationDate !== undefined)
    modSystemUserDaywiseWorkAllocationLog.updTranscriptionAllocationDate = systemUserDaywiseWorkAllocationLog.updTranscriptionAllocationDate;

    if(systemUserDaywiseWorkAllocationLog.systemUserDaywiseWorkAllocationPatientAppointment !== undefined)
    modSystemUserDaywiseWorkAllocationLog.systemUserDaywiseWorkAllocationPatientAppointment = systemUserDaywiseWorkAllocationLog.systemUserDaywiseWorkAllocationPatientAppointment;


    try{
        var savedSystemUserDaywiseWorkAllocationLog = await modSystemUserDaywiseWorkAllocationLog.save();
        var respSystemUserDaywiseWorkAllocationLog;
        if(savedSystemUserDaywiseWorkAllocationLog)
        {
            respSystemUserDaywiseWorkAllocationLog = JSON.parse(JSON.stringify(savedSystemUserDaywiseWorkAllocationLog));
        }
        return respSystemUserDaywiseWorkAllocationLog;
    }catch(e){
        throw Error("And Error occured while updating the SystemUserDaywiseWorkAllocationLog "+ e);
    }
}


exports.getSystemUserDaywiseWorkAllocationLogByPatientAppointment = async function(consortiumPatientAppointmentId,withPopulation = true){


    // Options setup for the mongoose paginate
    let populateOptions = [];

    if(withPopulation !== undefined && withPopulation === true)
    {
        populateOptions = [
        {
            path : 'pastTranscriptorRole',
        },
        {
            path : 'updTranscriptorRole',
        },
        {
            path : 'systemUserDaywiseWorkAllocationPatientAppointment',
        },
        {
            path : 'createdBy',
            select : 'userFullName'
        },
        ];
    }


    var fetchOptions = {
        consortiumPatientAppointment : new mongoose.Types.ObjectId(consortiumPatientAppointmentId)
    };

   
    let sortOptions = {
        'createdAt' : -1
    }

    try {

        var systemUserDaywiseWorkAllocationLogs = [];
        if(mongodb.ObjectId.isValid(consortiumPatientAppointmentId))
        {
            systemUserDaywiseWorkAllocationLogs = await SystemUserDaywiseWorkAllocationLog.find(fetchOptions).populate(populateOptions).sort(sortOptions);
        }
        return systemUserDaywiseWorkAllocationLogs;
    } catch (e) {
        throw Error('Error while Fetching AppointmentStatus ' + e)
    }
}


exports.getSystemUserDaywiseWorkAllocationLogBySystemUserDaywiseWorkAllocationPatientAppointmentId = async function(systemUserDaywiseWorkAllocationPatientAppointmentId,withPopulation = false){

    // Options setup for the mongoose paginate
    let populateOptions = [];

    if(withPopulation !== undefined && withPopulation === true)
    {
        populateOptions = [
        {
            path : 'pastTranscriptorRole',
        },
        {
            path : 'updTranscriptorRole',
        },
        {
            path : 'createdBy',
            select : 'userFullName'
        },
        ];
    }

    var fetchOptions = {
        systemUserDaywiseWorkAllocationPatientAppointment : new mongoose.Types.ObjectId(systemUserDaywiseWorkAllocationPatientAppointmentId)
    };

   
    let sortOptions = {
        'createdAt' : -1
    }

    try {

        var systemUserDaywiseWorkAllocationLogs = [];
        if(mongodb.ObjectId.isValid(systemUserDaywiseWorkAllocationPatientAppointmentId))
        {
            systemUserDaywiseWorkAllocationLogs = await SystemUserDaywiseWorkAllocationLog.find(fetchOptions).populate(populateOptions).sort(sortOptions);
        }
        return systemUserDaywiseWorkAllocationLogs;
    } catch (e) {
        throw Error('Error while Fetching AppointmentStatus ' + e)
    }
}