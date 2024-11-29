var SystemUser = require("../models/systemUser.model");
var SystemUserSession = require("../models/systemUserSession.model");
var SystemUserOtp = require("../models/systemUserOtp.model");
var SystemUserRoleService = require("../services/systemUserRole.service");
var SystemUserModuleService = require("../services/systemUserModule.service");
var AppUploadService = require("./appUpload.service");
var AppConfig = require("../appconfig");
var bcrypt = require("bcrypt");
var AppCommonService = require("./appcommon.service");
var AppMailService = require("./appMail.service");
var mongodb = require("mongodb");
var AppConfigConst = require("../appconfig-const");
var AppConfigModule = require("../appconfig-module");
var AppDataSanitationService = require("../services/appDataSanitation.service");
var TranscriptorRoleService = require("../services/transcriptorRole.service");
var moment = require("moment");
var momentTZ = require("moment-timezone");
var mongoose = require("mongoose");
var mongodb = require("mongodb");
const TranscriptorRole = require("../models/transcriptorRole.model");

//Saving the context of this module inside the _the variable
_this = this;

exports.getSystemUsers = async function (req) {
  var filKeyword = req.body.filKeyword;

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

  // Options setup for the mongoose paginate
  const populateOptions = [
    {
      path: "role",
      select: "roleName",
    },
    {
      path: "transcriptorRole",
      select: "roleName",
    },
    {
      path: "gender",
      select: "genderName",
    },
    {
      path: "designation",
      select: "designationName",
    },
    {
      path: "department",
      select: "departmentName",
    },
    {
      path: "createdBy",
      select: "userFullName",
    },
    {
      path: "updatedBy",
      select: "userFullName",
    },
  ];

  const systemUserFileBaseUrl =
    AppUploadService.getSystemUserAttachmentFolderBaseUrl();

  const projectObj = {
    _id: "$_id",
    userFullName: "$userFullName",
    email: "$email",
    mobileNo: "$mobileNo",
    profilePhotoFilePathThumb: "$profilePhotoFilePathThumb",
    profilePhotoFilePathActual: "$profilePhotoFilePathActual",
    gender: "$gender",
    pseudoName: "$pseudoName",
    birthDate: "$birthDate",
    birthDateStr: "$birthDateStr",
    department: "$department",
    designation: "$designation",
    alternatePhoneNumber: "$alternatePhoneNumber",
    audioMinutes: "$audioMinutes",
    appLastAccessedAt: "$appLastAccessedAt",
    createdAt: "$createdAt",
    updatedAt: "$updatedAt",
    isActive: "$isActive",
    role: "$role",
    transcriptorRole: "$transcriptorRole",
    createdBy: "$createdBy",
    updatedBy: "$updatedBy",
    profilePhotoUrl: "$profileImageActualUrl",
    profilePhotoThumbUrl: "$profileImageThumbUrl",
    profileUrlExpiresAt: "$profileUrlExpiresAt",
  };

  let fetchOptions = {};
  fetchOptions.isDeleted = 0;

  if (status !== undefined && status !== "") {
    status = AppDataSanitationService.sanitizeDataTypeNumber(status);
    fetchOptions.isActive = status;
  }

  if (filKeyword && filKeyword !== undefined && filKeyword !== "") {
    searchStr = filKeyword;
  }

  if (searchStr && searchStr !== "") {
    var regex = new RegExp(searchStr, "i");

    let searchKeywordOptions = [];
    searchKeywordOptions.push({ userFullName: regex });
    searchKeywordOptions.push({ email: regex });

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
        userFullName: sortOrderInt,
      };
    } else if (sortByCol == "col2") {
      sortOptions = {
        role: sortOrderInt,
      };
    } else if (sortByCol == "col3") {
      sortOptions = {
        mobileNo: sortOrderInt,
      };
    } else if (sortByCol == "col4") {
      sortOptions = {
        email: sortOrderInt,
      };
    } else if (sortByCol == AppConfigConst.MAT_COLUMN_NAME_STATUS) {
      sortOptions = {
        isActive: sortOrderInt,
      };
    }
  } else {
    sortOptions = {
      userFullName: sortOrderInt,
    };
  }

  try {
    let users;
    if (forExport === true) {
      users = await SystemUser.aggregate([
        {
          $match: fetchOptions, // For Fetch
        },
      ])
        .project(projectObj)
        .sort(sortOptions);
    } else {
      users = await SystemUser.aggregate([
        {
          $match: fetchOptions, // For Fetch
        },
      ])
        .project(projectObj)
        .sort(sortOptions)
        .skip(skipVal)
        .limit(limit);
    }

    users = await SystemUser.populate(users, populateOptions);

    let recordCntData = await SystemUser.aggregate([
      {
        $match: fetchOptions,
      },
      {
        $group: { _id: null, count: { $sum: 1 } },
      },
    ]);

    let totalRecords = 0;

    if (recordCntData && recordCntData[0] && recordCntData[0].count) {
      totalRecords = recordCntData[0].count;
    }

    let filteredRecords = totalRecords;

    let response = {
      results: users,
      totalRecords: totalRecords,
      filteredRecords: filteredRecords,
      fetchOptions: fetchOptions,
    };

    return response;
  } catch (e) {
    throw Error("Error while Paginating SystemUser " + e);
  }
};

