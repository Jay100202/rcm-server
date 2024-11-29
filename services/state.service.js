var State = require('../models/state.model');
var Country = require('../models/country.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this

// Async function to add State
exports.saveState = async function(state)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modState = null;
    if(mongodb.ObjectId.isValid(state.id))
    {
        try
        {
            modState = await State.findById(state.id);
        }
        catch(e){
            throw Error("Error occured while Finding the State")
        }
    }

    if(!modState){
        modState = new State();
        modState.createdAt = currTs;
        modState.createdBy = state.createdBy;
    }

    modState.updatedAt = currTs;
    modState.updatedBy = state.updatedBy;

    if(state.stateName !== undefined)
    modState.stateName = state.stateName

    if(state.country !== undefined)
    modState.country = state.country

    if(state.description !== undefined)
    modState.description = state.description

    if(state.isActive !== undefined)
    modState.isActive = state.isActive

    if(state.isDeleted !== undefined)
    modState.isDeleted = state.isDeleted


    try{
        var savedState = await modState.save()
        return savedState;
    }catch(e){
        throw Error("And Error occured while updating the State "+ e);
    }
}

// Async function to get the States List
exports.getStates = async function(req)
{
    var filKeyword =  req.body.filKeyword;
    var filCreatedBy = req.body.filCreatedBy;
    var filUpdatedBy = req.body.filUpdatedBy;
    var filCountry =  req.body.filCountry;
   
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
            path : 'country',
            select : 'countryName'
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
        'stateName': '$stateName',
        'stateNameI': { '$toLower': '$stateName' },
        'country': '$country',
        'description': '$description',
        'isActive': '$isActive',
        'createdAt': '$createdAt',
        'updatedAt': '$updatedAt',
        'createdBy': '$createdBy',
        'updatedBy': '$updatedBy',
        'countryLP': '$countryLP',
    };

    let hasCountryLookup = false;
    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
 
    if(mongodb.ObjectId.isValid(filCountry)) {
        fetchOptions.country = new mongoose.Types.ObjectId(filCountry);
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
        searchKeywordOptions.push({ 'stateName' : regex });

        hasCountryLookup = true;
        searchKeywordOptions.push({ 'countryLP.countryName' : regex });

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
                stateNameI: sortOrderInt
            };
        }
        else if(sortByCol == 'col2') {
            hasCountryLookup = true;
            sortOptions = {
                'countryLP.countryName': sortOrderInt
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
            stateNameI: sortOrderInt
        };
    }

    const countryLookup = {
        from: Country.collection.name,
        localField: "country",
        foreignField: "_id",
        as: "countryLP"
    };

    try 
    {

        let aggregationParamArr = [];

        if(hasCountryLookup)
        {
            aggregationParamArr.push({
                $lookup: countryLookup
            });
        }

        aggregationParamArr.push({
            $match: fetchOptions
        });

        let states;
        if(forExport === true)
        {
            states = await State.aggregate(aggregationParamArr)
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            states = await State.aggregate(aggregationParamArr)
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        states = await State.populate(states, populateOptions);

        let cntAggregationParamArr = aggregationParamArr;
        
        cntAggregationParamArr.push({
            $group: { _id: null, count: { $sum: 1 } }
        });

        let recordCntData =  await State.aggregate(cntAggregationParamArr);

        let totalRecords = 0;

        if(recordCntData && recordCntData[0] && recordCntData[0].count) {
            totalRecords = recordCntData[0].count;
        }

        let filteredRecords = totalRecords;

        let response = {
            results: states,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;

    } 
    catch (e) 
    {
        throw Error('Error while Paginating State ' + e)
    }
}

exports.getStatesForSelect = async function(onlyActiveStatus, forCountry){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$stateName',
        'textI': { '$toLower': '$stateName' }
    };

    const sortOptions = {};
    sortOptions.textI = 1;

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
    if(onlyActiveStatus && onlyActiveStatus == 1)
    {
        fetchOptions.isActive =  1;
    }

    if(mongodb.ObjectId.isValid(forCountry))
    {
        fetchOptions.country = new mongoose.Types.ObjectId(forCountry);
    }

    try {
        var state = await State.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            state.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return state;
    } catch (e) {
        throw Error('Error while Paginating State ' + e)
    }
}

exports.checkStateNameForDuplication = async function(id, stateName, forCountry) {
    var options = {
        stateName : new RegExp(`^${stateName}$`, 'i'),
        isDeleted: 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }

    if(mongodb.ObjectId.isValid(forCountry))
    {
        options.country = new mongoose.Types.ObjectId(forCountry);
    }

    try {
        var state = await State.findOne(options);
        return state;
    } catch (e) {
        throw Error('Error while Fetching State ' + e)
    }
}


exports.findStateById = async function(req, stateId){
    
     const populateOptions = [
        {
            path : 'country',
            select : 'countryName'
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
         _id : stateId,
         isDeleted : 0
     };
 
     try {
        var state;
        if(mongodb.ObjectId.isValid(stateId))
        {
            state = await State.findOne(options).populate(populateOptions);
        }
        return state;
     } catch (e) {
         throw Error('Error while Fetching State' + e)
     }
}

exports.checkIfStateUsesCountry = async function(id) {
    var options = {
        isDeleted: 0,
        country: new mongoose.Types.ObjectId(id)
    };

    try {
        var state = await State.findOne(options);
        return state;
    } catch (e) {
        throw Error('Error while Fetching state ' + e)
    }
}

