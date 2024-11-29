var ConsortiumService = require('../services/consortium.service')
var ConsortiumUserService = require('../services/consortiumUser.service')
var ConsortiumPatientService = require('../services/consortiumPatient.service')
var ConsortiumLocationService = require('../services/consortiumLocation.service')
var SystemUserService = require('../services/systemUser.service')
var ConsortiumSystemUserTeamService = require('../services/consortiumSystemUserTeam.service')
var ConsortiumChatThreadMessageService = require('../services/consortiumChatThreadMessage.service')
var ConsortiumPatientAppointmentService = require('../services/consortiumPatientAppointment.service')
var ConsortiumPatientAppointmentController = require('./consortiumPatientAppointment.controller')
var AppCommonService = require('../services/appcommon.service')
var AppDataSanitationService = require('../services/appDataSanitation.service');
var AppConfig = require('../appconfig');
var AppConfigNotif = require('../appconfig-notif')
var AppConfigModule = require('../appconfig-module')
var AppConfigConst = require('../appconfig-const')
var AppConfigModuleName = require('../appconfig-module-name');
var AppConfigAssets = require('../appconfig-assets');
var mongodb = require("mongodb");
var mongoose = require('mongoose');
var AppConfigUploads = require('../appconfig-uploads')
var AppUploadService = require('../services/appUpload.service')
var PdfPrinter = require("pdfmake");
var pdfMake = require('pdfmake/build/pdfmake.js');
var htmlToPdfmake = require("html-to-pdfmake");
var jsdom = require("jsdom");
var fs = require('fs');
var Exceljs = require('exceljs');
var moment = require('moment');
var momentTZ = require('moment-timezone');
const { CUSTOMER_PERFORMANCE_REPORT } = require('../appconfig-const')
const EXCEL_EXTENSION = '.xlsx';

// Saving the context of this module inside the _the variable

_this = this
var thisConsortiumModule = AppConfigModule.MOD_CONSORTIUM;

