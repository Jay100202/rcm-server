var ConsortiumService = require('../services/consortium.service')
var ConsortiumUserService = require('../services/consortiumUser.service')
var ConsortiumLocationService = require('../services/consortiumLocation.service')
var ConsortiumSystemUserTeamService = require('../services/consortiumSystemUserTeam.service')
var ConsortiumChatThreadMessageService = require('../services/consortiumChatThreadMessage.service')
var AppCommonService = require('../services/appcommon.service')
var AppDataSanitationService = require('../services/appDataSanitation.service');
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppConfigConst = require('../appconfig-const')
var AppConfigModuleName = require('../appconfig-module-name');
var mongodb = require("mongodb");
var mongoose = require('mongoose');

// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_CONSORTIUM;
var thisModulename = AppConfigModuleName.MOD_CONSORTIUM;

exports.saveConsortium = async function(req,res)
{
    var consortiumId = req.body.id;
    var consortiumName = req.body.consortiumName;
    var consortiumShortCode = req.body.consortiumShortCode;
    var description = req.body.description;
    var consortiumJobTypes = req.body.consortiumJobTypes;
  

    if(!consortiumId)
    consortiumId = '';

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(consortiumName !== undefined && consortiumName !== "" && consortiumShortCode !== undefined && consortiumShortCode && consortiumShortCode.length === 3 && consortiumJobTypes !== undefined && consortiumJobTypes !== null && consortiumJobTypes.length > 0)
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((consortiumId == "" && !hasAddRights) || (consortiumId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var consortium = {
                    consortiumName: consortiumName,
                    consortiumShortCode: consortiumShortCode,
                    description: description,
                    consortiumJobTypes: consortiumJobTypes,
                    updatedBy : systemUserId
                };
                

                if(consortiumId == "")
                {
                    consortium.createdBy = systemUserId;
                    consortium.isDeleted = 0;
                }
                else
                {
                    consortium.id = consortiumId;
                }


                let savedConsortium = await ConsortiumService.saveConsortium(consortium);

                if(savedConsortium)
                {
                    let savedConsortiumId = savedConsortium._id;

                    responseObj.id = savedConsortiumId;
                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);      
                }else{
                    resStatus = -1;
                }
            
                      
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Organization Retrieval Unsuccesful " + e;
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

exports.getConsortiumDetails = async function(req, res, next) {
    var id = req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var fetchedConsortium = await ConsortiumService.findConsortiumById(req, id);
                if(fetchedConsortium)
                {
                    var fetchedConsortiumSystemUserTeam = await ConsortiumSystemUserTeamService.findConsortiumSystemUserTeamByConsortiumId(id);
                
                    let defaultConsortiumLocationId = '';
                    let defaultConsortiumLocationName = '';
                    let defaultConsortiumLocation = await ConsortiumLocationService.getDefaultConsortiumLocationByConsortium(id);
                    if(defaultConsortiumLocation)
                    {
                        defaultConsortiumLocationId = defaultConsortiumLocation._id;
                        defaultConsortiumLocationName = defaultConsortiumLocation.locationName;
                    }

                    resStatus = 1;
                    responseObj.consortium = fetchedConsortium;
                    responseObj.consortiumSystemUserTeamList = fetchedConsortiumSystemUserTeam;
                    responseObj.defaultConsortiumLocationId = defaultConsortiumLocationId;
                    responseObj.defaultConsortiumLocationName = defaultConsortiumLocationName;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Organization Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Organization Retrieval Unsuccesful " + e;
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

exports.getConsortiums = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let consortiumData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                let consortiumsList = await ConsortiumService.getConsortiums(req);

                resStatus = 1;
                if(consortiumsList != null)
                {
                    consortiumData = consortiumsList.results;
                    totalRecords = consortiumsList.totalRecords;
                    filteredRecords = consortiumsList.filteredRecords;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationsList could not be fetched" + e;
            }
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = consortiumData;

    return res.status(httpStatus).json(responseObj)
}

exports.selectConsortiumList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 1;
    var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;

    let totalRecords = 0;
    let consortiumData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        try
        {
           
            await AppCommonService.setSystemUserAppAccessed(req);

            let consortiumList = await ConsortiumService.getConsortiumsForSelect(onlyActiveStatus);

            resStatus = 1;
            if(consortiumList != null)
            {
                totalRecords = consortiumList.length;
                consortiumData = consortiumList;

                if(forFilter) {
                    let consortiumObj = {};
                    consortiumObj.id = "";
                    consortiumObj.text = "All Consortiums";
  
                    consortiumData.unshift(consortiumObj);
                  }
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Organization could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = consortiumData;

    return res.status(httpStatus).json(responseObj)
}

exports.changeConsortiumStatus = async function(req, res, next)
{
    var id = req.body._id;
    var isActive = req.body.isActive;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id != "")
    {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

               
                var consortium = {
                    id,
                    isActive: isActive,
                    updatedBy: systemUserId
                }

                let savedConsortium = await ConsortiumService.saveConsortium(consortium);

                resStatus = 1;
                resMsg = AppCommonService.getStatusChangedMessage();            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Organization Status Change Unsuccesful" + e;
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

exports.checkConsortiumShortCodeValidity = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var consortiumShortCode = req.body.consortiumShortCode;
    var id = req.body._id;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(consortiumShortCode !== undefined && consortiumShortCode != "")
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            let consortium = await ConsortiumService.checkConsortiumShortCodeForDuplication(id, consortiumShortCode);
            if(consortium)
            {
                resStatus = -1;
                resMsg = 'Organization with the organization Name already exists';
            }
            else
            {
                resStatus = 1;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Organization could not be fetched" + e;
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

exports.checkCanBeDeleted = async function(req, res, next)
{
    var id = req.body._id;

    var skipSend = AppCommonService.getSkipSendResponseValue(req);

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_DELETE);
        if(!hasRights)
        {
          resStatus = -1;
          resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                let consortiumUser = await ConsortiumUserService.checkIfConsortiumUserUsesConsortium(id);
                if(consortiumUser)
                {
                    resStatus = -1;
                    resMsg = 'This organization is associated with organization user';
                }
                else
                {
                    let consortiumLocation = await ConsortiumLocationService.checkIfConsortiumLocationUsesConsortium(id);
                    if(consortiumLocation)
                    {
                        resStatus = -1;
                        resMsg = 'This organization is associated with organization location';
                    }
                    else
                    {
                        resStatus = 1;
                    }
                }
            
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Organization Status Change Unsuccesful" + e;
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

exports.removeConsortium = async function(req, res, next){

    var id = req.params.id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id != "")
    {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_DELETE);
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                const compiledReq = AppCommonService.compileRequestWithSkipSendResponse(req);
                compiledReq.body._id = id;
                const canBeDeletedResponse = await exports.checkCanBeDeleted(compiledReq, res, next);
                if(canBeDeletedResponse)
                {
                    if(canBeDeletedResponse.status > 0)
                    {
                       
                        var consortium = {
                            id,
                            isDeleted: 1,
                            updatedBy: systemUserId
                        }

                        let savedConsortium = await ConsortiumService.saveConsortium(consortium);

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
                resMsg = "Organization Deletion Unsuccesful" + e;
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


exports.selectConsortiumSystemUserTeamList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 1;
    var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;

    let totalRecords = 0;
    let consortiumSystemUserData = [];

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
           
            await AppCommonService.setSystemUserAppAccessed(req);

            let consortiumSystemUserTeamList = await ConsortiumSystemUserTeamService.getConsortiumSystemUsersForSelect(req);
            
            resStatus = 1;
            if(consortiumSystemUserTeamList != null)
            {
                totalRecords = consortiumSystemUserTeamList.length;
                consortiumSystemUserData = consortiumSystemUserTeamList;

                if(forFilter) {
                    let consortiumSystemUserTeamObj = {};
                    consortiumSystemUserTeamObj.id = "";
                    consortiumSystemUserTeamObj.text = "All Consortium System Users";
  
                    consortiumSystemUserData.unshift(consortiumSystemUserTeamObj);
                  }
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationSystemUserTeams could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = consortiumSystemUserData;

    return res.status(httpStatus).json(responseObj)
}

exports.saveConsortiumSystemUserTeam = async function(req,res)
{
    var consortiumSystemUserTeamId = req.body.id;
    var systemUserReqId = req.body.systemUserReqId;
    var consortium = req.body.consortium;
  

    if(!consortiumSystemUserTeamId)
    consortiumSystemUserTeamId = '';

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(systemUserReqId !== undefined && systemUserReqId !== "" && consortium !== undefined && consortium !== '')
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((consortiumSystemUserTeamId == "" && !hasAddRights) || (consortiumSystemUserTeamId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var fetchedConsortium = await ConsortiumService.findConsortiumById(req, consortium);
                if(fetchedConsortium)
                {
                  
                    var existingConsortiumSystemUserTeam = await ConsortiumSystemUserTeamService.findConsortiumSystemUserTeamById(consortiumSystemUserTeamId);
                    
                    var consortiumSystemUserTeam = {
                        systemUser: systemUserReqId,
                        consortium : consortium,
                        updatedBy : systemUserId
                    };
    
                    if(existingConsortiumSystemUserTeam)
                    {
                        consortiumSystemUserTeam.id = existingConsortiumSystemUserTeam._id;
                    }
                    else
                    { 
                        consortiumSystemUserTeam.createdBy = systemUserId;
                    }
                  
                    let savedConsortiumSystemUserTeam = await ConsortiumSystemUserTeamService.saveConsortiumSystemUserTeam(consortiumSystemUserTeam);
                    if(savedConsortiumSystemUserTeam)
                    {
                        let savedConsortiumSystemUserTeamId = savedConsortiumSystemUserTeam._id;
                        let isAdd = savedConsortiumSystemUserTeam.isAdd;
                        if(isAdd === true)
                        {
                            let fetchedConsortiumId = savedConsortiumSystemUserTeam.consortium;
                            let fetchedSystemUserId = savedConsortiumSystemUserTeam.systemUser;
                            await ConsortiumChatThreadMessageService.saveConsortiumChatThreadUserMetricForSystemUser(fetchedConsortiumId,fetchedSystemUserId);
                        }

                        resStatus = 1;
                        responseObj.id = savedConsortiumSystemUserTeamId;
                        
                    }
                    else
                    {
                        resStatus = -1;
                    }
    
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Organization Retrieval Unsuccesful ";
                }

              
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Organization Retrieval Unsuccesful " + e;
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


exports.getConsortiumSystemUserTeamDetails = async function(req, res, next) {
    
    var id = req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var fetchedConsortiumSystemUserTeam = await ConsortiumSystemUserTeamService.findConsortiumSystemUserTeamById(id);
                if(fetchedConsortiumSystemUserTeam)
                {
                    resStatus = 1;
                    responseObj.consortiumSystemUserTeam = fetchedConsortiumSystemUserTeam;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Organization Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Organization Retrieval Unsuccesful " + e;
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


exports.removeConsortiumSystemUserTeam = async function(req, res, next){

    var id = req.params.id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id != "")
    {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_DELETE);
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var fetchedConsortiumSystemUserTeam = await ConsortiumSystemUserTeamService.findConsortiumSystemUserTeamById(id);
                if(fetchedConsortiumSystemUserTeam)
                {
                    await ConsortiumSystemUserTeamService.removeConsortiumSystemUserTeam(id);


                    resStatus = 1;
                    resMsg = AppCommonService.getDeletedMessage("Organization System User Team");
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Organization Retrieval Unsuccesful ";
                }
                
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Organization Deletion Unsuccesful" + e;
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