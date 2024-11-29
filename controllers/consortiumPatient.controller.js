var ConsortiumService = require('../services/consortium.service')
var ConsortiumPatientAppointmentService = require('../services/consortiumPatientAppointment.service')
var ConsortiumPatientService = require('../services/consortiumPatient.service')
var RelationshipService = require('../services/relationship.service')
var GenderService = require('../services/gender.service')
var SalutationService = require('../services/salutation.service')
var ConsortiumUserService = require('../services/consortiumUser.service')
var SystemUserService = require('../services/systemUser.service')
var AppCommonService = require('../services/appcommon.service')
var AppUploadService = require('../services/appUpload.service')
var AppConfigUploadsModule = require('../appconfig-uploads-module');
var ConsortiumPreliminaryAttachmentService = require('../services/consortiumPreliminaryAttachment.service')
var SystemPreliminaryAttachmentService = require('../services/systemPreliminaryAttachment.service')
var AppDataSanitationService = require('../services/appDataSanitation.service');
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppConfigConst = require('../appconfig-const')
var AppConfigModuleName = require('../appconfig-module-name');
var mongodb = require("mongodb");
var mongoose = require('mongoose');

// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_CONSORTIUM_PATIENT;
var thisModulename = AppConfigModuleName.MOD_CONSORTIUM_PATIENT;

