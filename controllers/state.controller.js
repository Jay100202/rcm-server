var StateService = require('../services/state.service')
var CountryService = require('../services/country.service')
var CityService = require('../services/city.service')
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
var thisModule = AppConfigModule.MOD_STATE;
var thisModulename = AppConfigModuleName.MOD_STATE;

exports.saveState = async function(req,res)
{
    var stateId = req.body.id;
    var stateName = req.body.stateName;
    var description = req.body.description;
    var country = req.body.country;  

    if(!stateId)
    stateId = '';

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
    else if(stateName !== undefined && stateName !== "" &&  country !== undefined && country !== "")
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((stateId == "" && !hasAddRights) || (stateId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                let fetchedCountryId;
                var fetchedState = await StateService.findStateById(req, stateId);
                if(fetchedState)
                {
                    fetchedCountryId = fetchedState.country._id;
                }
         
                var state = {
                    stateName: stateName,
                    country : country,
                    description: description,
                    updatedBy : systemUserId
                };
                

                if(fetchedState)
                {
                    state.id = stateId;
                }
                else
                {
                    state.createdBy = systemUserId;
                    state.isDeleted = 0;
                }

                let savedState = await StateService.saveState(state);

                if(savedState)
                {
                    let savedStateId = savedState._id;
                    let savedCountryId = savedState.country;

                    if((savedCountryId + '') !== (fetchedCountryId + ''))
                    {
                        await CityService.updateCityByStateId(savedStateId, savedCountryId);
                    }

                    responseObj.id = savedStateId;

                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);      
                }else{
                    resStatus = -1;
                }
            
                      
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "State Retrieval Unsuccesful " + e;
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

exports.getStateDetails = async function(req, res, next) {
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

                var fetchedState = await StateService.findStateById(req, id);
                if(fetchedState)
                {
                    resStatus = 1;
                    responseObj.state = fetchedState;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "State Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "State Retrieval Unsuccesful " + e;
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

exports.getStates = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let stateData = [];

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

                let statesList = await StateService.getStates(req);

                resStatus = 1;
                if(statesList != null)
                {
                    stateData = statesList.results;
                    totalRecords = statesList.totalRecords;
                    filteredRecords = statesList.filteredRecords;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "StatesList could not be fetched" + e;
            }
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = stateData;

    return res.status(httpStatus).json(responseObj)
}

exports.selectStateList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 1;
    var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;
    var forCountry = req.body.forCountry;

    let totalRecords = 0;
    let stateData = [];

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

            let stateList = await StateService.getStatesForSelect(onlyActiveStatus, forCountry);

            resStatus = 1;
            if(stateList != null)
            {
                totalRecords = stateList.length;
                stateData = stateList;

                if(forFilter) {
                    let stateObj = {};
                    stateObj.id = "";
                    stateObj.text = "All States";
  
                    stateData.unshift(stateObj);
                  }
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "States could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = stateData;

    return res.status(httpStatus).json(responseObj)
}

exports.changeStateStatus = async function(req, res, next)
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

               
                var state = {
                    id,
                    isActive: isActive,
                    updatedBy: systemUserId
                }

                let savedState = await StateService.saveState(state);

                resStatus = 1;
                resMsg = AppCommonService.getStatusChangedMessage();            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "State Status Change Unsuccesful" + e;
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

exports.checkStateNameValidity = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var forCountry = req.body.forCountry;
    var stateName = req.body.stateName;
    var id = req.body._id;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(stateName !== undefined && stateName != "")
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            let state = await StateService.checkStateNameForDuplication(id, stateName, forCountry);
            if(state)
            {
                resStatus = -1;
                resMsg = 'State with the state Name already exists';
            }
            else
            {
                resStatus = 1;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "State could not be fetched" + e;
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

                let city = await CityService.checkIfCityUsesState(id);
                if(city)
                {
                    resStatus = -1;
                    resMsg = 'This State is associated with other city';
                }
                else
                {
                    resStatus = 1;
                }
            
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "State Status Change Unsuccesful" + e;
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

exports.removeState = async function(req, res, next){

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
                       
                        var state = {
                            id,
                            isDeleted: 1,
                            updatedBy: systemUserId
                        }

                        let savedState = await StateService.saveState(state);

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
                resMsg = "State Deletion Unsuccesful" + e;
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

exports.performStateImport = async function(req,res)
{
    var stateNameArr = req.body.stateNameArr;
    var countryNameArr = req.body.countryNameArr;
    var isValidArr = req.body.isValidArr;
    var validationMessageArr = req.body.validationMessageArr;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var importValidityStatusArr = [];
    var importValidityStatusMsgArr = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(stateNameArr !== undefined && stateNameArr.length > 0 && countryNameArr !== undefined && countryNameArr.length > 0 && stateNameArr.length === countryNameArr.length)
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((!hasAddRights) || (!hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try 
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var description = '';

                var mappedInsStateRecordsArr = [];
                var mappedInsStateNameArr = [];

                resStatus = 1;
                resMsg = AppCommonService.getSavedMessage(thisModulename);      
                
                await Promise.all((stateNameArr).map(async (stateName, srIndex) => 
                {

                    var isValidStateRecord = true;
                    var stateValidityMsg = 'Success';

                    var isValidInp = isValidArr[srIndex];
                    var validationMessageInp = validationMessageArr[srIndex];
                    var countryName = countryNameArr[srIndex];
                   
                    var sanStateName = AppDataSanitationService.sanitizeDataTypeString(stateName); 
                    countryName = AppDataSanitationService.sanitizeDataTypeString(countryName); 

                    var sanIsValidInp = AppDataSanitationService.sanitizeDataTypeBoolean(isValidInp); 
                    var sanValidationMessageInp = AppDataSanitationService.sanitizeDataTypeString(validationMessageInp); 

                    let countryId;
                    if(sanIsValidInp === true)
                    {
                        if(countryName && countryName !== undefined)
                        {
                            let fetchCountry = await CountryService.checkCountryNameForDuplication(countryId, countryName);
                            if(fetchCountry)
                            {
                                countryId = fetchCountry._id;
                            }
                            else
                            {
                                isValidStateRecord = false;
                                stateValidityMsg = 'This country name does not exist';
                            }
                           
                        }


                        if(isValidStateRecord === true  && countryId && countryId !== undefined)
                        {
                            isValidStateRecord = false;
                            if(sanStateName !== '')
                            {
                                let id;
                                let fetchedState = await StateService.checkStateNameForDuplication(id, sanStateName,countryId);
                                if(fetchedState === null)
                                {
                                    if(mappedInsStateNameArr.indexOf(sanStateName) < 0)
                                    {
                                        isValidStateRecord = true;
                                        mappedInsStateNameArr.push(sanStateName);
                                    }
                                } 
                            }
        
                            if(isValidStateRecord === false)
                            {
                                stateValidityMsg = 'This State name already exists';
                            }
                        }

                       
                    }
                    else
                    {
                        isValidStateRecord = false;
                        stateValidityMsg = sanValidationMessageInp;
                    }

                    
                    if(isValidStateRecord === true && countryId !== null && countryId !== undefined && countryId !== '')
                    {
                        var insState = {
                            stateName: stateName,
                            description: description,
                            country : countryId,
                            updatedBy: systemUserId,
                            createdBy: systemUserId,
                            isDeleted: 0,
                            isActive: 1
                        };

                        mappedInsStateRecordsArr.push({
                            srIndex: srIndex, 
                            insState: insState
                        });

                    }
                    else
                    {
                        resStatus = -1;
                    }

                    importValidityStatusArr[srIndex] = isValidStateRecord;
                    importValidityStatusMsgArr[srIndex] = stateValidityMsg;

                }));



                if(resStatus === 1)
                {

                    let tempMappedInsStateRecordsArr = mappedInsStateRecordsArr;

                    if(tempMappedInsStateRecordsArr.length > 0)
                    {
                        await Promise.all((tempMappedInsStateRecordsArr).map(async (mappedStateRecord, recordIndex) =>
                        {
                            let isValidStateRecord = true;
                            let stateValidityMsg = 'Success';

                            let srIndex = mappedStateRecord.srIndex;
                            let insState = mappedStateRecord.insState;

                            let savedState = await StateService.saveState(insState);

                            if(savedState)
                            {
                                let savedStateId = savedState._id;
                                responseObj.id = savedStateId;
                            }
                            else
                            {
                                isValidStateRecord = false;
                                stateValidityMsg = AppConfigNotif.SERVER_ERROR;
                            }
                                                
                            importValidityStatusArr[srIndex] = isValidStateRecord;
                            importValidityStatusMsgArr[srIndex] = stateValidityMsg;
                        }));
                    }

                    resMsg = 'All the state details were successfully imported';
                }
                else if(resStatus === -1)
                {
                    resMsg = 'Some the state details were invalid. So the import could not be processed.';
                }

            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "State Retrieval Unsuccesful " + e;
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
                
    responseObj.importValidityStatus = importValidityStatusArr;
    responseObj.importValidityStatusMsg = importValidityStatusMsgArr;

    return res.status(httpStatus).json(responseObj);
}