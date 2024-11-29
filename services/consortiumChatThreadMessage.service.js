
var ConsortiumChatThread = require('../models/consortiumChatThread.model');
var ConsortiumChatThreadMessage = require('../models/consortiumChatThreadMessage.model');
var ConsortiumChatThreadUserMetric = require('../models/consortiumChatThreadUserMetric.model');
var ConsortiumService = require('./consortium.service');
var ConsortiumUserService = require('./consortiumUser.service');
var ConsortiumSystemUserTeamService = require('./consortiumSystemUserTeam.service');
var SystemUserService = require('./systemUser.service');
var ConsortiumChatUserTypeService = require('./consortiumChatUserType.service');
var ConsortiumChatThreadService = require('./consortiumChatThread.service');
var SystemUserScheduledAppNotificationService = require('./systemUserScheduledAppNotification.service');
var ConsortiumUserScheduledAppNotificationService = require('./consortiumUserScheduledAppNotification.service');
var ConsortiumUser = require('../models/consortiumUser.model');
var SystemUser = require('../models/systemUser.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this

exports.getConsortiumChatThreadLatestMessageData = async function(consortiumChatThreadId)
{
    var fetchOptions = {
        consortiumChatThread : new mongoose.Types.ObjectId(consortiumChatThreadId),
    };

    var sortOptions = {
    	createdAt: -1
    };

    try {
        var latestMsgExcerpt;
        var latestMsgReceivedAt;

        if(mongodb.ObjectId.isValid(consortiumChatThreadId))
        {
        	let latestThreadMessage =  await ConsortiumChatThreadMessage.findOne(fetchOptions).sort(sortOptions);
        	if(latestThreadMessage)
        	{
        		latestMsgExcerpt = latestThreadMessage.messageText;        		
        		latestMsgReceivedAt = latestThreadMessage.createdAt;        		
        	}
        }	        

        let response = {
            latestMsgExcerpt : latestMsgExcerpt,
            latestMsgReceivedAt : latestMsgReceivedAt,
        }
        return response;
    } catch (e) {
        throw Error('Error while Fetching Latest Thread Message ' + e)
    }
}

exports.createConsortiumChatThreadMessage = async function(consortiumChatThreadMessage,req)
{
    const currTs = AppCommonService.getCurrentTimestamp();

    var modConsortiumChatThreadMessage = new ConsortiumChatThreadMessage();

    modConsortiumChatThreadMessage.createdAt = currTs;

    if(consortiumChatThreadMessage.consortiumChatThread !== undefined)
    modConsortiumChatThreadMessage.consortiumChatThread = consortiumChatThreadMessage.consortiumChatThread;

    if(consortiumChatThreadMessage.messageText !== undefined)
    modConsortiumChatThreadMessage.messageText = consortiumChatThreadMessage.messageText;

    if(consortiumChatThreadMessage.userType !== undefined)
    modConsortiumChatThreadMessage.userType = consortiumChatThreadMessage.userType;

    if(consortiumChatThreadMessage.systemUser !== undefined)
    modConsortiumChatThreadMessage.systemUser = consortiumChatThreadMessage.systemUser;

    if(consortiumChatThreadMessage.consortiumUser !== undefined)
    modConsortiumChatThreadMessage.consortiumUser = consortiumChatThreadMessage.consortiumUser;

    if(consortiumChatThreadMessage.lastReadMessage !== undefined)
    modConsortiumChatThreadMessage.lastReadMessage = consortiumChatThreadMessage.lastReadMessage;

    try{
        var savedConsortiumChatThreadMessage = await modConsortiumChatThreadMessage.save();
        if(savedConsortiumChatThreadMessage)
        {
        	await exports.recalculateConsortiumChatThreadUnreadCount(savedConsortiumChatThreadMessage,req);
        }
        return savedConsortiumChatThreadMessage;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumChatThread "+ e);
    }
}

exports.getConsortiumChatThreadMessageBaseObjectById = async function(consortiumChatThreadMessageId, withPopulation){
    // Options setup for the mongoose paginate
    let populateOptions = [];

    if(withPopulation !== undefined && withPopulation === true)
    {
        populateOptions = [
            {
                path : 'consortiumChatThread',
            },
            {
                path : 'userType',
            },
            {
            	path : 'consortiumUser',
                select : 'userFullName'
            },
            {
            	path : 'systemUser',
                select : 'userFullName'
            }
        ];
    }
    
    var fetchOptions = {
        _id : consortiumChatThreadMessageId,
    };
  
    try {
        var consortiumChatThreadMessage;
        if(mongodb.ObjectId.isValid(consortiumChatThreadMessageId))
        {
            consortiumChatThreadMessage = await ConsortiumChatThreadMessage.findOne(fetchOptions).populate(populateOptions);
        }
        return consortiumChatThreadMessage;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThreadMessage getConsortiumChatThreadMessageBaseObjectById' + e)
    }
}

exports.findConsortiumChatThreadMessageById = async function(consortiumChatThreadMessageId, withPopulation = true){
    // Options setup for the mongoose paginate
    try
    {
        var resConsortiumChatThreadMessage;
        var consortiumChatThreadMessage = await exports.getConsortiumChatThreadMessageBaseObjectById(consortiumChatThreadMessageId, withPopulation);
        if(consortiumChatThreadMessage)
        {
            resConsortiumChatThreadMessage = JSON.parse(JSON.stringify(consortiumChatThreadMessage));  
    
        }
        return resConsortiumChatThreadMessage;
    } catch (e) {
        throw Error('Error while Fetching OrganizationUser findConsortiumChatThreadMessageById ' + e)
    }
}

exports.getConsortiumChatThreadMessagesByConsortiumChatThreadId = async function(req, consortiumChatThreadId, withPopulation){
    try {
        var consortiumChatThreadMessages;
        if(mongodb.ObjectId.isValid(consortiumChatThreadId))
        {
            var isConsortiumUserRequest = AppCommonService.getIsRequestFromConsortiumUser(req);
            var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);
            var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
            
            const consUserTypeIdForConsortium = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_CONSORTIUM_USER);
            const consUserTypeIdForSystem = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_SYSTEM_USER);

            var consortiumUserMongoId;
            if(mongodb.ObjectId.isValid(consortiumUserId))
            {
                consortiumUserMongoId = new mongoose.Types.ObjectId(consortiumUserId);
            }

            var systemUserMongoId;
            if(mongodb.ObjectId.isValid(systemUserId))
            {
                systemUserMongoId = new mongoose.Types.ObjectId(systemUserId);
            }

            var userLastReadMessageId;
            const chatThreadUserMetric = await exports.getConsortiumChatThreadUserMetricByConsortiumChatThreadIdAndUserId(consortiumChatThreadId, systemUserMongoId, consortiumUserMongoId);
            
            if(chatThreadUserMetric)
            {
                userLastReadMessageId = chatThreadUserMetric.lastReadMessage;
            }


            // Options setup for the mongoose paginate
            let populateOptions = [];
        
            if(withPopulation !== undefined && withPopulation === true)
            {
                populateOptions = [
                    {
                        path : 'userType',
                    },
                    {
                        path : 'consortiumUser',
                        select : 'userFullName'
                    },
                    {
                        path : 'systemUser',
                        select : 'userFullName'
                    }
                ];
            }

            const projectObj = {
                '_id': '$_id',
                'consortiumChatThread': '$consortiumChatThread',
                'messageText': '$messageText',
                'userType': '$userType',
                'consortiumUser': '$consortiumUser',
                'systemUser': '$systemUser',
                'sentAt': '$createdAt',
                'isSelfSender': { $cond: { if: { $or: [ { $and : [ { $eq: [ "$userType", consUserTypeIdForConsortium ] }, { $eq: [ isConsortiumUserRequest, true ] }, { $eq: [ '$consortiumUser', consortiumUserMongoId ] } ] }, { $and : [ { $eq: [ "$userType", consUserTypeIdForSystem ] }, { $eq: [ isConsortiumUserRequest, false ] }, { $eq: [ '$systemUser', systemUserMongoId ] } ] } ] } , then: true, else: false } },
                'isSelfRepresentative': { $cond: { if: { $or: [ { $and : [ { $eq: [ "$userType", consUserTypeIdForConsortium ] }, { $eq: [ isConsortiumUserRequest, true ] } ] }, { $and : [ { $eq: [ "$userType", consUserTypeIdForSystem ] }, { $eq: [ isConsortiumUserRequest, false ] } ] } ] } , then: true, else: false } },
                'senderIsConsortium': { $cond: { if: { $and : [ { $eq: [ "$userType", consUserTypeIdForConsortium ] } ] }, then: true, else: false } },
                'isLastReadMessage': { $cond: { if: { $and : [ { $eq: [ "$_id", userLastReadMessageId ] } ] }, then: true, else: false } }
            };

            var fetchOptions = {
                consortiumChatThread : new mongoose.Types.ObjectId(consortiumChatThreadId),
            };

            var sortOptions = {
                sentAt: 1
            };

            consortiumChatThreadMessages = await ConsortiumChatThreadMessage.aggregate([
                            {
                                $project: projectObj // For Projection
                            },
                            {
                                $match: fetchOptions // For Fetch
                            },
                            {
                                $sort: sortOptions // For Fetch
                            }
                        ]);
           
            consortiumChatThreadMessages = await ConsortiumChatThreadMessage.populate(consortiumChatThreadMessages, populateOptions);
        }
        

        return consortiumChatThreadMessages;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThreadMessage getConsortiumChatThreadMessageBaseObjectById' + e)
    }
}