exports.getReports = async function(req, res, next)
{
    var reportType = req.body.reportType;
    let forExcel = req.body.forExcel;
    let selectedColumns = req.body.selectedColumns;
    
    let compReq = AppCommonService.getClonedRequestObject(req);
    compReq.body.forExport = true;
    compReq.body[AppConfigConst.PARAM_SKIP_RESPONSE] = true;

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
    else if(reportType !== undefined && reportType !== '' && selectedColumns !== undefined && Array.isArray(selectedColumns) && selectedColumns.length > 0 )
    {
        try
        {
            selectedColumns.sort(function (a, b) {
                return a - b;
            });
            let compiledSelectedColumns = [];
            await Promise.all((selectedColumns).map(async (selectedColumn, selectedColumnIndex) => {
                if(selectedColumn === AppConfigConst.REPORT_COLUMN_APPOINTMENT_DATE_ID)
                {
                    compiledSelectedColumns[selectedColumnIndex] = {
                        "text" : AppConfigConst.REPORT_COLUMN_APPOINTMENT_DATE_TEXT,
                        "id" : AppConfigConst.REPORT_COLUMN_APPOINTMENT_DATE_ID,
                    }
                }
                else if(selectedColumn === AppConfigConst.REPORT_COLUMN_PROCESSING_DATE_ID)
                {
                    compiledSelectedColumns[selectedColumnIndex] = {
                        "text" : AppConfigConst.REPORT_COLUMN_PROCESSING_DATE_TEXT,
                        "id" : AppConfigConst.REPORT_COLUMN_PROCESSING_DATE_ID,
                    }
                }
                else if(selectedColumn === AppConfigConst.REPORT_COLUMN_PROVIDER_ID)
                {
                    compiledSelectedColumns[selectedColumnIndex] = {
                        "text" : AppConfigConst.REPORT_COLUMN_PROVIDER_TEXT,
                        "id" : AppConfigConst.REPORT_COLUMN_PROVIDER_ID,
                    }
                }
                else if(selectedColumn === AppConfigConst.REPORT_COLUMN_APPOINTMENT_ID_ID)
                {
                    compiledSelectedColumns[selectedColumnIndex] = {
                        "text" : AppConfigConst.REPORT_COLUMN_APPOINTMENT_ID_TEXT,
                        "id" : AppConfigConst.REPORT_COLUMN_APPOINTMENT_ID_ID
                    }
                }
                else if(selectedColumn === AppConfigConst.REPORT_COLUMN_AUDIO_LENGTH_ID)
                {
                    compiledSelectedColumns[selectedColumnIndex] = {
                        "text" : AppConfigConst.REPORT_COLUMN_AUDIO_LENGTH_TEXT,
                        "id" : AppConfigConst.REPORT_COLUMN_AUDIO_LENGTH_ID,
                    }
                }
                else if(selectedColumn === AppConfigConst.REPORT_COLUMN_SCRIBE_ID)
                {
                    compiledSelectedColumns[selectedColumnIndex] = {
                        "text" : AppConfigConst.REPORT_COLUMN_SCRIBE_TEXT,
                        "id" : AppConfigConst.REPORT_COLUMN_SCRIBE_ID,
                    }
                }
                else if(selectedColumn === AppConfigConst.REPORT_COLUMN_FIRST_CHECK_ID)
                {
                    compiledSelectedColumns[selectedColumnIndex] = {
                        "text" : AppConfigConst.REPORT_COLUMN_FIRST_CHECK_TEXT,
                        "id" : AppConfigConst.REPORT_COLUMN_FIRST_CHECK_ID,
                    }
                }
                else if(selectedColumn === AppConfigConst.REPORT_COLUMN_SECOND_CHECK_ID)
                {
                    compiledSelectedColumns[selectedColumnIndex] = {
                        "text" : AppConfigConst.REPORT_COLUMN_SECOND_CHECK_TEXT,
                    "id" : AppConfigConst.REPORT_COLUMN_SECOND_CHECK_ID,
                    }
                }
                else if(selectedColumn === AppConfigConst.REPORT_COLUMN_FINAL_CHECK_ID)
                {
                    compiledSelectedColumns[selectedColumnIndex] = {
                        "text" : AppConfigConst.REPORT_COLUMN_FINAL_CHECK_TEXT,
                        "id" : AppConfigConst.REPORT_COLUMN_FINAL_CHECK_ID,
                    }
                }
                else if(selectedColumn === AppConfigConst.REPORT_COLUMN_CONSORTIUM_ID)
                {
                    compiledSelectedColumns[selectedColumnIndex] = {
                        "text" : AppConfigConst.REPORT_COLUMN_CONSORTIUM_TEXT,
                        "id" : AppConfigConst.REPORT_COLUMN_CONSORTIUM_ID,
                    }
                }
                else if(selectedColumn === AppConfigConst.REPORT_COLUMN_LOCATION_ID)
                {
                    compiledSelectedColumns[selectedColumnIndex] = {
                        "text" : AppConfigConst.REPORT_COLUMN_LOCATION_TEXT,
                        "id" : AppConfigConst.REPORT_COLUMN_LOCATION_ID,
                    }
                }
                else if(selectedColumn === AppConfigConst.REPORT_COLUMN_PATIENT_NAME_ID)
                {
                    compiledSelectedColumns[selectedColumnIndex] = {
                        "text" : AppConfigConst.REPORT_COLUMN_PATIENT_NAME_TEXT,
                        "id" : AppConfigConst.REPORT_COLUMN_PATIENT_NAME_ID,
                    }
                }
            }));

            await AppCommonService.setSystemUserAppAccessed(req);

            switch (reportType)
            {
                case AppConfigConst.PRODUCTIVITY_REPORT:
                    {
                        compReq.body.forExport = true;
                        compReq.body.filIsDictationUploadCompleted = true;
                        compReq.body.sortBy = 'col2';
                        compReq.body.sortOrder = 'desc';
        
                        let compiledConsortiumPatientAppointmentList = [];
                        let consortiumPatientAppointmentsList = await ConsortiumPatientAppointmentService.getConsortiumPatientAppointments(compReq);

                        let consortiumTotalAppointmentDicationDuration = 0;
                        let consortiumTotalAppointmentCount = 0;

                        if(consortiumPatientAppointmentsList != null)
                        {
                            let consortiumPatientAppointments = consortiumPatientAppointmentsList.results;
        
                            if(consortiumPatientAppointments && consortiumPatientAppointments.length > 0)
                            {
                                
                                await Promise.all((consortiumPatientAppointments).map(async (consortiumPatientAppointment, consortiumPatientAppointmentIndex) => {

                                    let appointmentDate = consortiumPatientAppointment.appointmentDate;
                                    let transcriptionAllocationDate = consortiumPatientAppointment.transcriptionAllocationDate;
                                    let consortiumUserName = consortiumPatientAppointment.consortiumUser !== null && consortiumPatientAppointment.consortiumUser !== undefined ? consortiumPatientAppointment.consortiumUser.userFullName : "-";
                                    let appointmentId = consortiumPatientAppointment.appointmentId;
                                    let totalDicationDurationInSeconds = consortiumPatientAppointment.totalDicationDurationInSeconds;
                                    let mtAssignedToName = consortiumPatientAppointment.mtAssignedTo !== null && consortiumPatientAppointment.mtAssignedTo !== undefined ? consortiumPatientAppointment.mtAssignedTo.userFullName : "-";
                                    let qa1AssignedToName = consortiumPatientAppointment.qa1AssignedTo !== null && consortiumPatientAppointment.qa1AssignedTo !== undefined ? consortiumPatientAppointment.qa1AssignedTo.userFullName : "-";
                                    let qa2AssignedToName = consortiumPatientAppointment.qa2AssignedTo !== null && consortiumPatientAppointment.qa2AssignedTo !== undefined ? consortiumPatientAppointment.qa2AssignedTo.userFullName : "-";
                                    let qa3AssignedToName = consortiumPatientAppointment.qa3AssignedTo !== null && consortiumPatientAppointment.qa3AssignedTo !== undefined ? consortiumPatientAppointment.qa3AssignedTo.userFullName : "-";
                                    let consortiumName = consortiumPatientAppointment.consortium !== null && consortiumPatientAppointment.consortium !== undefined ? consortiumPatientAppointment.consortium.consortiumName : "-";
                                    let consortiumLocationName = consortiumPatientAppointment.consortiumLocation !== null && consortiumPatientAppointment.consortiumLocation !== undefined ? consortiumPatientAppointment.consortiumLocation.locationName : "-";
                                    let consortiumPatientName = consortiumPatientAppointment.consortiumPatient !== null && consortiumPatientAppointment.consortiumPatient !== undefined ? consortiumPatientAppointment.consortiumPatient.fullName : "-";
                                    
                                    consortiumTotalAppointmentDicationDuration += totalDicationDurationInSeconds;
                                    consortiumTotalAppointmentCount += 1;

                                    if(appointmentDate > 0)
                                    {
                                        appointmentDate = await AppCommonService.timestampToDispViewDateForReport(appointmentDate);
                                    }

                                    if(transcriptionAllocationDate > 0)
                                    {
                                        transcriptionAllocationDate = await AppCommonService.timestampToDispViewDateForReport(transcriptionAllocationDate);
                                    }

                                    totalDicationDurationInSeconds = parseInt(totalDicationDurationInSeconds);
                                    let totalDicationDuration = AppCommonService.secondsToHourMinuteSecond(totalDicationDurationInSeconds);

                                    let compiledConsortiumPatientAppointmentObj = {};

                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_APPOINTMENT_DATE_TEXT] = appointmentDate;
                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_PROCESSING_DATE_TEXT] = transcriptionAllocationDate;
                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_PROVIDER_TEXT] = consortiumUserName;
                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_APPOINTMENT_ID_TEXT] = appointmentId;
                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_AUDIO_LENGTH_TEXT] = totalDicationDuration;
                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_SCRIBE_TEXT] = mtAssignedToName;
                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_FIRST_CHECK_TEXT] = qa1AssignedToName;
                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_SECOND_CHECK_TEXT] = qa2AssignedToName;
                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_FINAL_CHECK_TEXT] = qa3AssignedToName;
                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_CONSORTIUM_TEXT] = consortiumName;
                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_LOCATION_TEXT] = consortiumLocationName;
                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_PATIENT_NAME_TEXT] = consortiumPatientName;
                                  
                                    compiledConsortiumPatientAppointmentList[consortiumPatientAppointmentIndex] = compiledConsortiumPatientAppointmentObj;

                                }));
                            }

                        }

                        if(forExcel === true)
                        {
                            responseObj.data = await exports.generateProductivityReportExcel(req,compiledSelectedColumns,compiledConsortiumPatientAppointmentList,consortiumTotalAppointmentDicationDuration,consortiumTotalAppointmentCount);
                        }
                        else
                        {
                            responseObj.compiledSelectedColumns = compiledSelectedColumns;
                            responseObj.compiledConsortiumPatientAppointmentList = compiledConsortiumPatientAppointmentList;
                        }
                       
                        
                        resStatus = 1;
                    }
                    break;
                case AppConfigConst.DATE_REPORT:
                case AppConfigConst.PROVIDER_REPORT:
                case AppConfigConst.USER_REPORT:
                    {
                        let compiledConsortiumPatientAppointmentList = [];

                        let consortiumPatientAppointmentResponse = await ConsortiumPatientAppointmentController.getConsortiumPatientAppointmentListForTranscriptionAssignment(compReq);
                        if(consortiumPatientAppointmentResponse != null)
                        {
                            let consortiumPatientAppointments = consortiumPatientAppointmentResponse.data;
                            consortiumTotalAppointmentDicationDuration = consortiumPatientAppointmentResponse.totalAppointmentDicationDuration;
                            consortiumTotalAppointmentCount = consortiumPatientAppointmentResponse.totalAppointmentCount;
        
                            if(consortiumPatientAppointments && consortiumPatientAppointments.length > 0)
                            {
                                await Promise.all((consortiumPatientAppointments).map(async (consortiumPatientAppointment, consortiumPatientAppointmentIndex) => {

                                    let consortiumName = consortiumPatientAppointment.consortiumName;
                                    let consortiumLevelTotalDicationDuration = consortiumPatientAppointment.totalDicationDuration;
                                    let consortiumLocations = consortiumPatientAppointment.consortiumLocations;

                                    let compiledConsortiumLevelList = [];

                                    if(consortiumLocations.length > 0)
                                    {
                                        let compiledConsortiumObj = {};

                                        compiledConsortiumObj[AppConfigConst.REPORT_COLUMN_AUDIO_LENGTH_TEXT] = consortiumLevelTotalDicationDuration;
                                        compiledConsortiumObj[AppConfigConst.REPORT_COLUMN_CONSORTIUM_TEXT] = consortiumName;
                                      
                                        compiledConsortiumLevelList[0] = compiledConsortiumObj;
                                        
                                        await Promise.all((consortiumLocations).map(async (consortiumLocation, consortiumLocationIndex) => {

                                            consortiumLocationIndex++;
                                            let locationName = consortiumLocation.locationName;
                                            let locationLevelTotalDicationDuration = consortiumLocation.totalDicationDuration;
                                            let patientAppointmentList = consortiumLocation.patientAppointmentList;

                                            let compiledLocationLevelList = [];

                                            if(patientAppointmentList.length > 0)
                                            {
                                                let compiledLocationObj = {};

                                                compiledLocationObj[AppConfigConst.REPORT_COLUMN_AUDIO_LENGTH_TEXT] = locationLevelTotalDicationDuration;
                                                compiledLocationObj[AppConfigConst.REPORT_COLUMN_LOCATION_TEXT] = locationName;
                                              
                                                compiledLocationLevelList[0] = compiledLocationObj;

                                                let consortiumPatientAppointmentData = {};
                                                await Promise.all((patientAppointmentList).map(async (consortiumPatientAppointment, patientAppointmentIndex) => {
                                                    patientAppointmentIndex++;

                                                    let appointmentDate = consortiumPatientAppointment.appointmentDate;
                                                    let transcriptionAllocationDate = consortiumPatientAppointment.transcriptionAllocationDate;
                                                    let consortiumUserName = consortiumPatientAppointment.consortiumUser !== null && consortiumPatientAppointment.consortiumUser !== undefined ? consortiumPatientAppointment.consortiumUser.userFullName : "-";
                                                    let appointmentId = consortiumPatientAppointment.appointmentId;
                                                    let totalDictationUploadCount = consortiumPatientAppointment.totalDictationUploadCount;
                                                    let totalDicationDurationInSeconds = consortiumPatientAppointment.totalDicationDurationInSeconds;
                                                    let mtAssignedToName = consortiumPatientAppointment.mtAssignedTo !== null && consortiumPatientAppointment.mtAssignedTo !== undefined ? consortiumPatientAppointment.mtAssignedTo.userFullName : "-";
                                                    let qa1AssignedToName = consortiumPatientAppointment.qa1AssignedTo !== null && consortiumPatientAppointment.qa1AssignedTo !== undefined ? consortiumPatientAppointment.qa1AssignedTo.userFullName : "-";
                                                    let qa2AssignedToName = consortiumPatientAppointment.qa2AssignedTo !== null && consortiumPatientAppointment.qa2AssignedTo !== undefined ? consortiumPatientAppointment.qa2AssignedTo.userFullName : "-";
                                                    let qa3AssignedToName = consortiumPatientAppointment.qa3AssignedTo !== null && consortiumPatientAppointment.qa3AssignedTo !== undefined ? consortiumPatientAppointment.qa3AssignedTo.userFullName : "-";
                                                    let consortiumName = consortiumPatientAppointment.consortium !== null && consortiumPatientAppointment.consortium !== undefined ? consortiumPatientAppointment.consortium.consortiumName : "-";
                                                    let consortiumLocationName = consortiumPatientAppointment.consortiumLocation !== null && consortiumPatientAppointment.consortiumLocation !== undefined ? consortiumPatientAppointment.consortiumLocation.locationName : "-";
                                                    let consortiumPatientName = consortiumPatientAppointment.consortiumPatient !== null && consortiumPatientAppointment.consortiumPatient !== undefined ? consortiumPatientAppointment.consortiumPatient.fullName : "-";
                                                    
                                                    if(appointmentDate > 0)
                                                    {
                                                        appointmentDate = await AppCommonService.timestampToDispViewDateForReport(appointmentDate);
                                                    }
                
                                                    if(transcriptionAllocationDate > 0)
                                                    {
                                                        transcriptionAllocationDate = await AppCommonService.timestampToDispViewDateForReport(transcriptionAllocationDate);
                                                    }
                
                                                    totalDicationDurationInSeconds = parseInt(totalDicationDurationInSeconds);
                                                    let totalDicationDuration = AppCommonService.secondsToHourMinuteSecond(totalDicationDurationInSeconds);
                
                                                    let compiledConsortiumPatientAppointmentObj = {};
                
                                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_APPOINTMENT_DATE_TEXT] = appointmentDate;
                                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_PROCESSING_DATE_TEXT] = transcriptionAllocationDate;
                                                    // compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_PROVIDER_TEXT] = consortiumUserName;
                                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_APPOINTMENT_ID_TEXT] = appointmentId;
                                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_AUDIO_LENGTH_TEXT] = totalDicationDuration;
                                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_SCRIBE_TEXT] = mtAssignedToName;
                                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_FIRST_CHECK_TEXT] = qa1AssignedToName;
                                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_SECOND_CHECK_TEXT] = qa2AssignedToName;
                                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_FINAL_CHECK_TEXT] = qa3AssignedToName;
                                                    // compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_CONSORTIUM_TEXT] = consortiumName;
                                                    // compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_LOCATION_TEXT] = consortiumLocationName;
                                                    compiledConsortiumPatientAppointmentObj[AppConfigConst.REPORT_COLUMN_PATIENT_NAME_TEXT] = consortiumPatientName;
                                                    compiledConsortiumPatientAppointmentObj.totalDictationUploadCount = totalDictationUploadCount;
                                                    compiledConsortiumPatientAppointmentObj.totalDicationDurationInSeconds = totalDicationDurationInSeconds;
                                                  

                                                    if(consortiumPatientAppointmentData[consortiumUserName] === undefined || consortiumPatientAppointmentData[consortiumUserName] === null )
                                                    {
                                                        consortiumPatientAppointmentData[consortiumUserName] = {
                                                            totalDicationDurationInSeconds : 0,
                                                            consortiumUserName : consortiumUserName,
                                                            patientAppointmentList : []
                                                        }
                                                    }

                                                    consortiumPatientAppointmentData[consortiumUserName]['totalDicationDurationInSeconds'] +=  totalDicationDurationInSeconds;
                                                    consortiumPatientAppointmentData[consortiumUserName]['patientAppointmentList'].push(compiledConsortiumPatientAppointmentObj);

                                                }));
                                                
                                                consortiumPatientAppointmentData = Object.values(consortiumPatientAppointmentData);
                                                await Promise.all((consortiumPatientAppointmentData).map(async (consortiumPatientAppointment, patientAppointmentIndex) => {
                                                    patientAppointmentIndex++;
                                                    let compiledConsortiumUserLevelList = [];
                                                    let patientAppointmentList = consortiumPatientAppointment.patientAppointmentList;
                                                    let totalDicationDurationInSeconds = consortiumPatientAppointment.totalDicationDurationInSeconds;

                                                    totalDicationDurationInSeconds = parseInt(totalDicationDurationInSeconds);
                                                    let totalDicationDuration = AppCommonService.secondsToHourMinuteSecond(totalDicationDurationInSeconds);
                
                                                    let compiledConsortiumUserObj = {};

                                                    compiledConsortiumUserObj[AppConfigConst.REPORT_COLUMN_AUDIO_LENGTH_TEXT] = totalDicationDuration;
                                                    compiledConsortiumUserObj[AppConfigConst.REPORT_COLUMN_PROVIDER_TEXT] = consortiumPatientAppointment.consortiumUserName;
                                                
                                                    compiledConsortiumUserLevelList[0] = compiledConsortiumUserObj;

                                                    compiledConsortiumUserLevelList = compiledConsortiumUserLevelList.concat(patientAppointmentList);
                                                    compiledLocationLevelList[patientAppointmentIndex] = compiledConsortiumUserLevelList;

                                                }));

                                            }
                                            compiledLocationLevelList = compiledLocationLevelList.flat();
                                            compiledConsortiumLevelList[consortiumLocationIndex] = compiledLocationLevelList;
                                        }));

                                    }
                                    compiledConsortiumLevelList = compiledConsortiumLevelList.flat();
                                    compiledConsortiumPatientAppointmentList[consortiumPatientAppointmentIndex] = compiledConsortiumLevelList;
                                }));
                            }
                        }

                        compiledConsortiumPatientAppointmentList = compiledConsortiumPatientAppointmentList.flat();

                        if(forExcel === true)
                        {
                            responseObj.data = await exports.generateProductivityReportExcel(req,compiledSelectedColumns,compiledConsortiumPatientAppointmentList);
                        }
                        else
                        {
                            responseObj.compiledSelectedColumns = compiledSelectedColumns;
                            responseObj.compiledConsortiumPatientAppointmentList = compiledConsortiumPatientAppointmentList;
                        }
                       
                        resStatus = 1;
                    }
                    break;
             
            }
            
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Departments could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj)
}

