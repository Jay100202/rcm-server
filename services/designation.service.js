var Designation = require('../models/designation.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this

// Async function to add Designation
exports.saveDesignation = async function(designation)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modDesignation = null;
    if(mongodb.ObjectId.isValid(designation.id))
    {
        try
        {
            modDesignation = await Designation.findById(designation.id);
        }
        catch(e){
            throw Error("Error occured while Finding the Designation")
        }
    }

    if(!modDesignation){
        modDesignation = new Designation();
        modDesignation.createdAt = currTs;
        modDesignation.createdBy = designation.createdBy;
    }

    modDesignation.updatedAt = currTs;
    modDesignation.updatedBy = designation.updatedBy;

    if(designation.designationName !== undefined)
    modDesignation.designationName = designation.designationName


    if(designation.description !== undefined)
    modDesignation.description = designation.description

    if(designation.isActive !== undefined)
    modDesignation.isActive = designation.isActive

    if(designation.isDeleted !== undefined)
    modDesignation.isDeleted = designation.isDeleted


    try{
        var savedDesignation = await modDesignation.save()
        return savedDesignation;
    }catch(e){
        throw Error("And Error occured while updating the Designation "+ e);
    }
}

// Async function to get the Designations List
exports.getDesignations = async function(req)
{
    var filKeyword =  req.body.filKeyword;
    var filCreatedBy = req.body.filCreatedBy;
    var filUpdatedBy = req.body.filUpdatedBy;
   
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
        'designationName': '$designationName',
        'designationNameI': { '$toLower': '$designationName' },
        'description': '$description',
        'isActive': '$isActive',
        'createdAt': '$createdAt',
        'updatedAt': '$updatedAt',
        'createdBy': '$createdBy',
        'updatedBy': '$updatedBy'
    };

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
 
   

    if(mongodb.ObjectId.isValid(filCreatedBy)) {
        fetchOptions['createdBy'] = new mongoose.Types.ObjectId(filCreatedBy);
    }

    if(filUpdatedBy != undefined && filUpdatedBy != null)
    {
        if(mongodb.ObjectId.isValid(filUpdatedBy)) {
            fetchOptions.updatedBy = new mongoose.Types.ObjectId(filUpdatedBy);
        }
    }
    
    if(filKeyword && filKeyword !== undefined && filKeyword !== '')
    {
        searchStr = filKeyword;
    }

    if(searchStr && searchStr !== "")
    {
        var regex = new RegExp(searchStr, "i");

        let searchKeywordOptions = [];
        searchKeywordOptions.push({ 'designationName' : regex });

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
                designationNameI: sortOrderInt
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
            designationNameI: sortOrderInt
        };
    }

    try 
    {
        let designations;
        if(forExport === true)
        {
            designations = await Designation.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            designations = await Designation.aggregate([
                        
                            {
                                $match: fetchOptions // For Fetch
                            }
                    ])
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        designations = await Designation.populate(designations, populateOptions);

        let recordCntData =  await Designation.aggregate([
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
            results: designations,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;

    } 
    catch (e) 
    {
        throw Error('Error while Paginating Designation ' + e)
    }
}

exports.getDesignationsForSelect = async function(onlyActiveStatus){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$designationName',
        'textI': { '$toLower': '$designationName' }
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
        var designation = await Designation.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            designation.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return designation;
    } catch (e) {
        throw Error('Error while Paginating Designation ' + e)
    }
}

exports.checkDesignationNameForDuplication = async function(id, designationName) {
    var options = {
        designationName : new RegExp(`^${designationName}$`, 'i'),
        isDeleted: 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }


    try {
        var designation = await Designation.findOne(options);
        return designation;
    } catch (e) {
        throw Error('Error while Fetching Designation ' + e)
    }
}


exports.findDesignationById = async function(req, designationId){
    
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
    
     var options = {
         _id : designationId,
         isDeleted : 0
     };
 
     try {
        var designation;
        if(mongodb.ObjectId.isValid(designationId))
        {
            designation = await Designation.findOne(options).populate(populateOptions);
        }
        return designation;
     } catch (e) {
         throw Error('Error while Fetching Designation' + e)
     }
}


