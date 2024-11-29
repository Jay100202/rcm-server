var AppConfig = require('../appconfig');
var AppConfigConst = require('../appconfig-const');
var AppConfigModule = require('../appconfig-module');
var AppCommonService = require('../services/appcommon.service');
var ConsortiumChatUserTypeService = require('./consortiumChatUserType.service');
var ConsortiumChatThreadService = require('./consortiumChatThread.service');
var ConsortiumUserService = require('./consortiumUser.service');
var SystemUserService = require('./systemUser.service');
var SystemUserScheduledAppNotificationService = require('./systemUserScheduledAppNotification.service')
var ConsortiumUserScheduledAppNotificationService = require('./consortiumUserScheduledAppNotification.service')
var AppConfigUploadsModule = require('../appconfig-uploads-module');
var AppFCMApiService = require('./appFCMApi.service')
var moment = require('moment');
var momentTZ = require('moment-timezone');
var mongoose = require('mongoose');

// Saving the context of this module inside the _the variable
_this = this

CONS_DUE_SIGNED_URL_GENERATION_LIST_CHUNK_COUNT = 5;
CONS_SIGNED_URL_GENERATION_PROCESS_THREAD_SLEEP_MS = 2000;

exports.checkAndScheduleSystemUserNotification = async function () {

    var responseObj = {};
    try
    {
        let systemUserScheduledAppNotifications = await SystemUserScheduledAppNotificationService.getSystemUserScheduledAppNotificationForPushNotification();
        if(systemUserScheduledAppNotifications && systemUserScheduledAppNotifications.length > 0)
        {
            await Promise.all((systemUserScheduledAppNotifications).map(async (systemUserScheduledAppNotification, appNotifIndex) => {

                let systemUserId = systemUserScheduledAppNotification.systemUser._id;

                let title = '';
                let messageBody = '';
                let messageData = {};

                let messagingTokenArr = await SystemUserService.getSystemUserMessagingToken(systemUserId);

                responseObj[appNotifIndex] = messagingTokenArr;
                if(messagingTokenArr.length > 0)
                {
                    let consortiumChatThread = systemUserScheduledAppNotification.consortiumChatThread;
                    let consortiumChatThreadMessage = systemUserScheduledAppNotification.consortiumChatThreadMessage;
                   
                    if(consortiumChatThread)
                    {
                        title = consortiumChatThread.topic;
                    }

                    if(consortiumChatThreadMessage)
                    {
                        let systemUserName = systemUserScheduledAppNotification.systemUser !== undefined && systemUserScheduledAppNotification.systemUser !== null ? systemUserScheduledAppNotification.systemUser.userFullName : "";
                        let consortiumUserName = systemUserScheduledAppNotification.consortiumUser !== undefined && systemUserScheduledAppNotification.consortiumUser !== null ? systemUserScheduledAppNotification.consortiumUser.userFullName : '';
        
                        let messageText = consortiumChatThreadMessage.messageText;
    
                        if(systemUserName !== '')
                        {
                            messageBody = systemUserName +" : "+messageText;
                        }
    
                        if(consortiumUserName !== '')
                        {
                            messageBody = consortiumUserName +" : "+messageText;
                        }
                    }

                    messageData.consortiumChatThreadId = consortiumChatThread._id;
                    messageData.consortiumChatThreadMessageId = consortiumChatThreadMessage._id;
    
                    // console.log('systemUserId : ', systemUserId);
                    // console.log('messageData : ', messageData);
                    let performFCMApiResponse = await AppFCMApiService.performFCMApiRequest(messagingTokenArr, title, messageBody,messageData);
                    
                    // if(performFCMApiResponse)
                    {
                        await SystemUserScheduledAppNotificationService.removeSystemUserScheduledAppNotificationById(systemUserScheduledAppNotification._id);
                    }
    
                }
                else
                {
                    await SystemUserScheduledAppNotificationService.removeSystemUserScheduledAppNotificationById(systemUserScheduledAppNotification._id);
                }
             

            }));
        }
        responseObj.systemUserScheduledAppNotifications = systemUserScheduledAppNotifications;
        return responseObj;
    
    }
    catch(e)
    {
        throw Error('Error checkAndScheduleSystemUserNotification' + e)
    }
}