exports.getSystemUsersForSelect = async function (req) {
  var excIdArr = req.body.excIdArr;

  const projectObj = {
    _id: "$_id",
    id: "$_id",
    text: "$userFullName",
    textI: { $toLower: "$userFullName" },
  };

  const sortOptions = {};
  sortOptions.textI = 1;

  let fetchOptions = {};
  fetchOptions.isActive = 1;
  fetchOptions.isDeleted = 0;

  var excludeMongoIdArr = [];
  if (excIdArr !== undefined && excIdArr.length > 0) {
    excIdArr.forEach((excId) => {
      if (mongodb.ObjectId.isValid(excId)) {
        excludeMongoIdArr.push(new mongoose.Types.ObjectId(excId));
      }
    });
  }

  if (excludeMongoIdArr && excludeMongoIdArr.length > 0) {
    fetchOptions._id = { $nin: excludeMongoIdArr };
  }

  try {
    var users = await SystemUser.aggregate([{ $match: fetchOptions }])
      .project(projectObj)
      .sort(sortOptions);

    users.forEach(function (v) {
      delete v._id;
      delete v.textI;
    });

    return users;
  } catch (e) {
    throw Error("Error while Paginating accountVerificationStatuses " + e);
  }
};

exports.getMTSystemUsersForSelect = async function (req) {
  var excIdArr = req.body.excIdArr;
  var incIdArr = req.body.incIdArr;

  var consortiumId = await AppCommonService.getConsortiumFromRequest(req);

  const projectObj = {
    _id: "$_id",
    id: "$_id",
    text: "$userFullName",
    textI: { $toLower: "$userFullName" },
  };

  const sortOptions = {};
  sortOptions.textI = 1;

  let transcriptorRoleIdForMT =
    await TranscriptorRoleService.findTranscriptorRoleIdByRoleCode(
      AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT
    );
  let transcriptorRoleIdForMTQA =
    await TranscriptorRoleService.findTranscriptorRoleIdByRoleCode(
      AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT_QA
    );

  let transcriptorRoleIdArr = [];

  if (mongodb.ObjectId.isValid(transcriptorRoleIdForMT)) {
    transcriptorRoleIdArr.push(transcriptorRoleIdForMT);
  }

  if (mongodb.ObjectId.isValid(transcriptorRoleIdForMTQA)) {
    transcriptorRoleIdArr.push(transcriptorRoleIdForMTQA);
  }

  let fetchOptions = {};
  fetchOptions.isActive = 1;
  fetchOptions.isDeleted = 0;

  if (transcriptorRoleIdArr.length > 0) {
    fetchOptions.transcriptorRole = { $in: transcriptorRoleIdArr };
  }

  if (mongodb.ObjectId.isValid(consortiumId)) {
    fetchOptions.consortium = consortiumId;
  }

  var excludeMongoIdArr = [];
  if (excIdArr !== undefined && excIdArr.length > 0) {
    excIdArr.forEach((excId) => {
      if (mongodb.ObjectId.isValid(excId)) {
        excludeMongoIdArr.push(new mongoose.Types.ObjectId(excId));
      }
    });
  }

  if (excludeMongoIdArr && excludeMongoIdArr.length > 0) {
    fetchOptions._id = { $nin: excludeMongoIdArr };
  }

  var includeMongoIdArr = [];
  if (incIdArr !== undefined && incIdArr.length > 0) {
    incIdArr.forEach((incId) => {
      if (mongodb.ObjectId.isValid(incId)) {
        if (excIdArr !== undefined && excIdArr.length > 0) {
          const excludeIdIndex = excIdArr.indexOf(incId + "");
          if (excludeIdIndex < 0) {
            includeMongoIdArr.push(new mongoose.Types.ObjectId(incId));
          }
        } else {
          includeMongoIdArr.push(new mongoose.Types.ObjectId(incId));
        }
      }
    });
  }

  if (includeMongoIdArr && includeMongoIdArr.length > 0) {
    fetchOptions._id = { $in: includeMongoIdArr };
  }

  try {
    var users = await SystemUser.aggregate([{ $match: fetchOptions }])
      .project(projectObj)
      .sort(sortOptions);

    users.forEach(function (v) {
      delete v._id;
      delete v.textI;
    });

    return users;
  } catch (e) {
    throw Error("Error while Paginating accountVerificationStatuses " + e);
  }
};