exports.saveConsortiumPatient = async function(req,res)
{
    var consortiumPatientId = req.body.id;
    var consortiumId = req.body.consortium;
    var salutation = req.body.salutation;
    var firstName = req.body.firstName;
    var middleName = req.body.middleName;
    var lastName = req.body.lastName;
    var birthDate = req.body.birthDate;
    var householdHeadName = req.body.householdHeadName;
    var mrNumber = req.body.mrNumber;
    var physicianName = req.body.physicianName;
    var primaryCarePhysicianName = req.body.primaryCarePhysicianName;
    var refferingPhysicianName = req.body.refferingPhysicianName;
    var address = req.body.address;
    var email = req.body.email;
    var emergencyContactPersonName = req.body.emergencyContactPersonName;
    var emergencyContactPersonRelationship = req.body.emergencyContactPersonRelationship;
    var emergencyContactPersonNumber = req.body.emergencyContactPersonNumber;
    var gender = req.body.gender;
    var description = req.body.description;
    var primaryInsurancePlanName = req.body.primaryInsurancePlanName;
    var primaryInsuranceGroupNumber = req.body.primaryInsuranceGroupNumber;
    var primaryInsuranceSubscriberID = req.body.primaryInsuranceSubscriberID;
    var primaryInsuranceCarrier = req.body.primaryInsuranceCarrier;
    var primaryInsurancePolicyNumber = req.body.primaryInsurancePolicyNumber;
    var primaryInsurancePerson = req.body.primaryInsurancePerson;
    var primaryInsuranceRelationshipToInsured = req.body.primaryInsuranceRelationshipToInsured;
    var primaryInsuranceSpecialProgramCode = req.body.primaryInsuranceSpecialProgramCode;
    var primaryIssueDate = req.body.primaryIssueDate;
    var primaryExpirationDate = req.body.primaryExpirationDate;
    var copayAmount = req.body.copayAmount;
    var primaryBenefitSandNotes = req.body.primaryBenefitSandNotes;
    var secondaryInsurancePlanName = req.body.secondaryInsurancePlanName;
    var secondaryGroupNumber = req.body.secondaryGroupNumber;
    var secondarySubscriberID = req.body.secondarySubscriberID;
    var secondaryInsuranceCarrier = req.body.secondaryInsuranceCarrier;
    var secondaryInsurancePolicyNumber = req.body.secondaryInsurancePolicyNumber;
    var secondaryInsuredPerson = req.body.secondaryInsuredPerson;
    var secondaryRelationshipToInsured = req.body.secondaryRelationshipToInsured;
    var secondaryIssueDate = req.body.secondaryIssueDate;
    var secondaryExpirationDate = req.body.secondaryExpirationDate;
    var crossoverClaim = req.body.crossoverClaim;
    var secondaryBenefitSandNotes = req.body.secondaryBenefitSandNotes;
    var tertiaryPlanName = req.body.tertiaryPlanName;
    var tertiaryGroupNumber = req.body.tertiaryGroupNumber;
    var tertiarySubscriberID = req.body.tertiarySubscriberID;
    var tertiaryInsuranceCarrier = req.body.tertiaryInsuranceCarrier;
    var tertiaryInsurancePolicyNumber = req.body.tertiaryInsurancePolicyNumber;
    var tertiaryInsuredPerson = req.body.tertiaryInsuredPerson;
    var tertiaryRelationshipToInsured = req.body.tertiaryRelationshipToInsured;
    var tertiaryIssueDate = req.body.tertiaryIssueDate;
    var tertiaryExpirationDate = req.body.tertiaryExpirationDate;
    var tertiaryBenefitSandNotes = req.body.tertiaryBenefitSandNotes;
    var consulatation = req.body.consulatation;
    var followUp = req.body.followUp;
    var proceduresNotes = req.body.proceduresNotes;
    var labRecords = req.body.labRecords;
    var specialProgramCode = req.body.specialProgramCode;
    var hasPolicyIsCapitated = req.body.hasPolicyIsCapitated;
    var hasCollectCoinsurance = req.body.hasCollectCoinsurance;
    var immunizationAndVaccineRecords = req.body.immunizationAndVaccineRecords;
    var preliminaryAttachmentIdArr = req.body.preliminaryAttachmentIdArr;
    var attachmentIdArr = req.body.attachmentIdArr;
  

    if(!consortiumPatientId)
    consortiumPatientId = '';

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(isConsortiumUserRequest === true)
    {   
        consortiumId = consortiumUser.consortium;
    }

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(consortiumId && consortiumId !== undefined && consortiumId !== '' && firstName && firstName !== undefined && firstName !== ''  && lastName && lastName !== undefined && lastName !== '' && birthDate && birthDate !== undefined && birthDate !== '' ) // && mrNumber && mrNumber !== undefined && mrNumber !== ''
    { 
        var hasAddRights = false;
        var hasEditRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasAddRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_ADD);
            hasEditRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_EDIT);
        }
        else
        {
            hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
            hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        }
      
        if((consortiumPatientId == "" && !hasAddRights) || (consortiumPatientId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
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

                var existingConsortiumPatient = await ConsortiumPatientService.findConsortiumPatientById(req, consortiumPatientId,false);
                let existingAttachments = [];
                if(existingConsortiumPatient)
                {
                    existingAttachments = existingConsortiumPatient.attachments;
                }

                let fullName = lastName+", "+firstName+" "+middleName;

                var consortiumPatient = {
                    consortium: consortiumId,
                    salutation: salutation,
                    fullName : fullName,
                    firstName,firstName,
                    middleName,middleName,
                    lastName,lastName,
                    birthDate,birthDate,
                    householdHeadName,householdHeadName,
                    mrNumber: mrNumber,
                    physicianName : physicianName,
                    primaryCarePhysicianName : primaryCarePhysicianName,
                    refferingPhysicianName : refferingPhysicianName,
                    address : address,
                    email : email,
                    emergencyContactPersonName : emergencyContactPersonName,
                    emergencyContactPersonRelationship : emergencyContactPersonRelationship,
                    emergencyContactPersonNumber : emergencyContactPersonNumber,
                    gender : gender,
                    description : description,
                    primaryInsurancePlanName : primaryInsurancePlanName,
                    primaryInsuranceGroupNumber : primaryInsuranceGroupNumber,
                    primaryInsuranceSubscriberID : primaryInsuranceSubscriberID,
                    primaryInsuranceCarrier: primaryInsuranceCarrier,
                    primaryInsurancePolicyNumber: primaryInsurancePolicyNumber,
                    primaryInsurancePerson : primaryInsurancePerson,
                    primaryInsuranceRelationshipToInsured : primaryInsuranceRelationshipToInsured,
                    primaryInsuranceSpecialProgramCode : primaryInsuranceSpecialProgramCode,
                    primaryIssueDate : primaryIssueDate,
                    primaryExpirationDate : primaryExpirationDate,
                    copayAmount : copayAmount,
                    primaryBenefitSandNotes : primaryBenefitSandNotes,
                    secondaryInsurancePlanName : secondaryInsurancePlanName,
                    secondaryGroupNumber : secondaryGroupNumber,
                    secondarySubscriberID : secondarySubscriberID,
                    secondaryInsuranceCarrier: secondaryInsuranceCarrier,
                    secondaryInsurancePolicyNumber: secondaryInsurancePolicyNumber,
                    secondaryInsuredPerson : secondaryInsuredPerson,
                    secondaryRelationshipToInsured : secondaryRelationshipToInsured,
                    secondaryIssueDate : secondaryIssueDate,
                    secondaryExpirationDate : secondaryExpirationDate,
                    crossoverClaim : crossoverClaim,
                    secondaryBenefitSandNotes : secondaryBenefitSandNotes,
                    tertiaryPlanName : tertiaryPlanName,
                    tertiaryGroupNumber : tertiaryGroupNumber,
                    tertiarySubscriberID : tertiarySubscriberID,
                    tertiaryInsuranceCarrier: tertiaryInsuranceCarrier,
                    tertiaryInsurancePolicyNumber: tertiaryInsurancePolicyNumber,
                    tertiaryInsuredPerson : tertiaryInsuredPerson,
                    tertiaryRelationshipToInsured : tertiaryRelationshipToInsured,
                    tertiaryIssueDate : tertiaryIssueDate,
                    tertiaryExpirationDate : tertiaryExpirationDate,
                    tertiaryBenefitSandNotes : tertiaryBenefitSandNotes,
                    consulatation : consulatation,
                    followUp : followUp,
                    proceduresNotes : proceduresNotes,
                    labRecords : labRecords,
                    specialProgramCode : specialProgramCode,
                    hasPolicyIsCapitated : hasPolicyIsCapitated,
                    hasCollectCoinsurance : hasCollectCoinsurance,
                    immunizationAndVaccineRecords : immunizationAndVaccineRecords,
                };

                if(isConsortiumUserRequest === true)
                { 
                    consortiumPatient.updatedByConsortiumUser = consortiumUserId;
                }
                else
                {
                    consortiumPatient.updatedBySystemUser = systemUserId;
                }


                var fetchedConsortium;
                if(isConsortiumUserRequest === true)
                {   
                    fetchedConsortium = await AppCommonService.getConsortiumFromRequest(req);
                }
                else
                {
                    fetchedConsortium = await ConsortiumService.getConsortiumBaseObjectById(consortiumId,false);
                }
                
                let attachments = [];
                if (existingAttachments !== null && existingAttachments.length > 0) {

                    await Promise.all(existingAttachments.map(async (existingSampleAttachment, attIndex) => {

                        const attachmentId = existingSampleAttachment._id;
                        const attFilePathActual = existingSampleAttachment.attFilePathActual;
                        const attFilePathThumb = existingSampleAttachment.attFilePathThumb;
                        const attachmentIdIndex = attachmentIdArr.indexOf(attachmentId + '');

                        if(attachmentIdIndex < 0)
                        {
                            await AppUploadService.removeConsortiumPatientAttachment(fetchedConsortium,existingSampleAttachment.isImage,attFilePathActual);
                            if(existingSampleAttachment.isImage)
                            {
                                await AppUploadService.removeConsortiumPatientAttachment(fetchedConsortium,existingSampleAttachment.isImage,attFilePathThumb);
                            }
                        }
                        else
                        // {
                        //     attachments.push(existingSampleAttachment);
                        // }
                            {      // Find the corresponding preliminary attachment ID
                                const preliminaryAttachment =
                                  preliminaryAttachmentIdArr.find(
                                    (preliminary) => preliminary._id === attachmentId + ""
                                  );
              
                                // Update attType based on the found preliminary attachment
                                if (preliminaryAttachment) {
                                    existingSampleAttachment.attType =
                                    preliminaryAttachment.attType;
                                }
              
                                attachments.push(existingSampleAttachment);}
                    }));
                }

                if (preliminaryAttachmentIdArr !== null && preliminaryAttachmentIdArr.length > 0) {
                    await Promise.all((preliminaryAttachmentIdArr).map(async (preliminaryAttachmentId, attIndex) => {
                        if(preliminaryAttachmentId.id !== '')
                        {
                            let preliminaryAttachment;
                            if(isConsortiumUserRequest === true)
                            {   
                                preliminaryAttachment = await ConsortiumPreliminaryAttachmentService.findConsortiumPreliminaryAttachmentById(req, preliminaryAttachmentId.id);
                            }
                            else
                            {
                                preliminaryAttachment = await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(req, preliminaryAttachmentId.id);
                            }

                            if(preliminaryAttachment)
                            {
                                let profilePhotoFilePath = await AppUploadService.moveConsortiumPreliminaryAttachmentToConsortiumPatientAttachment(isConsortiumUserRequest,fetchedConsortium,preliminaryAttachment);
                            
                                let attFilePathActual,attFilePathThumb,attImageActualUrl,attImageThumbUrl,attFileUrl;
                                if(preliminaryAttachment.isImage === true)
                                {
                                    var compImageFilePath = await AppCommonService.compileUploadedImageFileNamesFromFileName(profilePhotoFilePath);
                            
                                    if(compImageFilePath)
                                    {
                                        attFilePathActual = compImageFilePath.actual; 
                                        attFilePathThumb = compImageFilePath.thumb;    
    
                                        attImageActualUrl = await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT,attFilePathActual,fetchedConsortium); //
                                        attImageThumbUrl = await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT,attFilePathThumb,fetchedConsortium); //
                                    
                                    }
                                }
                                else
                                {
                                    attFilePath = profilePhotoFilePath;
                                    attFileUrl = await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT,attFilePath,fetchedConsortium); //
                                }

                                const attFileUrlExpiresAt = AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); //

                                var newAttachment = {
                                    attFilePath: profilePhotoFilePath,
                                    attType: preliminaryAttachmentId.attType,
                                    attFileName: preliminaryAttachment.attFileName,
                                    isImage: preliminaryAttachment.isImage,
                                    attFileSizeBytes: preliminaryAttachment.attFileSizeBytes,
                                    attFilePathActual : attFilePathActual,
                                    attFilePathThumb : attFilePathThumb,
                                    attImageActualUrl: attImageActualUrl,
                                    attImageThumbUrl: attImageThumbUrl,
                                    attFileUrl: attFileUrl,
                                    attFileUrlExpiresAt: attFileUrlExpiresAt,
                                };

                                attachments.push(newAttachment);
                            }
                        }
                    }));
                }

                consortiumPatient.attachments = attachments;

                if(existingConsortiumPatient)
                {
                    consortiumPatient.id = consortiumPatientId;
                }
                else
                { 
                    if(isConsortiumUserRequest === true)
                    { 
                        consortiumPatient.createdByConsortiumUser = consortiumUserId;
                    }
                    else
                    {
                        consortiumPatient.createdBySystemUser = systemUserId;
                    }
                    consortiumPatient.isDeleted = 0;
                }

                let savedConsortiumPatient = await ConsortiumPatientService.saveConsortiumPatient(req,consortiumPatient);

                if(savedConsortiumPatient)
                {
                    responseObj.savedConsortiumPatientId = savedConsortiumPatient._id;
                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);      
                    
                }else{
                    resStatus = -1;
                }
            
                      
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationPatient Retrieval Unsuccesful " + e;
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


