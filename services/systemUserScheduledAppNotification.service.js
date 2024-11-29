var SystemUserScheduledAppNotification = require('../models/systemUserScheduledAppNotification.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this


exports.createSystemUserScheduledAppNotification = async function(systemUserScheduledAppNotification)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    var modSystemUserScheduledAppNotification = new SystemUserScheduledAppNotification();

    modSystemUserScheduledAppNotification.createdAt = currTs;

    if(systemUserScheduledAppNotification.systemUser !== undefined)
    modSystemUserScheduledAppNotification.systemUser = systemUserScheduledAppNotification.systemUser;

    if(systemUserScheduledAppNotification.moduleCode !== undefined)
    modSystemUserScheduledAppNotification.moduleCode = systemUserScheduledAppNotification.moduleCode;

    if(systemUserScheduledAppNotification.actionCode !== undefined)
    modSystemUserScheduledAppNotification.actionCode = systemUserScheduledAppNotification.actionCode;

    if(systemUserScheduledAppNotification.consortiumChatThread !== undefined)
    modSystemUserScheduledAppNotification.consortiumChatThread = systemUserScheduledAppNotification.consortiumChatThread;

    if(systemUserScheduledAppNotification.consortiumChatThreadMessage !== undefined)
    modSystemUserScheduledAppNotification.consortiumChatThreadMessage = systemUserScheduledAppNotification.consortiumChatThreadMessage;

    if(systemUserScheduledAppNotification.scheduledAt !== undefined)
    modSystemUserScheduledAppNotification.scheduledAt = systemUserScheduledAppNotification.scheduledAt;

    try{
        var savedSystemUserScheduledAppNotification = await modSystemUserScheduledAppNotification.save();
        return savedSystemUserScheduledAppNotification;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumChatThread "+ e);
    }
}

exports.getSystemUserScheduledAppNotificationBaseObjectById = async function(systemUserScheduledAppNotificationId, withPopulation){
    // Options setup for the mongoose paginate
    let populateOptions = [];

    if(withPopulation !== undefined && withPopulation === true)
    {
        populateOptions = [
            {
                path : 'consortiumChatThread',
            },
            {
                path : 'consortiumChatThreadMessage',
            },
            {
            	path : 'systemUser',
                select : 'userFullName'
            },
            {
            	path : 'systemUser',
                select : 'userFullName'
            }
        ];
    }
    
    var fetchOptions = {
        _id : systemUserScheduledAppNotificationId,
    };
  
    try {
        var systemUserScheduledAppNotification;
        if(mongodb.ObjectId.isValid(systemUserScheduledAppNotificationId))
        {
            systemUserScheduledAppNotification = await SystemUserScheduledAppNotification.findOne(fetchOptions).populate(populateOptions);
        }
        return systemUserScheduledAppNotification;
    } catch (e) {
        throw Error('Error while Fetching SystemUserScheduledAppNotification getSystemUserScheduledAppNotificationBaseObjectById' + e)
    }
}

exports.findSystemUserScheduledAppNotificationById = async function(systemUserScheduledAppNotificationId, withPopulation = true){
    // Options setup for the mongoose paginate
    try
    {
        var resSystemUserScheduledAppNotification;
        var systemUserScheduledAppNotification = await exports.getSystemUserScheduledAppNotificationBaseObjectById(systemUserScheduledAppNotificationId, withPopulation);
        if(systemUserScheduledAppNotification)
        {
            resSystemUserScheduledAppNotification = JSON.parse(JSON.stringify(systemUserScheduledAppNotification));  
    
        }
        return resSystemUserScheduledAppNotification;
    } catch (e) {
        throw Error('Error while Fetching OrganizationUser findSystemUserScheduledAppNotificationById ' + e)
    }
}

exports.removeSystemUserScheduledAppNotificationById = async function(systemUserScheduledAppNotificationId){
    // Options setup for the mongoose paginate
    try
    {
        var systemUserScheduledAppNotification = await exports.getSystemUserScheduledAppNotificationBaseObjectById(systemUserScheduledAppNotificationId, false);
        if(systemUserScheduledAppNotification)
        {
            return await systemUserScheduledAppNotification.remove();
        }

    } catch (e) {
        throw Error('Error while Fetching OrganizationUser findSystemUserScheduledAppNotificationById ' + e)
    }
}


exports.getSystemUserScheduledAppNotificationForPushNotification = async function(){

    let populateOptions = [
        {
            path : 'consortiumChatThread',
        },
        {
            path : 'consortiumChatThreadMessage',
        },
        {
            path : 'systemUser',
            select : 'userFullName'
        },
    ];

    let sortOption = {
        scheduledAt : 1
    }

    try {
        var  systemUserScheduledAppNotifications = await SystemUserScheduledAppNotification.find().populate(populateOptions).sort(sortOption).limit(AppConfigConst.APP_NOTIFICATION_LIMIT);
        return systemUserScheduledAppNotifications;
    } catch (e) {
        throw Error('Error while Fetching SystemUserScheduledAppNotification getSystemUserScheduledAppNotificationForPushNotification' + e)
    }
}