exports.checkIfConsortiumChatThreadHasMessagesByConsortiumChatThreadId = async function(consortiumChatThreadId){

    // Options setup for the mongoose paginate
    let hasMessages = false;
  
    try {
        if(mongodb.ObjectId.isValid(consortiumChatThreadId))
        {
            var fetchOptions = {
                consortiumChatThread : new mongoose.Types.ObjectId(consortiumChatThreadId)
            };

            const consortiumChatThreadMessage = await ConsortiumChatThreadMessage.findOne(fetchOptions);
            if(consortiumChatThreadMessage)
            {
                hasMessages = true;
            }
        }

        return hasMessages;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThreadMessage getConsortiumChatThreadMessageBaseObjectById' + e)
    }
}

exports.resetConsortiumChatThreadLatestMsgExcerpt = async function(consortiumChatThreadId,req)
{
    try{
        let fetchedConsortiumChatThread = await ConsortiumChatThreadService.getConsortiumChatThreadBaseObjectById(req,consortiumChatThreadId,false);
        if(fetchedConsortiumChatThread)
        {
            let latestMsgData = await exports.getConsortiumChatThreadLatestMessageData(consortiumChatThreadId);
            if(latestMsgData)
            {
                fetchedConsortiumChatThread.latestMsgExcerpt = latestMsgData.latestMsgExcerpt;
                fetchedConsortiumChatThread.latestMsgReceivedAt = latestMsgData.latestMsgReceivedAt;

                let savedConsortiumChatThread =  await fetchedConsortiumChatThread.save();
            }

        }
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumChatThread "+ e);
    }
}

