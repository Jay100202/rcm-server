var ConsortiumPatientAppointment = require("../models/consortiumPatientAppointment.model");
var ConsortiumPatient = require("../models/consortiumPatient.model");
var ConsortiumUser = require("../models/consortiumUser.model");
var ConsortiumLocationService = require("./consortiumLocation.service");
var SystemUser = require("../models/systemUser.model");
var Consortium = require("../models/consortium.model");
var AppointmentStatus = require("../models/appointmentStatus.model");
var ActivityPriority = require("../models/activityPriority.model");
var TranscriptionStatus = require("../models/transcriptionStatus.model");
var ConsortiumPatientAppointmentDictationAttachmentService = require("./consortiumPatientAppointmentDictationAttachment.service");
var AppointmentStatusService = require("./appointmentStatus.service");
var TranscriptionStatusService = require("./transcriptionStatus.service");
var AppDataSanitationService = require("./appDataSanitation.service");
var AppUploadService = require("./appUpload.service");
var AppConfig = require("../appconfig");
var AppCommonService = require("./appcommon.service");
var AppConfigConst = require("../appconfig-const");
var mongodb = require("mongodb");
var mongoose = require("mongoose");
var moment = require("moment");
var momentTZ = require("moment-timezone");

// Saving the context of this module inside the _the variable
_this = this;