exports.checkAndScheduleConsortiumUserNotification = async function () {

    var responseObj = {};
    try
    {
        let consortiumUserScheduledAppNotifications = await ConsortiumUserScheduledAppNotificationService.getConsortiumUserScheduledAppNotificationForPushNotification();
        if(consortiumUserScheduledAppNotifications && consortiumUserScheduledAppNotifications.length > 0)
        {
            await Promise.all((consortiumUserScheduledAppNotifications).map(async (consortiumUserScheduledAppNotification, appNotifIndex) => {
                
                let title = '';
                let messageBody = '';
                let messageData = {};

                let consortiumUserId = consortiumUserScheduledAppNotification.consortiumUser._id;
                let messagingTokenArr = await ConsortiumUserService.getConsortiumUserMessagingTokenArr(consortiumUserId);

                responseObj[appNotifIndex] = messagingTokenArr;
                if(messagingTokenArr.length > 0)
                {
                    let consortiumChatThread = consortiumUserScheduledAppNotification.consortiumChatThread;
                    let consortiumChatThreadMessage = consortiumUserScheduledAppNotification.consortiumChatThreadMessage;
                   
                    if(consortiumChatThread)
                    {
                        title = consortiumChatThread.topic;
                    }
    
                    if(consortiumChatThreadMessage)
                    {
                        let systemUserName = consortiumUserScheduledAppNotification.systemUser !== undefined && consortiumUserScheduledAppNotification.systemUser !== null ? consortiumUserScheduledAppNotification.systemUser.userFullName : "";
                        let consortiumUserName = consortiumUserScheduledAppNotification.consortiumUser !== undefined && consortiumUserScheduledAppNotification.consortiumUser !== null ? consortiumUserScheduledAppNotification.consortiumUser.userFullName : '';
        
                        let messageText = consortiumChatThreadMessage.messageText;
    
                        if(systemUserName !== '')
                        {
                            messageBody = systemUserName +" : "+messageText;
                        }
    
                        if(consortiumUserName !== '')
                        {
                            messageBody = consortiumUserName +" : "+messageText;
                        }
    
                    }
    
                    messageData.consortiumChatThreadId = consortiumChatThread._id;
                    messageData.consortiumChatThreadMessageId = consortiumChatThreadMessage._id;
                    
                    // console.log('consortiumUserId : ', consortiumUserId);
                    // console.log('messageData : ', messageData);
                    let performFCMApiResponse = await AppFCMApiService.performFCMApiRequest(messagingTokenArr, title, messageBody,messageData);
                    // if(performFCMApiResponse)
                    {
                        await ConsortiumUserScheduledAppNotificationService.removeConsortiumUserScheduledAppNotificationById(consortiumUserScheduledAppNotification._id);
                    }
                }
                else
                {
                    await ConsortiumUserScheduledAppNotificationService.removeConsortiumUserScheduledAppNotificationById(consortiumUserScheduledAppNotification._id);
                }

            }));
        }
    
        responseObj.consortiumUserScheduledAppNotifications = consortiumUserScheduledAppNotifications;
        return responseObj;
    
    }
    catch(e)
    {
        throw Error('Error checkAndScheduleConsortiumUserNotification' + e)
    }
}



