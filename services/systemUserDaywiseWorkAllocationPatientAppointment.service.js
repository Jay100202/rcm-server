var SystemUserDaywiseWorkAllocationPatientAppointment = require("../models/systemUserDaywiseWorkAllocationPatientAppointment.model");
var SystemUserDaywiseWorkAllocation = require("../models/systemUserDaywiseWorkAllocation.model");
var ConsortiumPatientAppointment = require("../models/consortiumPatientAppointment.model");
var TranscriptorRole = require("../models/transcriptorRole.model");
var TranscriptionStatusService = require("./transcriptionStatus.service");
var ActivityFileStatusService = require("./activityFileStatus.service");
var ConsortiumPatient = require("../models/consortiumPatient.model");
var ConsortiumUser = require("../models/consortiumUser.model");
var SystemUser = require("../models/systemUser.model");
var Consortium = require("../models/consortium.model");
var AppointmentStatus = require("../models/appointmentStatus.model");
var ActivityPriority = require("../models/activityPriority.model");
var TranscriptionStatus = require("../models/transcriptionStatus.model");
var AppConfig = require("../appconfig");
var AppCommonService = require("./appcommon.service");
var AppConfigConst = require("../appconfig-const");
var mongodb = require("mongodb");
var mongoose = require("mongoose");
var moment = require("moment");
var momentTZ = require("moment-timezone");

// Saving the context of this module inside the _the variable
_this = this;

exports.saveSystemUserDaywiseWorkAllocationPatientAppointment = async function (
  systemUserDaywiseWorkAllocationPatientAppointment
) {
  const currTs = await AppCommonService.getCurrentTimestamp();

  let modSystemUserDaywiseWorkAllocationPatientAppointment = null;
  if (
    mongodb.ObjectId.isValid(
      systemUserDaywiseWorkAllocationPatientAppointment.id
    )
  ) {
    try {
      modSystemUserDaywiseWorkAllocationPatientAppointment =
        await SystemUserDaywiseWorkAllocationPatientAppointment.findById(
          systemUserDaywiseWorkAllocationPatientAppointment.id
        );
    } catch (e) {
      throw Error(
        "Error occured while Finding the SystemUserDaywiseWorkAllocationPatientAppointment"
      );
    }
  }

  if (!modSystemUserDaywiseWorkAllocationPatientAppointment) {
    modSystemUserDaywiseWorkAllocationPatientAppointment =
      new SystemUserDaywiseWorkAllocationPatientAppointment();
    modSystemUserDaywiseWorkAllocationPatientAppointment.createdAt = currTs;
  }

  if (
    systemUserDaywiseWorkAllocationPatientAppointment.systemUserDaywiseWorkAllocation !==
    undefined
  )
    modSystemUserDaywiseWorkAllocationPatientAppointment.systemUserDaywiseWorkAllocation =
      systemUserDaywiseWorkAllocationPatientAppointment.systemUserDaywiseWorkAllocation;

  if (
    systemUserDaywiseWorkAllocationPatientAppointment.consortiumPatientAppointment !==
    undefined
  )
    modSystemUserDaywiseWorkAllocationPatientAppointment.consortiumPatientAppointment =
      systemUserDaywiseWorkAllocationPatientAppointment.consortiumPatientAppointment;

  if (
    systemUserDaywiseWorkAllocationPatientAppointment.transcriptorRole !==
    undefined
  )
    modSystemUserDaywiseWorkAllocationPatientAppointment.transcriptorRole =
      systemUserDaywiseWorkAllocationPatientAppointment.transcriptorRole;

  if (
    systemUserDaywiseWorkAllocationPatientAppointment.activityReceivedAt !==
    undefined
  )
    modSystemUserDaywiseWorkAllocationPatientAppointment.activityReceivedAt =
      systemUserDaywiseWorkAllocationPatientAppointment.activityReceivedAt;

  if (
    systemUserDaywiseWorkAllocationPatientAppointment.activityReceivedFrom !==
    undefined
  )
    modSystemUserDaywiseWorkAllocationPatientAppointment.activityReceivedFrom =
      systemUserDaywiseWorkAllocationPatientAppointment.activityReceivedFrom;

  if (
    systemUserDaywiseWorkAllocationPatientAppointment.activityStartedAt !==
    undefined
  )
    modSystemUserDaywiseWorkAllocationPatientAppointment.activityStartedAt =
      systemUserDaywiseWorkAllocationPatientAppointment.activityStartedAt;

  if (
    systemUserDaywiseWorkAllocationPatientAppointment.activityEndedAt !==
    undefined
  )
    modSystemUserDaywiseWorkAllocationPatientAppointment.activityEndedAt =
      systemUserDaywiseWorkAllocationPatientAppointment.activityEndedAt;

  if (
    systemUserDaywiseWorkAllocationPatientAppointment.activityDurationInSeconds !==
    undefined
  )
    modSystemUserDaywiseWorkAllocationPatientAppointment.activityDurationInSeconds =
      systemUserDaywiseWorkAllocationPatientAppointment.activityDurationInSeconds;

  if (
    systemUserDaywiseWorkAllocationPatientAppointment.activityAction !==
    undefined
  )
    modSystemUserDaywiseWorkAllocationPatientAppointment.activityAction =
      systemUserDaywiseWorkAllocationPatientAppointment.activityAction;

  if (
    systemUserDaywiseWorkAllocationPatientAppointment.activityPriority !==
    undefined
  )
    modSystemUserDaywiseWorkAllocationPatientAppointment.activityPriority =
      systemUserDaywiseWorkAllocationPatientAppointment.activityPriority;

  if (
    systemUserDaywiseWorkAllocationPatientAppointment.activityStatus !==
    undefined
  )
    modSystemUserDaywiseWorkAllocationPatientAppointment.activityStatus =
      systemUserDaywiseWorkAllocationPatientAppointment.activityStatus;

  if (
    systemUserDaywiseWorkAllocationPatientAppointment.activityFileStatus !==
    undefined
  )
    modSystemUserDaywiseWorkAllocationPatientAppointment.activityFileStatus =
      systemUserDaywiseWorkAllocationPatientAppointment.activityFileStatus;

  if (systemUserDaywiseWorkAllocationPatientAppointment.updatedAt !== undefined)
    modSystemUserDaywiseWorkAllocationPatientAppointment.updatedAt =
      systemUserDaywiseWorkAllocationPatientAppointment.updatedAt;

  try {
    var savedSystemUserDaywiseWorkAllocationPatientAppointment =
      await modSystemUserDaywiseWorkAllocationPatientAppointment.save();

    var respSystemUserDaywiseWorkAllocationPatientAppointment;
    if (savedSystemUserDaywiseWorkAllocationPatientAppointment) {
      respSystemUserDaywiseWorkAllocationPatientAppointment = JSON.parse(
        JSON.stringify(savedSystemUserDaywiseWorkAllocationPatientAppointment)
      );
    }
    return respSystemUserDaywiseWorkAllocationPatientAppointment;
  } catch (e) {
    throw Error(
      "And Error occured while updating the SystemUserDaywiseWorkAllocationPatientAppointment " +
        e
    );
  }
};

