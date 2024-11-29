var ActivityFileStatus = require('../models/activityFileStatus.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this


exports.getActivityFileStatusesForSelect = async function(req){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$statusText',
        'textI': { '$toLower': '$statusText' },
        'statusCode':'$statusCode' ,
        'priority':'$priority' ,
        'colorCode':'$colorCode' ,
        'isCompleted':'$isCompleted' ,
    };

    const sortOptions = {};
    sortOptions.priority = 1;

    let fetchOptions = {
        isActive : 1
    };

    try {
        var activityFileStatus = await ActivityFileStatus.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            activityFileStatus.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return activityFileStatus;
    } catch (e) {
        throw Error('Error while Paginating ActivityFileStatus ' + e)
    }
}



exports.findActivityFileStatusIdByCode = async function(statusCode)
{
    try {
        var resActivityFileStatus = await exports.findActivityFileStatusByCode(statusCode);
        var resActivityFileStatusId;
        if(resActivityFileStatus)
        {
            resActivityFileStatusId = resActivityFileStatus._id;
        }
        return resActivityFileStatusId;
    } catch (e) {
        throw Error('Error while Fetching ActivityFileStatus' + e)
    }
}


exports.findActivityFileStatusByCode = async function(statusCode)
{
    var options = {
        statusCode : statusCode,
        isActive : 1
    };

    try {
       var resActivityFileStatus = await ActivityFileStatus.findOne(options);
       return resActivityFileStatus;
    } catch (e) {
        throw Error('Error while Fetching ActivityFileStatus' + e)
    }
}


exports.findActivityFileStatusById = async function(id)
{
    var options = {
        _id : new mongoose.Types.ObjectId(id),
        isActive : 1
    };

    try {
       var resActivityFileStatus;
       if(mongodb.ObjectId.isValid(id)) {
        resActivityFileStatus = await ActivityFileStatus.findOne(options);
       }
       return resActivityFileStatus;
    } catch (e) {
        throw Error('Error while Fetching ActivityFileStatus' + e)
    }
}
