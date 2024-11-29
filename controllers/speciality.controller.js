var SpecialityService = require('../services/speciality.service')
var ConsortiumUserService = require('../services/consortiumUser.service')
var AppCommonService = require('../services/appcommon.service')
var AppDataSanitationService = require('../services/appDataSanitation.service');
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppConfigConst = require('../appconfig-const')
var AppConfigModuleName = require('../appconfig-module-name');
var mongodb = require("mongodb");

// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_SPECIALITY;
var thisModulename = AppConfigModuleName.MOD_SPECIALITY;

exports.saveSpeciality = async function(req,res)
{
    var specialityId = req.body.id;
    var specialityName = req.body.specialityName;
    var description = req.body.description;

    if(!specialityId)
    specialityId = '';
   
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
    else if(specialityName !== undefined && specialityName !== "")
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((specialityId == "" && !hasAddRights) || (specialityId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try 
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var updSpeciality = {
                    specialityName: specialityName,
                    description: description,
                    updatedBy : systemUserId
                };

                if(specialityId === undefined || specialityId === '')
                {
                    updSpeciality.createdBy = systemUserId;
                    updSpeciality.isDeleted = 0;
                    updSpeciality.isActive = 1;
                }
                else
                {
                    updSpeciality.id = specialityId;
                }

                let savedSpeciality = await SpecialityService.saveSpeciality(updSpeciality);

                if(savedSpeciality)
                {
                    let savedSpecialityId = savedSpeciality._id;

                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);
                    responseObj.id = savedSpecialityId;
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
                resMsg = "Speciality Retrieval Unsuccesful " + e;
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

exports.getSpecialityDetails = async function(req, res, next) {
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

                var fetchedSpeciality = await SpecialityService.findSpecialityById(id, true);
                if(fetchedSpeciality)
                {
                    resStatus = 1;
                    responseObj.speciality = fetchedSpeciality;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Speciality Retrieval Unsuccesful  ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Speciality Retrieval Unsuccesful " + e;
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

exports.getSpecialities = async function(req,res,next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let specialityData = [];

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
                let specialityList = await SpecialityService.getSpecialities(req);

                resStatus = 1;
                if(specialityList != null)
                {
                    specialityData = specialityList.results;
                    totalRecords = specialityList.totalRecords;
                    filteredRecords = specialityList.filteredRecords;
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
                resMsg = "Speciality could not be fetched" + e;
            }
        }

    }
       
    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = specialityData;

    if(skipSend === true) 
    {
      return responseObj;
    }
    else 
    {
      return res.status(httpStatus).json(responseObj);
    }
}

exports.selectSpecialityList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var forFilter = req.body.forFilter && typeof req.body.forFilter === 'boolean' ? req.body.forFilter : false;

    let totalRecords = 0;
    let specialityData = [];

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

            let specialityList = await SpecialityService.getSpecialitiesForSelect(req);

            resStatus = 1;
            if(specialityList != null)
            {
                totalRecords = specialityList.length;
                specialityData = specialityList;

                if(forFilter) {
                    let systemUserObj = {};
                    systemUserObj.id = "";
                    systemUserObj.text = "All Specialities";

                    specialityData.unshift(systemUserObj);
                }

            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Specialities could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = specialityData;

    return res.status(httpStatus).json(responseObj)
}

exports.removeSpeciality = async function(req, res, next){
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

                    var updSpeciality = {
                        id: id,
                        isDeleted: 1,
                        updatedBy: systemUserId
                    }

                    let savedSpeciality = await SpecialityService.saveSpeciality(updSpeciality);
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
            resMsg = "Speciality Deletion Unsuccesful" + e;
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

exports.changeSpecialityStatus = async function(req, res, next)
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

                var updSpeciality = {
                    id : id,
                    isActive: isActive,
                    updatedBy: systemUserId
                }

                let savedSpeciality = await SpecialityService.saveSpeciality(updSpeciality);

                resStatus = 1;
                resMsg = AppCommonService.getStatusChangedMessage();
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Speciality Status Change Unsuccesful" + e;
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
            let  fetchedConsortiumUser = await ConsortiumUserService.checkIfConsortiumUserUsesSpeciality(id);
            if(fetchedConsortiumUser)
            {
                resStatus = -1;
                resMsg = 'This Speciality is associated with other Consortium User(s)';
            }
            else
            {
                
                resStatus = 1;
            }
          }
          catch(e)
          {
              resStatus = -1;
              resMsg = "Speciality Status Change Unsuccesful" + e;
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

exports.checkSpecialityNameValidity = async function(req, res, next)
{
    var id = req.body._id;
    var specialityName = req.body.specialityName;

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
    else if(specialityName !== undefined && specialityName !== "")
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
                let fetchedSpeciality = await SpecialityService.checkSpecialityNameForDuplication(id, specialityName);

                if(fetchedSpeciality)
                {
                    resStatus = -1;
                    resMsg = 'This Speciality exists';
                }
                else
                {
                    resStatus = 1;
                }

            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Error while Fetching Speciality Name " + e;
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

exports.performSpecialityImport = async function(req,res)
{
    var specialityNameArr = req.body.specialityNameArr;
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
    else if(specialityNameArr !== undefined && specialityNameArr.length > 0 )
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

                var mappedInsSpecialityRecordsArr = [];
                var mappedInsSpecialityNameArr = [];

                resStatus = 1;
                resMsg = AppCommonService.getSavedMessage(thisModulename);      
                
                await Promise.all((specialityNameArr).map(async (specialityName, srIndex) => 
                {
                    let dialingCode;
                    if(dialingCodeArr && dialingCodeArr !== undefined)
                    {
                        dialingCode = dialingCodeArr[srIndex] && dialingCodeArr[srIndex] !== undefined ? dialingCodeArr[srIndex] : '';
                    }

                    var specialityValidityMsg = 'Success';
                    var sanSpecialityName = AppDataSanitationService.sanitizeDataTypeString(specialityName); 
                    var isValidSpecialityRecord = false;

                    if(sanSpecialityName !== '')
                    {
                        let id;
                        let fetchedSpeciality = await SpecialityService.checkSpecialityNameForDuplication('', sanSpecialityName);
                        if(fetchedSpeciality === null)
                        {
                            if(mappedInsSpecialityNameArr.indexOf(sanSpecialityName) < 0)
                            {
                                isValidSpecialityRecord = true;
                                mappedInsSpecialityNameArr.push(sanSpecialityName);
                            }
                        } 
                    }

                    if(isValidSpecialityRecord === false)
                    {
                        specialityValidityMsg = 'This Speciality name already exists';
                    }
                    
                    if(isValidSpecialityRecord === true)
                    {
                        var insSpeciality = {
                            specialityName: specialityName,
                            description: description,
                            dialingCode : dialingCode,
                            updatedBy: systemUserId,
                            createdBy: systemUserId,
                            isDeleted: 0,
                            isActive: 1
                        };

                        mappedInsSpecialityRecordsArr.push({
                            srIndex: srIndex, 
                            insSpeciality: insSpeciality
                        });

                    }
                    else
                    {
                        resStatus = -1;
                    }

                    importValidityStatusArr[srIndex] = isValidSpecialityRecord;
                    importValidityStatusMsgArr[srIndex] = specialityValidityMsg;

                }));


                if(resStatus === 1)
                {

                    let tempMappedInsSpecialityRecordsArr = mappedInsSpecialityRecordsArr;

                    if(tempMappedInsSpecialityRecordsArr.length > 0)
                    {
                        await Promise.all((tempMappedInsSpecialityRecordsArr).map(async (mappedSpecialityRecord, recordIndex) =>
                        {
                            let isValidSpecialityRecord = true;
                            let specialityValidityMsg = 'Success';

                            let srIndex = mappedSpecialityRecord.srIndex;
                            let insSpeciality = mappedSpecialityRecord.insSpeciality;

                            let savedSpeciality = await SpecialityService.saveSpeciality(insSpeciality);

                            if(savedSpeciality)
                            {
                                let savedSpecialityId = savedSpeciality._id;
                                responseObj.id = savedSpecialityId;
                            }
                            else
                            {
                                isValidSpecialityRecord = false;
                                specialityValidityMsg = AppConfigNotif.SERVER_ERROR;
                            }
                                                
                            importValidityStatusArr[srIndex] = isValidSpecialityRecord;
                            importValidityStatusMsgArr[srIndex] = specialityValidityMsg;
                        }));
                    }

                    resMsg = 'All the speciality details were successfully imported';
                }
                else if(resStatus === -1)
                {
                    resMsg = 'Some the speciality details were invalid. So the import could not be processed.';
                }

            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Speciality Retrieval Unsuccesful " + e;
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