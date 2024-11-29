var Speciality = require('../models/speciality.model');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongoose = require('mongoose');
var mongodb = require("mongodb");
var moment = require("moment");

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the speciality List
exports.getSpecialities = async function(req)
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
        'specialityName': '$specialityName',
        'specialityNameI': { '$toLower': '$specialityName' },
        'description': '$description',
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
        searchKeywordOptions.push({ 'specialityName' : regex });

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
                specialityNameI: sortOrderInt
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
            specialityNameI: sortOrderInt
        };
    }

    try 
    {
        let specialities;
        if(forExport === true)
        {
            specialities = await Speciality.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            specialities = await Speciality.aggregate([
                            {
                                $match: fetchOptions // For Fetch
                            }
                    ])
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        specialities = await Speciality.populate(specialities, populateOptions);

        let recordCntData =  await Speciality.aggregate([
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
            results: specialities,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;
    } 
    catch (e) 
    {
        throw Error('Error while Paginating Speciality ' + e)
    }
}

// Async function to add Speciality
exports.saveSpeciality = async function(speciality)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modSpeciality = null;
    if(mongodb.ObjectId.isValid(speciality.id))
    {
        try
        {
            modSpeciality = await Speciality.findById(speciality.id);
        }
        catch(e){
            throw Error("Error occured while Finding the Speciality : " + e);
        }
    }

    var isAdd = false;

    if(!modSpeciality){
        modSpeciality = new Speciality();
        modSpeciality.createdAt = currTs;

        if(speciality.createdBy !== undefined)
        modSpeciality.createdBy = speciality.createdBy;

        isAdd = true;
    }

    modSpeciality.updatedAt = currTs;

    if(speciality.updatedBy !== undefined)
    modSpeciality.updatedBy = speciality.updatedBy;

    if(speciality.specialityName !== undefined)
    modSpeciality.specialityName = speciality.specialityName;

    if(speciality.description !== undefined)
    modSpeciality.description = speciality.description;

    if(speciality.isActive !== undefined)
    modSpeciality.isActive = speciality.isActive;

    if(speciality.isDeleted !== undefined)
    modSpeciality.isDeleted = speciality.isDeleted;

    try{
        var savedSpeciality = await modSpeciality.save();
        var respSpeciality;
        if(savedSpeciality)
        {
            respSpeciality = JSON.parse(JSON.stringify(savedSpeciality));
            respSpeciality.isAdd = isAdd;
        }
        return respSpeciality;
    }catch(e){
        throw Error("And Error occured while updating the Speciality "+ e);
    }
}

exports.getSpecialityBaseObjectById = async function(specialityId, withPopulation) {
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
        _id : specialityId,
        isDeleted : 0
    };

    try {
       var speciality;
       if(mongodb.ObjectId.isValid(specialityId))
       {
            speciality = await Speciality.findOne(options).populate(populateOptions);
       }
       return speciality;
    } catch (e) {
        throw Error('Error while Fetching Speciality' + e)
    }
}

exports.findSpecialityById = async function(specialityId, withPopulation){
    // Options setup for the mongoose paginate
    try {
        var resSpeciality;
        var speciality = await exports.getSpecialityBaseObjectById(specialityId, withPopulation);
        if(speciality)
        {
            resSpeciality = JSON.parse(JSON.stringify(speciality));
        }
       return resSpeciality;
    } catch (e) {
        throw Error('Error while Fetching Speciality' + e)
    }
}

exports.getSpecialitiesForSelect = async function(req) {

    var onlyActiveStatus = req && req.body && req.body.onlyActive ? req.body.onlyActive*1 : 1;

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$specialityName',
        'textI': { '$toLower': '$specialityName' },
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
        var speciality = await Speciality.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
         speciality.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return speciality;
    } catch (e) {
        throw Error('Error while Paginating specialities ' + e)
    }
}

exports.checkSpecialityNameForDuplication = async function(id, specialityName) {
    var options = {
        specialityName : new RegExp(`^${specialityName}$`, 'i'),
        isDeleted: 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }

    try {
        var speciality = await Speciality.findOne(options);
        return speciality;
    } catch (e) {
        throw Error('Error while Fetching Speciality ' + e)
    }
}

exports.checkIfSpecialityUsesSystemUser = async function(id) {
    var options = {
        isDeleted: 0,
        $or: [ { createdBy: id }, { updatedBy: id } ]
    };

    try {
        var speciality = await Speciality.findOne(options);
        return speciality;
    } catch (e) {
        throw Error('Error while Fetching Speciality ' + e)
    }
}
