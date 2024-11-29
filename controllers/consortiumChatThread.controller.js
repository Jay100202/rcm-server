var ConsortiumChatThreadService = require('../services/consortiumChatThread.service')
var ConsortiumChatThreadMessageService = require('../services/consortiumChatThreadMessage.service')
var ConsortiumUserService = require('../services/consortiumUser.service')
var ConsortiumChatUserTypeService = require('../services/consortiumChatUserType.service')
var ConsortiumChatStatusService = require('../services/consortiumChatStatus.service')
var AppCommonService = require('../services/appcommon.service')
var ConsortiumSystemUserTeamService = require('../services/consortiumSystemUserTeam.service')
var AppDataSanitationService = require('../services/appDataSanitation.service');
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppConfigConst = require('../appconfig-const')
var AppConfigModuleName = require('../appconfig-module-name');
var mongodb = require("mongodb");
var mongoose = require('mongoose');

// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_CONSORTIUM_CHAT_THREAD;
var thisModulename = AppConfigModuleName.MOD_CONSORTIUM_CHAT_THREAD;

exports.saveConsortiumChatThread = async function(req,res)
{
    var consortiumChatThreadId = req.body.id;
    var consortiumId = req.body.consortium;
    var topic = req.body.topic;
    var messageText = req.body.messageText;
   
    if(!consortiumChatThreadId)
    consortiumChatThreadId = '';

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(isConsortiumUserRequest === true)
    {   
        consortiumId = consortiumUser.consortium;
    }

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(topic !== undefined && topic !== "" && consortiumId && consortiumId !== undefined && consortiumId !== '')
    { 
        var hasAddRights = false;
        var hasEditRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasAddRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_ADD);
            hasEditRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_EDIT);
        }
        else
        {
            hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
            hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        }
      
        if((consortiumChatThreadId == "" && !hasAddRights) || (consortiumChatThreadId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                const consUserTypeIdForConsortium = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_CONSORTIUM_USER);
                const consUserTypeIdForSystem = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_SYSTEM_USER);

                var consUserTypeId, consUserId;
                if(isConsortiumUserRequest === true)
                {   
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                    consUserTypeId = consUserTypeIdForConsortium;
                }
                else
                {
                    await AppCommonService.setSystemUserAppAccessed(req);
                    consUserTypeId = consUserTypeIdForSystem;
                }

                var existingConsortiumChatThread = await ConsortiumChatThreadService.findConsortiumChatThreadById(req,consortiumChatThreadId,false);
               
                var consortiumChatThread = {
                    topic: topic,
                    consortium: consortiumId,
                    updatedByUserType: consUserTypeId
                };
                
                if(isConsortiumUserRequest === true)
                { 
                    consortiumChatThread.updatedByConsortiumUser = consortiumUserId;
                }
                else
                {
                    consortiumChatThread.updatedBySystemUser = systemUserId;
                }

                if(existingConsortiumChatThread)
                {
                    consortiumChatThread.id = consortiumChatThreadId;
                }
                else
                { 
                    consortiumChatThread.isDeleted = 0;
                    consortiumChatThread.createdByUserType = consUserTypeId;
                    if(isConsortiumUserRequest === true)
                    { 
                        consortiumChatThread.createdByConsortiumUser = consortiumUserId;
                    }
                    else
                    {
                        consortiumChatThread.createdBySystemUser = systemUserId;
                    }

                    let consortiumChatStatus = await ConsortiumChatStatusService.findDefaultConsortiumChatStatus();
                    if(consortiumChatStatus)
                    {
                        consortiumChatThread.consortiumChatStatus = consortiumChatStatus._id;
                    }
                    
                }
                
                let savedConsortiumChatThread = await ConsortiumChatThreadService.saveConsortiumChatThread(consortiumChatThread);

                if(savedConsortiumChatThread)
                {
                    let savedConsortiumChatThreadId = savedConsortiumChatThread._id;
                    let isAdd = savedConsortiumChatThread.isAdd;
                    let fetchedConsortiumId = savedConsortiumChatThread.consortium;
                    if(isAdd === true)
                    {
                        await ConsortiumChatThreadMessageService.saveConsortiumChatThreadUserMetricForConsortiumChatThread(fetchedConsortiumId,savedConsortiumChatThreadId);
                        // var consortiumSystemUserTeams = await ConsortiumSystemUserTeamService.findConsortiumSystemUserTeamByConsortiumId(fetchedConsortiumId,false);
                        // if(consortiumSystemUserTeams && consortiumSystemUserTeams.length > 0)
                        // {
                        //     let userType = consUserTypeIdForSystem;
            
                        //     await Promise.all(consortiumSystemUserTeams.map(async (consortiumSystemUserTeam, teamIndex) => {

                        //         let consortiumChatThreadUserMetric = {
                        //             consortiumChatThread : savedConsortiumChatThreadId,
                        //             userType : userType,
                        //             systemUser : consortiumSystemUserTeam.systemUser
                        //         }
                        //         let savedConsortiumChatThread = await ConsortiumChatThreadMessageService.createConsortiumChatThreadUserMetric(consortiumChatThreadUserMetric);
                        //     }));

                        // }

                        // const compiledReq = AppCommonService.getClonedRequestObject(req);
                        // compiledReq.body.filConsortium = fetchedConsortiumId;

                        // let consortiumUserList = await ConsortiumUserService.getConsortiumUsersForSelect(compiledReq);
                        // if(consortiumUserList && consortiumUserList.length > 0)
                        // {
                        //     let userType = consUserTypeIdForConsortium;
            
                        //     await Promise.all(consortiumUserList.map(async (consortiumUser, consortiumUserIndex) => {

                        //         let consortiumChatThreadUserMetric = {
                        //             consortiumChatThread : savedConsortiumChatThreadId,
                        //             userType : userType,
                        //             consortiumUser : consortiumUser.id
                        //         }
                        //         let savedConsortiumChatThread = await ConsortiumChatThreadMessageService.createConsortiumChatThreadUserMetric(consortiumChatThreadUserMetric);
                        //     }));

                        // }

                        if(messageText !== undefined && messageText !== '')
                        {
                            let consortiumChatThreadMessage = {
                                consortiumChatThread : savedConsortiumChatThreadId,
                                messageText : messageText,
                                userType : consUserTypeId
                            }
        
                            if(isConsortiumUserRequest === true)
                            {   
                                consortiumChatThreadMessage.consortiumUser = consortiumUserId;
                            }
                            else
                            {
                                consortiumChatThreadMessage.systemUser = systemUserId;
                            }
        
                            // responseObj.consortiumChatThreadMessage = consortiumChatThreadMessage;
        
                            let savedConsortiumChatThreadMessage = await ConsortiumChatThreadMessageService.createConsortiumChatThreadMessage(consortiumChatThreadMessage,req);
                        }
                    }

                    responseObj.savedConsortiumChatThreadId = savedConsortiumChatThreadId;
                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);      
                }else{
                    resStatus = -1;
                }
               
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationChatThread Retrieval Unsuccesful " + e;
            }
        }
      }    
      else
      {
          resStatus = -1;
          resMsg = AppConfigNotif.INVALID_DATA;
      }

      responseObj.status = resStatus;
      responseObj.message = resMsg;

      return res.status(httpStatus).json(responseObj);
}

