var ConsortiumChatThread = require('../models/consortiumChatThread.model');
var Consortium = require('../models/consortium.model');
var ConsortiumChatThreadMessage = require('../models/consortiumChatThreadMessage.model');
var ConsortiumService = require('./consortium.service');
var ConsortiumChatUserTypeService = require('./consortiumChatUserType.service');
var ConsortiumSystemUserTeamService = require('./consortiumSystemUserTeam.service');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var AppConfigModule = require('../appconfig-module')
var mongodb = require("mongodb");
var mongoose = require('mongoose');
const { select } = require('async');


// Saving the context of this module inside the _the variable
_this = this
var thisModule = AppConfigModule.MOD_CONSORTIUM_CHAT_THREAD;

// Async function to add ConsortiumChatThread
exports.saveConsortiumChatThread = async function(consortiumChatThread)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modConsortiumChatThread = null;
    if(mongodb.ObjectId.isValid(consortiumChatThread.id))
    {
        try
        {
            modConsortiumChatThread = await ConsortiumChatThread.findById(consortiumChatThread.id);
        }
        catch(e){
            throw Error("Error occured while Finding the ConsortiumChatThread")
        }
    }

    let isAdd = false;
    if(!modConsortiumChatThread){
        modConsortiumChatThread = new ConsortiumChatThread();
        modConsortiumChatThread.createdAt = currTs;

        if(consortiumChatThread.createdBySystemUser !== undefined)
        modConsortiumChatThread.createdBySystemUser = consortiumChatThread.createdBySystemUser

        if(consortiumChatThread.createdByConsortiumUser !== undefined)
        modConsortiumChatThread.createdByConsortiumUser = consortiumChatThread.createdByConsortiumUser

        if(consortiumChatThread.createdByUserType !== undefined)
        modConsortiumChatThread.createdByUserType = consortiumChatThread.createdByUserType

        let consortiumThreadId;
        if(consortiumChatThread.consortiumThreadId !== undefined)
        {
            consortiumThreadId = consortiumChatThread.consortiumThreadId;
        }
        else
        {
            consortiumThreadId = await AppCommonService.generateConsortiumChatThreadId(consortiumChatThread.consortium);
        }

        modConsortiumChatThread.consortiumThreadId = consortiumThreadId;


        isAdd = true;
    }

    modConsortiumChatThread.updatedAt = currTs;
    
    if(consortiumChatThread.updatedByUserType !== undefined)
    modConsortiumChatThread.updatedByUserType = consortiumChatThread.updatedByUserType

    if(consortiumChatThread.updatedBySystemUser !== undefined)
    modConsortiumChatThread.updatedBySystemUser = consortiumChatThread.updatedBySystemUser

    if(consortiumChatThread.updatedByConsortiumUser !== undefined)
    modConsortiumChatThread.updatedByConsortiumUser = consortiumChatThread.updatedByConsortiumUser

    if(consortiumChatThread.consortium !== undefined)
    modConsortiumChatThread.consortium = consortiumChatThread.consortium

    if(consortiumChatThread.topic !== undefined)
    modConsortiumChatThread.topic = consortiumChatThread.topic

    if(consortiumChatThread.latestMsgExcerpt !== undefined)
    modConsortiumChatThread.latestMsgExcerpt = consortiumChatThread.latestMsgExcerpt


    if(consortiumChatThread.latestMsgReceivedAt !== undefined)
    modConsortiumChatThread.latestMsgReceivedAt = consortiumChatThread.latestMsgReceivedAt

    if(consortiumChatThread.consortiumChatStatus !== undefined)
    modConsortiumChatThread.consortiumChatStatus = consortiumChatThread.consortiumChatStatus

    if(consortiumChatThread.isResolved !== undefined)
    modConsortiumChatThread.isResolved = consortiumChatThread.isResolved

    if(consortiumChatThread.isClosed !== undefined)
    modConsortiumChatThread.isClosed = consortiumChatThread.isClosed

    if(consortiumChatThread.isDeleted !== undefined)
    modConsortiumChatThread.isDeleted = consortiumChatThread.isDeleted


    try{
        var savedConsortiumChatThread = await modConsortiumChatThread.save();
        if(savedConsortiumChatThread)
        {
            savedConsortiumChatThread = JSON.parse(JSON.stringify(savedConsortiumChatThread));
            savedConsortiumChatThread.isAdd = isAdd;
        }
        return savedConsortiumChatThread;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumChatThread "+ e);
    }
}

