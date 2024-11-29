var ConsortiumJobType = require('../models/consortiumJobType.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this


exports.getConsortiumJobTypesForSelect = async function(req){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$typeText',
        'textI': { '$toLower': '$typeText' },
        'typeCode':'$typeCode' ,
        'isActive':'$isActive' ,
    };

    const sortOptions = {};
    sortOptions.typeCode = 1;

    let fetchOptions = {};

    try {
        var consortiumJobType = await ConsortiumJobType.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            consortiumJobType.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return consortiumJobType;
    } catch (e) {
        throw Error('Error while Paginating ConsortiumJobType ' + e)
    }
}


exports.findConsortiumJobTypeIdByCode = async function(typeCode)
{
    try {
        var resConsortiumJobType = await exports.findConsortiumJobTypeByCode(typeCode);
        var resConsortiumJobTypeId;
        if(resConsortiumJobType)
        {
            resConsortiumJobTypeId = resConsortiumJobType._id;
        }
        return resConsortiumJobTypeId;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumJobType' + e)
    }
}


exports.findConsortiumJobTypeByCode = async function(typeCode)
{
    var options = {
        typeCode : typeCode,
        isActive : 1
    };

    try {
       var resConsortiumJobType = await ConsortiumJobType.findOne(options);
       return resConsortiumJobType;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumJobType' + e)
    }
}




exports.findConsortiumJobTypeById = async function(consortiumJobTypeId)
{
    var options = {
        _id : new mongoose.Types.ObjectId(consortiumJobTypeId)
    };

    try {
        var resConsortiumJobType;
        if(mongodb.ObjectId.isValid(consortiumJobTypeId))
        {
            resConsortiumJobType = await ConsortiumJobType.findOne(options);
        }
       return resConsortiumJobType;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumJobType' + e)
    }
}


exports.findConsortiumJobTypeForBulkDictation = async function(typeCode)
{
    var options = {
        hasBulkDictation : true,
        isActive : 1
    };

    try {
       var resConsortiumJobType = await ConsortiumJobType.findOne(options);
       return resConsortiumJobType;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumJobType' + e)
    }
}