exports.findSystemUserDaywiseWorkAllocationPatientAppointmentListBySystemUserDaywiseWorkAllocation =
  async function (systemUserDaywiseWorkAllocationId) {
    // Options setup for the mongoose paginate
    const populateOptions = [
      {
        path: "systemUserDaywiseWorkAllocation",
      },
      {
        path: "consortiumPatientAppointment",
      },
      {
        path: "transcriptorRole",
      },
      {
        path: "activityReceivedFrom",
      },
      {
        path: "activityPriority",
      },
      {
        path: "activityAction",
      },
      {
        path: "activityStatus",
      },
      {
        path: "activityFileStatus",
      },
    ];

    var options = {
      systemUserDaywiseWorkAllocation: new mongoose.Types.ObjectId(
        systemUserDaywiseWorkAllocationId
      ),
    };
    try {
      var systemUserDaywiseWorkAllocationPatientAppointmentList;
      if (mongodb.ObjectId.isValid(systemUserDaywiseWorkAllocationId)) {
        systemUserDaywiseWorkAllocationPatientAppointmentList =
          await SystemUserDaywiseWorkAllocationPatientAppointment.find(
            options
          ).populate(populateOptions);
      }
      return systemUserDaywiseWorkAllocationPatientAppointmentList;
    } catch (e) {
      throw Error(
        "Error while Fetching SystemUserDaywiseWorkAllocationPatientAppointment" +
          e
      );
    }
  };

exports.findSystemUserDaywiseWorkAllocationPatientAppointmentById =
  async function (systemUserDaywiseWorkAllocationPatientAppointmentId) {
    // Options setup for the mongoose paginate
    const populateOptions = [
      {
        path: "systemUserDaywiseWorkAllocation",
      },
      {
        path: "consortiumPatientAppointment",
      },
      {
        path: "transcriptorRole",
      },
      {
        path: "activityReceivedFrom",
      },
      {
        path: "activityPriority",
      },
      {
        path: "activityAction",
      },
      {
        path: "activityStatus",
      },
      {
        path: "activityFileStatus",
      },
    ];

    var options = {
      _id: new mongoose.Types.ObjectId(
        systemUserDaywiseWorkAllocationPatientAppointmentId
      ),
    };
    try {
      var systemUserDaywiseWorkAllocationPatientAppointment;
      if (
        mongodb.ObjectId.isValid(
          systemUserDaywiseWorkAllocationPatientAppointmentId
        )
      ) {
        systemUserDaywiseWorkAllocationPatientAppointment =
          await SystemUserDaywiseWorkAllocationPatientAppointment.findOne(
            options
          ).populate(populateOptions);
      }
      return systemUserDaywiseWorkAllocationPatientAppointment;
    } catch (e) {
      throw Error(
        "Error while Fetching SystemUserDaywiseWorkAllocationPatientAppointment" +
          e
      );
    }
  };

exports.findSystemUserDaywiseWorkAllocationPatientAppointmentBySystemUserDaywiseWorkAllocationIdAndConsortiumPatientAppointmentId =
  async function (
    systemUserDaywiseWorkAllocationId,
    consortiumPatientAppointmentId
  ) {
    // Options setup for the mongoose paginate
    const populateOptions = [
      {
        path: "systemUserDaywiseWorkAllocation",
      },
      {
        path: "consortiumPatientAppointment",
      },
      {
        path: "transcriptorRole",
      },
      {
        path: "activityReceivedFrom",
      },
      {
        path: "activityPriority",
      },
      {
        path: "activityAction",
      },
      {
        path: "activityStatus",
      },
      {
        path: "activityFileStatus",
      },
    ];

    var options = {
      systemUserDaywiseWorkAllocation: new mongoose.Types.ObjectId(
        systemUserDaywiseWorkAllocationId
      ),
      consortiumPatientAppointment: new mongoose.Types.ObjectId(
        consortiumPatientAppointmentId
      ),
    };
    try {
      var systemUserDaywiseWorkAllocationPatientAppointment;
      if (
        mongodb.ObjectId.isValid(systemUserDaywiseWorkAllocationId) &&
        mongodb.ObjectId.isValid(consortiumPatientAppointmentId)
      ) {
        systemUserDaywiseWorkAllocationPatientAppointment =
          await SystemUserDaywiseWorkAllocationPatientAppointment.findOne(
            options
          ).populate(populateOptions);
      }
      return systemUserDaywiseWorkAllocationPatientAppointment;
    } catch (e) {
      throw Error(
        "Error while Fetching SystemUserDaywiseWorkAllocationPatientAppointment" +
          e
      );
    }
  };

exports.getSystemUserDaywiseWorkAllocationPatientAppointmentAssignedActivityMetric =
  async function (systemUserDaywiseWorkAllocationId, activityStatusId) {
    const projectObj = {
      _id: 0,
      activityDurationInSeconds: "$activityDurationInSeconds",
    };

    var fetchOptions = {
      systemUserDaywiseWorkAllocation: new mongoose.Types.ObjectId(
        systemUserDaywiseWorkAllocationId
      ),
      activityStatus: new mongoose.Types.ObjectId(activityStatusId),
    };

    try {
      var totalActivityCountCount = 0,
        totalActivityDurationInSeconds = 0;
      if (
        mongodb.ObjectId.isValid(systemUserDaywiseWorkAllocationId) &&
        mongodb.ObjectId.isValid(activityStatusId)
      ) {
        let recordCntData =
          await SystemUserDaywiseWorkAllocationPatientAppointment.aggregate([
            {
              $match: fetchOptions,
            },
            {
              $project: projectObj,
            },
            {
              $group: {
                _id: null,
                totalActivityCountCount: { $sum: 1 },
                totalActivityDurationInSeconds: {
                  $sum: "$activityDurationInSeconds",
                },
              },
            },
          ]);

        if (recordCntData && recordCntData.length > 0) {
          const recCntObj = recordCntData[0];
          totalActivityCountCount = recCntObj.totalActivityCountCount;
          totalActivityDurationInSeconds =
            recCntObj.totalActivityDurationInSeconds;
        }
      }

      let response = {
        totalActivityCountCount: totalActivityCountCount,
        totalActivityDurationInSeconds: totalActivityDurationInSeconds,
      };

      return response;
    } catch (e) {
      throw Error(
        "Error while Fetching SystemUserDaywiseWorkAllocationPatientAppointment" +
          e
      );
    }
  };

