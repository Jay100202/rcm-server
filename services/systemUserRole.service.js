var SystemUserRole = require('../models/systemUserRole.model');
var AppConfig = require('../appconfig');
var SystemUserRoleRight = require('../models/systemUserRoleRight.model');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the User List

exports.getRoles = async function(skipVal, limit, search, sortByCol, sortOrder, status){

    // Options setup for the mongoose paginate
    const populateOptions = {
        path : 'createdBy',
        select : 'userFullName'
    }

    const selectArr = ['_id', 'roleName', 'isActive', 'createdAt'];
    const selectStr = selectArr.join(' ');

    let sortOrderInt = 1;
    if(sortOrder == "desc")
        sortOrderInt = -1;

    const sortOptions = {}

    if(sortByCol == 'col1') {
        sortOptions.roleName = sortOrderInt;
    }
    else if(sortByCol == AppConfigConst.MAT_COLUMN_NAME_STATUS) {
        sortOptions.isActive = sortOrderInt;
    }

    const paginationOptions = {
        offset : skipVal,
        limit : limit,
        select : selectStr,
        sort : sortOptions,
        populate : populateOptions,
        lean : true,
        leanWithId : false
    }

    let fetchOptions = {};

    fetchOptions.isDeleted =  0;

    if(status == 0 || status == 1)
    {
        fetchOptions.isActive =  status;
    }

    if(search != "")
    {
        var regex = new RegExp(search, "i");
        fetchOptions.roleName = regex;
    }

    try {
        var roles = await SystemUserRole.paginate(fetchOptions, paginationOptions);
        return roles;
    } catch (e) {
        throw Error('Error while Paginating Roles ' +e)
    }
}

exports.getRolesForSelect = async function(page, limit, searchStr, onlyActiveStatus){

    const selectArr = ['_id', 'roleName'];
    const selectStr = selectArr.join(' ');

    const sortOptions = {};
    sortOptions.roleName = 1;

    const paginationOptions = {
        page : page,
        limit : limit,
        select : selectStr,
        sort : sortOptions,
        lean : true,
        leanWithId : false
    }

    let fetchOptions = {};

    fetchOptions.isDeleted =  0;

    if(onlyActiveStatus && onlyActiveStatus == 1)
    {
        fetchOptions.isActive =  1;
    }

    if(searchStr != "")
    {
        var regex = new RegExp(searchStr, "i");
        fetchOptions.roleName = regex;
    }

    try {
        var roles = await SystemUserRole.paginate(fetchOptions, paginationOptions, null);
        return roles;
    } catch (e) {
        throw Error('Error while Paginating SystemUserRole')
    }
}

exports.saveRole = async function(role)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modRole = null;
    if(role.id && role.id != "")
    {
        try
        {
            modRole = await SystemUserRole.findById(role.id);
        }
        catch(e){
            throw Error("Error occured while Finding the Module")
        }
    }

    let isAdd = false;
    if(!modRole){
        modRole = new SystemUserRole();
        modRole.createdAt = currTs;
        modRole.createdBy = role.createdBy;

        isAdd = true;
    }

    modRole.updatedAt = currTs;
    modRole.updatedBy = role.updatedBy;

    if(role.roleName !== undefined)
    modRole.roleName = role.roleName;

    if(role.isActive !== undefined)
    modRole.isActive = role.isActive;

    if(role.isDeleted !== undefined)
    modRole.isDeleted = role.isDeleted;

    try{
        var savedRole = await modRole.save();
        var respRole = JSON.parse(JSON.stringify(savedRole));
        respRole.isAdd = isAdd;
        return respRole;
    }catch(e){
        throw Error("And Error occured while updating the SystemUserRole "+ e);
    }
}

exports.findRoleById = async function(roleId){
    var options = {
        _id : roleId,
        isDeleted: 0
    }
    try {
       var role = await SystemUserRole.findOne(options)
       return role;
    } catch (e) {
        throw Error('Error while Fetching role' + e)
    }
}

exports.getRoleModuleRights = async function(roleId, moduleId){
    var options = {
        role : roleId,
        module: moduleId,
    }

    try {
       var roleRight = await SystemUserRoleRight.findOne(options)
       return roleRight;
    } catch (e) {
        throw Error('Error while Fetching role ' + e)
    }
}