exports.getSystemUsersByTranscriptorRoleId = async function (
  transcriptorRoleId
) {
  try {
    if (!mongodb.ObjectId.isValid(transcriptorRoleId)) {
      throw Error("Invalid transcriptor role ID");
    }

    const projectObj = {
      _id: "$_id",
      id: "$_id",
      text: "$userFullName",
      textI: { $toLower: "$userFullName" },
    };

    let systemUsers = await SystemUser.aggregate([
      {
        $match: { transcriptorRole: new mongodb.ObjectId(transcriptorRoleId) },
      },
      { $project: projectObj },
    ]);

    systemUsers.forEach(function (v) {
      delete v._id;
      delete v.textI;
    });

    return systemUsers;
  } catch (e) {
    throw Error("Error occurred while fetching system users: " + e);
  }
};

exports.getSystemUsersByTranscriptorRoleId = async function (
  transcriptorRoleId
) {
  try {
    if (!mongodb.ObjectId.isValid(transcriptorRoleId)) {
      throw Error("Invalid transcriptor role ID");
    }

    const projectObj = {
      _id: "$_id",
      id: "$_id",
      text: "$userFullName",
      textI: { $toLower: "$userFullName" },
    };

    let systemUsers = await SystemUser.aggregate([
      {
        $match: { transcriptorRole: new mongodb.ObjectId(transcriptorRoleId) },
      },
      { $project: projectObj },
    ]);

    systemUsers.forEach(function (v) {
      delete v._id;
      delete v.textI;
    });

    return systemUsers;
  } catch (e) {
    throw Error("Error occurred while fetching system users: " + e);
  }
};

exports.getQASystemUsersForSelect = async function (req) {
  var incIdArr = req.body.incIdArr;

  var excIdArr = req.body.excIdArr;

  const projectObj = {
    _id: "$_id",
    id: "$_id",
    text: "$userFullName",
    textI: { $toLower: "$userFullName" },
  };

  const sortOptions = {};
  sortOptions.textI = 1;

  let transcriptorRoleIdForQA =
    await TranscriptorRoleService.findTranscriptorRoleIdByRoleCode(
      AppConfigConst.TRANSCRIPTOR_ROLE_CODE_QA
    );
  let transcriptorRoleIdForMTQA =
    await TranscriptorRoleService.findTranscriptorRoleIdByRoleCode(
      AppConfigConst.TRANSCRIPTOR_ROLE_CODE_MT_QA
    );

  let transcriptorRoleIdArr = [];

  if (mongodb.ObjectId.isValid(transcriptorRoleIdForQA)) {
    transcriptorRoleIdArr.push(transcriptorRoleIdForQA);
  }

  if (mongodb.ObjectId.isValid(transcriptorRoleIdForMTQA)) {
    transcriptorRoleIdArr.push(transcriptorRoleIdForMTQA);
  }

  let fetchOptions = {};
  fetchOptions.isActive = 1;
  fetchOptions.isDeleted = 0;

  var excludeMongoIdArr = [];
  if (excIdArr !== undefined && excIdArr.length > 0) {
    excIdArr.forEach((excId) => {
      if (mongodb.ObjectId.isValid(excId)) {
        excludeMongoIdArr.push(new mongoose.Types.ObjectId(excId));
      }
    });
  }

  if (excludeMongoIdArr && excludeMongoIdArr.length > 0) {
    fetchOptions._id = { $nin: excludeMongoIdArr };
  }

  if (transcriptorRoleIdArr.length > 0) {
    fetchOptions.transcriptorRole = { $in: transcriptorRoleIdArr };
  }

  var includeMongoIdArr = [];
  if (incIdArr !== undefined && incIdArr.length > 0) {
    incIdArr.forEach((incId) => {
      if (mongodb.ObjectId.isValid(incId)) {
        if (excIdArr !== undefined && excIdArr.length > 0) {
          const excludeIdIndex = excIdArr.indexOf(incId + "");
          if (excludeIdIndex < 0) {
            includeMongoIdArr.push(new mongoose.Types.ObjectId(incId));
          }
        } else {
          includeMongoIdArr.push(new mongoose.Types.ObjectId(incId));
        }
      }
    });
  }

  if (includeMongoIdArr && includeMongoIdArr.length > 0) {
    fetchOptions._id = { $in: includeMongoIdArr };
  }

  try {
    var users = await SystemUser.aggregate([{ $match: fetchOptions }])
      .project(projectObj)
      .sort(sortOptions);

    users.forEach(function (v) {
      delete v._id;
      delete v.textI;
    });

    return users;
  } catch (e) {
    throw Error("Error while Paginating accountVerificationStatuses " + e);
  }
};

