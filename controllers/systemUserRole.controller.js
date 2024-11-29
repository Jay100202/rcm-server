var SystemUserRoleService = require('../services/systemUserRole.service')
var SystemUserService = require('../services/systemUser.service')
var SystemUserModuleService = require('../services/systemUserModule.service')
var AppCommonService = require('../services/appcommon.service')
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppConfigModuleName = require('../appconfig-module-name');

// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_SYSTEM_USER_ROLE;
var thisModulename = AppConfigModuleName.MOD_SYSTEM_USER_ROLE;

exports.saveRole = async function(req,res)
{
    var roleId = req.body.id;
    var roleName = req.body.roleName;
   
    if(!roleId)
    roleId = '';

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
    else if(roleName !== undefined && roleName !== "" )
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((roleId == "" && !hasAddRights) || (roleId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var role = {
                    roleName: roleName,
                    updatedBy : systemUserId
                }

                if(roleId == "")
                {
                    role.createdBy = systemUserId;
                    role.isDeleted = 0;
                }
                else
                {
                    role.id = roleId;
                }

                let savedRole = await SystemUserRoleService.saveRole(role);
                
                if(savedRole && savedRole.isAdd === true)
                {
                    const savedRoleId = savedRole._id;
    
                    let modules = await SystemUserModuleService.getAllModules();
                    await Promise.all(modules.map(async (module) => {
                      await SystemUserRoleService.createRoleRight(savedRoleId, module._id);
                    }));
                }

                resStatus = 1;
                resMsg = AppCommonService.getSavedMessage(thisModulename);            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Role Retrieval Unsuccesful " + e;
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

exports.getRoleDetails = async function(req, res, next) {
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

                fetchedRole = await SystemUserRoleService.findRoleById(id);
    
                if(fetchedRole) {
                    responseObj.role = fetchedRole;
                    resStatus = 1;
                }else{
                    resStatus = -1;
                    resMsg = "Role Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Role Retrieval Unsuccesful " + e;
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

exports.getRoles = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};
    var roles = [];

    var isActiveStatus = req.body.isActive ? req.body.isActive*1 : -1;
    var page = req.body.page ? req.body.page*1 : 1
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
    let roleData = [];

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

                let roleList = await SystemUserRoleService.getRoles(skipVal, limit, searchStr, sortByCol, sortOrder, isActiveStatus);

                resStatus = 1;
                if(roleList != null)
                {
                    roles = roleList;

                    totalRecords = roles.total;
                    filteredRecords = roles.total;
                    roleData = roles.docs;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Roles could not be fetched" + e;
            }
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = roleData;

    return res.status(httpStatus).json(responseObj)
}

exports.selectRoleList = async function(req, res, next)
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
    let roleData = [];

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

            let roleList = await SystemUserRoleService.getRolesForSelect(page, limit, searchStr, onlyActiveStatus);

            resStatus = 1;
            if(roleList != null)
            {
                totalRecords = roleList.total;
                roles = roleList.docs;

                roles.forEach(function(role) {
                    let roleObj = {};
                    roleObj.id = role._id;
                    roleObj.text = role.roleName;

                    roleData.push(roleObj);
                });
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Roles could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = roleData;

    return res.status(httpStatus).json(responseObj)
}

exports.removeRole = async function(req, res, next){

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

                        var role = {
                            id,
                            isDeleted: 1,
                            updatedBy: systemUserId
                        }

                        let savedRole = await SystemUserRoleService.saveRole(role);

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
                resMsg = "Role Deletion Unsuccesful" + e;
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

exports.changeRoleStatus = async function(req, res, next)
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

                var role = {
                    id,
                    isActive: isActive,
                    updatedBy: systemUserId
                }

                let savedRole = await SystemUserRoleService.saveRole(role);

                resStatus = 1;
                resMsg = AppCommonService.getStatusChangedMessage();
            
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Role Status Change Unsuccesful" + e;
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

exports.roleRightDependencies = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var roleId = req.body._id ? req.body._id : "";

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(roleId && roleId != "")
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            let moduleData = [];
            const allocatedModuleIds = [];
            let moduleRights = await SystemUserRoleService.getAllRoleModuleRights(roleId);

            moduleRights.forEach(function(rights) {
                if(rights.module && rights.module.isDeleted === 0)
                {
                    let categoryName = rights.module.moduleCategory ? rights.module.moduleCategory.categoryName : '';

                    let rightObj = {};
                    rightObj.id = rights.module._id;
                    rightObj.text = rights.module.moduleName;
                    rightObj.category = categoryName;
                    rightObj.view = rights.view;
                    rightObj.viewAll = rights.viewAll;
                    rightObj.add = rights.add;
                    rightObj.edit = rights.edit;
                    rightObj.delete = rights.delete;
                    rightObj.print = rights.print;
                    rightObj.download = rights.download;
                    rightObj.email = rights.email;

                    moduleData.push(rightObj);
                    allocatedModuleIds.push(rights.module._id);
                }
            });

            let remainingModules = await SystemUserModuleService.getAllRemainingModules(allocatedModuleIds);
            remainingModules.forEach(function(indModule) {
                if(indModule)
                {
                    let categoryName = indModule.moduleCategory ? indModule.moduleCategory.categoryName : '';

                    let rightObj = {};
                    rightObj.id = indModule._id;
                    rightObj.text = indModule.moduleName;
                    rightObj.category = categoryName;
                    rightObj.view = 0;
                    rightObj.viewAll = 0;
                    rightObj.add = 0;
                    rightObj.edit = 0;
                    rightObj.delete = 0;
                    rightObj.print = 0;
                    rightObj.download = 0;
                    rightObj.email = 0;

                    moduleData.push(rightObj);
                }
            });
            
            moduleData.sort(function(a, b){
                let primValA = a.category, primValB = b.category;
                primValA = primValA.toLowerCase();
                primValB = primValB.toLowerCase();

                let secValA = a.text, secValB = b.text;
                secValA = secValA.toLowerCase();
                secValB = secValB.toLowerCase();

                let retVal = 0;
                if (primValA === primValB) {
                    if (secValA < secValB) {
                        retVal = -1;
                    }
                    else if (secValA > secValB) {
                        retVal = 1;
                    }
                }
                else if (primValA < primValB) {
                    retVal = -1;
                }
                else if (primValA > primValB) {
                    retVal = 1;
                }

                return retVal;                
            });

            responseObj.modules = moduleData;
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Roles could not be fetched" + e;
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

exports.checkRoleNameValidity = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var roleName = req.body.roleName;
    var roleId = req.body._id;

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
            let role = await SystemUserRoleService.checkRoleNameForDuplication(roleId, roleName);
            if(role)
            {
                resStatus = -1;
                resMsg = 'Role with the name already exists';
            }
            else
            {
                resStatus = 1;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Role could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj)
}

exports.saveRoleRights = async function(req, res, next) {
  var roleId = req.body._id;
  var moduleIdArr = req.body.modId;
  var moduleAddArr = req.body.moduleAdd;
  var moduleViewArr = req.body.moduleView;
  var moduleViewAllArr = req.body.moduleViewAll;
  var moduleEditArr = req.body.moduleEdit;
  var moduleDeleteArr = req.body.moduleDelete;
  var modulePrintArr = req.body.modulePrint;
  var moduleDownloadArr = req.body.moduleDownload;
  var moduleEmailArr = req.body.moduleEmail;

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
  else if(roleId && roleId != "")
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

            const role = await SystemUserRoleService.findRoleById(roleId);
            if(role) {
            resStatus = 1;

            let i = 0;
            await Promise.all(moduleIdArr.map(async (modId) => {
                const modAdd = moduleAddArr[i]*1;
                const modView = moduleViewArr[i]*1;
                const modViewAll = moduleViewAllArr[i]*1;
                const modEdit = moduleEditArr[i]*1;
                const modDelete = moduleDeleteArr[i]*1;
                const modPrint = modulePrintArr[i]*1;
                const modDownload = moduleDownloadArr[i]*1;
                const modEmail = moduleEmailArr[i]*1;

                const rightsObj = {
                add: modAdd,
                view: modView,
                viewAll: modViewAll,
                edit: modEdit,
                delete: modDelete,
                print: modPrint,
                download: modDownload,
                email: modEmail,
                module: modId,
                role: roleId
                };

                i = i + 1;

                await SystemUserRoleService.addOrUpdateRoleRight(rightsObj);
            }));
            }
            else {
            resStatus = -1;
            resMsg = AppConfigNotif.INVALID_DATA;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Role Status Change Unsuccesful" + e;
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
                await AppCommonService.setSystemUserAppAccessed(req);
                
                let roleSystemUsers = await SystemUserService.checkIfSystemUserUsesRole(id);

                if(roleSystemUsers) {
                resStatus = -1;
                resMsg = 'This Role is associated with Super User(s).';
                }
                else {
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
