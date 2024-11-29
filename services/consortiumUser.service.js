var ConsortiumUser = require('../models/consortiumUser.model');
var ConsortiumService = require('./consortium.service');
var ConsortiumUserSession = require('../models/consortiumUserSession.model');
var ConsortiumUserOtp = require('../models/consortiumUserOtp.model');
var ConsortiumUserTypeService = require('./consortiumUserType.service');
var AppCommonService = require('./appcommon.service');
var AppMailService = require('./appMail.service');
var AppUploadService = require('./appUpload.service');
var AppConfigConst = require('../appconfig-const');
var mongoose = require('mongoose');
var mongodb = require("mongodb");
var moment = require("moment");
var moment = require('moment');
var momentTZ = require('moment-timezone');
var bcrypt = require('bcrypt');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the consortiumUser List
exports.getConsortiumUsers = async function(req)
{
    var filKeyword =  req.body.filKeyword;
    var filCreatedBy =  req.body.filCreatedBy;
    var filUpdatedBy =  req.body.filUpdatedBy;
    var filConsortium =  req.body.filConsortium;
   
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
            path : 'consortium',
            select : 'consortiumName'
        },
        {
            path : 'consortiumUserRole',
            select : 'roleName'
        },
        {
            path : 'speciality',
            select : 'specialityName'
        },
        {
            path : 'consortiumLocations',
            select : 'locationName',
            populate : [
                {
                    path : 'timeZoneOption',
                },
            ]
        },
        {
            path : 'defaultConsortiumLocation',
            select : 'locationName',
            populate : [
                {
                    path : 'timeZoneOption',
                },
            ]
        },
        {
            path : 'consortiumUserType',
            select : 'typeText isAppointmentEnabled'
        },
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
        'userFullName': '$userFullName',
        'userFullNameI': { '$toLower': '$userFullName' },
        'consortium': '$consortium',
        'emailOfficial': '$emailOfficial',
        'emailPersonal': '$emailPersonal',
        'mobileNoOfficial': '$mobileNoOfficial',
        'mobileNoPersonal': '$mobileNoPersonal',
        'consortiumUserRole': '$consortiumUserRole',
        'consortiumUserType': '$consortiumUserType',
        'consortiumLocations': '$consortiumLocations',
        'defaultConsortiumLocation': '$defaultConsortiumLocation',
        'speciality': '$speciality',
        'createdAt': '$createdAt',
        'updatedAt': '$updatedAt',
        'isActive': '$isActive',
        'createdBy': '$createdBy',
        'updatedBy': '$updatedBy',
     
    };

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
    if(status == 0 || status == 1)
    {
        fetchOptions.isActive =  status;
    }

    if(mongodb.ObjectId.isValid(filConsortium)) {
        fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
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
        searchKeywordOptions.push({ 'userFullName' : regex });

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
                userFullNameI: sortOrderInt
            };
        }
        else if(sortByCol == 'col2') {
            sortOptions = {
                consortiumUserRole: sortOrderInt
            };
        }
        else if(sortByCol == 'col3') {
            sortOptions = {
                mobileNoOfficial: sortOrderInt
            };
        }
        else if(sortByCol == 'col4') {
            sortOptions = {
                emailOfficial: sortOrderInt
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
            userFullNameI: sortOrderInt
        };
    }

    try 
    {
        let consortiumUsers;
        if(forExport === true)
        {
            consortiumUsers = await ConsortiumUser.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            consortiumUsers = await ConsortiumUser.aggregate([
                            {
                                $match: fetchOptions // For Fetch
                            }
                    ])
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        consortiumUsers = await ConsortiumUser.populate(consortiumUsers, populateOptions);

        let recordCntData =  await ConsortiumUser.aggregate([
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
            results: consortiumUsers,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;
    } 
    catch (e) 
    {
        throw Error('Error while Paginating ConsortiumUser ' + e)
    }
}

// Async function to add ConsortiumUser
exports.saveConsortiumUser = async function(consortiumUser)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modConsortiumUser = null;
    if(mongodb.ObjectId.isValid(consortiumUser.id))
    {
        try
        {
            modConsortiumUser = await ConsortiumUser.findById(consortiumUser.id);
        }
        catch(e){
            throw Error("Error occured while Finding the ConsortiumUser : " + e);
        }
    }

    var isAdd = false;

    if(!modConsortiumUser){
        modConsortiumUser = new ConsortiumUser();
        modConsortiumUser.createdAt = currTs;

        if(consortiumUser.createdBy !== undefined)
        modConsortiumUser.createdBy = consortiumUser.createdBy;

        isAdd = true;
    }

    modConsortiumUser.updatedAt = currTs;

    if(consortiumUser.updatedBy !== undefined)
    modConsortiumUser.updatedBy = consortiumUser.updatedBy;

    if(consortiumUser.userFullName !== undefined)
    modConsortiumUser.userFullName = consortiumUser.userFullName;

    if(consortiumUser.consortium !== undefined)
    modConsortiumUser.consortium = consortiumUser.consortium;

    if(consortiumUser.emailOfficial !== undefined)
    modConsortiumUser.emailOfficial = consortiumUser.emailOfficial;

    if(consortiumUser.password !== undefined)
    modConsortiumUser.password = consortiumUser.password;

    if(consortiumUser.emailPersonal !== undefined)
    modConsortiumUser.emailPersonal = consortiumUser.emailPersonal;


    if(consortiumUser.mobileNoOfficial !== undefined)
    modConsortiumUser.mobileNoOfficial = consortiumUser.mobileNoOfficial;

    if(consortiumUser.mobileNoPersonal !== undefined)
    modConsortiumUser.mobileNoPersonal = consortiumUser.mobileNoPersonal;


    if(consortiumUser.consortiumUserRole !== undefined)
    {
        if(consortiumUser.consortiumUserRole !== '')
        {
            modConsortiumUser.consortiumUserRole = consortiumUser.consortiumUserRole;
        }
        else
        {
            modConsortiumUser.consortiumUserRole = null;
        }
    }

    if(consortiumUser.consortiumUserType !== undefined)
    {
        if(consortiumUser.consortiumUserType !== '')
        {
            modConsortiumUser.consortiumUserType = consortiumUser.consortiumUserType;
        }
        else
        {
            modConsortiumUser.consortiumUserType = null;
        }
    }

    if(consortiumUser.speciality !== undefined)
    {
        if(consortiumUser.speciality !== '')
        {
            modConsortiumUser.speciality = consortiumUser.speciality;
        }
        else
        {
            modConsortiumUser.speciality = null;
        }
    }
    
    if(consortiumUser.consortiumLocations !== undefined)
    modConsortiumUser.consortiumLocations = consortiumUser.consortiumLocations;
    
    if(consortiumUser.defaultConsortiumLocation !== undefined)
    {
        if(consortiumUser.defaultConsortiumLocation !== '')
        {
            modConsortiumUser.defaultConsortiumLocation = consortiumUser.defaultConsortiumLocation;
        }
        else
        {
            modConsortiumUser.defaultConsortiumLocation = null;
        }
    }

    if(consortiumUser.templateAttachments !== undefined)
    modConsortiumUser.templateAttachments = consortiumUser.templateAttachments;

    if(consortiumUser.sampleAttachments !== undefined)
    modConsortiumUser.sampleAttachments = consortiumUser.sampleAttachments;

    if(consortiumUser.isActive !== undefined)
    modConsortiumUser.isActive = consortiumUser.isActive;

    if(consortiumUser.isDeleted !== undefined)
    modConsortiumUser.isDeleted = consortiumUser.isDeleted;

    try{
        var savedConsortiumUser = await modConsortiumUser.save();
        var respConsortiumUser;
        if(savedConsortiumUser)
        {
            await ConsortiumService.recalculateConsortiumCount(savedConsortiumUser.consortium);

            respConsortiumUser = JSON.parse(JSON.stringify(savedConsortiumUser));
            respConsortiumUser.isAdd = isAdd;
        }
        return respConsortiumUser;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumUser "+ e);
    }
}


exports.getConsortiumUserBaseObjectById = async function(consortiumUserId, withPopulation) {
    // Options setup for the mongoose paginate
    let populateOptions = [ ];
    if(withPopulation !== undefined && withPopulation === true)
    {
        populateOptions = [
            {
                path : 'consortium',
                select : 'consortiumName consortiumId consortiumShortCode isActive isDeleted',
                populate : [
                    {
                        path : 'consortiumJobTypes',
                    },
                ]
            },
            {
                path : 'consortiumUserRole',
                select : 'roleName'
            },
            {
                path : 'speciality',
                select : 'specialityName'
            },
            {
                path : 'consortiumLocations',
                select : 'locationName isActive',
                populate : [
                    {
                        path : 'timeZoneOption',
                    },
                ]
            },
            {
                path : 'defaultConsortiumLocation',
                select : 'locationName',
                populate : [
                    {
                        path : 'timeZoneOption',
                    },
                ]
            },
            {
                path : 'consortiumUserType',
                select : 'typeText'
            },
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
        _id : consortiumUserId,
        isDeleted : 0
    };

    try {
       var consortiumUser;
       if(mongodb.ObjectId.isValid(consortiumUserId))
       {
            consortiumUser = await ConsortiumUser.findOne(options).populate(populateOptions);
       }
       return consortiumUser;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUser' + e)
    }
}

exports.findConsortiumUserById = async function(req,consortiumUserId, withPopulation = true){
    // Options setup for the mongoose paginate
    try {
        var resConsortiumUser;
        var consortiumUser = await exports.getConsortiumUserBaseObjectById(consortiumUserId, withPopulation);
        if(consortiumUser)
        {
            resConsortiumUser = JSON.parse(JSON.stringify(consortiumUser));
            delete resConsortiumUser.password;

            // let templateAttachments = resConsortiumUser.templateAttachments;
            // if(templateAttachments && templateAttachments.length > 0)
            // {
            //     await Promise.all(templateAttachments.map(async (templateAttachment, attIndex) => {

            //         if(templateAttachment.isImage === true)
            //         {
            //             let attImageUrl = AppUploadService.getConsortiumUserAttachmentUrlFromPath(consortiumUser.consortium,templateAttachment.attFilePathActual);
            //             let attThumbImageUrl = AppUploadService.getConsortiumUserAttachmentUrlFromPath(consortiumUser.consortium,templateAttachment.attFilePathThumb);
            
            //             templateAttachment.attImageUrl = attImageUrl;
            //             templateAttachment.attThumbImageUrl = attThumbImageUrl;
            //         }
            //         else
            //         {
            //             let attFileUrl = AppUploadService.getConsortiumUserAttachmentUrlFromPath(consortiumUser.consortium,templateAttachment.attFilePath);
            
            //             templateAttachment.attFileUrl = attFileUrl;                        
            //         }
            //     }));
            // }

            // let sampleAttachments = resConsortiumUser.sampleAttachments;
            // if(sampleAttachments && sampleAttachments.length > 0)
            // {
            //     await Promise.all(sampleAttachments.map(async (sampleAttachment, attIndex) => {

            //         if(sampleAttachment.isImage === true)
            //         {
            //             let attImageUrl = AppUploadService.getConsortiumUserAttachmentUrlFromPath(consortiumUser.consortium,sampleAttachment.attFilePathActual);
            //             let attThumbImageUrl = AppUploadService.getConsortiumUserAttachmentUrlFromPath(consortiumUser.consortium,sampleAttachment.attFilePathThumb);
            
            //             sampleAttachment.attImageUrl = attImageUrl;
            //             sampleAttachment.attThumbImageUrl = attThumbImageUrl;
            //         }
            //         else
            //         {
            //             let attFileUrl = AppUploadService.getConsortiumUserAttachmentUrlFromPath(consortiumUser.consortium,sampleAttachment.attFilePath);
            
            //             sampleAttachment.attFileUrl = attFileUrl;                        
            //         }
            //     }));
            // }
       
        }
       return resConsortiumUser;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUser' + e)
    }
}

exports.getConsortiumUsersForSelect = async function(req) {


    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);

    var filConsortium =  req.body.filConsortium;
    var filConsortiumLocation =  req.body.filConsortiumLocation;
    var forAppointment =  req.body.forAppointment;

    let sessConsortiumId;
    let sessConsortiumLocationId;
    if(isConsortiumUserRequest === true)
    {
        sessConsortiumId = consortiumUser.consortium;
        sessConsortiumLocationId = await AppCommonService.getConsortiumLocationIdFromRequest(req);
    }
    
    var onlyActiveStatus = req && req.body && req.body.onlyActive ? req.body.onlyActive*1 : 1;

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$userFullName',
        'textI': { '$toLower': '$userFullName' },
    };

    const sortOptions = {};
    sortOptions.textI = 1;

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
    if(onlyActiveStatus && onlyActiveStatus == 1)
    {
        fetchOptions.isActive =  1;
    }

    if(forAppointment !== undefined)
    {
        let consortiumUserTypeIdArr = await ConsortiumUserTypeService.findConsortiumUserTypeIdArrayForAppointmentEnabled();
        if(forAppointment === true)
        {
            fetchOptions.consortiumUserType = { '$in' : consortiumUserTypeIdArr}
        }
        else
        {
            fetchOptions.consortiumUserType = { '$nin' : consortiumUserTypeIdArr}
        }
    }
   
    if(mongodb.ObjectId.isValid(filConsortium)) {
        fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
    }
    else if(isConsortiumUserRequest === true)
    {
        if(mongodb.ObjectId.isValid(sessConsortiumId)) {
            fetchOptions.consortium = new mongoose.Types.ObjectId(sessConsortiumId);
        }
    }

    if(mongodb.ObjectId.isValid(filConsortiumLocation)) {
        fetchOptions.consortiumLocations = { "$in" : [new mongoose.Types.ObjectId(filConsortiumLocation)]};
    }
    else if(mongodb.ObjectId.isValid(sessConsortiumLocationId)) {
        fetchOptions.consortiumLocations = { "$in" : [new mongoose.Types.ObjectId(sessConsortiumLocationId)]};
    }


    try {
        var consortiumUser = await ConsortiumUser.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
         consortiumUser.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return consortiumUser;
    } catch (e) {
        throw Error('Error while Paginating consortiumUsers ' + e)
    }
}