exports.selectReportColumnsList = async function(req, res, next)
{
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
    else
    {
        try
        {

            await AppCommonService.setSystemUserAppAccessed(req);

            resStatus = 1;
            let reportColumns = [
                {
                    "text" : AppConfigConst.REPORT_COLUMN_APPOINTMENT_DATE_TEXT,
                    "id" : AppConfigConst.REPORT_COLUMN_APPOINTMENT_DATE_ID,
                },
                {
                    "text" : AppConfigConst.REPORT_COLUMN_PROCESSING_DATE_TEXT,
                    "id" : AppConfigConst.REPORT_COLUMN_PROCESSING_DATE_ID,
                },
                {
                    "text" : AppConfigConst.REPORT_COLUMN_PROVIDER_TEXT,
                    "id" : AppConfigConst.REPORT_COLUMN_PROVIDER_ID,
                },
                {
                    "text" : AppConfigConst.REPORT_COLUMN_APPOINTMENT_ID_TEXT,
                    "id" : AppConfigConst.REPORT_COLUMN_APPOINTMENT_ID_ID
                },
                {
                    "text" : AppConfigConst.REPORT_COLUMN_AUDIO_LENGTH_TEXT,
                    "id" : AppConfigConst.REPORT_COLUMN_AUDIO_LENGTH_ID,
                },
                {
                    "text" : AppConfigConst.REPORT_COLUMN_SCRIBE_TEXT,
                    "id" : AppConfigConst.REPORT_COLUMN_SCRIBE_ID,
                },
                {
                    "text" : AppConfigConst.REPORT_COLUMN_FIRST_CHECK_TEXT,
                    "id" : AppConfigConst.REPORT_COLUMN_FIRST_CHECK_ID,
                },
                {
                    "text" : AppConfigConst.REPORT_COLUMN_SECOND_CHECK_TEXT,
                    "id" : AppConfigConst.REPORT_COLUMN_SECOND_CHECK_ID,
                },
                {
                    "text" : AppConfigConst.REPORT_COLUMN_FINAL_CHECK_TEXT,
                    "id" : AppConfigConst.REPORT_COLUMN_FINAL_CHECK_ID,
                },
                {
                    "text" : AppConfigConst.REPORT_COLUMN_CONSORTIUM_TEXT,
                    "id" : AppConfigConst.REPORT_COLUMN_CONSORTIUM_ID,
                },
                {
                    "text" : AppConfigConst.REPORT_COLUMN_LOCATION_TEXT,
                    "id" : AppConfigConst.REPORT_COLUMN_LOCATION_ID,
                },
                {
                    "text" : AppConfigConst.REPORT_COLUMN_PATIENT_NAME_TEXT,
                    "id" : AppConfigConst.REPORT_COLUMN_PATIENT_NAME_ID,
                },
            ];
            
            responseObj.reportColumns = reportColumns;
        }
        catch(e)
        {
            resStatus = -1;
            resMsg = "Departments could not be fetched" + e;
        }
    }

    responseObj.status = resStatus;
    responseObj.message = resMsg;

    return res.status(httpStatus).json(responseObj)
}