exports.getConsortiumChatThreadDetails = async function(req, res, next) {
    var id = req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }

        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                if(isConsortiumUserRequest === true)
                {   
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                }
                else
                {
                    await AppCommonService.setSystemUserAppAccessed(req);
                }

                var fetchedConsortiumChatThread = await ConsortiumChatThreadService.findConsortiumChatThreadById(req,id);
                if(fetchedConsortiumChatThread)
                {
                    let consortiumChatThreadMessages = await ConsortiumChatThreadMessageService.getConsortiumChatThreadMessagesByConsortiumChatThreadId(req, fetchedConsortiumChatThread._id,true);
                    
                    var lastReadMessageIndex = _.findIndex(consortiumChatThreadMessages, (message) => message.isLastReadMessage === true);

                    if(lastReadMessageIndex === -1)
                    {
                        lastReadMessageIndex = consortiumChatThreadMessages.length - 1;
                    }

                    resStatus = 1;
                    responseObj.consortiumChatThread = fetchedConsortiumChatThread;
                    responseObj.consortiumChatThreadMessages = consortiumChatThreadMessages;
                    responseObj.lastReadMessageIndex = lastReadMessageIndex;

                    responseObj.consortiumChatThreadUserMetrics =  await ConsortiumChatThreadMessageService.findConsortiumChatThreadUserMetricListByConsortiumChatThreadId(fetchedConsortiumChatThread._id);
                }
                else
                {
                    resStatus = -1;
                    resMsg = "OrganizationChatThread Retrieval Unsuccesful ";
                }

                
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationChatThread Retrieval Unsuccesful " + e;
            }
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
}