exports.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode =
  async function (roleCode, consortiumPatientAppointmentId, systemUserId) {
    console.log("Function called with parameters:", {
      roleCode,
      consortiumPatientAppointmentId,
      systemUserId,
    });

    const projectObj = {
      _id: "$_id",
      systemUserDaywiseWorkAllocation: "$systemUserDaywiseWorkAllocation",
      consortiumPatientAppointment: "$consortiumPatientAppointment",
      transcriptorRole: "$transcriptorRole",
      activityReceivedAt: "$activityReceivedAt",
      activityReceivedFrom: "$activityReceivedFrom",
      activityStartedAt: "$activityStartedAt",
      activityEndedAt: "$activityEndedAt",
      activityDurationInSeconds: "$activityDurationInSeconds",
      activityPriority: "$activityPriority",
      activityAction: "$activityAction",
      activityStatus: "$activityStatus",
      activityFileStatus: "$activityFileStatus",
    };

    const populateOptions = [
      { path: "systemUserDaywiseWorkAllocation" },
      { path: "transcriptorRole" },
      { path: "activityReceivedFrom" },
      { path: "activityPriority" },
      { path: "activityAction" },
      { path: "activityStatus" },
      { path: "activityFileStatus" },
    ];

    var options = {
      ["systemUserDaywiseWorkAllocationLP.systemUser"]:
        new mongoose.Types.ObjectId(systemUserId),
      ["transcriptorRoleLP.roleCode"]: roleCode,
    };

    if (mongodb.ObjectId.isValid(consortiumPatientAppointmentId)) {
      options.consortiumPatientAppointment = new mongoose.Types.ObjectId(
        consortiumPatientAppointmentId
      );
    }

    console.log("Options for $match:", options);

    let sortOptions = {
      createdAt: 1,
    };

    const systemUserDaywiseWorkAllocationLookup = {
      from: SystemUserDaywiseWorkAllocation.collection.name,
      localField: "systemUserDaywiseWorkAllocation",
      foreignField: "_id",
      as: "systemUserDaywiseWorkAllocationLP",
    };

    const transcriptorRoleLookup = {
      from: TranscriptorRole.collection.name,
      localField: "transcriptorRole",
      foreignField: "_id",
      as: "transcriptorRoleLP",
    };

    try {
      let aggregationParamArr = [];

      aggregationParamArr.push({
        $lookup: systemUserDaywiseWorkAllocationLookup,
      });
      aggregationParamArr.push({ $lookup: transcriptorRoleLookup });
      aggregationParamArr.push({ $match: options });

      console.log(
        "Aggregation parameters:",
        JSON.stringify(aggregationParamArr)
      );

      var systemUserDaywiseWorkAllocationPatientAppointments = [];
      if (
        mongodb.ObjectId.isValid(consortiumPatientAppointmentId) &&
        mongodb.ObjectId.isValid(systemUserId)
      ) {
        systemUserDaywiseWorkAllocationPatientAppointments =
          await SystemUserDaywiseWorkAllocationPatientAppointment.aggregate(
            aggregationParamArr
          )
            .project(projectObj)
            .sort(sortOptions);

        console.log(
          "Aggregation result before populate:",
          JSON.stringify(systemUserDaywiseWorkAllocationPatientAppointments)
        );

        systemUserDaywiseWorkAllocationPatientAppointments =
          await SystemUserDaywiseWorkAllocationPatientAppointment.populate(
            systemUserDaywiseWorkAllocationPatientAppointments,
            populateOptions
          );

        console.log(
          "Aggregation result after populate:",
          systemUserDaywiseWorkAllocationPatientAppointments
        );
      }

      var systemUserDaywiseWorkAllocationPatientAppointment;
      if (systemUserDaywiseWorkAllocationPatientAppointments.length > 0) {
        systemUserDaywiseWorkAllocationPatientAppointment =
          systemUserDaywiseWorkAllocationPatientAppointments[0];
      }

      console.log(
        "Final result:",
        systemUserDaywiseWorkAllocationPatientAppointment
      );
      return systemUserDaywiseWorkAllocationPatientAppointment;
    } catch (e) {
      console.error(
        "Error while Fetching SystemUserDaywiseWorkAllocationPatientAppointment",
        e
      );
      throw Error(
        "Error while Fetching SystemUserDaywiseWorkAllocationPatientAppointment" +
          e
      );
    }
  };