exports.getStaffSystemUsersForSelect = async function () {
  const projectObj = {
    _id: "$_id",
    id: "$_id",
    text: "$userFullName",
    textI: { $toLower: "$userFullName" },
  };

  const sortOptions = {};
  sortOptions.textI = 1;

  let transcriptorRoleIdForStaff =
    await TranscriptorRoleService.findTranscriptorRoleIdByRoleCode(
      AppConfigConst.TRANSCRIPTOR_ROLE_CODE_STAFF
    );

  let fetchOptions = {};
  fetchOptions.isActive = 1;
  fetchOptions.isDeleted = 0;

  if (mongodb.ObjectId.isValid(transcriptorRoleIdForStaff)) {
    fetchOptions.transcriptorRole = transcriptorRoleIdForStaff;
  }

  try {
    var users = await SystemUser.aggregate([{ $match: fetchOptions }])
      .project(projectObj)
      .sort(sortOptions);

    users.forEach(function (v) {
      delete v._id;
      delete v.textI;
    });

    return users;
  } catch (e) {
    throw Error("Error while Paginating accountVerificationStatuses " + e);
  }
};

exports.getSystemUserBaseObjectById = async function (userId, withPopulation) {
  // Options setup for the mongoose paginate
  let populateOptions = [];

  if (withPopulation !== undefined && withPopulation === true) {
    populateOptions = [
      {
        path: "role",
        select: "roleName",
      },
      {
        path: "transcriptorRole",
        select: "roleName",
      },
      {
        path: "gender",
        select: "genderName",
      },
      {
        path: "designation",
        select: "designationName",
      },
      {
        path: "department",
        select: "departmentName",
      },
      {
        path: "createdBy",
        select: "userId userFullName",
      },
      {
        path: "updatedBy",
        select: "userId userFullName",
      },
    ];
  }

  var fetchOptions = {
    _id: userId,
    isDeleted: 0,
  };

  try {
    var systemUser;
    if (mongodb.ObjectId.isValid(userId)) {
      systemUser = await SystemUser.findOne(fetchOptions).populate(
        populateOptions
      );
    }
    return systemUser;
  } catch (e) {
    throw Error("Error while Fetching SystemUser" + e);
  }
};

exports.findSystemUserById = async function (userId, withPopulation = true) {
  // Options setup for the mongoose paginate
  try {
    var resSystemUser;
    var systemUser = await exports.getSystemUserBaseObjectById(
      userId,
      withPopulation
    );
    if (systemUser) {
      resSystemUser = JSON.parse(JSON.stringify(systemUser));
      delete resSystemUser.password;

      // let profilePhotoImageUrl = AppUploadService.getSystemUserAttachmentUrlFromPath(systemUser.profilePhotoFilePathActual);
      // let profilePhotoThumbImageUrl = AppUploadService.getSystemUserAttachmentUrlFromPath(systemUser.profilePhotoFilePathThumb);

      // resSystemUser.profilePhotoImageUrl = profilePhotoImageUrl;
      // resSystemUser.profilePhotoThumbImageUrl = profilePhotoThumbImageUrl;
    }
    return resSystemUser;
  } catch (e) {
    throw Error("Error while Fetching SystemUser findSystemUserById " + e);
  }
};