exports.getConsortiumChatThreads = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let listCode = req.body.listCode;
    listCode = AppDataSanitationService.sanitizeDataTypeString(listCode);

    let totalRecords = 0;
    let filteredRecords = 0;
    let consortiumChatThreadData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }

        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                if(isConsortiumUserRequest === true)
                {   
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                }
                else
                {
                    await AppCommonService.setSystemUserAppAccessed(req);
                }


                if((AppConfigConst.CHAT_THREAD_STATUS_CODE_PERMITTED_ARR).indexOf(listCode) === -1)
                {
                    listCode = AppConfigConst.CHAT_THREAD_STATUS_CODE_DEFAULT;
                }

               
                let consortiumChatThreadsList = await ConsortiumChatThreadService.getConsortiumChatThreads(req, listCode);

                resStatus = 1;
                if(consortiumChatThreadsList != null)
                {
                    consortiumChatThreadData = consortiumChatThreadsList.results;
                    if(consortiumChatThreadData.length > 0)
                    {
                        await Promise.all((consortiumChatThreadData).map(async (consortiumChatThread, consortiumChatThreadIndex) => {
                            
                            let consortiumChatThreadUserMetric =  await ConsortiumChatThreadMessageService.getConsortiumChatThreadUserMetricByConsortiumChatThreadIdAndUserId(consortiumChatThread._id,systemUserId,consortiumUserId);
                            if(consortiumChatThreadUserMetric)
                            {
                                consortiumChatThread.unreadCount = consortiumChatThreadUserMetric.unreadCount;
                            }
                        }));
                    }
                    totalRecords = consortiumChatThreadsList.totalRecords;
                    filteredRecords = consortiumChatThreadsList.filteredRecords;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationChatThreadsList could not be fetched" + e;
            }
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = consortiumChatThreadData;

    return res.status(httpStatus).json(responseObj)
}

exports.selectConsortiumChatThreadList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 1;
    var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;

    let totalRecords = 0;
    let consortiumChatThreadData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(isConsortiumUserRequest === true)
    {   
        consortium = consortiumUser.consortium;
    }

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        try
        {
           
            if(isConsortiumUserRequest === true)
            {   
                await AppCommonService.setConsortiumUserAppAccessed(req);
                consortium = consortiumUser.consortium;
            }
            else
            {
                await AppCommonService.setSystemUserAppAccessed(req);
            }

            let consortiumChatThreadList = await ConsortiumChatThreadService.getConsortiumChatThreadsForSelect(req);

            resStatus = 1;
            if(consortiumChatThreadList != null)
            {
                totalRecords = consortiumChatThreadList.length;
                consortiumChatThreadData = consortiumChatThreadList;

                if(forFilter) {
                    let consortiumChatThreadObj = {};
                    consortiumChatThreadObj.id = "";
                    consortiumChatThreadObj.text = "All ConsortiumChatThreads";
  
                    consortiumChatThreadData.unshift(consortiumChatThreadObj);
                  }
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationChatThreads could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = consortiumChatThreadData;

    return res.status(httpStatus).json(responseObj)
}

exports.changeConsortiumChatThreadStatus = async function(req, res, next)
{
    var id = req.body._id;
    var isActive = req.body.isActive;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_EDIT);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        }
      
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                if(isConsortiumUserRequest === true)
                {   
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                }
                else
                {
                    await AppCommonService.setSystemUserAppAccessed(req);
                }


                var existingConsortiumChatThread = await ConsortiumChatThreadService.findConsortiumChatThreadById(req,id,false);
                if(existingConsortiumChatThread)
                {
                    var consortiumChatThread = {
                        id : existingConsortiumChatThread._id,
                        isActive: isActive,
                    }

                    if(isConsortiumUserRequest === true)
                    { 
                        consortiumChatThread.updatedByConsortiumUser = consortiumUserId;
                    }
                    else
                    {
                        consortiumChatThread.updatedBySystemUser = systemUserId;
                    }
    
                    let savedConsortiumChatThread = await ConsortiumChatThreadService.saveConsortiumChatThread(consortiumChatThread);
    
                    resStatus = 1;
                    resMsg = AppCommonService.getStatusChangedMessage();       
                }
                else
                {
                    resStatus = -1;
                    resMsg = "OrganizationChatThread Status Change Unsuccesful";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationChatThread Status Change Unsuccesful" + e;
            }
        }
    }
    else
    {
        resStatus = -1;
        resMsg = "Invalid Data";
    }

    return res.status(httpStatus).json({status: resStatus, message: resMsg});
}