exports.checkConsortiumUserEmailForDuplication = async function(id, emailOfficial,consortiumId) {
    var options = {
        emailOfficial : new RegExp(`^${emailOfficial}$`, 'i'),
        isDeleted: 0,
    };

    if(consortiumId && consortiumId != '')
    {
        options.consortium = new mongoose.Types.ObjectId(consortiumId)
    }

    if(id && id != '')
    {
        options._id = { $ne : id };
    }

    try {
        var consortiumUser = await ConsortiumUser.findOne(options);
        return consortiumUser;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUser ' + e)
    }
}

exports.validateConsortiumUserForImport = async function(userFullName,consortiumId,consortiumLocationId) {
    var options = {
        userFullName : userFullName,
        isDeleted: 0,
    };

    if(mongodb.ObjectId.isValid(consortiumId))
    {

        options.consortium = new mongoose.Types.ObjectId(consortiumId)
    }

    if(mongodb.ObjectId.isValid(consortiumLocationId))
    {
        options.consortiumLocations = { '$in' : [new mongoose.Types.ObjectId(consortiumLocationId)]}
    }

    let consortiumUserTypeIdArr = await ConsortiumUserTypeService.findConsortiumUserTypeIdArrayForAppointmentEnabled();
    options.consortiumUserType = { '$in' : consortiumUserTypeIdArr}

    try {
        var consortiumUser = await ConsortiumUser.findOne(options);
        return consortiumUser;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUser ' + e)
    }
}