// Async function to add ConsortiumPatientAppointment
exports.saveConsortiumPatientAppointment = async function (
  consortiumPatientAppointment,
  req
) {
  const currTs = await AppCommonService.getCurrentTimestamp();

  let modConsortiumPatientAppointment = null;
  if (mongodb.ObjectId.isValid(consortiumPatientAppointment.id)) {
    try {
      modConsortiumPatientAppointment =
        await ConsortiumPatientAppointment.findById(
          consortiumPatientAppointment.id
        );
    } catch (e) {
      throw Error(
        "Error occured while Finding the ConsortiumPatientAppointment"
      );
    }
  }

  let isAdd = false;
  if (!modConsortiumPatientAppointment) {
    modConsortiumPatientAppointment = new ConsortiumPatientAppointment();
    modConsortiumPatientAppointment.createdAt = currTs;

    if (consortiumPatientAppointment.createdBySystemUser !== undefined)
      modConsortiumPatientAppointment.createdBySystemUser =
        consortiumPatientAppointment.createdBySystemUser;

    if (consortiumPatientAppointment.createdByConsortiumUser !== undefined)
      modConsortiumPatientAppointment.createdByConsortiumUser =
        consortiumPatientAppointment.createdByConsortiumUser;

    let appointmentId;
    if (consortiumPatientAppointment.appointmentId !== undefined) {
      appointmentId = consortiumPatientAppointment.appointmentId;
    } else {
      appointmentId =
        await AppCommonService.generateConsortiumPatientAppointmentId(
          consortiumPatientAppointment.consortium
        );
    }

    modConsortiumPatientAppointment.appointmentId = appointmentId;

    isAdd = true;
  }

  modConsortiumPatientAppointment.updatedAt = currTs;

  if (consortiumPatientAppointment.updatedBySystemUser !== undefined)
    modConsortiumPatientAppointment.updatedBySystemUser =
      consortiumPatientAppointment.updatedBySystemUser;

  if (consortiumPatientAppointment.updatedByConsortiumUser !== undefined)
    modConsortiumPatientAppointment.updatedByConsortiumUser =
      consortiumPatientAppointment.updatedByConsortiumUser;

  if (consortiumPatientAppointment.consortium !== undefined) {
    if (mongodb.ObjectId.isValid(consortiumPatientAppointment.consortium)) {
      modConsortiumPatientAppointment.consortium =
        consortiumPatientAppointment.consortium;
    } else {
      modConsortiumPatientAppointment.consortium = null;
    }
  }

  if (consortiumPatientAppointment.consortiumUser !== undefined) {
    if (mongodb.ObjectId.isValid(consortiumPatientAppointment.consortiumUser)) {
      modConsortiumPatientAppointment.consortiumUser =
        consortiumPatientAppointment.consortiumUser;
    } else {
      modConsortiumPatientAppointment.consortiumUser = null;
    }
  }

  if (consortiumPatientAppointment.consortiumPatient !== undefined) {
    if (
      mongodb.ObjectId.isValid(consortiumPatientAppointment.consortiumPatient)
    ) {
      modConsortiumPatientAppointment.consortiumPatient =
        consortiumPatientAppointment.consortiumPatient;
    } else {
      modConsortiumPatientAppointment.consortiumPatient = null;
    }
  }

  if (consortiumPatientAppointment.consortiumLocation !== undefined) {
    if (
      mongodb.ObjectId.isValid(consortiumPatientAppointment.consortiumLocation)
    ) {
      modConsortiumPatientAppointment.consortiumLocation =
        consortiumPatientAppointment.consortiumLocation;
    } else {
      modConsortiumPatientAppointment.consortiumLocation = null;
    }
  }

  if (consortiumPatientAppointment.appointmentDate !== undefined)
    modConsortiumPatientAppointment.appointmentDate =
      consortiumPatientAppointment.appointmentDate;

  if (consortiumPatientAppointment.startTime !== undefined)
    modConsortiumPatientAppointment.startTime =
      consortiumPatientAppointment.startTime;

  if (consortiumPatientAppointment.endTime !== undefined)
    modConsortiumPatientAppointment.endTime =
      consortiumPatientAppointment.endTime;

  if (consortiumPatientAppointment.appointmentDateInt !== undefined)
    modConsortiumPatientAppointment.appointmentDateInt =
      consortiumPatientAppointment.appointmentDateInt;

  if (consortiumPatientAppointment.startTimeInt !== undefined)
    modConsortiumPatientAppointment.startTimeInt =
      consortiumPatientAppointment.startTimeInt;

  if (consortiumPatientAppointment.endTimeInt !== undefined)
    modConsortiumPatientAppointment.endTimeInt =
      consortiumPatientAppointment.endTimeInt;

  if (consortiumPatientAppointment.appointmentStatus !== undefined)
    modConsortiumPatientAppointment.appointmentStatus =
      consortiumPatientAppointment.appointmentStatus;

  if (consortiumPatientAppointment.notes !== undefined)
    modConsortiumPatientAppointment.notes = consortiumPatientAppointment.notes;

  if (consortiumPatientAppointment.appointmentAttachments !== undefined)
    modConsortiumPatientAppointment.appointmentAttachments =
      consortiumPatientAppointment.appointmentAttachments;

  if (consortiumPatientAppointment.transcriptionAssignedAt !== undefined)
    modConsortiumPatientAppointment.transcriptionAssignedAt =
      consortiumPatientAppointment.transcriptionAssignedAt;

  if (consortiumPatientAppointment.transcriptionAssignedBy !== undefined)
    modConsortiumPatientAppointment.transcriptionAssignedBy =
      consortiumPatientAppointment.transcriptionAssignedBy;

  if (consortiumPatientAppointment.transcriptionStatus !== undefined)
    modConsortiumPatientAppointment.transcriptionStatus =
      consortiumPatientAppointment.transcriptionStatus;

  if (consortiumPatientAppointment.transcriptionStatusNotes !== undefined)
    modConsortiumPatientAppointment.transcriptionStatusNotes =
      consortiumPatientAppointment.transcriptionStatusNotes;

  if (consortiumPatientAppointment.isSubmitted !== undefined)
    modConsortiumPatientAppointment.isSubmitted =
      consortiumPatientAppointment.isSubmitted;

  if (consortiumPatientAppointment.transcriptionSubmittedAt !== undefined)
    modConsortiumPatientAppointment.transcriptionSubmittedAt =
      consortiumPatientAppointment.transcriptionSubmittedAt;

  if (consortiumPatientAppointment.transcriptionSubmittedBy !== undefined)
    modConsortiumPatientAppointment.transcriptionSubmittedBy =
      consortiumPatientAppointment.transcriptionSubmittedBy;

  if (consortiumPatientAppointment.hasDictation !== undefined)
    modConsortiumPatientAppointment.hasDictation =
      consortiumPatientAppointment.hasDictation;

  if (consortiumPatientAppointment.isCompleted !== undefined)
    modConsortiumPatientAppointment.isCompleted =
      consortiumPatientAppointment.isCompleted;

  if (consortiumPatientAppointment.transcriptionCompletedAt !== undefined)
    modConsortiumPatientAppointment.transcriptionCompletedAt =
      consortiumPatientAppointment.transcriptionCompletedAt;

  if (consortiumPatientAppointment.transcriptionCompletedBy !== undefined)
    modConsortiumPatientAppointment.transcriptionCompletedBy =
      consortiumPatientAppointment.transcriptionCompletedBy;

  if (consortiumPatientAppointment.isDictationUploadCompleted !== undefined)
    modConsortiumPatientAppointment.isDictationUploadCompleted =
      consortiumPatientAppointment.isDictationUploadCompleted;

  if (consortiumPatientAppointment.dictationUploadCompletedAt !== undefined)
    modConsortiumPatientAppointment.dictationUploadCompletedAt =
      consortiumPatientAppointment.dictationUploadCompletedAt;

  if (
    consortiumPatientAppointment.totalDicationAttachmentFileSizeBytes !==
    undefined
  )
    modConsortiumPatientAppointment.totalDicationAttachmentFileSizeBytes =
      consortiumPatientAppointment.totalDicationAttachmentFileSizeBytes;

  if (consortiumPatientAppointment.totalDicationDurationInSeconds !== undefined)
    modConsortiumPatientAppointment.totalDicationDurationInSeconds =
      consortiumPatientAppointment.totalDicationDurationInSeconds;

  if (consortiumPatientAppointment.totalDictationUploadCount !== undefined)
    modConsortiumPatientAppointment.totalDictationUploadCount =
      consortiumPatientAppointment.totalDictationUploadCount;

  if (consortiumPatientAppointment.flagOffMarkedAt !== undefined)
    modConsortiumPatientAppointment.flagOffMarkedAt =
      consortiumPatientAppointment.flagOffMarkedAt;

  if (consortiumPatientAppointment.flagOffMarkedBy !== undefined)
    modConsortiumPatientAppointment.flagOffMarkedBy =
      consortiumPatientAppointment.flagOffMarkedBy;

  if (consortiumPatientAppointment.mtAssignedTo !== undefined) {
    if (mongodb.ObjectId.isValid(consortiumPatientAppointment.mtAssignedTo)) {
      modConsortiumPatientAppointment.mtAssignedTo =
        consortiumPatientAppointment.mtAssignedTo;
    } else {
      modConsortiumPatientAppointment.mtAssignedTo = null;
    }
  }

  if (consortiumPatientAppointment.mtAssignedBy !== undefined) {
    if (mongodb.ObjectId.isValid(consortiumPatientAppointment.mtAssignedBy)) {
      modConsortiumPatientAppointment.mtAssignedBy =
        consortiumPatientAppointment.mtAssignedBy;
    } else {
      modConsortiumPatientAppointment.mtAssignedBy = null;
    }
  }
  if (consortiumPatientAppointment.mtAssignedAt !== undefined)
    modConsortiumPatientAppointment.mtAssignedAt =
      consortiumPatientAppointment.mtAssignedAt;

  if (consortiumPatientAppointment.mtActivityAction !== undefined) {
    if (
      mongodb.ObjectId.isValid(consortiumPatientAppointment.mtActivityAction)
    ) {
      modConsortiumPatientAppointment.mtActivityAction =
        consortiumPatientAppointment.mtActivityAction;
    } else {
      modConsortiumPatientAppointment.mtActivityAction = null;
    }
  }

  if (consortiumPatientAppointment.qa1AssignedTo !== undefined) {
    if (mongodb.ObjectId.isValid(consortiumPatientAppointment.qa1AssignedTo)) {
      modConsortiumPatientAppointment.qa1AssignedTo =
        consortiumPatientAppointment.qa1AssignedTo;
    } else {
      modConsortiumPatientAppointment.qa1AssignedTo = null;
    }
  }

  if (consortiumPatientAppointment.qa1AssignedAt !== undefined)
    modConsortiumPatientAppointment.qa1AssignedAt =
      consortiumPatientAppointment.qa1AssignedAt;

  if (consortiumPatientAppointment.qa1AssignedBy !== undefined) {
    if (mongodb.ObjectId.isValid(consortiumPatientAppointment.qa1AssignedBy)) {
      modConsortiumPatientAppointment.qa1AssignedBy =
        consortiumPatientAppointment.qa1AssignedBy;
    } else {
      modConsortiumPatientAppointment.qa1AssignedBy = null;
    }
  }

  if (consortiumPatientAppointment.qa1ActivityAction !== undefined) {
    if (
      mongodb.ObjectId.isValid(consortiumPatientAppointment.qa1ActivityAction)
    ) {
      modConsortiumPatientAppointment.qa1ActivityAction =
        consortiumPatientAppointment.qa1ActivityAction;
    } else {
      modConsortiumPatientAppointment.qa1ActivityAction = null;
    }
  }

  if (consortiumPatientAppointment.qa2AssignedTo !== undefined) {
    if (mongodb.ObjectId.isValid(consortiumPatientAppointment.qa2AssignedTo)) {
      modConsortiumPatientAppointment.qa2AssignedTo =
        consortiumPatientAppointment.qa2AssignedTo;
    } else {
      modConsortiumPatientAppointment.qa2AssignedTo = null;
    }
  }

  if (consortiumPatientAppointment.qa2AssignedAt !== undefined)
    modConsortiumPatientAppointment.qa2AssignedAt =
      consortiumPatientAppointment.qa2AssignedAt;

  if (consortiumPatientAppointment.qa2AssignedBy !== undefined) {
    if (mongodb.ObjectId.isValid(consortiumPatientAppointment.qa2AssignedBy)) {
      modConsortiumPatientAppointment.qa2AssignedBy =
        consortiumPatientAppointment.qa2AssignedBy;
    } else {
      modConsortiumPatientAppointment.qa2AssignedBy = null;
    }
  }

  if (consortiumPatientAppointment.qa2ActivityAction !== undefined) {
    if (
      mongodb.ObjectId.isValid(consortiumPatientAppointment.qa2ActivityAction)
    ) {
      modConsortiumPatientAppointment.qa2ActivityAction =
        consortiumPatientAppointment.qa2ActivityAction;
    } else {
      modConsortiumPatientAppointment.qa2ActivityAction = null;
    }
  }

  if (consortiumPatientAppointment.qa3AssignedTo !== undefined) {
    if (mongodb.ObjectId.isValid(consortiumPatientAppointment.qa3AssignedTo)) {
      modConsortiumPatientAppointment.qa3AssignedTo =
        consortiumPatientAppointment.qa3AssignedTo;
    } else {
      modConsortiumPatientAppointment.qa3AssignedTo = null;
    }
  }

  if (consortiumPatientAppointment.qa3AssignedAt !== undefined)
    modConsortiumPatientAppointment.qa3AssignedAt =
      consortiumPatientAppointment.qa3AssignedAt;

  if (consortiumPatientAppointment.qa3AssignedBy !== undefined) {
    if (mongodb.ObjectId.isValid(consortiumPatientAppointment.qa3AssignedBy)) {
      modConsortiumPatientAppointment.qa3AssignedBy =
        consortiumPatientAppointment.qa3AssignedBy;
    } else {
      modConsortiumPatientAppointment.qa3AssignedBy = null;
    }
  }

  if (consortiumPatientAppointment.qa3ActivityAction !== undefined) {
    if (
      mongodb.ObjectId.isValid(consortiumPatientAppointment.qa3ActivityAction)
    ) {
      modConsortiumPatientAppointment.qa3ActivityAction =
        consortiumPatientAppointment.qa3ActivityAction;
    } else {
      modConsortiumPatientAppointment.qa3ActivityAction = null;
    }
  }

  if (consortiumPatientAppointment.activityPriority !== undefined) {
    if (
      mongodb.ObjectId.isValid(consortiumPatientAppointment.activityPriority)
    ) {
      modConsortiumPatientAppointment.activityPriority =
        consortiumPatientAppointment.activityPriority;
    } else {
      modConsortiumPatientAppointment.activityPriority = null;
    }
  }

  if (
    consortiumPatientAppointment.submittedTranscriptionAttachment !== undefined
  ) {
    if (
      mongodb.ObjectId.isValid(
        consortiumPatientAppointment.submittedTranscriptionAttachment
      )
    ) {
      modConsortiumPatientAppointment.submittedTranscriptionAttachment =
        consortiumPatientAppointment.submittedTranscriptionAttachment;
    } else {
      modConsortiumPatientAppointment.submittedTranscriptionAttachment = null;
    }
  }

  if (consortiumPatientAppointment.ongoingActivityAction !== undefined) {
    if (
      mongodb.ObjectId.isValid(
        consortiumPatientAppointment.ongoingActivityAction
      )
    ) {
      modConsortiumPatientAppointment.ongoingActivityAction =
        consortiumPatientAppointment.ongoingActivityAction;
    } else {
      modConsortiumPatientAppointment.ongoingActivityAction = null;
    }
  }

  if (consortiumPatientAppointment.ongoingActivityFileStatus !== undefined) {
    if (
      mongodb.ObjectId.isValid(
        consortiumPatientAppointment.ongoingActivityFileStatus
      )
    ) {
      modConsortiumPatientAppointment.ongoingActivityFileStatus =
        consortiumPatientAppointment.ongoingActivityFileStatus;
    } else {
      modConsortiumPatientAppointment.ongoingActivityFileStatus = null;
    }
  }

  if (consortiumPatientAppointment.ongoingActivityStakeholder !== undefined) {
    if (
      mongodb.ObjectId.isValid(
        consortiumPatientAppointment.ongoingActivityStakeholder
      )
    ) {
      modConsortiumPatientAppointment.ongoingActivityStakeholder =
        consortiumPatientAppointment.ongoingActivityStakeholder;
    } else {
      modConsortiumPatientAppointment.ongoingActivityStakeholder = null;
    }
  }

  if (
    consortiumPatientAppointment.ongoingActivityTranscriptorRole !== undefined
  ) {
    if (
      mongodb.ObjectId.isValid(
        consortiumPatientAppointment.ongoingActivityTranscriptorRole
      )
    ) {
      modConsortiumPatientAppointment.ongoingActivityTranscriptorRole =
        consortiumPatientAppointment.ongoingActivityTranscriptorRole;
    } else {
      modConsortiumPatientAppointment.ongoingActivityTranscriptorRole = null;
    }
  }

  if (consortiumPatientAppointment.transcriptionAllocationDate !== undefined)
    modConsortiumPatientAppointment.transcriptionAllocationDate =
      consortiumPatientAppointment.transcriptionAllocationDate;

  if (consortiumPatientAppointment.confirmedAt !== undefined)
    modConsortiumPatientAppointment.confirmedAt =
      consortiumPatientAppointment.confirmedAt;

  if (consortiumPatientAppointment.arrivedAt !== undefined)
    modConsortiumPatientAppointment.arrivedAt =
      consortiumPatientAppointment.arrivedAt;

  if (consortiumPatientAppointment.aptStartedAt !== undefined)
    modConsortiumPatientAppointment.aptStartedAt =
      consortiumPatientAppointment.aptStartedAt;

  if (consortiumPatientAppointment.aptEndedAt !== undefined)
    modConsortiumPatientAppointment.aptEndedAt =
      consortiumPatientAppointment.aptEndedAt;

  if (consortiumPatientAppointment.areAppointmentDetailsFilled !== undefined)
    modConsortiumPatientAppointment.areAppointmentDetailsFilled =
      consortiumPatientAppointment.areAppointmentDetailsFilled;

  if (consortiumPatientAppointment.isBulkDictationAppointment !== undefined)
    modConsortiumPatientAppointment.isBulkDictationAppointment =
      consortiumPatientAppointment.isBulkDictationAppointment;

  if (consortiumPatientAppointment.patientFullName !== undefined)
    modConsortiumPatientAppointment.patientFullName =
      consortiumPatientAppointment.patientFullName;

  if (consortiumPatientAppointment.patientFirstName !== undefined)
    modConsortiumPatientAppointment.patientFirstName =
      consortiumPatientAppointment.patientFirstName;

  if (consortiumPatientAppointment.patientLastName !== undefined)
    modConsortiumPatientAppointment.patientLastName =
      consortiumPatientAppointment.patientLastName;

  if (consortiumPatientAppointment.patientBirthDate !== undefined) {
    modConsortiumPatientAppointment.patientBirthDate =
      consortiumPatientAppointment.patientBirthDate;

    let patientBirthDateStr = "";
    if (
      modConsortiumPatientAppointment.patientBirthDate &&
      modConsortiumPatientAppointment.patientBirthDate !== ""
    ) {
      var tzStr = await AppCommonService.getTimezoneStrFromRequest(req);
      const birthDateObj = momentTZ
        .unix(modConsortiumPatientAppointment.patientBirthDate)
        .tz(tzStr);
      patientBirthDateStr = birthDateObj.format("YYYYMMDD");
    }
    modConsortiumPatientAppointment.patientBirthDateStr = patientBirthDateStr;
  }

  if (consortiumPatientAppointment.patientMRNumber !== undefined)
    modConsortiumPatientAppointment.patientMRNumber =
      consortiumPatientAppointment.patientMRNumber;

  if (
    consortiumPatientAppointment.isDuplicatedDictationAppointment !== undefined
  )
    modConsortiumPatientAppointment.isDuplicatedDictationAppointment =
      consortiumPatientAppointment.isDuplicatedDictationAppointment;

  if (
    consortiumPatientAppointment.duplicatedBasePatientAppointment !== undefined
  ) {
    if (
      mongodb.ObjectId.isValid(
        consortiumPatientAppointment.duplicatedBasePatientAppointment
      )
    ) {
      modConsortiumPatientAppointment.duplicatedBasePatientAppointment =
        consortiumPatientAppointment.duplicatedBasePatientAppointment;
    } else {
      modConsortiumPatientAppointment.duplicatedBasePatientAppointment = null;
    }
  }

  if (consortiumPatientAppointment.additionalTranscriptionNotes !== undefined)
    modConsortiumPatientAppointment.additionalTranscriptionNotes =
      consortiumPatientAppointment.additionalTranscriptionNotes;

  if (
    consortiumPatientAppointment.isFinalTranscriptionAttachmentDownloaded !==
    undefined
  )
    modConsortiumPatientAppointment.isFinalTranscriptionAttachmentDownloaded =
      consortiumPatientAppointment.isFinalTranscriptionAttachmentDownloaded;

  if (consortiumPatientAppointment.isActive !== undefined)
    modConsortiumPatientAppointment.isActive =
      consortiumPatientAppointment.isActive;

  if (consortiumPatientAppointment.isDeleted !== undefined)
    modConsortiumPatientAppointment.isDeleted =
      consortiumPatientAppointment.isDeleted;

  try {
    var savedConsortiumPatientAppointment =
      await modConsortiumPatientAppointment.save();
    if (savedConsortiumPatientAppointment) {
      if (isAdd === true) {
        var appointmentStatus =
          await AppointmentStatusService.findDefaultAppointmentStatus();
        if (appointmentStatus) {
          let appointmentStatusId = appointmentStatus._id;
          let consortiumPatientAppointmentId =
            savedConsortiumPatientAppointment._id;
          let createdBySystemUser =
            savedConsortiumPatientAppointment.createdBySystemUser;
          let createdByConsortiumUser =
            savedConsortiumPatientAppointment.createdByConsortiumUser;
          let updTranscriptionStatusNotes = "";
          await AppointmentStatusService.updateAppointmentStatus(
            consortiumPatientAppointmentId,
            appointmentStatusId,
            createdBySystemUser,
            createdByConsortiumUser,
            updTranscriptionStatusNotes
          );
        }
      }
      await exports.updateConsortiumPatientAppointmentDate(
        savedConsortiumPatientAppointment._id
      );
    }
    return savedConsortiumPatientAppointment;
  } catch (e) {
    throw Error(
      "And Error occured while updating the ConsortiumPatientAppointment " + e
    );
  }
};