exports.checkCanBeDeleted = async function(req, res, next)
{
    var id = req.body._id;

    var skipSend = AppCommonService.getSkipSendResponseValue(req);

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_DELETE);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_DELETE);
        }

        if(!hasRights)
        {
          resStatus = -1;
          resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                if(isConsortiumUserRequest === true)
                {   
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                }
                else
                {
                    await AppCommonService.setSystemUserAppAccessed(req);
                }

                var existingConsortiumChatThread = await ConsortiumChatThreadService.findConsortiumChatThreadById(req,id,false);
                if(existingConsortiumChatThread)
                {
                    let consortiumChatThreadHasMessages = await ConsortiumChatThreadMessageService.checkIfConsortiumChatThreadHasMessagesByConsortiumChatThreadId(fetchedConsortiumChatThread._id);
                    if(consortiumChatThreadHasMessages === true)
                    {
                        resStatus = -1;
                        resMsg = "This thread cannot be deleted. As it has some messages in it.";
                    }
                    else
                    {
                        resStatus = -1;
                    }
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Chat Thread Retrieval Unsuccesful";
                }
            
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationChatThread Retrieval Unsuccesful" + e;
            }
        }
    }
    else
    {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    if(skipSend === true) 
    {
      return responseObj;
    }
    else 
    {
      return res.status(httpStatus).json(responseObj);
    }
}

exports.removeConsortiumChatThread = async function(req, res, next){

    var id = req.params.id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_DELETE);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_DELETE);
        }

        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                if(isConsortiumUserRequest === true)
                {   
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                }
                else
                {
                    await AppCommonService.setSystemUserAppAccessed(req);
                }

                const compiledReq = AppCommonService.compileRequestWithSkipSendResponse(req);
                compiledReq.body._id = id;
                const canBeDeletedResponse = await exports.checkCanBeDeleted(compiledReq, res, next);
                if(canBeDeletedResponse)
                {
                    if(canBeDeletedResponse.status > 0)
                    {
                       
                        var consortiumChatThread = {
                            id,
                            isDeleted: 1,
                        }

                        if(isConsortiumUserRequest === true)
                        { 
                            consortiumChatThread.updatedByConsortiumUser = consortiumUserId;
                        }
                        else
                        {
                            consortiumChatThread.updatedBySystemUser = systemUserId;
                        }

                        let savedConsortiumChatThread = await ConsortiumChatThreadService.saveConsortiumChatThread(consortiumChatThread);

                        resStatus = 1;
                        resMsg = AppCommonService.getDeletedMessage(thisModulename);
                    }
                    else
                    {
                        resStatus = canBeDeletedResponse.status;
                        resMsg = canBeDeletedResponse.message;
                    }
                }
                else
                {
                    resStatus = -1;
                    resMsg = AppConfigNotif.SERVER_ERROR;
                }
                
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationChatThread Deletion Unsuccesful" + e;
            }
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    return res.status(httpStatus).json({status: resStatus, message: resMsg});
}