exports.recalculateConsortiumChatThreadUnreadCount = async function(consortiumChatThreadMessage,req)
{

    try{
        const currTs = await AppCommonService.getCurrentTimestamp();

        let consortiumChatThreadMessageId = consortiumChatThreadMessage._id;
        let systemUserId = consortiumChatThreadMessage.systemUser;
        let consortiumUserId = consortiumChatThreadMessage.consortiumUser;
        let consortiumChatThreadId = consortiumChatThreadMessage.consortiumChatThread;
      
        await exports.resetConsortiumChatThreadLatestMsgExcerpt(consortiumChatThreadId,req);
        
        // if(mongodb.ObjectId.isValid(consortiumUserId))
        // {
        //     let consortiumUserScheduledAppNotification = {
        //         consortiumUser : consortiumUserId,
        //         moduleCode : AppConfigConst.APP_NOTIFICATION_MODULE_CODE_CHAT,
        //         actionCode :  AppConfigConst.APP_NOTIFICATION_ACTION_CODE_NOTIF,
        //         consortiumChatThread : consortiumChatThreadId,
        //         consortiumChatThreadMessage : consortiumChatThreadMessageId,
        //         scheduledAt : currTs
        //     }
        //     await ConsortiumUserScheduledAppNotificationService.createConsortiumUserScheduledAppNotification(consortiumUserScheduledAppNotification);
        // }
        // else if(mongodb.ObjectId.isValid(systemUserId))
        // {
        //     let systemUserScheduledAppNotification = {
        //         systemUser : systemUserId,
        //         moduleCode : AppConfigConst.APP_NOTIFICATION_MODULE_CODE_CHAT,
        //         actionCode :  AppConfigConst.APP_NOTIFICATION_ACTION_CODE_NOTIF,
        //         consortiumChatThread : consortiumChatThreadId,
        //         consortiumChatThreadMessage : consortiumChatThreadMessageId,
        //         scheduledAt : currTs
        //     }

        //     await SystemUserScheduledAppNotificationService.createSystemUserScheduledAppNotification(systemUserScheduledAppNotification);
        // }
            

        let consortiumChatThreadUserMetrics = await exports.findConsortiumChatThreadUserMetricForUnreadCount(consortiumChatThreadId,consortiumUserId,systemUserId);

        if(consortiumChatThreadUserMetrics && consortiumChatThreadUserMetrics.length > 0)
        {
            await Promise.all(consortiumChatThreadUserMetrics.map(async (consortiumChatThreadUserMetric, consortiumChatThreadUserMetricIndex) => {

                let unreadCount = consortiumChatThreadUserMetric.unreadCount !== undefined && consortiumChatThreadUserMetric.unreadCount ? consortiumChatThreadUserMetric.unreadCount: 0;
                unreadCount++;

                consortiumChatThreadUserMetric.unreadCount = unreadCount;
                let savedConsortiumChatThreadUserMetric = await consortiumChatThreadUserMetric.save();
                if(savedConsortiumChatThreadUserMetric)
                {
                    let fetchedSystemUserId = savedConsortiumChatThreadUserMetric.systemUser;
                    let fetchedConsortiumUserId = savedConsortiumChatThreadUserMetric.consortiumUser;

                    if(mongodb.ObjectId.isValid(fetchedConsortiumUserId))
                    {
                        let consortiumUserScheduledAppNotificationObj = {
                            consortiumUser : fetchedConsortiumUserId,
                            moduleCode : AppConfigConst.APP_NOTIFICATION_MODULE_CODE_CHAT,
                            actionCode :  AppConfigConst.APP_NOTIFICATION_ACTION_CODE_NOTIF,
                            consortiumChatThread : consortiumChatThreadId,
                            consortiumChatThreadMessage : consortiumChatThreadMessageId,
                            scheduledAt : currTs
                        }

                        await ConsortiumUserScheduledAppNotificationService.createConsortiumUserScheduledAppNotification(consortiumUserScheduledAppNotificationObj);
                    }
                    else if(mongodb.ObjectId.isValid(fetchedSystemUserId))
                    {
                        let systemUserScheduledAppNotificationObj = {
                            systemUser : fetchedSystemUserId,
                            moduleCode : AppConfigConst.APP_NOTIFICATION_MODULE_CODE_CHAT,
                            actionCode :  AppConfigConst.APP_NOTIFICATION_ACTION_CODE_NOTIF,
                            consortiumChatThread : consortiumChatThreadId,
                            consortiumChatThreadMessage : consortiumChatThreadMessageId,
                            scheduledAt : currTs
                        }
        
                        await SystemUserScheduledAppNotificationService.createSystemUserScheduledAppNotification(systemUserScheduledAppNotificationObj);
                    }
                }
            }));
        }
        
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumChatThread "+ e);
    }

}


