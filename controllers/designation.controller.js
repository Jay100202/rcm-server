var DesignationService = require('../services/designation.service')
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
var thisModule = AppConfigModule.MOD_DESIGNATION;
var thisModulename = AppConfigModuleName.MOD_DESIGNATION;

exports.saveDesignation = async function(req,res)
{
    var designationId = req.body.id;
    var designationName = req.body.designationName;
    var description = req.body.description;
  

    if(!designationId)
    designationId = '';

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
    else if(designationName !== undefined && designationName !== "")
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((designationId == "" && !hasAddRights) || (designationId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var designation = {
                    designationName: designationName,
                    description: description,
                    updatedBy : systemUserId
                };
                

                if(designationId == "")
                {
                    designation.createdBy = systemUserId;
                    designation.isDeleted = 0;
                }
                else
                {
                    designation.id = designationId;
                }

                let savedDesignation = await DesignationService.saveDesignation(designation);

                if(savedDesignation)
                {
                    responseObj.savedDesignationId = savedDesignation._id;
                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);      
                }else{
                    resStatus = -1;
                }
            
                      
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Designation Retrieval Unsuccesful " + e;
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

exports.getDesignationDetails = async function(req, res, next) {
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

                var fetchedDesignation = await DesignationService.findDesignationById(req, id);
                if(fetchedDesignation)
                {
                    resStatus = 1;
                    responseObj.designation = fetchedDesignation;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Designation Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Designation Retrieval Unsuccesful " + e;
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

exports.getDesignations = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let designationData = [];

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

                let designationsList = await DesignationService.getDesignations(req);

                resStatus = 1;
                if(designationsList != null)
                {
                    designationData = designationsList.results;
                    totalRecords = designationsList.totalRecords;
                    filteredRecords = designationsList.filteredRecords;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "DesignationsList could not be fetched" + e;
            }
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = designationData;

    return res.status(httpStatus).json(responseObj)
}

exports.selectDesignationList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 1;
    var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;

    let totalRecords = 0;
    let designationData = [];

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

            let designationList = await DesignationService.getDesignationsForSelect(onlyActiveStatus);

            resStatus = 1;
            if(designationList != null)
            {
                totalRecords = designationList.length;
                designationData = designationList;

                if(forFilter) {
                    let designationObj = {};
                    designationObj.id = "";
                    designationObj.text = "All Designations";
  
                    designationData.unshift(designationObj);
                  }
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Designations could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = designationData;

    return res.status(httpStatus).json(responseObj)
}

exports.changeDesignationStatus = async function(req, res, next)
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

               
                var designation = {
                    id,
                    isActive: isActive,
                    updatedBy: systemUserId
                }

                let savedDesignation = await DesignationService.saveDesignation(designation);

                resStatus = 1;
                resMsg = AppCommonService.getStatusChangedMessage();            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Designation Status Change Unsuccesful" + e;
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

exports.checkDesignationNameValidity = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var designationName = req.body.designationName;
    var id = req.body._id;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(designationName !== undefined && designationName != "")
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            let designation = await DesignationService.checkDesignationNameForDuplication(id, designationName);
            if(designation)
            {
                resStatus = -1;
                resMsg = 'Designation with the designation Name already exists';
            }
            else
            {
                resStatus = 1;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Designation could not be fetched" + e;
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

                let systemUser = await SystemUserService.checkIfSystemUserUsesDesignation(id);
                if(systemUser)
                {
                    resStatus = -1;
                    resMsg = 'This Designation is associated with super user';
                }
                else
                {
                    resStatus = 1;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Designation Status Change Unsuccesful" + e;
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

exports.removeDesignation = async function(req, res, next){

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
                       
                        var designation = {
                            id,
                            isDeleted: 1,
                            updatedBy: systemUserId
                        }

                        let savedDesignation = await DesignationService.saveDesignation(designation);

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
                resMsg = "Designation Deletion Unsuccesful" + e;
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

exports.performDesignationImport = async function(req,res)
{
    var designationNameArr = req.body.designationNameArr;

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
    else if(designationNameArr !== undefined && designationNameArr.length > 0 )
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

                var importValidityStatusArr = [];
                var importValidityStatusMsgArr = [];

                var mappedInsDesignationRecordsArr = [];
                var mappedInsDesignationNameArr = [];

                resStatus = 1;
                resMsg = AppCommonService.getSavedMessage(thisModulename);      
                
                await Promise.all((designationNameArr).map(async (designationName, srIndex) => 
                {
                    var designationValidityMsg = 'Success';
                    var sanDesignationName = AppDataSanitationService.sanitizeDataTypeString(designationName); 
                    var isValidDesignationRecord = false;

                    if(sanDesignationName !== '')
                    {
                        let id;
                        let fetchedDesignation = await DesignationService.checkDesignationNameForDuplication('', sanDesignationName);
                        if(fetchedDesignation === null)
                        {
                            if(mappedInsDesignationNameArr.indexOf(sanDesignationName) < 0)
                            {
                                isValidDesignationRecord = true;
                                mappedInsDesignationNameArr.push(sanDesignationName);
                            }
                        } 
                    }

                    if(isValidDesignationRecord === false)
                    {
                        designationValidityMsg = 'This Designation name already exists';
                    }
                    
                    if(isValidDesignationRecord === true)
                    {
                        var insDesignation = {
                            designationName: designationName,
                            description: description,
                            updatedBy: systemUserId,
                            createdBy: systemUserId,
                            isDeleted: 0,
                            isActive: 1
                        };

                        mappedInsDesignationRecordsArr.push({
                            srIndex: srIndex, 
                            insDesignation: insDesignation
                        });

                    }
                    else
                    {
                        resStatus = -1;
                    }

                    importValidityStatusArr[srIndex] = isValidDesignationRecord;
                    importValidityStatusMsgArr[srIndex] = designationValidityMsg;

                }));


                let tempMappedInsDesignationRecordsArr = mappedInsDesignationRecordsArr;

                if(tempMappedInsDesignationRecordsArr.length > 0)
                {
                    await Promise.all((tempMappedInsDesignationRecordsArr).map(async (mappedDesignationRecord, recordIndex) =>
                    {
                        let isValidDesignationRecord = true;
                        let designationValidityMsg = 'Success';

                        let srIndex = mappedDesignationRecord.srIndex;
                        let insDesignation = mappedDesignationRecord.insDesignation;

                        let savedDesignation = await DesignationService.saveDesignation(insDesignation);

                        if(savedDesignation)
                        {
                            let savedDesignationId = savedDesignation._id;
                            responseObj.id = savedDesignationId;
                        }
                        else
                        {
                            isValidDesignationRecord = false;
                            designationValidityMsg = AppConfigNotif.SERVER_ERROR;
                        }
                                              
                        importValidityStatusArr[srIndex] = isValidDesignationRecord;
                        importValidityStatusMsgArr[srIndex] = designationValidityMsg;
                    }));
                }

                if(resStatus === 1)
                {
                    resMsg = 'All the designation details were successfully imported';
                }
                else if(resStatus === -1)
                {
                    resMsg = 'Some the designation details were invalid. So the import could not be processed.';
                }

            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Designation Retrieval Unsuccesful " + e;
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