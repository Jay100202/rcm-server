var ConsortiumPatientService = require('../services/consortiumPatient.service')
var AppScheduledJobsService = require('../services/appScheduledJobs.service')
var TimeZoneOptionService = require('../services/timeZoneOption.service')
var moment = require("moment");
var momentTZ = require('moment-timezone');
var mongodb = require("mongodb");

// Saving the context of this module inside the _the variable

_this = this

exports.updateConsortiumPatientId = async function(req, res, next) {
  
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    try
    {
        let consortiumPatientList = await ConsortiumPatientService.updateConsortiumPatientId();
        responseObj.consortiumPatientList = consortiumPatientList;
        resStatus = 1;
    }
    catch(e)
    {
        resStatus = -1;
        resMsg = "Error : " + e;
    }
    
  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
}


exports.checkAndScheduleSystemUserNotification = async function(req, res, next) {
  
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    try
    {
        responseObj.systemUsers = await AppScheduledJobsService.checkAndScheduleSystemUserNotification();
        responseObj.consortiumUsers = await AppScheduledJobsService.checkAndScheduleConsortiumUserNotification();
      
        resStatus = 1;
    }
    catch(e)
    {
        resStatus = -1;
        resMsg = "Error : " + e;
    }
    
  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
}


exports.fillTimeZoneOption = async function(req, res)
{
    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};
    
    var offsetTmz=[];
    var countries = moment.tz.countries();

    for(var country in countries)
    {
        var zones = moment.tz.zonesForCountry(countries[country], true);
        
        await Promise.all(zones.map(async (zone, zoneIndex) => {
        
            let timeZoneName = zone.name;
            let offset = zone.offset;
            let offsetStr = "GMT"+moment.tz(timeZoneName).format('Z');

            let timeZone =  {
                timeZoneName : timeZoneName,
                timeZoneOffset : offset,
                timeZoneOffsetStr : offsetStr
            };

            // let savedTimeZoneOption = await TimeZoneOptionService.saveTimeZoneOption(timeZone);            
            offsetTmz.push(timeZone);
        }));
    }

 
    resStatus = 1;

    responseObj.status = resStatus;
    responseObj.message = resMsg;
    responseObj.offsetTmz = offsetTmz;

    return res.status(httpStatus).json(responseObj);

}