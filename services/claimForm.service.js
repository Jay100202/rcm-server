var ConsortiumPatientAppointment = require("../models/consortiumPatientAppointment.model");
var ConsortiumPatient = require("../models/consortiumPatient.model");
var ConsortiumUser = require("../models/consortiumUser.model");
var Consortium = require("../models/consortium.model");
var AppointmentStatus = require("../models/appointmentStatus.model");
var AppDataSanitationService = require("./appDataSanitation.service");
var AppCommonService = require("./appcommon.service");
var AppConfigConst = require("../appconfig-const");
var mongodb = require("mongodb");
var mongoose = require("mongoose");
var moment = require("moment");
const Encounter = require("../models/encounter.model");
const ExcelJS = require("exceljs");
const ClaimForm = require("../models/claimForm.model");

exports.createClaimForm = async function (claimFormData) {
  try {
    const claimForm = new ClaimForm(claimFormData);
    return await claimForm.save();
  } catch (e) {
    throw Error("Error while creating claim form: " + e);
  }
};

exports.findClaimFormById = async function (claimFormId) {
  try {
    return await ClaimForm.find({appointmentId:claimFormId}).exec();
  } catch (e) {
    throw Error("Error while fetching claim form by ID: " + e);
  }
};

exports.updateClaimForm = async function (claimFormId, updatedData) {
  try {
    const claimForm = await ClaimForm.findOneAndUpdate(
      {appointmentId:claimFormId},
      {
        $set: updatedData,
        updatedAt: Date.now(),
      },
      { new: true }
    ).exec();

    if (!claimForm) {
      throw new Error("Claim form not found");
    }

    return claimForm;
  } catch (e) {
    throw Error("Error while updating claim form: " + e);
  }
};

exports.saveOrUpdateClaimForm = async function (claimFormId, claimFormData) {
  try {
  let checkData = await ClaimForm.find({appointmentId:claimFormId});
  if(checkData.length>0)
  {
    return await this.updateClaimForm(claimFormId, claimFormData);
  }
  else
  {
    return await this.createClaimForm(claimFormData);
  }
  } catch (e) {
    throw Error("Error while saving/updating claim form: " + e);
  }
};

exports.deleteClaimForm = async function (claimFormId) {
  try {
    return await ClaimForm.findByIdAndDelete(claimFormId).exec();
  } catch (e) {
    throw Error("Error while deleting claim form: " + e);
  }
};

