var City = require('../models/city.model');
var State = require('../models/state.model');
var Country = require('../models/country.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this

// Async function to add City
exports.saveCity = async function(city)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modCity = null;
    if(mongodb.ObjectId.isValid(city.id))
    {
        try
        {
            modCity = await City.findById(city.id);
        }
        catch(e){
            throw Error("Error occured while Finding the City")
        }
    }

    if(!modCity){
        modCity = new City();
        modCity.createdAt = currTs;
        modCity.createdBy = city.createdBy;
    }

    modCity.updatedAt = currTs;
    modCity.updatedBy = city.updatedBy;

    if(city.cityName !== undefined)
    modCity.cityName = city.cityName

    if(city.state !== undefined)
    modCity.state = city.state

    if(city.country !== undefined)
    modCity.country = city.country

    if(city.description !== undefined)
    modCity.description = city.description

    if(city.isActive !== undefined)
    modCity.isActive = city.isActive

    if(city.isDeleted !== undefined)
    modCity.isDeleted = city.isDeleted


    try{
        var savedCity = await modCity.save()
        return savedCity;
    }catch(e){
        throw Error("And Error occured while updating the City "+ e);
    }
}

// Async function to get the Cities List
exports.getCities = async function(req)
{
    var filKeyword =  req.body.filKeyword;
    var filCreatedBy = req.body.filCreatedBy;
    var filUpdatedBy = req.body.filUpdatedBy;
    var filState =  req.body.filState;
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
            path : 'state',
            select : 'stateName'
        },
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
        'cityName': '$cityName',
        'cityNameI': { '$toLower': '$cityName' },
        'state': '$state',
        'country': '$country',
        'description': '$description',
        'isActive': '$isActive',
        'createdAt': '$createdAt',
        'updatedAt': '$updatedAt',
        'createdBy': '$createdBy',
        'updatedBy': '$updatedBy',
        'stateLP': '$stateLP',
        'countryLP': '$countryLP',
    };

    let hasCountryLookup = false;
    let hasStateLookup = false;
    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
 
    if(status == 0 || status == 1)
    {
        fetchOptions.isActive =  status;
    }

    if(mongodb.ObjectId.isValid(filCountry)) {
        fetchOptions.country = new mongoose.Types.ObjectId(filCountry);
    }
   
    if(mongodb.ObjectId.isValid(filState)) {
        fetchOptions.state = new mongoose.Types.ObjectId(filState);
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
        searchKeywordOptions.push({ 'cityName' : regex });

        hasCountryLookup = true;
        searchKeywordOptions.push({ 'countryLP.countryName' : regex });

        hasStateLookup = true;
        searchKeywordOptions.push({ 'stateLP.stateName' : regex });

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
                cityNameI: sortOrderInt
            };
        }
        else if(sortByCol == 'col2') {
            hasStateLookup = true;
            sortOptions = {
                'stateLP.stateName': sortOrderInt
            };
        }
        else if(sortByCol == 'col3') {
            hasCountryLookup = true;
            sortOptions = {
                'countryLP.countryName': sortOrderInt
            };
        }
        else if(sortByCol == 'col4') {
            sortOptions = {
                createdAt: sortOrderInt
            };
        }
        else if(sortByCol == 'col5') {
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
            cityNameI: sortOrderInt
        };
    }

    const stateLookup = {
        from: State.collection.name,
        localField: "state",
        foreignField: "_id",
        as: "stateLP"
    };

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

        if(hasStateLookup)
        {
            aggregationParamArr.push({
                $lookup: stateLookup
            });
        }

        aggregationParamArr.push({
            $match: fetchOptions
        });


        let cities;
        if(forExport === true)
        {
            cities = await City.aggregate(aggregationParamArr)
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            cities = await City.aggregate(aggregationParamArr)
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        cities = await City.populate(cities, populateOptions);

        
        let cntAggregationParamArr = aggregationParamArr;
        
        cntAggregationParamArr.push({
            $group: { _id: null, count: { $sum: 1 } }
        });

        let recordCntData =  await City.aggregate(cntAggregationParamArr);


        let totalRecords = 0;

        if(recordCntData && recordCntData[0] && recordCntData[0].count) {
            totalRecords = recordCntData[0].count;
        }

        let filteredRecords = totalRecords;

        let response = {
            results: cities,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;

    } 
    catch (e) 
    {
        throw Error('Error while Paginating City ' + e)
    }
}

exports.getCitiesForSelect = async function(onlyActiveStatus, forState){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$cityName',
        'textI': { '$toLower': '$cityName' }
    };

    const sortOptions = {};
    sortOptions.textI = 1;

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
    if(onlyActiveStatus && onlyActiveStatus == 1)
    {
        fetchOptions.isActive =  1;
    }

    if(mongodb.ObjectId.isValid(forState))
    {
        fetchOptions.state = new mongoose.Types.ObjectId(forState);
    }

    try {
        var city = await City.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            city.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return city;
    } catch (e) {
        throw Error('Error while Paginating City ' + e)
    }
}

exports.checkCityNameForDuplication = async function(id, cityName, forState) {
    var options = {
        cityName : new RegExp(`^${cityName}$`, 'i'),
        isDeleted: 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }

    if(mongodb.ObjectId.isValid(forState))
    {
        options.state = forState;
    }

    try {
        var city = await City.findOne(options);
        return city;
    } catch (e) {
        throw Error('Error while Fetching City ' + e)
    }
}


exports.findCityById = async function(req, cityId){
    
     const populateOptions = [
        {
            path : 'state',
            select : 'stateName'
        },
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
         _id : cityId,
         isDeleted : 0
     };
 
     try {
        var city;
        if(mongodb.ObjectId.isValid(cityId))
        {
            var city = await City.findOne(options).populate(populateOptions);
        }
        return city;
     } catch (e) {
         throw Error('Error while Fetching City' + e)
     }
}

exports.checkIfCityUsesState = async function(id) {
    var options = {
        isDeleted: 0,
        state: id
    };

    try {
        var city = await City.findOne(options);
        return city;
    } catch (e) {
        throw Error('Error while Fetching city ' + e)
    }
}


exports.checkIfCityUsesCountry = async function(id) {
    var options = {
        isDeleted: 0,
        country: id
    };

    try {
        var city = await City.findOne(options);
        return city;
    } catch (e) {
        throw Error('Error while Fetching country ' + e)
    }
}

exports.updateCityByStateId = async function(stateId, countryId){
    
    var options = {
        state : new mongoose.Types.ObjectId(stateId),
    };

    try {
       var cityList = [];
       if(mongodb.ObjectId.isValid(stateId))
       {
            cityList = await City.find(options);
       }

       if(cityList && cityList.length > 0 &&  mongodb.ObjectId.isValid(countryId))
       {
            await Promise.all((cityList).map(async (city, srIndex) => 
            {
                city.state = stateId;
                city.country = countryId;

                let savedCity = await city.save();
            }));
       }
       else
       {
            return;
       }
       
    } catch (e) {
        throw Error('Error while Fetching City' + e)
    }
}