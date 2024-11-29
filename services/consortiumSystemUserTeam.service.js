var ConsortiumSystemUserTeam = require('../models/consortiumSystemUserTeam.model');
var SystemUser = require('../models/systemUser.model');
var AppConfig = require('../appconfig');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');


// Saving the context of this module inside the _the variable
_this = this

// Async function to add ConsortiumSystemUserTeam
exports.saveConsortiumSystemUserTeam = async function(consortiumSystemUserTeam)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modConsortiumSystemUserTeam = null;
    if(mongodb.ObjectId.isValid(consortiumSystemUserTeam.id))
    {
        try
        {
            modConsortiumSystemUserTeam = await ConsortiumSystemUserTeam.findById(consortiumSystemUserTeam.id);
        }
        catch(e){
            throw Error("Error occured while Finding the ConsortiumSystemUserTeam")
        }
    }

    let isAdd = false;
    if(!modConsortiumSystemUserTeam){
        modConsortiumSystemUserTeam = new ConsortiumSystemUserTeam();
        modConsortiumSystemUserTeam.createdAt = currTs;
        modConsortiumSystemUserTeam.createdBy = consortiumSystemUserTeam.createdBy;

        isAdd = true;
    }

    modConsortiumSystemUserTeam.updatedAt = currTs;
    modConsortiumSystemUserTeam.updatedBy = consortiumSystemUserTeam.updatedBy;

    if(consortiumSystemUserTeam.consortium !== undefined)
    modConsortiumSystemUserTeam.consortium = consortiumSystemUserTeam.consortium

    if(consortiumSystemUserTeam.systemUser !== undefined)
    modConsortiumSystemUserTeam.systemUser = consortiumSystemUserTeam.systemUser


    try{
        var savedConsortiumSystemUserTeam = await modConsortiumSystemUserTeam.save();
        if(savedConsortiumSystemUserTeam)
        {
            savedConsortiumSystemUserTeam = JSON.parse(JSON.stringify(savedConsortiumSystemUserTeam));
            savedConsortiumSystemUserTeam.isAdd = isAdd;
        }
        return savedConsortiumSystemUserTeam;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumSystemUserTeam "+ e);
    }
}