exports.createRoleRight = async function(roleId, moduleId)
{
    var newRoleRight = new SystemUserRoleRight({
        role: roleId,
        module: moduleId,
        view: 0,
        viewAll: 0,
        add: 0,
        edit: 0,
        delete: 0,
        print: 0,
        download: 0,
        email: 0
    })

    try{
        // Saving the Todo
        var savedRoleRight = await newRoleRight.save()
        return savedRoleRight;
    }catch(e){

        // return a Error message describing the reason

        throw Error("Error while Creating SystemUserRole Right " + e)
    }
}

exports.checkRoleNameForDuplication = async function(id, name) {
    var options = {
        roleName : new RegExp(`^${name}$`, 'i'),
        isDeleted : 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }

    try {
        var role = await SystemUserRole.findOne(options);
        return role;
    } catch (e) {
        throw Error('Error while Fetching SystemUserRole' + e)
    }
}

exports.getAllRoleModuleRights = async function(roleId) {
    var options = {
        role : roleId
    }

    // Options setup for the mongoose paginate
    const populateOptions = {
        path : 'module',
        select : 'moduleName isDeleted',
        options : {
          sort : { 'moduleName' : 1 }
        },
        populate : [
            {
                path : 'moduleCategory',
                select : 'categoryName'
            }
        ]
    }

    const sortOptions = {};
    sortOptions.module = 1;

    try {
       var roleRights = await SystemUserRoleRight.find(options)
            .populate(populateOptions)
            .select(['moduleName', 'add', 'edit', 'delete', 'view', 'viewAll', 'email', 'download', 'print'])
            .sort(sortOptions);
       return roleRights;
    } catch (e) {
        throw Error('Error while Fetching roleRights ' + e)
    }
}

exports.addOrUpdateRoleRight = async function(rightsObj)
{
  let modRoleRights = null;
  if(rightsObj.role && rightsObj.role != "" && rightsObj.module && rightsObj.module != "")
  {
    const fetchOptions = {};
    fetchOptions.module = rightsObj.module;
    fetchOptions.role = rightsObj.role;

    try
    {
      modRoleRights = await SystemUserRoleRight.findOne(fetchOptions);
    }
    catch(e){
      throw Error("Error occured while Finding the SystemUserRole Rights")
    }

    if(!modRoleRights){
      modRoleRights = new SystemUserRoleRight();
      modRoleRights.role = rightsObj.role;
      modRoleRights.module = rightsObj.module;
    }

    if(rightsObj.add !== undefined)
    modRoleRights.add = rightsObj.add;

    if(rightsObj.view !== undefined)
    modRoleRights.view = rightsObj.view;

    if(rightsObj.viewAll !== undefined)
    modRoleRights.viewAll = rightsObj.viewAll;

    if(rightsObj.edit !== undefined)
    modRoleRights.edit = rightsObj.edit;

    if(rightsObj.delete !== undefined)
    modRoleRights.delete = rightsObj.delete;

    if(rightsObj.print !== undefined)
    modRoleRights.print = rightsObj.print;

    if(rightsObj.download !== undefined)
    modRoleRights.download = rightsObj.download;

    if(rightsObj.email !== undefined)
    modRoleRights.email = rightsObj.email;

    try{
        var savedRoleRights = await modRoleRights.save()
        return savedRoleRights;
    }catch(e){
      // return a Error message describing the reason
      throw Error("Error while Updating SystemUserRole Right " + e)
    }
  }
}

exports.getAllRoles = async function() {
  var fetchOptions = {
      isDeleted: 0
  };

  try {
      var roles = await SystemUserRole.find(fetchOptions);
      return roles;
  } catch (e) {
      throw Error('Error while Fetching Roles ' + e)
  }
}


exports.findSystemUserRoleRightForViewAllByModule = async function(moduleId){
    var options = {
        module: moduleId,
        viewAll: 1
    }
    try {
       var systemUserRoleRights = await SystemUserRoleRight.find(options)
       return systemUserRoleRights;
    } catch (e) {
        throw Error('Error while Fetching role' + e)
    }
}
