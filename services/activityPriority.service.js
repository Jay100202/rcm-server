var ActivityPriority = require('../models/activityPriority.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this


exports.getActivityPrioritiesForSelect = async function(req){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$priorityText',
        'textI': { '$toLower': '$priorityText' },
        'priority':'$priority' ,
        'colorCode':'$colorCode' ,
        'isDefault':'$isDefault' ,
    };

    const sortOptions = {};
    sortOptions.priority = 1;

    let fetchOptions = {};

    try {
        var activityPriority = await ActivityPriority.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            activityPriority.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return activityPriority;
    } catch (e) {
        throw Error('Error while Paginating ActivityPriority ' + e)
    }
}




exports.findActivityPriorityIdByCode = async function(statusCode)
{
    try {
        var resActivityPriority = await exports.findActivityPriorityByCode(statusCode);
        var resActivityPriorityId;
        if(resActivityPriority)
        {
            resActivityPriorityId = resActivityPriority._id;
        }
        return resActivityPriorityId;
    } catch (e) {
        throw Error('Error while Fetching ActivityPriority' + e)
    }
}


exports.findActivityPriorityByCode = async function(statusCode)
{
    var options = {
        statusCode : statusCode,
        isActive : 1
    };

    try {
       var resActivityPriority = await ActivityPriority.findOne(options);
       return resActivityPriority;
    } catch (e) {
        throw Error('Error while Fetching ActivityPriority' + e)
    }
}

exports.findDefaultActivityPriorityId = async function()
{
    var options = {
        isDefault : true,
        isActive : 1
    };

    try {
        let resActivityPriorityId;
        var resActivityPriority = await ActivityPriority.findOne(options);
        if(resActivityPriority)
        {
            resActivityPriorityId = resActivityPriority._id;
        }
        return resActivityPriorityId;
    } catch (e) {
        throw Error('Error while Fetching ActivityPriority' + e)
    }
}