exports.getCurrentHighestConsortiumChatThreadId = async function(consortiumId){

	let selectArr = [ 'consortiumThreadId' ];

    let sortOptions = {
    	consortiumThreadId: -1
	};

    var options = {
        isDeleted : 0,
        consortium : new mongoose.Types.ObjectId(consortiumId),
    };

    try {
        let highestConsortiumChatThreadId = 0;
        var consortiumChatThread = await ConsortiumChatThread.findOne(options).sort(sortOptions).select(selectArr);
        if(consortiumChatThread) {
            highestConsortiumChatThreadId = consortiumChatThread.consortiumThreadId;
        }
      return highestConsortiumChatThreadId;
    } catch (e) {
        throw Error('Error while Fetching consortiumPatient' + e)
    }
}

// Async function to get the ConsortiumChatThreads List
exports.getConsortiumChatThreads = async function(req, listCode)
{
    var filKeyword =  req.body.filKeyword;
    var filCreatedBy = req.body.filCreatedBy;
    var filUpdatedBy = req.body.filUpdatedBy;
    var filConsortium =  req.body.filConsortium;
   
    var forExport = req.body.forExport && typeof req.body.forExport === 'boolean' ? req.body.forExport : false;

    var page = req.body.page ? req.body.page*1 : 1;
    var limit = req.body.length ? req.body.length*1 : 10;
    var searchStr = req.body.searchStr ? req.body.searchStr : '';
    var sortByCol = req.body.sortBy ? req.body.sortBy : '';
    var sortOrder = req.body.sortOrder ? req.body.sortOrder : 'desc';

    var skipVal = req.body.start ? req.body.start*1 : 0;

    if(page && page > 0)
    {
      skipVal = (page - 1) * limit;
    }

    var isConsortiumUserRequest = AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);
    var consortiumId = await AppCommonService.getConsortiumIdFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
    
    const consUserTypeIdForConsortium = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_CONSORTIUM_USER);
    const consUserTypeIdForSystem = await ConsortiumChatUserTypeService.findConsortiumChatUserTypeIdByCode(AppConfigConst.CONSORTIUM_CHAT_USER_TYPE_CODE_SYSTEM_USER);

    var consortiumUserMongoId;
    var systemUserMongoId;
    var systemUserHasViewAllRights = false;
    var systemUserAccessibleConsortiumMongoIdArr = [];
    if(isConsortiumUserRequest === true)
    {
        if(mongodb.ObjectId.isValid(consortiumUserId))
        {
            consortiumUserMongoId = new mongoose.Types.ObjectId(consortiumUserId);
        }
    }
    else
    {
        var systemUser = await AppCommonService.getSystemUserFromRequest(req);
        if(mongodb.ObjectId.isValid(systemUserId))
        {
            systemUserHasViewAllRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW_ALL);
            if(systemUserHasViewAllRights === false)
            {
                const systemUserAccessibleConsortiumIdArr = await ConsortiumSystemUserTeamService.getConsortiumIdArrBySystemUserId(systemUserId);

                systemUserAccessibleConsortiumIdArr.forEach((systemUserAccessibleConsortiumId) => {
                    systemUserAccessibleConsortiumMongoIdArr.push(new mongoose.Types.ObjectId(systemUserAccessibleConsortiumId));
                });

                if(mongodb.ObjectId.isValid(filConsortium))
                {
                    if(systemUserAccessibleConsortiumIdArr.indexOf(filConsortium + "") === -1)
                    {
                        filConsortium = null;
                    }
                }
            }
    
            systemUserMongoId = new mongoose.Types.ObjectId(systemUserId);
        }
    }

    var consortiumMongoId;
    if(mongodb.ObjectId.isValid(consortiumId))
    {
        consortiumMongoId = new mongoose.Types.ObjectId(consortiumId);
    }

    // Options setup for the mongoose paginate
    const populateOptions = [
        {
            path : 'consortium',
            select : 'consortiumName'
        },
        {
            path : 'consortiumChatStatus',
            select : 'statusText colorCode'
        }
    ];

    const consortiumChatThreadPrefix = AppCommonService.getConsortiumChatThreadPrefixText(req);

    const projectObj = {
        '_id': '$_id',
        'consortiumThreadIdInt': '$consortiumThreadId',
        'consortiumThreadId': { '$concat': [ consortiumChatThreadPrefix, { $substr: ["$consortiumThreadId", 0, -1 ] } ] },
        'topic': '$topic',
        'topicI': { '$toLower': '$topic' },
        'consortium': '$consortium',
        'latestMsgExcerpt': '$latestMsgExcerpt',
        'latestMsgReceivedAt': '$latestMsgReceivedAt',
        'consortiumChatStatus': '$consortiumChatStatus',
        'isResolved': '$isResolved',
        'isClosed': '$isClosed',
        'createdAt': '$createdAt',
        'updatedAt': '$updatedAt',
        'isSelfInitiator': { $cond: { if: { $or: [ { $and : [ { $eq: [ "$createdByUserType", consUserTypeIdForConsortium ] }, { $eq: [ isConsortiumUserRequest, true ] }, { $eq: [ '$createdByConsortiumUser', consortiumUserMongoId ] } ] }, { $and : [ { $eq: [ "$createdByUserType", consUserTypeIdForSystem ] }, { $eq: [ isConsortiumUserRequest, false ] }, { $eq: [ '$createdBySystemUser', systemUserMongoId ] } ] } ] } , then: true, else: false } },
        'consortiumLP': '$consortiumLP',
        'consortiumChatThreadMessageLP': '$consortiumChatThreadMessageLP'
    };

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;   

    if(listCode === AppConfigConst.CHAT_THREAD_STATUS_CODE_OPEN)
    {
        fetchOptions.isClosed = false;
    }
    else if(listCode === AppConfigConst.CHAT_THREAD_STATUS_CODE_CLOSED)
    {
        fetchOptions.isClosed = true;
    }

    if(isConsortiumUserRequest === true)
    {
        fetchOptions.consortium = new mongoose.Types.ObjectId(consortiumMongoId);
    }
    else
    {
        if(systemUserHasViewAllRights === true)
        {
            if(mongodb.ObjectId.isValid(filConsortium)) 
            {
                fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
            }
        }
        else
        {
            if(mongodb.ObjectId.isValid(filConsortium)) 
            {
                fetchOptions.consortium = filConsortium;
            }
            else
            {
                fetchOptions.consortium = { $in: systemUserAccessibleConsortiumMongoIdArr }; 
            }
        }        
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

    let hasConsortiumLookup = false;
    let hasConsortiumChatThreadMessageLookup = false;

    if(searchStr && searchStr !== "")
    {
        var regex = new RegExp(searchStr, "i");

        let searchKeywordOptions = [];
        searchKeywordOptions.push({ 'topic' : regex });

        hasConsortiumLookup = true;
        searchKeywordOptions.push({ 'consortiumLP.consortiumName' : regex });

        hasConsortiumChatThreadMessageLookup = true;
        searchKeywordOptions.push({ 'consortiumChatThreadMessageLP.messageText' : regex });

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
                consortiumThreadIdInt: sortOrderInt
            };
        }
        else if(sortByCol == 'col2') {
            sortOptions = {
                topicI: sortOrderInt
            };
        }
        else if(sortByCol == 'col3') {
            sortOptions = {
                latestMsgReceivedAt: sortOrderInt
            };
        }
        else if(sortByCol == 'col4') {
            sortOptions = {
                updatedAt: sortOrderInt
            };
        }        
    }
    else {
        sortOptions = {
            latestMsgReceivedAt: sortOrderInt
        };
    }

    const consortiumLookup = {
        from: Consortium.collection.name,
        localField: "consortium",
        foreignField: "_id",
        as: "consortiumLP"
    };

    const consortiumChatThreadMessageLookup = {
        from: ConsortiumChatThreadMessage.collection.name,
        localField: "_id",
        foreignField: "consortiumChatThread",
        as: "consortiumChatThreadMessageLP"
    };

    try 
    {
        let aggregationParamArr = [];

        if(hasConsortiumLookup)
        {
            aggregationParamArr.push({
                $lookup: consortiumLookup
            });
        }

        if(hasConsortiumChatThreadMessageLookup)
        {
            aggregationParamArr.push({
                $lookup: consortiumChatThreadMessageLookup
            });
        }

        aggregationParamArr.push({
            $match: fetchOptions
        });

        let consortiumChatThreads;
        if(forExport === true)
        {
            consortiumChatThreads = await ConsortiumChatThread.aggregate(aggregationParamArr)
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            consortiumChatThreads = await ConsortiumChatThread.aggregate(aggregationParamArr)
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        consortiumChatThreads = await ConsortiumChatThread.populate(consortiumChatThreads, populateOptions);

        var cntAggregationParamArr = aggregationParamArr;
        cntAggregationParamArr.push({
            $group: { _id: null, count: { $sum: 1 } }
        });

        let recordCntData =  await ConsortiumChatThread.aggregate(cntAggregationParamArr);

        let totalRecords = 0;

        if(recordCntData && recordCntData[0] && recordCntData[0].count) {
            totalRecords = recordCntData[0].count;
        }

        let filteredRecords = totalRecords;

        let response = {
            results: consortiumChatThreads,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;

    } 
    catch (e) 
    {
        throw Error('Error while Paginating ConsortiumChatThread ' + e)
    }
}

exports.getConsortiumChatThreadsForSelect = async function(req){

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);

    var filConsortium =  req.body.filConsortium;
   
    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$topic',
        'textI': { '$toLower': '$topic' }
    };

    const sortOptions = {};
    sortOptions.textI = 1;

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;

    if(mongodb.ObjectId.isValid(filConsortium)) {
        fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
    }
    else if(isConsortiumUserRequest === true)
    {
        let consortiumId = consortiumUser.consortium;
        if(mongodb.ObjectId.isValid(consortiumId)) {
            fetchOptions.consortium = new mongoose.Types.ObjectId(consortiumId);
        }
    }

    try {
        var consortiumChatThread = await ConsortiumChatThread.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            consortiumChatThread.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return consortiumChatThread;
    } catch (e) {
        throw Error('Error while Paginating ConsortiumChatThread ' + e)
    }
}