exports.checkAndScheduleCloudAssetSignedUrlGeneration = async function () {
    console.log('------------------- Inside checkAndScheduleCloudAssetSignedUrlGeneration ------------------------');
  
    try {
      var consModuleNameArr = [];
      consModuleNameArr.push(AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT);
      consModuleNameArr.push(AppConfigUploadsModule.MOD_CONSORTIUM_PRELIMINARY_ATTACHMENT);
      consModuleNameArr.push(AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT);
      consModuleNameArr.push(AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT);
      consModuleNameArr.push(AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT);
      consModuleNameArr.push(AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT);
      consModuleNameArr.push(AppConfigUploadsModule.MOD_SYSTEM_USER);
      consModuleNameArr.push(AppConfigUploadsModule.MOD_CONSORTIUM_USER);
  
      var allModuleInsUrlGenerationRecArr = [];
  
      await Promise.all((consModuleNameArr).map(async (consModuleName, consModuleIndex) => {
        var consModelAndFieldObj = exports.compileCloudAssetSignedUrlGenerationSchemaForModule(consModuleName);
        var indModuleInsUrlGenerationRecArr = await exports.checkAndScheduleCloudAssetSignedUrlGenerationForParticularModule(consModelAndFieldObj);
        allModuleInsUrlGenerationRecArr.push(indModuleInsUrlGenerationRecArr);
      }));
  
      allModuleInsUrlGenerationRecArr = allModuleInsUrlGenerationRecArr.flat();
  
      if(allModuleInsUrlGenerationRecArr.length > 0)
      {
        /* OPEN AFTER TEST */
        // await AppScheduledModuleCloudAssetSignedUrlGenerationService.insertMultipleAppScheduledModuleCloudAssetSignedUrlGenerations(allModuleInsUrlGenerationRecArr);
      }
  
      console.log('------------------- Exiting checkAndScheduleCloudAssetSignedUrlGeneration ------------------------');
  
      return allModuleInsUrlGenerationRecArr;
  
    } catch (e) {
      throw Error('Error while Fetching AppointmentType' + e)
    }
  }