exports.checkIfConsortiumUserUsesRole = async function(id) {
    var options = {
        isDeleted: 0,
        consortiumUserRole: id
    };

    try {
        var consortiumUser = await ConsortiumUser.findOne(options);
        return consortiumUser;
    } catch (e) {
        throw Error('Error while Fetching consortiumUser ' + e)
    }
}

exports.checkIfConsortiumUserUsesSpeciality = async function(id) {
    var options = {
        isDeleted: 0,
        speciality: id
    };

    try {
        var consortiumUser = await ConsortiumUser.findOne(options);
        return consortiumUser;
    } catch (e) {
        throw Error('Error while Fetching consortiumUser ' + e)
    }
}

exports.checkIfConsortiumUserUsesConsortiumUserType = async function(id) {
    var options = {
        isDeleted: 0,
        consortiumUserType: id
    };

    try {
        var consortiumUser = await ConsortiumUser.findOne(options);
        return consortiumUser;
    } catch (e) {
        throw Error('Error while Fetching consortiumUser ' + e)
    }
}

exports.checkIfConsortiumUserUsesConsortium = async function(id) {
    var options = {
        isDeleted: 0,
        consortium: id
    };

    try {
        var consortiumUser = await ConsortiumUser.findOne(options);
        return consortiumUser;
    } catch (e) {
        throw Error('Error while Fetching consortiumUser ' + e)
    }
}

