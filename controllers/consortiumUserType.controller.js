var ConsortiumUserTypeService = require('../services/consortiumUserType.service')
var ConsortiumUserService = require('../services/consortiumUser.service')
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
var thisModule = AppConfigModule.MOD_CONSORTIUM_USER_TYPE;
var thisModulename = AppConfigModuleName.MOD_CONSORTIUM_USER_TYPE;

exports.saveConsortiumUserType = async function(req,res)
{
    var consortiumUserTypeId = req.body.id;
    var typeText = req.body.typeText;
    var description = req.body.description;
    var isAppointmentEnabled = req.body.isAppointmentEnabled;
  

    if(!consortiumUserTypeId)
    consortiumUserTypeId = '';

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
    else if(typeText !== undefined && typeText !== "")
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((consortiumUserTypeId == "" && !hasAddRights) || (consortiumUserTypeId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var consortiumUserType = {
                    typeText: typeText,
                    description: description,
                    isAppointmentEnabled : isAppointmentEnabled,
                    updatedBy : systemUserId
                };
                

                if(consortiumUserTypeId == "")
                {
                    consortiumUserType.createdBy = systemUserId;
                    consortiumUserType.isDeleted = 0;
                }
                else
                {
                    consortiumUserType.id = consortiumUserTypeId;
                }

                let savedConsortiumUserType = await ConsortiumUserTypeService.saveConsortiumUserType(consortiumUserType);

                if(savedConsortiumUserType)
                {
                    responseObj.savedConsortiumUserTypeId = savedConsortiumUserType._id;
                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);      
                }else{
                    resStatus = -1;
                }
            
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationUserType Retrieval Unsuccesful " + e;
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

exports.getConsortiumUserTypeDetails = async function(req, res, next) {
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

                var fetchedConsortiumUserType = await ConsortiumUserTypeService.findConsortiumUserTypeById(req, id);
                if(fetchedConsortiumUserType)
                {
                    resStatus = 1;
                    responseObj.consortiumUserType = fetchedConsortiumUserType;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "OrganizationUserType Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationUserType Retrieval Unsuccesful " + e;
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

exports.getConsortiumUserTypes = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let consortiumUserTypeData = [];

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

                let consortiumUserTypesList = await ConsortiumUserTypeService.getConsortiumUserTypes(req);

                resStatus = 1;
                if(consortiumUserTypesList != null)
                {
                    consortiumUserTypeData = consortiumUserTypesList.results;
                    totalRecords = consortiumUserTypesList.totalRecords;
                    filteredRecords = consortiumUserTypesList.filteredRecords;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationUserTypesList could not be fetched" + e;
            }
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = consortiumUserTypeData;

    return res.status(httpStatus).json(responseObj)
}

exports.selectConsortiumUserTypeList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 1;
    var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;

    let totalRecords = 0;
    let consortiumUserTypeData = [];

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

            let consortiumUserTypeList = await ConsortiumUserTypeService.getConsortiumUserTypesForSelect(onlyActiveStatus);

            resStatus = 1;
            if(consortiumUserTypeList != null)
            {
                totalRecords = consortiumUserTypeList.length;
                consortiumUserTypeData = consortiumUserTypeList;

                if(forFilter) {
                    let consortiumUserTypeObj = {};
                    consortiumUserTypeObj.id = "";
                    consortiumUserTypeObj.text = "All ConsortiumUserTypes";
  
                    consortiumUserTypeData.unshift(consortiumUserTypeObj);
                  }
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationUserTypes could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = consortiumUserTypeData;

    return res.status(httpStatus).json(responseObj)
}

exports.changeConsortiumUserTypeStatus = async function(req, res, next)
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

               
                var consortiumUserType = {
                    id,
                    isActive: isActive,
                    updatedBy: systemUserId
                }

                let savedConsortiumUserType = await ConsortiumUserTypeService.saveConsortiumUserType(consortiumUserType);

                resStatus = 1;
                resMsg = AppCommonService.getStatusChangedMessage();            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationUserType Status Change Unsuccesful" + e;
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

exports.checkConsortiumUserTypeNameValidity = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var typeText = req.body.typeText;
    var id = req.body._id;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(typeText !== undefined && typeText != "")
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            let consortiumUserType = await ConsortiumUserTypeService.checkConsortiumUserTypeNameForDuplication(id, typeText);
            if(consortiumUserType)
            {
                resStatus = -1;
                resMsg = 'OrganizationUserType with the organizationUserType Name already exists';
            }
            else
            {
                resStatus = 1;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationUserType could not be fetched" + e;
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

                let consortiumUser = await ConsortiumUserService.checkIfConsortiumUserUsesConsortiumUserType(id);
                if(consortiumUser)
                {
                    resStatus = -1;
                    resMsg = 'This Organization User Type is associated with organization user';
                }
                else
                {
                    resStatus = 1;
                }
            
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationUserType Status Change Unsuccesful" + e;
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

exports.removeConsortiumUserType = async function(req, res, next){

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
                       
                        var consortiumUserType = {
                            id,
                            isDeleted: 1,
                            updatedBy: systemUserId
                        }

                        let savedConsortiumUserType = await ConsortiumUserTypeService.saveConsortiumUserType(consortiumUserType);

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
                resMsg = "OrganizationUserType Deletion Unsuccesful" + e;
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