//--------------------------------------------------------------------ConsortiumChatThreadUserMetric-------------------------------------------------------------------------

exports.createConsortiumChatThreadUserMetric = async function(consortiumChatThreadUserMetric)
{
    var modConsortiumChatThreadUserMetric = new ConsortiumChatThreadUserMetric();
    modConsortiumChatThreadUserMetric.unreadCount = 0;

    if(consortiumChatThreadUserMetric.consortiumChatThread !== undefined)
    modConsortiumChatThreadUserMetric.consortiumChatThread = consortiumChatThreadUserMetric.consortiumChatThread;

    if(consortiumChatThreadUserMetric.userType !== undefined)
    modConsortiumChatThreadUserMetric.userType = consortiumChatThreadUserMetric.userType;

    if(consortiumChatThreadUserMetric.consortiumUser !== undefined)
    modConsortiumChatThreadUserMetric.consortiumUser = consortiumChatThreadUserMetric.consortiumUser;

    if(consortiumChatThreadUserMetric.systemUser !== undefined)
    modConsortiumChatThreadUserMetric.systemUser = consortiumChatThreadUserMetric.systemUser;

    try{
        var savedConsortiumChatThreadUserMetric = await modConsortiumChatThreadUserMetric.save();
        return savedConsortiumChatThreadUserMetric;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumChatThreadUserMetric "+ e);
    }
}