exports.compileCloudAssetSignedUrlGenerationSchemaForModule = function (moduleName) {
    var consModelObj;
    var hasIsDeletedConsideration = false;
    var shouldConsiderThumbRetrieval = false;
    var consFieldNameAndUpdNameArr = [];
    var consModuleCode = moduleName;
    try {
        if(moduleName === AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT)
        {
            consModelObj = require('../models/systemPreliminaryAttachment.model');
            hasIsDeletedConsideration = true;
        
            consFieldNameAndUpdNameArr.push({ 
                currField: "attFilePath",
                updFieldUrlExpiresAt: "attFileUrlExpiresAt",
                updFieldImageAct: "attImagePathActual",
                updFieldImageThmb: "attImagePathThumb",
                updFieldFile: "attFilePath", 
                updFieldImageActUrl: "attImageActualUrl",
                updFieldImageThmbUrl: "attImageThumbUrl",
                updFieldFileUrl: "attFileUrl", 
                isFile: true  
            });
            
        }
        else if(moduleName === AppConfigUploadsModule.MOD_CONSORTIUM_PRELIMINARY_ATTACHMENT)
        {
            consModelObj = require('../models/consortiumPreliminaryAttachment.model');
            hasIsDeletedConsideration = true;
        
            consFieldNameAndUpdNameArr.push({ 
                    currField: "attFilePath",
                    updFieldUrlExpiresAt: "attFileUrlExpiresAt",
                    updFieldImageAct: "attImagePathActual",
                    updFieldImageThmb: "attImagePathThumb",
                    updFieldFile: "attFilePath", 
                    updFieldImageActUrl: "attImageActualUrl",
                    updFieldImageThmbUrl: "attImageThumbUrl",
                    updFieldFileUrl: "attFileUrl", 
                    isFile: true  
            });
        }
        else if(moduleName === AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT)
        {
            consModelObj = require('../models/consortiumPatient.model');
            hasIsDeletedConsideration = true;
    
            consFieldNameAndUpdNameArr.push({ 
                currField: "attFilePath",
                updFieldUrlExpiresAt: "attFileUrlExpiresAt",
                updFieldImageAct: "attFilePathActual",
                updFieldImageThmb: "attFilePathThumb",
                updFieldFile: "attFilePath", 
                updFieldImageActUrl: "attImageActualUrl",
                updFieldImageThmbUrl: "attImageThumbUrl",
                updFieldFileUrl: "attFileUrl", 
                isFile: true  
            });
        }
        else if(moduleName === AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT)
        {
            consModelObj = require('../models/consortiumPatientAppointment.model');
            hasIsDeletedConsideration = true;
    
            consFieldNameAndUpdNameArr.push({ 
              currField: "attFilePath",
              updFieldUrlExpiresAt: "attFileUrlExpiresAt",
              updFieldImageAct: "attFilePathActual",
              updFieldImageThmb: "attFilePathThumb",
              updFieldFile: "attFilePath", 
              updFieldImageActUrl: "attImageActualUrl",
              updFieldImageThmbUrl: "attImageThumbUrl",
              updFieldFileUrl: "attFileUrl", 
              isFile: true  
          });
        }
        else if(moduleName === AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT)
        {
            consModelObj = require('../models/consortiumPatientAppointmentDictationAttachment.model');
            hasIsDeletedConsideration = true;
    
            consFieldNameAndUpdNameArr.push({ 
                currField: "attFilePath",
                updFieldUrlExpiresAt: "attFileUrlExpiresAt",
                updFieldImageAct: "attFilePathActual",
                updFieldImageThmb: "attFilePathThumb",
                updFieldFile: "attFilePath", 
                updFieldImageActUrl: "attImageActualUrl",
                updFieldImageThmbUrl: "attImageThumbUrl",
                updFieldFileUrl: "attFileUrl", 
                isFile: true   
            });
        }
        else if(moduleName === AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT)
        {
            consModelObj = require('../models/consortiumPatientAppointmentTranscriptionAttachment.model');
            hasIsDeletedConsideration = true;
    
            consFieldNameAndUpdNameArr.push({ 
                currField: "attFilePath",
                updFieldUrlExpiresAt: "attFileUrlExpiresAt",
                updFieldImageAct: "attFilePathActual",
                updFieldImageThmb: "attFilePathThumb",
                updFieldFile: "attFilePath", 
                updFieldImageActUrl: "attImageActualUrl",
                updFieldImageThmbUrl: "attImageThumbUrl",
                updFieldFileUrl: "attFileUrl", 
                isFile: true   
            });
        }
        else if(moduleName === AppConfigUploadsModule.MOD_SYSTEM_USER)
        {
            consModelObj = require('../models/systemUser.model');
            hasIsDeletedConsideration = true;
    
            consFieldNameAndUpdNameArr.push({ 
                currField: "profilePhotoFilePathThumb",
                updFieldUrlExpiresAt: "profileUrlExpiresAt",
                updFieldImageAct: "profilePhotoFilePathActual",
                updFieldImageThmb: "profilePhotoFilePathThumb",
                updFieldFile: "", 
                updFieldImageActUrl: "attImageActualUrl",
                updFieldImageThmbUrl: "attImageThumbUrl",
                updFieldFileUrl: "", 
                isFile: false   
            });
        }
        else if(moduleName === AppConfigUploadsModule.MOD_CONSORTIUM_USER)
        {
            consModelObj = require('../models/consortiumUser.model');
            hasIsDeletedConsideration = true;
    
            consFieldNameAndUpdNameArr.push({ 
                currField: "attFilePath",
                updFieldUrlExpiresAt: "attFileUrlExpiresAt",
                updFieldImageAct: "attFilePathActual",
                updFieldImageThmb: "attFilePathThumb",
                updFieldFile: "attFilePath", 
                updFieldImageActUrl: "attImageActualUrl",
                updFieldImageThmbUrl: "attImageThumbUrl",
                updFieldFileUrl: "attFileUrl", 
                isFile: true  
            });

        }
    } 
    catch (e) 
    {
        console.log('ERROR IN compileCloudAssetSignedUrlGenerationSchemaForModule : ', e);
    }

    var consModelAndFieldObj = {
        modelObj: consModelObj,
        moduleCode: consModuleCode,
        hasIsDeletedConsideration: hasIsDeletedConsideration,
        shouldConsiderThumbRetrieval: shouldConsiderThumbRetrieval,
        fieldNameAndUpdNameArr: consFieldNameAndUpdNameArr
      }
    
      return consModelAndFieldObj;
}



