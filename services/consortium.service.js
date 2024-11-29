var Consortium = require('../models/consortium.model');
var ConsortiumLocationService = require('./consortiumLocation.service');
var ConsortiumUserService = require('./consortiumUser.service');
var ConsortiumPatientService = require('./consortiumPatient.service');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this

// Async function to add Consortium
exports.saveConsortium = async function(consortium)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modConsortium = null;
    if(mongodb.ObjectId.isValid(consortium.id))
    {
        try
        {
            modConsortium = await Consortium.findById(consortium.id);
        }
        catch(e){
            throw Error("Error occured while Finding the Consortium")
        }
    }

    if(!modConsortium){
        modConsortium = new Consortium();
        modConsortium.createdAt = currTs;
        modConsortium.createdBy = consortium.createdBy;
        modConsortium.consortiumUserCount = 0;
        modConsortium.consortiumLocationCount = 0;
        modConsortium.consortiumPatientCount = 0;
        modConsortium.consortiumPatientCurrentId = 0;
        modConsortium.consortiumPatientAppointmentCurrentId = 0;
        modConsortium.consortiumChatThreadCurrentId = 0;

        let genConsortiumId = await AppCommonService.generateConsortiumId();
        modConsortium.consortiumId = genConsortiumId;

    }

    modConsortium.updatedAt = currTs;
    modConsortium.updatedBy = consortium.updatedBy;

    if(consortium.consortiumName !== undefined)
    modConsortium.consortiumName = consortium.consortiumName

    if(consortium.consortiumShortCode !== undefined)
    modConsortium.consortiumShortCode = consortium.consortiumShortCode

    if(consortium.consortiumUserCount !== undefined)
    modConsortium.consortiumUserCount = consortium.consortiumUserCount

    if(consortium.consortiumLocationCount !== undefined)
    modConsortium.consortiumLocationCount = consortium.consortiumLocationCount

    if(consortium.consortiumPatientCount !== undefined)
    modConsortium.consortiumPatientCount = consortium.consortiumPatientCount

    if(consortium.consortiumPatientCurrentId !== undefined)
    modConsortium.consortiumPatientCurrentId = consortium.consortiumPatientCurrentId

    if(consortium.consortiumPatientAppointmentCurrentId !== undefined)
    modConsortium.consortiumPatientAppointmentCurrentId = consortium.consortiumPatientAppointmentCurrentId

    if(consortium.consortiumChatThreadCurrentId !== undefined)
    modConsortium.consortiumChatThreadCurrentId = consortium.consortiumChatThreadCurrentId
    
    if(consortium.appLastAccessedAt !== undefined)
    modConsortium.appLastAccessedAt = consortium.appLastAccessedAt

    if(consortium.description !== undefined)
    modConsortium.description = consortium.description

    if(consortium.consortiumJobTypes !== undefined)
    modConsortium.consortiumJobTypes = consortium.consortiumJobTypes

    if(consortium.isActive !== undefined)
    modConsortium.isActive = consortium.isActive

    if(consortium.isDeleted !== undefined)
    modConsortium.isDeleted = consortium.isDeleted


    try{
        var savedConsortium = await modConsortium.save()
        if(savedConsortium)
        {
            await exports.recalculateConsortiumCount(savedConsortium._id);
        }
        return savedConsortium;
    }catch(e){
        throw Error("And Error occured while updating the Consortium "+ e);
    }
}