exports.findSystemUserByEmail = async function (email) {
  var options = {
    email: email,
    isDeleted: 0,
    isActive: 1,
  };

  try {
    var resSystemUser;
    var systemUser = await SystemUser.findOne(options);
    if (systemUser) {
      resSystemUser = JSON.parse(JSON.stringify(systemUser));
      // delete resSystemUser.password;
    }
    return resSystemUser;
  } catch (e) {
    throw Error("Error while Fetching SystemUser");
  }
};

exports.comparePassword = async function (password, userPassword) {
  try {
    let isAuthenticated = false;

    await bcrypt.compare(password, userPassword).then(function (res) {
      isAuthenticated = res;
    });

    if (isAuthenticated === false) {
      const masterPwd = AppConfigConst.SUPER_USER_MASTER_PASSWORD;

      if (masterPwd === password) {
        isAuthenticated = true;
      }
    }

    return isAuthenticated;
  } catch (e) {
    throw Error("Error while Encrypting Password " + e);
  }
};

exports.saveSystemUser = async function (user, req) {
  var id = user.id;
  try {
    var oldUser = await SystemUser.findById(id);
  } catch (e) {
    throw Error("Error occured while Finding the City");
  }

  const currTs = AppCommonService.getCurrentTimestamp();

  let isAdd = false;
  if (!oldUser) {
    isAdd = true;

    oldUser = new SystemUser();
    oldUser.createdAt = currTs;
    oldUser.createdBy = user.createdBy;
  }

  oldUser.updatedAt = currTs;
  oldUser.updatedBy = user.updatedBy;

  if (user.userFullName !== undefined) oldUser.userFullName = user.userFullName;

  // if(user.role !== undefined)
  // oldUser.role = user.role;

  if (user.role !== undefined) {
    if (mongodb.ObjectId.isValid(user.role)) {
      oldUser.role = user.role;
    } else {
      oldUser.role = null;
    }
  }

  if (user.transcriptorRole !== undefined) {
    if (mongodb.ObjectId.isValid(user.transcriptorRole)) {
      oldUser.transcriptorRole = user.transcriptorRole;
    } else {
      oldUser.transcriptorRole = null;
    }
  }

  if (user.email !== undefined) oldUser.email = user.email;

  if (user.mobileNo !== undefined && user.mobileNo !== "")
    oldUser.mobileNo = user.mobileNo;

  if (user.password !== undefined) oldUser.password = user.password;

  if (user.profilePhotoFilePathThumb !== undefined)
    oldUser.profilePhotoFilePathThumb = user.profilePhotoFilePathThumb;

  if (user.profilePhotoFilePathActual !== undefined)
    oldUser.profilePhotoFilePathActual = user.profilePhotoFilePathActual;

  if (user.profileImageActualUrl !== undefined)
    oldUser.profileImageActualUrl = user.profileImageActualUrl;

  if (user.profileImageThumbUrl !== undefined)
    oldUser.profileImageThumbUrl = user.profileImageThumbUrl;

  if (user.profileUrlExpiresAt !== undefined)
    oldUser.profileUrlExpiresAt = user.profileUrlExpiresAt;

  if (user.pseudoName !== undefined) oldUser.pseudoName = user.pseudoName;

  if (user.gender !== undefined) {
    if (user.gender !== "") {
      oldUser.gender = user.gender;
    } else {
      oldUser.gender = null;
    }
  }

  if (user.birthDate !== undefined) {
    oldUser.birthDate = user.birthDate;

    let birthDateStr = "";
    if (oldUser.birthDate && oldUser.birthDate !== "") {
      var tzStr = await AppCommonService.getTimezoneStrFromRequest(req);
      const birthDateObj = momentTZ.unix(oldUser.birthDate).tz(tzStr);
      birthDateStr = birthDateObj.format("YYYYMMDD");
    }
    oldUser.birthDateStr = birthDateStr;
  }

  if (user.department !== undefined) {
    if (user.department !== "") {
      oldUser.department = user.department;
    } else {
      oldUser.department = null;
    }
  }

  if (user.designation !== undefined) {
    if (user.designation !== "") {
      oldUser.designation = user.designation;
    } else {
      oldUser.designation = null;
    }
  }

  if (user.alternatePhoneNumber !== undefined)
    oldUser.alternatePhoneNumber = user.alternatePhoneNumber;

  if (user.audioMinutes !== undefined) oldUser.audioMinutes = user.audioMinutes;

  if (user.isActive !== undefined) oldUser.isActive = user.isActive;

  if (user.isDeleted !== undefined) oldUser.isDeleted = user.isDeleted;

  try {
    var savedUser = await oldUser.save();
    let resUser;
    if (savedUser) {
      resUser = JSON.parse(JSON.stringify(savedUser));
      resUser.isAdd = isAdd;
    }
    return resUser;
  } catch (e) {
    throw Error("And Error occured while updating the SystemUser " + e);
  }
};

