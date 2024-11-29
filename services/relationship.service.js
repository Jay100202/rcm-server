var Relationship = require('../models/relationship.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this

// Async function to add Relationship
exports.saveRelationship = async function(relationship)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modRelationship = null;
    if(mongodb.ObjectId.isValid(relationship.id))
    {
        try
        {
            modRelationship = await Relationship.findById(relationship.id);
        }
        catch(e){
            throw Error("Error occured while Finding the Relationship")
        }
    }

    if(!modRelationship){
        modRelationship = new Relationship();
        modRelationship.createdAt = currTs;
        modRelationship.createdBy = relationship.createdBy;
    }

    modRelationship.updatedAt = currTs;
    modRelationship.updatedBy = relationship.updatedBy;

    if(relationship.relationshipName !== undefined)
    modRelationship.relationshipName = relationship.relationshipName

    if(relationship.isActive !== undefined)
    modRelationship.isActive = relationship.isActive

    if(relationship.isDeleted !== undefined)
    modRelationship.isDeleted = relationship.isDeleted


    try{
        var savedRelationship = await modRelationship.save()
        return savedRelationship;
    }catch(e){
        throw Error("And Error occured while updating the Relationship "+ e);
    }
}

// Async function to get the Relationships List
exports.getRelationships = async function(req)
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
        'relationshipName': '$relationshipName',
        'relationshipNameI': { '$toLower': '$relationshipName' },
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
        searchKeywordOptions.push({ 'relationshipName' : regex });

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
                relationshipNameI: sortOrderInt
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
            relationshipNameI: sortOrderInt
        };
    }

    try 
    {
        let relationships;
        if(forExport === true)
        {
            relationships = await Relationship.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            relationships = await Relationship.aggregate([
                        
                            {
                                $match: fetchOptions // For Fetch
                            }
                    ])
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        relationships = await Relationship.populate(relationships, populateOptions);

        let recordCntData =  await Relationship.aggregate([
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
            results: relationships,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;

    } 
    catch (e) 
    {
        throw Error('Error while Paginating Relationship ' + e)
    }
}

exports.getRelationshipsForSelect = async function(onlyActiveStatus, ){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$relationshipName',
        'textI': { '$toLower': '$relationshipName' }
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
        var relationship = await Relationship.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            relationship.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return relationship;
    } catch (e) {
        throw Error('Error while Paginating Relationship ' + e)
    }
}

exports.checkRelationshipNameForDuplication = async function(id, relationshipName) {
    var options = {
        relationshipName : new RegExp(`^${relationshipName}$`, 'i'),
        isDeleted: 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }


    try {
        var relationship = await Relationship.findOne(options);
        return relationship;
    } catch (e) {
        throw Error('Error while Fetching Relationship ' + e)
    }
}


exports.findRelationshipById = async function(req, relationshipId){
    
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
         _id : relationshipId,
         isDeleted : 0
     };
 
     try {
        var relationship;
        if(mongodb.ObjectId.isValid(relationshipId))
        {
            var relationship = await Relationship.findOne(options).populate(populateOptions);
        }
        return relationship;
     } catch (e) {
         throw Error('Error while Fetching Relationship' + e)
     }
}


