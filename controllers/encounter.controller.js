var EncounterService = require('../services/encounter.service')
var AppCommonService = require('../services/appcommon.service')
var EncIcd = require("../services/encIcd.service")
var EncCpt = require("../services/encCpt.service")
var claimDetailService = require("../services/claimDetail.service");
var claimService = require("../services/claim.service");
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppConfigModuleName = require('../appconfig-module-name');

// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_RCM;
var thisModulename = AppConfigModuleName.MOD_RCM;

exports.createEncounter = async function(req,res)
{

    const patientId = req.body.patientId;
   
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
    else if(patientId !== undefined && patientId !== "")
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

                let savedEncounter = await EncounterService.createEncounter(req,systemUser.userFullName);

                ///////////////////////////////////////
                let {patientId, icdDetails, cptDetails} = req.body;

                const icdPromises = icdDetails.map((data) => {
                        EncIcd.createEncIcd(data,patientId,savedEncounter._id);
                  });



                  const cptPromises = cptDetails.map(async (data) => {
                    EncCpt.createEncCpt(data,patientId,savedEncounter._id)
                    let claimDetailData = {
                        patientId: patientId,
                        encounterId: savedEncounter._id,
                        cptId: data.cptId,
                        cptCode: data.cptCode,
                        modifier: data.modifier1,
                        modifier2: data.modifier2,
                        modifier3: data.modifier3,
                        modifier4: data.modifier4,
                        chargeAmount: data.units * data.rate,
                        units: data.units,
                        createdBy: systemUserId,
                    }

                    await claimDetailService.createClaimDetail(claimDetailData);

                  });

                  await Promise.all([...icdPromises, ...cptPromises]);

                  const claimDetails = await claimDetailService.getClaimDetailByEncounterId(savedEncounter._id);
                  const totalChargeAmount = await claimDetails.reduce(
                    (sum, detail) => sum + detail.chargeAmount,
                    0
                  );

                  const existingClaim = await claimService.getClaimByEncounterId(savedEncounter._id)


                  if (existingClaim) {
                    await claimService.updateClaim(existingClaim._id,{ chargeAmount: totalChargeAmount });
                    await claimDetailService.updateManyClaimDetails(savedEncounter._id,existingClaim._id);
                  } else {
                    console.log("totalChargeAmount",totalChargeAmount)
                    let newDataClaim = {
                        encounterId: savedEncounter._id,
                        patientId: patientId,
                        chargeAmount: totalChargeAmount,
                    }
                    await claimService.createClaim(newDataClaim);
                    // await claimDetailService.updateManyClaimDetails(savedEncounter._id,existingClaim._id);
                  }
              
                ////////////////////////////////////////

                if(savedEncounter)
                {
                    let savedEncounterId = savedEncounter._id;

                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);
                    responseObj.id = savedEncounterId;
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
                resMsg = "Encounter Retrieval Unsuccesful " + e;
            }
        }
    }    
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
}

exports.getEncounterList = async(req,res)=>{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let EncounterData = [];

    var skipSend = AppCommonService.getSkipSendResponseValue(req);
    var forExport = req.body.forExport ? req.body.forExport : false;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
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
                let EncounterList = await EncounterService.getEncounterList(req);

                resStatus = 1;
                if(EncounterList != null)
                {
                    EncounterData = EncounterList;
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
                resMsg = "Encounter could not be fetched" + e;
            }
        }

    }
       
    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = EncounterData[0].total;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = EncounterData[0].data;

    if(skipSend === true) 
    {
      return responseObj;
    }
    else 
    {
      return res.status(httpStatus).json(responseObj);
    }
}

exports.getEncounterByStatus = async(req,res)=>{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let EncounterData = [];

    var skipSend = AppCommonService.getSkipSendResponseValue(req);
    var forExport = req.body.forExport ? req.body.forExport : false;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
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
                let EncounterList = await EncounterService.getEncounterByStatus(req);

                resStatus = 1;
                if(EncounterList != null)
                {
                    EncounterData = EncounterList;
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
                resMsg = "Encounter could not be fetched" + e;
            }
        }

    }
       
    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = EncounterData[0].total;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = EncounterData[0].data;

    if(skipSend === true) 
    {
      return responseObj;
    }
    else 
    {
      return res.status(httpStatus).json(responseObj);
    }
}

