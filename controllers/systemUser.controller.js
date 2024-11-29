var SystemUserService = require('../services/systemUser.service')
var SystemUserRoleService = require('../services/systemUserRole.service')
var SystemPreliminaryAttachmentService = require('../services/systemPreliminaryAttachment.service')
var AppCommonService = require('../services/appcommon.service')
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppMailService = require('../services/appMail.service')
var AppUploadService = require('../services/appUpload.service')
var AppConfigModuleName = require('../appconfig-module-name');
var AppConfigUploadsModule = require('../appconfig-uploads-module');
var SystemUserDaywiseWorkAllocationService = require('../services/systemUserDaywiseWorkAllocation.service')
var _ = require('lodash')
var AppConfigConst = require('../appconfig-const')
var mongodb = require("mongodb");
var mongoose = require('mongoose');
var moment = require("moment");
var momentTZ = require('moment-timezone');

// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_SYSTEM_USER;
var thisModulename = AppConfigModuleName.MOD_SYSTEM_USER;

exports.saveSystemUser = async function(req,res)
{
    var userId = req.body.id;
    var userFullName = req.body.userFullName;
    var role = req.body.role;
    var email =  req.body.email;
    var mobileNo = req.body.mobileNo;
    var gender = req.body.gender;
    var birthDate = req.body.birthDate;
    var department = req.body.department;
    var designation = req.body.designation;
    var alternatePhoneNumber = req.body.alternatePhoneNumber;
    var audioMinutes = req.body.audioMinutes;
    var pseudoName = req.body.pseudoName;
    var transcriptorRole = req.body.transcriptorRole;
    var profilePhotoPreliminaryAttachmentId = req.body.profilePhotoPreliminaryAttachmentId;

    if(!userId)
    userId = '';

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
    else if(userFullName !== undefined && userFullName !== "" && pseudoName !== undefined && pseudoName !== '')
    { 
        var hasAddRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_ADD);
        var hasEditRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if((userId == "" && !hasAddRights) || (userId != "" && !hasEditRights))
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                await AppCommonService.setSystemUserAppAccessed(req);

                var systemUser = {
                    email: email,
                    pseudoName : pseudoName,
                    mobileNo: mobileNo,
                    userFullName: userFullName,
                    role: role,
                    transcriptorRole : transcriptorRole,
                    gender: gender,
                    birthDate: birthDate,
                    department: department,
                    designation: designation,
                    alternatePhoneNumber: alternatePhoneNumber,
                    audioMinutes: audioMinutes,
                    updatedBy : systemUserId
                };
                
                let password = AppCommonService.generatedSystemUserPassword();

                if(userId == "")
                {
                    systemUser.createdBy = systemUserId;
                    systemUser.isDeleted = 0;
                    systemUser.isActive = 1;
                    systemUser.password = password;
                }
                else
                {
                    systemUser.id = userId;
                }

                if(profilePhotoPreliminaryAttachmentId !== '')
                {
                    const preliminaryAttachment = await SystemPreliminaryAttachmentService.findSystemPreliminaryAttachmentById(req, profilePhotoPreliminaryAttachmentId);
                                        
                    if(preliminaryAttachment)
                    {
                        let profilePhotoImageFilePath = await AppUploadService.moveSystemPreliminaryAttachmentToSystemUserAttachment(preliminaryAttachment);
                        
                        if(profilePhotoImageFilePath && profilePhotoImageFilePath !== "")
                        {
                            var compImageFilePath = AppCommonService.compileUploadedImageFileNamesFromFileName(profilePhotoImageFilePath);

                            if(compImageFilePath)
                            {
                                systemUser.profilePhotoFilePathActual = compImageFilePath.actual;
                                systemUser.profilePhotoFilePathThumb = compImageFilePath.thumb;

                                systemUser.profileImageActualUrl = await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_SYSTEM_USER,compImageFilePath.actual); //
                                systemUser.profileImageThumbUrl = await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(AppConfigUploadsModule.MOD_SYSTEM_USER,compImageFilePath.thumb); //
                            
                                const attFileUrlExpiresAt = AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); //

                                systemUser.profileUrlExpiresAt = attFileUrlExpiresAt;
                            }
                        }
                    }
                }


                let savedSystemUser = await SystemUserService.saveSystemUser(systemUser,req);

                if(savedSystemUser)
                {
                    let savedSystemUserId = savedSystemUser._id;

                    if(savedSystemUser && savedSystemUser.isAdd === true)
                    {
                        await AppMailService.sendSystemUserCredentialsMail(savedSystemUser._id, password);
                    }
                   
                    responseObj.id = savedSystemUserId;
    
                    resStatus = 1;
                    resMsg = AppCommonService.getSavedMessage(thisModulename);      
                }
                else{
                    resStatus = -1;
                }
            
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "SystemUser Retrieval Unsuccesful " + e;
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

