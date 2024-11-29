var ActivityPriorityService = require('../services/activityPriority.service')
var AppCommonService = require('../services/appcommon.service')
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppMailService = require('../services/appMail.service')
var AppUploadService = require('../services/appUpload.service')
var AppConfigModuleName = require('../appconfig-module-name');
var _ = require('lodash')
var AppConfigConst = require('../appconfig-const')
var mongodb = require("mongodb");
var mongoose = require('mongoose');

// Saving the context of this module inside the _the variable

_this = this


exports.selectActivityPriorityList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let activityPriorityData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        try
        {
            if(isConsortiumUserRequest === true)
            {   
                await AppCommonService.setConsortiumUserAppAccessed(req);
            }
            else
            {
                await AppCommonService.setSystemUserAppAccessed(req);
            }

            let activityPriorityList = await ActivityPriorityService.getActivityPrioritiesForSelect();

            resStatus = 1;
            if(activityPriorityList != null)
            {
                totalRecords = activityPriorityList.length;
                activityPriorityData = activityPriorityList;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "SystemUsers could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = activityPriorityData;

    return res.status(httpStatus).json(responseObj)
}