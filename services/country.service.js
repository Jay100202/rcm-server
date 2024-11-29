var Country = require('../models/country.model');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongoose = require('mongoose');
var mongodb = require("mongodb");
var moment = require("moment");

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the country List
exports.getCountries = async function(req)
{
    var filKeyword =  req.body.filKeyword;
    var filCreatedBy =  req.body.filCreatedBy;
    var filUpdatedBy =  req.body.filUpdatedBy;
   
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
        'countryName': '$countryName',
        'countryNameI': { '$toLower': '$countryName' },
        'description': '$description',
        'dialingCode': '$dialingCode',
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



    if(mongodb.ObjectId.isValid(filCreatedBy)) {
        fetchOptions.createdBy = new mongoose.Types.ObjectId(filCreatedBy);
    }

    if(mongodb.ObjectId.isValid(filUpdatedBy)) {
        fetchOptions.updatedBy = new mongoose.Types.ObjectId(filUpdatedBy);
    }
    
    if(filKeyword && filKeyword !== undefined && filKeyword !== '')
    {
        searchStr = filKeyword;
    }

    if(searchStr && searchStr !== "")
    {
        var regex = new RegExp(searchStr, "i");

        let searchKeywordOptions = [];
        searchKeywordOptions.push({ 'countryName' : regex });

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
                countryNameI: sortOrderInt
            };
        }
        else if(sortByCol == 'col2') {
            sortOptions = {
                dialingCode: sortOrderInt
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
            countryNameI: sortOrderInt
        };
    }

    try 
    {
        let countries;
        if(forExport === true)
        {
            countries = await Country.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            countries = await Country.aggregate([
                            {
                                $match: fetchOptions // For Fetch
                            }
                    ])
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        countries = await Country.populate(countries, populateOptions);

        let recordCntData =  await Country.aggregate([
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
            results: countries,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;
    } 
    catch (e) 
    {
        throw Error('Error while Paginating Country ' + e)
    }
}

// Async function to add Country
exports.saveCountry = async function(country)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modCountry = null;
    if(mongodb.ObjectId.isValid(country.id))
    {
        try
        {
            modCountry = await Country.findById(country.id);
        }
        catch(e){
            throw Error("Error occured while Finding the Country : " + e);
        }
    }

    var isAdd = false;

    if(!modCountry){
        modCountry = new Country();
        modCountry.createdAt = currTs;

        if(country.createdBy !== undefined)
        modCountry.createdBy = country.createdBy;

        isAdd = true;
    }

    modCountry.updatedAt = currTs;

    if(country.updatedBy !== undefined)
    modCountry.updatedBy = country.updatedBy;

    if(country.countryName !== undefined)
    modCountry.countryName = country.countryName;

    if(country.description !== undefined)
    modCountry.description = country.description;

    if(country.dialingCode !== undefined)
    modCountry.dialingCode = country.dialingCode;
    
    if(country.isActive !== undefined)
    modCountry.isActive = country.isActive;

    if(country.isDeleted !== undefined)
    modCountry.isDeleted = country.isDeleted;

    try{
        var savedCountry = await modCountry.save();
        var respCountry;
        if(savedCountry)
        {
            respCountry = JSON.parse(JSON.stringify(savedCountry));
            respCountry.isAdd = isAdd;
        }
        return respCountry;
    }catch(e){
        throw Error("And Error occured while updating the Country "+ e);
    }
}

exports.getCountryBaseObjectById = async function(countryId, withPopulation) {
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
        _id : countryId,
        isDeleted : 0
    };

    try {
       var country;
       if(mongodb.ObjectId.isValid(countryId))
       {
            country = await Country.findOne(options).populate(populateOptions);
       }
       return country;
    } catch (e) {
        throw Error('Error while Fetching Country' + e)
    }
}

exports.findCountryById = async function(countryId, withPopulation){
    // Options setup for the mongoose paginate
    try {
        var resCountry;
        var country = await exports.getCountryBaseObjectById(countryId, withPopulation);
        if(country)
        {
            resCountry = JSON.parse(JSON.stringify(country));
        }
       return resCountry;
    } catch (e) {
        throw Error('Error while Fetching Country' + e)
    }
}

exports.getCountriesForSelect = async function(req) {

    var onlyActiveStatus = req && req.body && req.body.onlyActive ? req.body.onlyActive*1 : 1;

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$countryName',
        'textI': { '$toLower': '$countryName' },
        'shortCode' : '$shortCode'
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
        var country = await Country.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
         country.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return country;
    } catch (e) {
        throw Error('Error while Paginating countries ' + e)
    }
}

exports.checkCountryNameForDuplication = async function(id, countryName) {
    var options = {
        countryName : new RegExp(`^${countryName}$`, 'i'),
        isDeleted: 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }

    try {
        var country = await Country.findOne(options);
        return country;
    } catch (e) {
        throw Error('Error while Fetching Country ' + e)
    }
}

exports.checkIfCountryUsesSystemUser = async function(id) {
    var options = {
        isDeleted: 0,
        $or: [ { createdBy: id }, { updatedBy: id } ]
    };

    try {
        var country = await Country.findOne(options);
        return country;
    } catch (e) {
        throw Error('Error while Fetching Country ' + e)
    }
}
