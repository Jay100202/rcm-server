var ConsortiumLocation = require('../models/consortiumLocation.model');
var ConsortiumService = require('./consortium.service');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this

// Async function to add ConsortiumLocation
exports.saveConsortiumLocation = async function(consortiumLocation)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modConsortiumLocation = null;
    if(mongodb.ObjectId.isValid(consortiumLocation.id))
    {
        try
        {
            modConsortiumLocation = await ConsortiumLocation.findById(consortiumLocation.id);
        }
        catch(e){
            throw Error("Error occured while Finding the ConsortiumLocation")
        }
    }

    let isAdd = false;
    if(!modConsortiumLocation){
        modConsortiumLocation = new ConsortiumLocation();
        modConsortiumLocation.createdAt = currTs;
        modConsortiumLocation.createdBy = consortiumLocation.createdBy;

        isAdd = true;
    }

    modConsortiumLocation.updatedAt = currTs;
    modConsortiumLocation.updatedBy = consortiumLocation.updatedBy;

    if(consortiumLocation.consortium !== undefined)
    modConsortiumLocation.consortium = consortiumLocation.consortium

    if(consortiumLocation.locationName !== undefined)
    modConsortiumLocation.locationName = consortiumLocation.locationName

    if(consortiumLocation.address !== undefined)
    modConsortiumLocation.address = consortiumLocation.address

    if(consortiumLocation.phoneNumber1 !== undefined)
    modConsortiumLocation.phoneNumber1 = consortiumLocation.phoneNumber1

    if(consortiumLocation.phoneNumber2 !== undefined)
    modConsortiumLocation.phoneNumber2 = consortiumLocation.phoneNumber2

    if(consortiumLocation.phoneNumber3 !== undefined)
    modConsortiumLocation.phoneNumber3 = consortiumLocation.phoneNumber3

    if(consortiumLocation.email !== undefined)
    modConsortiumLocation.email = consortiumLocation.email

    if(consortiumLocation.websiteUrl !== undefined)
    modConsortiumLocation.websiteUrl = consortiumLocation.websiteUrl

    if(consortiumLocation.description !== undefined)
    modConsortiumLocation.description = consortiumLocation.description

    if(consortiumLocation.timeZoneOption !== undefined)
    {
        if(mongodb.ObjectId.isValid(consortiumLocation.timeZoneOption))
        {
            modConsortiumLocation.timeZoneOption = consortiumLocation.timeZoneOption
        }
        else
        {
            modConsortiumLocation.timeZoneOption = null
        }
    }
   

    if(consortiumLocation.startTime !== undefined)
    modConsortiumLocation.startTime = consortiumLocation.startTime

    if(consortiumLocation.startTimeInt !== undefined)
    modConsortiumLocation.startTimeInt = consortiumLocation.startTimeInt

    if(consortiumLocation.endTime !== undefined)
    modConsortiumLocation.endTime = consortiumLocation.endTime

    if(consortiumLocation.endTimeInt !== undefined)
    modConsortiumLocation.endTimeInt = consortiumLocation.endTimeInt


    if(consortiumLocation.isActive !== undefined)
    modConsortiumLocation.isActive = consortiumLocation.isActive

    if(consortiumLocation.isDeleted !== undefined)
    modConsortiumLocation.isDeleted = consortiumLocation.isDeleted


    try{
        var savedConsortiumLocation = await modConsortiumLocation.save();
        if(savedConsortiumLocation)
        {
            await ConsortiumService.recalculateConsortiumCount(savedConsortiumLocation.consortium);
        }
        return savedConsortiumLocation;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumLocation "+ e);
    }
}


// Async function to get the ConsortiumLocations List
exports.getConsortiumLocations = async function(req)
{
    var filKeyword =  req.body.filKeyword;
    var filCreatedBy = req.body.filCreatedBy;
    var filUpdatedBy = req.body.filUpdatedBy;
    var filConsortium =  req.body.filConsortium;
   
    var forExport = req.body.forExport && typeof req.body.forExport === 'boolean' ? req.body.forExport : false;

    var status = req.body.isActive;
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
            path : 'consortium',
            select : 'consortiumName'
        },
        {
            path : 'timeZoneOption',
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

    const projectObj = {
        '_id': '$_id',
        'locationName': '$locationName',
        'locationNameI': { '$toLower': '$locationName' },
        'consortium': '$consortium',
        'address': '$address',
        'phoneNumber1': '$phoneNumber1',
        'phoneNumber2': '$phoneNumber2',
        'phoneNumber3': '$phoneNumber3',
        'email': '$email',
        'websiteUrl': '$websiteUrl',
        'description': '$description',
        'timeZoneOption': '$timeZoneOption',
        'startTime': '$startTime',
        'startTimeInt': '$startTimeInt',
        'endTime': '$endTime',
        'endTimeInt': '$endTimeInt',
        'isActive': '$isActive',
        'createdAt': '$createdAt',
        'updatedAt': '$updatedAt',
        'createdBy': '$createdBy',
        'updatedBy': '$updatedBy'
    };

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
 
    if(status !== undefined && status !== null && status > -1)
    {
        fetchOptions.isActive =  status;
    }
   
    if(mongodb.ObjectId.isValid(filConsortium)) {
        fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
    }


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
        searchKeywordOptions.push({ 'locationName' : regex });

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
                locationNameI: sortOrderInt
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
            locationNameI: sortOrderInt
        };
    }

    try 
    {
        let consortiumLocations;
        if(forExport === true)
        {
            consortiumLocations = await ConsortiumLocation.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            consortiumLocations = await ConsortiumLocation.aggregate([
                        
                            {
                                $match: fetchOptions // For Fetch
                            }
                    ])
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        consortiumLocations = await ConsortiumLocation.populate(consortiumLocations, populateOptions);

        let recordCntData =  await ConsortiumLocation.aggregate([
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
            results: consortiumLocations,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;

    } 
    catch (e) 
    {
        throw Error('Error while Paginating ConsortiumLocation ' + e)
    }
}


exports.getConsortiumLocationsForSelect = async function(req,onlyActiveStatus){

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);

    var filConsortium =  req.body.filConsortium;
   
    // Options setup for the mongoose paginate
    const populateOptions = [
        {
            path : 'timeZoneOption',
        },
    ];

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$locationName',
        'textI': { '$toLower': '$locationName' },
        'timeZoneOption': '$timeZoneOption',
    };

    const sortOptions = {};
    sortOptions.textI = 1;

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
    if(onlyActiveStatus && onlyActiveStatus == 1)
    {
        fetchOptions.isActive =  1;
    }

    if(isConsortiumUserRequest === true)
    {
        let consortiumId = consortiumUser.consortium;
        if(mongodb.ObjectId.isValid(consortiumId)) {
            fetchOptions.consortium = new mongoose.Types.ObjectId(consortiumId);
        }
    }

    if(mongodb.ObjectId.isValid(filConsortium)) {
        fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
    }

    try {
        var consortiumLocations = await ConsortiumLocation.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
            consortiumLocations = await ConsortiumLocation.populate(consortiumLocations, populateOptions);

            consortiumLocations.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return consortiumLocations;
    } catch (e) {
        throw Error('Error while Paginating ConsortiumLocation ' + e)
    }
}

