var SystemUserModuleCategoryService = require('../services/systemUserModuleCategory.service')
var SystemUserModuleService = require('../services/systemUserModule.service')
var AppCommonService = require('../services/appcommon.service')
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppConfigConst = require('../appconfig-const')
var AppConfigModuleName = require('../appconfig-module-name');
var mongodb = require("mongodb");

// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_SYSTEM_USER_MODULE_CATEGORY;
var thisModulename = AppConfigModuleName.MOD_SYSTEM_USER_MODULE_CATEGORY;

exports.saveSystemUserModuleCategory = async function(req,res)
{
    var systemUserModuleCategoryId = req.body.id;
    var categoryName = req.body.categoryName;

    if(!systemUserModuleCategoryId)
    systemUserModuleCategoryId = '';
   
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
    else if(categoryName !== undefined && categoryName !== "" && categoryName.length >= 3)
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((systemUserModuleCategoryId == "" && !hasAddRights) || (systemUserModuleCategoryId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try 
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var updSystemUserModuleCategory = {
                    categoryName: categoryName,
                    updatedBy : systemUserId
                };

                if(systemUserModuleCategoryId === undefined || systemUserModuleCategoryId === '')
                {
                    updSystemUserModuleCategory.createdBy = systemUserId;
                    updSystemUserModuleCategory.isDeleted = 0;
                    updSystemUserModuleCategory.isActive = 1;
                }
                else
                {
                    updSystemUserModuleCategory.id = systemUserModuleCategoryId;
                }

                let savedSystemUserModuleCategory = await SystemUserModuleCategoryService.saveSystemUserModuleCategory(updSystemUserModuleCategory);

                if(savedSystemUserModuleCategory)
                {
                    let savedSystemUserModuleCategoryId = savedSystemUserModuleCategory._id;

                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);
                    responseObj.id = savedSystemUserModuleCategoryId;
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
                resMsg = "SystemUserModuleCategory Retrieval Unsuccesful " + e;
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

exports.getSystemUserModuleCategoryDetails = async function(req, res, next) {
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

                var fetchedSystemUserModuleCategory = await SystemUserModuleCategoryService.findSystemUserModuleCategoryById(id, true);
                if(fetchedSystemUserModuleCategory)
                {
                    resStatus = 1;
                    responseObj.systemUserModuleCategory = fetchedSystemUserModuleCategory;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "SystemUserModuleCategory Retrieval Unsuccesful  ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "SystemUserModuleCategory Retrieval Unsuccesful " + e;
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

exports.getSystemUserModuleCategories = async function(req,res,next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let systemUserModuleCategoryData = [];

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
                let systemUserModuleCategoryList = await SystemUserModuleCategoryService.getSystemUserModuleCategories(req);

                resStatus = 1;
                if(systemUserModuleCategoryList != null)
                {
                    systemUserModuleCategoryData = systemUserModuleCategoryList.results;
                    totalRecords = systemUserModuleCategoryList.totalRecords;
                    filteredRecords = systemUserModuleCategoryList.filteredRecords;
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
                resMsg = "SystemUserModuleCategory could not be fetched" + e;
            }
        }

    }
       
    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = systemUserModuleCategoryData;

    if(skipSend === true) 
    {
      return responseObj;
    }
    else 
    {
      return res.status(httpStatus).json(responseObj);
    }
}

exports.selectSystemUserModuleCategoryList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var forFilter = req.body.forFilter && typeof req.body.forFilter === 'boolean' ? req.body.forFilter : false;

    let totalRecords = 0;
    let systemUserModuleCategoryData = [];

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

            let systemUserModuleCategoryList = await SystemUserModuleCategoryService.getSystemUserModuleCategoriesForSelect(req);

            resStatus = 1;
            if(systemUserModuleCategoryList != null)
            {
                totalRecords = systemUserModuleCategoryList.length;
                systemUserModuleCategoryData = systemUserModuleCategoryList;

                if(forFilter) {
                    let systemUserObj = {};
                    systemUserObj.id = "";
                    systemUserObj.text = "All Super User Module Categories";

                    systemUserModuleCategoryData.unshift(systemUserObj);
                }

            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "User Module Categories could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = systemUserModuleCategoryData;

    return res.status(httpStatus).json(responseObj)
}

exports.removeSystemUserModuleCategory = async function(req, res, next){
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

                    var updSystemUserModuleCategory = {
                        id: id,
                        isDeleted: 1,
                        updatedBy: systemUserId
                    }

                    let savedSystemUserModuleCategory = await SystemUserModuleCategoryService.saveSystemUserModuleCategory(updSystemUserModuleCategory);
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
            resMsg = "SystemUserModuleCategory Deletion Unsuccesful" + e;
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

exports.changeSystemUserModuleCategoryStatus = async function(req, res, next)
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

                var updSystemUserModuleCategory = {
                    id : id,
                    isActive: isActive,
                    updatedBy: systemUserId
                }

                let savedSystemUserModuleCategory = await SystemUserModuleCategoryService.saveSystemUserModuleCategory(updSystemUserModuleCategory);

                resStatus = 1;
                resMsg = AppCommonService.getStatusChangedMessage();
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "SystemUserModuleCategory Status Change Unsuccesful" + e;
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
            let  fetchedSystemUserModule = await SystemUserModuleService.checkIfSystemUserModuleUsesModuleCategory(id);
            if(fetchedSystemUserModule)
            {
                resStatus = -1;
                resMsg = 'This Super User Module Category is associated with other Super User Module(s)';
            }
            else
            {
                resStatus = 1;
            }
          }
          catch(e)
          {
              resStatus = -1;
              resMsg = "User Module Categories could not be fetched" + e;
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

exports.checkCategoryNameValidity = async function(req, res, next)
{
    var id = req.body._id;
    var categoryName = req.body.categoryName;

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
    else if(categoryName !== undefined && categoryName !== "")
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
                let fetchedSystemUserModuleCategory = await SystemUserModuleCategoryService.checkCategoryNameForDuplication(id, categoryName);

                if(fetchedSystemUserModuleCategory)
                {
                    resStatus = -1;
                    resMsg = 'This SystemUserModuleCategory exists';
                }
                else
                {
                    resStatus = 1;
                }

            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Error while Fetching SystemUserModuleCategory Name " + e;
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