// Async function to get the Consortiums List
exports.getConsortiums = async function(req)
{
    var filKeyword =  req.body.filKeyword;
    var filCreatedBy = req.body.filCreatedBy;
    var filUpdatedBy = req.body.filUpdatedBy;
    var filConsortiumJobType = req.body.filConsortiumJobType;
   
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
        },
        {
            path : 'consortiumJobTypes',
        }
    ];

    const consortiumPrefix = AppCommonService.getConsortiumPrefixText(req);

    const projectObj = {
        '_id': '$_id',
        'consortiumIdInt': '$consortiumId',
        'consortiumId': { '$concat': [ consortiumPrefix, { $substr: ["$consortiumId", 0, -1 ] } ] },
        'consortiumName': '$consortiumName',
        'consortiumNameI': { '$toLower': '$consortiumName' },
        'description': '$description',
        'consortiumShortCode': '$consortiumShortCode',
        'consortiumUserCount': '$consortiumUserCount',
        'consortiumLocationCount': '$consortiumLocationCount',
        'consortiumPatientCount': '$consortiumPatientCount',
        'consortiumPatientCurrentId': '$consortiumPatientCurrentId',
        'consortiumPatientAppointmentCurrentId': '$consortiumPatientAppointmentCurrentId',
        'consortiumChatThreadCurrentId': '$consortiumChatThreadCurrentId',
        'appLastAccessedAt': '$appLastAccessedAt',
        'consortiumJobTypes': '$consortiumJobTypes',
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

    
    if(mongodb.ObjectId.isValid(filConsortiumJobType)) {
        fetchOptions.consortiumJobTypes = {'$in' : [new mongoose.Types.ObjectId(filConsortiumJobType)]};
    }
    
    if(filKeyword && filKeyword !== undefined && filKeyword !== '')
    {
        searchStr = filKeyword;
    }

    if(searchStr && searchStr !== "")
    {
        var regex = new RegExp(searchStr, "i");

        let searchKeywordOptions = [];
        searchKeywordOptions.push({ 'consortiumName' : regex });

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
                consortiumIdInt: sortOrderInt
            };
        }
        else if(sortByCol == 'col2') {
            sortOptions = {
                consortiumNameI: sortOrderInt
            };
        }
        else if(sortByCol == 'col3') {
            sortOptions = {
                consortiumShortCode: sortOrderInt
            };
        }
        else if(sortByCol == 'col4') {
            sortOptions = {
                consortiumLocationCount: sortOrderInt
            };
        }
        else if(sortByCol == 'col5') {
            sortOptions = {
                consortiumUserCount: sortOrderInt
            };
        }
        else if(sortByCol == 'col6') {
            sortOptions = {
                createdAt: sortOrderInt
            };
        }
        else if(sortByCol == 'col7') {
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
            consortiumIdInt: sortOrderInt
        };
    }

    try 
    {
        let consortiums;
        if(forExport === true)
        {
            consortiums = await Consortium.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            consortiums = await Consortium.aggregate([
                        
                            {
                                $match: fetchOptions // For Fetch
                            }
                    ])
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        consortiums = await Consortium.populate(consortiums, populateOptions);

        let recordCntData =  await Consortium.aggregate([
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
            results: consortiums,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;

    } 
    catch (e) 
    {
        throw Error('Error while Paginating Consortium ' + e)
    }
}

exports.getConsortiumsForSelect = async function(onlyActiveStatus, ){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$consortiumName',
        'textI': { '$toLower': '$consortiumName' }
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
        var consortium = await Consortium.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            consortium.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return consortium;
    } catch (e) {
        throw Error('Error while Paginating Consortium ' + e)
    }
}

exports.checkConsortiumShortCodeForDuplication = async function(id, consortiumShortCode) {
    var options = {
        consortiumShortCode : new RegExp(`^${consortiumShortCode}$`, 'i'),
        isDeleted: 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }


    try {
        var consortium = await Consortium.findOne(options);
        return consortium;
    } catch (e) {
        throw Error('Error while Fetching Consortium ' + e)
    }
}

exports.getConsortiumBaseObjectById = async function(consortiumId, withPopulation) {
    // Options setup for the mongoose paginate
    let populateOptions = [ ];
    if(withPopulation !== undefined && withPopulation === true)
    {
        populateOptions = [
            {
                path : 'consortiumJobTypes',
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
    }
    
    var options = {
        _id : consortiumId,
        isDeleted : 0
    };

    try {
       var consortium;
       if(mongodb.ObjectId.isValid(consortiumId))
       {
             consortium = await Consortium.findOne(options).populate(populateOptions);
       }
       return consortium;
    } catch (e) {
        throw Error('Error while Fetching Consortium' + e)
    }
}

exports.findConsortiumById = async function(req,consortiumId, withPopulation = true){
    // Options setup for the mongoose paginate
    try {
        var resConsortium;
        var consortium = await exports.getConsortiumBaseObjectById(consortiumId, withPopulation);
        if(consortium)
        {
            resConsortium = JSON.parse(JSON.stringify(consortium));
            resConsortium.consortiumId = AppCommonService.getConsortiumIdWithPrefix(consortium.consortiumId);
        }
       return resConsortium;
    } catch (e) {
        throw Error('Error while Fetching Consortium' + e)
    }
}


exports.getCurrentHighestConsortiumId = async function(){

	let selectArr = [ 'consortiumId' ];

    let sortOptions = {
    	consortiumId: -1
	};

    var options = {
        isDeleted : 0,
    };

    try {
        let highestConsortiumId = 0;
        var consortium = await Consortium.findOne(options).sort(sortOptions).select(selectArr);
        if(consortium) {
          highestConsortiumId = consortium.consortiumId;
        }
      return highestConsortiumId;
    } catch (e) {
        throw Error('Error while Fetching consortium' + e)
    }
}


exports.recalculateConsortiumCount = async function(consortiumId) {
    var options = {
        _id : consortiumId
    };

    try {
       var consortium;
       if(mongodb.ObjectId.isValid(consortiumId))
       {
             consortium = await Consortium.findOne(options);
       }

       if(consortium)
       {
            var consortiumLocationCount = await ConsortiumLocationService.getConsortiumLocationCountByConsortiumId(consortium._id);
            var consortiumUserCount = await ConsortiumUserService.getConsortiumUserCountByConsortiumId(consortium._id);
            var consortiumPatientCount = await ConsortiumPatientService.getConsortiumPatientCountByConsortiumId(consortium._id);
            
            
            consortium.consortiumLocationCount = consortiumLocationCount;
            consortium.consortiumUserCount = consortiumUserCount;
            consortium.consortiumPatientCount = consortiumPatientCount;
            await consortium.save();
       }
      
    } catch (e) {
        throw Error('Error while Fetching Consortium' + e)
    }
}

exports.findConsortiumByCode = async function(consortiumShortCode,withPopulation = false) {
    let populateOptions = [ ];
    if(withPopulation !== undefined && withPopulation === true)
    {
        populateOptions = [
            {
                path : 'consortiumJobTypes',
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
    }

    var options = {
        consortiumShortCode : consortiumShortCode,
        isDeleted: 0
    };

    try {
        var consortium = await Consortium.findOne(options).populate(populateOptions);
        return consortium;
    } catch (e) {
        throw Error('Error while Fetching Consortium ' + e)
    }
}

