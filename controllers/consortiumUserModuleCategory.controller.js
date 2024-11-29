var ConsortiumUserModuleCategoryService = require('../services/consortiumUserModuleCategory.service')
var ConsortiumUserModuleService = require('../services/consortiumUserModule.service')
var AppCommonService = require('../services/appcommon.service')
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppConfigConst = require('../appconfig-const')
var AppConfigModuleName = require('../appconfig-module-name');
var mongodb = require("mongodb");

// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_CONSORTIUM_USER_MODULE_CATEGORY;
var thisModulename = AppConfigModuleName.MOD_CONSORTIUM_USER_MODULE_CATEGORY;

exports.saveConsortiumUserModuleCategory = async function(req,res)
{
    var consortiumUserModuleCategoryId = req.body.id;
    var categoryName = req.body.categoryName;

    if(!consortiumUserModuleCategoryId)
    consortiumUserModuleCategoryId = '';
   
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
        if((consortiumUserModuleCategoryId == "" && !hasAddRights) || (consortiumUserModuleCategoryId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try 
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var updConsortiumUserModuleCategory = {
                    categoryName: categoryName,
                    updatedBy : systemUserId
                };

                if(consortiumUserModuleCategoryId === undefined || consortiumUserModuleCategoryId === '')
                {
                    updConsortiumUserModuleCategory.createdBy = systemUserId;
                    updConsortiumUserModuleCategory.isDeleted = 0;
                    updConsortiumUserModuleCategory.isActive = 1;
                }
                else
                {
                    updConsortiumUserModuleCategory.id = consortiumUserModuleCategoryId;
                }

                let savedConsortiumUserModuleCategory = await ConsortiumUserModuleCategoryService.saveConsortiumUserModuleCategory(updConsortiumUserModuleCategory);

                if(savedConsortiumUserModuleCategory)
                {
                    let savedConsortiumUserModuleCategoryId = savedConsortiumUserModuleCategory._id;

                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);
                    responseObj.id = savedConsortiumUserModuleCategoryId;
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
                resMsg = "OrganizationUserModuleCategory Retrieval Unsuccesful " + e;
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

exports.getConsortiumUserModuleCategoryDetails = async function(req, res, next) {
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

                var fetchedConsortiumUserModuleCategory = await ConsortiumUserModuleCategoryService.findConsortiumUserModuleCategoryById(id, true);
                if(fetchedConsortiumUserModuleCategory)
                {
                    resStatus = 1;
                    responseObj.consortiumUserModuleCategory = fetchedConsortiumUserModuleCategory;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "OrganizationUserModuleCategory Retrieval Unsuccesful  ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationUserModuleCategory Retrieval Unsuccesful " + e;
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

exports.getConsortiumUserModuleCategories = async function(req,res,next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let consortiumUserModuleCategoryData = [];

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
                let consortiumUserModuleCategoryList = await ConsortiumUserModuleCategoryService.getConsortiumUserModuleCategories(req);

                resStatus = 1;
                if(consortiumUserModuleCategoryList != null)
                {
                    consortiumUserModuleCategoryData = consortiumUserModuleCategoryList.results;
                    totalRecords = consortiumUserModuleCategoryList.totalRecords;
                    filteredRecords = consortiumUserModuleCategoryList.filteredRecords;
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
                resMsg = "OrganizationUserModuleCategory could not be fetched" + e;
            }
        }

    }
       
    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = consortiumUserModuleCategoryData;

    if(skipSend === true) 
    {
      return responseObj;
    }
    else 
    {
      return res.status(httpStatus).json(responseObj);
    }
}

exports.selectConsortiumUserModuleCategoryList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var forFilter = req.body.forFilter && typeof req.body.forFilter === 'boolean' ? req.body.forFilter : false;

    let totalRecords = 0;
    let consortiumUserModuleCategoryData = [];

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

            let consortiumUserModuleCategoryList = await ConsortiumUserModuleCategoryService.getConsortiumUserModuleCategoriesForSelect(req);

            resStatus = 1;
            if(consortiumUserModuleCategoryList != null)
            {
                totalRecords = consortiumUserModuleCategoryList.length;
                consortiumUserModuleCategoryData = consortiumUserModuleCategoryList;

                if(forFilter) {
                    let systemUserObj = {};
                    systemUserObj.id = "";
                    systemUserObj.text = "All Super User Module Categories";

                    consortiumUserModuleCategoryData.unshift(systemUserObj);
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
    responseObj.results = consortiumUserModuleCategoryData;

    return res.status(httpStatus).json(responseObj)
}

exports.removeConsortiumUserModuleCategory = async function(req, res, next){
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

                    var updConsortiumUserModuleCategory = {
                        id: id,
                        isDeleted: 1,
                        updatedBy: systemUserId
                    }

                    let savedConsortiumUserModuleCategory = await ConsortiumUserModuleCategoryService.saveConsortiumUserModuleCategory(updConsortiumUserModuleCategory);
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
            resMsg = "OrganizationUserModuleCategory Deletion Unsuccesful" + e;
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

exports.changeConsortiumUserModuleCategoryStatus = async function(req, res, next)
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

                var updConsortiumUserModuleCategory = {
                    id : id,
                    isActive: isActive,
                    updatedBy: systemUserId
                }

                let savedConsortiumUserModuleCategory = await ConsortiumUserModuleCategoryService.saveConsortiumUserModuleCategory(updConsortiumUserModuleCategory);

                resStatus = 1;
                resMsg = AppCommonService.getStatusChangedMessage();
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationUserModuleCategory Status Change Unsuccesful" + e;
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
            let  fetchedConsortiumUserModule = await ConsortiumUserModuleService.checkIfConsortiumUserModuleUsesModuleCategory(id);
            if(fetchedConsortiumUserModule)
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
                let fetchedConsortiumUserModuleCategory = await ConsortiumUserModuleCategoryService.checkCategoryNameForDuplication(id, categoryName);

                if(fetchedConsortiumUserModuleCategory)
                {
                    resStatus = -1;
                    resMsg = 'This OrganizationUserModuleCategory exists';
                }
                else
                {
                    resStatus = 1;
                }

            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Error while Fetching OrganizationUserModuleCategory Name " + e;
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