exports.getConsortiumPatientDetails = async function(req, res, next) {
    var id = req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
      
        
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
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

                await AppUploadService.checkAndGenerateModuleMultipleAttachmentExpiredSignedFileUrl(AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT, id);

                var fetchedConsortiumPatient = await ConsortiumPatientService.findConsortiumPatientById(req, id);
                if(fetchedConsortiumPatient)
                {
                    resStatus = 1;
                    responseObj.consortiumPatient = fetchedConsortiumPatient;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "OrganizationPatient Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationPatient Retrieval Unsuccesful " + e;
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

exports.getConsortiumPatients = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let consortiumPatientData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {

        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_VIEW);
        }
      
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
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

                let consortiumPatientsList = await ConsortiumPatientService.getConsortiumPatients(req);

                resStatus = 1;
                if(consortiumPatientsList != null)
                {

                    consortiumPatientData = consortiumPatientsList.results;
                    totalRecords = consortiumPatientsList.totalRecords;
                    filteredRecords = consortiumPatientsList.filteredRecords;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationPatientsList could not be fetched" + e;
            }
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = consortiumPatientData;

    return res.status(httpStatus).json(responseObj)
}

exports.selectConsortiumPatientList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 1;
    var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;

    let totalRecords = 0;
    let consortiumPatientData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

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

            let consortiumPatientList = await ConsortiumPatientService.getConsortiumPatientsForSelect(req,onlyActiveStatus);

            resStatus = 1;
            if(consortiumPatientList != null)
            {

                totalRecords = consortiumPatientList.length;
                consortiumPatientData = consortiumPatientList;

                if(forFilter) {
                    let consortiumPatientObj = {};
                    consortiumPatientObj.id = "";
                    consortiumPatientObj.text = "All ConsortiumPatients";
  
                    consortiumPatientData.unshift(consortiumPatientObj);
                  }
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationPatients could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = consortiumPatientData;

    return res.status(httpStatus).json(responseObj)
}

exports.changeConsortiumPatientStatus = async function(req, res, next)
{
    var id = req.body._id;
    var isActive = req.body.isActive;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_EDIT);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        }
      
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
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

                var existingConsortiumPatient = await ConsortiumPatientService.findConsortiumPatientById(req, id,false);
                if(existingConsortiumPatient)
                {
                    var consortiumPatient = {
                        id : existingConsortiumPatient._id,
                        isActive: isActive,
                    }

                    if(isConsortiumUserRequest === true)
                    { 
                        consortiumPatient.updatedByConsortiumUser = consortiumUserId;
                    }
                    else
                    {
                        consortiumPatient.updatedBySystemUser = systemUserId;
                    }
    
                    let savedConsortiumPatient = await ConsortiumPatientService.saveConsortiumPatient(req,consortiumPatient);
    
                    resStatus = 1;
                    resMsg = AppCommonService.getStatusChangedMessage();       
                }
                else
                {
                    resStatus = -1;
                    resMsg = "OrganizationPatient Status Change Unsuccesful";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationPatient Status Change Unsuccesful" + e;
            }
        }
    }
    else
    {
        resStatus = -1;
        resMsg = "Invalid Data";
    }

    return res.status(httpStatus).json({status: resStatus, message: resMsg});
}


