var ConsortiumService = require('../services/consortium.service')
var ConsortiumUserService = require('../services/consortiumUser.service')
var AppCommonService = require('../services/appcommon.service')
var AppMailService = require('../services/appMail.service')
var AppDataSanitationService = require('../services/appDataSanitation.service');
var ConsortiumUserRoleService = require('../services/consortiumUserRole.service');
var ConsortiumUserModuleService = require('../services/consortiumUserModule.service');
var AppUploadService = require('../services/appUpload.service')
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppConfigConst = require('../appconfig-const')
var AppConfigModuleName = require('../appconfig-module-name');
var mongodb = require("mongodb");
var mongoose = require('mongoose');

// Saving the context of this module inside the _the variable

_this = this
var thisModule = AppConfigModule.MOD_CONSORTIUM_USER;
var thisModulename = AppConfigModuleName.MOD_CONSORTIUM_USER;

exports.authenticateConsortiumUser = async function(req, res, next)
{
    var emailOfficial =  req.body.emailOfficial;
    var consortiumShortCode =  req.body.consortiumShortCode;
    var password =  req.body.password;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    if(consortiumShortCode !== "" && emailOfficial !== "" && password !== "")
    {
        try
        {
            var fetchedConsortium = await ConsortiumService.findConsortiumByCode(consortiumShortCode,true);
            if(fetchedConsortium)
            {
                const consortiumId = fetchedConsortium._id;
                var fetchedConsortiumUser = await ConsortiumUserService.findConsortiumUserByConsortiumIdAndEmail(consortiumId, emailOfficial);

                if(fetchedConsortiumUser)
                {
                    let isAuthenticated = await ConsortiumUserService.comparePassword(password, fetchedConsortiumUser.password);
                    if(isAuthenticated)
                    {
                        if(fetchedConsortiumUser.isActive === 1)
                        {
                            resStatus = 1;

                            const userKey = await ConsortiumUserService.createConsortiumUserSession(req, consortiumId, fetchedConsortiumUser._id);
                          
                            const userFullname = fetchedConsortiumUser.userFullName;
                            const roleId = fetchedConsortiumUser.consortiumUserRole._id;
                            const emailOfficial = fetchedConsortiumUser.emailOfficial;

                            let moduleData = [];
                            let moduleRights = await ConsortiumUserRoleService.getAllRoleModuleRights(roleId);

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
                                    rightObj.emailOfficial = rights.emailOfficial;

                                    moduleData.push(rightObj);
                                }
                            });

                            let consortiumLocationsCount = 0;
                            if(Array.isArray(fetchedConsortiumUser.consortiumLocations))
                            {
                                consortiumLocationsCount = (fetchedConsortiumUser.consortiumLocations).length;
                            }


                            let selConsortiumLocation;
                            let selConsortiumLocationId = '';
                            let selConsortiumLocationName = '';
                            let selTimeZoneOption;
                            let selTimeZoneName = '';
                            let selTimeZoneOffset = '';
                            let selTimeZoneOffsetStr = '';

                            if(consortiumLocationsCount >= 1 && (fetchedConsortiumUser.defaultConsortiumLocation === null || fetchedConsortiumUser.defaultConsortiumLocation === undefined))
                            {
                                let fetchedFirstConsortiumLocationId = fetchedConsortiumUser.consortiumLocations[0]._id;

                                var updConsortiumUser = {
                                    id: fetchedConsortiumUser._id,
                                    defaultConsortiumLocation : fetchedFirstConsortiumLocationId
                                };
                               
                                let savedConsortiumUser = await ConsortiumUserService.saveConsortiumUser(updConsortiumUser);
                                if(savedConsortiumUser)
                                {
                                    selConsortiumLocation = fetchedConsortiumUser.consortiumLocations[0];
                                }

                            }
                            else if(fetchedConsortiumUser.defaultConsortiumLocation && fetchedConsortiumUser.defaultConsortiumLocation !== undefined) {
                              selConsortiumLocation = fetchedConsortiumUser.defaultConsortiumLocation;
                            }

                            if(selConsortiumLocation)
                            {
                                selConsortiumLocationId = AppCommonService.encryptStringData(selConsortiumLocation._id + '');
                                selConsortiumLocationName = selConsortiumLocation.locationName;
                                selTimeZoneOption = selConsortiumLocation.timeZoneOption;

                                if(selTimeZoneOption)
                                {
                                    selTimeZoneName = selTimeZoneOption.timeZoneName;
                                    selTimeZoneOffset = selTimeZoneOption.timeZoneOffset;
                                    selTimeZoneOffsetStr = selTimeZoneOption.timeZoneOffsetStr;
                                }

                            }

                            const consortiumName = fetchedConsortium.consortiumName;
                            let consortiumJobTypes = fetchedConsortium.consortiumJobTypes;

                            responseObj.userName = userFullname;
                            responseObj.userKey = userKey;
                            responseObj.modules = moduleData;
                            responseObj.emailOfficial = emailOfficial;
                            responseObj.consortiumName = consortiumName;
                            responseObj.consortiumLocationsCount = consortiumLocationsCount;
                            responseObj.selConsortiumLocationId = selConsortiumLocationId;
                            responseObj.selConsortiumLocationName = selConsortiumLocationName;
                            responseObj.selTimeZoneName = selTimeZoneName;
                            responseObj.selTimeZoneOffset = selTimeZoneOffset;
                            responseObj.selTimeZoneOffsetStr = selTimeZoneOffsetStr;
                            responseObj.consortiumJobTypes = consortiumJobTypes;
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
                else
                {
                    resStatus = -1;
                    resMsg = "Organization User Authentication Failed. Try Again.";
                }
            }
            else
            {
                resStatus = -1;
                resMsg = "Organization User Authentication Failed. Try Again.";
            }            
        }
        catch(e)
        {
            resStatus = -1;
            httpStatus = 400;
            resMsg = "Organization User Authentication Failed. Try Again. " + e;
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

exports.sendConsortiumUserCredentials = async function(req, res, next)
{
    var userId =  req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;

    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);
    var consortiumId = await AppCommonService.getConsortiumIdFromRequest(req);

    if(!consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(userId !== undefined && userId != "")
    {
        var hasRights = await AppCommonService.checkConsortiumUserHasModuleRights(consortiumUser, thisModule, AppConfigModule.RIGHT_EDIT);
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                var fetchedConsortiumUser = await ConsortiumUserService.findConsortiumUserById(req, userId, false);
                if(fetchedConsortiumUser) 
                {
                    resStatus = 1;
                    resMsg = "Credentials mailed successfully";

                    let password = AppCommonService.generatedSystemUserPassword();

                    var user = {
                        id: userId,
                        password: password,
                        updatedBy: consortiumUserId
                    };
                    let savedConsortiumUser = await ConsortiumUserService.saveConsortiumUser(user);

                    await AppMailService.sendConsortiumUserCredentialsMail(req, consortiumId, userId, password);
                }
                else {
                    resStatus = -1;
                    resMsg = AppConfigNotif.INVALID_DATA;
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "OrganizationUser Creation was Unsuccesful" + e;
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

exports.loadConsortiumUserProfile = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(consortiumUserId !== undefined && consortiumUserId != "")
    {
        try
        {
            await AppCommonService.setConsortiumUserAppAccessed(req);

            var fetchedConsortiumUser = await ConsortiumUserService.findConsortiumUserById(req, consortiumUserId, true);
            if(fetchedConsortiumUser) 
            {
                resStatus = 1;
                responseObj.consortiumUser = fetchedConsortiumUser;
            }
            else {
                resStatus = -1;
                resMsg = AppConfigNotif.INVALID_DATA;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationUser Creation was Unsuccesful" + e;
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

exports.loadConsortiumLocationSelectList = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(consortiumUserId !== undefined && consortiumUserId != "")
    {
        try
        {
            await AppCommonService.setConsortiumUserAppAccessed(req);

            var fetchedConsortiumUser = await ConsortiumUserService.findConsortiumUserById(req, consortiumUserId, true);
            if(fetchedConsortiumUser) 
            {
                let consortiumLocations = fetchedConsortiumUser.consortiumLocations;
                let defaultConsortiumLocation = fetchedConsortiumUser.defaultConsortiumLocation;

                let consortiumLocationsCount = 0;
                if(Array.isArray(consortiumLocations))
                {
                    consortiumLocationsCount = consortiumLocations.length;
                }

                let compiledConsortiumLocations = [];
                if(consortiumLocationsCount > 0)
                {
                    await Promise.all((consortiumLocations).map(async (consortiumLocation,consortiumLocationIndex) => {

                        if(consortiumLocation.isActive > 0)
                        {
                            let isDefaultSelected = false;
                            if(defaultConsortiumLocation && defaultConsortiumLocation !== undefined)
                            {
                                if((defaultConsortiumLocation._id + '') === (consortiumLocation._id + ''))
                                {
                                    isDefaultSelected = true;
                                }
                            }

                            compiledConsortiumLocations.push({
                                id : consortiumLocation._id,
                                text : consortiumLocation.locationName,
                                timeZoneOption : consortiumLocation.timeZoneOption,
                                isDefaultSelected : isDefaultSelected,
                            })
                        }
                        
                    }));
                }

                resStatus = 1;
                responseObj.consortiumLocations = compiledConsortiumLocations;
            }
            else {
                resStatus = -1;
                resMsg = AppConfigNotif.INVALID_DATA;
            }
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationUser Creation was Unsuccesful" + e;
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

exports.setDefaultConsortiumLocation = async function(req, res, next)
{
    var defaultConsortiumLocationId =  req.body.defaultConsortiumLocation;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(consortiumUserId !== undefined && consortiumUserId != "" && defaultConsortiumLocationId !== undefined && defaultConsortiumLocationId && defaultConsortiumLocationId !== '')
    {
        try
        {
            await AppCommonService.setConsortiumUserAppAccessed(req);

            var fetchedConsortiumUser = await ConsortiumUserService.validateConsortiumLocationForDefault(consortiumUserId, defaultConsortiumLocationId);
            if(fetchedConsortiumUser) 
            {
                var updConsortiumUser = {
                    id: fetchedConsortiumUser._id,
                    defaultConsortiumLocation : defaultConsortiumLocationId
                };
               
                let savedConsortiumUser = await ConsortiumUserService.saveConsortiumUser(updConsortiumUser);
                if(savedConsortiumUser)
                {
                    resStatus = 1;
                    const compiledReq = AppCommonService.compileRequestWithSkipSendResponse(req);
                    responseObj = await exports.reloadConsortiumUserDetailsAndRights(compiledReq, res, next);
                   
                }
                else
                {
                    resStatus = -1;
                    resMsg = AppConfigNotif.SERVER_ERROR;
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
            resMsg = "OrganizationUser Creation was Unsuccesful" + e;
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


exports.checkConsortiumUserPasswordValidity = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var password = req.body.password;

    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(consortiumUserId !== undefined && consortiumUserId != "" && password !== undefined && password != "")
    {
        try
        {
            var fetchedConsortiumUser = await ConsortiumUserService.getConsortiumUserBaseObjectById(consortiumUserId, false);
            if(fetchedConsortiumUser) 
            {
                let isAuthenticated = await ConsortiumUserService.comparePassword(password, fetchedConsortiumUser.password);
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
            resMsg = "OrganizationUser Creation was Unsuccesful" + e;
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

exports.changeConsortiumUserPassword = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var currentPassword = req.body.currentPassword;
    var newPassword = req.body.newPassword;

    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(consortiumUserId !== undefined && consortiumUserId != "" && currentPassword !== undefined && currentPassword != "" && newPassword !== undefined && newPassword != "")
    {
        try
        {
            await AppCommonService.setConsortiumUserAppAccessed(req);

            var fetchedConsortiumUser = await ConsortiumUserService.getConsortiumUserBaseObjectById(consortiumUserId, false);
            if(fetchedConsortiumUser) {
                let isAuthenticated = await ConsortiumUserService.comparePassword(currentPassword, fetchedConsortiumUser.password);
                if(isAuthenticated) {
                    resStatus = 1;

                    const updateDone = await ConsortiumUserService.updatePassword(req, consortiumUserId, newPassword);
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
            resMsg = "OrganizationUser Creation was Unsuccesful" + e;
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

exports.reloadConsortiumUserDetailsAndRights = async function(req, res, next)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var skipSend = AppCommonService.getSkipSendResponseValue(req);

    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortium = await AppCommonService.getConsortiumFromRequest(req);

    if(!consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        try
        {
            let fetchedConsortiumUser = await ConsortiumUserService.findConsortiumUserById(req, consortiumUser._id);

            const userFullname = consortiumUser.userFullName;
            const roleId = consortiumUser.consortiumUserRole;
            const emailOfficial = consortiumUser.emailOfficial;

            let moduleData = [];
            let moduleRights = await ConsortiumUserRoleService.getAllRoleModuleRights(roleId);

            moduleRights.forEach(function(rights) {
                if(rights.module)
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

            let consortiumLocationsCount = 0;
            if(Array.isArray(fetchedConsortiumUser.consortiumLocations))
            {
                consortiumLocationsCount = (fetchedConsortiumUser.consortiumLocations).length;
            }

            let selConsortiumLocation;
            let selConsortiumLocationId = '';
            let selConsortiumLocationName = '';
            let selTimeZoneOption;
            let selTimeZoneName = '';
            let selTimeZoneOffset = '';
            let selTimeZoneOffsetStr = '';

            if(consortiumLocationsCount === 1 && (fetchedConsortiumUser.defaultConsortiumLocation === null || fetchedConsortiumUser.defaultConsortiumLocation === undefined))
            {
                let fetchedFirstConsortiumLocationId = fetchedConsortiumUser.consortiumLocations[0]._id;

                var updConsortiumUser = {
                    id: fetchedConsortiumUser._id,
                    defaultConsortiumLocation : fetchedFirstConsortiumLocationId
                };
              
                let savedConsortiumUser = await ConsortiumUserService.saveConsortiumUser(updConsortiumUser);
                if(savedConsortiumUser)
                {
                    selConsortiumLocation = fetchedConsortiumUser.consortiumLocations[0];
                }

            }
            else if(fetchedConsortiumUser.defaultConsortiumLocation && fetchedConsortiumUser.defaultConsortiumLocation !== undefined) {
              selConsortiumLocation = fetchedConsortiumUser.defaultConsortiumLocation;
            }

            if(selConsortiumLocation)
            {
                selConsortiumLocationId = AppCommonService.encryptStringData(selConsortiumLocation._id + '');
                selConsortiumLocationName = selConsortiumLocation.locationName;
                selTimeZoneOption = selConsortiumLocation.timeZoneOption;

                if(selTimeZoneOption)
                {
                    selTimeZoneName = selTimeZoneOption.timeZoneName;
                    selTimeZoneOffset = selTimeZoneOption.timeZoneOffset;
                    selTimeZoneOffsetStr = selTimeZoneOption.timeZoneOffsetStr;
                }

            }

            const consortiumName = consortium.consortiumName;
            let consortiumJobTypes = fetchedConsortiumUser.consortium.consortiumJobTypes;

            resStatus = 1;
            responseObj.userName = userFullname;
            responseObj.modules = moduleData;
            responseObj.emailOfficial = emailOfficial;
            responseObj.consortiumName = consortiumName;
            responseObj.consortiumLocationsCount = consortiumLocationsCount;
            responseObj.selConsortiumLocationId = selConsortiumLocationId;
            responseObj.selConsortiumLocationName = selConsortiumLocationName;
            responseObj.selTimeZoneName = selTimeZoneName;
            responseObj.selTimeZoneOffset = selTimeZoneOffset;
            responseObj.selTimeZoneOffsetStr = selTimeZoneOffsetStr;
            responseObj.consortiumJobTypes = consortiumJobTypes;
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "SuperUser Creation was Unsuccesful" + e;
        }
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


exports.logoutConsortiumUser = async function(req, res, next) 
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);

    if(!consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else
    {
        try
        {
            await ConsortiumUserService.removeConsortiumUserSession(req);
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

exports.resendConsortiumUserOTP = async function(req, res, next)
{
    var emailOfficial =  req.body.emailOfficial;
    var consortiumShortCode =  req.body.consortiumShortCode;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    if(consortiumShortCode !== "" && emailOfficial !== "")
    {
        try
        {
            var fetchedConsortium = await ConsortiumService.findConsortiumByCode(consortiumShortCode);
            if(fetchedConsortium)
            {
                const consortiumId = fetchedConsortium._id;
                var fetchedConsortiumUser = await ConsortiumUserService.findConsortiumUserByConsortiumIdAndEmail(consortiumId, emailOfficial);

                if(fetchedConsortiumUser)
                {
                    if(fetchedConsortiumUser.isActive === 1)
                    {
                        resStatus = 1;
                        var emailOtp = await ConsortiumUserService.createConsortiumUserResetPasswordOtp(fetchedConsortiumUser._id);
                        await AppMailService.sendConsortiumUserResetPasswordMail(fetchedConsortiumUser, emailOtp);

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
                    resMsg = "Organization User Authentication Failed. Try Again.";
                }
            }
            else
            {
                resStatus = -1;
                resMsg = "Organization User Authentication Failed. Try Again.";
            }            
        }
        catch(e)
        {
            resStatus = -1;
            httpStatus = 400;
            resMsg = "Organization User Authentication Failed. Try Again. " + e;
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


exports.resetConsortiumUserPassword = async function(req, res, next)
{
    var email =  req.body.email;
    var consortiumShortCode =  req.body.consortiumShortCode;
    var otp =  req.body.otp;
    var password =  req.body.password;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    if(consortiumShortCode !== "" && email !== "" && otp !== "" && password !== "")
    {
        try
        {
            var fetchedConsortium = await ConsortiumService.findConsortiumByCode(consortiumShortCode);
            if(fetchedConsortium)
            {
                const consortiumId = fetchedConsortium._id;
                var fetchedConsortiumUser = await ConsortiumUserService.findConsortiumUserByConsortiumIdAndEmail(consortiumId, email);

                if(fetchedConsortiumUser)
                {
                    const consortiumUserId = fetchedConsortiumUser._id;
                    if(fetchedConsortiumUser.isActive === 1)
                    {
                        resStatus = 1;
                        const resetPasswordOtp = await ConsortiumUserService.getConsortiumUserResetPasswordOtp(consortiumUserId);
                        let canBeVerified = await ConsortiumUserService.comparePassword(otp, resetPasswordOtp);
                        
                        if(canBeVerified === true) 
                        {
                            resStatus = 1;
                            resMsg = 'Password reset successful';
    
                            await ConsortiumUserService.removeExistingConsortiumUserOtps(consortiumUserId, false, true);
    
                            const updateDone = await ConsortiumUserService.updatePassword(req, consortiumUserId, password);
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
                    resMsg = "Organization User Authentication Failed. Try Again.";
                }
            }
            else
            {
                resStatus = -1;
                resMsg = "Organization User Authentication Failed. Try Again.";
            }            
        }
        catch(e)
        {
            resStatus = -1;
            httpStatus = 400;
            resMsg = "Organization User Authentication Failed. Try Again. " + e;
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


exports.registerConsortiumUserMessagingToken = async function (req, res, next) {

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var msgToken = req.body.msgToken;

    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
    var consortiumUserId = await AppCommonService.getConsortiumUserIdFromRequest(req);
    const sessionType = await AppCommonService.getSessionTypeFromRequest(req);

    if(!consortiumUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(consortiumUserId !== undefined && consortiumUserId != "" )
    {
        try
        {
            await AppCommonService.setConsortiumUserAppAccessed(req);

            let existingSessionsWithMessaginToken = await ConsortiumUserService.getConsortiumUserSessionsByMessagingToken(consortiumUserId, msgToken,sessionType);
            if (existingSessionsWithMessaginToken !== undefined && existingSessionsWithMessaginToken.length > 0) {
                await Promise.all((existingSessionsWithMessaginToken).map(async (existingSession) => {
                    await ConsortiumUserService.removeConsortiumUserSessionById(existingSession._id);
                }));
            }

            const sessToken = await AppCommonService.getConsortiumUserSessionTokenFromRequest(req);
            await ConsortiumUserService.updateConsortiumUserSessionsMessagingToken(consortiumUserId, sessToken, msgToken);
            resStatus = 1;
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "OrganizationUser Creation was Unsuccesful" + e;
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