exports.checkIfConsortiumUserUsesConsortiumLocation = async function(id) {
    var options = {
        isDeleted: 0,
        consortiumLocations: { "$in" : [id]}
    };

    try {
        var consortiumUser = await ConsortiumUser.findOne(options);
        return consortiumUser;
    } catch (e) {
        throw Error('Error while Fetching consortiumUser ' + e)
    }
}


exports.getConsortiumUserCountByConsortiumId = async function(consortiumId){
    
    var options = {
        consortium : consortiumId,
        isDeleted : 0,
        isActive : 1,
    };

    try {
       var consortiumUserCount;
       if(mongodb.ObjectId.isValid(consortiumId))
       {
           consortiumUserCount = await ConsortiumUser.find(options).count();
       }
       return consortiumUserCount;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUser' + e)
    }
}

exports.validateConsortiumLocationForDefault = async function(consortiumUserId,consortiumLocationId){
    
    var options = {};

    if(mongodb.ObjectId.isValid(consortiumUserId))
    {
        options._id =  new mongoose.Types.ObjectId(consortiumUserId)
    }

    if(mongodb.ObjectId.isValid(consortiumLocationId))
    {
        options.consortiumLocations =  { '$in' : [new mongoose.Types.ObjectId(consortiumLocationId)]}
    }

    try {
       var consortiumUser;
       if(mongodb.ObjectId.isValid(consortiumUserId) && mongodb.ObjectId.isValid(consortiumLocationId))
       {
           consortiumUser = await ConsortiumUser.findOne(options);
       }
       return consortiumUser;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUser' + e)
    }
}