exports.checkCanBeDeleted = async function(req, res, next)
{
    var id = req.body._id;

    var skipSend = AppCommonService.getSkipSendResponseValue(req);

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_DELETE);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_DELETE);
        }

        if(!hasRights)
        {
          resStatus = -1;
          resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
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

                var existingConsortiumPatient = await ConsortiumPatientService.findConsortiumPatientById(req, id,false);
                if(existingConsortiumPatient)
                {
                    let consortiumPatientAppointment = await ConsortiumPatientAppointmentService.checkIfConsortiumPatientAppointmentUsesConsortiumPatient(id);
                    if(consortiumPatientAppointment)
                    {
                        resStatus = -1;
                        resMsg = 'This patient is associated with organization patient appointment';
                    }
                    else
                    {
                        resStatus = 1;
                    }
                }
                else
                {
                    resStatus = -1;
                    resMsg = "OrganizationPatient Status Change Unsuccesful";
                }
            
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationPatient Status Change Unsuccesful" + e;
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

    if(skipSend === true) 
    {
      return responseObj;
    }
    else 
    {
      return res.status(httpStatus).json(responseObj);
    }
}

exports.removeConsortiumPatient = async function(req, res, next){

    var id = req.params.id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id != "")
    {
        var hasRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_DELETE);
        }
        else
        {
            hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_DELETE);
        }
        
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
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

                const compiledReq = AppCommonService.compileRequestWithSkipSendResponse(req);
                compiledReq.body._id = id;
                const canBeDeletedResponse = await exports.checkCanBeDeleted(compiledReq, res, next);
                if(canBeDeletedResponse)
                {
                    if(canBeDeletedResponse.status > 0)
                    {
                       
                        var consortiumPatient = {
                            id,
                            isDeleted: 1,
                        }

                        if(isConsortiumUserRequest === true)
                        { 
                            consortiumPatient.updatedByConsortiumUser = consortiumUserId;
                        }
                        else
                        {
                            consortiumPatient.updatedBySystemUser = systemUserId;
                        }

                        let savedConsortiumPatient = await ConsortiumPatientService.saveConsortiumPatient(req,consortiumPatient);

                        resStatus = 1;
                        resMsg = AppCommonService.getDeletedMessage(thisModulename);
                    }
                    else
                    {
                        resStatus = canBeDeletedResponse.status;
                        resMsg = canBeDeletedResponse.message;
                    }
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
                resMsg = "OrganizationPatient Deletion Unsuccesful" + e;
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



exports.selectConsortiumPatientSearchByOptionList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

   
    let totalRecords = 0;
    let searchByOptionData = [];
    let defaultSearchByOption;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

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

            let searchByOptionList = AppConfigConst.PATIENT_SEARCH_BY_OPTION_SELECT_ARR;
            defaultSearchByOption = AppConfigConst.PATIENT_SEARCH_BY_CODE_ALL_PATIENT_PARAMS;

            resStatus = 1;
            if(searchByOptionList != null)
            {
                totalRecords = searchByOptionList.length;
                searchByOptionData = searchByOptionList;
            }

        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationPatients could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.total_count = totalRecords;
    responseObj.results = searchByOptionData;
    responseObj.defaultOption = defaultSearchByOption;

    return res.status(httpStatus).json(responseObj)
}

exports.getFilteredConsortiumPatients = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var patientSearchByCode = req.body.patientSearchBy;
    var patientSearchStr = req.body.patientSearchStr;

    let consortiumPatientData = [];

    var skipSend = AppCommonService.getSkipSendResponseValue(req);

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(patientSearchStr !== undefined && patientSearchStr !== '' && patientSearchByCode !== undefined && patientSearchByCode !== '')
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
            
            consortiumPatientData = await ConsortiumPatientService.getFilteredConsortiumPatientsForSelect(req,patientSearchByCode, patientSearchStr);

            resStatus = 1;

        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationPatients could not be fetched" + e;
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.results = consortiumPatientData;

    if(skipSend === true) 
    {
      return responseObj;
    }
    else 
    {
      return res.status(httpStatus).json(responseObj);
    }
}


