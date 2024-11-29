var AppConfig = require('../appconfig');
var AppConfigUploads = require('../appconfig-uploads');
var AppConfigModule = require('../appconfig-module');
var AppConfigPrefix = require('../appconfig-prefix');
var AppConfigConst = require('../appconfig-const');
var AppCommonService = require('../services/appcommon.service');
var moment = require('moment');
var momentTZ = require('moment-timezone');

// Saving the context of this module inside the _the variable
_this = this

exports.sanitizeDataTypeString = function(strVal, isRequired = true) {
  var sanitizedString;

  if (strVal !== undefined && strVal !== null && strVal !== '') 
  {
    sanitizedString = strVal.toString().trim();
  }

  if(isRequired !== undefined && isRequired === true && sanitizedString === undefined)
  {
    sanitizedString = '';
  }

  return sanitizedString;
}

exports.sanitizeDataTypeNumber = function(numVal, isRequired = true) {
  var sanitizedNumber;

  if (numVal !== undefined && numVal !== null && !isNaN(numVal)) 
  {
    sanitizedNumber = numVal * 1;
  }

  if(isRequired !== undefined && isRequired === true && sanitizedNumber === undefined)
  {
    sanitizedNumber = 0;
  }

  return sanitizedNumber;
}

exports.sanitizeDataTypeBoolean = function(boolVal, isRequired = true) {
  var sanitizedBoolean;

  if (boolVal !== undefined && boolVal !== null && typeof boolVal === 'boolean') 
  {
    sanitizedBoolean = boolVal;
  }

  if(isRequired !== undefined && isRequired === true && sanitizedBoolean === undefined)
  {
    sanitizedBoolean = false;
  }

  return sanitizedBoolean;
}

exports.sanitizeDataTypeInteger = function(numVal, isRequired = true) {
  var sanitizedInteger;

  if (numVal !== undefined && numVal !== null && !isNaN(numVal)) 
  {
    sanitizedInteger = parseInt(numVal);
  }

  if(isRequired !== undefined && isRequired === true && sanitizedInteger === undefined)
  {
    sanitizedInteger = 0;
  }

  return sanitizedInteger;
}

exports.sanitizeDataTypeDecimal = function(numVal, isRequired = true) {
  var sanitizedDecimal;

  if (numVal !== undefined && numVal !== null && !isNaN(numVal)) 
  {
    sanitizedDecimal = AppCommonService.formulateTruncatedDecimalNumber(numVal);
  }

  if(isRequired !== undefined && isRequired === true && sanitizedDecimal === undefined)
  {
    sanitizedDecimal = 0;
  }

  return sanitizedDecimal;
}

exports.sanitizeDataTypeDisplayDate = function(dateVal, isRequired = true) {
  var sanitizedDateTs;

  if (dateVal !== undefined && dateVal !== null && dateVal !== '') 
  {
    var parsedDateString = moment(dateVal, 'DD-MM-YYYY').toString();
    if (parsedDateString !== 'Invalid date') 
    {
      sanitizedDateTs = AppCommonService.getTimestampFromDate(parsedDateString);
    }
  }

  if(isRequired !== undefined && isRequired === true && sanitizedDateTs === undefined)
  {
    sanitizedDateTs = 0;
  }

  return sanitizedDateTs;
}

exports.sanitizeDataTypeDateTimeStamp = function(dateVal, isRequired = true) {
  var sanitizedDateTs;

  if (dateVal !== undefined && dateVal !== null && dateVal !== '' && typeof dateVal === 'number') 
  {
    var parsedDateString = moment.unix(dateVal).toString();
    if (parsedDateString !== 'Invalid date') 
    {
      sanitizedDateTs = dateVal;
    }
  }

  if(isRequired !== undefined && isRequired === true && sanitizedDateTs === undefined)
  {
    sanitizedDateTs = 0;
  }

  return sanitizedDateTs;
}

exports.checkIfStringIsValidURL = function(consStr) {
  var regExp = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
  return regExp.test(consStr);
}

exports.checkIfStringIsValidInteger = function(consStr) {
  var regExp = /^-?[0-9][^\.]*$/;
  return regExp.test(consStr);
}

exports.checkIfStringIsValidAplhaNumeric = function(consStr) {
  var regExp = /^([a-zA-Z0-9]+)$/;
  return regExp.test(consStr);
}

exports.checkIfStringIsValidEmail = function(consStr) {
  var regExp = /(^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$)/i;
  return regExp.test(consStr);
}

exports.checkIfStringIsValidMobileNumber = function(consStr) {
  var regExp = /^\d{10}$/;
  return regExp.test(consStr);
}
