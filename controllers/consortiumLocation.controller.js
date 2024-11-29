var ConsortiumLocationService = require('../services/consortiumLocation.service')
var ConsortiumUserService = require('../services/consortiumUser.service')
var SystemUserService = require('../services/systemUser.service')
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
var thisModule = AppConfigModule.MOD_CONSORTIUM_LOCATION;
var thisModulename = AppConfigModuleName.MOD_CONSORTIUM_LOCATION;

exports.saveConsortiumLocation = async function(req,res)
{
    var consortiumLocationId = req.body.id;
    var consortium = req.body.consortium;
    var locationName = req.body.locationName;
    var addressLine1 = req.body.addressLine1;
    var addressLine2 = req.body.addressLine2;
    var addressLine3 = req.body.addressLine3;
    var phoneNumber1 = req.body.phoneNumber1;
    var phoneNumber2 = req.body.phoneNumber2;
    var phoneNumber3 = req.body.phoneNumber3;
    var email = req.body.email;
    var websiteUrl = req.body.websiteUrl;
    var description = req.body.description;
    var timeZoneOption = req.body.timeZoneOption;
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;

    var startTimeInt = 0;
    if(startTime !== undefined && startTime !== "")
    {
        try{
            startTimeInt = parseInt(startTime.replace(':', ''));
        }
        catch(e)
        {
            startTimeInt = 0;
        }
    }

    var endTimeInt = 0;
    if(endTime !== undefined && endTime !== "")
    {
        try{
            endTimeInt = parseInt(endTime.replace(':', ''));
        }
        catch(e)
        {
            endTimeInt = 0;
        }
    }

    if(!consortiumLocationId)
    consortiumLocationId = '';

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
    else if(locationName !== undefined && locationName !== "" && consortium && consortium !== undefined && consortium !== '' && timeZoneOption && timeZoneOption !== undefined && timeZoneOption !== ''&& startTime && startTime !== undefined && startTime !== '' && endTime && endTime !== undefined && endTime !== '' )
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((consortiumLocationId == "" && !hasAddRights) || (consortiumLocationId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var existingConsortiumLocation = await ConsortiumLocationService.findConsortiumLocationById(req, consortiumLocationId,false);
                
                let address = {
                    addressLine1: addressLine1,
                    addressLine2: addressLine2,
                    addressLine3: addressLine3
                }

                var consortiumLocation = {
                    locationName: locationName,
                    consortium,consortium,
                    phoneNumber1,phoneNumber1,
                    phoneNumber2,phoneNumber2,
                    phoneNumber3,phoneNumber3,
                    email,email,
                    websiteUrl,websiteUrl,
                    description: description,
                    address : address,
                    timeZoneOption : timeZoneOption,
                    startTime : startTime,
                    startTimeInt : startTimeInt,
                    endTime : endTime,
                    endTimeInt : endTimeInt,
                    updatedBy : systemUserId
                };
                

                if(existingConsortiumLocation)
                {
                    consortiumLocation.id = consortiumLocationId;
                }
                else
                { 
                    consortiumLocation.createdBy = systemUserId;
                    consortiumLocation.isDeleted = 0;
                }

                let savedConsortiumLocation = await ConsortiumLocationService.saveConsortiumLocation(consortiumLocation);

                if(savedConsortiumLocation)
                {
                    responseObj.savedConsortiumLocationId = savedConsortiumLocation._id;
                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);      
                }else{
                    resStatus = -1;
                }
            
                      
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationLocation Retrieval Unsuccesful " + e;
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

exports.getConsortiumLocationDetails = async function(req, res, next) {
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

                var fetchedConsortiumLocation = await ConsortiumLocationService.findConsortiumLocationById(req, id);
                if(fetchedConsortiumLocation)
                {
                    resStatus = 1;
                    responseObj.consortiumLocation = fetchedConsortiumLocation;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "OrganizationLocation Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationLocation Retrieval Unsuccesful " + e;
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

exports.getConsortiumLocations = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let consortiumLocationData = [];

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

                let consortiumLocationsList = await ConsortiumLocationService.getConsortiumLocations(req);

                resStatus = 1;
                if(consortiumLocationsList != null)
                {
                    consortiumLocationData = consortiumLocationsList.results;
                    totalRecords = consortiumLocationsList.totalRecords;
                    filteredRecords = consortiumLocationsList.filteredRecords;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationLocationsList could not be fetched" + e;
            }
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = consortiumLocationData;

    return res.status(httpStatus).json(responseObj)
}

exports.selectConsortiumLocationList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 1;
    var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;

    let totalRecords = 0;
    let consortiumLocationData = [];

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

            let consortiumLocationList = await ConsortiumLocationService.getConsortiumLocationsForSelect(req,onlyActiveStatus);

            resStatus = 1;
            if(consortiumLocationList != null)
            {
                totalRecords = consortiumLocationList.length;
                consortiumLocationData = consortiumLocationList;

                if(forFilter) {
                    let consortiumLocationObj = {};
                    consortiumLocationObj.id = "";
                    consortiumLocationObj.text = "All ConsortiumLocations";
  
                    consortiumLocationData.unshift(consortiumLocationObj);
                  }
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationLocations could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = consortiumLocationData;

    return res.status(httpStatus).json(responseObj)
}

exports.changeConsortiumLocationStatus = async function(req, res, next)
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

                var existingConsortiumLocation = await ConsortiumLocationService.findConsortiumLocationById(req, id,false);
                if(existingConsortiumLocation)
                {
                    var consortiumLocation = {
                        id : existingConsortiumLocation._id,
                        isActive: isActive,
                        updatedBy: systemUserId
                    }
    
                    let savedConsortiumLocation = await ConsortiumLocationService.saveConsortiumLocation(consortiumLocation);
    
                    resStatus = 1;
                    resMsg = AppCommonService.getStatusChangedMessage();       
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Location Status Change Unsuccesful";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Location Status Change Unsuccesful" + e;
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

exports.checkConsortiumLocationNameValidity = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var locationName = req.body.locationName;
    var consortiumId = req.body.consortium;
    var id = req.body._id;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(locationName !== undefined && locationName != "")
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            var existingConsortiumLocation = await ConsortiumLocationService.findConsortiumLocationById(req, id,false);
            if(existingConsortiumLocation)
            {
                let consortiumLocation = await ConsortiumLocationService.checkConsortiumLocationNameForDuplication(id, locationName,consortiumId);
                if(consortiumLocation)
                {
                    resStatus = -1;
                    resMsg = 'OrganizationLocation with the organizationLocation Name already exists';
                }
                else
                {
                    resStatus = 1;
                }
            }
            else
            {
                {
                    resStatus = -1;
                    resMsg = "OrganizationLocation could not be fetched";
                }
            }
           
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationLocation could not be fetched" + e;
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

                var existingConsortiumLocation = await ConsortiumLocationService.findConsortiumLocationById(req, id,false);
                if(existingConsortiumLocation)
                {
                    let consortiumUser = await ConsortiumUserService.checkIfConsortiumUserUsesConsortiumLocation(id);
                    if(consortiumUser)
                    {
                        resStatus = -1;
                        resMsg = 'This organization Location is associated with organization user';
                    }
                    else
                    {
                        resStatus = 1;
                    }
                }
                else
                {
                    {
                        resStatus = -1;
                        resMsg = "Organization Location Status Change Unsuccesful";
                    }
                }
            
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Organization Location Status Change Unsuccesful" + e;
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

exports.removeConsortiumLocation = async function(req, res, next){

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
                       
                        var consortiumLocation = {
                            id,
                            isDeleted: 1,
                            updatedBy: systemUserId
                        }

                        let savedConsortiumLocation = await ConsortiumLocationService.saveConsortiumLocation(consortiumLocation);

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
                resMsg = "Organization Location Deletion Unsuccesful" + e;
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