exports.saveConsortiumChatThreadMessage = async function(req, res, next) {
    var consortiumChatThreadId = req.body.consortiumChatThread;
    var messageText = req.body.messageText;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(consortiumChatThreadId && consortiumChatThreadId != "" && messageText && messageText !== undefined && messageText !== '')
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }

        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                if(isConsortiumUserRequest === true)
                {   
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                }
                else
                {
                    await AppCommonService.setSystemUserAppAccessed(req);
                }

                var fetchedConsortiumChatThread = await ConsortiumChatThreadService.findConsortiumChatThreadById(req,consortiumChatThreadId);
                if(fetchedConsortiumChatThread)
                {

                    let consortiumChatThreadMessage = {
                        consortiumChatThread : consortiumChatThreadId,
                        messageText : messageText,
                    }

                    if(isConsortiumUserRequest === true)
                    {   
                        consortiumChatThreadMessage.consortiumUser = consortiumUserId;
                        consortiumChatThreadMessage.userType = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_CONSORTIUM_USER);
                    }
                    else
                    {
                        consortiumChatThreadMessage.systemUser = systemUserId;
                        consortiumChatThreadMessage.userType = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_SYSTEM_USER);
                    }

                    responseObj.consortiumChatThreadMessage = consortiumChatThreadMessage;

                    let savedConsortiumChatThreadMessage = await ConsortiumChatThreadMessageService.createConsortiumChatThreadMessage(consortiumChatThreadMessage,req);
                    if(savedConsortiumChatThreadMessage)
                    {
                        responseObj.savedConsortiumChatThreadMessageId = savedConsortiumChatThreadMessage;
                        resStatus = 1;
                        resMsg = AppCommonService.getSavedMessage("Thread Message");     
                    }
                    else
                    {
                        resStatus = -1;
                    }
                }
                else
                {
                    resStatus = -1;
                    resMsg = "OrganizationChatThread Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationChatThread Retrieval Unsuccesful " + e;
            }
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
}

exports.checkConsortiumChatThreadTopicValidity = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var topic = req.body.topic;
    var consortiumId = req.body.consortium;
    var id = req.body._id;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(isConsortiumUserRequest === true)
    {   
        consortiumId = consortiumUser.consortium;
    }

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(topic !== undefined && topic != "" && consortiumId && consortiumId !== undefined && consortiumId !== '')
    {
        try
        {
            if(isConsortiumUserRequest === true)
            {   
                await AppCommonService.setConsortiumUserAppAccessed(req);
            }
            else
            {
                await AppCommonService.setSystemUserAppAccessed(req);
            }

            let consortiumChatThread = await ConsortiumChatThreadService.checkConsortiumChatThreadTopicForDuplication(id, topic,consortiumId);
            if(consortiumChatThread)
            {
                resStatus = -1;
                resMsg = 'Organization chat thread with the topic already exists';
            }
            else
            {
                resStatus = 1;
            }
           
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationChatThread could not be fetched" + e;
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }
    
    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj)
}

exports.setConsortiumChatThreadAsRead = async function(req, res, next) {
    var id = req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }

        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                let userTypeId;
                if(isConsortiumUserRequest === true)
                {   
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                    userTypeId = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_CONSORTIUM_USER);
                }
                else
                {
                    await AppCommonService.setSystemUserAppAccessed(req);
                    userTypeId = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_SYSTEM_USER);
                }

                var fetchedConsortiumChatThread = await ConsortiumChatThreadService.findConsortiumChatThreadById(req,id,false);
                if(fetchedConsortiumChatThread)
                {
                    var fetchedConsortiumChatThreadMessage = await ConsortiumChatThreadMessageService.getLastConsortiumChatThreadMessageByChatThreadId(id);

                    let fetchedConsortiumChatThreadUserMetric =  await ConsortiumChatThreadMessageService.getConsortiumChatThreadUserMetricByConsortiumChatThreadIdAndUserId(id,systemUserId,consortiumUserId);
                           
                    if(fetchedConsortiumChatThreadUserMetric)
                    {
                        let unreadCount = fetchedConsortiumChatThreadUserMetric.unreadCount;
                        if(unreadCount > 0)
                        {
                            unreadCount = 0;
                        }
        
                        fetchedConsortiumChatThreadUserMetric.lastReadMessage = fetchedConsortiumChatThreadMessage._id;
                        fetchedConsortiumChatThreadUserMetric.unreadCount = unreadCount;
                        await fetchedConsortiumChatThreadUserMetric.save();
                    }
                    resStatus = 1;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "OrganizationChatThreadMessage Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationChatThreadMessage Retrieval Unsuccesful " + e;
            }
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
}

