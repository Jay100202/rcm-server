var DepartmentService = require('../services/department.service')
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
var thisModule = AppConfigModule.MOD_DEPARTMENT;
var thisModulename = AppConfigModuleName.MOD_DEPARTMENT;

exports.saveDepartment = async function(req,res)
{
    var departmentId = req.body.id;
    var departmentName = req.body.departmentName;
    var description = req.body.description;
  

    if(!departmentId)
    departmentId = '';

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
    else if(departmentName !== undefined && departmentName !== "")
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((departmentId == "" && !hasAddRights) || (departmentId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var department = {
                    departmentName: departmentName,
                    description: description,
                    updatedBy : systemUserId
                };
                

                if(departmentId == "")
                {
                    department.createdBy = systemUserId;
                    department.isDeleted = 0;
                }
                else
                {
                    department.id = departmentId;
                }

                let savedDepartment = await DepartmentService.saveDepartment(department);

                if(savedDepartment)
                {
                    responseObj.savedDepartmentId = savedDepartment._id;
                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);      
                }else{
                    resStatus = -1;
                }
            
                      
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Department Retrieval Unsuccesful " + e;
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

exports.getDepartmentDetails = async function(req, res, next) {
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

                var fetchedDepartment = await DepartmentService.findDepartmentById(req, id);
                if(fetchedDepartment)
                {
                    resStatus = 1;
                    responseObj.department = fetchedDepartment;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Department Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Department Retrieval Unsuccesful " + e;
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

exports.getDepartments = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var  httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let departmentData = [];

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

                let departmentsList = await DepartmentService.getDepartments(req);

                resStatus = 1;
                if(departmentsList != null)
                {
                    departmentData = departmentsList.results;
                    totalRecords = departmentsList.totalRecords;
                    filteredRecords = departmentsList.filteredRecords;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "DepartmentsList could not be fetched" + e;
            }
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = departmentData;

    return res.status(httpStatus).json(responseObj)
}

exports.selectDepartmentList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 1;
    var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;

    let totalRecords = 0;
    let departmentData = [];

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

            let departmentList = await DepartmentService.getDepartmentsForSelect(onlyActiveStatus);

            resStatus = 1;
            if(departmentList != null)
            {
                totalRecords = departmentList.length;
                departmentData = departmentList;

                if(forFilter) {
                    let departmentObj = {};
                    departmentObj.id = "";
                    departmentObj.text = "All Departments";
  
                    departmentData.unshift(departmentObj);
                  }
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Departments could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = departmentData;

    return res.status(httpStatus).json(responseObj)
}

exports.changeDepartmentStatus = async function(req, res, next)
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

               
                var department = {
                    id,
                    isActive: isActive,
                    updatedBy: systemUserId
                }

                let savedDepartment = await DepartmentService.saveDepartment(department);

                resStatus = 1;
                resMsg = AppCommonService.getStatusChangedMessage();            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Department Status Change Unsuccesful" + e;
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

exports.checkDepartmentNameValidity = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var departmentName = req.body.departmentName;
    var id = req.body._id;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(departmentName !== undefined && departmentName != "")
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            let department = await DepartmentService.checkDepartmentNameForDuplication(id, departmentName);
            if(department)
            {
                resStatus = -1;
                resMsg = 'Department with the department Name already exists';
            }
            else
            {
                resStatus = 1;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Department could not be fetched" + e;
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

                let systemUser = await SystemUserService.checkIfSystemUserUsesDepartment(id);
                if(systemUser)
                {
                    resStatus = -1;
                    resMsg = 'This Department is associated with super user';
                }
                else
                {
                    resStatus = 1;
                }
            
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Department Status Change Unsuccesful" + e;
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

exports.removeDepartment = async function(req, res, next){

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
                       
                        var department = {
                            id,
                            isDeleted: 1,
                            updatedBy: systemUserId
                        }

                        let savedDepartment = await DepartmentService.saveDepartment(department);

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
                resMsg = "Department Deletion Unsuccesful" + e;
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

exports.performDepartmentImport = async function(req,res)
{
    var departmentNameArr = req.body.departmentNameArr;

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
    else if(departmentNameArr !== undefined && departmentNameArr.length > 0 )
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

                var mappedInsDepartmentRecordsArr = [];
                var mappedInsDepartmentNameArr = [];

                resStatus = 1;
                resMsg = AppCommonService.getSavedMessage(thisModulename);      
                
                await Promise.all((departmentNameArr).map(async (departmentName, srIndex) => 
                {
                    var departmentValidityMsg = 'Success';
                    var sanDepartmentName = AppDataSanitationService.sanitizeDataTypeString(departmentName); 
                    var isValidDepartmentRecord = false;

                    if(sanDepartmentName !== '')
                    {
                        let id;
                        let fetchedDepartment = await DepartmentService.checkDepartmentNameForDuplication('', sanDepartmentName);
                        if(fetchedDepartment === null)
                        {
                            if(mappedInsDepartmentNameArr.indexOf(sanDepartmentName) < 0)
                            {
                                isValidDepartmentRecord = true;
                                mappedInsDepartmentNameArr.push(sanDepartmentName);
                            }
                        } 
                    }

                    if(isValidDepartmentRecord === false)
                    {
                        departmentValidityMsg = 'This Department name already exists';
                    }
                    
                    if(isValidDepartmentRecord === true)
                    {
                        var insDepartment = {
                            departmentName: departmentName,
                            description: description,
                            updatedBy: systemUserId,
                            createdBy: systemUserId,
                            isDeleted: 0,
                            isActive: 1
                        };

                        mappedInsDepartmentRecordsArr.push({
                            srIndex: srIndex, 
                            insDepartment: insDepartment
                        });

                    }
                    else
                    {
                        resStatus = -1;
                    }

                    importValidityStatusArr[srIndex] = isValidDepartmentRecord;
                    importValidityStatusMsgArr[srIndex] = departmentValidityMsg;

                }));


                let tempMappedInsDepartmentRecordsArr = mappedInsDepartmentRecordsArr;

                if(tempMappedInsDepartmentRecordsArr.length > 0)
                {
                    await Promise.all((tempMappedInsDepartmentRecordsArr).map(async (mappedDepartmentRecord, recordIndex) =>
                    {
                        let isValidDepartmentRecord = true;
                        let departmentValidityMsg = 'Success';

                        let srIndex = mappedDepartmentRecord.srIndex;
                        let insDepartment = mappedDepartmentRecord.insDepartment;

                        let savedDepartment = await DepartmentService.saveDepartment(insDepartment);

                        if(savedDepartment)
                        {
                            let savedDepartmentId = savedDepartment._id;
                            responseObj.id = savedDepartmentId;
                        }
                        else
                        {
                            isValidDepartmentRecord = false;
                            departmentValidityMsg = AppConfigNotif.SERVER_ERROR;
                        }
                                              
                        importValidityStatusArr[srIndex] = isValidDepartmentRecord;
                        importValidityStatusMsgArr[srIndex] = departmentValidityMsg;
                    }));
                }

                if(resStatus === 1)
                {
                    resMsg = 'All the department details were successfully imported';
                }
                else if(resStatus === -1)
                {
                    resMsg = 'Some the department details were invalid. So the import could not be processed.';
                }

            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Department Retrieval Unsuccesful " + e;
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