exports.checkAndScheduleCloudAssetSignedUrlGenerationForParticularModule = async function (consModelAndFieldObj) {
    const currTs = AppCommonService.getCurrentTimestamp();
  
    var insUrlGenerationRecArr = [];
  
    var consModelObj = consModelAndFieldObj.modelObj;
    var consModuleCode = consModelAndFieldObj.moduleCode;
    var hasIsDeletedConsideration = consModelAndFieldObj.hasIsDeletedConsideration;
    var consFieldNameAndUpdNameArr = consModelAndFieldObj.fieldNameAndUpdNameArr;
  
    if (consModelObj && consModelObj !== undefined) {
      var consModelTableName = consModelObj.collection.name;
  
      await Promise.all((consFieldNameAndUpdNameArr).map(async (consFieldNameAndUpdNameObj) => {
        const updFieldUrlExpiresAtName = consFieldNameAndUpdNameObj.updFieldUrlExpiresAt;
        const isFile = consFieldNameAndUpdNameObj.isFile;
        const isImage = isFile === true ? false : true;
  
        const updFieldImageActName = consFieldNameAndUpdNameObj.updFieldImageAct;
        const updFieldImageThmbName = consFieldNameAndUpdNameObj.updFieldImageThmb;
        const updFieldFileName = consFieldNameAndUpdNameObj.updFieldFile;
  
        const updFieldImageActUrlName = consFieldNameAndUpdNameObj.updFieldImageActUrl;
        const updFieldImageThmbUrlName = consFieldNameAndUpdNameObj.updFieldImageThmbUrl;
        const updFieldFileUrlName = consFieldNameAndUpdNameObj.updFieldFileUrl;
  
        var fetchOptions = {};
        fetchOptions[updFieldUrlExpiresAtName] = { $lte: currTs };
        if (hasIsDeletedConsideration === true) {
          fetchOptions.isDeleted = 0;
        }
        var consModelObjArr = await consModelObj.find(fetchOptions);
    
        await Promise.all((consModelObjArr).map(async (consModelObj, consModelIndex) => {
    
          var moduleFilePathFieldNames =  {
              imageActual: {
                  filePath: updFieldImageActName,
                  fileUrl: updFieldImageActUrlName
              },
              imageThumb: {
                  filePath: updFieldImageThmbName,
                  fileUrl: updFieldImageThmbUrlName
              },
              baseFile: {
                  filePath: updFieldFileName,
                  fileUrl: updFieldFileUrlName
              }
          };
  
          var insUrlGeneration = {
            moduleCode: consModuleCode,
            moduleCollectionName: consModelTableName,
            hasIsDeletedConsideration: hasIsDeletedConsideration,
            isImage: isImage,
            moduleFilePathFieldNames: moduleFilePathFieldNames,
            modulePrimaryId: consModelObj._id,
            scheduledAt: currTs
          };
  
          insUrlGenerationRecArr.push(insUrlGeneration);
  
        }));
  
      }));
    }
  
    return insUrlGenerationRecArr;
  }



exports.performScheduledCloudAssetSignedUrlGenerations = async function () {
    console.log('------------------- Inside performScheduledCloudAssetSignedUrlGenerations ------------------------');
    var dueModuleCloudAssetSignedUrlGenerations = [];// = await AppScheduledModuleCloudAssetSignedUrlGenerationService.getDueAppScheduledModuleCloudAssetSignedUrlGenerations(CONS_DUE_SIGNED_URL_GENERATION_LIST_CHUNK_COUNT);
  
    var consModuleIndUpdObjArr = [];
    await Promise.all(dueModuleCloudAssetSignedUrlGenerations.map(async (dueModuleCloudAssetSignedUrlGeneration, dueIndex) => {
      try {
        const consModuleIndUpdObj = await exports.generateAndStoreScheduledIndCloudAssetSignedUrl(dueModuleCloudAssetSignedUrlGeneration);
        consModuleIndUpdObjArr[dueIndex] = consModuleIndUpdObj;
      }
      catch (e) {
        console.log('ERROR IN performScheduledCloudAssetSignedUrlGenerations : ', e);
      }
    }));
  
    console.log('------------------- Exiting performScheduledCloudAssetSignedUrlGenerations ------------------------');
  
    return consModuleIndUpdObjArr;
  }
  