exports.checkConsortiumLocationNameForDuplication = async function(id, locationName,consortiumId) {
    var options = {
        locationName : new RegExp(`^${locationName}$`, 'i'),
        isDeleted: 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }

    if(consortiumId && consortiumId != '')
    {
        options.consortium = new mongoose.Types.ObjectId(consortiumId)
    }



    try {
        var consortiumLocation = await ConsortiumLocation.findOne(options);
        return consortiumLocation;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumLocation ' + e)
    }
}


exports.getConsortiumLocationByName = async function(locationName,consortiumId) {
    var options = {
        locationName : new RegExp(`^${locationName}$`, 'i'),
        isDeleted: 0
    };

    if(consortiumId && consortiumId != '')
    {
        options.consortium = new mongoose.Types.ObjectId(consortiumId)
    }


    try {
        var consortiumLocation = await ConsortiumLocation.findOne(options);
        return consortiumLocation;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumLocation ' + e)
    }
}


exports.findConsortiumLocationById = async function(req, consortiumLocationId){
    
     const populateOptions = [
        {
            path : 'timeZoneOption',
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
         _id : consortiumLocationId,
         isDeleted : 0
     };
 
     try {
        var consortiumLocation;
        if(mongodb.ObjectId.isValid(consortiumLocationId))
        {
            var consortiumLocation = await ConsortiumLocation.findOne(options).populate(populateOptions);
        }
        return consortiumLocation;
     } catch (e) {
         throw Error('Error while Fetching ConsortiumLocation' + e)
     }
}


exports.getConsortiumLocationCountByConsortiumId = async function(consortiumId){
    
    var options = {
        consortium : consortiumId,
        isDeleted : 0,
        isActive : 1,
    };

    try {
       var consortiumLocationCount;
       if(mongodb.ObjectId.isValid(consortiumId))
       {
           var consortiumLocationCount = await ConsortiumLocation.find(options).count();
       }
       return consortiumLocationCount;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumLocation' + e)
    }
}

exports.checkIfConsortiumLocationUsesConsortium = async function(id) {
    var options = {
        isDeleted: 0,
        consortium: id
    };

    try {
        var consortiumLocation = await ConsortiumLocation.findOne(options);
        return consortiumLocation;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumLocation ' + e)
    }
}


exports.validateConsortiumLocationSlotTime = async function(consortiumLocationId,consortiumId,startTimeInt,endTimeInt) {
    
    var options = {};

    if(startTimeInt > 0)
    {
        options.startTimeInt = { '$lte' : startTimeInt}
    }

    if(endTimeInt > 0)
    {
        options.endTimeInt = { '$gte' : endTimeInt}
    }

    if(mongodb.ObjectId.isValid(consortiumLocationId)) {
        options._id = new mongoose.Types.ObjectId(consortiumLocationId);
    }

    if(mongodb.ObjectId.isValid(consortiumId)) {
        options.consortium = new mongoose.Types.ObjectId(consortiumId);
    }

    try {
        var isValidTime = false;
        if(mongodb.ObjectId.isValid(consortiumId) && mongodb.ObjectId.isValid(consortiumLocationId))
        {
            let consortiumLocation = await ConsortiumLocation.findOne(options);
           
            if(consortiumLocation)
            {
                isValidTime = true;
            }
        }
        return isValidTime;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumLocation ' + e)
    }
}


exports.getDefaultConsortiumLocationByConsortium = async function(consortiumId) {
    var options = {
        isDeleted: 0
    };

    if(consortiumId && consortiumId != '')
    {
        options.consortium = new mongoose.Types.ObjectId(consortiumId)
    }

    let sortOptions = {
        createdAt : 1
    }

    try {
        var consortiumLocation;
        if(mongodb.ObjectId.isValid(consortiumId))
        {
            consortiumLocation = await ConsortiumLocation.findOne(options).sort(sortOptions);
        }
        return consortiumLocation;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumLocation ' + e)
    }
}