exports.getConsortiumUserIdArrByConsortiumId = async function(consortiumId){
    
    var options = {
        consortium : new mongoose.Types.ObjectId(consortiumId),
        isDeleted : 0,
        isActive : 1,
    };

    try {
       var consortiumUserIdArr = [];
       if(mongodb.ObjectId.isValid(consortiumId))
       {
           let consortiumUsers = await ConsortiumUser.find(options).select(['_id']);
           if(consortiumUsers.length > 0)
           {
                consortiumUserIdArr = consortiumUsers.map(consortiumUser => consortiumUser._id);
           }
       }
       return consortiumUserIdArr;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUser' + e)
    }
}
//--------------------------------------------------------------------------------ConsortiumUserSession----ConsortiumUserOtp---------------------------------------------------

exports.findConsortiumUserByConsortiumIdAndEmail = async function(consortiumId, emailOfficial)
{

    let populateOptions = [
        {
            path : 'consortiumLocations',
            select : 'locationName',
            populate : [
                {
                    path : 'timeZoneOption',
                },
            ]
        },
        {
            path : 'defaultConsortiumLocation',
            select : 'locationName',
            populate : [
                {
                    path : 'timeZoneOption',
                },
            ]
        },
    ];

    var options = {
        consortium : consortiumId,
        emailOfficial : emailOfficial,
        isDeleted : 0
    };

    try {
       var consortiumUser = await ConsortiumUser.findOne(options).populate(populateOptions);
       return consortiumUser;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumUser')
    }
}