exports.generateAndStoreScheduledIndCloudAssetSignedUrl = async function (dueModuleCloudAssetSignedUrlGeneration) {
    console.log('------------------- Inside generateAndStoreScheduledIndCloudAssetSignedUrl ------------------------');
  
    console.log('dueModuleCloudAssetSignedUrlGeneration : ', dueModuleCloudAssetSignedUrlGeneration);
  
    var consModuleIndObj;
  
    let currTs = AppCommonService.getCurrentTimestamp();
    const currAssetUrlExpiryConsideration = currTs * 1;
  
    let dueModuleCloudAssetSignedUrlGenerationId = dueModuleCloudAssetSignedUrlGeneration._id;
    let moduleCollectionName = dueModuleCloudAssetSignedUrlGeneration.moduleCollectionName;
    let moduleCode = dueModuleCloudAssetSignedUrlGeneration.moduleCode;
    let hasIsDeletedConsideration = dueModuleCloudAssetSignedUrlGeneration.hasIsDeletedConsideration;
    let isImage = dueModuleCloudAssetSignedUrlGeneration.isImage;
    let modulePrimaryId = dueModuleCloudAssetSignedUrlGeneration.modulePrimaryId;
    let moduleSecondaryId = dueModuleCloudAssetSignedUrlGeneration.moduleSecondaryId;
    let moduleFilePathFieldNames = dueModuleCloudAssetSignedUrlGeneration.moduleFilePathFieldNames;
    let moduleUrlExpiresAtFieldName = dueModuleCloudAssetSignedUrlGeneration.moduleUrlExpiresAtFieldName;
  
    try{
      var updDueModuleCloudAssetSignedUrlGenerationObjForStart = {
        id: dueModuleCloudAssetSignedUrlGenerationId,
        inProgress: true,
        isSystemAttempted: true,
        isAttempted: true
      };
  
    //   await AppScheduledModuleCloudAssetSignedUrlGenerationService.saveAppScheduledModuleCloudAssetSignedUrlGeneration(updDueModuleCloudAssetSignedUrlGenerationObjForStart);  
    }
    catch(e){
      console.log('performScheduledCloudAssetSignedUrlGenerations : ', dueModuleCloudAssetSignedUrlGeneration);
    }
  
    var consModuleCollection;
    try
    {
      consModuleCollection = mongoose.connection.collection(moduleCollectionName);
    }
    catch(e){
      console.log('performScheduledCloudAssetSignedUrlGenerations : ', dueModuleCloudAssetSignedUrlGeneration);
    }
  
    var isDueModuleCloudAssetSignedUrlGenerationToBeRemoved = false;
  
    if(consModuleCollection)
    {
      var fetchOptions = {
        _id: modulePrimaryId
      };
      if(hasIsDeletedConsideration === true)
      {
        fetchOptions.isDeleted = 0;
      }
  
      try
      {
        consModuleIndObj = await consModuleCollection.findOne(fetchOptions);
      }
      catch(e){
        console.log('dueModuleCloudAssetSignedUrlGeneration : ', dueModuleCloudAssetSignedUrlGeneration);
      }
  
      if(consModuleIndObj)
      {
        const consAssetUrlExpiresAt = AppUploadService.getCloudS3SignedFileExpiresAtTimestamp(); 
        const currAssetUrlExpiresAt = consModuleIndObj[moduleUrlExpiresAtFieldName];
  
        if(currAssetUrlExpiresAt <= currAssetUrlExpiryConsideration)
        {
          const moduleFilePathFieldNamesForImageActual = moduleFilePathFieldNames.imageActual;
          const moduleFilePathFieldNamesForImageThumb = moduleFilePathFieldNames.imageThumb;
          const moduleFilePathFieldNamesForBaseFile = moduleFilePathFieldNames.baseFile;
    
          const moduleFilePathFieldNamesForImageActualFilePath = moduleFilePathFieldNamesForImageActual.filePath;
          const moduleFilePathFieldNamesForImageActualFileUrl = moduleFilePathFieldNamesForImageActual.fileUrl;
    
          if(moduleFilePathFieldNamesForImageActualFilePath && moduleFilePathFieldNamesForImageActualFilePath !== "")
          {
            const imageActualFilePath = consModuleIndObj[moduleFilePathFieldNamesForImageActualFilePath];
            if(imageActualFilePath && imageActualFilePath !== "")
            {
              const imageActualFileUrl = await AppUploadService.getRelevantModuleActualImageSignedFileUrlFromPath(moduleCode, imageActualFilePath);
      
              consModuleIndObj[moduleFilePathFieldNamesForImageActualFileUrl] = imageActualFileUrl;
            }
          }
    
          const moduleFilePathFieldNamesForImageThumbFilePath = moduleFilePathFieldNamesForImageThumb.filePath;
          const moduleFilePathFieldNamesForImageThumbFileUrl = moduleFilePathFieldNamesForImageThumb.fileUrl;
    
          if(moduleFilePathFieldNamesForImageActualFilePath && moduleFilePathFieldNamesForImageActualFilePath !== "")
          {
            const imageThumbFilePath = consModuleIndObj[moduleFilePathFieldNamesForImageThumbFilePath];
            if(imageThumbFilePath && imageThumbFilePath !== "")
            {
              const imageThumbFileUrl = await AppUploadService.getRelevantModuleThumbImageSignedFileUrlFromPath(moduleCode, imageThumbFilePath);
              
              consModuleIndObj[moduleFilePathFieldNamesForImageThumbFileUrl] = imageThumbFileUrl;
            }
          }
    
          const moduleFilePathFieldNamesForBaseFileFilePath = moduleFilePathFieldNamesForBaseFile.filePath;
          const moduleFilePathFieldNamesForBaseFileFileUrl = moduleFilePathFieldNamesForBaseFile.fileUrl;
        
          if(moduleFilePathFieldNamesForBaseFileFilePath && moduleFilePathFieldNamesForBaseFileFilePath !== "")
          {
            const baseFileFilePath = consModuleIndObj[moduleFilePathFieldNamesForBaseFileFilePath];
            if(baseFileFilePath && baseFileFilePath !== "")
            {
              const baseFileFileUrl = await AppUploadService.getRelevantModuleBaseFileSignedFileUrlFromPath(moduleCode, baseFileFilePath);
              
              consModuleIndObj[moduleFilePathFieldNamesForBaseFileFileUrl] = baseFileFileUrl;
            }
          }
    
          consModuleIndObj[moduleUrlExpiresAtFieldName] = consAssetUrlExpiresAt;
    
          var savedConsModuleIndObj;
          try
          {
            /* OPEN AFTER TEST */
            //savedConsModuleIndObj = await consModuleIndObj.save();
          }
          catch(e){
            console.log('dueModuleCloudAssetSignedUrlGeneration : ', dueModuleCloudAssetSignedUrlGeneration);
          }
    
          if(savedConsModuleIndObj)
          {
            isDueModuleCloudAssetSignedUrlGenerationToBeRemoved = true;
          }
        }
        else
        {
          isDueModuleCloudAssetSignedUrlGenerationToBeRemoved = true;
        }
      }
      else
      {
        isDueModuleCloudAssetSignedUrlGenerationToBeRemoved = true;
      }
    }
  
    if(isDueModuleCloudAssetSignedUrlGenerationToBeRemoved === true)
    {
      try{
        /* OPEN AFTER TEST */
        // await AppScheduledModuleCloudAssetSignedUrlGenerationService.deleteAppScheduledModuleCloudAssetSignedUrlGenerationById(dueModuleCloudAssetSignedUrlGenerationId);
      }
      catch(e){
    
      }
    }
    else
    {
      try{
        var updDueModuleCloudAssetSignedUrlGenerationObjForStop = {
          id: dueModuleCloudAssetSignedUrlGenerationId,
          inProgress: false
        };
        
        /* OPEN AFTER TEST */
        // await AppScheduledModuleCloudAssetSignedUrlGenerationService.saveAppScheduledModuleCloudAssetSignedUrlGeneration(updDueModuleCloudAssetSignedUrlGenerationObjForStop);  
      }
      catch(e){
        console.log('performScheduledCloudAssetSignedUrlGenerations : ', dueModuleCloudAssetSignedUrlGeneration);
      }
    }
  
    console.log('------------------- Exiting generateAndStoreScheduledIndCloudAssetSignedUrl ------------------------');
  
    return consModuleIndObj;
}
  