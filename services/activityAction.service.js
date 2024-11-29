var ActivityAction = require('../models/activityAction.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this


exports.getActivityActionsForSelect = async function(req){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$actionText',
        'textI': { '$toLower': '$actionText' },
        'actionCode':'$actionCode' ,
        'colorCode':'$colorCode' ,
        'isMTApplicable':'$isMTApplicable' ,
        'isQAApplicable':'$isQAApplicable' ,
    };

    const sortOptions = {};
    sortOptions.actionText = 1;

    let fetchOptions = {
        isActive : 1
    };

    try {
        var activityAction = await ActivityAction.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            activityAction.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return activityAction;
    } catch (e) {
        throw Error('Error while Paginating ActivityAction ' + e)
    }
}



exports.findActivityActionIdByCode = async function(actionCode)
{
    try {
        var resActivityAction = await exports.findActivityActionByCode(actionCode);
        var resActivityActionId;
        if(resActivityAction)
        {
            resActivityActionId = resActivityAction._id;
        }
        return resActivityActionId;
    } catch (e) {
        throw Error('Error while Fetching ActivityAction' + e)
    }
}


exports.findActivityActionByCode = async function(actionCode)
{
    var options = {
        actionCode : actionCode,
        isActive : 1
    };

    try {
       var resActivityAction = await ActivityAction.findOne(options);
       return resActivityAction;
    } catch (e) {
        throw Error('Error while Fetching ActivityAction' + e)
    }
}

exports.findActivityActionById = async function(id)
{
    var options = {
        _id : new mongoose.Types.ObjectId(id),
        isActive : 1
    };

    try {
       var resActivityAction;
       if(mongodb.ObjectId.isValid(id)) {
            resActivityAction = await ActivityAction.findOne(options);
       }
       return resActivityAction;
    } catch (e) {
        throw Error('Error while Fetching ActivityAction' + e)
    }
}

exports.findActivityActionList = async function()
{

    try {
        var resActivityActions = await ActivityAction.find();
        return resActivityActions;
    } catch (e) {
        throw Error('Error while Fetching ActivityAction' + e)
    }
}

