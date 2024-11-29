var ConsortiumChatUserType = require('../models/consortiumChatUserType.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this


exports.getConsortiumChatUserTypesForSelect = async function(req){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$typeText',
        'textI': { '$toLower': '$typeText' },
        'typeCode':'$typeCode' ,
        'isSystemUser':'$isSystemUser' ,
        'isConsortiumUser':'$isConsortiumUser' ,
    };

    const sortOptions = {};
    sortOptions.typeCode = 1;

    let fetchOptions = {};

    try {
        var consortiumChatUserType = await ConsortiumChatUserType.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            consortiumChatUserType.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return consortiumChatUserType;
    } catch (e) {
        throw Error('Error while Paginating ConsortiumChatUserType ' + e)
    }
}


exports.findConsortiumChatUserTypeIdByCode = async function(typeCode)
{
    try {
        var resConsortiumChatUserType = await exports.findConsortiumChatUserTypeByCode(typeCode);
        var resConsortiumChatUserTypeId;
        if(resConsortiumChatUserType)
        {
            resConsortiumChatUserTypeId = resConsortiumChatUserType._id;
        }
        return resConsortiumChatUserTypeId;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatUserType' + e)
    }
}


exports.findConsortiumChatUserTypeByCode = async function(typeCode)
{
    var options = {
        typeCode : typeCode,
        isActive : 1
    };

    try {
       var resConsortiumChatUserType = await ConsortiumChatUserType.findOne(options);
       return resConsortiumChatUserType;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatUserType' + e)
    }
}




exports.findConsortiumChatUserTypeById = async function(consortiumChatUserTypeId)
{
    var options = {
        _id : new mongoose.Types.ObjectId(consortiumChatUserTypeId)
    };

    try {
        var resConsortiumChatUserType;
        if(mongodb.ObjectId.isValid(consortiumChatUserTypeId))
        {
            resConsortiumChatUserType = await ConsortiumChatUserType.findOne(options);
        }
       return resConsortiumChatUserType;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatUserType' + e)
    }
}
