var SystemUserModule = require('../models/systemUserModule.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the User List

exports.getModules = async function(skipVal, limit, search, sortBy, sortOrder, status){

    // Options setup for the mongoose paginate
    const populateOptions =  [
        {
            path : 'moduleCategory',
            select : 'categoryName'
        },
        {
            path : 'createdBy',
            select : 'userFullName'
        },
        {
            path : 'updatedBy',
            select : 'userFullName'
        }
    ];

    const selectArr = ['_id', 'moduleName', 'moduleCategory' ,'isActive', 'createdAt'];
    const selectStr = selectArr.join(' ');

    let sortOrderInt = 1;
    if(sortOrder == "desc")
        sortOrderInt = -1;

    const sortOptions = {}

    if(sortBy == 0)
        sortOptions.moduleName = sortOrderInt;

    if(sortBy == 1)
        sortOptions.isActive = sortOrderInt;

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
        fetchOptions.moduleName = regex;
    }

    try {
        var modules = await SystemUserModule.paginate(fetchOptions, paginationOptions);
        return modules;
    } catch (e) {
        throw Error('Error while Paginating Modules')
    }
}

exports.saveModule = async function(module)
{
    const currTs = await AppCommonService.getCurrentTimestamp();


    let modModule = null;
    if(module.id && module.id != "")
    {
        try
        {
            modModule = await SystemUserModule.findById(module.id);
        }
        catch(e){
            throw Error("Error occured while Finding the SystemUserModule")
        }
    }

    let isAdd = false;
    if(!modModule){
        modModule = new SystemUserModule();
        modModule.createdAt = currTs;
        modModule.createdBy = module.createdBy;

        isAdd = true;
    }

    modModule.updatedAt = currTs;
    modModule.updatedBy = module.updatedBy;

    if(module.moduleName !== undefined)
    modModule.moduleName = module.moduleName

    if(module.moduleCategory !== undefined && module.moduleCategory !== "")
    modModule.moduleCategory = module.moduleCategory

    if(module.isActive !== undefined)
    modModule.isActive = module.isActive

    if(module.isDeleted !== undefined)
    modModule.isDeleted = module.isDeleted


    try{
        var savedModule = await modModule.save();
        var respModule = JSON.parse(JSON.stringify(savedModule));
        respModule.isAdd = isAdd;
        return respModule;
    }catch(e){
        throw Error("And Error occured while updating the SystemUserModule "+ e);
    }
}

exports.getModulesForSelect = async function(page, limit, searchStr, onlyActiveStatus){

    const selectArr = ['_id', 'moduleName'];
    const selectStr = selectArr.join(' ');

    const sortOptions = {};
    sortOptions.moduleName = 1;

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
        fetchOptions.moduleName = regex;
    }

    try {
        var modules = await SystemUserModule.paginate(fetchOptions, paginationOptions, null);
        return modules;
    } catch (e) {
        throw Error('Error while Paginating SystemUserModule')
    }
}

exports.findModuleById = async function(moduleId){

     // Options setup for the mongoose paginate
     const populateOptions =  [
        {
            path : 'moduleCategory',
            select : 'categoryName'
        },
        {
            path : 'createdBy',
            select : 'userFullName'
        },
        {
            path : 'updatedBy',
            select : 'userFullName'
        }
    ];

    var options = {
        _id : moduleId,
        isDeleted : 0
    }
    try {
       var module = await SystemUserModule.findOne(options).populate(populateOptions);
       return module;
    } catch (e) {
        throw Error('Error while Fetching module' + e)
    }
}

exports.findModuleByName = async function(name){
    var options = {
        moduleName : name,
        isDeleted : 0
    }

    try {
       var module = await SystemUserModule.findOne(options)
        return module;
    } catch (e) {
        throw Error('Error while Fetching SystemUserModule ' + e)
    }
}

exports.checkModuleNameForDuplication = async function(id, name,moduleCategory) {
    var options = {
        moduleName : new RegExp(`^${name}$`, 'i'),
        isDeleted: 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }

    if(moduleCategory !== undefined && moduleCategory !== ''){
        if(mongodb.ObjectId.isValid(moduleCategory))
        {
            options.moduleCategory = new mongoose.Types.ObjectId(moduleCategory);
        }
    }

    try {
        var module = await SystemUserModule.findOne(options);
        return module;
    } catch (e) {
        throw Error('Error while Fetching SystemUserModule' + e)
    }
}

exports.getAllRemainingModules = async function(allocatedModuleIdArr) {
  
    const populateOptions =  [
        {
            path : 'moduleCategory',
            select : 'categoryName'
        },
    ];

    var fetchOptions = {
        isDeleted: 0
    };

    fetchOptions._id = { $nin : allocatedModuleIdArr };

    try {
        var modules = await SystemUserModule.find(fetchOptions).populate(populateOptions);
        return modules;
    } catch (e) {
        throw Error('Error while Fetching SystemUserModule' + e)
    }
}

exports.getAllModules = async function() {
  var fetchOptions = {
      isDeleted: 0
  };

  try {
      var modules = await SystemUserModule.find(fetchOptions);
      return modules;
  } catch (e) {
      throw Error('Error while Fetching SystemUserModule' + e)
  }
}


exports.checkIfSystemUserModuleUsesModuleCategory = async function(id) {
    var options = {
        isDeleted: 0,
        moduleCategory: id
    };

    try {
        var module = await SystemUserModule.findOne(options);
        return module;
    } catch (e) {
        throw Error('Error while Fetching UserModule' + e)
    }
}