exports.setConsortiumChatThreadAsClosed = async function(req, res, next) {
    var id = req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }

        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                let userTypeId;
                if(isConsortiumUserRequest === true)
                {   
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                    userTypeId = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_CONSORTIUM_USER);
                }
                else
                {
                    await AppCommonService.setSystemUserAppAccessed(req);
                    userTypeId = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_SYSTEM_USER);
                }

                var fetchedConsortiumChatThread = await ConsortiumChatThreadService.findConsortiumChatThreadById(req,id,false);
                if(fetchedConsortiumChatThread)
                {
                    if(fetchedConsortiumChatThread.isClosed === false)
                    {
                        const consortiumChatThreadDetails = {
                            closedByUserType: userTypeId,
                            closedBySystemUser: systemUserId,
                            closedByConsortiumUser: consortiumUserId
                        };
    
                        await ConsortiumChatThreadService.markConsortiumChatThreadAsClosed(req, id, consortiumChatThreadDetails);
    
                        resStatus = 1;
                    }
                    else
                    {
                        resStatus = -1;
                        resMsg = "Chat thread already closed";
                    }
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Thread Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Thread Retrieval Unsuccesful " + e;
            }
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
}

exports.setConsortiumChatThreadAsReopened = async function(req, res, next) {
    var id = req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }

        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                if(isConsortiumUserRequest === true)
                {   
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                }
                else
                {
                    await AppCommonService.setSystemUserAppAccessed(req);
                }

                var fetchedConsortiumChatThread = await ConsortiumChatThreadService.findConsortiumChatThreadById(req,id,false);
                if(fetchedConsortiumChatThread)
                {
                    if(fetchedConsortiumChatThread.isClosed === true)
                    {    
                        await ConsortiumChatThreadService.markConsortiumChatThreadAsReopened(req, id);
    
                        resStatus = 1;
                    }
                    else
                    {
                        resStatus = -1;
                        resMsg = "Chat thread already open";
                    }
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Thread Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Thread Retrieval Unsuccesful " + e;
            }
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
}

