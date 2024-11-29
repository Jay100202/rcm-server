var ConsortiumUserModuleCategory = require('../models/consortiumUserModuleCategory.model');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongoose = require('mongoose');
var mongodb = require("mongodb");
var moment = require("moment");

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the consortiumUserModuleCategory List
exports.getConsortiumUserModuleCategories = async function(req)
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
        let consortiumUserModuleCategories;
        if(forExport === true)
        {
            consortiumUserModuleCategories = await ConsortiumUserModuleCategory.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            consortiumUserModuleCategories = await ConsortiumUserModuleCategory.aggregate([
                            {
                                $match: fetchOptions // For Fetch
                            }
                    ])
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        consortiumUserModuleCategories = await ConsortiumUserModuleCategory.populate(consortiumUserModuleCategories, populateOptions);

        let recordCntData =  await ConsortiumUserModuleCategory.aggregate([
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
            results: consortiumUserModuleCategories,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;
    } 
    catch (e) 
    {
        throw Error('Error while Paginating ConsortiumUserModuleCategory ' + e)
    }
}

// Async function to add ConsortiumUserModuleCategory
exports.saveConsortiumUserModuleCategory = async function(consortiumUserModuleCategory)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modConsortiumUserModuleCategory = null;
    if(mongodb.ObjectId.isValid(consortiumUserModuleCategory.id))
    {
        try
        {
            modConsortiumUserModuleCategory = await ConsortiumUserModuleCategory.findById(consortiumUserModuleCategory.id);
        }
        catch(e){
            throw Error("Error occured while Finding the ConsortiumUserModuleCategory : " + e);
        }
    }

    var isAdd = false;

    if(!modConsortiumUserModuleCategory){
        modConsortiumUserModuleCategory = new ConsortiumUserModuleCategory();
        modConsortiumUserModuleCategory.createdAt = currTs;

        if(consortiumUserModuleCategory.createdBy !== undefined)
        modConsortiumUserModuleCategory.createdBy = consortiumUserModuleCategory.createdBy;

        isAdd = true;
    }

    modConsortiumUserModuleCategory.updatedAt = currTs;

    if(consortiumUserModuleCategory.updatedBy !== undefined)
    modConsortiumUserModuleCategory.updatedBy = consortiumUserModuleCategory.updatedBy;

    if(consortiumUserModuleCategory.categoryName !== undefined)
    modConsortiumUserModuleCategory.categoryName = consortiumUserModuleCategory.categoryName;


    if(consortiumUserModuleCategory.isActive !== undefined)
    modConsortiumUserModuleCategory.isActive = consortiumUserModuleCategory.isActive;

    if(consortiumUserModuleCategory.isDeleted !== undefined)
    modConsortiumUserModuleCategory.isDeleted = consortiumUserModuleCategory.isDeleted;

    try{
        var savedConsortiumUserModuleCategory = await modConsortiumUserModuleCategory.save();
        var respConsortiumUserModuleCategory;
        if(savedConsortiumUserModuleCategory)
        {
            respConsortiumUserModuleCategory = JSON.parse(JSON.stringify(savedConsortiumUserModuleCategory));
            respConsortiumUserModuleCategory.isAdd = isAdd;
        }
        return respConsortiumUserModuleCategory;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumUserModuleCategory "+ e);
    }
}

exports.getConsortiumUserModuleCategoryBaseObjectById = async function(consortiumUserModuleCategoryId, withPopulation) {
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
        _id : consortiumUserModuleCategoryId,
        isDeleted : 0
    };

    try {
       var consortiumUserModuleCategory;
       if(mongodb.ObjectId.isValid(consortiumUserModuleCategoryId))
       {
           var consortiumUserModuleCategory = await ConsortiumUserModuleCategory.findOne(options).populate(populateOptions);
       }
       return consortiumUserModuleCategory;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUserModuleCategory' + e)
    }
}

exports.findConsortiumUserModuleCategoryById = async function(consortiumUserModuleCategoryId, withPopulation){
    // Options setup for the mongoose paginate
    try {
        var resConsortiumUserModuleCategory;
        var consortiumUserModuleCategory = await exports.getConsortiumUserModuleCategoryBaseObjectById(consortiumUserModuleCategoryId, withPopulation);
        if(consortiumUserModuleCategory)
        {
            resConsortiumUserModuleCategory = JSON.parse(JSON.stringify(consortiumUserModuleCategory));
        }
       return resConsortiumUserModuleCategory;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUserModuleCategory' + e)
    }
}

exports.getConsortiumUserModuleCategoriesForSelect = async function(req) {

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
        var consortiumUserModuleCategory = await ConsortiumUserModuleCategory.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
         consortiumUserModuleCategory.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return consortiumUserModuleCategory;
    } catch (e) {
        throw Error('Error while Paginating consortiumUserModuleCategories ' + e)
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
        var consortiumUserModuleCategory = await ConsortiumUserModuleCategory.findOne(options);
        return consortiumUserModuleCategory;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUserModuleCategory ' + e)
    }
}

exports.checkIfConsortiumUserModuleCategoryUsesConsortiumUser = async function(id) {
    var options = {
        isDeleted: 0,
        $or: [ { createdBy: id }, { updatedBy: id } ]
    };

    try {
        var consortiumUserModuleCategory = await ConsortiumUserModuleCategory.findOne(options);
        return consortiumUserModuleCategory;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUserModuleCategory ' + e)
    }
}