exports.findCompletedSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCode =
  async function (roleCode, consortiumPatientAppointmentId, systemUserId) {
    let fetchedActivityFileStatusIdForCompleted =
      await ActivityFileStatusService.findActivityFileStatusIdByCode(
        AppConfigConst.ACTIVITY_FILE_STATUS_CODE_COMPLETED
      );

    const projectObj = {
      _id: "$_id",
      systemUserDaywiseWorkAllocation: "$systemUserDaywiseWorkAllocation",
      consortiumPatientAppointment: "$consortiumPatientAppointment",
      transcriptorRole: "$transcriptorRole",
      activityReceivedAt: "$activityReceivedAt",
      activityReceivedFrom: "$activityReceivedFrom",
      activityStartedAt: "$activityStartedAt",
      activityEndedAt: "$activityEndedAt",
      activityDurationInSeconds: "$activityDurationInSeconds",
      activityPriority: "$activityPriority",
      activityAction: "$activityAction",
      activityStatus: "$activityStatus",
      activityFileStatus: "$activityFileStatus",
    };

    // Options setup for the mongoose paginate
    const populateOptions = [
      {
        path: "systemUserDaywiseWorkAllocation",
      },
      {
        path: "transcriptorRole",
      },
      {
        path: "activityReceivedFrom",
      },
      {
        path: "activityPriority",
      },
      {
        path: "activityAction",
      },
      {
        path: "activityStatus",
      },
      {
        path: "activityFileStatus",
      },
    ];

    var options = {
      ["systemUserDaywiseWorkAllocationLP.systemUser"]:
        new mongoose.Types.ObjectId(systemUserId),
      ["transcriptorRoleLP.roleCode"]: roleCode,
    };

    if (mongodb.ObjectId.isValid(consortiumPatientAppointmentId)) {
      options.consortiumPatientAppointment = new mongoose.Types.ObjectId(
        consortiumPatientAppointmentId
      );
    }

    if (mongodb.ObjectId.isValid(fetchedActivityFileStatusIdForCompleted)) {
      options.activityFileStatus = new mongoose.Types.ObjectId(
        fetchedActivityFileStatusIdForCompleted
      );
    }

    let sortOptions = {
      createdAt: 1,
    };

    const systemUserDaywiseWorkAllocationLookup = {
      from: SystemUserDaywiseWorkAllocation.collection.name,
      localField: "systemUserDaywiseWorkAllocation",
      foreignField: "_id",
      as: "systemUserDaywiseWorkAllocationLP",
    };

    const transcriptorRoleLookup = {
      from: TranscriptorRole.collection.name,
      localField: "transcriptorRole",
      foreignField: "_id",
      as: "transcriptorRoleLP",
    };

    try {
      let aggregationParamArr = [];

      aggregationParamArr.push({
        $lookup: systemUserDaywiseWorkAllocationLookup,
      });

      aggregationParamArr.push({
        $lookup: transcriptorRoleLookup,
      });

      aggregationParamArr.push({
        $match: options,
      });

      var systemUserDaywiseWorkAllocationPatientAppointments = [];
      if (
        mongodb.ObjectId.isValid(consortiumPatientAppointmentId) &&
        mongodb.ObjectId.isValid(systemUserId)
      ) {
        systemUserDaywiseWorkAllocationPatientAppointments =
          await SystemUserDaywiseWorkAllocationPatientAppointment.aggregate(
            aggregationParamArr
          )
            .project(projectObj)
            .sort(sortOptions);

        systemUserDaywiseWorkAllocationPatientAppointments =
          await SystemUserDaywiseWorkAllocationPatientAppointment.populate(
            systemUserDaywiseWorkAllocationPatientAppointments,
            populateOptions
          );
      }

      var systemUserDaywiseWorkAllocationPatientAppointment;
      if (systemUserDaywiseWorkAllocationPatientAppointments.length > 0) {
        systemUserDaywiseWorkAllocationPatientAppointment =
          systemUserDaywiseWorkAllocationPatientAppointments[0];
      }

      return systemUserDaywiseWorkAllocationPatientAppointment;
    } catch (e) {
      throw Error(
        "Error while Fetching SystemUserDaywiseWorkAllocationPatientAppointment" +
          e
      );
    }
  };

exports.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCodeForTakeBack =
  async function (roleCode, consortiumPatientAppointmentId, systemUserId) {
    const projectObj = {
      _id: "$_id",
      systemUserDaywiseWorkAllocation: "$systemUserDaywiseWorkAllocation",
      consortiumPatientAppointment: "$consortiumPatientAppointment",
      transcriptorRole: "$transcriptorRole",
      activityReceivedAt: "$activityReceivedAt",
      activityReceivedFrom: "$activityReceivedFrom",
      activityStartedAt: "$activityStartedAt",
      activityEndedAt: "$activityEndedAt",
      activityDurationInSeconds: "$activityDurationInSeconds",
      activityPriority: "$activityPriority",
      activityAction: "$activityAction",
      activityStatus: "$activityStatus",
      activityFileStatus: "$activityFileStatus",
    };

    // Options setup for the mongoose paginate
    const populateOptions = [
      {
        path: "systemUserDaywiseWorkAllocation",
      },
      {
        path: "transcriptorRole",
      },
      {
        path: "activityReceivedFrom",
      },
      {
        path: "activityPriority",
      },
      {
        path: "activityAction",
      },
      {
        path: "activityStatus",
      },
      {
        path: "activityFileStatus",
      },
    ];

    var options = {
      ["systemUserDaywiseWorkAllocationLP.systemUser"]:
        new mongoose.Types.ObjectId(systemUserId),
      ["transcriptorRoleLP.roleCode"]: roleCode,
      activityStartedAt: 0,
      activityEndedAt: 0,
    };

    if (mongodb.ObjectId.isValid(consortiumPatientAppointmentId)) {
      options.consortiumPatientAppointment = new mongoose.Types.ObjectId(
        consortiumPatientAppointmentId
      );
    }

    let sortOptions = {
      createdAt: 1,
    };

    const systemUserDaywiseWorkAllocationLookup = {
      from: SystemUserDaywiseWorkAllocation.collection.name,
      localField: "systemUserDaywiseWorkAllocation",
      foreignField: "_id",
      as: "systemUserDaywiseWorkAllocationLP",
    };

    const transcriptorRoleLookup = {
      from: TranscriptorRole.collection.name,
      localField: "transcriptorRole",
      foreignField: "_id",
      as: "transcriptorRoleLP",
    };

    try {
      let aggregationParamArr = [];

      aggregationParamArr.push({
        $lookup: systemUserDaywiseWorkAllocationLookup,
      });

      aggregationParamArr.push({
        $lookup: transcriptorRoleLookup,
      });

      aggregationParamArr.push({
        $match: options,
      });

      var systemUserDaywiseWorkAllocationPatientAppointments = [];
      if (
        mongodb.ObjectId.isValid(consortiumPatientAppointmentId) &&
        mongodb.ObjectId.isValid(systemUserId)
      ) {
        systemUserDaywiseWorkAllocationPatientAppointments =
          await SystemUserDaywiseWorkAllocationPatientAppointment.aggregate(
            aggregationParamArr
          )
            .project(projectObj)
            .sort(sortOptions);

        systemUserDaywiseWorkAllocationPatientAppointments =
          await SystemUserDaywiseWorkAllocationPatientAppointment.populate(
            systemUserDaywiseWorkAllocationPatientAppointments,
            populateOptions
          );
      }

      var systemUserDaywiseWorkAllocationPatientAppointment;
      if (systemUserDaywiseWorkAllocationPatientAppointments.length > 0) {
        systemUserDaywiseWorkAllocationPatientAppointment =
          systemUserDaywiseWorkAllocationPatientAppointments[0];
      }

      return systemUserDaywiseWorkAllocationPatientAppointment;
    } catch (e) {
      throw Error(
        "Error while Fetching SystemUserDaywiseWorkAllocationPatientAppointment" +
          e
      );
    }
  };

