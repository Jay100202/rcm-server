var Salutation = require('../models/salutation.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this

// Async function to add Salutation
exports.saveSalutation = async function(salutation)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modSalutation = null;
    if(mongodb.ObjectId.isValid(salutation.id))
    {
        try
        {
            modSalutation = await Salutation.findById(salutation.id);
        }
        catch(e){
            throw Error("Error occured while Finding the Salutation")
        }
    }

    if(!modSalutation){
        modSalutation = new Salutation();
        modSalutation.createdAt = currTs;
        modSalutation.createdBy = salutation.createdBy;
    }

    modSalutation.updatedAt = currTs;
    modSalutation.updatedBy = salutation.updatedBy;

    if(salutation.salutationText !== undefined)
    modSalutation.salutationText = salutation.salutationText

    if(salutation.isActive !== undefined)
    modSalutation.isActive = salutation.isActive

    if(salutation.isDeleted !== undefined)
    modSalutation.isDeleted = salutation.isDeleted


    try{
        var savedSalutation = await modSalutation.save()
        return savedSalutation;
    }catch(e){
        throw Error("And Error occured while updating the Salutation "+ e);
    }
}

// Async function to get the Salutations List
exports.getSalutations = async function(req)
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
        'salutationText': '$salutationText',
        'salutationTextI': { '$toLower': '$salutationText' },
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
        searchKeywordOptions.push({ 'salutationText' : regex });

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
                salutationTextI: sortOrderInt
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
            salutationTextI: sortOrderInt
        };
    }

    try 
    {
        let salutations;
        if(forExport === true)
        {
            salutations = await Salutation.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            salutations = await Salutation.aggregate([
                        
                            {
                                $match: fetchOptions // For Fetch
                            }
                    ])
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        salutations = await Salutation.populate(salutations, populateOptions);

        let recordCntData =  await Salutation.aggregate([
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
            results: salutations,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;

    } 
    catch (e) 
    {
        throw Error('Error while Paginating Salutation ' + e)
    }
}

exports.getSalutationsForSelect = async function(onlyActiveStatus){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$salutationText',
        'textI': { '$toLower': '$salutationText' }
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
        var salutation = await Salutation.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            salutation.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return salutation;
    } catch (e) {
        throw Error('Error while Paginating Salutation ' + e)
    }
}

exports.checkSalutationTextForDuplication = async function(id, salutationText) {
    var options = {
        salutationText : new RegExp(`^${salutationText}$`, 'i'),
        isDeleted: 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }


    try {
        var salutation = await Salutation.findOne(options);
        return salutation;
    } catch (e) {
        throw Error('Error while Fetching Salutation ' + e)
    }
}


exports.findSalutationById = async function(req, salutationId){
    
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
         _id : salutationId,
         isDeleted : 0
     };
 
     try {
        var salutation;
        if(mongodb.ObjectId.isValid(salutationId))
        {
            var salutation = await Salutation.findOne(options).populate(populateOptions);
        }
        return salutation;
     } catch (e) {
         throw Error('Error while Fetching Salutation' + e)
     }
}