exports.getSystemUsers = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let filteredRecords = 0;
    let userData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);

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

                let userList = await SystemUserService.getSystemUsers(req);

                resStatus = 1;
                if(userList != null)
                {
                    userData = userList.results;
                    totalRecords = userList.totalRecords;
                    filteredRecords = userList.filteredRecords;
                    
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "SystemUsers could not be fetched" + e;
            }
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.draw = 0;
    responseObj.recordsTotal = totalRecords;
    responseObj.recordsFiltered = filteredRecords;
    responseObj.data = userData;

    return res.status(httpStatus).json(responseObj)
}

exports.selectSystemUserList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let userData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            let userList = await SystemUserService.getSystemUsersForSelect(req);

            resStatus = 1;
            if(userList != null)
            {
                totalRecords = userList.length;
                userData = userList;
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
    responseObj.results = userData;

    return res.status(httpStatus).json(responseObj)
}

exports.removeSystemUser = async function(req, res, next){

    var id = req.params.id;

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
    else if(id != "")
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
                const compiledReq = AppCommonService.compileRequestWithSkipSendResponse(req);
                compiledReq.body._id = id;
                const canBeDeletedResponse = await exports.checkCanBeDeleted(compiledReq, res, next);
                if(canBeDeletedResponse)
                {
                    if(canBeDeletedResponse.status > 0)
                    {
                        await AppCommonService.setSystemUserAppAccessed(req);

                        var user = {
                            id,
                            isDeleted: 1,
                            updatedBy: systemUserId
                        }

                        let savedUser = await SystemUserService.saveSystemUser(user);

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
                resMsg = "SystemUser Deletion Unsuccesful" + e;
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

exports.changeSystemUserStatus = async function(req, res, next)
{
    var id = req.body._id;
    var isActive = req.body.isActive;

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
    else if(id != "")
    {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
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

                if(isActive === 0 || isActive === false)
                {
                    let activeSystemUsers = await SystemUserService.getSystemUsersForSelect(req);
                    if(activeSystemUsers.length <= 1)
                    {
                        resStatus = -1;
                        resMsg = 'This seems to be the last operable user. So cannot deactivate them.';
                    }
                }

                if(resStatus !== -1)
                {
                    var user = {
                        id: id,
                        isActive: isActive,
                        updatedBy: systemUserId
                    }

                    let savedSystemUser = await SystemUserService.saveSystemUser(user);

                    resStatus = 1;
                    resMsg = AppCommonService.getStatusChangedMessage();
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "SystemUser Status Change Unsuccesful" + e;
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

exports.authenticateSystemUser = async function(req, res, next)
{
    var email =  req.body.email;
    var password =  req.body.password;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    if(email !== "" && password !== "")
    {
        try
        {
            var fetchedSystemUser = await SystemUserService.findSystemUserByEmail(email);

            if(fetchedSystemUser !== undefined && fetchedSystemUser !== null)
            {
                let isAuthenticated = await SystemUserService.comparePassword(password, fetchedSystemUser.password);
                if(isAuthenticated)
                {
                    resStatus = 1;

                    const userKey = await SystemUserService.createSystemUserSession(req, fetchedSystemUser._id);

                    const userFullname = fetchedSystemUser.userFullName;
                    const roleId = fetchedSystemUser.role;
                    const email = fetchedSystemUser.email;

                    let moduleData = [];
                    let moduleRights = await SystemUserRoleService.getAllRoleModuleRights(roleId);

                    moduleRights.forEach(function(rights) {
                        if(rights.module && rights.module.isDeleted === 0)
                        {
                            let rightObj = {};
                            rightObj.moduleName = rights.module.moduleName;
                            rightObj.view = rights.view;
                            rightObj.viewAll = rights.viewAll;
                            rightObj.add = rights.add;
                            rightObj.edit = rights.edit;
                            rightObj.delete = rights.delete;
                            rightObj.print = rights.print;
                            rightObj.download = rights.download;
                            rightObj.email = rights.email;

                            moduleData.push(rightObj);
                        }
                    });

                    responseObj.userName = userFullname;
                    responseObj.userKey = userKey;
                    responseObj.modules = moduleData;
                    responseObj.email = email;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "User Authentication Failed. Try Again.";
                }
            }
            else
            {
                resStatus = -1;
                resMsg = "SystemUser Authentication Failed. Try Again.";
            }
        }
        catch(e)
        {
            resStatus = -1;
            httpStatus = 400;
            resMsg = "SystemUser Authentication Failed. Try Again. " + e;
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj)
}

exports.checkEmailValidity = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var email = req.body.email;
    var userId = req.body._id;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        try
        {
            let systemUser = await SystemUserService.checkSystemUserEmailForDuplication(userId, email);
            if(systemUser)
            {
                resStatus = -1;
                resMsg = 'SystemUser with the email already exists';
            }
            else
            {
                resStatus = 1;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "SystemUser could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj)
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
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
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
                let organizations;
                
                if(organizations) 
                {
                    resStatus = -1;
                    resMsg = 'This Super User is associated with.';
                }
                else
                {
                    let activeSystemUsers = await SystemUserService.getSystemUsersForSelect(req);
                    if(activeSystemUsers.length <= 1)
                    {
                        resStatus = -1;
                        resMsg = 'This seems to be the last operable user. So cannot remove them.';
                    }
                    else
                    {
                        resStatus = 1;
                    }
                }            
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Department Status Change Unsuccesful" + e;
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

exports.sendSystemUserCredentials = async function(req, res, next)
{
    var userId =  req.body._id;

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
    else if(userId !== undefined && userId != "")
    {
        var hasRights = await AppCommonService.checkSystemUserHasModuleRights(systemUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                var fetchedSystemUser = await SystemUserService.findSystemUserById(userId, false);
                if(fetchedSystemUser) 
                {
                    resStatus = 1;
                    resMsg = "Credentials mailed successfully";

                    let password = AppCommonService.generatedSystemUserPassword();

                    var user = {
                        id: userId,
                        password: password,
                        updatedBy: systemUserId
                    };
                    let savedSystemUser = await SystemUserService.saveSystemUser(user);

                    await AppMailService.sendSystemUserCredentialsMail(userId, password);
                }
                else {
                    resStatus = -1;
                    resMsg = AppConfigNotif.INVALID_DATA;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "SystemUser Creation was Unsuccesful" + e;
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

exports.getSystemUserDetails = async function(req, res, next) {
    var id = req.body._id;
  
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};
  
    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
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
                await AppUploadService.checkAndGenerateModuleExpiredSignedFileUrl(AppConfigUploadsModule.MOD_SYSTEM_USER, id);

                fetchedSystemUser = await SystemUserService.findSystemUserById(id, true);
    
                if(fetchedSystemUser)
                {

                    responseObj.systemUser = fetchedSystemUser;
                    resStatus = 1;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "SystemUser Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "SystemUser Retrieval Unsuccesful " + e;
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

exports.loadSystemUserProfile = async function(req, res, next)
{
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
    else if(systemUserId !== undefined && systemUserId != "")
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            var fetchedSystemUser = await SystemUserService.findSystemUserById(systemUserId, true);
            if(fetchedSystemUser) {
                resStatus = 1;
                responseObj.systemUser = fetchedSystemUser;
            }
            else {
                resStatus = -1;
                resMsg = AppConfigNotif.INVALID_DATA;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "SystemUser Creation was Unsuccesful" + e;
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

exports.checkSystemUserPasswordValidity = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var password = req.body.password;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(systemUserId !== undefined && systemUserId != "" && password !== undefined && password != "")
    {
        try
        {
            var fetchedSystemUser = await SystemUserService.getSystemUserBaseObjectById(systemUserId, false);
            if(fetchedSystemUser) 
            {
                let isAuthenticated = await SystemUserService.comparePassword(password, fetchedSystemUser.password);
                if(isAuthenticated) 
                {
                    resStatus = 1;
                }
                else
                {
                    resStatus = -1;
                    resMsg = AppConfigNotif.INVALID_DATA;
                }
            }
            else 
            {
                resStatus = -1;
                resMsg = AppConfigNotif.INVALID_DATA;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "SystemUser Creation was Unsuccesful" + e;
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

exports.changeSystemUserPassword = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var currentPassword = req.body.currentPassword;
    var newPassword = req.body.newPassword;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(systemUserId !== undefined && systemUserId != "" && currentPassword !== undefined && currentPassword != "" && newPassword !== undefined && newPassword != "")
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            var fetchedSystemUser = await SystemUserService.getSystemUserBaseObjectById(systemUserId, false);
            if(fetchedSystemUser) {
                let isAuthenticated = await SystemUserService.comparePassword(currentPassword, fetchedSystemUser.password);
                if(isAuthenticated) {
                    resStatus = 1;
                  
                    const updateDone = await SystemUserService.updatePassword(systemUserId, newPassword);
                    if(!updateDone)
                    {
                        resMsg = "Password could not be updated";
                    }    
                    else
                    {
                        resMsg = "User Password Reset Successfully";
                    }
                }
                else 
                {
                  resStatus = -1;
                  resMsg = AppConfigNotif.INVALID_DATA;
                }
            }
            else {
              resStatus = -1;
              resMsg = AppConfigNotif.INVALID_DATA;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "SystemUser Creation was Unsuccesful" + e;
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

exports.reloadSystemUserRoleRights = async function(req, res, next)
{
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
        try
        {
            let moduleData = [];
            let moduleRights = await SystemUserRoleService.getAllRoleModuleRights(systemUser.role);

            moduleRights.forEach(function(rights) {
                if(rights.module && rights.module.isDeleted === 0)
                {
                    let rightObj = {};
                    rightObj.moduleName = rights.module.moduleName;
                    rightObj.view = rights.view;
                    rightObj.viewAll = rights.viewAll;
                    rightObj.add = rights.add;
                    rightObj.edit = rights.edit;
                    rightObj.delete = rights.delete;
                    rightObj.print = rights.print;
                    rightObj.download = rights.download;
                    rightObj.email = rights.email;

                    moduleData.push(rightObj);
                }
            });
            
            resStatus = 1;
            responseObj.modules = moduleData;
            responseObj.email = systemUser.email;
            responseObj.userFullName = systemUser.userFullName;
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "SystemUser Creation was Unsuccesful" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj);
}

exports.logoutSystemUser = async function(req, res, next) 
{
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
        try
        {
            responseObj.removeSystemUserSession = await SystemUserService.removeSystemUserSession(req);
            resStatus = 1;
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "User load was Unsuccesful " + e;
        }
    }
  
    responseObj.status = resStatus;
    responseObj.message = resMsg;
  
    return res.status(httpStatus).json(responseObj);
}

exports.resendSystemUserOTP = async function(req, res, next)
{
    var email =  req.body.email;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    if(email !== "")
    {
        try
        {
            var fetchedSystemUser = await SystemUserService.findSystemUserByEmail(email);

            if(fetchedSystemUser !== null)
            {
                if(fetchedSystemUser.isActive === 1)
                {
                    resStatus = 1;
                    var emailOtp = await SystemUserService.createSystemUserResetPasswordOtp(fetchedSystemUser._id);
                    await AppMailService.sendSystemUserResetPasswordMail(fetchedSystemUser, emailOtp);

                    resMsg = "Reset OTP mail sent";
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Your profile has been deactivated. Contact System Admin if you feel this was done by mistake.";
                }                
            }
            else
            {
                resStatus = -1;
                resMsg = "Super User Authentication Failed. Try Again.";
            }            
        }
        catch(e)
        {
            resStatus = -1;
            httpStatus = 400;
            resMsg = "Super User Authentication Failed. Try Again. " + e;
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj)
}

exports.resetSystemUserPassword = async function(req, res, next)
{
    var email =  req.body.email;
    var otp =  req.body.otp;
    var password =  req.body.password;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    if(email !== "" && otp !== "" && password !== "")
    {
        try
        {
            var fetchedSystemUser = await SystemUserService.findSystemUserByEmail(email);

            if(fetchedSystemUser !== null)
            {
                const systemUserId = fetchedSystemUser._id;
                if(fetchedSystemUser.isActive === 1)
                {
                    resStatus = 1;
                    const resetPasswordOtp = await SystemUserService.getSystemUserResetPasswordOtp(systemUserId);
                    let canBeVerified = await SystemUserService.comparePassword(otp, resetPasswordOtp);
                    
                    if(canBeVerified === true) 
                    {
                        resStatus = 1;
                        resMsg = 'Password reset successful';

                        await SystemUserService.removeExistingSystemUserOtps(systemUserId);

                        const updateDone = await SystemUserService.updatePassword(systemUserId, password);
                        if(!updateDone)
                        {
                            resMsg = "Password could not be updated";
                        }    
                        else
                        {
                            resMsg = "User Password Reset Successfully";
                        }
                    }
                    else 
                    {
                        resStatus = -1;
                        resMsg = "Incorrect OTP. Try Again.";
                    }
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Your profile has been deactivated. Contact System Admin if you feel this was done by mistake.";
                }
               
            }
            else
            {
                resStatus = -1;
                resMsg = "User Authentication Failed. Try Again.";
            }            
        }
        catch(e)
        {
            resStatus = -1;
            httpStatus = 400;
            resMsg = "User Authentication Failed. Try Again. " + e;
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj)
}


exports.selectMTSystemUserList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};


    let totalRecords = 0;
    let userData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            let userList = await SystemUserService.getMTSystemUsersForSelect(req);

            resStatus = 1;
            if(userList != null)
            {
                totalRecords = userList.length;
                userData = userList;
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
    responseObj.results = userData;

    return res.status(httpStatus).json(responseObj)
}

exports.selectQASystemUserList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};


    let totalRecords = 0;
    let userData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            let userList = await SystemUserService.getQASystemUsersForSelect(req);
            resStatus = 1;
            if(userList != null)
            {
                totalRecords = userList.length;
                userData = userList;
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
    responseObj.results = userData;

    return res.status(httpStatus).json(responseObj)
}


exports.selectStaffSystemUserList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    let totalRecords = 0;
    let userData = [];

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            let userList = await SystemUserService.getStaffSystemUsersForSelect();

            resStatus = 1;
            if(userList != null)
            {
                totalRecords = userList.length;
                userData = userList;
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
    responseObj.results = userData;

    return res.status(httpStatus).json(responseObj)
}


exports.registerSystemUserMessagingToken = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var msgToken = req.body.msgToken;

    var systemUser = await AppCommonService.getSystemUserFromRequest(req);
    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(systemUserId !== undefined && systemUserId != "" && msgToken !== undefined && msgToken != "" )
    {
        try
        {
            await AppCommonService.setSystemUserAppAccessed(req);

            let existingSessionsWithMessaginToken = await SystemUserService.getSystemUserSessionsByMessagingToken(systemUserId, msgToken);
            // responseObj.existingSessionsWithMessaginToken = existingSessionsWithMessaginToken;
            if (existingSessionsWithMessaginToken !== undefined && existingSessionsWithMessaginToken.length > 0) {
                await Promise.all((existingSessionsWithMessaginToken).map(async (existingSession) => {
                    await SystemUserService.removeSystemUserSessionById(existingSession._id);
                }));
            }

            const sessToken = await AppCommonService.getSystemUserSessionTokenFromRequest(req);
            await SystemUserService.updateSystemUserSessionsMessagingToken(systemUserId, sessToken, msgToken);

            resStatus = 1;
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "SystemUser Creation was Unsuccesful" + e;
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