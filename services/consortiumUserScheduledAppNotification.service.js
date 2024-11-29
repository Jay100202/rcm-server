var ConsortiumUserScheduledAppNotification = require('../models/consortiumUserScheduledAppNotification.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this

exports.createConsortiumUserScheduledAppNotification = async function(consortiumUserScheduledAppNotification)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    var modConsortiumUserScheduledAppNotification = new ConsortiumUserScheduledAppNotification();

    modConsortiumUserScheduledAppNotification.createdAt = currTs;

    if(consortiumUserScheduledAppNotification.consortiumUser !== undefined)
    modConsortiumUserScheduledAppNotification.consortiumUser = consortiumUserScheduledAppNotification.consortiumUser;

    if(consortiumUserScheduledAppNotification.moduleCode !== undefined)
    modConsortiumUserScheduledAppNotification.moduleCode = consortiumUserScheduledAppNotification.moduleCode;

    if(consortiumUserScheduledAppNotification.actionCode !== undefined)
    modConsortiumUserScheduledAppNotification.actionCode = consortiumUserScheduledAppNotification.actionCode;

    if(consortiumUserScheduledAppNotification.consortiumChatThread !== undefined)
    modConsortiumUserScheduledAppNotification.consortiumChatThread = consortiumUserScheduledAppNotification.consortiumChatThread;

    if(consortiumUserScheduledAppNotification.consortiumChatThreadMessage !== undefined)
    modConsortiumUserScheduledAppNotification.consortiumChatThreadMessage = consortiumUserScheduledAppNotification.consortiumChatThreadMessage;

    if(consortiumUserScheduledAppNotification.scheduledAt !== undefined)
    modConsortiumUserScheduledAppNotification.scheduledAt = consortiumUserScheduledAppNotification.scheduledAt;

    try{
        var savedConsortiumUserScheduledAppNotification = await modConsortiumUserScheduledAppNotification.save();
        return savedConsortiumUserScheduledAppNotification;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumChatThread "+ e);
    }
}


exports.getConsortiumUserScheduledAppNotificationBaseObjectById = async function(consortiumUserScheduledAppNotificationId, withPopulation){
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
            	path : 'consortiumUser',
                select : 'userFullName'
            },
        ];
    }
    
    var fetchOptions = {
        _id : consortiumUserScheduledAppNotificationId,
    };
  
    try {
        var consortiumUserScheduledAppNotification;
        if(mongodb.ObjectId.isValid(consortiumUserScheduledAppNotificationId))
        {
            consortiumUserScheduledAppNotification = await ConsortiumUserScheduledAppNotification.findOne(fetchOptions).populate(populateOptions);
        }
        return consortiumUserScheduledAppNotification;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUserScheduledAppNotification getConsortiumUserScheduledAppNotificationBaseObjectById' + e)
    }
}

exports.findConsortiumUserScheduledAppNotificationById = async function(consortiumUserScheduledAppNotificationId, withPopulation = true){
    // Options setup for the mongoose paginate
    try
    {
        var resConsortiumUserScheduledAppNotification;
        var consortiumUserScheduledAppNotification = await exports.getConsortiumUserScheduledAppNotificationBaseObjectById(consortiumUserScheduledAppNotificationId, withPopulation);
        if(consortiumUserScheduledAppNotification)
        {
            resConsortiumUserScheduledAppNotification = JSON.parse(JSON.stringify(consortiumUserScheduledAppNotification));  
    
        }
        return resConsortiumUserScheduledAppNotification;
    } catch (e) {
        throw Error('Error while Fetching OrganizationUser findConsortiumUserScheduledAppNotificationById ' + e)
    }
}

exports.removeConsortiumUserScheduledAppNotificationById = async function(consortiumUserScheduledAppNotificationId){
    // Options setup for the mongoose paginate
    try
    {
        var consortiumUserScheduledAppNotification = await exports.getConsortiumUserScheduledAppNotificationBaseObjectById(consortiumUserScheduledAppNotificationId, false);
        if(consortiumUserScheduledAppNotification)
        {
            return await consortiumUserScheduledAppNotification.remove();
        }

    } catch (e) {
        throw Error('Error while Fetching OrganizationUser findConsortiumUserScheduledAppNotificationById ' + e)
    }
}

exports.getConsortiumUserScheduledAppNotificationForPushNotification = async function(){

    let populateOptions = [
        {
            path : 'consortiumChatThread',
        },
        {
            path : 'consortiumChatThreadMessage',
            populate : [
                {
                    path : 'consortiumUser',
                    select : 'userFullName'
                },
                {
                    path : 'systemUser',
                    select : 'userFullName'
                },
            ]
        },
        {
            path : 'consortiumUser',
            select : 'userFullName'
        },
    ];

    let sortOption = {
        scheduledAt : 1
    }

    try {
        var  consortiumUserScheduledAppNotifications = await ConsortiumUserScheduledAppNotification.find().populate(populateOptions).sort(sortOption).limit(AppConfigConst.APP_NOTIFICATION_LIMIT);
        return consortiumUserScheduledAppNotifications;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUserScheduledAppNotificationForPushNotification' + e)
    }
}