exports.findConsortiumChatThreadUserMetricListByConsortiumChatThreadId = async function(consortiumChatThreadId){
   
    var fetchOptions = {
        consortiumChatThread : new mongoose.Types.ObjectId(consortiumChatThreadId),
    };
  

    try {
        var consortiumChatThreadUserMetrics;
        if(mongodb.ObjectId.isValid(consortiumChatThreadId))
        {
            consortiumChatThreadUserMetrics = await ConsortiumChatThreadUserMetric.find(fetchOptions);
        }
        return consortiumChatThreadUserMetrics;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThreadUserMetric ' + e)
    }
}

exports.findConsortiumChatThreadUserMetricForUnreadCount = async function(consortiumChatThreadId,consortiumUserId,systemUserId){
   
    var fetchOptions = {
        consortiumChatThread : new mongoose.Types.ObjectId(consortiumChatThreadId),
    };
  
    if(mongodb.ObjectId.isValid(consortiumUserId))
    {
        fetchOptions.consortiumUser = { $ne : new mongoose.Types.ObjectId(consortiumUserId) };
    }

    if(mongodb.ObjectId.isValid(systemUserId))
    {
        fetchOptions.systemUser = { $ne : new mongoose.Types.ObjectId(systemUserId) };
    }


    try {
        var consortiumChatThreadUserMetrics;
        if(mongodb.ObjectId.isValid(consortiumChatThreadId))
        {
            consortiumChatThreadUserMetrics = await ConsortiumChatThreadUserMetric.find(fetchOptions);
        }
        return consortiumChatThreadUserMetrics;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThreadUserMetric findConsortiumChatThreadUserMetricForUnreadCount' + e)
    }
}

exports.getConsortiumChatThreadListByConsortiumId = async function(consortiumId){
    
    var options = {
        consortium : consortiumId,
        isDeleted : 0
    };

    try {
       var consortiumChatThreads;
       if(mongodb.ObjectId.isValid(consortiumId))
       {
           consortiumChatThreads = await ConsortiumChatThread.find(options);
       }
       return consortiumChatThreads;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThread' + e)
    }
}


exports.saveConsortiumChatThreadUserMetricForConsortiumUser = async function(consortiumId,consortiumUserId){
    try {
     
        var consortiumChatThreads = await exports.getConsortiumChatThreadListByConsortiumId(consortiumId);
        if(consortiumChatThreads && consortiumChatThreads.length > 0)
        {
            let userType = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_CONSORTIUM_USER);
            var insConsortiumChatThreadUserMetricArr = [];
            (consortiumChatThreads).forEach((consortiumChatThread) => {
                let consortiumChatThreadUserMetric = {
                    consortiumChatThread: consortiumChatThread._id,
                    userType: userType,
                    consortiumUser: consortiumUserId
                };
                insConsortiumChatThreadUserMetricArr.push(consortiumChatThreadUserMetric);
            });
            await ConsortiumChatThreadUserMetric.insertMany(insConsortiumChatThreadUserMetricArr);
            
            // await Promise.all(consortiumChatThreads.map(async (consortiumChatThread, consortiumChatThreadIndex) => {
            //     let consortiumChatThreadUserMetric = {
            //         consortiumChatThread : consortiumChatThread._id,
            //         userType : userType,
            //         consortiumUser : consortiumUserId
            //     }
            //     let savedConsortiumChatThread = await exports.createConsortiumChatThreadUserMetric(consortiumChatThreadUserMetric);
            // }));
        }
        
    } catch (e) {
        throw Error('Error saveConsortiumChatThreadUserMetricForConsortiumUser' + e)
    }
}