exports.getConsortiumChatThreadByTopic = async function(topic,consortiumId) {
    var options = {
        topic : new RegExp(`^${topic}$`, 'i'),
        isDeleted: 0
    };

    if(consortiumId && consortiumId != '')
    {
        options.consortium = new mongoose.Types.ObjectId(consortiumId)
    }


    try {
        var consortiumChatThread = await ConsortiumChatThread.findOne(options);
        return consortiumChatThread;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThread ' + e)
    }
}

exports.getConsortiumChatThreadBaseObjectById = async function(req, consortiumChatThreadId, withPopulation){
    try {
        var consortiumChatThread;
        if(mongodb.ObjectId.isValid(consortiumChatThreadId))
        {
            var isConsortiumUserRequest = AppCommonService.getIsRequestFromConsortiumUser(req);

            var consortiumMongoId;
            var systemUserHasViewAllRights = false;
            var systemUserAccessibleConsortiumMongoIdArr = [];
            if(isConsortiumUserRequest === true)
            {
                var consortiumId = await AppCommonService.getConsortiumIdFromRequest(req);
                if(mongodb.ObjectId.isValid(consortiumId))
                {
                    consortiumMongoId = new mongoose.Types.ObjectId(consortiumId);
                }
            }
            else
            {
                var systemUser = await AppCommonService.getSystemUserFromRequest(req);
                if(systemUser)
                {
                    const systemUserId = systemUser._id;

                    systemUserHasViewAllRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW_ALL);
                    if(systemUserHasViewAllRights === false)
                    {
                        const systemUserAccessibleConsortiumIdArr = await ConsortiumSystemUserTeamService.getConsortiumIdArrBySystemUserId(systemUserId);

                        systemUserAccessibleConsortiumIdArr.forEach((systemUserAccessibleConsortiumId) => {
                            systemUserAccessibleConsortiumMongoIdArr.push(new mongoose.Types.ObjectId(systemUserAccessibleConsortiumId));
                        });
                    }
                }
            }

            // Options setup for the mongoose paginate
            let populateOptions = [ ];
            if(withPopulation !== undefined && withPopulation === true)
            {
                populateOptions = [
                    {
                        path : 'consortium',
                        select : 'consortiumName'
                    },
                    {
                        path : 'consortiumChatStatus'
                    },
                    {
                        path : 'createdByUserType'
                    },
                    {
                        path : 'createdBySystemUser',
                        select : 'userFullName'
                    },
                    {
                        path : 'createdByConsortiumUser',
                        select : 'userFullName'
                    },
                    {
                        path : 'closedByUserType'
                    },
                    {
                        path : 'closedBySystemUser',
                        select : 'userFullName'
                    },
                    {
                        path : 'closedByConsortiumUser',
                        select : 'userFullName'
                    }
                ];    
            }

            var fetchOptions = {
                _id : consortiumChatThreadId,
                isDeleted : 0
            };

            if(isConsortiumUserRequest === true)
            {
                fetchOptions.consortium = new mongoose.Types.ObjectId(consortiumMongoId);
            }
            else
            {
                if(systemUserHasViewAllRights === false)
                {
                    fetchOptions.consortium = { $in: systemUserAccessibleConsortiumMongoIdArr }; 
                }        
            }

            consortiumChatThread = await ConsortiumChatThread.findOne(fetchOptions).populate(populateOptions);
        }
        return consortiumChatThread;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThread' + e)
    }
}