exports.findRunningConsortiumPatientAppointmentActivity = async function (
  systemUserId,
  consortiumPatientAppointmentId
) {
  const projectObj = {
    _id: "$_id",
    systemUserDaywiseWorkAllocation: "$systemUserDaywiseWorkAllocation",
    consortiumPatientAppointment: "$consortiumPatientAppointment",
    transcriptorRole: "$transcriptorRole",
    activityReceivedAt: "$activityReceivedAt",
    activityReceivedFrom: "$activityReceivedFrom",
    activityStartedAt: "$activityStartedAt",
    activityEndedAt: "$activityEndedAt",
    activityDurationInSeconds: "$activityDurationInSeconds",
    activityPriority: "$activityPriority",
    activityAction: "$activityAction",
    activityStatus: "$activityStatus",
    activityFileStatus: "$activityFileStatus",
  };

  // Options setup for the mongoose paginate
  const populateOptions = [
    {
      path: "systemUserDaywiseWorkAllocation",
    },
    {
      path: "consortiumPatientAppointment",
    },
    {
      path: "transcriptorRole",
    },
    {
      path: "activityReceivedFrom",
    },
    {
      path: "activityPriority",
    },
    {
      path: "activityAction",
    },
    {
      path: "activityStatus",
    },
    {
      path: "activityFileStatus",
    },
  ];

  var options = {
    activityStartedAt: { $gt: 0 },
    $or: [
      { activityEndedAt: { $lte: 0 } },
      { activityEndedAt: { $eq: null } },
      { activityEndedAt: { $exists: false } },
    ],
    ["systemUserDaywiseWorkAllocationLP.systemUser"]:
      new mongoose.Types.ObjectId(systemUserId),
  };

  if (mongodb.ObjectId.isValid(consortiumPatientAppointmentId)) {
    options.consortiumPatientAppointment = {
      $ne: new mongoose.Types.ObjectId(consortiumPatientAppointmentId),
    };
  }

  let sortOptions = {
    createdAt: 1,
  };

  const systemUserDaywiseWorkAllocationLookup = {
    from: SystemUserDaywiseWorkAllocation.collection.name,
    localField: "systemUserDaywiseWorkAllocation",
    foreignField: "_id",
    as: "systemUserDaywiseWorkAllocationLP",
  };

  try {
    let aggregationParamArr = [];

    aggregationParamArr.push({
      $lookup: systemUserDaywiseWorkAllocationLookup,
    });

    aggregationParamArr.push({
      $match: options,
    });

    var systemUserDaywiseWorkAllocationPatientAppointments = [];
    if (mongodb.ObjectId.isValid(systemUserId)) {
      systemUserDaywiseWorkAllocationPatientAppointments =
        await SystemUserDaywiseWorkAllocationPatientAppointment.aggregate(
          aggregationParamArr
        )
          .project(projectObj)
          .sort(sortOptions);

      systemUserDaywiseWorkAllocationPatientAppointments =
        await SystemUserDaywiseWorkAllocationPatientAppointment.populate(
          systemUserDaywiseWorkAllocationPatientAppointments,
          populateOptions
        );
    }

    return systemUserDaywiseWorkAllocationPatientAppointments;
  } catch (e) {
    throw Error(
      "Error while Fetching SystemUserDaywiseWorkAllocationPatientAppointment" +
        e
    );
  }
};

exports.findSystemUserDaywiseWorkAllocationPatientAppointmentList =
  async function () {
    try {
      var systemUserDaywiseWorkAllocationPatientAppointments =
        await SystemUserDaywiseWorkAllocationPatientAppointment.find();

      if (
        systemUserDaywiseWorkAllocationPatientAppointments &&
        systemUserDaywiseWorkAllocationPatientAppointments.length > 0
      ) {
        await Promise.all(
          systemUserDaywiseWorkAllocationPatientAppointments.map(
            async (
              systemUserDaywiseWorkAllocationPatientAppointment,
              index
            ) => {
              let consortiumPatientAppointmentId =
                systemUserDaywiseWorkAllocationPatientAppointment.consortiumPatientAppointment;
              let activityPriority =
                systemUserDaywiseWorkAllocationPatientAppointment.activityPriority;

              if (
                mongodb.ObjectId.isValid(consortiumPatientAppointmentId) &&
                mongodb.ObjectId.isValid(activityPriority)
              ) {
                var options = {
                  _id: new mongoose.Types.ObjectId(
                    consortiumPatientAppointmentId
                  ),
                  isDeleted: 0,
                };

                let consortiumPatientAppointment =
                  await ConsortiumPatientAppointment.findOne(options);
                if (consortiumPatientAppointment) {
                  consortiumPatientAppointment.activityPriority =
                    activityPriority;
                  await consortiumPatientAppointment.save();
                }
              }
            }
          )
        );
      }
      return systemUserDaywiseWorkAllocationPatientAppointments;
    } catch (e) {
      throw Error(
        "Error while Fetching SystemUserDaywiseWorkAllocationPatientAppointment" +
          e
      );
    }
  };

exports.removeSystemUserDaywiseWorkAllocationPatientAppointmentById =
  async function (systemUserDaywiseWorkAllocationPatientAppointmentId) {
    var options = {
      _id: new mongoose.Types.ObjectId(
        systemUserDaywiseWorkAllocationPatientAppointmentId
      ),
    };
    try {
      if (
        mongodb.ObjectId.isValid(
          systemUserDaywiseWorkAllocationPatientAppointmentId
        )
      ) {
        return await SystemUserDaywiseWorkAllocationPatientAppointment.deleteOne(
          options
        );
      }
    } catch (e) {
      throw Error(
        "Error while Fetching SystemUserDaywiseWorkAllocationPatientAppointment" +
          e
      );
    }
  };

