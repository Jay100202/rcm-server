var ConsortiumUserType = require('../models/consortiumUserType.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this

// Async function to add ConsortiumUserType
exports.saveConsortiumUserType = async function(consortiumUserType)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modConsortiumUserType = null;
    if(mongodb.ObjectId.isValid(consortiumUserType.id))
    {
        try
        {
            modConsortiumUserType = await ConsortiumUserType.findById(consortiumUserType.id);
        }
        catch(e){
            throw Error("Error occured while Finding the ConsortiumUserType")
        }
    }

    if(!modConsortiumUserType){
        modConsortiumUserType = new ConsortiumUserType();
        modConsortiumUserType.createdAt = currTs;
        modConsortiumUserType.createdBy = consortiumUserType.createdBy;
    }

    modConsortiumUserType.updatedAt = currTs;
    modConsortiumUserType.updatedBy = consortiumUserType.updatedBy;

    if(consortiumUserType.typeText !== undefined)
    modConsortiumUserType.typeText = consortiumUserType.typeText

    if(consortiumUserType.description !== undefined)
    modConsortiumUserType.description = consortiumUserType.description

    if(consortiumUserType.isAppointmentEnabled !== undefined)
    modConsortiumUserType.isAppointmentEnabled = consortiumUserType.isAppointmentEnabled

    if(consortiumUserType.isActive !== undefined)
    modConsortiumUserType.isActive = consortiumUserType.isActive

    if(consortiumUserType.isDeleted !== undefined)
    modConsortiumUserType.isDeleted = consortiumUserType.isDeleted


    try{
        var savedConsortiumUserType = await modConsortiumUserType.save()
        return savedConsortiumUserType;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumUserType "+ e);
    }
}

// Async function to get the ConsortiumUserTypes List
exports.getConsortiumUserTypes = async function(req)
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
        'typeText': '$typeText',
        'typeTextI': { '$toLower': '$typeText' },
        'description': '$description',
        'isAppointmentEnabled': '$isAppointmentEnabled',
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
        searchKeywordOptions.push({ 'typeText' : regex });

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
                typeTextI: sortOrderInt
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
            typeTextI: sortOrderInt
        };
    }

    try 
    {
        let consortiumUserTypes;
        if(forExport === true)
        {
            consortiumUserTypes = await ConsortiumUserType.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            consortiumUserTypes = await ConsortiumUserType.aggregate([
                        
                            {
                                $match: fetchOptions // For Fetch
                            }
                    ])
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        consortiumUserTypes = await ConsortiumUserType.populate(consortiumUserTypes, populateOptions);

        let recordCntData =  await ConsortiumUserType.aggregate([
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
            results: consortiumUserTypes,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;

    } 
    catch (e) 
    {
        throw Error('Error while Paginating ConsortiumUserType ' + e)
    }
}

exports.getConsortiumUserTypesForSelect = async function(onlyActiveStatus, ){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$typeText',
        'textI': { '$toLower': '$typeText' }
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
        var consortiumUserType = await ConsortiumUserType.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            consortiumUserType.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return consortiumUserType;
    } catch (e) {
        throw Error('Error while Paginating ConsortiumUserType ' + e)
    }
}

exports.checkConsortiumUserTypeNameForDuplication = async function(id, typeText) {
    var options = {
        typeText : new RegExp(`^${typeText}$`, 'i'),
        isDeleted: 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }


    try {
        var consortiumUserType = await ConsortiumUserType.findOne(options);
        return consortiumUserType;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUserType ' + e)
    }
}


exports.findConsortiumUserTypeById = async function(req, consortiumUserTypeId){
    
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
         _id : consortiumUserTypeId,
         isDeleted : 0
     };
 
     try {
        var consortiumUserType;
        if(mongodb.ObjectId.isValid(consortiumUserTypeId))
        {
            consortiumUserType = await ConsortiumUserType.findOne(options).populate(populateOptions);
        }
        return consortiumUserType;
     } catch (e) {
         throw Error('Error while Fetching ConsortiumUserType' + e)
     }
}


exports.findConsortiumUserTypeIdArrayForAppointmentEnabled = async function(){
    
	let selectArr = [ '_id' ];

    var options = {
        isAppointmentEnabled : true,
        isDeleted : 0
    };

    try {
        var consortiumUserTypeIdArr;
        let consortiumUserTypeList = await ConsortiumUserType.find(options).select(selectArr);
        if(consortiumUserTypeList && consortiumUserTypeList.length > 0)
        {
            consortiumUserTypeIdArr = consortiumUserTypeList.map(({_id}) => _id);
        }
        return consortiumUserTypeIdArr;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUserType' + e)
    }
}

