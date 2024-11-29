var SystemUserModuleCategory = require('../models/systemUserModuleCategory.model');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongoose = require('mongoose');
var mongodb = require("mongodb");
var moment = require("moment");

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the systemUserModuleCategory List
exports.getSystemUserModuleCategories = async function(req)
{
    var filKeyword =  req.body.filKeyword;
   
    var forExport = req.body.forExport && typeof req.body.forExport === 'boolean' ? req.body.forExport : false;

    var status = req.body.isActive ? req.body.isActive*1 : -1;
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

    // Options setup for the mongoose paginate
    const populateOptions = [
        {
            path : 'createdBy',
            select : 'userFullName'
        },
        {
            path : 'updatedBy',
            select : 'userFullName'
        }
    ];

    const projectObj = {
        '_id': '$_id',
        'categoryName': '$categoryName',
        'createdAt': '$createdAt',
        'updatedAt': '$updatedAt',
        'isActive': '$isActive',
        'createdBy': '$createdBy',
        'updatedBy': '$updatedBy'
    };

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
    if(status == 0 || status == 1)
    {
        fetchOptions.isActive =  status;
    }
    
    if(filKeyword && filKeyword !== undefined && filKeyword !== '')
    {
        searchStr = filKeyword;
    }

    if(searchStr && searchStr !== "")
    {
        var regex = new RegExp(searchStr, "i");

        let searchKeywordOptions = [];
        searchKeywordOptions.push({ 'categoryName' : regex });

        let allOtherFetchOptions = [];
        Object.keys(fetchOptions).forEach(function(k){
            allOtherFetchOptions.push({ [k] :fetchOptions[k] });
        });
        allOtherFetchOptions.push({ '$or' : searchKeywordOptions });

        let complexFetchOptions = {
          '$and' : allOtherFetchOptions
        };

        fetchOptions = complexFetchOptions;
    }

    let sortOrderInt = 1;
    if(sortOrder && sortOrder === "asc") {
      sortOrderInt = 1;
    } else if(sortOrder && sortOrder === "desc") {
      sortOrderInt = -1;
    }

    let sortOptions;
    if(sortByCol && typeof sortByCol === 'string') {

        if(sortByCol == 'col1') {
            sortOptions = {
                categoryName: sortOrderInt
            };
        }
        else if(sortByCol == 'col2') {
            sortOptions = {
                createdAt: sortOrderInt
            };
        }
        else if(sortByCol == 'col3') {
            sortOptions = {
                updatedAt: sortOrderInt
            };
        }
        else if(sortByCol == AppConfigConst.MAT_COLUMN_NAME_STATUS) {
            sortOptions = {
                isActive: sortOrderInt
            };
        }
    }
    else {
        sortOptions = {
            categoryName: sortOrderInt
        };
    }

    try 
    {
        let systemUserModuleCategories;
        if(forExport === true)
        {
            systemUserModuleCategories = await SystemUserModuleCategory.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            systemUserModuleCategories = await SystemUserModuleCategory.aggregate([
                            {
                                $match: fetchOptions // For Fetch
                            }
                    ])
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        systemUserModuleCategories = await SystemUserModuleCategory.populate(systemUserModuleCategories, populateOptions);

        let recordCntData =  await SystemUserModuleCategory.aggregate([
                                                {
                                                    $match: fetchOptions
                                                },
                                                {
                                                    $group: { _id: null, count: { $sum: 1 } }
                                                }
                                            ]);

        let totalRecords = 0;

        if(recordCntData && recordCntData[0] && recordCntData[0].count) {
            totalRecords = recordCntData[0].count;
        }

        let filteredRecords = totalRecords;

        let response = {
            results: systemUserModuleCategories,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;
    } 
    catch (e) 
    {
        throw Error('Error while Paginating SystemUserModuleCategory ' + e)
    }
}

// Async function to add SystemUserModuleCategory
exports.saveSystemUserModuleCategory = async function(systemUserModuleCategory)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modSystemUserModuleCategory = null;
    if(mongodb.ObjectId.isValid(systemUserModuleCategory.id))
    {
        try
        {
            modSystemUserModuleCategory = await SystemUserModuleCategory.findById(systemUserModuleCategory.id);
        }
        catch(e){
            throw Error("Error occured while Finding the SystemUserModuleCategory : " + e);
        }
    }

    var isAdd = false;

    if(!modSystemUserModuleCategory){
        modSystemUserModuleCategory = new SystemUserModuleCategory();
        modSystemUserModuleCategory.createdAt = currTs;

        if(systemUserModuleCategory.createdBy !== undefined)
        modSystemUserModuleCategory.createdBy = systemUserModuleCategory.createdBy;

        isAdd = true;
    }

    modSystemUserModuleCategory.updatedAt = currTs;

    if(systemUserModuleCategory.updatedBy !== undefined)
    modSystemUserModuleCategory.updatedBy = systemUserModuleCategory.updatedBy;

    if(systemUserModuleCategory.categoryName !== undefined)
    modSystemUserModuleCategory.categoryName = systemUserModuleCategory.categoryName;


    if(systemUserModuleCategory.isActive !== undefined)
    modSystemUserModuleCategory.isActive = systemUserModuleCategory.isActive;

    if(systemUserModuleCategory.isDeleted !== undefined)
    modSystemUserModuleCategory.isDeleted = systemUserModuleCategory.isDeleted;

    try{
        var savedSystemUserModuleCategory = await modSystemUserModuleCategory.save();
        var respSystemUserModuleCategory;
        if(savedSystemUserModuleCategory)
        {
            respSystemUserModuleCategory = JSON.parse(JSON.stringify(savedSystemUserModuleCategory));
            respSystemUserModuleCategory.isAdd = isAdd;
        }
        return respSystemUserModuleCategory;
    }catch(e){
        throw Error("And Error occured while updating the SystemUserModuleCategory "+ e);
    }
}

exports.getSystemUserModuleCategoryBaseObjectById = async function(systemUserModuleCategoryId, withPopulation) {
    // Options setup for the mongoose paginate
    let populateOptions = [ ];
    if(withPopulation !== undefined && withPopulation === true)
    {
        populateOptions = [
            {
                path : 'createdBy',
                select : 'userFullName'
            },
            {
                path : 'updatedBy',
                select : 'userFullName'
            }
        ];
    }
    
    var options = {
        _id : systemUserModuleCategoryId,
        isDeleted : 0
    };

    try {
       var systemUserModuleCategory;
       if(mongodb.ObjectId.isValid(systemUserModuleCategoryId))
       {
           var systemUserModuleCategory = await SystemUserModuleCategory.findOne(options).populate(populateOptions);
       }
       return systemUserModuleCategory;
    } catch (e) {
        throw Error('Error while Fetching SystemUserModuleCategory' + e)
    }
}

exports.findSystemUserModuleCategoryById = async function(systemUserModuleCategoryId, withPopulation){
    // Options setup for the mongoose paginate
    try {
        var resSystemUserModuleCategory;
        var systemUserModuleCategory = await exports.getSystemUserModuleCategoryBaseObjectById(systemUserModuleCategoryId, withPopulation);
        if(systemUserModuleCategory)
        {
            resSystemUserModuleCategory = JSON.parse(JSON.stringify(systemUserModuleCategory));
        }
       return resSystemUserModuleCategory;
    } catch (e) {
        throw Error('Error while Fetching SystemUserModuleCategory' + e)
    }
}

exports.getSystemUserModuleCategoriesForSelect = async function(req) {

    var onlyActiveStatus = req && req.body && req.body.onlyActive ? req.body.onlyActive*1 : 1;

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$categoryName',
        'textI': { '$toLower': '$categoryName' },
    };

    const sortOptions = {};
    sortOptions.textI = 1;

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
    if(onlyActiveStatus && onlyActiveStatus == 1)
    {
        fetchOptions.isActive =  1;
    }

    try {
        var systemUserModuleCategory = await SystemUserModuleCategory.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
         systemUserModuleCategory.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return systemUserModuleCategory;
    } catch (e) {
        throw Error('Error while Paginating systemUserModuleCategories ' + e)
    }
}

exports.checkCategoryNameForDuplication = async function(id, categoryName) {
    var options = {
        categoryName : new RegExp(`^${categoryName}$`, 'i'),
        isDeleted: 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }

    try {
        var systemUserModuleCategory = await SystemUserModuleCategory.findOne(options);
        return systemUserModuleCategory;
    } catch (e) {
        throw Error('Error while Fetching SystemUserModuleCategory ' + e)
    }
}

exports.checkIfSystemUserModuleCategoryUsesSystemUser = async function(id) {
    var options = {
        isDeleted: 0,
        $or: [ { createdBy: id }, { updatedBy: id } ]
    };

    try {
        var systemUserModuleCategory = await SystemUserModuleCategory.findOne(options);
        return systemUserModuleCategory;
    } catch (e) {
        throw Error('Error while Fetching SystemUserModuleCategory ' + e)
    }
}