exports.performConsortiumPatientImport = async function(req,res)
{
    var consortiumId = req.body.consortium;
    var salutationNameArr = req.body.salutationNameArr;
    var firstNameArr = req.body.firstNameArr;
    var middleNameArr = req.body.middleNameArr;
    var lastNameArr = req.body.lastNameArr;
    var birthDateArr = req.body.birthDateArr;
    var householdHeadNameArr = req.body.householdHeadNameArr;
    var mrNumberArr = req.body.mrNumberArr;
    var physicianNameArr = req.body.physicianNameArr;
    var primaryCarePhysicianNameArr = req.body.primaryCarePhysicianNameArr;
    var refferingPhysicianNameArr = req.body.refferingPhysicianNameArr;
    var addressArr = req.body.addressArr;
    var emailArr = req.body.emailArr;
    var emergencyContactPersonNameArr = req.body.emergencyContactPersonNameArr;
    var emergencyContactPersonRelationshipNameArr = req.body.emergencyContactPersonRelationshipNameArr;
    var emergencyContactPersonNumberArr = req.body.emergencyContactPersonNumberArr;
    var genderNameArr = req.body.genderNameArr;
    var descriptionArr = req.body.descriptionArr;
    var primaryInsurancePlanNameArr = req.body.primaryInsurancePlanNameArr;
    var primaryInsuranceGroupNumberArr = req.body.primaryInsuranceGroupNumberArr;
    var primaryInsuranceSubscriberIDArr = req.body.primaryInsuranceSubscriberIDArr;
    var primaryInsuranceCarrierArr = req.body.primaryInsuranceCarrierArr;
    var primaryInsurancePolicyNumberArr = req.body.primaryInsurancePolicyNumberArr;
    var primaryInsurancePersonArr = req.body.primaryInsurancePersonArr;
    var primaryInsuranceRelationshipNameToInsuredArr = req.body.primaryInsuranceRelationshipNameToInsuredArr;
    var primaryInsuranceSpecialProgramCodeArr = req.body.primaryInsuranceSpecialProgramCodeArr;
    var primaryIssueDateArr = req.body.primaryIssueDateArr;
    var primaryExpirationDateArr = req.body.primaryExpirationDateArr;
    var copayAmountArr = req.body.copayAmountArr;
    var hasPolicyIsCapitatedTextArr = req.body.hasPolicyIsCapitatedTextArr;
    var hasCollectCoinsuranceTextArr = req.body.hasCollectCoinsuranceTextArr;
    var primaryBenefitSandNotesArr = req.body.primaryBenefitSandNotesArr;
    var secondaryInsurancePlanNameArr = req.body.secondaryInsurancePlanNameArr;
    var secondaryGroupNumberArr = req.body.secondaryGroupNumberArr;
    var secondarySubscriberIDArr = req.body.secondarySubscriberIDArr;
    var secondaryInsuranceCarrierArr = req.body.secondaryInsuranceCarrierArr;
    var secondaryPolicyNumberArr = req.body.secondaryPolicyNumberArr;
    var secondaryInsuredPersonArr = req.body.secondaryInsuredPersonArr;
    var secondaryRelationshipNameToInsuredArr = req.body.secondaryRelationshipNameToInsuredArr;
    var secondaryIssueDateArr = req.body.secondaryIssueDateArr;
    var secondaryExpirationDateArr = req.body.secondaryExpirationDateArr;
    var crossoverClaimTextArr = req.body.crossoverClaimTextArr;
    var secondaryBenefitSandNotesArr = req.body.secondaryBenefitSandNotesArr;
    var tertiaryPlanNameArr = req.body.tertiaryPlanNameArr;
    var tertiaryGroupNumberArr = req.body.tertiaryGroupNumberArr;
    var tertiarySubscriberIDArr = req.body.tertiarySubscriberIDArr;
    var tertiaryInsuranceCarrierArr = req.body.tertiaryInsuranceCarrierArr;
    var tertiaryInsurancePolicyNumberArr = req.body.tertiaryInsurancePolicyNumberArr;
    var tertiaryInsuredPersonArr = req.body.tertiaryInsuredPersonArr;
    var tertiaryRelationshipNameToInsuredArr = req.body.tertiaryRelationshipNameToInsuredArr;
    var tertiaryIssueDateArr = req.body.tertiaryIssueDateArr;
    var tertiaryExpirationDateArr = req.body.tertiaryExpirationDateArr;
    var tertiaryBenefitSandNotesArr = req.body.tertiaryBenefitSandNotesArr;

    var isValidArr = req.body.isValidArr;
    var validationMessageArr = req.body.validationMessageArr;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(isConsortiumUserRequest === true)
    {   
        consortiumId = consortiumUser.consortium;
    }

    if(!systemUser && !consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(consortiumId && consortiumId !== undefined && consortiumId !== '' && firstNameArr !== undefined && firstNameArr !== null && firstNameArr.length > 0)
    { 
        var hasAddRights = false;
        if(isConsortiumUserRequest === true)
        {
            hasAddRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_ADD);
        }
        else
        {
            hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        }

        if(!hasAddRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
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

                var mappedInsPatientRecordsArr = [];

                resStatus = 1;
                resMsg = AppCommonService.getSavedMessage(thisModulename);        
                
                let importValidityStatusArr = [];
                let importValidityStatusMsgArr = [];

                /* Loop by module name */
                await Promise.all((firstNameArr).map(async (firstName, srIndex) => 
                {
                    var isValidPatientRecord = true;
                    var patientValidityMsg = 'Success';

                    var isValidInp = isValidArr[srIndex];
                    var validationMessageInp = validationMessageArr[srIndex];
                    var salutationName = salutationNameArr[srIndex];
                    var middleName = middleNameArr[srIndex];
                    var lastName = lastNameArr[srIndex];
                    var birthDate = birthDateArr[srIndex];
                    var householdHeadName = householdHeadNameArr[srIndex];
                    var mrNumber = mrNumberArr[srIndex];
                    var physicianName = physicianNameArr[srIndex];
                    var primaryCarePhysicianName = primaryCarePhysicianNameArr[srIndex];
                    var refferingPhysicianName = refferingPhysicianNameArr[srIndex];
                    var address = addressArr[srIndex];
                    var email = emailArr[srIndex];
                    var emergencyContactPersonName = emergencyContactPersonNameArr[srIndex];
                    var emergencyContactPersonRelationshipName = emergencyContactPersonRelationshipNameArr[srIndex];
                    var emergencyContactPersonNumber = emergencyContactPersonNumberArr[srIndex];
                    var genderName = genderNameArr[srIndex];
                    var description = descriptionArr[srIndex];
                    var primaryInsurancePlanName = primaryInsurancePlanNameArr[srIndex];
                    var primaryInsuranceGroupNumber = primaryInsuranceGroupNumberArr[srIndex];
                    var primaryInsuranceSubscriberID = primaryInsuranceSubscriberIDArr[srIndex];
                    var primaryInsuranceCarrier = primaryInsuranceCarrierArr[srIndex];
                    var primaryInsurancePolicyNumber = primaryInsurancePolicyNumberArr[srIndex];
                    var primaryInsurancePerson = primaryInsurancePersonArr[srIndex];
                    var primaryInsuranceRelationshipNameToInsured = primaryInsuranceRelationshipNameToInsuredArr[srIndex];
                    var primaryInsuranceSpecialProgramCode = primaryInsuranceSpecialProgramCodeArr[srIndex];
                    var primaryIssueDate = primaryIssueDateArr[srIndex];
                    var primaryExpirationDate = primaryExpirationDateArr[srIndex];
                    var copayAmount = copayAmountArr[srIndex];
                    var primaryBenefitSandNotes = primaryBenefitSandNotesArr[srIndex];
                    var secondaryInsurancePlanName = secondaryInsurancePlanNameArr[srIndex];
                    var secondaryGroupNumber = secondaryGroupNumberArr[srIndex];
                    var secondarySubscriberID = secondarySubscriberIDArr[srIndex];
                    var secondaryInsuranceCarrier = secondaryInsuranceCarrierArr[srIndex];
                    var secondaryInsurancePolicyNumber = secondaryInsurancePolicyNumberArr[srIndex];
                    var secondaryInsuredPerson = secondaryInsuredPersonArr[srIndex];
                    var secondaryRelationshipNameToInsured = secondaryRelationshipNameToInsuredArr[srIndex];
                    var secondaryIssueDate = secondaryIssueDateArr[srIndex];
                    var secondaryExpirationDate = secondaryExpirationDateArr[srIndex];
                    var crossoverClaimText = crossoverClaimTextArr[srIndex];
                    var secondaryBenefitSandNotes = secondaryBenefitSandNotesArr[srIndex];
                    var tertiaryPlanName = tertiaryPlanNameArr[srIndex];
                    var tertiaryGroupNumber = tertiaryGroupNumberArr[srIndex];
                    var tertiarySubscriberID = tertiarySubscriberIDArr[srIndex];
                    var tertiaryInsuranceCarrier = tertiaryInsuranceCarrierArr[srIndex];
                    var tertiaryInsurancePolicyNumber = tertiaryInsurancePolicyNumberArr[srIndex];
                    var tertiaryInsuredPerson = tertiaryInsuredPersonArr[srIndex];
                    var tertiaryRelationshipNameToInsured = tertiaryRelationshipNameToInsuredArr[srIndex];
                    var tertiaryIssueDate = tertiaryIssueDateArr[srIndex];
                    var tertiaryExpirationDate = tertiaryExpirationDateArr[srIndex];
                    var tertiaryBenefitSandNotes = tertiaryBenefitSandNotesArr[srIndex];
                    var hasPolicyIsCapitatedText = hasPolicyIsCapitatedTextArr[srIndex];
                    var hasCollectCoinsuranceText = hasCollectCoinsuranceTextArr[srIndex];
                    
                    firstName = AppDataSanitationService.sanitizeDataTypeString(firstName); 
                    salutationName = AppDataSanitationService.sanitizeDataTypeString(salutationName); 
                    middleName = AppDataSanitationService.sanitizeDataTypeString(middleName); 
                    lastName = AppDataSanitationService.sanitizeDataTypeString(lastName); 
                    birthDate = AppDataSanitationService.sanitizeDataTypeString(birthDate); 
                    householdHeadName = AppDataSanitationService.sanitizeDataTypeString(householdHeadName); 
                    mrNumber = AppDataSanitationService.sanitizeDataTypeString(mrNumber); 
                    physicianName = AppDataSanitationService.sanitizeDataTypeString(physicianName); 
                    primaryCarePhysicianName = AppDataSanitationService.sanitizeDataTypeString(primaryCarePhysicianName); 
                    refferingPhysicianName = AppDataSanitationService.sanitizeDataTypeString(refferingPhysicianName); 
                    address = AppDataSanitationService.sanitizeDataTypeString(address); 
                    email = AppDataSanitationService.sanitizeDataTypeString(email); 
                    emergencyContactPersonName = AppDataSanitationService.sanitizeDataTypeString(emergencyContactPersonName); 
                    emergencyContactPersonRelationshipName = AppDataSanitationService.sanitizeDataTypeString(emergencyContactPersonRelationshipName); 
                    emergencyContactPersonNumber = AppDataSanitationService.sanitizeDataTypeString(emergencyContactPersonNumber); 
                    genderName = AppDataSanitationService.sanitizeDataTypeString(genderName); 
                    description = AppDataSanitationService.sanitizeDataTypeString(description); 
                    primaryInsurancePlanName = AppDataSanitationService.sanitizeDataTypeString(primaryInsurancePlanName); 
                    primaryInsuranceGroupNumber = AppDataSanitationService.sanitizeDataTypeString(primaryInsuranceGroupNumber); 
                    primaryInsuranceSubscriberID = AppDataSanitationService.sanitizeDataTypeString(primaryInsuranceSubscriberID); 
                    primaryInsuranceCarrier = AppDataSanitationService.sanitizeDataTypeString(primaryInsuranceCarrier);
                    primaryInsurancePolicyNumber = AppDataSanitationService.sanitizeDataTypeString(primaryInsurancePolicyNumber);
                    primaryInsurancePerson = AppDataSanitationService.sanitizeDataTypeString(primaryInsurancePerson); 
                    primaryInsuranceRelationshipNameToInsured = AppDataSanitationService.sanitizeDataTypeString(primaryInsuranceRelationshipNameToInsured); 
                    primaryInsuranceSpecialProgramCode = AppDataSanitationService.sanitizeDataTypeString(primaryInsuranceSpecialProgramCode); 
                    primaryIssueDate = AppDataSanitationService.sanitizeDataTypeNumber(primaryIssueDate); 
                    primaryExpirationDate = AppDataSanitationService.sanitizeDataTypeNumber(primaryExpirationDate); 
                    copayAmount = AppDataSanitationService.sanitizeDataTypeNumber(copayAmount); 
                    primaryBenefitSandNotes = AppDataSanitationService.sanitizeDataTypeString(primaryBenefitSandNotes); 
                    secondaryInsurancePlanName = AppDataSanitationService.sanitizeDataTypeString(secondaryInsurancePlanName); 
                    secondaryGroupNumber = AppDataSanitationService.sanitizeDataTypeString(secondaryGroupNumber); 
                    secondarySubscriberID = AppDataSanitationService.sanitizeDataTypeString(secondarySubscriberID); 
                    secondaryInsuranceCarrier = AppDataSanitationService.sanitizeDataTypeString(secondaryInsuranceCarrier);
                    secondaryInsurancePolicyNumber = AppDataSanitationService.sanitizeDataTypeString(secondaryInsurancePolicyNumber);
                    secondaryInsuredPerson = AppDataSanitationService.sanitizeDataTypeString(secondaryInsuredPerson); 
                    secondaryRelationshipNameToInsured = AppDataSanitationService.sanitizeDataTypeString(secondaryRelationshipNameToInsured); 
                    secondaryIssueDate = AppDataSanitationService.sanitizeDataTypeNumber(secondaryIssueDate); 
                    secondaryExpirationDate = AppDataSanitationService.sanitizeDataTypeNumber(secondaryExpirationDate); 
                    crossoverClaimText = AppDataSanitationService.sanitizeDataTypeString(crossoverClaimText); 
                    secondaryBenefitSandNotes = AppDataSanitationService.sanitizeDataTypeString(secondaryBenefitSandNotes); 
                    tertiaryPlanName = AppDataSanitationService.sanitizeDataTypeString(tertiaryPlanName); 
                    tertiaryGroupNumber = AppDataSanitationService.sanitizeDataTypeString(tertiaryGroupNumber); 
                    tertiarySubscriberID = AppDataSanitationService.sanitizeDataTypeString(tertiarySubscriberID); 
                    tertiaryInsuranceCarrier = AppDataSanitationService.sanitizeDataTypeString(tertiaryInsuranceCarrier); 
                    tertiaryInsurancePolicyNumber = AppDataSanitationService.sanitizeDataTypeString(tertiaryInsurancePolicyNumber);
                    tertiaryInsuredPerson = AppDataSanitationService.sanitizeDataTypeString(tertiaryInsuredPerson); 
                    tertiaryRelationshipNameToInsured = AppDataSanitationService.sanitizeDataTypeString(tertiaryRelationshipNameToInsured); 
                    tertiaryIssueDate = AppDataSanitationService.sanitizeDataTypeNumber(tertiaryIssueDate); 
                    tertiaryExpirationDate = AppDataSanitationService.sanitizeDataTypeNumber(tertiaryExpirationDate); 
                    tertiaryBenefitSandNotes = AppDataSanitationService.sanitizeDataTypeString(tertiaryBenefitSandNotes); 
                    
                    var sanIsValidInp = AppDataSanitationService.sanitizeDataTypeBoolean(isValidInp); 
                    var sanValidationMessageInp = AppDataSanitationService.sanitizeDataTypeString(validationMessageInp); 

                    let crossoverClaim = false,hasPolicyIsCapitatedBool = false,hasCollectCoinsuranceBool = false;
                    let salutationId,emergencyContactPersonRelationshipId,genderId,primaryInsuranceRelationshipToInsuredId,secondaryRelationshipToInsuredId,tertiaryRelationshipToInsuredId;
                    if(sanIsValidInp === true)
                    {
                        if(salutationName && salutationName !== undefined)
                        {
                            let fetchSalutation = await SalutationService.checkSalutationTextForDuplication(salutationId, salutationName);
                            if(fetchSalutation)
                            {
                                salutationId = fetchSalutation._id;
                            }
                            else
                            {
                                isValidPatientRecord = false;
                                patientValidityMsg = 'This salutation name does not exist';
                            }
                        }
                        // else
                        // {
                        //     isValidPatientRecord = false;
                        //     patientValidityMsg = 'Salutation is required.';
                        // }

                        if(isValidPatientRecord === true && emergencyContactPersonRelationshipName && emergencyContactPersonRelationshipName !== undefined)
                        {
                            let fetchRelationship = await RelationshipService.checkRelationshipNameForDuplication(emergencyContactPersonRelationshipId, emergencyContactPersonRelationshipName);
                            if(fetchRelationship)
                            {
                                emergencyContactPersonRelationshipId = fetchRelationship._id;
                            }
                            else
                            {
                                isValidPatientRecord = false;
                                patientValidityMsg = 'This emergency contact person relationship name does not exist';
                            }
                        }

                        if(isValidPatientRecord === true && genderName && genderName !== undefined)
                        {
                            let fetchGender = await GenderService.findGenderByName(genderName);
                            if(fetchGender)
                            {
                                genderId = fetchGender._id;
                            }
                            else
                            {
                                isValidPatientRecord = false;
                                patientValidityMsg = 'This gender name does not exist';
                            }
                        }


                        if(isValidPatientRecord === true && primaryInsuranceRelationshipNameToInsured && primaryInsuranceRelationshipNameToInsured !== undefined)
                        {
                            let fetchRelationship = await RelationshipService.checkRelationshipNameForDuplication(primaryInsuranceRelationshipToInsuredId, primaryInsuranceRelationshipNameToInsured);
                            if(fetchRelationship)
                            {
                                primaryInsuranceRelationshipToInsuredId = fetchRelationship._id;
                            }
                            else
                            {
                                isValidPatientRecord = false;
                                patientValidityMsg = 'This primary insurance relationship name does not exist';
                            }
                        }

                        if(isValidPatientRecord === true && secondaryRelationshipNameToInsured && secondaryRelationshipNameToInsured !== undefined)
                        {
                            let fetchRelationship = await RelationshipService.checkRelationshipNameForDuplication(secondaryRelationshipToInsuredId, secondaryRelationshipNameToInsured);
                            if(fetchRelationship)
                            {
                                secondaryRelationshipToInsuredId = fetchRelationship._id;
                            }
                            else
                            {
                                isValidPatientRecord = false;
                                patientValidityMsg = 'This secondary relationship name does not exist';
                            }
                        }

                        if(crossoverClaimText !== '')
                        {
                            crossoverClaimText = crossoverClaimText.toLowerCase();

                            if(crossoverClaimText === 'yes')
                            {
                                crossoverClaim = true;
                            }
                        }

                        if(hasPolicyIsCapitatedText !== '')
                        {
                            hasPolicyIsCapitatedText = hasPolicyIsCapitatedText.toLowerCase();

                            if(hasPolicyIsCapitatedText === 'yes')
                            {
                                hasPolicyIsCapitatedBool = true;
                            }
                        }
                        
                        
                        if(hasCollectCoinsuranceText !== '')
                        {
                            hasCollectCoinsuranceText = hasCollectCoinsuranceText.toLowerCase();

                            if(hasCollectCoinsuranceText === 'yes')
                            {
                                hasCollectCoinsuranceBool = true;
                            }
                        }

                        if(isValidPatientRecord === true && tertiaryRelationshipNameToInsured && tertiaryRelationshipNameToInsured !== undefined)
                        {
                            let fetchRelationship = await RelationshipService.checkRelationshipNameForDuplication(tertiaryRelationshipToInsuredId, tertiaryRelationshipNameToInsured);
                            if(fetchRelationship)
                            {
                                tertiaryRelationshipToInsuredId = fetchRelationship._id;
                            }
                            else
                            {
                                isValidPatientRecord = false;
                                patientValidityMsg = 'This tertiary relationship name does not exist';
                            }
                        }

                        if(isValidPatientRecord === true)
                        {
                            if(firstName === '')
                            {
                                isValidPatientRecord = false;
                                patientValidityMsg = 'First name is required.';
                            }
                            // else if(middleName === '')
                            // {
                            //     isValidPatientRecord = false;
                            //     patientValidityMsg = 'Middle name is required.';
                            // }
                            else if(lastName === '')
                            {
                                isValidPatientRecord = false;
                                patientValidityMsg = 'Last name is required.';
                            }
                            else if(birthDate === '')
                            {
                                isValidPatientRecord = false;
                                patientValidityMsg = 'Birth date is required.';
                            }
                            // else if(householdHeadName === '')
                            // {
                            //     isValidPatientRecord = false;
                            //     patientValidityMsg = 'Household head name is required.';
                            // }
                            // else if(mrNumber === '')
                            // {
                            //     isValidPatientRecord = false;
                            //     patientValidityMsg = 'MR number is required.';
                            // }
                        }
                    }
                    else
                    {
                        isValidPatientRecord = false;
                        patientValidityMsg = sanValidationMessageInp;
                    }
                    
                    if(isValidPatientRecord === true)
                    {
                        let fullName = lastName+", "+firstName+" "+middleName;

                        var insPatient = {
                            consortium: consortiumId,
                            salutation: salutationId,
                            fullName : fullName,
                            firstName: firstName,
                            middleName: middleName,
                            lastName: lastName,
                            birthDate: birthDate,
                            householdHeadName: householdHeadName,
                            mrNumber: mrNumber,
                            physicianName : physicianName,
                            primaryCarePhysicianName : primaryCarePhysicianName,
                            refferingPhysicianName : refferingPhysicianName,
                            address : address,
                            email : email,
                            emergencyContactPersonName : emergencyContactPersonName,
                            emergencyContactPersonRelationship : emergencyContactPersonRelationshipId,
                            emergencyContactPersonNumber : emergencyContactPersonNumber,
                            gender : genderId,
                            description : description,
                            primaryInsurancePlanName : primaryInsurancePlanName,
                            primaryInsuranceGroupNumber : primaryInsuranceGroupNumber,
                            primaryInsuranceSubscriberID : primaryInsuranceSubscriberID,
                            primaryInsuranceCarrier : primaryInsuranceCarrier,
                            primaryInsurancePolicyNumber : primaryInsurancePolicyNumber,
                            primaryInsurancePerson : primaryInsurancePerson,
                            primaryInsuranceRelationshipToInsured : primaryInsuranceRelationshipToInsuredId,
                            primaryInsuranceSpecialProgramCode : primaryInsuranceSpecialProgramCode,
                            primaryIssueDate : primaryIssueDate,
                            primaryExpirationDate : primaryExpirationDate,
                            copayAmount : copayAmount,
                            primaryBenefitSandNotes : primaryBenefitSandNotes,
                            secondaryInsurancePlanName : secondaryInsurancePlanName,
                            secondaryGroupNumber : secondaryGroupNumber,
                            secondarySubscriberID : secondarySubscriberID,
                            secondaryInsuranceCarrier: secondaryInsuranceCarrier,
                            secondaryInsurancePolicyNumber : secondaryInsurancePolicyNumber,
                            secondaryInsuredPerson : secondaryInsuredPerson,
                            secondaryRelationshipToInsured : secondaryRelationshipToInsuredId,
                            secondaryIssueDate : secondaryIssueDate,
                            secondaryExpirationDate : secondaryExpirationDate,
                            crossoverClaim : crossoverClaim,
                            secondaryBenefitSandNotes : secondaryBenefitSandNotes,
                            tertiaryPlanName : tertiaryPlanName,
                            tertiaryGroupNumber : tertiaryGroupNumber,
                            tertiarySubscriberID : tertiarySubscriberID,
                            tertiaryInsuranceCarrier: tertiaryInsuranceCarrier,
                            tertiaryInsurancePolicyNumber : tertiaryInsurancePolicyNumber,
                            tertiaryInsuredPerson : tertiaryInsuredPerson,
                            tertiaryRelationshipToInsured : tertiaryRelationshipToInsuredId,
                            tertiaryIssueDate : tertiaryIssueDate,
                            tertiaryExpirationDate : tertiaryExpirationDate,
                            tertiaryBenefitSandNotes : tertiaryBenefitSandNotes,
                            hasPolicyIsCapitated : hasPolicyIsCapitatedBool,
                            hasCollectCoinsurance : hasCollectCoinsuranceBool
                        };

                        mappedInsPatientRecordsArr.push({
                            srIndex: srIndex, 
                            insPatient: insPatient
                        });

                    }
                    else
                    {
                        resStatus = -1;
                    }

                    importValidityStatusArr[srIndex] = isValidPatientRecord;
                    importValidityStatusMsgArr[srIndex] = patientValidityMsg;

                }));


                if(resStatus === 1)
                {
                    let tempMappedInsPatientRecordsArr = mappedInsPatientRecordsArr;

                    if(tempMappedInsPatientRecordsArr.length > 0)
                    {
                        let currMaxId = await ConsortiumPatientService.getCurrentHighestConsortiumPatientId(consortiumId);
                        await Promise.all((tempMappedInsPatientRecordsArr).map(async (mappedPatientRecord, recordIndex) =>
                        {
                            let isValidPatientRecord = true;
                            let patientValidityMsg = 'Success';

                            currMaxId += 1;
                            let srIndex = mappedPatientRecord.srIndex;
                            let insPatient = mappedPatientRecord.insPatient;

                            insPatient.patientId = currMaxId;

                            let savedConsortiumPatient = await ConsortiumPatientService.saveConsortiumPatient(req,insPatient);

                            if(savedConsortiumPatient)
                            {
                                let savedConsortiumPatientId = savedConsortiumPatient._id;
                                responseObj.id = savedConsortiumPatientId;
                            }
                            else
                            {
                                isValidPatientRecord = false;
                                patientValidityMsg = AppConfigNotif.SERVER_ERROR;
                            }
                                                
                            importValidityStatusArr[srIndex] = isValidPatientRecord;
                            importValidityStatusMsgArr[srIndex] = patientValidityMsg;
                        }));

                        await AppCommonService.generateConsortiumPatientIdForImport(consortiumId, currMaxId);
                    }

                    resMsg = 'All the Patient details were successfully imported';
                }
                else if(resStatus === -1)
                {
                    resMsg = 'Some the Patient details were invalid. So the import could not be processed.';
                }
                
                // responseObj.mappedInsPatientRecordsArr = mappedInsPatientRecordsArr;
                responseObj.importValidityStatusArr = importValidityStatusArr;
                responseObj.importValidityStatusMsgArr = importValidityStatusMsgArr;
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationPatient Retrieval Unsuccesful " + e;
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