exports.saveConsortiumChatThreadUserMetricForSystemUser = async function(consortiumId,systemUserId){
    try {
     
        var consortiumChatThreads = await exports.getConsortiumChatThreadListByConsortiumId(consortiumId);
        if(consortiumChatThreads && consortiumChatThreads.length > 0)
        {
            let userType = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_SYSTEM_USER);
            
            var insConsortiumChatThreadUserMetricArr = [];
            (consortiumChatThreads).forEach((consortiumChatThread) => {
                let consortiumChatThreadUserMetric = {
                    consortiumChatThread: consortiumChatThread._id,
                    userType: userType,
                    systemUser: systemUserId
                };
                insConsortiumChatThreadUserMetricArr.push(consortiumChatThreadUserMetric);
            });
            await ConsortiumChatThreadUserMetric.insertMany(insConsortiumChatThreadUserMetricArr);
            // await Promise.all(consortiumChatThreads.map(async (consortiumChatThread, consortiumChatThreadIndex) => {
            //     let consortiumChatThreadUserMetric = {
            //         consortiumChatThread : consortiumChatThread._id,
            //         userType : userType,
            //         systemUser : systemUserId
            //     }
            //     let savedConsortiumChatThread = await exports.createConsortiumChatThreadUserMetric(consortiumChatThreadUserMetric);
            // }));
        }
        
    } catch (e) {
        throw Error('Error saveConsortiumChatThreadUserMetricForSystemUser' + e)
    }
}


exports.saveConsortiumChatThreadUserMetricForConsortiumChatThread = async function(consortiumId, consortiumChatThreadId){
    try {
     
        let response = {}
        if(mongodb.ObjectId.isValid(consortiumChatThreadId))
        {
            let consortiumUsers = await ConsortiumUserService.getConsortiumUserIdArrByConsortiumId(consortiumId);

            if(consortiumUsers && consortiumUsers.length > 0)
            {
                let userType = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_CONSORTIUM_USER);
                var insConsortiumChatThreadUserMetricArr = [];
                (consortiumUsers).forEach((consortiumUserId) => {
                    let consortiumChatThreadUserMetric = {
                        consortiumChatThread: consortiumChatThreadId,
                        userType: userType,
                        consortiumUser: consortiumUserId
                    };
                    insConsortiumChatThreadUserMetricArr.push(consortiumChatThreadUserMetric);
                });
                await ConsortiumChatThreadUserMetric.insertMany(insConsortiumChatThreadUserMetricArr);
            }
    
            var systemUserIdArrForConsortiumTeam = [];
            var consortiumSystemUserTeams = await ConsortiumSystemUserTeamService.findConsortiumSystemUserTeamByConsortiumId(consortiumId,false);
            if(Array.isArray(consortiumSystemUserTeams) && consortiumSystemUserTeams.length > 0)
            {
                let userType = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_SYSTEM_USER);

                var insConsortiumChatThreadUserMetricArr = [];
                (consortiumSystemUserTeams).forEach((consortiumSystemUserTeam) => {
                    let consortiumChatThreadUserMetric = {
                        consortiumChatThread: consortiumChatThreadId,
                        userType: userType,
                        systemUser: consortiumSystemUserTeam.systemUser
                    };
                    insConsortiumChatThreadUserMetricArr.push(consortiumChatThreadUserMetric);
                    systemUserIdArrForConsortiumTeam.push(consortiumSystemUserTeam.systemUser);
                });
                await ConsortiumChatThreadUserMetric.insertMany(insConsortiumChatThreadUserMetricArr);
            }

            var otherSystemUserIdArrWithViewAllRights = await SystemUserService.getSystemUserIdArrForViewAllOfChatThread(systemUserIdArrForConsortiumTeam);
            if(Array.isArray(otherSystemUserIdArrWithViewAllRights) && otherSystemUserIdArrWithViewAllRights.length > 0)
            {
                let userType = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_SYSTEM_USER);

                var insConsortiumChatThreadUserMetricArr = [];
                (otherSystemUserIdArrWithViewAllRights).forEach((otherSystemUserId) => {
                    let consortiumChatThreadUserMetric = {
                        consortiumChatThread: consortiumChatThreadId,
                        userType: userType,
                        systemUser: otherSystemUserId
                    };
                    insConsortiumChatThreadUserMetricArr.push(consortiumChatThreadUserMetric);
                });
                await ConsortiumChatThreadUserMetric.insertMany(insConsortiumChatThreadUserMetricArr);
            }
        }
       
        return response; 

    } catch (e) {
        throw Error('Error saveConsortiumChatThreadUserMetricForSystemUser' + e)
    }
}