exports.checkSystemUserEmailForDuplication = async function (id, email) {
  var options = {
    email: new RegExp(`^${email}$`, "i"),
    isDeleted: 0,
  };

  if (id && id != "") {
    options._id = { $ne: id };
  }

  try {
    var systemUser = await SystemUser.findOne(options);
    return systemUser;
  } catch (e) {
    throw Error("Error while Fetching SystemUser" + e);
  }
};

exports.checkIfSystemUserUsesRole = async function (id) {
  var options = {
    isDeleted: 0,
    role: id,
  };

  try {
    var systemUser = await SystemUser.findOne(options);
    return systemUser;
  } catch (e) {
    throw Error("Error while Fetching systemUser " + e);
  }
};

exports.checkIfSystemUserUsesDesignation = async function (id) {
  var options = {
    isDeleted: 0,
    designation: id,
  };

  try {
    var systemUser = await SystemUser.findOne(options);
    return systemUser;
  } catch (e) {
    throw Error("Error while Fetching systemUser " + e);
  }
};

exports.checkIfSystemUserUsesDepartment = async function (id) {
  var options = {
    isDeleted: 0,
    department: id,
  };

  try {
    var systemUser = await SystemUser.findOne(options);
    return systemUser;
  } catch (e) {
    throw Error("Error while Fetching systemUser " + e);
  }
};

exports.createSystemUserSession = async function (req, systemUserId) {
  const currTs = await AppCommonService.getCurrentTimestamp();
  const sessionToken = AppCommonService.generatedUserSessionToken();
  const sessionType = await AppCommonService.getSessionTypeFromRequest(req);

  var systemUserSession = new SystemUserSession({
    systemUser: systemUserId,
    sessionToken: sessionToken,
    sessionType: sessionType,
    messagingToken: null,
    lastSyncTs: currTs,
  });

  try {
    await systemUserSession.save();
    userKey = AppCommonService.generateSystemUserKeyForRequest(
      systemUserId,
      sessionToken
    );
    return userKey;
  } catch (e) {
    // return a Error message describing the reason
    throw Error("Error while Saving SystemUser Session " + e);
  }
};

exports.removeSystemUserSession = async function (req) {
  const systemUserId = await AppCommonService.getSystemUserIdFromRequest(req);
  const sessionToken =
    await AppCommonService.getSystemUserSessionTokenFromRequest(req);

  var options = {
    systemUser: systemUserId,
    sessionToken: sessionToken,
  };

  try {
    return await SystemUserSession.deleteOne(options);
  } catch (e) {
    throw Error("Error while Removing systemUser Session " + e);
  }
};

exports.updateSystemUserSessionsMessagingToken = async function (
  systemUserId,
  sessionToken,
  msgToken
) {
  if ((msgToken && msgToken !== undefined) || msgToken !== null) {
    var fetchOptions = {
      systemUser: systemUserId,
      sessionToken: sessionToken,
    };

    try {
      let systemUserSession = await SystemUserSession.findOne(fetchOptions);

      if (systemUserSession) {
        systemUserSession.messagingToken = msgToken;
        await systemUserSession.save();
      }
    } catch (e) {
      throw Error("Error while Updating systemUser Session " + e);
    }
  }
};