exports.generateProductivityReportExcel = async function (req, compiledSelectedColumns, compiledConsortiumPatientAppointmentList,consortiumTotalAppointmentDicationDuration,consortiumTotalAppointmentCount) {

    let responseObj = {};
    var reportType = req.body.reportType;
    var filConsortium =  req.body.filConsortium;
    var filConsortiumUser =  req.body.filConsortiumUser;
    var filConsortiumPatient =  req.body.filConsortiumPatient;
    var filConsortiumLocation =  req.body.filConsortiumLocation;
    var filSystemUser =  req.body.filSystemUser;
    let filStartTranscriptionAllocationDate = req.body.filStartTranscriptionAllocationDate;
    let filEndTranscriptionAllocationDate = req.body.filEndTranscriptionAllocationDate;

    let filterStr = '';
    let consortiumName;
    if(mongodb.ObjectId.isValid(filConsortium))
    {
        var fetchedConsortium = await ConsortiumService.findConsortiumById(req,filConsortium,false);
        if(fetchedConsortium)
        {
            consortiumName = fetchedConsortium.consortiumName;
        }
    }
    else
    {
        consortiumName = "All";
    }

    //------------------------------------------------------------------------------

    let consortiumUserName;
    if(mongodb.ObjectId.isValid(filConsortiumUser))
    {
        var fetchedConsortiumUser = await ConsortiumUserService.findConsortiumUserById(req,filConsortiumUser,false);
        if(fetchedConsortiumUser)
        {
            consortiumUserName = fetchedConsortiumUser.userFullName;
        }
    }
    else
    {
        consortiumUserName = "All";
    }

    //------------------------------------------------------------------------------

    let consortiumPatientName;
    if(mongodb.ObjectId.isValid(filConsortiumPatient))
    {
        var fetchedConsortiumPatient = await ConsortiumPatientService.findConsortiumPatientById(req,filConsortiumPatient);
        if(fetchedConsortiumPatient)
        {
            consortiumPatientName = fetchedConsortiumPatient.fullName;
        }
    }
    else
    {
        consortiumPatientName = "All";
    }
     //------------------------------------------------------------------------------

     let consortiumLocationName;
     if(mongodb.ObjectId.isValid(filConsortiumLocation))
     {
         var fetchedConsortiumLocation = await ConsortiumLocationService.findConsortiumLocationById(req,filConsortiumLocation);
         if(fetchedConsortiumLocation)
         {
            consortiumLocationName = fetchedConsortiumLocation.locationName;
         }
     }
     else
     {
        consortiumLocationName = "All";
     }
    //------------------------------------------------------------------------------

    let systemUserName;
    if(mongodb.ObjectId.isValid(filSystemUser))
    {
        var fetchedSystemUser = await SystemUserService.findSystemUserById(filSystemUser,false);
        if(fetchedSystemUser)
        {
            systemUserName = fetchedSystemUser.userFullName;
        }
    }
    else
    {
        systemUserName = "All";
    }

    //--------------------------------------------------------------------------------

    let startDtStr,endDtStr;
    if(filStartTranscriptionAllocationDate && filStartTranscriptionAllocationDate !== undefined && filStartTranscriptionAllocationDate > 0)
    {
        startDtStr = await AppCommonService.timestampToDispViewDateForReport(filStartTranscriptionAllocationDate)
    }

    if(filEndTranscriptionAllocationDate && filEndTranscriptionAllocationDate !== undefined && filEndTranscriptionAllocationDate > 0)
    {
        endDtStr =  await AppCommonService.timestampToDispViewDateForReport(filEndTranscriptionAllocationDate)
    }
    

    let title = '';
    let compFileName = '';

    if(reportType === AppConfigConst.PRODUCTIVITY_REPORT)
    {
        title = 'Productivity Report';
        compFileName = 'ProductivityReport.xlsx';
    }
    else if(reportType === AppConfigConst.DATE_REPORT)
    {
        title = 'Date Report';
        compFileName = 'DateReport.xlsx';
    }
    else if(reportType === AppConfigConst.PROVIDER_REPORT)
    {
        title = 'Provider Report';
        compFileName = 'ProviderReport.xlsx';
    }
    else if(reportType === AppConfigConst.USER_REPORT)
    {
        title = 'User Report';
        compFileName = 'UserReport.xlsx';
    }
    
    let workbook = new Exceljs.Workbook();
    let worksheet = workbook.addWorksheet(title);

    let thinBorderObj = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    let titleCellFontObj = {
        name: 'Calibri',
        size: 12,
        bold: true,
    };

    let titleCellAlignmentObj = {
        vertical: 'middle', 
        horizontal: 'left',
        wrapText: true
    };

    let filterCellAlignmentObj = {
        vertical: 'top', 
        horizontal: 'left',
        wrapText: true
    };
    
    let cellAlignmentObj = {
        vertical: 'middle', 
        horizontal: 'left',
        wrapText: true
    };

    const tableHeaderFillObj = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '' },
        bgColor: { argb: '' }
    };

    const tableHeaderFontObj = {
        bold: true,
        color: { argb: '000000' },
        size: 12
    };

    const tableFilterHeaderFillObj = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '' },
        bgColor: { argb: '' }
    };

    const cellHeaderAlphabetTitle = AppCommonService.convertNumberValueToAlphabet((compiledSelectedColumns.length - 1));

    worksheet.mergeCells('A1', cellHeaderAlphabetTitle+'1');
    let fileTitleCell = worksheet.getCell('A1');
    fileTitleCell.value =  title;
    fileTitleCell.font = {
        bold: true,
        color: { argb: '000000' },
        size: 14
    };
    fileTitleCell.border = thinBorderObj;
    fileTitleCell.alignment = {
        vertical: 'middle', 
        horizontal: 'center',
        wrapText: true
    };

    let tableHeaderCellFilStartDate = worksheet.getCell('A3');
    tableHeaderCellFilStartDate.value = 'Start Date';
    tableHeaderCellFilStartDate.font = tableHeaderFontObj;
    tableHeaderCellFilStartDate.border = thinBorderObj;
    tableHeaderCellFilStartDate.alignment = titleCellAlignmentObj;
    tableHeaderCellFilStartDate.fill = tableFilterHeaderFillObj;

    let tableHeaderCellFilStartDateValue = worksheet.getCell('B3');
    tableHeaderCellFilStartDateValue.value = startDtStr;
    tableHeaderCellFilStartDateValue.font = tableHeaderFontObj;
    tableHeaderCellFilStartDateValue.border = thinBorderObj;
    tableHeaderCellFilStartDateValue.alignment = titleCellAlignmentObj;
    tableHeaderCellFilStartDateValue.fill = tableFilterHeaderFillObj;

    let tableHeaderCellFilEndDate = worksheet.getCell('A4');
    tableHeaderCellFilEndDate.value = 'End Date';
    tableHeaderCellFilEndDate.font = tableHeaderFontObj;
    tableHeaderCellFilEndDate.border = thinBorderObj;
    tableHeaderCellFilEndDate.alignment = titleCellAlignmentObj;
    tableHeaderCellFilEndDate.fill = tableFilterHeaderFillObj;

    let tableHeaderCellFilEndDateValue = worksheet.getCell('B4');
    tableHeaderCellFilEndDateValue.value = endDtStr;
    tableHeaderCellFilEndDateValue.font = tableHeaderFontObj;
    tableHeaderCellFilEndDateValue.border = thinBorderObj;
    tableHeaderCellFilEndDateValue.alignment = titleCellAlignmentObj;
    tableHeaderCellFilEndDateValue.fill = tableFilterHeaderFillObj;

    let tableHeaderCellFilConsortium = worksheet.getCell('A5');
    tableHeaderCellFilConsortium.value = 'Consortium';
    tableHeaderCellFilConsortium.font = tableHeaderFontObj;
    tableHeaderCellFilConsortium.border = thinBorderObj;
    tableHeaderCellFilConsortium.alignment = titleCellAlignmentObj;
    tableHeaderCellFilConsortium.fill = tableFilterHeaderFillObj;

    let tableHeaderCellFilConsortiumValue = worksheet.getCell('B5');
    tableHeaderCellFilConsortiumValue.value = consortiumName;
    tableHeaderCellFilConsortiumValue.font = tableHeaderFontObj;
    tableHeaderCellFilConsortiumValue.border = thinBorderObj;
    tableHeaderCellFilConsortiumValue.alignment = titleCellAlignmentObj;
    tableHeaderCellFilConsortiumValue.fill = tableFilterHeaderFillObj;

    let tableHeaderCellFilProvider = worksheet.getCell('A6');
    tableHeaderCellFilProvider.value = 'Provider';
    tableHeaderCellFilProvider.font = tableHeaderFontObj;
    tableHeaderCellFilProvider.border = thinBorderObj;
    tableHeaderCellFilProvider.alignment = titleCellAlignmentObj;
    tableHeaderCellFilProvider.fill = tableFilterHeaderFillObj;

    let tableHeaderCellFilProviderValue = worksheet.getCell('B6');
    tableHeaderCellFilProviderValue.value = consortiumUserName;
    tableHeaderCellFilProviderValue.font = tableHeaderFontObj;
    tableHeaderCellFilProviderValue.border = thinBorderObj;
    tableHeaderCellFilProviderValue.alignment = titleCellAlignmentObj;
    tableHeaderCellFilProviderValue.fill = tableFilterHeaderFillObj;

    // let tableHeaderCellFilPatient = worksheet.getCell('A7');
    // tableHeaderCellFilPatient.value = 'Patient';
    // tableHeaderCellFilPatient.font = tableHeaderFontObj;
    // tableHeaderCellFilPatient.border = thinBorderObj;
    // tableHeaderCellFilPatient.alignment = titleCellAlignmentObj;
    // tableHeaderCellFilPatient.fill = tableFilterHeaderFillObj;

    // let tableHeaderCellFilFieldValue = worksheet.getCell('B7');
    // tableHeaderCellFilFieldValue.value = consortiumPatientName;
    // tableHeaderCellFilFieldValue.font = tableHeaderFontObj;
    // tableHeaderCellFilFieldValue.border = thinBorderObj;
    // tableHeaderCellFilFieldValue.alignment = titleCellAlignmentObj;
    // tableHeaderCellFilFieldValue.fill = tableFilterHeaderFillObj;

    let tableHeaderCellFilConsortiumLocation = worksheet.getCell('A7');
    tableHeaderCellFilConsortiumLocation.value = 'Location';
    tableHeaderCellFilConsortiumLocation.font = tableHeaderFontObj;
    tableHeaderCellFilConsortiumLocation.border = thinBorderObj;
    tableHeaderCellFilConsortiumLocation.alignment = titleCellAlignmentObj;
    tableHeaderCellFilConsortiumLocation.fill = tableFilterHeaderFillObj;

    let tableHeaderCellFilConsortiumLocationValue = worksheet.getCell('B7');
    tableHeaderCellFilConsortiumLocationValue.value = consortiumLocationName;
    tableHeaderCellFilConsortiumLocationValue.font = tableHeaderFontObj;
    tableHeaderCellFilConsortiumLocationValue.border = thinBorderObj;
    tableHeaderCellFilConsortiumLocationValue.alignment = titleCellAlignmentObj;
    tableHeaderCellFilConsortiumLocationValue.fill = tableFilterHeaderFillObj;

    let tableHeaderCellFilSystemUser = worksheet.getCell('A8');
    tableHeaderCellFilSystemUser.value = 'System User';
    tableHeaderCellFilSystemUser.font = tableHeaderFontObj;
    tableHeaderCellFilSystemUser.border = thinBorderObj;
    tableHeaderCellFilSystemUser.alignment = titleCellAlignmentObj;
    tableHeaderCellFilSystemUser.fill = tableFilterHeaderFillObj;

    let tableHeaderCellFilSystemUserValue = worksheet.getCell('B8');
    tableHeaderCellFilSystemUserValue.value = systemUserName;
    tableHeaderCellFilSystemUserValue.font = tableHeaderFontObj;
    tableHeaderCellFilSystemUserValue.border = thinBorderObj;
    tableHeaderCellFilSystemUserValue.alignment = titleCellAlignmentObj;
    tableHeaderCellFilSystemUserValue.fill = tableFilterHeaderFillObj;

    let tableHeaderCellReportTime = worksheet.getCell('A9');
    tableHeaderCellReportTime.value = 'Report Generated At';
    tableHeaderCellReportTime.font = tableHeaderFontObj;
    tableHeaderCellReportTime.border = thinBorderObj;
    tableHeaderCellReportTime.alignment = titleCellAlignmentObj;
    tableHeaderCellReportTime.fill = tableFilterHeaderFillObj;

    const currTs = await AppCommonService.getCurrentTimestamp();
    const dtObj = momentTZ.unix(currTs).tz(AppConfig.SYSTEM_DEFAULT_TIMEZONE_STR);
    let reportDateStr = dtObj.format('DD MMMM YYYY hh:mm a');

    let tableHeaderCellReportTimeValue = worksheet.getCell('B9');
    tableHeaderCellReportTimeValue.value = reportDateStr;
    tableHeaderCellReportTimeValue.font = tableHeaderFontObj;
    tableHeaderCellReportTimeValue.border = thinBorderObj;
    tableHeaderCellReportTimeValue.alignment = titleCellAlignmentObj;
    tableHeaderCellReportTimeValue.fill = tableFilterHeaderFillObj;
    //----------------------------------------------------------------

    let columnWidths = [];
    const preceedingHeaderCount = 1;
    const selectedColumnsLength = compiledSelectedColumns.length;

    (compiledSelectedColumns).forEach((selectedColumn, selectedColumnIndex) => {
        const selectedColumnText = selectedColumn.text;

        const cellHeaderAlphabetPaymentModeInd = AppCommonService.convertNumberValueToAlphabet(selectedColumnIndex);

        let tableHeaderCellPaymentModeInd = worksheet.getCell(cellHeaderAlphabetPaymentModeInd + '12');
        tableHeaderCellPaymentModeInd.value = selectedColumnText;
        tableHeaderCellPaymentModeInd.font = tableHeaderFontObj;
        tableHeaderCellPaymentModeInd.border = thinBorderObj;
        tableHeaderCellPaymentModeInd.alignment = titleCellAlignmentObj;
        tableHeaderCellPaymentModeInd.fill = tableHeaderFillObj;
        columnWidths.push( { width: 20 },)
    });

    let totalAptCount = 0;
    let totalUserFilesCount = 0;
    let totalUserFilesSizeCount = 0;
    let metricsObj = {};
    
    const tableRowArr = [];
    if(compiledConsortiumPatientAppointmentList !== undefined && compiledConsortiumPatientAppointmentList.length > 0)
    {
        (compiledConsortiumPatientAppointmentList).forEach((combDataObj, dayIndex) => 
        {
            const dayWiseRowObj = {};
            (compiledSelectedColumns).forEach((selectedColumn, selectedColumnIndex) => {
                const selectedColumnText = selectedColumn.text;
                let selectedColumnValue = combDataObj[selectedColumnText] !== undefined && combDataObj[selectedColumnText] !== null ? combDataObj[selectedColumnText] : "";

                if(reportType !== AppConfigConst.PRODUCTIVITY_REPORT)
                {
                    if(selectedColumnText === AppConfigConst.REPORT_COLUMN_AUDIO_LENGTH_TEXT && (combDataObj[AppConfigConst.REPORT_COLUMN_CONSORTIUM_TEXT] !== undefined || combDataObj[AppConfigConst.REPORT_COLUMN_LOCATION_TEXT] || combDataObj[AppConfigConst.REPORT_COLUMN_PROVIDER_TEXT]))
                    {
                        selectedColumnValue = "[" + selectedColumnValue + "]";
                    }

                    if(selectedColumnValue !== '' && selectedColumnValue !== '-' && (selectedColumnText === AppConfigConst.REPORT_COLUMN_SCRIBE_TEXT || selectedColumnText === AppConfigConst.REPORT_COLUMN_FIRST_CHECK_TEXT || selectedColumnText === AppConfigConst.REPORT_COLUMN_SECOND_CHECK_TEXT || selectedColumnText === AppConfigConst.REPORT_COLUMN_FINAL_CHECK_TEXT ))
                    {
                        if(metricsObj[selectedColumnValue] === undefined || metricsObj[selectedColumnValue] === null )
                        {
                            metricsObj[selectedColumnValue] = {
                                user : selectedColumnValue,
                                scribeCount : 0,
                                firstCheckCount : 0,
                                secondCheckCount : 0,
                                finalCheckCount : 0,
                                totalApt : 0,
                                totalFiles : 0,
                                length : 0,
                            }
                        }
                      
                        let isValid = false;
                        if(selectedColumnText === AppConfigConst.REPORT_COLUMN_SCRIBE_TEXT )
                        {
                            metricsObj[selectedColumnValue]['scribeCount'] +=  1;
                            isValid = true;
                        }

                        if(selectedColumnText === AppConfigConst.REPORT_COLUMN_FIRST_CHECK_TEXT )
                        {
                            metricsObj[selectedColumnValue]['firstCheckCount'] +=  1;
                            isValid = true;
                        }

                        if( selectedColumnText === AppConfigConst.REPORT_COLUMN_SECOND_CHECK_TEXT )
                        {
                            metricsObj[selectedColumnValue]['secondCheckCount'] +=  1;
                            isValid = true;
                        }

                        if(selectedColumnText === AppConfigConst.REPORT_COLUMN_FINAL_CHECK_TEXT )
                        {
                            metricsObj[selectedColumnValue]['finalCheckCount'] +=  1;
                            isValid = true;
                        }
                        
                        if(isValid = true)
                        {
                            metricsObj[selectedColumnValue]['totalFiles'] +=  combDataObj.totalDictationUploadCount;
                            metricsObj[selectedColumnValue]['length'] +=  combDataObj.totalDicationDurationInSeconds;
                            metricsObj[selectedColumnValue]['totalApt'] +=  1;
    
                            totalUserFilesCount += combDataObj.totalDictationUploadCount;
                            totalUserFilesSizeCount += combDataObj.totalDicationDurationInSeconds;
                            totalAptCount += 1;
                        }
                    }
                }
                dayWiseRowObj[selectedColumnText] = selectedColumnValue;
            });
            tableRowArr.push(Object.values(dayWiseRowObj));
        });
    }
    // responseObj.metricsObj = metricsObj;

    tableRowArr.forEach((d) => {
        let dataRow = worksheet.addRow(d);

        dataRow.eachCell((cell, number) => {
            cell.border = thinBorderObj;
            cell.alignment = cellAlignmentObj;
        });

    });

    let lastRowCount = worksheet.rowCount;

    if(reportType === AppConfigConst.PRODUCTIVITY_REPORT)
    {
        lastRowCount += 2;

        let tableHeaderCellTotalAudioLength = worksheet.getCell('A'+lastRowCount);
        tableHeaderCellTotalAudioLength.value = 'Total Audio Length';
        tableHeaderCellTotalAudioLength.font = tableHeaderFontObj;
        tableHeaderCellTotalAudioLength.border = thinBorderObj;
        tableHeaderCellTotalAudioLength.alignment = titleCellAlignmentObj;
        tableHeaderCellTotalAudioLength.fill = tableFilterHeaderFillObj;

        consortiumTotalAppointmentDicationDuration = parseInt(consortiumTotalAppointmentDicationDuration);
        let consortiumTotalAppointmentDicationDurationValue = AppCommonService.secondsToHourMinuteSecond(consortiumTotalAppointmentDicationDuration);

        let tableHeaderCellTotalAudioLengthValue = worksheet.getCell('B'+lastRowCount);
        tableHeaderCellTotalAudioLengthValue.value = consortiumTotalAppointmentDicationDurationValue;
        tableHeaderCellTotalAudioLengthValue.font = tableHeaderFontObj;
        tableHeaderCellTotalAudioLengthValue.border = thinBorderObj;
        tableHeaderCellTotalAudioLengthValue.alignment = titleCellAlignmentObj;
        tableHeaderCellTotalAudioLengthValue.fill = tableFilterHeaderFillObj;


        let tableHeaderCellTotalAppointment = worksheet.getCell('A'+(lastRowCount + 1));
        tableHeaderCellTotalAppointment.value = 'Total Appointment';
        tableHeaderCellTotalAppointment.font = tableHeaderFontObj;
        tableHeaderCellTotalAppointment.border = thinBorderObj;
        tableHeaderCellTotalAppointment.alignment = titleCellAlignmentObj;
        tableHeaderCellTotalAppointment.fill = tableFilterHeaderFillObj;

        let tableHeaderCellTotalAppointmentValue = worksheet.getCell('B'+(lastRowCount + 1));
        tableHeaderCellTotalAppointmentValue.value = consortiumTotalAppointmentCount;
        tableHeaderCellTotalAppointmentValue.font = tableHeaderFontObj;
        tableHeaderCellTotalAppointmentValue.border = thinBorderObj;
        tableHeaderCellTotalAppointmentValue.alignment = titleCellAlignmentObj;
        tableHeaderCellTotalAppointmentValue.fill = tableFilterHeaderFillObj;
    }
    else
    {
        let metricsArr = Object.values(metricsObj);
        if(metricsArr.length > 0)
        {
            lastRowCount += 4;
            
            let tableHeaderCellUser = worksheet.getCell('A'+lastRowCount);
            tableHeaderCellUser.value = 'User';
            tableHeaderCellUser.font = tableHeaderFontObj;
            tableHeaderCellUser.border = thinBorderObj;
            tableHeaderCellUser.alignment = titleCellAlignmentObj;
            tableHeaderCellUser.fill = tableFilterHeaderFillObj;
    
            let tableHeaderCellScribe = worksheet.getCell('B'+lastRowCount);
            tableHeaderCellScribe.value = 'Scribe';
            tableHeaderCellScribe.font = tableHeaderFontObj;
            tableHeaderCellScribe.border = thinBorderObj;
            tableHeaderCellScribe.alignment = titleCellAlignmentObj;
            tableHeaderCellScribe.fill = tableFilterHeaderFillObj;
    
            let tableHeaderCellFirstCheck = worksheet.getCell('C'+lastRowCount);
            tableHeaderCellFirstCheck.value = 'First Check';
            tableHeaderCellFirstCheck.font = tableHeaderFontObj;
            tableHeaderCellFirstCheck.border = thinBorderObj;
            tableHeaderCellFirstCheck.alignment = titleCellAlignmentObj;
            tableHeaderCellFirstCheck.fill = tableFilterHeaderFillObj;
    
            let tableHeaderCellSecondCheck = worksheet.getCell('D'+lastRowCount);
            tableHeaderCellSecondCheck.value = 'Second Check';
            tableHeaderCellSecondCheck.font = tableHeaderFontObj;
            tableHeaderCellSecondCheck.border = thinBorderObj;
            tableHeaderCellSecondCheck.alignment = titleCellAlignmentObj;
            tableHeaderCellSecondCheck.fill = tableFilterHeaderFillObj;
    
            let tableHeaderCellFinalCheck = worksheet.getCell('E'+lastRowCount);
            tableHeaderCellFinalCheck.value = 'Final Check';
            tableHeaderCellFinalCheck.font = tableHeaderFontObj;
            tableHeaderCellFinalCheck.border = thinBorderObj;
            tableHeaderCellFinalCheck.alignment = titleCellAlignmentObj;
            tableHeaderCellFinalCheck.fill = tableFilterHeaderFillObj;
    
            let tableHeaderCellTotalApt = worksheet.getCell('F'+lastRowCount);
            tableHeaderCellTotalApt.value = 'Total Apt';
            tableHeaderCellTotalApt.font = tableHeaderFontObj;
            tableHeaderCellTotalApt.border = thinBorderObj;
            tableHeaderCellTotalApt.alignment = titleCellAlignmentObj;
            tableHeaderCellTotalApt.fill = tableFilterHeaderFillObj;
    
            let tableHeaderCellTotalFiles = worksheet.getCell('G'+lastRowCount);
            tableHeaderCellTotalFiles.value = 'Total Files';
            tableHeaderCellTotalFiles.font = tableHeaderFontObj;
            tableHeaderCellTotalFiles.border = thinBorderObj;
            tableHeaderCellTotalFiles.alignment = titleCellAlignmentObj;
            tableHeaderCellTotalFiles.fill = tableFilterHeaderFillObj;
    
            
            let tableHeaderCellTotalLength = worksheet.getCell('H'+lastRowCount);
            tableHeaderCellTotalLength.value = 'Length';
            tableHeaderCellTotalLength.font = tableHeaderFontObj;
            tableHeaderCellTotalLength.border = thinBorderObj;
            tableHeaderCellTotalLength.alignment = titleCellAlignmentObj;
            tableHeaderCellTotalLength.fill = tableFilterHeaderFillObj;
    
            metricsArr.forEach((metrics) => {
    
                let length = metrics.length;
                length = parseInt(length);
                let totalDicationDuration = AppCommonService.secondsToHourMinuteSecond(length);
    
                const dayWiseRowObj = {
                    user : metrics.user,
                    scribeCount : metrics.scribeCount,
                    firstCheckCount : metrics.firstCheckCount,
                    secondCheckCount : metrics.secondCheckCount,
                    finalCheckCount : metrics.finalCheckCount,
                    totalApt : metrics.totalApt,
                    totalFiles : metrics.totalFiles,
                    length : totalDicationDuration,
                };
    
                let data = Object.values(dayWiseRowObj);
    
                let dataRow = worksheet.addRow(data);
        
                dataRow.eachCell((cell, number) => {
                    cell.border = thinBorderObj;
                    cell.alignment = cellAlignmentObj;
                });
        
            });

            lastRowCount = worksheet.rowCount;
            lastRowCount += 1;

            let tableHeaderCellTotalAptCount = worksheet.getCell('F'+lastRowCount);
            tableHeaderCellTotalAptCount.value = totalAptCount;
            tableHeaderCellTotalAptCount.font = tableHeaderFontObj;
            tableHeaderCellTotalAptCount.border = thinBorderObj;
            tableHeaderCellTotalAptCount.alignment = titleCellAlignmentObj;
            tableHeaderCellTotalAptCount.fill = tableFilterHeaderFillObj;
    
    
            let tableHeaderCellTotalFilesCount = worksheet.getCell('G'+lastRowCount);
            tableHeaderCellTotalFilesCount.value = totalUserFilesCount;
            tableHeaderCellTotalFilesCount.font = tableHeaderFontObj;
            tableHeaderCellTotalFilesCount.border = thinBorderObj;
            tableHeaderCellTotalFilesCount.alignment = titleCellAlignmentObj;
            tableHeaderCellTotalFilesCount.fill = tableFilterHeaderFillObj;

            totalUserFilesSizeCount = parseInt(totalUserFilesSizeCount);
            totalUserFilesSizeCount = AppCommonService.secondsToHourMinuteSecond(totalUserFilesSizeCount);

            let tableHeaderCellTotalLengthCount = worksheet.getCell('H'+lastRowCount);
            tableHeaderCellTotalLengthCount.value = totalUserFilesSizeCount;
            tableHeaderCellTotalLengthCount.font = tableHeaderFontObj;
            tableHeaderCellTotalLengthCount.border = thinBorderObj;
            tableHeaderCellTotalLengthCount.alignment = titleCellAlignmentObj;
            tableHeaderCellTotalLengthCount.fill = tableFilterHeaderFillObj;

        }
        // responseObj.metricsArr = metricsArr;
    }
   
    // responseObj.totalUserFilesCount = totalUserFilesCount;
    // responseObj.totalUserFilesSizeCount = totalUserFilesSizeCount;

    worksheet.columns = columnWidths;

    var tempLocalFileBasePath = AppConfigAssets.TEMP_UPLOADS_REPORTS_BASE_PATH;
    var tempLocalFileName = Date.now() + EXCEL_EXTENSION;

    var generatedLocalFilePath = tempLocalFileBasePath + tempLocalFileName;

    let writeStream = fs.createWriteStream(generatedLocalFilePath)
    await workbook.xlsx.write(writeStream);

    let fileContent = await AppUploadService.getFileContentStringAsBase64FromLocalFilePath(generatedLocalFilePath);

    fs.unlink(generatedLocalFilePath, function(err) {
        if (err) throw err;
    });

    responseObj.fileName = compFileName;
    responseObj.fileContent = fileContent;

    return responseObj;

}