exports.findConsortiumSystemUserTeamById = async function(consortiumSystemUserTeamId){
    
     const populateOptions = [
        {
            path : 'consortium',
            select : 'consortiumName'
        },
        {
            path : 'systemUser',
            select : 'userFullName'
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
    
     var options = {};

    if(mongodb.ObjectId.isValid(consortiumSystemUserTeamId))
    {
        options._id = new mongoose.Types.ObjectId(consortiumSystemUserTeamId)
    }
 
     try {
        var consortiumSystemUserTeam;
        if(mongodb.ObjectId.isValid(consortiumSystemUserTeamId))
        {
            consortiumSystemUserTeam = await ConsortiumSystemUserTeam.findOne(options).populate(populateOptions);
        }
        return consortiumSystemUserTeam;
     } catch (e) {
         throw Error('Error while Fetching ConsortiumSystemUserTeam' + e)
     }
}


exports.findConsortiumSystemUserTeamByConsortiumId = async function(consortiumId,withPopulation = true){
    
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
                path : 'systemUser',
                select : '-password',
                populate : [
                    {
                        path : 'role',
                        select : 'roleName'
                    },
                    {
                        path : 'transcriptorRole',
                        select : 'roleName'
                    },
                    {
                        path : 'gender',
                        select : 'genderName'
                    },
                    {
                        path : 'designation',
                        select : 'designationName'
                    },
                    {
                        path : 'department',
                        select : 'departmentName'
                    },
                ]
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
        consortium : new mongoose.Types.ObjectId(consortiumId),
        isDeleted : 0,
    };

    try {
       var consortiumSystemUserTeams;
       if(mongodb.ObjectId.isValid(consortiumId))
       {
        consortiumSystemUserTeams = await ConsortiumSystemUserTeam.find(options).populate(populateOptions);
       }
       return consortiumSystemUserTeams;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumSystemUserTeam' + e)
    }
}


exports.removeConsortiumSystemUserTeam = async function(consortiumSystemUserTeamId){
    
    var options = {
        _id : new mongoose.Types.ObjectId(consortiumSystemUserTeamId),
    };

    try {
       if(mongodb.ObjectId.isValid(consortiumSystemUserTeamId))
       {
         let consortiumSystemUserTeam = await ConsortiumSystemUserTeam.findOne(options);
         if(consortiumSystemUserTeam)
         {
            return await consortiumSystemUserTeam.remove();
         }
       }
    } catch (e) {
        throw Error('Error while Fetching ConsortiumSystemUserTeam' + e)
    }
}

exports.findConsortiumSystemUserTeamByConsortiumIdAndSystemUserId = async function(consortiumId,systemUserId){

    var options = {
        consortium : new mongoose.Types.ObjectId(consortiumId),
        systemUser : new mongoose.Types.ObjectId(systemUserId),
        isDeleted : 0,
    };

    try {
       var consortiumSystemUserTeam;
       if(mongodb.ObjectId.isValid(consortiumId) && mongodb.ObjectId.isValid(systemUserId))
       {
        consortiumSystemUserTeam = await ConsortiumSystemUserTeam.findOne(options);
       }
       return consortiumSystemUserTeam;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumSystemUserTeam' + e)
    }
}



exports.getConsortiumSystemUsersForSelect = async function(req){
    
    var forConsortium =  req.body.forConsortium;

    let selectArr = [ 'systemUser','-_id' ];

    var fetchOptions = {
        isDeleted : 0,
    };

    if(mongodb.ObjectId.isValid(forConsortium)) {
        fetchOptions.consortium = new mongoose.Types.ObjectId(forConsortium);
    }

    try {

        var users = [];
       var consortiumSystemUserTeams = await ConsortiumSystemUserTeam.find(fetchOptions).select(selectArr);
       let consortiumSystemUserIdArr = [];
       if(consortiumSystemUserTeams && consortiumSystemUserTeams.length > 0)
       {
            consortiumSystemUserIdArr = consortiumSystemUserTeams.map(({systemUser}) => systemUser);

            const projectObj = {
                '_id': '$_id',
                'id': '$_id',
                'text': '$userFullName',
                'textI': { '$toLower': '$userFullName' }
            };
        
            const sortOptions = {};
            sortOptions.textI = 1;
        
            let options = {
                _id : { '$in' : consortiumSystemUserIdArr}
            };
            options.isActive =  1;
            options.isDeleted = 0;
        
            users = await SystemUser.aggregate([ { $match: options } ])
                                        .project(projectObj)
                                        .sort(sortOptions);


            users.forEach(function(v){
                                    delete v._id;
                                    delete v.textI;
                                });

       }
       return users;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumSystemUserTeam' + e)
    }
}



exports.getConsortiumSystemUserIdArrByConsortiumId = async function(consortiumId){
  
    let selectArr = [ 'systemUser','-_id' ];

    var fetchOptions = {
        isDeleted : 0,
    };

    if(mongodb.ObjectId.isValid(consortiumId))
    {
        fetchOptions.consortium = new mongoose.Types.ObjectId(consortiumId)
    }

    // var consortiumSystemUserMongoIdArr = [];
    // if(systemUserIdArr !== undefined && systemUserIdArr.length > 0)
    // {
    //     systemUserIdArr.forEach((consortiumSystemUserId) => {
    //         if(mongodb.ObjectId.isValid(consortiumSystemUserId))
    //         {
    //             consortiumSystemUserMongoIdArr.push(new mongoose.Types.ObjectId(consortiumSystemUserId));
    //         }
    //     });
    // }

    // if(consortiumSystemUserMongoIdArr && consortiumSystemUserMongoIdArr.length > 0)
    // {
    //     fetchOptions.systemUser = { '$in' : consortiumSystemUserMongoIdArr}
    // }

    var consortiumSystemUserTeams = await ConsortiumSystemUserTeam.find(fetchOptions).select(selectArr);
       
    let consortiumSystemUserIdArr = [];
    if(consortiumSystemUserTeams && consortiumSystemUserTeams.length > 0)
    {
         consortiumSystemUserIdArr = consortiumSystemUserTeams.map(({systemUser}) => systemUser+"");
    }

    return consortiumSystemUserIdArr;
}

exports.getConsortiumSystemUsersForPreloadData = async function(consortiumArr){
    
    var includMongoIdArr = [];
    if(consortiumArr !== undefined && consortiumArr.length > 0)
    {
        consortiumArr.forEach((incId) => {
            if(mongodb.ObjectId.isValid(incId))
            {
                includMongoIdArr.push(new mongoose.Types.ObjectId(incId));
            }
        });
    }


    let selectArr = [ 'systemUser','-_id' ];

    var fetchOptions = {
        isDeleted : 0,
    };

    if(includMongoIdArr && includMongoIdArr.length > 0)
    {
        fetchOptions.consortium = { '$in' : includMongoIdArr}
    }

    try {

        var users = [];
       var consortiumSystemUserTeams = await ConsortiumSystemUserTeam.find(fetchOptions).select(selectArr);
       
       let consortiumSystemUserIdArr = [];
       if(consortiumSystemUserTeams && consortiumSystemUserTeams.length > 0)
       {
            consortiumSystemUserIdArr = consortiumSystemUserTeams.map(({systemUser}) => systemUser);

            const projectObj = {
                '_id': '$_id',
                'id': '$_id',
                'text': '$userFullName',
                'textI': { '$toLower': '$userFullName' }
            };
        
            const sortOptions = {};
            sortOptions.textI = 1;
        
            let options = {
                _id : { '$in' : consortiumSystemUserIdArr},
            };
            
            options.isActive =  1;
            options.isDeleted = 0;
        
            users = await SystemUser.aggregate([ { $match: options } ])
                                        .project(projectObj)
                                        .sort(sortOptions);


            users.forEach(function(v){
                                    delete v._id;
                                    delete v.textI;
                                });

       }
       return users;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumSystemUserTeam' + e)
    }
}

exports.getConsortiumIdArrBySystemUserId = async function(systemUserId){
    let consortiumIdArr = [];
    if(mongodb.ObjectId.isValid(systemUserId))
    {
        let selectArr = [ 'consortium','-_id' ];
    
        var fetchOptions = {
            isDeleted : 0,
        };

        fetchOptions.systemUser = new mongoose.Types.ObjectId(systemUserId);

        var consortiumSystemUserTeams = await ConsortiumSystemUserTeam.find(fetchOptions).select(selectArr);

        if(consortiumSystemUserTeams && consortiumSystemUserTeams.length > 0)
        {
             consortiumIdArr = consortiumSystemUserTeams.map(({consortium}) => consortium + "");
        }
    }
    return consortiumIdArr;
}
