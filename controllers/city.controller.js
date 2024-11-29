var CityService = require('../services/city.service')
var CountryService = require('../services/country.service')
var StateService = require('../services/state.service')
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
var thisModule = AppConfigModule.MOD_CITY;
var thisModulename = AppConfigModuleName.MOD_CITY;

/*
*    Add or Update Module Details
*    createdBy : AJP
*    createdOn : 14/12/22
*/
exports.saveCity = async function(req,res)
{
    /* Primary initialization of request variables */
    var cityId = req.body.id;
    var cityName = req.body.cityName;
    var state = req.body.state;
    var country = req.body.country;
    var description = req.body.description;
  

    if(!cityId)
    cityId = '';

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

     /* Get systemUser from request */
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        /* Check if a valid user session exists */
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(cityName !== undefined && cityName !== "" && state !== undefined && state !== "" && country !== undefined && country !== "")
    { 
        /* Check if user has module specific rights */
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((cityId == "" && !hasAddRights) || (cityId != "" && !hasEditRights))
        {
            /* Deny access due to insufficient rights */
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                
                /* Set super user app accessed */
                await AppCommonService.setSystemUserAppAccessed(req);

                /* Get existing module details */
                let fetchedStateId;
                var existingCity = await CityService.findCityById(req, cityId);
                if(existingCity)
                {
                    fetchedStateId = existingCity.state._id;
                }

                /* Set basic module details */
                var city = {
                    cityName: cityName,
                    state : state,
                    country : country,
                    description: description,
                    updatedBy : systemUserId
                };
                
                if (existingCity) {
                    /* Set module details for updation */
                    city.id = cityId;
                }
                else {
                    /* Set module details for creation */
                    city.createdBy = systemUserId;
                    city.isDeleted = 0;
                }

                 /* Perform module details save operation */
                let savedCity = await CityService.saveCity(city);

                if(savedCity)
                {
                    /* On success of save operation  */
                    let savedCityId = savedCity._id;

                    responseObj.id = savedCityId;
                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);      
                }else{
                    /* On failure of save operation */
                    resStatus = -1;
                }
            
                      
            }
            catch(e)
            {
                /* When an unexpected error occurs */
                resStatus = -1;
                resMsg = "City Retrieval Unsuccesful " + e;
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

/*
*    Get Individual Module Details 
*    createdBy : AJP
*    createdOn : 14/12/22
*/
exports.getCityDetails = async function(req, res, next) {
    /* Primary initialization of request variables */
    var id = req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

     /* Get systemUser from request */
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        /* Check if a valid user session exists */
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        /* Check if user has module specific rights */
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        if(!hasRights)
        {
            /* Deny access due to insufficient rights */
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
               /* Set super user app accessed */
                await AppCommonService.setSystemUserAppAccessed(req);


                var fetchedCity = await CityService.findCityById(req, id);
                if(fetchedCity)
                {
                    resStatus = 1;
                    responseObj.city = fetchedCity;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "City Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                /* When an unexpected error occurs */
                resStatus = -1;
                resMsg = "City Retrieval Unsuccesful " + e;
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

/*
*    Get Module List for Table & Export
*    createdBy : AJP
*    createdOn : 14/12/22
*/
exports.getCities = async function(req, res, next)
{
    
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let cityData = [];

     /* Get systemUser from request */
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);

    if(!systemUser)
    {
        /* Check if a valid user session exists */
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        /* Check if user has module specific rights */
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        if(!hasRights)
        {
            /* Deny access due to insufficient rights */
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
             
                /* Set super user app accessed */
                await AppCommonService.setSystemUserAppAccessed(req);

                 /* Get relevant module list */
                let citiesList = await CityService.getCities(req);

                resStatus = 1;
                if(citiesList != null)
                {
                    /* Compile response with module records & metrics */
                    cityData = citiesList.results;
                    totalRecords = citiesList.totalRecords;
                    filteredRecords = citiesList.filteredRecords;
                }
            }
            catch(e)
            {
                /* When an unexpected error occurs */
                resStatus = -1;
                resMsg = "CitiesList could not be fetched" + e;
            }
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = cityData;

    return res.status(httpStatus).json(responseObj)
}

/*
*    Get Module List for Selection
*    createdBy : AJP
*    createdOn : 14/12/22
*/
exports.selectCityList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    /* Primary initialization of request variables */
    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 1;
    var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;
    var forState = req.body.forState;

    let totalRecords = 0;
    let cityData = [];

     /* Get systemUser from request */
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        /* Check if a valid user session exists */
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        try
        {
            /* Set super user app accessed */
            await AppCommonService.setSystemUserAppAccessed(req);

            /* Get relevant module select list */
            let cityList = await CityService.getCitiesForSelect(onlyActiveStatus, forState);

            resStatus = 1;
            if(cityList != null)
            {
                /* Compile response with module records & metrics */
                totalRecords = cityList.length;
                cityData = cityList;

                if(forFilter) {
                    let cityObj = {};
                    cityObj.id = "";
                    cityObj.text = "All Cities";
  
                    cityData.unshift(cityObj);
                  }
            }
        }
        catch(e)
        {
            /* When an unexpected error occurs */
            resStatus = -1;
            resMsg = "City could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = cityData;

    return res.status(httpStatus).json(responseObj)
}

/*
*    Update Module Status Details
*    createdBy : AJP
*    createdOn : 14/12/22
*/
exports.changeCityStatus = async function(req, res, next)
{
    /* Primary initialization of request variables */
    var id = req.body._id;
    var isActive = req.body.isActive;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

     /* Get systemUser from request */
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        /* Check if a valid user session exists */
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id != "")
    {
        /* Check if user has module specific rights */
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if(!hasRights)
        {
            /* Deny access due to insufficient rights */
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
               
                /* Set super user app accessed */
                await AppCommonService.setSystemUserAppAccessed(req);
               
                /* Get existing module details */
                var existingCity = await CityService.findCityById(req, id);
                if(existingCity)
                {
                     /* Set module status detail */
                    var city = {
                        id,
                        isActive: isActive,
                        updatedBy: systemUserId
                    }
    
                    /* Perform module details status change operation */
                    let savedCity = await CityService.saveCity(city);
    
                    resStatus = 1;
                    resMsg = AppCommonService.getStatusChangedMessage();           
                }
                else 
                {
                    /* When required data is missing */
                    resStatus = -1;
                    resMsg = "Invalid Data";
                }  
              
                
            }
            catch(e)
            {
                /* When an unexpected error occurs */
                resStatus = -1;
                resMsg = "City Status Change Unsuccesful" + e;
            }
        }
    }
    else
    {
        /* When required data is missing or does not surpass the validation */
        resStatus = -1;
        resMsg = "Invalid Data";
    }

    return res.status(httpStatus).json({status: resStatus, message: resMsg});
}

/*
*   Check Module Unique Field Validity
*   createdBy : AJP
*   createdOn : 14/12/22
*/
exports.checkCityNameValidity = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    /* Primary initialization of request variables */
    var forState = req.body.forState;
    var cityName = req.body.cityName;
    var id = req.body._id;

     /* Get systemUser from request */
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        /* Check if a valid user session exists */
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(cityName !== undefined && cityName != "")
    {
        try
        {
            /* Set super user app accessed */
            await AppCommonService.setSystemUserAppAccessed(req);

            /* Perform module details duplication check operation */
            let city = await CityService.checkCityNameForDuplication(id, cityName, forState);
            if(city)
            {
                /* If duplicate value exists  */
                resStatus = -1;
                resMsg = 'City with the city Name already exists';
            }
            else
            {
                /* If duplicate value does not exist  */
                resStatus = 1;
            }
        }
        catch(e)
        {
            /* When an unexpected error occurs */
            resStatus = -1;
            resMsg = "City could not be fetched" + e;
        }
    }
    else
    {
        /* When required data is missing or does not surpass the validation */
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }
    
    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj)
}

/*
*    Check Module Validity For Delete
*    createdBy : AJP
*    createdOn : 14/12/22
*/
exports.checkCanBeDeleted = async function(req, res, next)
{
    /* Primary initialization of request variables */
    var id = req.body._id;

    var skipSend = AppCommonService.getSkipSendResponseValue(req);

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

     /* Get systemUser from request */
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        /* Check if a valid user session exists */
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        /* Check if user has module specific rights */
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_DELETE);
        if(!hasRights)
        {
            /* Deny access due to insufficient rights */
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
            
                /* Set super user app accessed */
                await AppCommonService.setSystemUserAppAccessed(req);

                /* Get existing module details */
                var existingCity = await CityService.findCityById(req, id);
                if(existingCity)
                {
                    resStatus = 1;
                }
                else 
                {
                    /* When required data is missing */
                    resStatus = -1;
                    resMsg = "Invalid Data";
                }             
            }
            catch(e)
            {
                /* When an unexpected error occurs */
                resStatus = -1;
                resMsg = "City Status Change Unsuccesful" + e;
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


/*
*    Delete Individual Module Details 
*    createdBy : AJP
*    createdOn : 14/12/22
*/
exports.removeCity = async function(req, res, next){

    /* Primary initialization of request variables */
    var id = req.params.id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

     /* Get systemUser from request */
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        /* Check if a valid user session exists */
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id != "")
    {
        /* Check if user has module specific rights */
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_DELETE);
        if(!hasRights)
        {
            /* Deny access due to insufficient rights */
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {

                /* Set super user app accessed */
                await AppCommonService.setSystemUserAppAccessed(req);

                /* internally check this data is valid for delete */
                const compiledReq = AppCommonService.compileRequestWithSkipSendResponse(req);
                compiledReq.body._id = id;
                const canBeDeletedResponse = await exports.checkCanBeDeleted(compiledReq, res, next);
                if(canBeDeletedResponse)
                {
                    if(canBeDeletedResponse.status > 0)
                    {
                       /* Set module detail for delete */
                        var city = {
                            id,
                            isDeleted: 1,
                            updatedBy: systemUserId
                        }

                        /* Perform module details delete operation */
                        let savedCity = await CityService.saveCity(city);

                        resStatus = 1;
                        resMsg = AppCommonService.getDeletedMessage(thisModulename);
                    }
                    else
                    {
                        /* When delete operation cannot be performed due to validations */
                        resStatus = canBeDeletedResponse.status;
                        resMsg = canBeDeletedResponse.message;
                    }
                }
                else
                {
                    /* On failure of check can be delete operation */
                    resStatus = -1;
                    resMsg = AppConfigNotif.SERVER_ERROR;
                }
                
            }
            catch(e)
            {
                /* When an unexpected error occurs */
                resStatus = -1;
                resMsg = "City Deletion Unsuccesful" + e;
            }
        }
    }
    else
    {
        /* When required data is missing or does not surpass the validation */
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    return res.status(httpStatus).json({status: resStatus, message: resMsg});
}


/*
*    Import Module Details 
*    createdBy : AJP
*    createdOn : 14/12/22
*/
exports.performCityImport = async function(req,res)
{
    /* Primary initialization of request variables */
    var cityNameArr = req.body.cityNameArr;
    var countryNameArr = req.body.countryNameArr;
    var stateNameArr = req.body.stateNameArr;
    var isValidArr = req.body.isValidArr;
    var validationMessageArr = req.body.validationMessageArr;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var importValidityStatusArr = [];
    var importValidityStatusMsgArr = [];

     /* Get systemUser from request */
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        /* Check if a valid user session exists */
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(cityNameArr !== undefined && cityNameArr.length > 0  && stateNameArr !== undefined && stateNameArr.length > 0 && countryNameArr !== undefined && countryNameArr.length > 0 && cityNameArr.length === countryNameArr.length && cityNameArr.length === stateNameArr.length )
    { 
        /* Check if user has module specific rights */
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((!hasAddRights) || (!hasEditRights))
        {
            /* Deny access due to insufficient rights */
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try 
            {
                /* Set super user app accessed */
                await AppCommonService.setSystemUserAppAccessed(req);

                var description = '';

                var mappedInsCityRecordsArr = [];
                var mappedInsCityNameArr = [];

                resStatus = 1;
                resMsg = AppCommonService.getSavedMessage(thisModulename);      
                
                /* Loop by module name */
                await Promise.all((cityNameArr).map(async (cityName, srIndex) => 
                {

                    var isValidCityRecord = true;
                    var cityValidityMsg = 'Success';

                    var isValidInp = isValidArr[srIndex];
                    var validationMessageInp = validationMessageArr[srIndex];
                    var countryName = countryNameArr[srIndex];
                    var stateName = stateNameArr[srIndex];
                   
                    var sanCityName = AppDataSanitationService.sanitizeDataTypeString(cityName); 
                    countryName = AppDataSanitationService.sanitizeDataTypeString(countryName); 
                    stateName = AppDataSanitationService.sanitizeDataTypeString(stateName); 

                    var sanIsValidInp = AppDataSanitationService.sanitizeDataTypeBoolean(isValidInp); 
                    var sanValidationMessageInp = AppDataSanitationService.sanitizeDataTypeString(validationMessageInp); 

                    let countryId,stateId;
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
                                isValidCityRecord = false;
                                cityValidityMsg = 'This country name does not exist';
                            }
                        }


                        if(isValidCityRecord === true && countryId && countryId !== undefined)
                        {
                            let fetchedState = await StateService.checkStateNameForDuplication(stateId, stateName,countryId);
                            if(fetchedState)
                            {
                                stateId = fetchedState._id;
                            }
                            else
                            {
                                isValidCityRecord = false;
                                cityValidityMsg = 'This state name does not exist';
                            }
                        }

                        if(isValidCityRecord === true && stateId !== null && stateId !== undefined && stateId !== '')
                        {
                            isValidCityRecord = false;
                            
                            if(sanCityName !== '')
                            {
                                let id;
                                let fetchedCity = await CityService.checkCityNameForDuplication(id, sanCityName,stateId);
                                if(fetchedCity === null)
                                {
                                    if(mappedInsCityNameArr.indexOf(sanCityName) < 0)
                                    {
                                        isValidCityRecord = true;
                                        mappedInsCityNameArr.push(sanCityName);
                                    }
                                } 
                            }
        
                            if(isValidCityRecord === false)
                            {
                                cityValidityMsg = 'This City name already exists';
                            }
                        }
                    }
                    else
                    {
                        isValidCityRecord = false;
                        cityValidityMsg = sanValidationMessageInp;
                    }
               
                    
                    if(isValidCityRecord === true && stateId !== null && stateId !== undefined && stateId !== '')
                    {
                        var insCity = {
                            cityName: cityName,
                            description: description,
                            state : stateId,
                            country : countryId,
                            updatedBy: systemUserId,
                            createdBy: systemUserId,
                            isDeleted: 0,
                            isActive: 1
                        };

                        mappedInsCityRecordsArr.push({
                            srIndex: srIndex, 
                            insCity: insCity
                        });

                    }
                    else
                    {
                        resStatus = -1;
                    }

                    importValidityStatusArr[srIndex] = isValidCityRecord;
                    importValidityStatusMsgArr[srIndex] = cityValidityMsg;

                }));


                if(resStatus === 1)
                {

                    let tempMappedInsCityRecordsArr = mappedInsCityRecordsArr;

                    if(tempMappedInsCityRecordsArr.length > 0)
                    {
                        await Promise.all((tempMappedInsCityRecordsArr).map(async (mappedCityRecord, recordIndex) =>
                        {
                            let isValidCityRecord = true;
                            let cityValidityMsg = 'Success';

                            let srIndex = mappedCityRecord.srIndex;
                            let insCity = mappedCityRecord.insCity;

                            let savedCity = await CityService.saveCity(insCity);

                            if(savedCity)
                            {
                                let savedCityId = savedCity._id;
                                responseObj.id = savedCityId;
                            }
                            else
                            {
                                isValidCityRecord = false;
                                cityValidityMsg = AppConfigNotif.SERVER_ERROR;
                            }
                                                
                            importValidityStatusArr[srIndex] = isValidCityRecord;
                            importValidityStatusMsgArr[srIndex] = cityValidityMsg;
                        }));
                    }

                    resMsg = 'All the city details were successfully imported';
                }
                else if(resStatus === -1)
                {
                    resMsg = 'Some the city details were invalid. So the import could not be processed.';
                }

            }
            catch(e)
            {
                /* When an unexpected error occurs */
                resStatus = -1;
                resMsg = "City Retrieval Unsuccesful " + e;
            }
        }
    }    
    else
    {
        /* When required data is missing or does not surpass the validation */
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
                
    responseObj.importValidityStatus = importValidityStatusArr;
    responseObj.importValidityStatusMsg = importValidityStatusMsgArr;

    return res.status(httpStatus).json(responseObj);
}