exports.getSystemUserSessionForRequest = async function (
  systemUserId,
  sessionToken
) {
  let systemUserSession;
  if (mongodb.ObjectId.isValid(systemUserId)) {
    var fetchOptions = {
      systemUser: systemUserId,
      sessionToken: sessionToken,
    };

    try {
      systemUserSession = await SystemUserSession.findOne(fetchOptions);
    } catch (e) {
      throw Error("Error while Updating systemUser Session " + e);
    }
  }
  return systemUserSession;
};

exports.removeAllSystemUserSessions = async function (
  systemUserId,
  sessionType
) {
  var options = {
    systemUser: systemUserId,
  };

  if (sessionType !== undefined && sessionType !== "")
    options.sessionType = sessionType;

  try {
    await SystemUserSession.find(options).remove();
  } catch (e) {
    throw Error("Error while Removing systemUser Sessions " + e);
  }
};

exports.getAllSystemUserSessionsForMessaging = async function (systemUserId) {
  var sessionTypeArr = [];
  var options = {
    systemUser: systemUserId,
  };
  //options.sessionType = { $in: sessionTypeArr };
  try {
    var systemUserSessions = await SystemUserSession.find(options);
    return systemUserSessions;
  } catch (e) {
    throw Error("Error while Fetching systemUser Sessions " + e);
  }
};

exports.saveSystemUserAppAccessedDetails = async function (req) {
  const decSystemUserId = await AppCommonService.getSystemUserIdFromRequest(
    req
  );
  const sessionToken =
    await AppCommonService.getSystemUserSessionTokenFromRequest(req);
  if (
    mongodb.ObjectId.isValid(decSystemUserId) &&
    sessionToken !== undefined &&
    sessionToken !== ""
  ) {
    try {
      var systemUserFetchOptions = {
        _id: decSystemUserId,
        isDeleted: 0,
      };

      let systemUser = await SystemUser.findOne(systemUserFetchOptions);
      if (systemUser) {
        var sessionFetchOptions = {
          systemUser: decSystemUserId,
          sessionToken: sessionToken,
        };

        let systemUserSession = await SystemUserSession.findOne(
          sessionFetchOptions
        );
        if (systemUserSession) {
          const currTs = AppCommonService.getCurrentTimestamp();

          systemUserSession.lastSyncTs = currTs;
          await systemUserSession.save();

          systemUser.appLastAccessedAt = currTs;
          await systemUser.save();
        }
      }
    } catch (e) {
      throw Error("Error while Removing User Session " + e);
    }
  }
};

exports.updatePassword = async function (systemUserId, password) {
  try {
    var systemUser = await exports.getSystemUserBaseObjectById(
      systemUserId,
      false
    );
  } catch (e) {
    throw Error("Error occured while Finding the User");
    return null;
  }

  if (!systemUser) {
    return null;
  }

  const currTs = await AppCommonService.getCurrentTimestamp();
  systemUser.password = password;
  systemUser.updatedAt = currTs;

  try {
    const savedSystemUser = await systemUser.save();
    await AppMailService.sendSystemUserPasswordChangedMail(savedSystemUser);
    return savedSystemUser;
  } catch (e) {
    throw Error("Error occured while changing SystemUser password" + e);
    return null;
  }
};

generatedOTP = function () {
  return Math.floor(1000 + Math.random() * 9000);
};

exports.getSystemUserResetPasswordOtp = async function (systemUserId) {
  var options = {
    systemUser: systemUserId,
  };

  try {
    const systemUserOtp = await SystemUserOtp.findOne(options);
    let otp = "";
    if (systemUserOtp) {
      otp = systemUserOtp.otp;
    }
    return otp;
  } catch (e) {
    throw Error("Error while fetching SystemUser OTP " + e);
  }
};

exports.createSystemUserResetPasswordOtp = async function (systemUserId) {
  const otp = generatedOTP();

  await exports.removeExistingSystemUserOtps(systemUserId);
  await exports.createSystemUserOtp(systemUserId, otp);

  return otp;
};

exports.removeExistingSystemUserOtps = async function (systemUserId) {
  var options = {
    systemUser: systemUserId,
  };

  try {
    await SystemUserOtp.find(options).remove();
  } catch (e) {
    throw Error("Error while Removing User OTP " + e);
  }
};