exports.findConsortiumChatThreadById = async function(req, consortiumChatThreadId, withPopulation = true){
   // Options setup for the mongoose paginate
   try {
    var resConsortiumChatThread;
    if(mongodb.ObjectId.isValid(consortiumChatThreadId))
    {
        var consortiumChatThread = await exports.getConsortiumChatThreadBaseObjectById(req, consortiumChatThreadId, withPopulation);
        if(consortiumChatThread)
        {
            resConsortiumChatThread = JSON.parse(JSON.stringify(consortiumChatThread));
            resConsortiumChatThread.consortiumThreadId = AppCommonService.getConsortiumChatThreadIdWithPrefix(consortiumChatThread.consortiumThreadId);
        }
    }
   return resConsortiumChatThread;
} catch (e) {
    throw Error('Error while Fetching ConsortiumChatThreadBase' + e)
}
}


exports.getConsortiumChatThreadCountByConsortiumId = async function(consortiumId){
    
    var options = {
        consortium : consortiumId,
        isDeleted : 0
    };

    try {
       var consortiumChatThreadCount;
       if(mongodb.ObjectId.isValid(consortiumId))
       {
           consortiumChatThreadCount = await ConsortiumChatThread.find(options).count();
       }
       return consortiumChatThreadCount;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThread' + e)
    }
}

