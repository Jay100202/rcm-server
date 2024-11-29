var Gender = require('../models/gender.model');
var AppUploadService = require('./appUpload.service');
var AppConfig = require('../appconfig');
var bcrypt = require('bcrypt');
var AppCommonService = require('./appcommon.service');
var AppMailService = require('./appMail.service');
var mongodb = require("mongodb");
var AppConfigConst = require('../appconfig-const');
var AppDataSanitationService = require('../services/appDataSanitation.service');
var moment = require('moment');
var momentTZ = require('moment-timezone');

// Saving the context of this module inside the _the variable
_this = this



exports.getGendersForSelect = async function(){

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$genderName',
        'textI': { '$toLower': '$genderName' }
    };

    const sortOptions = {};
    sortOptions.textI = 1;

    let fetchOptions = {};
 
    try {
        var gender = await Gender.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            gender.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return gender;
    } catch (e) {
        throw Error('Error while Paginating Gender ' + e)
    }
}


exports.findGenderByName = async function(genderName) {
    var options = {
        genderName : new RegExp(`^${genderName}$`, 'i')
    };

    try {
        var gender = await Gender.findOne(options);
        return gender;
    } catch (e) {
        throw Error('Error while Fetching Gender ' + e)
    }
}
