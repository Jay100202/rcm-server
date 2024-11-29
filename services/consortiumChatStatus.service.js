var ConsortiumChatStatus = require('../models/consortiumChatStatus.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this


exports.getConsortiumChatStatusesForSelect = async function(req){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$statusText',
        'textI': { '$toLower': '$statusText' },
        'statusCode':'$statusCode' ,
        'colorCode':'$colorCode' ,
        'isDefault':'$isDefault' ,
        'isResolved':'$isResolved' ,
        'isClosed':'$isClosed' ,
        'isActive':'$isActive' 
    };

    const sortOptions = {};
    sortOptions.statusCode = 1;

    let fetchOptions = {};

    try {
        var consortiumChatStatus = await ConsortiumChatStatus.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            consortiumChatStatus.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return consortiumChatStatus;
    } catch (e) {
        throw Error('Error while Paginating ConsortiumChatStatus ' + e)
    }
}


exports.findConsortiumChatStatusIdByCode = async function(statusCode)
{
    try {
        var resConsortiumChatStatus = await exports.findConsortiumChatStatusByCode(statusCode);
        var resConsortiumChatStatusId;
        if(resConsortiumChatStatus)
        {
            resConsortiumChatStatusId = resConsortiumChatStatus._id;
        }
        return resConsortiumChatStatusId;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatStatus' + e)
    }
}


exports.findConsortiumChatStatusByCode = async function(statusCode)
{
    var options = {
        statusCode : statusCode,
        isActive : 1
    };

    try {
       var resConsortiumChatStatus = await ConsortiumChatStatus.findOne(options);
       return resConsortiumChatStatus;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatStatus' + e)
    }
}


exports.findDefaultConsortiumChatStatus = async function()
{
    var options = {
        isDefault : true,
        isActive : 1
    };

    try {
       var resConsortiumChatStatus = await ConsortiumChatStatus.findOne(options);
       return resConsortiumChatStatus;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatStatus' + e)
    }
}


exports.findConsortiumChatStatusById = async function(consortiumChatStatusId)
{
    var options = {
        _id : new mongoose.Types.ObjectId(consortiumChatStatusId)
    };

    try {
        var resConsortiumChatStatus;
        if(mongodb.ObjectId.isValid(consortiumChatStatusId))
        {
            resConsortiumChatStatus = await ConsortiumChatStatus.findOne(options);
        }
       return resConsortiumChatStatus;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatStatus' + e)
    }
}