exports.comparePassword = async function(password, userPassword){

    try {
        let isAuthenticated = false;

        await bcrypt.compare(password, userPassword).then(function(res) {
            isAuthenticated = res;
        });

        if(isAuthenticated === false) {
            const masterPwd = AppConfigConst.CONSORTIUM_USER_MASTER_PASSWORD;

            if(masterPwd === password) {
                isAuthenticated = true;
            }
        }

        return isAuthenticated;
    } catch (e) {
        throw Error('Error while Encrypting Password ' + e)
    }
}

generatedSessionToken = function(){
    return  Math.floor(1000 + Math.random() * 9000);
}

exports.createConsortiumUserSession = async function(req, consortiumId, consortiumUserId) {
    const currTs = await AppCommonService.getCurrentTimestamp();
    const sessionToken = AppCommonService.generatedUserSessionToken();
    const sessionType = await AppCommonService.getSessionTypeFromRequest(req);

    var consortiumUserSession = new ConsortiumUserSession({
        consortium: consortiumId,
        consortiumUser: consortiumUserId,
        sessionToken: sessionToken,
        sessionType: sessionType,
        messagingToken: null,
        lastSyncTs: currTs
    });

    try{
        await consortiumUserSession.save();
        userKey = AppCommonService.generateConsortiumUserKeyForRequest(consortiumId, consortiumUserId, sessionToken);
        return userKey;
    }catch(e){
        // return a Error message describing the reason
        throw Error("Error while Saving ConsortiumUser Session " + e)
    }
}


exports.removeConsortiumUserSession = async function(req) {
    const consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);
    const sessionToken = await AppCommonService.getConsortiumUserSessionTokenFromRequest(req);

    var options = {
        consortiumUser: consortiumUserId,
        sessionToken: sessionToken
    };

    try {
        await ConsortiumUserSession.deleteOne(options);
    } catch (e) {
        throw Error('Error while Removing consortiumUser Session ' + e);
    }
}

exports.updateConsortiumUserSessionsMessagingToken = async function(consortiumUserId, sessionToken, msgToken) {
    if(msgToken && msgToken !== undefined || msgToken !== null)
    {
        var fetchOptions = {
            consortiumUser: consortiumUserId,
            sessionToken: sessionToken
        };

        try {
            let consortiumUserSession = await ConsortiumUserSession.findOne(fetchOptions);

            if(consortiumUserSession) {
                consortiumUserSession.messagingToken = msgToken;
                await consortiumUserSession.save();
            }
        } catch (e) {
            throw Error('Error while Updating consortiumUser Session ' + e);
        }
    }
}

exports.getConsortiumUserSessionsByMessagingToken = async function(consortiumUserId, msgToken,sessionType) {
    let consortiumUserSessions;
    if(mongodb.ObjectId.isValid(consortiumUserId))
    {
        var fetchOptions = 
        {
            consortiumUser: consortiumUserId,
            messagingToken: msgToken,
            sessionType : sessionType,
        };

        try 
        {
            consortiumUserSessions = await ConsortiumUserSession.find(fetchOptions);
        } 
        catch (e) 
        {
            throw Error('Error while Updating consortiumUserSessions ' + e);
        }
    }
    return consortiumUserSessions;
}