exports.getLastConsortiumChatThreadMessageByChatThreadId = async function(consortiumChatThreadId){
    
    var options = {
        consortiumChatThread : consortiumChatThreadId
    };

    var sortOptions = {
        createdAt : -1
    };

    try {
       var consortiumChatThreadMessage;
       if(mongodb.ObjectId.isValid(consortiumChatThreadId))
       {
        consortiumChatThreadMessage = await ConsortiumChatThreadMessage.findOne(options).sort(sortOptions);
       }
       return consortiumChatThreadMessage;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThreadMessage' + e)
    }
}

exports.getConsortiumChatThreadUserMetricByConsortiumChatThreadIdAndUserId = async function(consortiumChatThreadId,systemUserId,consortiumUserId){
   
    var fetchOptions = {
        consortiumChatThread : new mongoose.Types.ObjectId(consortiumChatThreadId),
    };
  
    if(mongodb.ObjectId.isValid(consortiumUserId))
    {
        fetchOptions.consortiumUser = new mongoose.Types.ObjectId(consortiumUserId);
    }

    if(mongodb.ObjectId.isValid(systemUserId))
    {
        fetchOptions.systemUser = new mongoose.Types.ObjectId(systemUserId);
    }

    try {
        var consortiumChatThreadUserMetric;
        if(mongodb.ObjectId.isValid(consortiumChatThreadId))
        {
            consortiumChatThreadUserMetric = await ConsortiumChatThreadUserMetric.findOne(fetchOptions);
        }
        return consortiumChatThreadUserMetric;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThreadUserMetric ' + e)
    }
}

exports.getConsortiumChatThreadUniqueParticipantsForConsortiumChatThreadId = async function(consortiumChatThreadId, forConsortiumUser){
    try {
        var consortiumChatThreadParticipants;
        if(mongodb.ObjectId.isValid(consortiumChatThreadId))
        {
            var consUserTypeId;
            if(forConsortiumUser === true)
            {
                consUserTypeId = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_CONSORTIUM_USER);
            }
            else
            {
                consUserTypeId = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_SYSTEM_USER);    
            }

            var projectObj;
            var groupObj;
            var unwindObj;
            var lookupObj;
            if(forConsortiumUser === true)
            {
                groupObj = { _id: {"consortiumUser" : "$consortiumUser"}, messageCount: {$addToSet: "$_id"} };
                projectObj = { "user":1, messageCount: {$size:"$messageCount"} };
                unwindObj = "$consortiumUser";
                lookupObj = {
                    "from": ConsortiumUser.collection.name,
                    "localField": "consortiumUser",
                    "foreignField": "_id",
                    "as": "consortiumUser"
                };
            }
            else
            {
                groupObj = { _id: {"systemUser" : "$systemUser"}, messageCount: {$addToSet: "$_id"} };
                projectObj = { "user":1, messageCount: {$size:"$messageCount"} };
                unwindObj = "$systemUser";
                lookupObj = {
                    "from": SystemUser.collection.name,
                    "localField": "systemUser",
                    "foreignField": "_id",
                    "as": "systemUser"
                };
            }

            var fetchOptions = {
                consortiumChatThread : new mongoose.Types.ObjectId(consortiumChatThreadId),
                userType : consUserTypeId
            };

            consortiumChatThreadParticipants = await ConsortiumChatThreadMessage.aggregate([
                    {
                        $unwind: unwindObj
                    },
                    {
                        $lookup: lookupObj
                    },
                    { $match: fetchOptions },
                    { $group: groupObj },
                    { $project: projectObj } 
                ]);
           
        }        

        return consortiumChatThreadParticipants;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThreadMessage getConsortiumChatThreadMessageBaseObjectById' + e)
    }
}
