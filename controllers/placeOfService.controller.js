var PlaceOfServiceService = require("../services/placeOfService.service");
var AppConfigModule = require('../appconfig-module')
var AppConfigModuleName = require('../appconfig-module-name');
var AppCommonService = require('../services/appcommon.service')
const AppConfigNotif = require("../appconfig-notif");

// Saving the context of this module inside the _the variable

_this = this;
var thisModule = AppConfigModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT;
var consortiumBulkDictationModule =
  AppConfigModule.MOD_CONSORTIUM_BULK_DICTATION;
var thisModulename = AppConfigModuleName.MOD_CONSORTIUM_PATIENT_APPOINTMENT;
var thismoduleicdcptname = AppConfigModuleName.MOD_CODER_ICT_CP;



exports.placeOfServiceList = async(req,res)=>{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let BillingStatusData = [];

    var skipSend = AppCommonService.getSkipSendResponseValue(req);
    var forExport = req.body.forExport ? req.body.forExport : false;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    console.log("sssssssssss",systemUser)
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);
                let billingStatus = await PlaceOfServiceService.placeOfServiceList(req);

                resStatus = 1;
                if(billingStatus != null)
                {
                    BillingStatusData = billingStatus;
                }
              
                if(forExport === true)
                {
                    let appFilters = [];
    
                    responseObj.appFilters = appFilters;
                }

            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Place Of Service could not be fetched" + e;
            }
        }

    }
       
    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = BillingStatusData.length;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = BillingStatusData;

    if(skipSend === true) 
    {
      return responseObj;
    }
    else 
    {
      return res.status(httpStatus).json(responseObj);
    }
}

exports.selectPlaceOfServiceList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 1;
    var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;

    let totalRecords = 0;
    let consortiumLocationData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(isConsortiumUserRequest === true)
    {   
        consortium = consortiumUser.consortium;
    }

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        try
        {
           
            await AppCommonService.setSystemUserAppAccessed(req);

            let consortiumLocationList = await PlaceOfServiceService.getSelectPlaceOfServiceList(req,onlyActiveStatus);

            resStatus = 1;
            if(consortiumLocationList != null)
            {
                totalRecords = consortiumLocationList.length;
                consortiumLocationData = consortiumLocationList;

                if(forFilter) {
                    let consortiumLocationObj = {};
                    consortiumLocationObj.id = "";
                    consortiumLocationObj.text = "All ConsortiumLocations";
  
                    consortiumLocationData.unshift(consortiumLocationObj);
                  }
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationLocations could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = consortiumLocationData;

    return res.status(httpStatus).json(responseObj)
}