exports.updateEncounter = async(req,res)=>{
    
    const patientId = req.body.patientId;
   
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
    else if(patientId !== undefined && patientId !== "")
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
                const {
                  patientId,
                  icdDetails,
                  cptDetails,
                } = req.body;

                let updatedEncounter = await EncounterService.updateEncounter(req);

                ///////////////////////////////////////
              
                if (icdDetails && icdDetails.length > 0) {
                    const existingIcdDetails = await EncIcd.getEncIcdByEncounterId(id);
              
                    const newIcdDetails = icdDetails.filter((detail) => !detail._id);
                    const updatedIcdDetails = icdDetails.filter((detail) => detail._id);
              
                    // Create new icd_details
                    const newIcdPromises = newIcdDetails.map((data) => {
                      EncIcd.createEncIcd(data,patientId,updatedEncounter._id);
                    });
              
                    // Update existing icd_details
                    const updateIcdPromises = updatedIcdDetails.map((data) => {
                      return EncIcd.updateEncIcd(data._id, data);
                    });
              
                    // Delete icd_details not in the update list
                    const updateIcdIds = updatedIcdDetails.map((detail) => detail._id);
                    const deleteIcdPromises = existingIcdDetails
                      .filter((detail) => !updateIcdIds.includes(detail._id.toString()))
                      .map((detail) => EncIcd.deleteEncIcd(detail._id));
              
                    await Promise.all([
                      ...newIcdPromises,
                      ...updateIcdPromises,
                      ...deleteIcdPromises,
                    ]);
                  }
              
                  // Handle cpt_details updates
                  if (cptDetails && cptDetails.length > 0) {
                    const existingCptDetails = await EncCpt.getEncCptByEncounterId(id);
              
                    const newCptDetails = cptDetails.filter((detail) => !detail._id);
                    const updatedCptDetails = cptDetails.filter((detail) => detail._id);
              
                    // Create new cpt_details
                    const newCptPromises = newCptDetails.map(async (data) => {
                      EncCpt.createEncCpt(data,patientId,updatedEncounter._id);
              
                      let claimDetailData = {
                        patientId: patientId,
                        encounterId: updatedEncounter._id,
                        cptId: data.cptId,
                        cptCode: data.cptCode,
                        modifier: data.modifier1,
                        modifier2: data.modifier2,
                        modifier3: data.modifier3,
                        modifier4: data.modifier4,
                        chargeAmount: data.units * data.rate,
                        units: data.units,
                        createdBy: systemUserId,
                    }

                    await claimDetailService.createClaimDetail(claimDetailData);
                    });
              
                    // Update existing cpt_details and corresponding claim_details
                    const updateCptPromises = updatedCptDetails.map(async (data) => {
                      await EncCpt.updateEncCpt(data._id, data);
              
                      const claimDetail = await claimDetailService.findOneClaimDetails(updatedEncounter._id,data.cptCode);
              
                      if (claimDetail) {
                        await claimDetailService.updateOneClaimDetail(claimDetail._id,data);
                      }
                    });
              
                    // Delete cpt_details and corresponding claim_details not in the update list
                    const updateCptIds = updatedCptDetails.map((detail) => detail._id);
                    const deleteCptPromises = existingCptDetails
                      .filter((detail) => !updateCptIds.includes(detail._id.toString()))
                      .map(async (detail) => {
                        await EncCpt.deleteEncCpt(detail._id);
                        await claimDetailService.deleteClaimDetailByEncId(updatedEncounter._id,detail.cptCode);
                      });
              
                    await Promise.all([
                      ...newCptPromises,
                      ...updateCptPromises,
                      ...deleteCptPromises,
                    ]);
                  }
              
                  // Calculate total charge_amount for the encounter
                  const claimDetails = await claimDetailService.getClaimDetailByEncounterId(updatedEncounter._id);
                  const totalChargeAmount = claimDetails.reduce(
                    (sum, detail) => sum + detail.chargeAmount,
                    0
                  );
              
                  // Update the claim with the total charge_amount
                  const existingClaim = await claimService.getClaimByEncounterId(updatedEncounter._id);
              
                  if (existingClaim) {
                    await claimService.updateClaimById(existingClaim._id,totalChargeAmount);
                    await claimDetailService.updateClaimIdClaimDetail(updatedEncounter._id,existingClaim._id);
                  } else {
                    const newClaim = await claimService.createClaimTotalAmount(updatedEncounter._id,patientId,totalChargeAmount);
                    await claimDetailService.updateClaimIdClaimDetail(updatedEncounter._id,newClaim._id);
                  }
                ////////////////////////////////////////

                if(updatedEncounter)
                {
                    let updatedEncounterId = updatedEncounter._id;

                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);
                    responseObj.id = updatedEncounterId;
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
                resMsg = "Encounter Retrieval Unsuccesful " + e;
            }
        }
    }    
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
}

exports.removeEncounter = async function(req, res, next){
  var Id = req.params.id;

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

                    let deleteEncounter = await EncounterService.removeEncounter(Id,systemUser);
                    resStatus = 1;
                    resMsg = AppCommonService.getDeletedMessage(thisModulename);     
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Encounter Deletion Unsuccesful" + e;
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