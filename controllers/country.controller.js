var CountryService = require('../services/country.service')
var StateService = require('../services/state.service')
var AppCommonService = require('../services/appcommon.service')
var AppDataSanitationService = require('../services/appDataSanitation.service');
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppConfigConst = require('../appconfig-const')
var AppConfigModuleName = require('../appconfig-module-name');
var mongodb = require("mongodb");

// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_COUNTRY;
var thisModulename = AppConfigModuleName.MOD_COUNTRY;

exports.saveCountry = async function(req,res)
{
    var countryId = req.body.id;
    var countryName = req.body.countryName;
    var description = req.body.description;
    var dialingCode = req.body.dialingCode;

    if(!countryId)
    countryId = '';
   
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
    else if(countryName !== undefined && countryName !== "")
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((countryId == "" && !hasAddRights) || (countryId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try 
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var updCountry = {
                    countryName: countryName,
                    dialingCode: dialingCode,
                    updatedBy : systemUserId
                };

                if(countryId === undefined || countryId === '')
                {
                    updCountry.createdBy = systemUserId;
                    updCountry.isDeleted = 0;
                    updCountry.isActive = 1;
                }
                else
                {
                    updCountry.id = countryId;
                }

                let savedCountry = await CountryService.saveCountry(updCountry);

                if(savedCountry)
                {
                    let savedCountryId = savedCountry._id;

                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);
                    responseObj.id = savedCountryId;
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
                resMsg = "Country Retrieval Unsuccesful " + e;
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

exports.getCountryDetails = async function(req, res, next) {
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

                var fetchedCountry = await CountryService.findCountryById(id, true);
                if(fetchedCountry)
                {
                    resStatus = 1;
                    responseObj.country = fetchedCountry;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Country Retrieval Unsuccesful  ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Country Retrieval Unsuccesful " + e;
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

exports.getCountries = async function(req,res,next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let countryData = [];

    var skipSend = AppCommonService.getSkipSendResponseValue(req);
    var forExport = req.body.forExport ? req.body.forExport : false;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
    
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
                let countryList = await CountryService.getCountries(req);

                resStatus = 1;
                if(countryList != null)
                {
                    countryData = countryList.results;
                    totalRecords = countryList.totalRecords;
                    filteredRecords = countryList.filteredRecords;
                }
              
                if(forExport === true)
                {
                    let appFilters = [];
    
                    responseObj.appFilters = appFilters;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Country could not be fetched" + e;
            }
        }

    }
       
    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = countryData;

    if(skipSend === true) 
    {
      return responseObj;
    }
    else 
    {
      return res.status(httpStatus).json(responseObj);
    }
}

exports.selectCountryList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var forFilter = req.body.forFilter && typeof req.body.forFilter === 'boolean' ? req.body.forFilter : false;

    let totalRecords = 0;
    let countryData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

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

            let countryList = await CountryService.getCountriesForSelect(req);

            resStatus = 1;
            if(countryList != null)
            {
                totalRecords = countryList.length;
                countryData = countryList;

                if(forFilter) {
                    let systemUserObj = {};
                    systemUserObj.id = "";
                    systemUserObj.text = "All Countries";

                    countryData.unshift(systemUserObj);
                }

            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Countries could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = countryData;

    return res.status(httpStatus).json(responseObj)
}

exports.removeCountry = async function(req, res, next){
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
            const compiledReq = AppCommonService.compileRequestWithSkipSendResponse(req);
            compiledReq.body._id = id;
            const canBeDeletedResponse = await exports.checkCanBeDeleted(compiledReq, res, next);
            if(canBeDeletedResponse)
            {
                if(canBeDeletedResponse.status > 0)
                {
                    await AppCommonService.setSystemUserAppAccessed(req);

                    var updCountry = {
                        id: id,
                        isDeleted: 1,
                        updatedBy: systemUserId
                    }

                    let savedCountry = await CountryService.saveCountry(updCountry);
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
            resMsg = "Country Deletion Unsuccesful" + e;
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

exports.changeCountryStatus = async function(req, res, next)
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

                var updCountry = {
                    id : id,
                    isActive: isActive,
                    updatedBy: systemUserId
                }

                let savedCountry = await CountryService.saveCountry(updCountry);

                resStatus = 1;
                resMsg = AppCommonService.getStatusChangedMessage();
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Country Status Change Unsuccesful" + e;
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
            let  fetchedState = await StateService.checkIfStateUsesCountry(id);
            if(fetchedState)
            {
                resStatus = -1;
                resMsg = 'This Country is associated with other State(s)';
            }
            else
            {
                
                resStatus = 1;
            }
          }
          catch(e)
          {
              resStatus = -1;
              resMsg = "Country Status Change Unsuccesful" + e;
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

exports.checkCountryNameValidity = async function(req, res, next)
{
    var id = req.body._id;
    var countryName = req.body.countryName;

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
    else if(countryName !== undefined && countryName !== "")
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
                let fetchedCountry = await CountryService.checkCountryNameForDuplication(id, countryName);

                if(fetchedCountry)
                {
                    resStatus = -1;
                    resMsg = 'This Country exists';
                }
                else
                {
                    resStatus = 1;
                }

            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Error while Fetching Country Name " + e;
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

exports.performCountryImport = async function(req,res)
{
    var countryNameArr = req.body.countryNameArr;
    var dialingCodeArr = req.body.dialingCodeArr;

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
    else if(countryNameArr !== undefined && countryNameArr.length > 0 )
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

                var mappedInsCountryRecordsArr = [];
                var mappedInsCountryNameArr = [];

                resStatus = 1;
                resMsg = AppCommonService.getSavedMessage(thisModulename);      
                
                await Promise.all((countryNameArr).map(async (countryName, srIndex) => 
                {
                    let dialingCode;
                    if(dialingCodeArr && dialingCodeArr !== undefined)
                    {
                        dialingCode = dialingCodeArr[srIndex] && dialingCodeArr[srIndex] !== undefined ? dialingCodeArr[srIndex] : '';
                    }

                    var countryValidityMsg = 'Success';
                    var sanCountryName = AppDataSanitationService.sanitizeDataTypeString(countryName); 
                    var isValidCountryRecord = false;

                    if(sanCountryName !== '')
                    {
                        let id;
                        let fetchedCountry = await CountryService.checkCountryNameForDuplication('', sanCountryName);
                        if(fetchedCountry === null)
                        {
                            if(mappedInsCountryNameArr.indexOf(sanCountryName) < 0)
                            {
                                isValidCountryRecord = true;
                                mappedInsCountryNameArr.push(sanCountryName);
                            }
                        } 
                    }

                    if(isValidCountryRecord === false)
                    {
                        countryValidityMsg = 'This Country name already exists';
                    }
                    
                    if(isValidCountryRecord === true)
                    {
                        var insCountry = {
                            countryName: countryName,
                            description: description,
                            dialingCode : dialingCode,
                            updatedBy: systemUserId,
                            createdBy: systemUserId,
                            isDeleted: 0,
                            isActive: 1
                        };

                        mappedInsCountryRecordsArr.push({
                            srIndex: srIndex, 
                            insCountry: insCountry
                        });

                    }
                    else
                    {
                        resStatus = -1;
                    }

                    importValidityStatusArr[srIndex] = isValidCountryRecord;
                    importValidityStatusMsgArr[srIndex] = countryValidityMsg;

                }));


                if(resStatus === 1)
                {

                    let tempMappedInsCountryRecordsArr = mappedInsCountryRecordsArr;

                    if(tempMappedInsCountryRecordsArr.length > 0)
                    {
                        await Promise.all((tempMappedInsCountryRecordsArr).map(async (mappedCountryRecord, recordIndex) =>
                        {
                            let isValidCountryRecord = true;
                            let countryValidityMsg = 'Success';

                            let srIndex = mappedCountryRecord.srIndex;
                            let insCountry = mappedCountryRecord.insCountry;

                            let savedCountry = await CountryService.saveCountry(insCountry);

                            if(savedCountry)
                            {
                                let savedCountryId = savedCountry._id;
                                responseObj.id = savedCountryId;
                            }
                            else
                            {
                                isValidCountryRecord = false;
                                countryValidityMsg = AppConfigNotif.SERVER_ERROR;
                            }
                                                
                            importValidityStatusArr[srIndex] = isValidCountryRecord;
                            importValidityStatusMsgArr[srIndex] = countryValidityMsg;
                        }));
                    }

                    resMsg = 'All the country details were successfully imported';
                }
                else if(resStatus === -1)
                {
                    resMsg = 'Some of the country details were invalid. So the import could not be processed.';
                }

            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Country Retrieval Unsuccesful " + e;
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