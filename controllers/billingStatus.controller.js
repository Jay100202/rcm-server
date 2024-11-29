
var BillingStatusService = require("../services/billingStatus.service");
var AppConfigModule = require('../appconfig-module')
var AppConfigModuleName = require('../appconfig-module-name');
var AppCommonService = require('../services/appcommon.service')


// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_CLAIM;
var thisModulename = AppConfigModuleName.MOD_CLAIM;



exports.billingStatusList = async(req,res)=>{
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
                let billingStatus = await BillingStatusService.billingStatusList(req);

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
                resMsg = "Billing Status could not be fetched" + e;
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

exports.createBillingStatus = async(req,res)=>{
   
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if( !hasAddRights || !hasEditRights )
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try 
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                let savedBillingStatus = await BillingStatusService.createBillingStatus(req,systemUser._id);

                ///////////////////////////////////////
              
                ////////////////////////////////////////

                if(savedBillingStatus)
                {
                    let savedBillingStatusId = savedBillingStatus._id;

                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);
                    responseObj.id = savedBillingStatusId;
                }
                else
                {
                    resStatus = -1;
                    resMsg = AppConfigNotif.SERVER_ERROR;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Billing Status Retrieval Unsuccesful " + e;
            }
        }
    }    

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
}

exports.updateBillingStatus = async(req,res)=>{
   
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if( !hasAddRights || !hasEditRights )
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try 
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                const id = req.params.id;

                let updatedBillingStatus = await BillingStatusService.updateBillingStatus(req,systemUser._id);

                ///////////////////////////////////////
              
                ////////////////////////////////////////

                if(updatedBillingStatus)
                {
                    let updatedBillingStatusId = updatedBillingStatus._id;

                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);
                    responseObj.id = updatedBillingStatusId;
                }
                else
                {
                    resStatus = -1;
                    resMsg = AppConfigNotif.SERVER_ERROR;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Billing Status Retrieval Unsuccesful " + e;
            }
        }
    }    

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
}

exports.deleteBillingStatus = async(req,res)=>{
    var Id = req.params.id;
console.log("opoppop",Id)
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
  
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
  
    if(!systemUser)
    {
          resStatus = -1;
          resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(Id != "")
    {
      var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_DELETE);
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
  
                      let deleteBillingStatus = await BillingStatusService.deleteBillingStatus(Id,systemUser._id);
                      resStatus = 1;
                      resMsg = AppCommonService.getDeletedMessage(thisModulename);     
          }
          catch(e)
          {
              resStatus = -1;
              resMsg = "Billing Status Deletion Unsuccesful" + e;
          }
      }
    }
    else
    {
          resStatus = -1;
          resMsg = AppConfigNotif.INVALID_DATA;
    }
  
    return res.status(httpStatus).json({status: resStatus, message: resMsg});
}