exports.checkIfConsortiumChatThreadUsesConsortium = async function(id) {
    var options = {
        isDeleted: 0,
        consortium: id
    };

    try {
        var consortiumChatThread = await ConsortiumChatThread.findOne(options);
        return consortiumChatThread;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThread ' + e)
    }
}


exports.checkConsortiumChatThreadTopicForDuplication = async function(id, topic,consortiumId) {
    var options = {
        topic : new RegExp(`^${topic}$`, 'i'),
        isDeleted: 0
    };

    if(id && id != '')
    {
        options._id = { $ne : id };
    }

    if(consortiumId && consortiumId != '')
    {
        options.consortium = new mongoose.Types.ObjectId(consortiumId)
    }



    try {
        var consortiumChatThread = await ConsortiumChatThread.findOne(options);
        return consortiumChatThread;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumChatThread ' + e)
    }
}

exports.markConsortiumChatThreadAsClosed = async function(req, consortiumChatThreadId, consortiumChatThreadDetails)
{
    const currTs = AppCommonService.getCurrentTimestamp();

    let modConsortiumChatThread = null;
    if(mongodb.ObjectId.isValid(consortiumChatThreadId))
    {
        try
        {
            modConsortiumChatThread = await exports.getConsortiumChatThreadBaseObjectById(req, consortiumChatThreadId);
        }
        catch(e){
            throw Error("Error occured while Finding the ConsortiumChatThread")
        }
    }

    if(!modConsortiumChatThread){
        return;
    }
    
    modConsortiumChatThread.updatedAt = currTs;
    modConsortiumChatThread.closedAt = currTs;
    modConsortiumChatThread.isClosed = true;
    
    if(consortiumChatThreadDetails.closedByUserType !== undefined)
    modConsortiumChatThread.closedByUserType = consortiumChatThreadDetails.closedByUserType

    if(consortiumChatThreadDetails.closedBySystemUser !== undefined)
    modConsortiumChatThread.closedBySystemUser = consortiumChatThreadDetails.closedBySystemUser

    if(consortiumChatThreadDetails.closedByConsortiumUser !== undefined)
    modConsortiumChatThread.closedByConsortiumUser = consortiumChatThreadDetails.closedByConsortiumUser

    try{
        var savedConsortiumChatThread = await modConsortiumChatThread.save();
        return savedConsortiumChatThread;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumChatThread "+ e);
    }
}

exports.markConsortiumChatThreadAsReopened = async function(req, consortiumChatThreadId)
{
    const currTs = AppCommonService.getCurrentTimestamp();

    let modConsortiumChatThread = null;
    if(mongodb.ObjectId.isValid(consortiumChatThreadId))
    {
        try
        {
            modConsortiumChatThread = await exports.getConsortiumChatThreadBaseObjectById(req, consortiumChatThreadId);
        }
        catch(e){
            throw Error("Error occured while Finding the ConsortiumChatThread")
        }
    }

    if(!modConsortiumChatThread){
        return;
    }
    
    modConsortiumChatThread.updatedAt = currTs;
    modConsortiumChatThread.closedAt = 0;
    modConsortiumChatThread.isClosed = false;
    modConsortiumChatThread.closedByUserType = null;
    modConsortiumChatThread.closedBySystemUser = null;
    modConsortiumChatThread.closedByConsortiumUser = null;
    
    try{
        var savedConsortiumChatThread = await modConsortiumChatThread.save();
        return savedConsortiumChatThread;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumChatThread "+ e);
    }
}