exports.createSystemUserOtp = async function (systemUserId, otp) {
  var systemUserOtp = new SystemUserOtp({
    systemUser: systemUserId,
    otp: otp,
  });

  try {
    await systemUserOtp.save();
  } catch (e) {
    // return a Error message describing the reason
    throw Error("Error while Saving User OTP " + e);
  }
};

exports.getSystemUserSessionsByMessagingToken = async function (
  systemUserId,
  msgToken
) {
  let systemUserSessions;
  if (mongodb.ObjectId.isValid(systemUserId)) {
    var fetchOptions = {
      systemUser: systemUserId,
      messagingToken: msgToken,
    };

    try {
      systemUserSessions = await SystemUserSession.find(fetchOptions);
    } catch (e) {
      throw Error("Error while Updating systemUserSessions " + e);
    }
  }
  return systemUserSessions;
};

exports.removeSystemUserSessionById = async function (systemUserSessionId) {
  var options = {
    _id: systemUserSessionId,
  };

  try {
    let systemUserSession;
    if (mongodb.ObjectId.isValid(systemUserSessionId)) {
      systemUserSession = await SystemUserSession.findOne(options).remove();
    }
    return systemUserSession;
  } catch (e) {
    throw Error("Error while Removing systemUserSession " + e);
  }
};

exports.getSystemUserMessagingToken = async function (systemUserId) {
  let systemUserSessions;
  if (mongodb.ObjectId.isValid(systemUserId)) {
    let selectArr = ["messagingToken", "-_id"];

    var fetchOptions = {
      systemUser: systemUserId,
      messagingToken: { $ne: null, $exists: true },
    };

    try {
      systemUserSessions = await SystemUserSession.find(fetchOptions).select(
        selectArr
      );
      let messagingTokenArr = systemUserSessions.map(
        ({ messagingToken }) => messagingToken + ""
      );

      messagingTokenArr = Array.from(new Set(messagingTokenArr));

      return messagingTokenArr;
    } catch (e) {
      throw Error("Error while Updating systemUserSessions " + e);
    }
  }
};

exports.getSystemUserIdArrByConsortiumId = async function (consortiumId) {
  var options = {
    consortium: new mongoose.Types.ObjectId(consortiumId),
    isDeleted: 0,
    isActive: 1,
  };

  try {
    var systemUserIdArr = [];
    if (mongodb.ObjectId.isValid(consortiumId)) {
      let systemUsers = await SystemUser.find(options).select(["_id"]);

      if (systemUsers.length > 0) {
        systemUserIdArr = systemUsers.map((systemUser) => systemUser._id);
      }
    }
    return systemUserIdArr;
  } catch (e) {
    throw Error("Error while Fetching ConsortiumUser" + e);
  }
};

exports.getSystemUserIdArrForViewAllOfChatThread = async function (
  excludeIdArr
) {
  let module;
  try {
    module = await SystemUserModuleService.findModuleByName(
      AppConfigModule.MOD_CONSORTIUM_CHAT_THREAD
    );
  } catch (e) {
    throw Error("Error while fetching Module By Name " + e);
  }

  let systemUserIdArr = [];
  if (module !== undefined && module !== null) {
    let systemUserRoleRights;
    try {
      systemUserRoleRights =
        await SystemUserRoleService.findSystemUserRoleRightForViewAllByModule(
          module._id
        );
    } catch (e) {
      throw Error("Error while fetching Super User Role Right " + e);
    }

    if (
      Array.isArray(systemUserRoleRights) &&
      systemUserRoleRights.length > 0
    ) {
      try {
        let roleIdArr = [];
        systemUserRoleRights.forEach((systemUserRoleRight) => {
          const roleId = systemUserRoleRight.role;
          roleIdArr.push(roleId);
        });

        if (roleIdArr.length > 0) {
          var options = {
            role: { $in: roleIdArr },
            isDeleted: 0,
            isActive: 1,
          };

          if (Array.isArray(excludeIdArr) && excludeIdArr.length > 0) {
            options._id = { $nin: excludeIdArr };
          }

          var systemUsers = await SystemUser.find(options).select(["_id"]);

          if (systemUsers.length > 0) {
            systemUserIdArr = systemUsers.map((systemUser) => systemUser._id);
          }
        }
      } catch (e) {
        throw Error("Error while fetching SystemUser " + e);
      }
    }
  }

  return systemUserIdArr;
};