exports.removeConsortiumUserSessionById = async function(consortiumUserSessionId) {
    var options = {
        _id: consortiumUserSessionId
    };

    try {
        let consortiumUserSession;
        if(mongodb.ObjectId.isValid(consortiumUserSessionId))
        {
            consortiumUserSession = await ConsortiumUserSession.findOne(options).remove();
        }
        return consortiumUserSession;
    } catch (e) {
        throw Error('Error while Removing consortiumUserSession ' + e);
    }
}

exports.getConsortiumUserSessionForRequest = async function(consortiumUserId, sessionToken) {
    let consortiumUserSession;
    if(mongodb.ObjectId.isValid(consortiumUserId))
    {
        var fetchOptions = 
        {
            consortiumUser: consortiumUserId,
            sessionToken: sessionToken
        };

        try 
        {
            consortiumUserSession = await ConsortiumUserSession.findOne(fetchOptions);
        } 
        catch (e) 
        {
            throw Error('Error while Updating consortiumUser Session ' + e);
        }
    }
    return consortiumUserSession;
}

exports.removeAllConsortiumUserSessions = async function(consortiumUserId, sessionType) {
    var options = {
        consortiumUser: consortiumUserId
    };

    if(sessionType !== undefined && sessionType !== '')
    options.sessionType = sessionType;

    try {
        await ConsortiumUserSession.find(options).remove();
    } catch (e) {
        throw Error('Error while Removing consortiumUser Sessions ' + e);
    }
}

exports.getAllConsortiumUserSessionsForMessaging = async function(consortiumUserId) {
  
    var options = {
        consortiumUser: consortiumUserId
    };

    try {
        var consortiumUserSessions = await ConsortiumUserSession.find(options);
        return consortiumUserSessions;
    } catch (e) {
        throw Error('Error while Fetching consortiumUser Sessions ' + e);
    }
}


exports.saveConsortiumUserAppAccessedDetails = async function(req) 
{
    const decConsortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);
    const sessionToken = await AppCommonService.getConsortiumUserSessionTokenFromRequest(req);
    if(mongodb.ObjectId.isValid(decConsortiumUserId) && sessionToken !== undefined && sessionToken !== '')
    {
        try 
        {
            var consortiumUserFetchOptions = {
                _id: decConsortiumUserId,
                isDeleted: 0
            };

            let consortiumUser = await ConsortiumUser.findOne(consortiumUserFetchOptions);
            if(consortiumUser)
            {
                var sessionFetchOptions = {
                    consortiumUser: decConsortiumUserId,
                    sessionToken: sessionToken
                };

                let consortiumUserSession = await ConsortiumUserSession.findOne(sessionFetchOptions);
                if(consortiumUserSession) 
                {
                    const currTs = AppCommonService.getCurrentTimestamp();

                    consortiumUserSession.lastSyncTs = currTs;
                    await consortiumUserSession.save();

                    consortiumUser.appLastAccessedAt = currTs;
                    await consortiumUser.save();
                }
            }
        } 
        catch (e) 
        {
            throw Error('Error while Removing User Session ' + e);
        }
    }
}

exports.updatePassword = async function(req, userId, password)
{
    try{
        var consortiumUser = await exports.getConsortiumUserBaseObjectById(userId, false);
    }
    catch(e){
        throw Error("Error occured while Finding the User")
        return null;
    }

    if(!consortiumUser){
        return null;
    }

    const currTs = await AppCommonService.getCurrentTimestamp();
    consortiumUser.password = password;
    consortiumUser.updatedAt = currTs;

    try{
        const savedConsortiumUser = await consortiumUser.save()
        await AppMailService.sendConsortiumUserPasswordChangedMail(savedConsortiumUser);
        return savedConsortiumUser;
    }catch(e){
        throw Error("Error occured while changing ConsortiumUser password" + e);
        return null;
    }
}

