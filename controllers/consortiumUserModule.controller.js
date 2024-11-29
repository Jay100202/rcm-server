var ConsortiumUserModuleService = require('../services/consortiumUserModule.service')
var ConsortiumUserRoleService = require('../services/consortiumUserRole.service')
var SystemUserService = require('../services/systemUser.service')
var AppCommonService = require('../services/appcommon.service')
var AppConfigModuleName = require('../appconfig-module-name');
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')

// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_CONSORTIUM_USER_MODULE;
var thisModulename = AppConfigModuleName.MOD_CONSORTIUM_USER_MODULE;

exports.saveModule = async function(req,res)
{
    var moduleId = req.body.id;
    var moduleName = req.body.moduleName;
    var moduleCategory = req.body.moduleCategory;
   
    if(!moduleId)
    moduleId = '';

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
    else if(moduleName !== undefined && moduleName !== "" )
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((moduleId == "" && !hasAddRights) || (moduleId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var module = {
                    moduleName: moduleName,
                    moduleCategory: moduleCategory,
                    updatedBy : systemUserId
                }

                if(moduleId == "")
                {
                    module.createdBy = systemUserId;
                    module.isDeleted = 0;
                }
                else
                {
                    module.id = moduleId;
                }

                let savedModule = await ConsortiumUserModuleService.saveModule(module);
                
                if(savedModule && savedModule.isAdd === true)
                {
                    const savedModuleId = savedModule._id;

                    let roles = await ConsortiumUserRoleService.getAllRoles();
                    await Promise.all(roles.map(async (role) => {
                        await ConsortiumUserRoleService.createRoleRight(role._id, savedModuleId);
                    }));
                }

                resStatus = 1;
                resMsg = AppCommonService.getSavedMessage(thisModulename);      

            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Module Retrieval Unsuccesful " + e;
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

exports.getModuleDetails = async function(req, res, next) {
    var id = req.body._id;
  
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

                fetchedModule = await ConsortiumUserModuleService.findModuleById(id);
    
                if(fetchedModule){
                    responseObj.module = fetchedModule;
                    resStatus = 1;
                }else{
                    resStatus = -1;
                    resMsg = "Module Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Module Retrieval Unsuccesful " + e;
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

exports.getModules = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};
    var modules = [];

    var isActiveStatus = req.body.isActive ? req.body.isActive*1 : -1;
    var page = req.body.page ? req.body.page*1 : 1;
    var limit = req.body.length ? req.body.length*1 : 10;
    var searchStr = req.body.searchStr ? req.body.searchStr : '';
    var sortByCol = req.body.sortBy ? req.body.sortBy : 'col1';
    var sortOrder = req.body.sortOrder ? req.body.sortOrder : 'asc';

    var skipVal = req.body.start ? req.body.start*1 : 0;

    if(page && page > 0)
    {
      skipVal = (page - 1) * limit;
    }

    let totalRecords = 0;
    let filteredRecords = 0;
    let moduleData = [];

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

                let moduleList = await ConsortiumUserModuleService.getModules(skipVal, limit, searchStr, sortByCol, sortOrder, isActiveStatus);

                resStatus = 1;
                if(moduleList != null)
                {
                    modules = moduleList;

                    totalRecords = modules.total;
                    filteredRecords = modules.total;
                    moduleData = modules.docs;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Modules could not be fetched" + e;
            }
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = moduleData;

    return res.status(httpStatus).json(responseObj)
}

exports.selectModuleList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 0;
    var page = req.body.page ? req.body.page*1 : 1
    var limit = req.body.length ? req.body.length*1 : 10;
    var searchStr = req.body.search && req.body.searchStr ? req.body.searchStr : "";

    let totalRecords = 0;
    let moduleData = [];

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

            let moduleList = await ConsortiumUserModuleService.getModulesForSelect(page, limit, searchStr, onlyActiveStatus);

            resStatus = 1;
            if(moduleList != null)
            {
                totalRecords = moduleList.total;
                modules = moduleList.docs;

                modules.forEach(function(module) {
                    let moduleObj = {};
                    moduleObj.id = module._id;
                    moduleObj.text = module.moduleName;

                    moduleData.push(moduleObj);
                });
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Modules could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = moduleData;

    return res.status(httpStatus).json(responseObj)

}

exports.removeModule = async function(req, res, next){

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

                        var module = {
                            id,
                            isDeleted: 1,
                            updatedBy: systemUserId
                        }

                        let savedModule = await ConsortiumUserModuleService.saveModule(module);

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
                resMsg = "Module Deletion Unsuccesful" + e;
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

exports.changeModuleStatus = async function(req, res, next)
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

                var module = {
                    id,
                    isActive: isActive,
                    updatedBy: systemUserId
                }

                let savedModule = await ConsortiumUserModuleService.saveModule(module);

                resStatus = 1;
                resMsg = 'Module status changed successfully';
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Module Status Change Unsuccesful" + e;
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

exports.checkModuleNameValidity = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var moduleName = req.body.moduleName;
    var moduleCategory = req.body.moduleCategory;
    var moduleId = req.body._id;

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
            let module = await ConsortiumUserModuleService.checkModuleNameForDuplication(moduleId, moduleName,moduleCategory);
            if(module)
            {
                resStatus = -1;
                resMsg = 'Module with the name already exists';
            }
            else
            {
                resStatus = 1;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Module could not be fetched" + e;
        }
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
                
                let moduleSystemUsers;// = await SystemUserService.checkIfSystemUserUsesRole(id);

                if(moduleSystemUsers) 
                {
                    resStatus = -1;
                    resMsg = 'This Role is associated with Super User(s).';
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