exports.getConsortiumPatientAppointments = async function (req, systemUser) {
  var filKeyword = req.body.filKeyword;
  var filCreatedBy = req.body.filCreatedBy;
  var filUpdatedBy = req.body.filUpdatedBy;
  var filConsortium = req.body.filConsortium;
  var filConsortiumUser = req.body.filConsortiumUser;
  var filConsortiumPatient = req.body.filConsortiumPatient;
  var filConsortiumLocation = req.body.filConsortiumLocation;
  var filSystemUser = req.body.filSystemUser;
  let dateOfBirth = req.body.dateOfBirth;
  let dateOfService = req.body.dateOfService;
  let patientName = req.body.patientName;
  let mrNumber = req.body.mrNumber;
  let filAppointmentStatus = req.body.filAppointmentStatus;
  let filTranscriptionStatus = req.body.filTranscriptionStatus;
  let filIsDictationUploadCompleted = req.body.filIsDictationUploadCompleted;
  let filStartTranscriptionAllocationDate =
    req.body.filStartTranscriptionAllocationDate;
  let filEndTranscriptionAllocationDate =
    req.body.filEndTranscriptionAllocationDate;
  let filAppointmentId = req.body.filAppointmentId;
  let filAreAppointmentDetailsFilled = req.body.filAreAppointmentDetailsFilled;

  var forExport =
    req.body.forExport && typeof req.body.forExport === "boolean"
      ? req.body.forExport
      : false;

  var status = req.body.isActive;
  var page = req.body.page ? req.body.page * 1 : 1;
  var limit = req.body.length ? req.body.length * 1 : 10;
  var searchStr = req.body.searchStr ? req.body.searchStr : "";
  var sortByCol = req.body.sortBy ? req.body.sortBy : "col1";
  var sortOrder = req.body.sortOrder ? req.body.sortOrder : "asc";

  var skipVal = req.body.start ? req.body.start * 1 : 0;

  if (page && page > 0) {
    skipVal = (page - 1) * limit;
  }

  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);
  let sessConsortiumUserId;
  let sessConsortiumLocationId;
  if (consortiumUser) {
    sessConsortiumUserId = consortiumUser._id;
    sessConsortiumLocationId =
      await AppCommonService.getConsortiumLocationIdFromRequest(req);
  }
  // Options setup for the mongoose paginate
  const populateOptions = [
    {
      path: "consortium",
      select: "consortiumName consortiumShortCode consortiumId",
    },
    {
      path: "consortiumUser",
      select: "userFullName",
    },
    {
      path: "consortiumPatient",
      select:
        "patientId firstName middleName lastName fullName birthDate mrNumber",
    },
    {
      path: "appointmentStatus",
      select: "statusText statusCode priority colorCode",
    },
    {
      path: "transcriptionStatus",
      select: "statusText statusCode priority colorCode",
    },
    {
      path: "consortiumLocation",
      select: "locationName",
      populate: [
        {
          path: "timeZoneOption",
        },
      ],
    },
    {
      path: "mtAssignedTo",
      select: "userFullName",
    },
    {
      path: "qa1AssignedTo",
      select: "userFullName",
    },
    {
      path: "qa2AssignedTo",
      select: "userFullName",
    },
    {
      path: "qa3AssignedTo",
      select: "userFullName",
    },
    {
      path: "mtActivityAction",
      select: "actionText actionCode colorCode iconCode",
    },
    {
      path: "qa1ActivityAction",
      select: "actionText actionCode colorCode iconCode",
    },
    {
      path: "qa2ActivityAction",
      select: "actionText actionCode colorCode iconCode",
    },
    {
      path: "qa3ActivityAction",
      select: "actionText actionCode colorCode iconCode",
    },
    {
      path: "activityPriority",
    },
    {
      path: "ongoingActivityAction",
      select: "actionText actionCode colorCode iconCode",
    },
    {
      path: "ongoingActivityFileStatus",
    },
    {
      path: "ongoingActivityStakeholder",
    },
    {
      path: "ongoingActivityTranscriptorRole",
    },
    {
      path: "submittedTranscriptionAttachment",
    },
    {
      path: "duplicatedBasePatientAppointment",
      select: "appointmentId",
    },
    {
      path: "createdBySystemUser",
      select: "userFullName",
    },
    {
      path: "updatedBySystemUser",
      select: "userFullName",
    },
    {
      path: "createdByConsortiumUser",
      select: "userFullName",
    },
    {
      path: "updatedByConsortiumUser",
      select: "userFullName",
    },
  ];

  const consortiumPatientAppointmentPrefix =
    AppCommonService.getConsortiumPatientAppointmentPrefixText(req);

  const projectObj = {
    _id: "$_id",
    appointmentIdInt: "$appointmentId",
    appointmentId: {
      $concat: [
        consortiumPatientAppointmentPrefix,
        { $substr: ["$appointmentId", 0, -1] },
      ],
    },
    consortium: "$consortium",
    consortiumUser: "$consortiumUser",
    consortiumPatient: "$consortiumPatient",
    consortiumLocation: "$consortiumLocation",
    appointmentDate: "$appointmentDate",
    startTime: "$startTime",
    endTime: "$endTime",
    appointmentDateInt: "$appointmentDateInt",
    startTimeInt: "$startTimeInt",
    endTimeInt: "$endTimeInt",
    appointmentStatus: "$appointmentStatus",
    transcriptionStatus: "$transcriptionStatus",
    notes: "$notes",
    confirmedAt: "$confirmedAt",
    arrivedAt: "$arrivedAt",
    aptStartedAt: "$aptStartedAt",
    aptEndedAt: "$aptEndedAt",
    totalDicationDurationInSeconds: "$totalDicationDurationInSeconds",
    totalDicationAttachmentFileSizeBytes:
      "$totalDicationAttachmentFileSizeBytes",
    totalDictationUploadCount: "$totalDictationUploadCount",
    hasDictation: "$hasDictation",
    mtAssignedTo: "$mtAssignedTo",
    qa1AssignedTo: "$qa1AssignedTo",
    qa2AssignedTo: "$qa2AssignedTo",
    qa3AssignedTo: "$qa3AssignedTo",
    mtActivityAction: "$mtActivityAction",
    qa1ActivityAction: "$qa1ActivityAction",
    qa2ActivityAction: "$qa2ActivityAction",
    qa3ActivityAction: "$qa3ActivityAction",
    activityPriority: "$activityPriority",
    transcriptionAllocationDate: "$transcriptionAllocationDate",
    submittedTranscriptionAttachment: "$submittedTranscriptionAttachment",
    ongoingActivityAction: "$ongoingActivityAction",
    ongoingActivityFileStatus: "$ongoingActivityFileStatus",
    ongoingActivityStakeholder: "$ongoingActivityStakeholder",
    ongoingActivityTranscriptorRole: "$ongoingActivityTranscriptorRole",
    areAppointmentDetailsFilled: "$areAppointmentDetailsFilled",
    isBulkDictationAppointment: "$isBulkDictationAppointment",
    patientFullName: "$patientFullName",
    patientFirstName: "$patientFirstName",
    patientLastName: "$patientLastName",
    patientBirthDate: "$patientBirthDate",
    patientMRNumber: "$patientMRNumber",
    isDuplicatedDictationAppointment: "$isDuplicatedDictationAppointment",
    duplicatedBasePatientAppointment: "$duplicatedBasePatientAppointment",
    additionalTranscriptionNotes: "$additionalTranscriptionNotes",
    isFinalTranscriptionAttachmentDownloaded:
      "$isFinalTranscriptionAttachmentDownloaded",
    isActive: "$isActive",
    createdAt: "$createdAt",
    updatedAt: "$updatedAt",
    createdBy: "$createdBy",
    updatedBy: "$updatedBy",
    consortiumLP: "$consortiumLP",
    consortiumPatientLP: "$consortiumPatientLP",
    consortiumUserLP: "$consortiumUserLP",
    appointmentStatusLP: "$appointmentStatusLP",
  };

  let hasConsortiumLookup = false;
  let hasConsortiumUserLookup = false;
  let hasConsortiumPatientLookup = false;
  let hasAppointmentStatusLookup = false;

  let fetchOptions = {};
  fetchOptions.isDeleted = 0;
  fetchOptions.BillerAssignedTo = new mongoose.Types.ObjectId(systemUser._id);

  if (status !== undefined && status !== "") {
    status = AppDataSanitationService.sanitizeDataTypeNumber(status);
    fetchOptions.isActive = status;
  }

  if (mongodb.ObjectId.isValid(filConsortium)) {
    fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
  } else if (isConsortiumUserRequest === true) {
    if (consortiumUser) {
      let consortiumId = consortiumUser.consortium;
      if (mongodb.ObjectId.isValid(consortiumId)) {
        fetchOptions.consortium = new mongoose.Types.ObjectId(consortiumId);
      }
    }
  }

  if (mongodb.ObjectId.isValid(filTranscriptionStatus)) {
    fetchOptions.transcriptionStatus = new mongoose.Types.ObjectId(
      filTranscriptionStatus
    );
  }

  if (mongodb.ObjectId.isValid(filAppointmentStatus)) {
    fetchOptions.appointmentStatus = new mongoose.Types.ObjectId(
      filAppointmentStatus
    );
  }

  if (mongodb.ObjectId.isValid(filConsortiumUser)) {
    fetchOptions.consortiumUser = new mongoose.Types.ObjectId(
      filConsortiumUser
    );
  }

  if (mongodb.ObjectId.isValid(filConsortiumPatient)) {
    fetchOptions.consortiumPatient = new mongoose.Types.ObjectId(
      filConsortiumPatient
    );
  }

  if (mongodb.ObjectId.isValid(filConsortiumLocation)) {
    fetchOptions.consortiumLocation = new mongoose.Types.ObjectId(
      filConsortiumLocation
    );
  } else if (mongodb.ObjectId.isValid(sessConsortiumLocationId)) {
    fetchOptions.consortiumLocation = new mongoose.Types.ObjectId(
      sessConsortiumLocationId
    );
  }

  if (mongodb.ObjectId.isValid(filCreatedBy)) {
    fetchOptions["createdBy"] = new mongoose.Types.ObjectId(filCreatedBy);
  }

  if (mongodb.ObjectId.isValid(filUpdatedBy)) {
    fetchOptions.updatedBy = new mongoose.Types.ObjectId(filUpdatedBy);
  }

  let secFetchOptions = {};

  if (filAppointmentId !== undefined && filAppointmentId !== "") {
    var regex = new RegExp(filAppointmentId, "i");
    secFetchOptions.appointmentId = regex;
  }

  let applicableOptions = [];
  if (mongodb.ObjectId.isValid(filSystemUser)) {
    let orFetchOptions = [];

    orFetchOptions.push({
      mtAssignedTo: new mongoose.Types.ObjectId(filSystemUser),
    });
    orFetchOptions.push({
      qa1AssignedTo: new mongoose.Types.ObjectId(filSystemUser),
    });
    orFetchOptions.push({
      qa1AssignedTo: new mongoose.Types.ObjectId(filSystemUser),
    });
    orFetchOptions.push({
      qa3AssignedTo: new mongoose.Types.ObjectId(filSystemUser),
    });

    applicableOptions.push({ $or: orFetchOptions });
  }

  if (applicableOptions.length > 0) {
    let allOtherFetchOptions = [];
    Object.keys(fetchOptions).forEach(function (k) {
      allOtherFetchOptions.push({ [k]: fetchOptions[k] });
    });

    allOtherFetchOptions.push({ $or: applicableOptions });

    let complexFetchOptions = {
      $and: allOtherFetchOptions,
    };

    fetchOptions = complexFetchOptions;
  }

  if (
    filIsDictationUploadCompleted !== undefined &&
    filIsDictationUploadCompleted === true
  ) {
    fetchOptions.isDictationUploadCompleted = true;
    fetchOptions.totalDictationUploadCount = { $gte: 0 };
  }

  if (
    filAreAppointmentDetailsFilled !== undefined &&
    filAreAppointmentDetailsFilled === true
  ) {
    fetchOptions.areAppointmentDetailsFilled = true;
  }

  // let hasDateOfBirthFilters = false;
  let hasDateOfServiceFilters = false;

  if (dateOfService && dateOfService > 0) {
    hasDateOfServiceFilters = true;
  }

  // if (hasDateOfBirthFilters === true) {
  //     fetchOptions['$consortiumPatientLP.birthDate'] = dateOfBirth;
  // }

  if (hasDateOfServiceFilters === true) {
    // 86400 is second in day
    fetchOptions.appointmentDate = {
      $gte: dateOfService,
      $lt: dateOfService + 86400,
    };
  }

  let dateTranscriptionAllocationFilters = {};
  let hasTranscriptionAllocationDateFilters = false;
  if (
    filStartTranscriptionAllocationDate &&
    filStartTranscriptionAllocationDate > 0
  ) {
    dateTranscriptionAllocationFilters["$gte"] =
      filStartTranscriptionAllocationDate;
    hasTranscriptionAllocationDateFilters = true;
  }

  if (
    filEndTranscriptionAllocationDate &&
    filEndTranscriptionAllocationDate > 0
  ) {
    let endDtObj = moment.unix(filEndTranscriptionAllocationDate);
    let endTs = endDtObj.unix();

    dateTranscriptionAllocationFilters["$lte"] = endTs;
    hasTranscriptionAllocationDateFilters = true;
  }

  if (hasTranscriptionAllocationDateFilters === true) {
    fetchOptions.transcriptionAllocationDate =
      dateTranscriptionAllocationFilters;
  }

  if (filKeyword && filKeyword !== undefined && filKeyword !== "") {
    searchStr = filKeyword;
  }

  if (searchStr && searchStr !== "") {
    var regex = new RegExp(searchStr, "i");

    let searchKeywordOptions = [];

    hasConsortiumLookup = true;
    searchKeywordOptions.push({ "consortiumLP.consortiumName": regex });

    hasConsortiumUserLookup = true;
    searchKeywordOptions.push({ "consortiumUserLP.userFullName": regex });

    hasConsortiumPatientLookup = true;
    searchKeywordOptions.push({ "consortiumPatientLP.firstName": regex });

    let allOtherFetchOptions = [];
    Object.keys(fetchOptions).forEach(function (k) {
      allOtherFetchOptions.push({ [k]: fetchOptions[k] });
    });
    allOtherFetchOptions.push({ $or: searchKeywordOptions });

    let complexFetchOptions = {
      $and: allOtherFetchOptions,
    };

    fetchOptions = complexFetchOptions;
  }
  if (dateOfBirth && dateOfBirth > 0) {
    var regex = new RegExp(searchStr, "i");

    let searchKeywordOptions = [];

    hasConsortiumPatientLookup = true;
    searchKeywordOptions.push({ "consortiumPatientLP.birthDate": dateOfBirth });

    let allOtherFetchOptions = [];
    Object.keys(fetchOptions).forEach(function (k) {
      allOtherFetchOptions.push({ [k]: fetchOptions[k] });
    });
    allOtherFetchOptions.push({ $or: searchKeywordOptions });

    let complexFetchOptions = {
      $and: allOtherFetchOptions,
    };
    fetchOptions = complexFetchOptions;
  }

  if (patientName && patientName !== "") {
    var regex = new RegExp(patientName, "i");

    let searchKeywordOptions = [];

    hasConsortiumPatientLookup = true;
    searchKeywordOptions.push({ "consortiumPatientLP.fullName": regex });

    let allOtherFetchOptions = [];
    Object.keys(fetchOptions).forEach(function (k) {
      allOtherFetchOptions.push({ [k]: fetchOptions[k] });
    });
    allOtherFetchOptions.push({ $or: searchKeywordOptions });

    let complexFetchOptions = {
      $and: allOtherFetchOptions,
    };
    fetchOptions = complexFetchOptions;
  }

  if (mrNumber && mrNumber !== "") {
    var regex = new RegExp(mrNumber, "i");

    let searchKeywordOptions = [];

    hasConsortiumPatientLookup = true;
    searchKeywordOptions.push({ "consortiumPatientLP.mrNumber": regex });

    let allOtherFetchOptions = [];
    Object.keys(fetchOptions).forEach(function (k) {
      allOtherFetchOptions.push({ [k]: fetchOptions[k] });
    });
    allOtherFetchOptions.push({ $or: searchKeywordOptions });

    let complexFetchOptions = {
      $and: allOtherFetchOptions,
    };
    fetchOptions = complexFetchOptions;
  }

  let sortOrderInt = 1;
  if (sortOrder && sortOrder === "asc") {
    sortOrderInt = 1;
  } else if (sortOrder && sortOrder === "desc") {
    sortOrderInt = -1;
  }

  let sortOptions;
  if (sortByCol && typeof sortByCol === "string") {
    if (sortByCol == "col1") {
      sortOptions = {
        appointmentIdInt: sortOrderInt,
      };
    } else if (sortByCol == "col6") {
      sortOptions = {
        appointmentDate: sortOrderInt,
      };
    } else if (sortByCol == "col5") {
      hasConsortiumUserLookup = true;
      sortOptions = {
        "consortiumUserLP.userFullName": sortOrderInt,
      };
    } else if (sortByCol == "col4") {
      hasConsortiumPatientLookup = true;
      sortOptions = {
        "consortiumPatientLP.birthDate": sortOrderInt,
      };
    } else if (sortByCol == "col3") {
      hasConsortiumPatientLookup = true;
      sortOptions = {
        "consortiumPatientLP.firstName": sortOrderInt,
      };
    } else if (sortByCol == "col2") {
      hasConsortiumPatientLookup = true;
      sortOptions = {
        "consortiumPatientLP.mrNumber": sortOrderInt,
      };
    } else if (sortByCol == "col11") {
      hasAppointmentStatusLookup = true;
      sortOptions = {
        startTimeInt: sortOrderInt,
      };
    } else if (sortByCol == AppConfigConst.MAT_COLUMN_NAME_STATUS) {
      sortOptions = {
        isActive: sortOrderInt,
      };
    }
  } else {
    sortOptions = {
      appointmentDate: sortOrderInt,
    };
  }

  const consortiumLookup = {
    from: Consortium.collection.name,
    localField: "consortium",
    foreignField: "_id",
    as: "consortiumLP",
  };

  const consortiumPatientLookup = {
    from: ConsortiumPatient.collection.name,
    localField: "consortiumPatient",
    foreignField: "_id",
    as: "consortiumPatientLP",
  };

  const consortiumUserLookup = {
    from: ConsortiumUser.collection.name,
    localField: "consortiumUser",
    foreignField: "_id",
    as: "consortiumUserLP",
  };

  const appointmentStatusLookup = {
    from: AppointmentStatus.collection.name,
    localField: "appointmentStatus",
    foreignField: "_id",
    as: "appointmentStatusLP",
  };

  try {
    let aggregationParamArr = [];

    if (hasAppointmentStatusLookup) {
      aggregationParamArr.push({
        $lookup: appointmentStatusLookup,
      });
    }

    if (hasConsortiumLookup) {
      aggregationParamArr.push({
        $lookup: consortiumLookup,
      });
    }

    if (hasConsortiumUserLookup) {
      aggregationParamArr.push({
        $lookup: consortiumUserLookup,
      });
    }

    if (hasConsortiumPatientLookup) {
      aggregationParamArr.push({
        $lookup: consortiumPatientLookup,
      });
    }

    // if (hasDateOfBirthFilters === true) {
    //      aggregationParamArr.push( {
    //         $unwind: "$consortiumPatientLP"
    //       })
    // }

    aggregationParamArr.push({
      $match: fetchOptions,
    });

    //     if (hasDateOfBirthFilters === true) {
    //     aggregationParamArr.push({
    //         $match: {
    //             "consortiumPatientLP.birthDate": dateOfBirth
    //           }
    //     });
    // }

    let consortiumPatientAppointments;
    if (forExport === true) {
      consortiumPatientAppointments =
        await ConsortiumPatientAppointment.aggregate(aggregationParamArr)
          .project(projectObj)
          .match(secFetchOptions)
          .sort(sortOptions);
    } else {
      consortiumPatientAppointments =
        await ConsortiumPatientAppointment.aggregate(aggregationParamArr)
          .project(projectObj)
          .match(secFetchOptions)
          .sort(sortOptions)
          .skip(skipVal)
          .limit(limit);
    }

    consortiumPatientAppointments = await ConsortiumPatientAppointment.populate(
      consortiumPatientAppointments,
      populateOptions
    );

    let recordCntData = await ConsortiumPatientAppointment.aggregate([
      {
        $match: fetchOptions,
      },
      {
        $project: projectObj,
      },
      {
        $match: secFetchOptions,
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAppointmentDurationInSeconds: {
            $sum: "$totalDicationDurationInSeconds",
          },
        },
      },
    ]);

    let totalRecords = 0;
    let totalAppointmentDurationInSeconds = 0;

    if (recordCntData && recordCntData[0] && recordCntData[0].count) {
      totalRecords = recordCntData[0].count;
      totalAppointmentDurationInSeconds =
        recordCntData[0].totalAppointmentDurationInSeconds;
    }

    let filteredRecords = totalRecords;

    let response = {
      results: consortiumPatientAppointments,
      totalRecords: totalRecords,
      filteredRecords: filteredRecords,
      totalAppointmentDurationInSeconds: totalAppointmentDurationInSeconds,
    };

    return response;
  } catch (e) {
    throw Error("Error while Paginating ConsortiumPatientAppointment " + e);
  }
};