generatedOTP = function() {
    return  Math.floor(1000 + Math.random() * 9000);
}

exports.getConsortiumUserEmailVerificationOtp = async function(consortiumUserId) {
    var options = {
        consortiumUser: consortiumUserId,
        otpForEmail: true
    };

    try {
        const consortiumUserOtp = await ConsortiumUserOtp.findOne(options);
        let otp = "";
        if(consortiumUserOtp) {
          otp = consortiumUserOtp.otp;
        }
        return otp;
    } catch (e) {
        throw Error('Error while fetching ConsortiumUser OTP ' + e)
    }
}

exports.getConsortiumUserResetPasswordOtp = async function(consortiumUserId) {
    var options = {
        consortiumUser: consortiumUserId,
        otpForAction: true
    };

    try {
        const consortiumUserOtp = await ConsortiumUserOtp.findOne(options);
        let otp = "";
        if(consortiumUserOtp) {
          otp = consortiumUserOtp.otp;
        }
        return otp;
    } catch (e) {
        throw Error('Error while fetching ConsortiumUser OTP ' + e)
    }
}



exports.createConsortiumUserEmailVerificationOtp = async function(consortiumUserId) {
    const otp = generatedOTP();
    const otpForEmail = true;
    const otpForAction = false;
  
    await exports.removeExistingConsortiumUserOtps(consortiumUserId, otpForEmail, otpForAction);
    await exports.createConsortiumUserOtp(consortiumUserId, otp, otpForEmail, otpForAction);
  
    return otp;
}
  
  
exports.createConsortiumUserResetPasswordOtp = async function(consortiumUserId) {
    const otp = generatedOTP();
    const otpForEmail = false;
    const otpForAction = true;
  
    await exports.removeExistingConsortiumUserOtps(consortiumUserId, otpForEmail, otpForAction)
    await exports.createConsortiumUserOtp(consortiumUserId, otp, otpForEmail, otpForAction);
  
    return otp;
}


exports.removeExistingConsortiumUserOtps = async function(consortiumUserId, otpForEmail, otpForAction) {
    var options = {
        consortiumUser: consortiumUserId,
        otpForEmail: otpForEmail,
        otpForAction: otpForAction
    };

    try {
        await ConsortiumUserOtp.find(options).remove();
    } catch (e) {
        throw Error('Error while Removing User OTP ' + e);
    }
}

exports.createConsortiumUserOtp = async function(consortiumUserId, otp, otpForEmail, otpForAction) {
    var consortiumUserOtp = new ConsortiumUserOtp({
        consortiumUser: consortiumUserId,
        otp: otp,
        otpForEmail: otpForEmail,
        otpForAction: otpForAction
    });

    try{
        await consortiumUserOtp.save();
    }catch(e){
        // return a Error message describing the reason
        throw Error("Error while Saving User OTP " + e)
    }
}

exports.getConsortiumUserMessagingTokenArr = async function(consortiumUserId) {
    let consortiumUserSessions;
    if(mongodb.ObjectId.isValid(consortiumUserId))
    {
        let selectArr = [ 'messagingToken','-_id' ];

        var fetchOptions =  {
            consortiumUser: consortiumUserId,
            messagingToken : { '$ne': null,"$exists":true},
        };

        try 
        {
            consortiumUserSessions = await ConsortiumUserSession.find(fetchOptions).select(selectArr);
            let messagingTokenArr = consortiumUserSessions.map(({messagingToken}) => messagingToken+'');
          
            messagingTokenArr = Array.from(new Set(messagingTokenArr));

            return messagingTokenArr;
        } 
        catch (e) 
        {
            throw Error('Error while Updating consortiumUserSessions ' + e);
        }
    }
    
}