exports.getConsortiumChatThreadInformation = async function(req, res, next) {
    var id = req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }

        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                if(isConsortiumUserRequest === true)
                {   
                    await AppCommonService.setConsortiumUserAppAccessed(req);
                }
                else
                {
                    await AppCommonService.setSystemUserAppAccessed(req);
                }

                var fetchedConsortiumChatThread = await ConsortiumChatThreadService.findConsortiumChatThreadById(req,id,true);
                if(fetchedConsortiumChatThread)
                {          
                    const consortiumName = fetchedConsortiumChatThread.consortium.consortiumName;
                    const chatThreadTopic = fetchedConsortiumChatThread.topic;
                    const initiatedAt = fetchedConsortiumChatThread.createdAt;
                    const closedAt = fetchedConsortiumChatThread.closedAt;
                    const chatThreadIsClosed = fetchedConsortiumChatThread.isClosed;

                    const createdByUserType = fetchedConsortiumChatThread.createdByUserType;                    
                    var initiatorName = '', initiatorIsConsortium = false;
                    if(createdByUserType)
                    {
                        if(createdByUserType.isSystemUser === true)
                        {
                            initiatorName = fetchedConsortiumChatThread.createdBySystemUser ? fetchedConsortiumChatThread.createdBySystemUser.userFullName : "";
                        }
                        else if(createdByUserType.isConsortiumUser === true)
                        {
                            initiatorIsConsortium = true;
                            initiatorName = fetchedConsortiumChatThread.createdByConsortiumUser ? fetchedConsortiumChatThread.createdByConsortiumUser.userFullName : "";
                        }
                    } 

                    const closedByUserType = fetchedConsortiumChatThread.closedByUserType;                    
                    var closedByName = '', closedByIsConsortium = false;
                    if(closedByUserType)
                    {
                        if(closedByUserType.isSystemUser === true)
                        {
                            closedByName = fetchedConsortiumChatThread.closedBySystemUser ? fetchedConsortiumChatThread.closedBySystemUser.userFullName : "";
                        }
                        else if(closedByUserType.isConsortiumUser === true)
                        {
                            closedByIsConsortium = true;
                            closedByName = fetchedConsortiumChatThread.closedByConsortiumUser ? fetchedConsortiumChatThread.closedByConsortiumUser.userFullName : "";
                        }
                    }
                    
                    // var chatThreadStatusText = fetchedConsortiumChatThread.consortiumChatStatus ? fetchedConsortiumChatThread.consortiumChatStatus.statusText : "";
                    // var chatThreadStatusColorCode = fetchedConsortiumChatThread.consortiumChatStatus ? fetchedConsortiumChatThread.consortiumChatStatus.colorCode : "";

                    var chatThreadStatusText = chatThreadIsClosed === true ? 'Closed' : 'Active';
                    var chatThreadStatusColorCode = '';
                    
                    const participantConsortiumUsers = await ConsortiumChatThreadMessageService.getConsortiumChatThreadUniqueParticipantsForConsortiumChatThreadId(id,true);
                    const participantSystemUsers = await ConsortiumChatThreadMessageService.getConsortiumChatThreadUniqueParticipantsForConsortiumChatThreadId(id,false);

                    var chatThreadParticipants = [];
                    (participantConsortiumUsers).forEach((participantConsortiumUser) => {
                        chatThreadParticipants.push({
                            userFullName: participantConsortiumUser._id.consortiumUser[0].userFullName,
                            messageCount: participantConsortiumUser.messageCount,
                            isConsortium: true
                        });
                    });

                    (participantSystemUsers).forEach((participantSystemUser) => {
                        chatThreadParticipants.push({
                            userFullName: participantSystemUser._id.systemUser[0].userFullName,
                            messageCount: participantSystemUser.messageCount,
                            isConsortium: false
                        });
                    });

                    var initiationDetails = {
                        initiatedBy: initiatorName,
                        initiatedAt: initiatedAt,
                        isConsortium: initiatorIsConsortium
                    };

                    var closureDetails = null;
                    if(chatThreadIsClosed === true)
                    {
                        closureDetails = {
                            closedBy: closedByName,
                            closedAt: closedAt,
                            isConsortium: closedByIsConsortium
                        };
                    }
                    
                    resStatus = 1;
                    responseObj.consortiumName = consortiumName;
                    responseObj.chatThreadTopic = chatThreadTopic;
                    responseObj.initiationDetails = initiationDetails;
                    responseObj.chatThreadIsClosed = chatThreadIsClosed;
                    responseObj.closureDetails = closureDetails;
                    responseObj.chatThreadStatusText = chatThreadStatusText;
                    responseObj.chatThreadStatusColorCode = chatThreadStatusColorCode;
                    responseObj.chatThreadParticipants = chatThreadParticipants;
                    // responseObj.participantConsortiumUsers = participantConsortiumUsers;
                    // responseObj.participantSystemUsers = participantSystemUsers;
                    // responseObj.consortiumChatThread = fetchedConsortiumChatThread;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "OrganizationChatThread Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationChatThread Retrieval Unsuccesful " + e;
            }
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
}

exports.selectConsortiumChatThreadStatusList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let consortiumChatThreadStatusData = [];
    let defaultConsortiumChatThreadStatusCode;

    var isConsortiumUserRequest = AppCommonService.getIsRequestFromConsortiumUser(req);
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        try
        {
           
            if(isConsortiumUserRequest === true)
            {   
                await AppCommonService.setConsortiumUserAppAccessed(req);
            }
            else
            {
                await AppCommonService.setSystemUserAppAccessed(req);
            }


            resStatus = 1;

            consortiumChatThreadStatusData = AppConfigConst.CHAT_THREAD_STATUS_OPTION_SELECT_ARR;
            totalRecords = consortiumChatThreadStatusData.length;

            defaultConsortiumChatThreadStatusCode = AppConfigConst.CHAT_THREAD_STATUS_CODE_DEFAULT;
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationChatThreads could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = consortiumChatThreadStatusData;
    responseObj.defaultStatusCode = defaultConsortiumChatThreadStatusCode;

    return res.status(httpStatus).json(responseObj)
}
