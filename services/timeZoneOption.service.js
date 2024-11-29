var TimeZoneOption = require('../models/timeZoneOption.model');
var mongoose = require('mongoose');
var mongodb = require("mongodb");
var moment = require("moment");

// Saving the context of this module inside the _the variable
_this = this

// // Async function to add TimeZoneOption
exports.saveTimeZoneOption = async function(timeZoneOption)
{

    let modTimeZoneOption = new TimeZoneOption();

    modTimeZoneOption.timeZoneName = timeZoneOption.timeZoneName;
    modTimeZoneOption.timeZoneOffset = timeZoneOption.timeZoneOffset;
    modTimeZoneOption.timeZoneOffsetStr = timeZoneOption.timeZoneOffsetStr;
    modTimeZoneOption.isActive = 1;
   
    try{
        var savedTimeZoneOption = await modTimeZoneOption.save();
       
        return savedTimeZoneOption;
    }catch(e){
        throw Error("And Error occured while updating the TimeZoneOption "+ e);
    }
}

exports.findTimeZoneOptionById = async function(timeZoneId){
    var fetchOptions = {
        isActive : 1,
        _id: timeZoneId
    }
    
    try {
        var timeZoneOption;
        if(mongodb.ObjectId.isValid(timeZoneId))
        {
            timeZoneOption = await TimeZoneOption.findOne(fetchOptions);
        }
        return timeZoneOption;
    } catch (e) {
        throw Error('Error while Fetching WeekDay ' + e)
    }
}

exports.findTimeZoneOption = async function(){
    var fetchOptions = {
        isActive : 1
    }
    
    try {
        var timeZoneOptions = await TimeZoneOption.find(fetchOptions);
        return timeZoneOptions;
    } catch (e) {
        throw Error('Error while Fetching WeekDay ' + e)
    }
}

exports.getTimeZoneOptionForSelect = async function(req, onlyActiveStatus){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': { '$concat': [ '$timeZoneName', " (", "$timeZoneOffsetStr", ")" ] },
        'textI': { '$toLower': '$timeZoneName' },
        'timeZoneOffset': '$timeZoneOffset',
        'timeZoneOffsetStr': '$timeZoneOffsetStr'
    };

    const sortOptions = {};
    sortOptions.timeZoneOffsetStr = 1;

    let fetchOptions = {};
    if(onlyActiveStatus && onlyActiveStatus == 1)
    {
        fetchOptions.isActive =  1;
    }

    try {
        var timeZoneOption = await TimeZoneOption.aggregate([ { $match: fetchOptions } ])
                                                .project(projectObj)
                                                .sort(sortOptions);
                                
        
            timeZoneOption.forEach(function(v){
                        delete v.textI;
                        delete v.timeZoneOffsetStr;
                        delete v._id;
                    });

        return timeZoneOption;
    } catch (e) {
        throw Error('Error while Paginating TimeZone Option ' + e)
    }
}