exports.updateConsortiumPatientAppointmentDate = async function (
  consortiumPatientAppointmentId
) {
  try {
    const populateOptions = [
      {
        path: "consortiumLocation",
        select: "locationName",
        populate: [
          {
            path: "timeZoneOption",
          },
        ],
      },
    ];

    const projectObj = {
      _id: "$_id",
      consortiumLocation: "$consortiumLocation",
      appointmentDate: "$appointmentDate",
      startTime: "$startTime",
      endTime: "$endTime",
    };

    let fetchOptions = {};
    fetchOptions.isDeleted = 0;

    if (mongodb.ObjectId.isValid(consortiumPatientAppointmentId)) {
      fetchOptions._id = new mongoose.Types.ObjectId(
        consortiumPatientAppointmentId
      );
    }

    let sortOptions = {
      _id: 1,
    };

    let aggregationParamArr = [];

    aggregationParamArr.push({
      $match: fetchOptions,
    });

    let consortiumPatientAppointments =
      await ConsortiumPatientAppointment.aggregate(aggregationParamArr)
        .project(projectObj)
        .sort(sortOptions);

    consortiumPatientAppointments = await ConsortiumPatientAppointment.populate(
      consortiumPatientAppointments,
      populateOptions
    );

    if (consortiumPatientAppointments.length > 0) {
      await Promise.all(
        consortiumPatientAppointments.map(
          async (
            consortiumPatientAppointment,
            consortiumPatientAppointmentIndex
          ) => {
            let appointmentDate = consortiumPatientAppointment.appointmentDate;
            let startTime = consortiumPatientAppointment.startTime;
            let endTime = consortiumPatientAppointment.endTime;
            let consortiumLocation =
              consortiumPatientAppointment.consortiumLocation;

            if (consortiumLocation) {
              let timeZoneOption = consortiumLocation.timeZoneOption;

              if (timeZoneOption !== null && timeZoneOption !== undefined) {
                let timeZoneName = timeZoneOption.timeZoneName;

                let appointmentDateInt;
                let startTimeInt;
                let endTimeInt;
                if (
                  timeZoneName !== "" &&
                  appointmentDate !== undefined &&
                  appointmentDate &&
                  appointmentDate !== "" &&
                  appointmentDate > 0
                ) {
                  const appointmentDateObj = momentTZ
                    .unix(appointmentDate)
                    .tz(timeZoneName);
                  let appointmentDateStr =
                    appointmentDateObj.format("YYYYMMDD");
                  appointmentDateInt =
                    await AppDataSanitationService.sanitizeDataTypeNumber(
                      appointmentDateStr
                    );
                }

                if (
                  timeZoneName !== "" &&
                  startTime !== undefined &&
                  startTime &&
                  startTime !== "" &&
                  startTime > 0
                ) {
                  const startTimeObj = momentTZ
                    .unix(startTime)
                    .tz(timeZoneName);
                  let startTimeStr = startTimeObj.format("YYYYMMDDHHmm");
                  startTimeInt =
                    await AppDataSanitationService.sanitizeDataTypeNumber(
                      startTimeStr
                    );
                }

                if (
                  timeZoneName !== "" &&
                  endTime !== undefined &&
                  endTime &&
                  endTime !== "" &&
                  endTime > 0
                ) {
                  const endTimeObj = momentTZ.unix(endTime).tz(timeZoneName);
                  let endTimeStr = endTimeObj.format("YYYYMMDDHHmm");
                  endTimeInt =
                    await AppDataSanitationService.sanitizeDataTypeNumber(
                      endTimeStr
                    );
                }

                if (
                  appointmentDateInt !== undefined ||
                  startTimeInt !== undefined ||
                  endTimeInt !== undefined
                ) {
                  let updConsortiumPatientAppointment = {};
                  updConsortiumPatientAppointment.appointmentDateInt =
                    appointmentDateInt;
                  updConsortiumPatientAppointment.startTimeInt = startTimeInt;
                  updConsortiumPatientAppointment.endTimeInt = endTimeInt;

                  let savedConsortiumPatientAppointment =
                    await ConsortiumPatientAppointment.updateOne(
                      { _id: consortiumPatientAppointment._id },
                      { $set: updConsortiumPatientAppointment }
                    );
                }
              }
            }
          }
        )
      );
    }
  } catch (e) {
    throw Error("Error while Fetching ConsortiumPatientAppointment" + e);
  }
};

exports.assignRolesToAppointment = async function (appointmentId, roles) {
  try {
    // Construct the update object based on the provided roles
    const updateFields = {};
    if (roles.coderId) updateFields.coderAssignedTo = roles.coderId;
    if (roles.coderQAId) updateFields.coderqaAssignedTo = roles.coderQAId;
    if (roles.billerId) updateFields.BillerAssignedTo = roles.billerId;
    if (roles.billerQAId) updateFields.BillerqaAssignedTo = roles.billerQAId;

    // Find the appointment by ID and update it
    const updateResult = await ConsortiumPatientAppointment.findByIdAndUpdate(
      appointmentId,
      {
        $set: updateFields, // Update the respective fields with the new IDs
      },
      {
        new: true, // Option to return the updated document
      }
    );

    // Check if the update was successful
    if (!updateResult) {
      throw new Error(
        `No appointment found with ID ${appointmentId} or failed to assign roles.`
      );
    }

    return updateResult; // Return the updated appointment document
  } catch (error) {
    console.error("Error assigning roles to appointment:", error);
    throw error; // Propagate the error
  }
};