exports.getWorkPoolList = async function (req) {
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
  let filListCode = req.body.filListCode;

  var filConsortiumPatient = req.body.filConsortiumPatient;
  let filAppointmentStatus = req.body.filAppointmentStatus;

  var sortByCol = req.body.sortBy ? req.body.sortBy : "col1";
  var sortOrder = req.body.sortOrder ? req.body.sortOrder : "asc";

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
    new mongoose.Types.ObjectId(transcriptionStatusIdForTranscriptionAssigned),
    new mongoose.Types.ObjectId(transcriptionStatusIdForQA1Assigned),
    new mongoose.Types.ObjectId(transcriptionStatusIdForQA2Assigned),
    new mongoose.Types.ObjectId(transcriptionStatusIdForQA3Assigned),
  ];

  // Options setup for the mongoose paginate
  const populateOptions = [
    {
      path: "consortiumPatientAppointment",
      populate: [
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
          path: "consortiumLocation",
          select: "locationName",
          populate: [
            {
              path: "timeZoneOption",
            },
          ],
        },
        {
          path: "consortiumUser",
          select: "userFullName",
        },
        {
          path: "duplicatedBasePatientAppointment",
          select: "appointmentId",
        },
      ],
    },
    {
      path: "transcriptorRole",
    },
    {
      path: "activityReceivedFrom",
    },
    {
      path: "activityPriority",
    },
    {
      path: "activityAction",
    },
    {
      path: "activityStatus",
    },
    {
      path: "activityFileStatus",
    },
  ];

  const projectObj = {
    _id: "$_id",
    systemUserDaywiseWorkAllocation: "$systemUserDaywiseWorkAllocation",
    consortiumPatientAppointment: "$consortiumPatientAppointment",
    transcriptorRole: "$transcriptorRole",
    activityReceivedAt: "$activityReceivedAt",
    activityReceivedFrom: "$activityReceivedFrom",
    activityStartedAt: "$activityStartedAt",
    activityEndedAt: "$activityEndedAt",
    activityDurationInSeconds: "$activityDurationInSeconds",
    activityPriority: "$activityPriority",
    activityAction: "$activityAction",
    activityStatus: "$activityStatus",
    activityFileStatus: "$activityFileStatus",
    consortiumPatientAppointmentLP: "$consortiumPatientAppointmentLP",
  };

  let hasMTAssignedLookup = false;
  let hasQA1AssignedToLookup = false;
  let hasQA2AssignedToLookup = false;
  let hasQA3AssignedToLookup = false;
  let hasActivityPriorityLookup = false;
  let hasTranscriptionStatusLookup = false;

  let applicableOptions = [];
  let fetchOptions = {};

  fetchOptions["consortiumPatientAppointmentLP.isDeleted"] = 0;
  fetchOptions[
    "consortiumPatientAppointmentLP.isDictationUploadCompleted"
  ] = true;
  fetchOptions["consortiumPatientAppointmentLP.isSubmitted"] = false;
  fetchOptions["consortiumPatientAppointmentLP.isCompleted"] = false;
  fetchOptions["consortiumPatientAppointmentLP.transcriptionStatus"] = {
    $in: transcriptionStatusIdArr,
  };

  if (filListCode !== null && filListCode !== undefined && filListCode !== "") {
    let fetchedActivityFileStatusIdForPending =
      await ActivityFileStatusService.findActivityFileStatusIdByCode(
        AppConfigConst.ACTIVITY_FILE_STATUS_CODE_PENDING
      );
    let fetchedActivityFileStatusIdForCompleted =
      await ActivityFileStatusService.findActivityFileStatusIdByCode(
        AppConfigConst.ACTIVITY_FILE_STATUS_CODE_COMPLETED
      );

    if (filListCode === AppConfigConst.WORK_POOL_LIST_CODE_IN_PROGRESS) {
      let activityFileStatusIdArr = [];
      if (mongodb.ObjectId.isValid(fetchedActivityFileStatusIdForPending)) {
        activityFileStatusIdArr.push(fetchedActivityFileStatusIdForPending);
      }

      if (mongodb.ObjectId.isValid(fetchedActivityFileStatusIdForCompleted)) {
        activityFileStatusIdArr.push(fetchedActivityFileStatusIdForCompleted);
      }

      if (activityFileStatusIdArr.length > 0) {
        fetchOptions.activityFileStatus = { $nin: activityFileStatusIdArr };
      }
    } else if (filListCode === AppConfigConst.WORK_POOL_LIST_CODE_PENDING) {
      if (mongodb.ObjectId.isValid(fetchedActivityFileStatusIdForPending)) {
        fetchOptions.activityFileStatus = new mongoose.Types.ObjectId(
          fetchedActivityFileStatusIdForPending
        );
        // fetchOptions.activityEndedAt = { '$gt' : 0}
      }
    } else if (filListCode === AppConfigConst.WORK_POOL_LIST_CODE_COMPLETED) {
      if (mongodb.ObjectId.isValid(fetchedActivityFileStatusIdForCompleted)) {
        fetchOptions.activityFileStatus = new mongoose.Types.ObjectId(
          fetchedActivityFileStatusIdForCompleted
        );
        // fetchOptions.activityEndedAt = { '$gt' : 0}
      }
    }
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
    fetchOptions["consortiumPatientAppointmentLP.transcriptionAllocationDate"] =
      dateTranscriptionAllocationFilters;
  }

  if (mongodb.ObjectId.isValid(systemUserId)) {
    fetchOptions["systemUserDaywiseWorkAllocationLP.systemUser"] =
      new mongoose.Types.ObjectId(systemUserId);

    let orFetchOptions = [];

    orFetchOptions.push({
      "consortiumPatientAppointmentLP.mtAssignedTo":
        new mongoose.Types.ObjectId(systemUserId),
    });
    orFetchOptions.push({
      "consortiumPatientAppointmentLP.qa1AssignedTo":
        new mongoose.Types.ObjectId(systemUserId),
    });
    orFetchOptions.push({
      "consortiumPatientAppointmentLP.qa2AssignedTo":
        new mongoose.Types.ObjectId(systemUserId),
    });
    orFetchOptions.push({
      "consortiumPatientAppointmentLP.qa3AssignedTo":
        new mongoose.Types.ObjectId(systemUserId),
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
    fetchOptions["consortiumPatientAppointmentLP.consortium"] =
      new mongoose.Types.ObjectId(filConsortium);
  }

  if (mongodb.ObjectId.isValid(filTranscriptionStatus)) {
    fetchOptions["consortiumPatientAppointmentLP.transcriptionStatus"] =
      new mongoose.Types.ObjectId(filTranscriptionStatus);
  }

  if (mongodb.ObjectId.isValid(filAppointmentStatus)) {
    fetchOptions["consortiumPatientAppointmentLP.appointmentStatus"] =
      new mongoose.Types.ObjectId(filAppointmentStatus);
  }

  if (mongodb.ObjectId.isValid(filConsortiumUser)) {
    fetchOptions["consortiumPatientAppointmentLP.consortiumUser"] =
      new mongoose.Types.ObjectId(filConsortiumUser);
  }

  if (mongodb.ObjectId.isValid(filConsortiumPatient)) {
    fetchOptions["consortiumPatientAppointmentLP.consortiumPatient"] =
      new mongoose.Types.ObjectId(filConsortiumPatient);
  }

  if (mongodb.ObjectId.isValid(filConsortiumLocation)) {
    fetchOptions["consortiumPatientAppointmentLP.consortiumLocation"] =
      new mongoose.Types.ObjectId(filConsortiumLocation);
  }

  if (mongodb.ObjectId.isValid(filMTAssignedTo)) {
    fetchOptions["consortiumPatientAppointmentLP.mtAssignedTo"] =
      new mongoose.Types.ObjectId(filMTAssignedTo);
  }

  if (mongodb.ObjectId.isValid(filQA1AssignedTo)) {
    fetchOptions["consortiumPatientAppointmentLP.qa1AssignedTo"] =
      new mongoose.Types.ObjectId(filQA1AssignedTo);
  }

  if (mongodb.ObjectId.isValid(filQA2AssignedTo)) {
    fetchOptions["consortiumPatientAppointmentLP.qa2AssignedTo"] =
      new mongoose.Types.ObjectId(filQA2AssignedTo);
  }

  if (mongodb.ObjectId.isValid(filQA3AssignedTo)) {
    fetchOptions["consortiumPatientAppointmentLP.qa3AssignedTo"] =
      new mongoose.Types.ObjectId(filQA3AssignedTo);
  }

  if (mongodb.ObjectId.isValid(filActivityPriority)) {
    fetchOptions["consortiumPatientAppointmentLP.activityPriority"] =
      new mongoose.Types.ObjectId(filActivityPriority);
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
        "consortiumPatientAppointmentLP.appointmentId": sortOrderInt,
      };
    } else if (sortByCol == "col2") {
      sortOptions = {
        "consortiumPatientAppointmentLP.appointmentDate": sortOrderInt,
      };
    } else if (sortByCol == "col3") {
      sortOptions = {
        "consortiumPatientAppointmentLP.totalDicationDurationInSeconds":
          sortOrderInt,
      };
    } else if (sortByCol == "col4") {
      sortOptions = {
        "consortiumPatientAppointmentLP.totalDicationAttachmentFileSizeBytes":
          sortOrderInt,
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
    localField: "consortiumPatientAppointmentLP.mtAssignedTo",
    foreignField: "_id",
    as: "mtAssignedToLP",
  };

  const qa1AssignedToLookup = {
    from: SystemUser.collection.name,
    localField: "consortiumPatientAppointmentLP.qa1AssignedTo",
    foreignField: "_id",
    as: "qa1AssignedToLP",
  };

  const qa2AssignedToLookup = {
    from: SystemUser.collection.name,
    localField: "consortiumPatientAppointmentLP.qa2AssignedTo",
    foreignField: "_id",
    as: "qa2AssignedToLP",
  };

  const qa3AssignedToLookup = {
    from: SystemUser.collection.name,
    localField: "consortiumPatientAppointmentLP.qa3AssignedTo",
    foreignField: "_id",
    as: "qa3AssignedToLP",
  };

  const transcriptionStatusLookup = {
    from: TranscriptionStatus.collection.name,
    localField: "consortiumPatientAppointmentLP.transcriptionStatus",
    foreignField: "_id",
    as: "transcriptionStatusLP",
  };

  const consortiumPatientAppointmentLookup = {
    from: ConsortiumPatientAppointment.collection.name,
    localField: "consortiumPatientAppointment",
    foreignField: "_id",
    as: "consortiumPatientAppointmentLP",
  };

  const systemUserDaywiseWorkAllocationLookup = {
    from: SystemUserDaywiseWorkAllocation.collection.name,
    localField: "systemUserDaywiseWorkAllocation",
    foreignField: "_id",
    as: "systemUserDaywiseWorkAllocationLP",
  };

  try {
    let aggregationParamArr = [];

    aggregationParamArr.push({
      $lookup: consortiumPatientAppointmentLookup,
    });

    aggregationParamArr.push({
      $lookup: systemUserDaywiseWorkAllocationLookup,
    });

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

    aggregationParamArr.push({
      $group: {
        _id: { consortiumPatientAppointment: "$consortiumPatientAppointment" },
        systemUserDaywiseWorkAllocation: {
          $first: "$systemUserDaywiseWorkAllocation",
        },
        consortiumPatientAppointment: {
          $first: "$consortiumPatientAppointment",
        },
        transcriptorRole: { $first: "$transcriptorRole" },
        activityReceivedAt: { $first: "$activityReceivedAt" },
        activityReceivedFrom: { $first: "$activityReceivedFrom" },
        activityStartedAt: { $first: "$activityStartedAt" },
        activityEndedAt: { $first: "$activityEndedAt" },
        activityDurationInSeconds: { $first: "$activityDurationInSeconds" },
        activityPriority: { $first: "$activityPriority" },
        activityAction: { $first: "$activityAction" },
        activityStatus: { $first: "$activityStatus" },
        activityFileStatus: { $first: "$activityFileStatus" },
        consortiumPatientAppointmentLP: {
          $first: "$consortiumPatientAppointmentLP",
        },
      },
    });

    let systemUserDaywiseWorkAllocationPatientAppointments =
      await SystemUserDaywiseWorkAllocationPatientAppointment.aggregate(
        aggregationParamArr
      )
        .project(projectObj)
        .sort(sortOptions);

    systemUserDaywiseWorkAllocationPatientAppointments =
      await SystemUserDaywiseWorkAllocationPatientAppointment.populate(
        systemUserDaywiseWorkAllocationPatientAppointments,
        populateOptions
      );

    let totalActivityDurationInSeconds = 0;
    if (systemUserDaywiseWorkAllocationPatientAppointments.length > 0) {
      systemUserDaywiseWorkAllocationPatientAppointments = JSON.parse(
        JSON.stringify(systemUserDaywiseWorkAllocationPatientAppointments)
      );

      systemUserDaywiseWorkAllocationPatientAppointments.forEach(function (
        systemUserDaywiseWorkAllocationPatientAppointment
      ) {
        let activityDurationInSeconds = parseInt(
          systemUserDaywiseWorkAllocationPatientAppointment.activityDurationInSeconds
        );
        systemUserDaywiseWorkAllocationPatientAppointment.activityDuration =
          AppCommonService.secondsToHourMinuteSecond(activityDurationInSeconds);
        totalActivityDurationInSeconds += activityDurationInSeconds;
        systemUserDaywiseWorkAllocationPatientAppointment.consortiumPatientAppointment.appointmentIdInt =
          systemUserDaywiseWorkAllocationPatientAppointment.consortiumPatientAppointment.appointmentId;
        systemUserDaywiseWorkAllocationPatientAppointment.consortiumPatientAppointment.appointmentId =
          AppCommonService.getConsortiumPatientAppointmentIdWithPrefix(
            systemUserDaywiseWorkAllocationPatientAppointment
              .consortiumPatientAppointment.appointmentId
          );

        let duplicatedBasePatientAppointment =
          systemUserDaywiseWorkAllocationPatientAppointment
            .consortiumPatientAppointment.duplicatedBasePatientAppointment;

        if (
          duplicatedBasePatientAppointment !== undefined &&
          duplicatedBasePatientAppointment !== null
        ) {
          systemUserDaywiseWorkAllocationPatientAppointment.consortiumPatientAppointment.duplicatedBasePatientAppointment.appointmentIdInt =
            systemUserDaywiseWorkAllocationPatientAppointment.consortiumPatientAppointment.duplicatedBasePatientAppointment.appointmentId;
          systemUserDaywiseWorkAllocationPatientAppointment.consortiumPatientAppointment.duplicatedBasePatientAppointment.appointmentId =
            AppCommonService.getConsortiumPatientAppointmentIdWithPrefix(
              systemUserDaywiseWorkAllocationPatientAppointment
                .consortiumPatientAppointment.duplicatedBasePatientAppointment
                .appointmentId
            );
        }

        delete systemUserDaywiseWorkAllocationPatientAppointment.consortiumPatientAppointmentLP;
      });
    }

    let response = {
      results: systemUserDaywiseWorkAllocationPatientAppointments,
      totalActivityDuration: AppCommonService.secondsToHourMinuteSecond(
        totalActivityDurationInSeconds
      ),
      totalAppointmentCount:
        systemUserDaywiseWorkAllocationPatientAppointments.length,
      sortOptions: sortOptions,
    };

    return response;
  } catch (e) {
    throw Error(
      "Error while Paginating SystemUserDaywiseWorkAllocationPatientAppointment " +
        e
    );
  }
};

exports.findSystemUserDaywiseWorkAllocationPatientAppointmentByRoleCodeForDeallocation =
  async function (roleCode, consortiumPatientAppointmentId, systemUserId) {
    const projectObj = {
      _id: "$_id",
      systemUserDaywiseWorkAllocation: "$systemUserDaywiseWorkAllocation",
      consortiumPatientAppointment: "$consortiumPatientAppointment",
      transcriptorRole: "$transcriptorRole",
      activityReceivedAt: "$activityReceivedAt",
      activityReceivedFrom: "$activityReceivedFrom",
      activityStartedAt: "$activityStartedAt",
      activityEndedAt: "$activityEndedAt",
      activityDurationInSeconds: "$activityDurationInSeconds",
      activityPriority: "$activityPriority",
      activityAction: "$activityAction",
      activityStatus: "$activityStatus",
      activityFileStatus: "$activityFileStatus",
    };

    let fetchedActivityFileStatusIdForPending =
      await ActivityFileStatusService.findActivityFileStatusIdByCode(
        AppConfigConst.ACTIVITY_FILE_STATUS_CODE_PENDING
      );

    // Options setup for the mongoose paginate
    const populateOptions = [
      {
        path: "systemUserDaywiseWorkAllocation",
      },
      {
        path: "transcriptorRole",
      },
      {
        path: "activityReceivedFrom",
      },
      {
        path: "activityPriority",
      },
      {
        path: "activityAction",
      },
      {
        path: "activityStatus",
      },
      {
        path: "activityFileStatus",
      },
    ];

    var options = {
      ["systemUserDaywiseWorkAllocationLP.systemUser"]:
        new mongoose.Types.ObjectId(systemUserId),
      ["transcriptorRoleLP.roleCode"]: roleCode,
    };

    if (mongodb.ObjectId.isValid(consortiumPatientAppointmentId)) {
      options.consortiumPatientAppointment = new mongoose.Types.ObjectId(
        consortiumPatientAppointmentId
      );
    }

    if (mongodb.ObjectId.isValid(fetchedActivityFileStatusIdForPending)) {
      let orOptions = [];
      orOptions.push({
        activityFileStatus: new mongoose.Types.ObjectId(
          fetchedActivityFileStatusIdForPending
        ),
      });
      orOptions.push({ activityFileStatus: { $eq: null } });
      orOptions.push({ activityFileStatus: { $exists: false } });

      if (orOptions.length > 0) {
        let allOtherFetchOptions = [];
        Object.keys(options).forEach(function (k) {
          allOtherFetchOptions.push({ [k]: options[k] });
        });

        allOtherFetchOptions.push({ $or: orOptions });

        let complexFetchOptions = {
          $and: allOtherFetchOptions,
        };

        options = complexFetchOptions;
      }
    }

    let sortOptions = {
      createdAt: 1,
    };

    const systemUserDaywiseWorkAllocationLookup = {
      from: SystemUserDaywiseWorkAllocation.collection.name,
      localField: "systemUserDaywiseWorkAllocation",
      foreignField: "_id",
      as: "systemUserDaywiseWorkAllocationLP",
    };

    const transcriptorRoleLookup = {
      from: TranscriptorRole.collection.name,
      localField: "transcriptorRole",
      foreignField: "_id",
      as: "transcriptorRoleLP",
    };

    try {
      let aggregationParamArr = [];

      aggregationParamArr.push({
        $lookup: systemUserDaywiseWorkAllocationLookup,
      });

      aggregationParamArr.push({
        $lookup: transcriptorRoleLookup,
      });

      aggregationParamArr.push({
        $match: options,
      });

      var systemUserDaywiseWorkAllocationPatientAppointments = [];
      if (
        mongodb.ObjectId.isValid(consortiumPatientAppointmentId) &&
        mongodb.ObjectId.isValid(systemUserId)
      ) {
        systemUserDaywiseWorkAllocationPatientAppointments =
          await SystemUserDaywiseWorkAllocationPatientAppointment.aggregate(
            aggregationParamArr
          )
            .project(projectObj)
            .sort(sortOptions);

        systemUserDaywiseWorkAllocationPatientAppointments =
          await SystemUserDaywiseWorkAllocationPatientAppointment.populate(
            systemUserDaywiseWorkAllocationPatientAppointments,
            populateOptions
          );
      }

      var systemUserDaywiseWorkAllocationPatientAppointment;
      if (systemUserDaywiseWorkAllocationPatientAppointments.length > 0) {
        systemUserDaywiseWorkAllocationPatientAppointment =
          systemUserDaywiseWorkAllocationPatientAppointments[0];
      }

      return systemUserDaywiseWorkAllocationPatientAppointment;
    } catch (e) {
      throw Error(
        "Error while Fetching SystemUserDaywiseWorkAllocationPatientAppointment" +
          e
      );
    }
  };
