var ActivityStatus = require('../models/activityStatus.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this


exports.getActivityStatusesForSelect = async function(req){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$statusText',
        'textI': { '$toLower': '$statusText' },
        'statusCode':'$statusCode' ,
        'priority':'$priority' ,
        'colorCode':'$colorCode' ,
        'isDefault':'$isDefault' ,
    };

    const sortOptions = {};
    sortOptions.priority = 1;

    let fetchOptions = {};

    try {
        var activityStatus = await ActivityStatus.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            activityStatus.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return activityStatus;
    } catch (e) {
        throw Error('Error while Paginating ActivityStatus ' + e)
    }
}


exports.findActivityStatusIdByCode = async function(statusCode)
{
    try {
        var resActivityStatus = await exports.findActivityStatusByCode(statusCode);
        var resActivityStatusId;
        if(resActivityStatus)
        {
            resActivityStatusId = resActivityStatus._id;
        }
        return resActivityStatusId;
    } catch (e) {
        throw Error('Error while Fetching ActivityStatus' + e)
    }
}


exports.findActivityStatusByCode = async function(statusCode)
{
    var options = {
        statusCode : statusCode,
        isActive : 1
    };

    try {
       var resActivityStatus = await ActivityStatus.findOne(options);
       return resActivityStatus;
    } catch (e) {
        throw Error('Error while Fetching ActivityStatus' + e)
    }
}

exports.findDefaultActivityStatusId = async function()
{
    var options = {
        isDefault : true,
        isActive : 1
    };

    try {
        let resActivityStatusId;
        var resActivityStatus = await ActivityStatus.findOne(options);
        if(resActivityStatus)
        {
            resActivityStatusId = resActivityStatus._id;
        }
        return resActivityStatusId;
    } catch (e) {
        throw Error('Error while Fetching ActivityStatus' + e)
    }
}