// Async function to get the ConsortiumPatientAppointments List
exports.getConsortiumPatientAppointments = async function (req) {
  var filKeyword = req.body.filKeyword;
  var filCreatedBy = req.body.filCreatedBy;
  var filUpdatedBy = req.body.filUpdatedBy;
  var filConsortium = req.body.filConsortium;
  var filConsortiumUser = req.body.filConsortiumUser;
  var filConsortiumPatient = req.body.filConsortiumPatient;
  var filConsortiumLocation = req.body.filConsortiumLocation;
  var filSystemUser = req.body.filSystemUser;
  let filStartDate = req.body.filStartDate;
  let filEndDate = req.body.filEndDate;
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
      select: "patientId firstName middleName lastName fullName birthDate",
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

  let dateFilters = {};
  let hasDateFilters = false;
  if (filStartDate && filStartDate > 0) {
    dateFilters["$gte"] = filStartDate;
    hasDateFilters = true;
  }

  if (filEndDate && filEndDate > 0) {
    let endDtObj = moment.unix(filEndDate);
    let endTs = endDtObj.unix();

    dateFilters["$lte"] = endTs;
    hasDateFilters = true;
  }

  if (hasDateFilters === true) {
    fetchOptions.appointmentDate = dateFilters;
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
    } else if (sortByCol == "col2") {
      sortOptions = {
        appointmentDate: sortOrderInt,
      };
    } else if (sortByCol == "col3") {
      hasConsortiumUserLookup = true;
      sortOptions = {
        "consortiumUserLP.userFullName": sortOrderInt,
      };
    } else if (sortByCol == "col4") {
      hasConsortiumPatientLookup = true;
      sortOptions = {
        "consortiumPatientLP.birthDate": sortOrderInt,
      };
    } else if (sortByCol == "col5") {
      hasConsortiumPatientLookup = true;
      sortOptions = {
        "consortiumPatientLP.firstName": sortOrderInt,
      };
    } else if (sortByCol == "col6") {
      hasAppointmentStatusLookup = true;
      sortOptions = {
        "appointmentStatusLP.statusText": sortOrderInt,
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

    aggregationParamArr.push({
      $match: fetchOptions,
    });

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

exports.getConsortiumPatientAppointmentMetrics = async function (req) {
  var filConsortium = req.body.filConsortium;
  var filConsortiumLocation = req.body.filConsortiumLocation;
  let filStartDate = req.body.filStartDate;
  let filEndDate = req.body.filEndDate;

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

  const appStatusIdPendingId =
    await AppointmentStatusService.findAppointmentStatusIdByCode(
      AppConfigConst.APPOINTMENT_STATUS_CODE_PENDING
    );
  const appStatusIdWalkInId =
    await AppointmentStatusService.findAppointmentStatusIdByCode(
      AppConfigConst.APPOINTMENT_STATUS_CODE_WALK_IN
    );
  const appStatusIdConsultedId =
    await AppointmentStatusService.findAppointmentStatusIdByCode(
      AppConfigConst.APPOINTMENT_STATUS_CODE_CONSULTED
    );

  const projectObj = {
    _id: 0,
    pendingCount: {
      $cond: [{ $eq: ["$appointmentStatus", appStatusIdPendingId] }, 1, 0],
    },
    inProgressCount: {
      $cond: [{ $eq: ["$appointmentStatus", appStatusIdWalkInId] }, 1, 0],
    },
    checkedOutCount: {
      $cond: [{ $eq: ["$appointmentStatus", appStatusIdConsultedId] }, 1, 0],
    },
  };

  var fetchOptions = {
    isDeleted: 0,
  };

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

  if (mongodb.ObjectId.isValid(filConsortiumLocation)) {
    fetchOptions.consortiumLocation = new mongoose.Types.ObjectId(
      filConsortiumLocation
    );
  } else if (mongodb.ObjectId.isValid(sessConsortiumLocationId)) {
    fetchOptions.consortiumLocation = new mongoose.Types.ObjectId(
      sessConsortiumLocationId
    );
  }

  let dateFilters = {};
  let hasDateFilters = false;
  if (filStartDate && filStartDate > 0) {
    dateFilters["$gte"] = filStartDate;
    hasDateFilters = true;
  }

  if (filEndDate && filEndDate > 0) {
    let endDtObj = moment.unix(filEndDate);
    let endTs = endDtObj.unix();

    dateFilters["$lte"] = endTs;
    hasDateFilters = true;
  }

  if (hasDateFilters === true) {
    fetchOptions.appointmentDate = dateFilters;
  }

  try {
    let pendingCount = 0;
    let inProgressCount = 0;
    let checkedOutCount = 0;
    let totalAppointmentCount = 0;
    let recordCntData = await ConsortiumPatientAppointment.aggregate([
      {
        $match: fetchOptions,
      },
      {
        $project: projectObj,
      },
      {
        $group: {
          _id: null,
          totalAppointmentCount: { $sum: 1 },
          pendingCount: { $sum: "$pendingCount" },
          inProgressCount: { $sum: "$inProgressCount" },
          checkedOutCount: { $sum: "$checkedOutCount" },
        },
      },
    ]);

    if (recordCntData && recordCntData.length > 0) {
      const recCntObj = recordCntData[0];
      totalAppointmentCount = recCntObj.totalAppointmentCount;
      pendingCount = recCntObj.pendingCount;
      inProgressCount = recCntObj.inProgressCount;
      checkedOutCount = recCntObj.checkedOutCount;
    }

    let response = {
      all: totalAppointmentCount,
      pending: pendingCount,
      inProgress: inProgressCount,
      checkedOut: checkedOutCount,
    };

    return response;
  } catch (e) {
    throw Error(
      "Error while Fetching getConsortiumPatientAppointmentMetrics " + e
    );
  }
};

exports.getConsortiumPatientAppointmentForSystemUserAssignedWorkPoolList =
  async function (req) {
    let filStartDate = req.body.filStartDate;
    let filEndDate = req.body.filEndDate;
    var filConsortium = req.body.filConsortium;
    var filConsortiumUser = req.body.filConsortiumUser;
    var filConsortiumLocation = req.body.filConsortiumLocation;
    let filTranscriptionStatus = req.body.filTranscriptionStatus;
    let filMTAssignedTo = req.body.filMTAssignedTo;
    let filQA1AssignedTo = req.body.filQA1AssignedTo;
    let filQA2AssignedTo = req.body.filQA2AssignedTo;
    let filQA3AssignedTo = req.body.filQA3AssignedTo;
    let filActivityPriority = req.body.filActivityPriority;

    var filConsortiumPatient = req.body.filConsortiumPatient;
    let filAppointmentStatus = req.body.filAppointmentStatus;

    var sortByCol = req.body.sortBy ? req.body.sortBy : "col2";
    var sortOrder = req.body.sortOrder ? req.body.sortOrder : "desc";

    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    let transcriptionStatusIdForTranscriptionAssigned =
      await TranscriptionStatusService.findTranscriptionStatusIdByCode(
        AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED
      );
    let transcriptionStatusIdForQA1Assigned =
      await TranscriptionStatusService.findTranscriptionStatusIdByCode(
        AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA1_ASSIGNED
      );
    let transcriptionStatusIdForQA2Assigned =
      await TranscriptionStatusService.findTranscriptionStatusIdByCode(
        AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA2_ASSIGNED
      );
    let transcriptionStatusIdForQA3Assigned =
      await TranscriptionStatusService.findTranscriptionStatusIdByCode(
        AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA3_ASSIGNED
      );

    let transcriptionStatusIdArr = [
      new mongoose.Types.ObjectId(
        transcriptionStatusIdForTranscriptionAssigned
      ),
      new mongoose.Types.ObjectId(transcriptionStatusIdForQA1Assigned),
      new mongoose.Types.ObjectId(transcriptionStatusIdForQA2Assigned),
      new mongoose.Types.ObjectId(transcriptionStatusIdForQA3Assigned),
    ];

    // Options setup for the mongoose paginate
    const populateOptions = [
      {
        path: "consortium",
        select: "consortiumName consortiumShortCode",
      },
      {
        path: "consortiumUser",
        select: "userFullName",
      },
      {
        path: "consortiumPatient",
        select: "patientId firstName middleName lastName fullName",
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
      isActive: "$isActive",
      activityPriority: "$activityPriority",
      mtActivityAction: "$mtActivityAction",
      qa1ActivityAction: "$qa1ActivityAction",
      qa2ActivityAction: "$qa2ActivityAction",
      qa3ActivityAction: "$qa3ActivityAction",
      isBulkDictationAppointment: "$isBulkDictationAppointment",
      activityPriorityLP: "$activityPriorityLP",
      mtAssignedToLP: "$mtAssignedToLP",
      qa1AssignedToLP: "$qa1AssignedToLP",
      qa2AssignedToLP: "$qa2AssignedToLP",
      qa3AssignedToLP: "$qa3AssignedToLP",
      transcriptionStatusLP: "$transcriptionStatusLP",
      isUserMT: {
        $cond: {
          if: {
            $eq: ["$mtAssignedTo", new mongoose.Types.ObjectId(systemUserId)],
          },
          then: true,
          else: false,
        },
      },
      isUserQA1: {
        $cond: {
          if: {
            $eq: ["$qa1AssignedTo", new mongoose.Types.ObjectId(systemUserId)],
          },
          then: true,
          else: false,
        },
      },
      isUserQA2: {
        $cond: {
          if: {
            $eq: ["$qa2AssignedTo", new mongoose.Types.ObjectId(systemUserId)],
          },
          then: true,
          else: false,
        },
      },
      isUserQA3: {
        $cond: {
          if: {
            $eq: ["$qa3AssignedTo", new mongoose.Types.ObjectId(systemUserId)],
          },
          then: true,
          else: false,
        },
      },
      canUserPerformActivity: {
        $cond: {
          if: {
            $or: [
              {
                $and: [
                  {
                    $eq: [
                      "$mtAssignedTo",
                      new mongoose.Types.ObjectId(systemUserId),
                    ],
                  },
                  {
                    $eq: [
                      "$transcriptionStatus",
                      transcriptionStatusIdForTranscriptionAssigned,
                    ],
                  },
                ],
              },
              {
                $and: [
                  {
                    $eq: [
                      "$qa1AssignedTo",
                      new mongoose.Types.ObjectId(systemUserId),
                    ],
                  },
                  {
                    $eq: [
                      "$transcriptionStatus",
                      transcriptionStatusIdForQA1Assigned,
                    ],
                  },
                ],
              },
              {
                $and: [
                  {
                    $eq: [
                      "$qa2AssignedTo",
                      new mongoose.Types.ObjectId(systemUserId),
                    ],
                  },
                  {
                    $eq: [
                      "$transcriptionStatus",
                      transcriptionStatusIdForQA2Assigned,
                    ],
                  },
                ],
              },
              {
                $and: [
                  {
                    $eq: [
                      "$qa3AssignedTo",
                      new mongoose.Types.ObjectId(systemUserId),
                    ],
                  },
                  {
                    $eq: [
                      "$transcriptionStatus",
                      transcriptionStatusIdForQA3Assigned,
                    ],
                  },
                ],
              },
            ],
          },
          then: true,
          else: false,
        },
      },
    };

    let hasMTAssignedLookup = false;
    let hasQA1AssignedToLookup = false;
    let hasQA2AssignedToLookup = false;
    let hasQA3AssignedToLookup = false;
    let hasActivityPriorityLookup = false;
    let hasTranscriptionStatusLookup = false;

    let applicableOptions = [];
    let fetchOptions = {};

    fetchOptions.isDeleted = 0;
    fetchOptions.isDictationUploadCompleted = true;
    fetchOptions.isSubmitted = false;
    fetchOptions.isCompleted = false;
    fetchOptions.transcriptionStatus = { $in: transcriptionStatusIdArr };

    if (mongodb.ObjectId.isValid(systemUserId)) {
      let orFetchOptions = [];

      orFetchOptions.push({
        mtAssignedTo: new mongoose.Types.ObjectId(systemUserId),
      });
      orFetchOptions.push({
        qa1AssignedTo: new mongoose.Types.ObjectId(systemUserId),
      });
      orFetchOptions.push({
        qa1AssignedTo: new mongoose.Types.ObjectId(systemUserId),
      });
      orFetchOptions.push({
        qa3AssignedTo: new mongoose.Types.ObjectId(systemUserId),
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

    let dateFilters = {};
    let hasDateFilters = false;
    if (filStartDate && filStartDate > 0) {
      dateFilters["$gte"] = filStartDate;
      hasDateFilters = true;
    }

    if (filEndDate && filEndDate > 0) {
      let endDtObj = moment.unix(filEndDate);
      let endTs = endDtObj.unix();

      dateFilters["$lte"] = endTs;
      hasDateFilters = true;
    }

    if (hasDateFilters === true) {
      fetchOptions.appointmentDate = dateFilters;
    }

    if (mongodb.ObjectId.isValid(filConsortium)) {
      fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
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
    }

    if (mongodb.ObjectId.isValid(filMTAssignedTo)) {
      fetchOptions.mtAssignedTo = new mongoose.Types.ObjectId(filMTAssignedTo);
    }

    if (mongodb.ObjectId.isValid(filQA1AssignedTo)) {
      fetchOptions.qa1AssignedTo = new mongoose.Types.ObjectId(
        filQA1AssignedTo
      );
    }

    if (mongodb.ObjectId.isValid(filQA2AssignedTo)) {
      fetchOptions.qa2AssignedTo = new mongoose.Types.ObjectId(
        filQA2AssignedTo
      );
    }

    if (mongodb.ObjectId.isValid(filQA3AssignedTo)) {
      fetchOptions.qa3AssignedTo = new mongoose.Types.ObjectId(
        filQA3AssignedTo
      );
    }

    if (mongodb.ObjectId.isValid(filActivityPriority)) {
      fetchOptions.activityPriority = new mongoose.Types.ObjectId(
        filActivityPriority
      );
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
      } else if (sortByCol == "col2") {
        sortOptions = {
          appointmentDate: sortOrderInt,
        };
      } else if (sortByCol == "col3") {
        sortOptions = {
          totalDicationDurationInSeconds: sortOrderInt,
        };
      } else if (sortByCol == "col4") {
        sortOptions = {
          totalDicationAttachmentFileSizeBytes: sortOrderInt,
        };
      } else if (sortByCol == "col5") {
        hasMTAssignedLookup = true;
        sortOptions = {
          "mtAssignedToLP.userFullName": sortOrderInt,
        };
      } else if (sortByCol == "col6") {
        hasQA1AssignedToLookup = true;
        sortOptions = {
          "qa1AssignedToLP.userFullName": sortOrderInt,
        };
      } else if (sortByCol == "col7") {
        hasQA2AssignedToLookup = true;
        sortOptions = {
          "qa2AssignedToLP.userFullName": sortOrderInt,
        };
      } else if (sortByCol == "col8") {
        hasQA3AssignedToLookup = true;
        sortOptions = {
          "qa3AssignedToLP.userFullName": sortOrderInt,
        };
      } else if (sortByCol == "col9") {
        hasActivityPriorityLookup = true;
        sortOptions = {
          "activityPriorityLP.priorityText": sortOrderInt,
        };
      } else if (sortByCol == "col10") {
        hasTranscriptionStatusLookup = true;
        sortOptions = {
          "transcriptionStatusLP.statusText": sortOrderInt,
        };
      }
    } else {
      hasActivityPriorityLookup = true;
      sortOptions = {
        appointmentDate: 1,
        "activityPriorityLP.priority": -1,
      };
    }

    const activityPriorityLookup = {
      from: ActivityPriority.collection.name,
      localField: "activityPriority",
      foreignField: "_id",
      as: "activityPriorityLP",
    };

    const mtAssignedToLookup = {
      from: SystemUser.collection.name,
      localField: "mtAssignedTo",
      foreignField: "_id",
      as: "mtAssignedToLP",
    };

    const qa1AssignedToLookup = {
      from: SystemUser.collection.name,
      localField: "qa1AssignedTo",
      foreignField: "_id",
      as: "qa1AssignedToLP",
    };

    const qa2AssignedToLookup = {
      from: SystemUser.collection.name,
      localField: "qa2AssignedTo",
      foreignField: "_id",
      as: "qa2AssignedToLP",
    };

    const qa3AssignedToLookup = {
      from: SystemUser.collection.name,
      localField: "qa3AssignedTo",
      foreignField: "_id",
      as: "qa3AssignedToLP",
    };

    const transcriptionStatusLookup = {
      from: TranscriptionStatus.collection.name,
      localField: "transcriptionStatus",
      foreignField: "_id",
      as: "transcriptionStatusLP",
    };

    try {
      let aggregationParamArr = [];

      if (hasMTAssignedLookup) {
        aggregationParamArr.push({
          $lookup: mtAssignedToLookup,
        });
      }

      if (hasQA1AssignedToLookup) {
        aggregationParamArr.push({
          $lookup: qa1AssignedToLookup,
        });
      }

      if (hasQA2AssignedToLookup) {
        aggregationParamArr.push({
          $lookup: qa2AssignedToLookup,
        });
      }

      if (hasQA3AssignedToLookup) {
        aggregationParamArr.push({
          $lookup: qa3AssignedToLookup,
        });
      }

      if (hasActivityPriorityLookup) {
        aggregationParamArr.push({
          $lookup: activityPriorityLookup,
        });
      }

      if (hasTranscriptionStatusLookup) {
        aggregationParamArr.push({
          $lookup: transcriptionStatusLookup,
        });
      }

      aggregationParamArr.push({
        $match: fetchOptions,
      });

      let consortiumPatientAppointments =
        await ConsortiumPatientAppointment.aggregate(aggregationParamArr)
          .project(projectObj)
          .sort(sortOptions);

      consortiumPatientAppointments =
        await ConsortiumPatientAppointment.populate(
          consortiumPatientAppointments,
          populateOptions
        );

      return consortiumPatientAppointments;
    } catch (e) {
      throw Error("Error while Paginating ConsortiumPatientAppointment " + e);
    }
  };

exports.getConsortiumPatientAppointmentsForSelect = async function (
  req,
  onlyActiveStatus
) {
  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);

  var filConsortium = req.body.filConsortium;

  const projectObj = {
    _id: "$_id",
    id: "$_id",
    text: "$locationName",
    textI: { $toLower: "$locationName" },
  };

  const sortOptions = {};
  sortOptions.textI = 1;

  let fetchOptions = {};
  fetchOptions.isDeleted = 0;
  if (onlyActiveStatus && onlyActiveStatus == 1) {
    fetchOptions.isActive = 1;
  }

  if (isConsortiumUserRequest === true) {
    if (consortiumUser) {
      let consortiumId = consortiumUser.consortium;
      if (mongodb.ObjectId.isValid(consortiumId)) {
        fetchOptions.consortium = new mongoose.Types.ObjectId(consortiumId);
      }
    }
  }

  if (mongodb.ObjectId.isValid(filConsortium)) {
    fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
  }

  try {
    var consortiumPatientAppointment =
      await ConsortiumPatientAppointment.aggregate([{ $match: fetchOptions }])
        .project(projectObj)
        .sort(sortOptions);

    consortiumPatientAppointment.forEach(function (v) {
      delete v.textI;
      delete v._id;
    });

    return consortiumPatientAppointment;
  } catch (e) {
    throw Error("Error while Paginating ConsortiumPatientAppointment " + e);
  }
};

exports.checkConsortiumPatientAppointmentNameForDuplication = async function (
  id,
  locationName
) {
  var options = {
    locationName: new RegExp(`^${locationName}$`, "i"),
    isDeleted: 0,
  };

  if (id && id != "") {
    options._id = { $ne: id };
  }

  try {
    var consortiumPatientAppointment =
      await ConsortiumPatientAppointment.findOne(options);
    return consortiumPatientAppointment;
  } catch (e) {
    throw Error("Error while Fetching ConsortiumPatientAppointment " + e);
  }
};

exports.validateConsortiumPatientAppointmentForTranscriptionAssignment =
  async function (consortiumPatientAppointmentId) {
    // Options setup for the mongoose paginate
    let transcriptionStatusAssignmentPendingId =
      await TranscriptionStatusService.findTranscriptionStatusIdByCode(
        AppConfigConst.TRANSCRIPTION_STATUS_CODE_ASSIGNMENT_PENDING
      );

    var options = {
      _id: consortiumPatientAppointmentId,
      isDictationUploadCompleted: true,
      isDeleted: 0,
    };

    if (mongodb.ObjectId.isValid(transcriptionStatusAssignmentPendingId)) {
      options.transcriptionStatus = new mongoose.Types.ObjectId(
        transcriptionStatusAssignmentPendingId
      );
    }

    try {
      var consortiumPatientAppointment;
      if (mongodb.ObjectId.isValid(consortiumPatientAppointmentId)) {
        consortiumPatientAppointment =
          await ConsortiumPatientAppointment.findOne(options);
      }
      return consortiumPatientAppointment;
    } catch (e) {
      throw Error("Error while Fetching ConsortiumPatientAppointment" + e);
    }
  };

exports.validateConsortiumPatientAppointmentListForTranscriptionAssignment =
  async function (consortiumPatientAppointmentIdArr) {
    let selectArr = ["consortium", "-_id"];

    var includMongoIdArr = [];
    if (
      consortiumPatientAppointmentIdArr !== undefined &&
      consortiumPatientAppointmentIdArr.length > 0
    ) {
      consortiumPatientAppointmentIdArr.forEach((incId) => {
        if (mongodb.ObjectId.isValid(incId)) {
          includMongoIdArr.push(new mongoose.Types.ObjectId(incId));
        }
      });
    }

    var options = {
      isDictationUploadCompleted: true,
      isDeleted: 0,
    };

    if (includMongoIdArr && includMongoIdArr.length > 0) {
      options._id = { $in: includMongoIdArr };
    }

    try {
      var consortiumPatientAppointments =
        await ConsortiumPatientAppointment.find(options).select(selectArr);
      consortiumPatientAppointments = consortiumPatientAppointments.map(
        ({ consortium }) => consortium + ""
      );

      return Array.from(new Set(consortiumPatientAppointments));
    } catch (e) {
      throw Error("Error while Fetching ConsortiumPatientAppointment" + e);
    }
  };

exports.getConsortiumPatientAppointmentBaseObjectById = async function (
  consortiumPatientAppointmentId,
  withPopulation,
  req
) {
  // Options setup for the mongoose paginate
  let populateOptions = [];
  if (withPopulation !== undefined && withPopulation === true) {
    populateOptions = [
      {
        path: "consortium",
        select: "consortiumName consortiumId",
      },
      {
        path: "consortiumUser",
        select: "userFullName",
      },
      {
        path: "consortiumPatient",
        populate: [
          {
            path: "gender",
          },
        ],
      },
      {
        path: "appointmentStatus",
        select: "statusText statusCode priority colorCode",
      },
      {
        path: "transcriptionStatus",
        select: "statusText statusCode priority colorCode roleCode",
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
  }

  var options = {
    _id: new mongoose.Types.ObjectId(consortiumPatientAppointmentId),
    isDeleted: 0,
  };

  if (req !== null && req !== undefined) {
    var isConsortiumUserRequest =
      await AppCommonService.getIsRequestFromConsortiumUser(req);

    if (isConsortiumUserRequest === true) {
      var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(
        req
      );
      let sessConsortiumUserId;
      let sessConsortiumLocationId =
        await AppCommonService.getConsortiumLocationIdFromRequest(req);

      if (mongodb.ObjectId.isValid(sessConsortiumLocationId)) {
        options.consortiumLocation = new mongoose.Types.ObjectId(
          sessConsortiumLocationId
        );
      }
    }
  }

  try {
    var consortiumPatientAppointment;
    if (mongodb.ObjectId.isValid(consortiumPatientAppointmentId)) {
      consortiumPatientAppointment = await ConsortiumPatientAppointment.findOne(
        options
      ).populate(populateOptions);
    }
    return consortiumPatientAppointment;
  } catch (e) {
    throw Error("Error while Fetching ConsortiumPatientAppointment" + e);
  }
};

exports.findConsortiumPatientAppointmentById = async function (
  req,
  consortiumPatientAppointmentId,
  withPopulation = true
) {
  console.log("findConsortiumPatientAppointmentById called with:", {
    consortiumPatientAppointmentId,
    withPopulation,
  });

  try {
    var resConsortiumPatientAppointment;
    if (mongodb.ObjectId.isValid(consortiumPatientAppointmentId)) {
      console.log(
        "Valid consortiumPatientAppointmentId:",
        consortiumPatientAppointmentId
      );

      var consortiumPatientAppointment =
        await exports.getConsortiumPatientAppointmentBaseObjectById(
          consortiumPatientAppointmentId,
          withPopulation,
          req
        );
      console.log(
        "Fetched consortiumPatientAppointment:",
        consortiumPatientAppointment
      );

      if (consortiumPatientAppointment) {
        resConsortiumPatientAppointment = JSON.parse(
          JSON.stringify(consortiumPatientAppointment)
        );
        resConsortiumPatientAppointment.appointmentIdInt =
          resConsortiumPatientAppointment.appointmentId;
        resConsortiumPatientAppointment.appointmentId =
          AppCommonService.getConsortiumPatientAppointmentIdWithPrefix(
            resConsortiumPatientAppointment.appointmentId
          );

        const currAppointmentStatusCode =
          consortiumPatientAppointment.appointmentStatus.statusCode;
        console.log(
          "Current appointment status code:",
          currAppointmentStatusCode
        );

        resConsortiumPatientAppointment.canMarkForConsulted =
          await exports.canMarkConsortiumPatientAppointmentForConsulted(
            currAppointmentStatusCode
          );
        resConsortiumPatientAppointment.canMarkForWalkIn =
          await exports.canMarkConsortiumPatientAppointmentForWalkIn(
            currAppointmentStatusCode
          );

        console.log(
          "canMarkForConsulted:",
          resConsortiumPatientAppointment.canMarkForConsulted
        );
        console.log(
          "canMarkForWalkIn:",
          resConsortiumPatientAppointment.canMarkForWalkIn
        );

        if (
          resConsortiumPatientAppointment.isDictationUploadCompleted === false
        ) {
          resConsortiumPatientAppointment.canMarkForEditDictationAttachment = true;
        } else {
          resConsortiumPatientAppointment.canMarkForEditDictationAttachment = false;
        }

        console.log(
          "canMarkForEditDictationAttachment:",
          resConsortiumPatientAppointment.canMarkForEditDictationAttachment
        );

        let duplicatedBasePatientAppointment =
          consortiumPatientAppointment.duplicatedBasePatientAppointment;

        if (
          duplicatedBasePatientAppointment !== undefined &&
          duplicatedBasePatientAppointment !== null
        ) {
          resConsortiumPatientAppointment.duplicatedBasePatientAppointment.appointmentIdInt =
            consortiumPatientAppointment.duplicatedBasePatientAppointment.appointmentId;
          resConsortiumPatientAppointment.duplicatedBasePatientAppointment.appointmentId =
            AppCommonService.getConsortiumPatientAppointmentIdWithPrefix(
              consortiumPatientAppointment.duplicatedBasePatientAppointment
                .appointmentId
            );
        }

        console.log(
          "duplicatedBasePatientAppointment:",
          resConsortiumPatientAppointment.duplicatedBasePatientAppointment
        );

        // let appointmentAttachments = resConsortiumPatientAppointment.appointmentAttachments;
        // if(appointmentAttachments && appointmentAttachments.length > 0)
        // {
        //     await Promise.all(appointmentAttachments.map(async (appointmentAttachment, attIndex) => {
        //         if(appointmentAttachment.isImage === true)
        //         {
        //             let attImageUrl = AppUploadService.getConsortiumPatientAppointmentAttachmentUrlFromPath(consortiumPatientAppointment.consortium,appointmentAttachment.attFilePathActual);
        //             let attThumbImageUrl = AppUploadService.getConsortiumPatientAppointmentAttachmentUrlFromPath(consortiumPatientAppointment.consortium,appointmentAttachment.attFilePathThumb);

        //             appointmentAttachment.attImageUrl = attImageUrl;
        //             appointmentAttachment.attThumbImageUrl = attThumbImageUrl;
        //         }
        //         else
        //         {
        //             let attFileUrl = AppUploadService.getConsortiumPatientAppointmentAttachmentUrlFromPath(consortiumPatientAppointment.consortium,appointmentAttachment.attFilePath);

        //             appointmentAttachment.attFileUrl = attFileUrl;
        //         }
        //     }));
        // }
      }
    } else {
      console.log(
        "Invalid consortiumPatientAppointmentId:",
        consortiumPatientAppointmentId
      );
    }

    console.log(
      "Returning resConsortiumPatientAppointment:",
      resConsortiumPatientAppointment
    );
    return resConsortiumPatientAppointment;
  } catch (e) {
    console.error("Error while Fetching ConsortiumPatientAppointment:", e);
    throw Error("Error while Fetching ConsortiumPatientAppointment" + e);
  }
};

exports.checkConsortiumPatientAppointment = async function (
  req,
  consortiumPatientAppointmentId
) {
  console.log("checkConsortiumPatientAppointment called with:", {
    consortiumPatientAppointmentId,
  });

  try {
    if (mongodb.ObjectId.isValid(consortiumPatientAppointmentId)) {
      console.log(
        "Valid consortiumPatientAppointmentId:",
        consortiumPatientAppointmentId
      );

      var consortiumPatientAppointment =
        await exports.getConsortiumPatientAppointmentBaseObjectById(
          consortiumPatientAppointmentId,
          false,
          req
        );
      console.log(
        "Fetched consortiumPatientAppointment:",
        consortiumPatientAppointment
      );

      return consortiumPatientAppointment;
    } else {
      console.log(
        "Invalid consortiumPatientAppointmentId:",
        consortiumPatientAppointmentId
      );
      return null;
    }
  } catch (e) {
    console.error("Error while checking ConsortiumPatientAppointment:", e);
    throw Error("Error while checking ConsortiumPatientAppointment" + e);
  }
};

exports.canMarkConsortiumPatientAppointmentForConsulted = async function (
  currAppointmentStatusCode
) {
  try {
    let canMarkConsortiumPatientAppointmentForConsulted = false;
    if (
      currAppointmentStatusCode ===
      AppConfigConst.APPOINTMENT_STATUS_CODE_WALK_IN
    ) {
      canMarkConsortiumPatientAppointmentForConsulted = true;
    }
    return canMarkConsortiumPatientAppointmentForConsulted;
  } catch (e) {
    throw Error("And Error occured while updating the PatientAppointment" + e);
  }
};

exports.canMarkConsortiumPatientAppointmentForWalkIn = async function (
  currAppointmentStatusCode
) {
  try {
    let canMarkConsortiumPatientAppointmentForWalkIn = false;
    if (
      currAppointmentStatusCode ===
      AppConfigConst.APPOINTMENT_STATUS_CODE_PENDING
    ) {
      canMarkConsortiumPatientAppointmentForWalkIn = true;
    }
    return canMarkConsortiumPatientAppointmentForWalkIn;
  } catch (e) {
    throw Error("And Error occured while updating the PatientAppointment" + e);
  }
};

exports.getConsortiumPatientAppointmentCountByConsortiumId = async function (
  consortiumId
) {
  var options = {
    consortium: consortiumId,
    isDeleted: 0,
  };

  try {
    var consortiumPatientAppointmentCount;
    if (mongodb.ObjectId.isValid(consortiumId)) {
      var consortiumPatientAppointmentCount =
        await ConsortiumPatientAppointment.find(options).count();
    }
    return consortiumPatientAppointmentCount;
  } catch (e) {
    throw Error("Error while Fetching ConsortiumPatientAppointment" + e);
  }
};

exports.checkIfConsortiumPatientAppointmentUsesConsortium = async function (
  id
) {
  var options = {
    isDeleted: 0,
    consortium: id,
  };

  try {
    var consortiumPatientAppointment =
      await ConsortiumPatientAppointment.findOne(options);
    return consortiumPatientAppointment;
  } catch (e) {
    throw Error("Error while Fetching ConsortiumPatientAppointment " + e);
  }
};

exports.checkIfConsortiumPatientAppointmentUsesConsortiumPatient =
  async function (id) {
    var options = {
      isDeleted: 0,
      consortiumPatient: id,
    };

    try {
      var consortiumPatientAppointment =
        await ConsortiumPatientAppointment.findOne(options);
      return consortiumPatientAppointment;
    } catch (e) {
      throw Error("Error while Fetching ConsortiumPatientAppointment " + e);
    }
  };

exports.getCurrentHighestConsortiumPatientAppointmentId = async function (
  consortiumId
) {
  let selectArr = ["appointmentId"];

  let sortOptions = {
    appointmentId: -1,
  };

  var options = {
    isDeleted: 0,
    consortium: new mongoose.Types.ObjectId(consortiumId),
  };

  try {
    let highestConsortiumPatientAppointmentId = 0;
    var consortiumPatientAppointment =
      await ConsortiumPatientAppointment.findOne(options)
        .sort(sortOptions)
        .select(selectArr);
    if (consortiumPatientAppointment) {
      highestConsortiumPatientAppointmentId =
        consortiumPatientAppointment.appointmentId;
    }
    return highestConsortiumPatientAppointmentId;
  } catch (e) {
    throw Error("Error while Fetching consortiumPatient" + e);
  }
};

exports.fetchCalendarConsortiumPatientAppointments = async function (
  selectDateTs,
  viewType,
  consortiumUserIdArr,
  activeStartDateTs,
  activeEndDateTs,
  consortiumPatientId,
  consortiumLocationId
) {
  console.log("Function called with parameters:", {
    selectDateTs,
    viewType,
    consortiumUserIdArr,
    activeStartDateTs,
    activeEndDateTs,
    consortiumPatientId,
    consortiumLocationId,
  });

  let consStartDate;
  let consEndDate;

  if (
    activeStartDateTs !== undefined &&
    typeof activeStartDateTs === "number" &&
    activeEndDateTs !== undefined &&
    typeof activeEndDateTs === "number"
  ) {
    console.log("Using active start and end dates:", {
      activeStartDateTs,
      activeEndDateTs,
    });
    consStartDate = activeStartDateTs;
    consEndDate = activeEndDateTs;
  } else {
    console.log("Using selected date and view type:", {
      selectDateTs,
      viewType,
    });
    const selectedDt = moment.unix(selectDateTs);

    if (viewType === "month") {
      consStartDate = selectedDt.startOf("month").unix();
      consEndDate = selectedDt.endOf("month").unix();
    } else {
      consStartDate = selectedDt.startOf(viewType).unix();
      consEndDate = selectedDt.endOf(viewType).unix();
    }
  }
  console.log("Computed date range:", { consStartDate, consEndDate });

  var consortiumUserMongoIdArr = [];
  if (consortiumUserIdArr !== undefined && consortiumUserIdArr.length > 0) {
    consortiumUserIdArr.forEach((consortiumUserId) => {
      if (mongodb.ObjectId.isValid(consortiumUserId)) {
        consortiumUserMongoIdArr.push(
          new mongoose.Types.ObjectId(consortiumUserId)
        );
      }
    });
  }
  console.log("Consortium User Mongo ID Array:", consortiumUserMongoIdArr);

  let fetchOptions = {
    $and: [
      { appointmentDate: { $gte: consStartDate, $lte: consEndDate } },
      { isDeleted: 0 },
      { isBulkDictationAppointment: false },
      { consortiumUser: { $in: consortiumUserMongoIdArr } },
    ],
  };
  console.log("Initial fetch options:", fetchOptions);

  // Options setup for the mongoose paginate
  const populateOptions = [
    {
      path: "consortium",
      select: "consortiumName",
    },
    {
      path: "consortiumUser",
      select: "userFullName",
    },
    {
      path: "consortiumPatient",
      select: "patientId firstName middleName lastName fullName",
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

  if (mongodb.ObjectId.isValid(consortiumPatientId)) {
    fetchOptions.consortiumPatient = new mongoose.Types.ObjectId(
      consortiumPatientId
    );
  }

  if (mongodb.ObjectId.isValid(consortiumLocationId)) {
    fetchOptions.consortiumLocation = new mongoose.Types.ObjectId(
      consortiumLocationId
    );
  }
  console.log("Final fetch options:", JSON.stringify(fetchOptions));

  const sortOptions = {
    startTime: 1,
  };

  try {
    var consortiumPatientAppointments = await ConsortiumPatientAppointment.find(
      fetchOptions
    )
      .populate(populateOptions)
      .sort(sortOptions);
    console.log("Fetched appointments:", consortiumPatientAppointments);
    return consortiumPatientAppointments;
  } catch (e) {
    console.error("Error while fetching appointments:", e);
    throw Error("Error while Fetching prospectives " + e);
  }
};

exports.fetchCalendarConsortiumPatientAppointmentForMetrics = async function (
  consFromDate,
  consToDateDate,
  consUserIdArr,
  appointmentStatusId,
  consortiumPatientId,
  consortiumLocationId
) {
  let fetchOptions = {};
  fetchOptions.isDeleted = 0;
  fetchOptions.isBulkDictationAppointment = false;

  let appointmentDateFilters = {};
  let hasAppointmentDateFilters = false;

  if (consFromDate && consFromDate > 0) {
    appointmentDateFilters["$gte"] = consFromDate;
    hasAppointmentDateFilters = true;
  }

  if (consToDateDate && consToDateDate > 0) {
    appointmentDateFilters["$lte"] = consToDateDate;
    hasAppointmentDateFilters = true;
  }

  if (hasAppointmentDateFilters === true) {
    fetchOptions.appointmentDate = appointmentDateFilters;
  }

  if (
    consUserIdArr &&
    consUserIdArr !== undefined &&
    Array.isArray(consUserIdArr)
  ) {
    fetchOptions.consortiumUser = { $in: consUserIdArr };
  }

  if (mongodb.ObjectId.isValid(appointmentStatusId)) {
    fetchOptions.appointmentStatus = new mongoose.Types.ObjectId(
      appointmentStatusId
    );
  }

  if (mongodb.ObjectId.isValid(consortiumPatientId)) {
    fetchOptions.consortiumPatient = new mongoose.Types.ObjectId(
      consortiumPatientId
    );
  }

  if (mongodb.ObjectId.isValid(consortiumLocationId)) {
    fetchOptions.consortiumLocation = new mongoose.Types.ObjectId(
      consortiumLocationId
    );
  }

  // Options setup for the mongoose paginate
  const populateOptions = [
    {
      path: "consortium",
      select: "consortiumName",
    },
    {
      path: "consortiumUser",
      select: "userFullName",
    },
    {
      path: "consortiumPatient",
      select: "patientId firstName middleName lastName fullName",
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

  const sortOptions = {
    startTime: 1,
  };

  try {
    var consortiumPatientAppointments = await ConsortiumPatientAppointment.find(
      fetchOptions
    )
      .populate(populateOptions)
      .sort(sortOptions);
    return consortiumPatientAppointments;
  } catch (e) {
    throw Error("Error while Fetching prospectives " + e);
  }
};

exports.getConsortiumPatientAppointmentSummaryForDate = async function (
  req,
  consFromDate,
  consToDateDate,
  consUserIdArr
) {
  var filConsortium = req.body.filConsortium;
  var filConsortiumLocation = req.body.filConsortiumLocation;
  var isConsortiumUserRequest =
    await AppCommonService.getIsRequestFromConsortiumUser(req);
  var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);

  let fetchOptions = {};
  fetchOptions.isDeleted = 0;
  fetchOptions.isBulkDictationAppointment = false;

  let appointmentDateFilters = {};
  let hasAppointmentDateFilters = false;

  if (consFromDate && consFromDate > 0) {
    appointmentDateFilters["$gte"] = consFromDate;
    hasAppointmentDateFilters = true;
  }

  if (consToDateDate && consToDateDate > 0) {
    appointmentDateFilters["$lte"] = consToDateDate;
    hasAppointmentDateFilters = true;
  }

  if (hasAppointmentDateFilters === true) {
    fetchOptions.appointmentDate = appointmentDateFilters;
  }

  if (
    consUserIdArr &&
    consUserIdArr !== undefined &&
    Array.isArray(consUserIdArr)
  ) {
    fetchOptions.consortiumUser = { $in: consUserIdArr };
  }

  let sessConsortiumId;
  let sessConsortiumLocationId;
  if (isConsortiumUserRequest === true) {
    sessConsortiumId = consortiumUser.consortium;
    sessConsortiumLocationId =
      await AppCommonService.getConsortiumLocationIdFromRequest(req);
  }

  if (mongodb.ObjectId.isValid(filConsortium)) {
    fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
  } else if (mongodb.ObjectId.isValid(sessConsortiumId)) {
    fetchOptions.consortium = new mongoose.Types.ObjectId(sessConsortiumId);
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

  const appStatusIdPendingId =
    await AppointmentStatusService.findAppointmentStatusIdByCode(
      AppConfigConst.APPOINTMENT_STATUS_CODE_PENDING
    );
  const appStatusIdWalkInId =
    await AppointmentStatusService.findAppointmentStatusIdByCode(
      AppConfigConst.APPOINTMENT_STATUS_CODE_WALK_IN
    );
  const appStatusIdConsultedId =
    await AppointmentStatusService.findAppointmentStatusIdByCode(
      AppConfigConst.APPOINTMENT_STATUS_CODE_CONSULTED
    );

  const projectObj = {
    _id: 0,
    forPending: {
      $cond: [{ $eq: ["$appointmentStatus", appStatusIdPendingId] }, 1, 0],
    },
    forWalkIn: {
      $cond: [{ $eq: ["$appointmentStatus", appStatusIdWalkInId] }, 1, 0],
    },
    forConsulted: {
      $cond: [{ $eq: ["$appointmentStatus", appStatusIdConsultedId] }, 1, 0],
    },
  };

  try {
    let recordCntData = await ConsortiumPatientAppointment.aggregate([
      {
        $match: fetchOptions,
      },
      {
        $project: projectObj,
      },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          pendingCount: { $sum: "$forPending" },
          walkInCount: { $sum: "$forWalkIn" },
          consultedCount: { $sum: "$forConsulted" },
        },
      },
    ]);

    let totalAppointments = 0,
      pendingCount = 0,
      walkInCount = 0,
      consultedCount = 0;

    if (recordCntData && recordCntData.length > 0) {
      const recCntObj = recordCntData[0];
      totalAppointments = recCntObj.totalAppointments;
      pendingCount = recCntObj.pendingCount;
      walkInCount = recCntObj.walkInCount;
      consultedCount = recCntObj.consultedCount;
    }

    let response = {
      fromDate: consFromDate,
      toDate: consToDateDate,
      allAppointments: totalAppointments,
      pendingAppointments: pendingCount,
      walkInAppointments: walkInCount,
      consultedAppointments: consultedCount,
      // fetchOptions : fetchOptions
    };

    return response;
  } catch (e) {
    throw Error("Error while Paginating PatientAppointment " + e);
  }
};

exports.setConsortiumPatientAppointmentStatusAsWalkIn = async function (
  consortiumPatientAppointmentId,
  systemUserId,
  consortiumUserId
) {
  try {
    const patientAppointmentStatusIdWalkInId =
      await AppointmentStatusService.findAppointmentStatusIdByCode(
        AppConfigConst.APPOINTMENT_STATUS_CODE_WALK_IN
      );

    if (patientAppointmentStatusIdWalkInId) {
      await AppointmentStatusService.updateAppointmentStatus(
        consortiumPatientAppointmentId,
        patientAppointmentStatusIdWalkInId,
        systemUserId,
        consortiumUserId
      );
    }
  } catch (e) {
    throw Error("And Error occured while updating the PatientAppointment" + e);
  }
};

exports.setConsortiumPatientAppointmentStatusAsConsulted = async function (
  consortiumPatientAppointmentId,
  systemUserId,
  consortiumUserId
) {
  try {
    const patientAppointmentStatusIdConsulted =
      await AppointmentStatusService.findAppointmentStatusIdByCode(
        AppConfigConst.APPOINTMENT_STATUS_CODE_CONSULTED
      );

    if (patientAppointmentStatusIdConsulted) {
      await AppointmentStatusService.updateAppointmentStatus(
        consortiumPatientAppointmentId,
        patientAppointmentStatusIdConsulted,
        systemUserId,
        consortiumUserId
      );
    }
  } catch (e) {
    throw Error("And Error occured while updating the PatientAppointment" + e);
  }
};

exports.recalculateConsortiumPatientAppointmentDicationAttachmentData =
  async function (consortiumPatientAppointmentId) {
    try {
      console.log(
        "Starting recalculation for ConsortiumPatientAppointment ID:",
        consortiumPatientAppointmentId
      );

      var modConsortiumPatientAppointment =
        await exports.getConsortiumPatientAppointmentBaseObjectById(
          consortiumPatientAppointmentId,
          false
        );
      console.log(
        "Fetched ConsortiumPatientAppointment:",
        modConsortiumPatientAppointment
      );

      if (modConsortiumPatientAppointment) {
        let dictationRecordingAttachmentMetric =
          await ConsortiumPatientAppointmentDictationAttachmentService.getConsortiumPatientAppointmentDictationAttachmentTotalDicationDuration(
            consortiumPatientAppointmentId
          );
        console.log(
          "Dictation Recording Attachment Metric:",
          dictationRecordingAttachmentMetric
        );

        let totalDictationUploadCount =
          dictationRecordingAttachmentMetric.totalDictationUploadCount;
        let totalDicationDurationInSeconds =
          dictationRecordingAttachmentMetric.totalDicationDurationInSeconds;
        let totalDicationAttachmentFileSizeBytes =
          dictationRecordingAttachmentMetric.totalDicationAttachmentFileSizeBytes;
        console.log("Total Dictation Upload Count:", totalDictationUploadCount);
        console.log(
          "Total Dictation Duration In Seconds:",
          totalDicationDurationInSeconds
        );
        console.log(
          "Total Dictation Attachment File Size Bytes:",
          totalDicationAttachmentFileSizeBytes
        );

        modConsortiumPatientAppointment.totalDictationUploadCount =
          totalDictationUploadCount;
        modConsortiumPatientAppointment.totalDicationDurationInSeconds =
          totalDicationDurationInSeconds;
        modConsortiumPatientAppointment.totalDicationAttachmentFileSizeBytes =
          totalDicationAttachmentFileSizeBytes;

        var savedConsortiumPatientAppointment =
          await modConsortiumPatientAppointment.save();
        console.log(
          "Saved ConsortiumPatientAppointment:",
          savedConsortiumPatientAppointment
        );

        return savedConsortiumPatientAppointment;
      } else {
        console.log(
          "ConsortiumPatientAppointment not found for ID:",
          consortiumPatientAppointmentId
        );
      }
    } catch (e) {
      console.error(
        "An error occurred while updating the ConsortiumPatientAppointment:",
        e
      );
      throw Error(
        "An error occurred while updating the ConsortiumPatientAppointment " + e
      );
    }
  };

exports.recalculateConsortiumPatientAppointment = async function () {
  try {
    var consortiumPatientAppointments =
      await ConsortiumPatientAppointment.find();
    let comConsortiumPatientAppointments = [];
    await Promise.all(
      consortiumPatientAppointments.map(
        async (
          consortiumPatientAppointment,
          consortiumPatientAppointmentIndex
        ) => {
          let savedConsortiumPatientAppointment =
            await exports.recalculateConsortiumPatientAppointmentDicationAttachmentData(
              consortiumPatientAppointment._id
            );
          comConsortiumPatientAppointments[consortiumPatientAppointmentIndex] =
            savedConsortiumPatientAppointment;
        }
      )
    );

    return comConsortiumPatientAppointments;
  } catch (e) {
    throw Error("Error while Fetching ConsortiumPatientAppointment" + e);
  }
};

exports.getDicationDurationFromConsortiumPatientAppointmentIdArr =
  async function (consortiumPatientAppointmentIdArr) {
    const projectObj = {
      _id: 0,
      totalDicationDurationInSeconds: "$totalDicationDurationInSeconds",
    };

    let mongoConsortiumPatientAppointmentIdArr = [];
    if (
      consortiumPatientAppointmentIdArr !== undefined &&
      consortiumPatientAppointmentIdArr.length > 0
    ) {
      consortiumPatientAppointmentIdArr.forEach(function (
        consortiumPatientAppointmentId
      ) {
        mongoConsortiumPatientAppointmentIdArr.push(
          new mongoose.Types.ObjectId(consortiumPatientAppointmentId)
        );
      });
    }

    var fetchOptions = {};

    if (
      mongoConsortiumPatientAppointmentIdArr !== undefined &&
      mongoConsortiumPatientAppointmentIdArr.length > 0
    ) {
      fetchOptions._id = { $in: mongoConsortiumPatientAppointmentIdArr };
    }

    try {
      let recordCntData = await ConsortiumPatientAppointment.aggregate([
        {
          $match: fetchOptions,
        },
        {
          $project: projectObj,
        },
        {
          $group: {
            _id: null,
            totalDicationDurationInSeconds: {
              $sum: "$totalDicationDurationInSeconds",
            },
          },
        },
      ]);

      let totalDicationDurationInSeconds = 0;
      if (recordCntData && recordCntData.length > 0) {
        const recCntObj = recordCntData[0];
        totalDicationDurationInSeconds = Math.ceil(
          recCntObj.totalDicationDurationInSeconds / 60
        );
      }

      return totalDicationDurationInSeconds;
    } catch (e) {
      throw Error(
        "Error while Fetching getConsortiumPatientAppointmentDicationDuration " +
          e
      );
    }
  };

exports.getConsortiumPatientAppointmentTotalDicationDuration = async function (
  req
) {
  var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

  let transcriptionStatusIdForTranscriptionAssigned =
    await TranscriptionStatusService.findTranscriptionStatusIdByCode(
      AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED
    );

  const projectObj = {
    _id: 0,
    totalDicationDurationInSeconds: "$totalDicationDurationInSeconds",
  };

  var fetchOptions = {
    transcriptionStatus: new mongoose.Types.ObjectId(
      transcriptionStatusIdForTranscriptionAssigned
    ),
    mtAssignedTo: new mongoose.Types.ObjectId(systemUserId),
  };

  try {
    let totalDicationDurationInSeconds = 0;
    let totalAppointmentCount = 0;
    if (mongodb.ObjectId.isValid(systemUserId)) {
      let recordCntData = await ConsortiumPatientAppointment.aggregate([
        {
          $match: fetchOptions,
        },
        {
          $project: projectObj,
        },
        {
          $group: {
            _id: null,
            totalAppointmentCount: { $sum: 1 },
            totalDicationDurationInSeconds: {
              $sum: "$totalDicationDurationInSeconds",
            },
          },
        },
      ]);

      if (recordCntData && recordCntData.length > 0) {
        const recCntObj = recordCntData[0];
        totalDicationDurationInSeconds = Math.ceil(
          recCntObj.totalDicationDurationInSeconds / 60
        );
        totalAppointmentCount = recCntObj.totalAppointmentCount;
      }
    }

    return totalDicationDurationInSeconds;
  } catch (e) {
    throw Error(
      "Error while Fetching getConsortiumPatientAppointmentDicationDuration " +
        e
    );
  }
};

exports.findConsortiumPatientAppointmentByIdArr = async function (
  consortiumPatientAppointmentIdArr
) {
  var options = {
    isDeleted: 0,
  };

  var includMongoIdArr = [];
  if (
    consortiumPatientAppointmentIdArr !== undefined &&
    consortiumPatientAppointmentIdArr.length > 0
  ) {
    consortiumPatientAppointmentIdArr.forEach((incId) => {
      if (mongodb.ObjectId.isValid(incId)) {
        includMongoIdArr.push(new mongoose.Types.ObjectId(incId));
      }
    });
  }

  if (includMongoIdArr && includMongoIdArr.length > 0) {
    options._id = { $in: includMongoIdArr };
  }

  try {
    var consortiumPatientAppointments = await ConsortiumPatientAppointment.find(
      options
    );
    return consortiumPatientAppointments;
  } catch (e) {
    throw Error("Error while Fetching ConsortiumPatientAppointment" + e);
  }
};

exports.getConsortiumPatientAppointmentForSystemUserAssignedWorkPoolTranscriptionCompletedList =
  async function (req) {
    let filStartDate = req.body.filStartDate;
    let filEndDate = req.body.filEndDate;
    var filConsortium = req.body.filConsortium;
    var filConsortiumUser = req.body.filConsortiumUser;
    var filConsortiumLocation = req.body.filConsortiumLocation;
    let filTranscriptionStatus = req.body.filTranscriptionStatus;
    let filMTAssignedTo = req.body.filMTAssignedTo;
    let filQA1AssignedTo = req.body.filQA1AssignedTo;
    let filQA2AssignedTo = req.body.filQA2AssignedTo;
    let filQA3AssignedTo = req.body.filQA3AssignedTo;
    let filActivityPriority = req.body.filActivityPriority;
    let filStartTranscriptionAllocationDate =
      req.body.filStartTranscriptionAllocationDate;
    let filEndTranscriptionAllocationDate =
      req.body.filEndTranscriptionAllocationDate;

    var filConsortiumPatient = req.body.filConsortiumPatient;
    let filAppointmentStatus = req.body.filAppointmentStatus;

    var sortByCol = req.body.sortBy ? req.body.sortBy : "col2";
    var sortOrder = req.body.sortOrder ? req.body.sortOrder : "desc";

    var systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);

    let transcriptionStatusIdForTranscriptionCompleted =
      await TranscriptionStatusService.findTranscriptionStatusIdByCode(
        AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_COMPLETED
      );
    let transcriptionStatusIdForTranscriptionAssigned =
      await TranscriptionStatusService.findTranscriptionStatusIdByCode(
        AppConfigConst.TRANSCRIPTION_STATUS_CODE_TRANSCRIPTION_ASSIGNED
      );
    let transcriptionStatusIdForQA1Assigned =
      await TranscriptionStatusService.findTranscriptionStatusIdByCode(
        AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA1_ASSIGNED
      );
    let transcriptionStatusIdForQA2Assigned =
      await TranscriptionStatusService.findTranscriptionStatusIdByCode(
        AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA2_ASSIGNED
      );
    let transcriptionStatusIdForQA3Assigned =
      await TranscriptionStatusService.findTranscriptionStatusIdByCode(
        AppConfigConst.TRANSCRIPTION_STATUS_CODE_QA3_ASSIGNED
      );

    let transcriptionStatusIdArr = [
      new mongoose.Types.ObjectId(
        transcriptionStatusIdForTranscriptionCompleted
      ),
    ];

    // Options setup for the mongoose paginate
    const populateOptions = [
      {
        path: "consortium",
        select: "consortiumName consortiumShortCode",
      },
      {
        path: "consortiumUser",
        select: "userFullName",
      },
      {
        path: "consortiumPatient",
        select: "patientId firstName middleName lastName fullName",
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
        path: "activityPriority",
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
      isActive: "$isActive",
      activityPriority: "$activityPriority",
      transcriptionAllocationDate: "$transcriptionAllocationDate",
      activityPriorityLP: "$activityPriorityLP",
      mtAssignedToLP: "$mtAssignedToLP",
      qa1AssignedToLP: "$qa1AssignedToLP",
      qa2AssignedToLP: "$qa2AssignedToLP",
      qa3AssignedToLP: "$qa3AssignedToLP",
      transcriptionStatusLP: "$transcriptionStatusLP",
      isUserMT: {
        $cond: {
          if: {
            $eq: ["$mtAssignedTo", new mongoose.Types.ObjectId(systemUserId)],
          },
          then: true,
          else: false,
        },
      },
      isUserQA1: {
        $cond: {
          if: {
            $eq: ["$qa1AssignedTo", new mongoose.Types.ObjectId(systemUserId)],
          },
          then: true,
          else: false,
        },
      },
      isUserQA2: {
        $cond: {
          if: {
            $eq: ["$qa2AssignedTo", new mongoose.Types.ObjectId(systemUserId)],
          },
          then: true,
          else: false,
        },
      },
      isUserQA3: {
        $cond: {
          if: {
            $eq: ["$qa3AssignedTo", new mongoose.Types.ObjectId(systemUserId)],
          },
          then: true,
          else: false,
        },
      },
      canUserPerformActivity: {
        $cond: {
          if: {
            $or: [
              {
                $and: [
                  {
                    $eq: [
                      "$mtAssignedTo",
                      new mongoose.Types.ObjectId(systemUserId),
                    ],
                  },
                  {
                    $eq: [
                      "$transcriptionStatus",
                      transcriptionStatusIdForTranscriptionAssigned,
                    ],
                  },
                ],
              },
              {
                $and: [
                  {
                    $eq: [
                      "$qa1AssignedTo",
                      new mongoose.Types.ObjectId(systemUserId),
                    ],
                  },
                  {
                    $eq: [
                      "$transcriptionStatus",
                      transcriptionStatusIdForQA1Assigned,
                    ],
                  },
                ],
              },
              {
                $and: [
                  {
                    $eq: [
                      "$qa2AssignedTo",
                      new mongoose.Types.ObjectId(systemUserId),
                    ],
                  },
                  {
                    $eq: [
                      "$transcriptionStatus",
                      transcriptionStatusIdForQA2Assigned,
                    ],
                  },
                ],
              },
              {
                $and: [
                  {
                    $eq: [
                      "$qa3AssignedTo",
                      new mongoose.Types.ObjectId(systemUserId),
                    ],
                  },
                  {
                    $eq: [
                      "$transcriptionStatus",
                      transcriptionStatusIdForQA3Assigned,
                    ],
                  },
                ],
              },
            ],
          },
          then: true,
          else: false,
        },
      },
    };

    let hasMTAssignedLookup = false;
    let hasQA1AssignedToLookup = false;
    let hasQA2AssignedToLookup = false;
    let hasQA3AssignedToLookup = false;
    let hasActivityPriorityLookup = false;
    let hasTranscriptionStatusLookup = false;

    let applicableOptions = [];
    let fetchOptions = {};

    fetchOptions.isDeleted = 0;
    fetchOptions.isDictationUploadCompleted = true;
    fetchOptions.isSubmitted = false;
    fetchOptions.isCompleted = false;
    fetchOptions.transcriptionStatus = { $in: transcriptionStatusIdArr };

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

    if (mongodb.ObjectId.isValid(systemUserId)) {
      let orFetchOptions = [];

      orFetchOptions.push({
        mtAssignedTo: new mongoose.Types.ObjectId(systemUserId),
      });
      orFetchOptions.push({
        qa1AssignedTo: new mongoose.Types.ObjectId(systemUserId),
      });
      orFetchOptions.push({
        qa1AssignedTo: new mongoose.Types.ObjectId(systemUserId),
      });
      orFetchOptions.push({
        qa3AssignedTo: new mongoose.Types.ObjectId(systemUserId),
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

    let dateFilters = {};
    let hasDateFilters = false;
    if (filStartDate && filStartDate > 0) {
      dateFilters["$gte"] = filStartDate;
      hasDateFilters = true;
    }

    if (filEndDate && filEndDate > 0) {
      let endDtObj = moment.unix(filEndDate);
      let endTs = endDtObj.unix();

      dateFilters["$lte"] = endTs;
      hasDateFilters = true;
    }

    if (hasDateFilters === true) {
      fetchOptions.appointmentDate = dateFilters;
    }

    if (mongodb.ObjectId.isValid(filConsortium)) {
      fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
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
    }

    if (mongodb.ObjectId.isValid(filMTAssignedTo)) {
      fetchOptions.mtAssignedTo = new mongoose.Types.ObjectId(filMTAssignedTo);
    }

    if (mongodb.ObjectId.isValid(filQA1AssignedTo)) {
      fetchOptions.qa1AssignedTo = new mongoose.Types.ObjectId(
        filQA1AssignedTo
      );
    }

    if (mongodb.ObjectId.isValid(filQA2AssignedTo)) {
      fetchOptions.qa2AssignedTo = new mongoose.Types.ObjectId(
        filQA2AssignedTo
      );
    }

    if (mongodb.ObjectId.isValid(filQA3AssignedTo)) {
      fetchOptions.qa3AssignedTo = new mongoose.Types.ObjectId(
        filQA3AssignedTo
      );
    }

    if (mongodb.ObjectId.isValid(filActivityPriority)) {
      fetchOptions.activityPriority = new mongoose.Types.ObjectId(
        filActivityPriority
      );
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
      } else if (sortByCol == "col2") {
        sortOptions = {
          appointmentDate: sortOrderInt,
        };
      } else if (sortByCol == "col3") {
        sortOptions = {
          totalDicationDurationInSeconds: sortOrderInt,
        };
      } else if (sortByCol == "col4") {
        sortOptions = {
          totalDicationAttachmentFileSizeBytes: sortOrderInt,
        };
      } else if (sortByCol == "col5") {
        hasMTAssignedLookup = true;
        sortOptions = {
          "mtAssignedToLP.userFullName": sortOrderInt,
        };
      } else if (sortByCol == "col6") {
        hasQA1AssignedToLookup = true;
        sortOptions = {
          "qa1AssignedToLP.userFullName": sortOrderInt,
        };
      } else if (sortByCol == "col7") {
        hasQA2AssignedToLookup = true;
        sortOptions = {
          "qa2AssignedToLP.userFullName": sortOrderInt,
        };
      } else if (sortByCol == "col8") {
        hasQA3AssignedToLookup = true;
        sortOptions = {
          "qa3AssignedToLP.userFullName": sortOrderInt,
        };
      } else if (sortByCol == "col9") {
        hasActivityPriorityLookup = true;
        sortOptions = {
          "activityPriorityLP.priorityText": sortOrderInt,
        };
      } else if (sortByCol == "col10") {
        hasTranscriptionStatusLookup = true;
        sortOptions = {
          "transcriptionStatusLP.statusText": sortOrderInt,
        };
      }
    } else {
      hasActivityPriorityLookup = true;
      sortOptions = {
        appointmentDate: 1,
        "activityPriorityLP.priority": -1,
      };
    }

    const activityPriorityLookup = {
      from: ActivityPriority.collection.name,
      localField: "activityPriority",
      foreignField: "_id",
      as: "activityPriorityLP",
    };

    const mtAssignedToLookup = {
      from: SystemUser.collection.name,
      localField: "mtAssignedTo",
      foreignField: "_id",
      as: "mtAssignedToLP",
    };

    const qa1AssignedToLookup = {
      from: SystemUser.collection.name,
      localField: "qa1AssignedTo",
      foreignField: "_id",
      as: "qa1AssignedToLP",
    };

    const qa2AssignedToLookup = {
      from: SystemUser.collection.name,
      localField: "qa2AssignedTo",
      foreignField: "_id",
      as: "qa2AssignedToLP",
    };

    const qa3AssignedToLookup = {
      from: SystemUser.collection.name,
      localField: "qa3AssignedTo",
      foreignField: "_id",
      as: "qa3AssignedToLP",
    };

    const transcriptionStatusLookup = {
      from: TranscriptionStatus.collection.name,
      localField: "transcriptionStatus",
      foreignField: "_id",
      as: "transcriptionStatusLP",
    };

    try {
      let aggregationParamArr = [];

      if (hasMTAssignedLookup) {
        aggregationParamArr.push({
          $lookup: mtAssignedToLookup,
        });
      }

      if (hasQA1AssignedToLookup) {
        aggregationParamArr.push({
          $lookup: qa1AssignedToLookup,
        });
      }

      if (hasQA2AssignedToLookup) {
        aggregationParamArr.push({
          $lookup: qa2AssignedToLookup,
        });
      }

      if (hasQA3AssignedToLookup) {
        aggregationParamArr.push({
          $lookup: qa3AssignedToLookup,
        });
      }

      if (hasActivityPriorityLookup) {
        aggregationParamArr.push({
          $lookup: activityPriorityLookup,
        });
      }

      if (hasTranscriptionStatusLookup) {
        aggregationParamArr.push({
          $lookup: transcriptionStatusLookup,
        });
      }

      aggregationParamArr.push({
        $match: fetchOptions,
      });

      let consortiumPatientAppointments =
        await ConsortiumPatientAppointment.aggregate(aggregationParamArr)
          .project(projectObj)
          .sort(sortOptions);

      consortiumPatientAppointments =
        await ConsortiumPatientAppointment.populate(
          consortiumPatientAppointments,
          populateOptions
        );

      return consortiumPatientAppointments;
    } catch (e) {
      throw Error("Error while Paginating ConsortiumPatientAppointment " + e);
    }
  };
