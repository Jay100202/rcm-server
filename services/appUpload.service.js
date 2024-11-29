var AppConfig = require("../appconfig");
var AppConfigPrefix = require("../appconfig-prefix");
var AppConfigUploads = require("../appconfig-uploads");
var AppConfigUploadsModule = require("../appconfig-uploads-module");
var AppScheduledJobsService = require("./appScheduledJobs.service");
var ConsortiumService = require("../services/consortium.service");
const fs = require("fs");
const sharp = require("sharp");
var aws = require("aws-sdk");
const s3Storage = require("multer-sharp-s3");
var multer = require("multer");
var AppCommonService = require("./appcommon.service");
var mime = require("mime-types");
var moment = require("moment");
const ffmpeg = require("fluent-ffmpeg");

const s3 = new aws.S3({
  region: AppConfigUploads.DO_SPACES_REGION_NAME,
  // endpoint: AppConfigUploads.DO_SPACES_ENDPOINT,
  accessKeyId: AppConfigUploads.DO_SPACES_ACCESS_KEY,
  secretAccessKey: AppConfigUploads.DO_SPACES_SECRET_KEY,
  // s3ForcePathStyle: true
});

// Saving the context of this module inside the _the variable
_this = this;

exports.getS3EndPoint = function () {
  return s3;
};

exports.getMulterForSystemPreliminaryAudioAttachmentUpload = function () {
  var consideredBaseFolder =
    AppConfigUploads.STORAGE_MULTER_UPLOAD_PATH_SYSTEM_PRELIMINARY_ATTACHMENT;
  var consideredBaseFolderWithBucket =
    AppConfigUploads.DO_SPACES_BUCKET + "/" + consideredBaseFolder;

  const sysPreliminaryAttachmentImageS3UploadMulter = multer({
    storage: s3Storage({
      s3: s3,
      Bucket: consideredBaseFolderWithBucket, //AppConfigUploads.DO_SPACES_BUCKET,
      ACL: AppConfigUploads.DO_SPACES_ACL,
      Key: async function (req, file, cb) {
        let originalFileName = file.originalname;
        let compFileName = "";
        let error = null;

        var consideredMimeTypeMap =
          AppConfigUploads.MIME_TYPE_MAP_PRELIMINARY_AUDIO_ATTACHMENT;
        // var consideredBaseFolder = exports.getSystemPreliminaryAttachmentFolderBasePath();
        var newFileName = exports.generateRandomFileName(originalFileName);

        error = new Error("Invalid MIME Type");

        var isFileTypeImage =
          AppCommonService.checkIfFileIsTypeImageFromFileName(originalFileName);
        if (isFileTypeImage === false) {
          newFileName =
            AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL +
            "/" +
            newFileName;
        }

        if (consideredMimeTypeMap) {
          const ext = consideredMimeTypeMap[file.mimetype];
          const isValid = consideredMimeTypeMap[file.mimetype];
          if (isValid) error = null;
          // compFileName = consideredBaseFolder + newFileName;
          compFileName = newFileName;
        }

        cb(error, compFileName);
      },
      multiple: true,
      resize: [
        {
          suffix: AppConfigUploads.STORAGE_UPLOADS_SUFFIX_THUMB,
          directory: AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB,
          width: AppConfigUploads.IMAGE_SIZE_WIDTH_THUMB,
          height: null,
        },
        {
          suffix: AppConfigUploads.STORAGE_UPLOADS_SUFFIX_ACTUAL,
          directory: AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL,
        },
      ],
    }),
  });

  return sysPreliminaryAttachmentImageS3UploadMulter;
};

exports.getMulterForSystemPreliminaryAttachmentUpload = function () {
  var consideredBaseFolder =
    AppConfigUploads.STORAGE_MULTER_UPLOAD_PATH_SYSTEM_PRELIMINARY_ATTACHMENT;
  var consideredBaseFolderWithBucket =
    AppConfigUploads.DO_SPACES_BUCKET + "/" + consideredBaseFolder;

  const sysPreliminaryAttachmentImageS3UploadMulter = multer({
    storage: s3Storage({
      s3: s3,
      Bucket: consideredBaseFolderWithBucket, //AppConfigUploads.DO_SPACES_BUCKET,
      ACL: AppConfigUploads.DO_SPACES_ACL,
      Key: async function (req, file, cb) {
        let originalFileName = file.originalname;
        let compFileName = "";
        let error = null;

        var consideredMimeTypeMap =
          AppConfigUploads.MIME_TYPE_MAP_PRELIMINARY_ATTACHMENT;
        // var consideredBaseFolder = exports.getSystemPreliminaryAttachmentFolderBasePath();
        var newFileName = exports.generateRandomFileName(originalFileName);

        var isFileTypeImage =
          AppCommonService.checkIfFileIsTypeImageFromFileName(originalFileName);
        if (isFileTypeImage === false) {
          newFileName =
            AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL +
            "/" +
            newFileName;
        }

        error = new Error("Invalid MIME Type");

        if (consideredMimeTypeMap) {
          const ext = consideredMimeTypeMap[file.mimetype];
          const isValid = consideredMimeTypeMap[file.mimetype];
          if (isValid) error = null;
          // compFileName = consideredBaseFolder + newFileName;
          compFileName = newFileName;
        }

        cb(error, compFileName);
      },
      multiple: true,
      resize: [
        {
          suffix: AppConfigUploads.STORAGE_UPLOADS_SUFFIX_THUMB,
          directory: AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB,
          width: AppConfigUploads.IMAGE_SIZE_WIDTH_THUMB,
          height: null,
        },
        {
          suffix: AppConfigUploads.STORAGE_UPLOADS_SUFFIX_ACTUAL,
          directory: AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL,
        },
      ],
    }),
  });

  return sysPreliminaryAttachmentImageS3UploadMulter;
};

exports.getMulterForConsortiumPreliminaryAttachmentUpload = function () {
  const consortiumPreliminaryAttachmentImageS3UploadMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: AppConfigUploads.FILE_UPLOAD_LIMIT_MB * 1024 * 1024, // limit file size to 5MB
    },
  });

  return consortiumPreliminaryAttachmentImageS3UploadMulter;
};

exports.performConsortiumPreliminaryAttachmentFileUpload = async function (
  req
) {
  var uplAttachment;
  if (req && req.file) {
    let originalFileName = req.file.originalname;
    let originalFileMimetype = req.file.mimetype;
    var consideredMimeTypeMap =
      AppConfigUploads.MIME_TYPE_MAP_PRELIMINARY_ATTACHMENT;

    console.log(
      "performConsortiumPreliminaryAttachmentFileUpload : originalFileName : ",
      originalFileName
    );
    console.log(
      "performConsortiumPreliminaryAttachmentFileUpload : originalFileMimetype : ",
      originalFileMimetype
    );
    console.log(
      "performConsortiumPreliminaryAttachmentFileUpload : consideredMimeTypeMap : ",
      consideredMimeTypeMap
    );

    const isValidFileType = consideredMimeTypeMap[originalFileMimetype];
    console.log(
      "performConsortiumPreliminaryAttachmentFileUpload : isValidFileType : ",
      isValidFileType
    );
    if (isValidFileType) {
      var isConsortiumUserRequest =
        AppCommonService.getIsRequestFromConsortiumUser(req);
      console.log(
        "performConsortiumPreliminaryAttachmentFileUpload : isConsortiumUserRequest : ",
        isConsortiumUserRequest
      );

      if (isConsortiumUserRequest === true) {
        let sessConsortium = await AppCommonService.getConsortiumFromRequest(
          req
        );
        console.log(
          "performConsortiumPreliminaryAttachmentFileUpload : sessConsortium : ",
          sessConsortium
        );

        if (sessConsortium) {
          const sessConsortiumId = sessConsortium._id;

          let consortiumBasePath =
            exports.getConsortiumAssetsFolderBasePath(sessConsortium);
          var consideredBaseFolder =
            consortiumBasePath +
            AppConfigUploads.STORAGE_MULTER_UPLOAD_PATH_CONSORTIUM_PRELIMINARY_ATTACHMENT;
          var consideredBaseFolderWithBucket =
            AppConfigUploads.DO_SPACES_BUCKET + "/" + consideredBaseFolder;
          console.log(
            "performConsortiumPreliminaryAttachmentFileUpload : consideredBaseFolderWithBucket : ",
            consideredBaseFolderWithBucket
          );

          var newFileName = exports.generateRandomFileName(originalFileName);

          const newFileNameWithBaseFolder =
            AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL +
            "/" +
            newFileName;

          console.error(
            "performConsortiumPreliminaryAttachmentFileUpload : newFileNameWithBaseFolder : ",
            newFileNameWithBaseFolder
          );

          const orgFileBuffer = req.file.buffer;

          const uploadParams = {
            Bucket: consideredBaseFolderWithBucket,
            ACL: AppConfigUploads.DO_SPACES_ACL,
            Key: newFileNameWithBaseFolder,
            Body: orgFileBuffer,
          };

          fileUploadSuccessful = await exports.performAssetFileUpload(
            uploadParams
          );

          if (fileUploadSuccessful) {
            var isFileTypeImage =
              AppCommonService.checkIfFileIsTypeImageFromFileName(
                originalFileName
              );
            if (isFileTypeImage === true) {
              const imageHeightThumb = AppConfigUploads.IMAGE_SIZE_HEIGHT_THUMB;
              const imageWidthThumb = AppConfigUploads.IMAGE_SIZE_WIDTH_THUMB;

              const thumbImageBuffer =
                await exports.performAssetFileThumbnailGeneration(
                  orgFileBuffer,
                  imageWidthThumb,
                  imageHeightThumb
                );

              const newThumbFileNameWithBaseFolder =
                AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB +
                "/" +
                newFileName;

              const thumbUploadParams = {
                Bucket: consideredBaseFolderWithBucket,
                ACL: AppConfigUploads.DO_SPACES_ACL_PUBLIC,
                Key: newThumbFileNameWithBaseFolder,
                Body: thumbImageBuffer,
              };

              const thumbFileUploadSuccessful =
                await exports.performAssetFileUpload(thumbUploadParams);
            }

            let originalFileSize = req.file.size;
            let attImageUrlActual = "",
              attImageUrlThumb = "",
              attFileUrl = "";
            let attImageUrlExpiresAt =
              exports.getCloudS3SignedFileExpiresAtTimestamp();

            if (isFileTypeImage === true) {
              attImageUrlActual =
                await exports.getRelevantModuleActualImageSignedFileUrlFromPath(
                  AppConfigUploadsModule.MOD_CONSORTIUM_PRELIMINARY_ATTACHMENT,
                  newFileName,
                  sessConsortium
                );
              attImageUrlThumb =
                await exports.getRelevantModuleThumbImageSignedFileUrlFromPath(
                  AppConfigUploadsModule.MOD_CONSORTIUM_PRELIMINARY_ATTACHMENT,
                  newFileName,
                  sessConsortium
                );
            } else {
              attFileUrl =
                await exports.getRelevantModuleBaseFileSignedFileUrlFromPath(
                  AppConfigUploadsModule.MOD_CONSORTIUM_PRELIMINARY_ATTACHMENT,
                  newFileName,
                  sessConsortium
                );
            }

            uplAttachment = {
              consortium: sessConsortiumId,
              attFilePath: isFileTypeImage === false ? newFileName : "",
              attImagePathActual: isFileTypeImage === true ? newFileName : "",
              attImagePathThumb: isFileTypeImage === true ? newFileName : "",
              attFileName: originalFileName,
              isImage: isFileTypeImage,
              attFileSizeBytes: originalFileSize,
              attFileUrl: attFileUrl,
              attImageActualUrl: attImageUrlActual,
              attImageThumbUrl: attImageUrlThumb,
              attFileUrlExpiresAt: attImageUrlExpiresAt,
            };
          }
        }
      }
    }
  }
  return uplAttachment;
};

exports.performConsortiumPreliminaryAttachmentAudioFileUpload = async function (
  req
) {
  var uplAttachment;
  if (req && req.file) {
    let originalFileName = req.file.originalname;
    let originalFileMimetype = req.file.mimetype;
    var consideredMimeTypeMap =
      AppConfigUploads.MIME_TYPE_MAP_PRELIMINARY_AUDIO_ATTACHMENT;

    console.log(
      "performConsortiumPreliminaryAttachmentAudioFileUpload : originalFileName : ",
      originalFileName
    );
    console.log(
      "performConsortiumPreliminaryAttachmentAudioFileUpload : originalFileMimetype : ",
      originalFileMimetype
    );
    console.log(
      "performConsortiumPreliminaryAttachmentAudioFileUpload : consideredMimeTypeMap : ",
      consideredMimeTypeMap
    );

    const isValidFileType = consideredMimeTypeMap[originalFileMimetype];
    console.log(
      "performConsortiumPreliminaryAttachmentAudioFileUpload : isValidFileType : ",
      isValidFileType
    );
    if (isValidFileType) {
      var isConsortiumUserRequest =
        AppCommonService.getIsRequestFromConsortiumUser(req);
      console.log(
        "performConsortiumPreliminaryAttachmentAudioFileUpload : isConsortiumUserRequest : ",
        isConsortiumUserRequest
      );

      if (isConsortiumUserRequest === true) {
        let sessConsortium = await AppCommonService.getConsortiumFromRequest(
          req
        );
        console.log(
          "performConsortiumPreliminaryAttachmentAudioFileUpload : sessConsortium : ",
          sessConsortium
        );

        if (sessConsortium) {
          const sessConsortiumId = sessConsortium._id;

          let consortiumBasePath =
            exports.getConsortiumAssetsFolderBasePath(sessConsortium);
          var consideredBaseFolder =
            consortiumBasePath +
            AppConfigUploads.STORAGE_MULTER_UPLOAD_PATH_CONSORTIUM_PRELIMINARY_ATTACHMENT;
          var consideredBaseFolderWithBucket =
            AppConfigUploads.DO_SPACES_BUCKET + "/" + consideredBaseFolder;
          console.log(
            "performConsortiumPreliminaryAttachmentAudioFileUpload : consideredBaseFolderWithBucket : ",
            consideredBaseFolderWithBucket
          );

          var newFileName = exports.generateRandomFileName(originalFileName);

          const newFileNameWithBaseFolder =
            AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL +
            "/" +
            newFileName;

          console.error(
            "performConsortiumPreliminaryAttachmentFileUpload : newFileNameWithBaseFolder : ",
            newFileNameWithBaseFolder
          );

          const orgFileBuffer = req.file.buffer;

          const uploadParams = {
            Bucket: consideredBaseFolderWithBucket,
            ACL: AppConfigUploads.DO_SPACES_ACL,
            Key: newFileNameWithBaseFolder,
            Body: orgFileBuffer,
          };

          fileUploadSuccessful = await exports.performAssetFileUpload(
            uploadParams
          );
          var isFileTypeImage = false;

          if (fileUploadSuccessful) {
            let originalFileSize = req.file.size;
            let attImageUrlActual = "",
              attImageUrlThumb = "";
            let attImageUrlExpiresAt =
              exports.getCloudS3SignedFileExpiresAtTimestamp();

            let attFileUrl =
              await exports.getRelevantModuleBaseFileSignedFileUrlFromPath(
                AppConfigUploadsModule.MOD_CONSORTIUM_PRELIMINARY_ATTACHMENT,
                newFileName,
                sessConsortium
              );

            let attDurationInSeconds =
              await exports.getAudioDurationUsingFluent(attFileUrl);

            uplAttachment = {
              consortium: sessConsortiumId,
              attFilePath: isFileTypeImage === false ? newFileName : "",
              attImagePathActual: isFileTypeImage === true ? newFileName : "",
              attImagePathThumb: isFileTypeImage === true ? newFileName : "",
              attFileName: originalFileName,
              isImage: isFileTypeImage,
              attFileSizeBytes: originalFileSize,
              attFileUrl: attFileUrl,
              attImageActualUrl: attImageUrlActual,
              attImageThumbUrl: attImageUrlThumb,
              attFileUrlExpiresAt: attImageUrlExpiresAt,
              attDurationInSeconds: attDurationInSeconds,
              isAudio: true,
            };
          }
        }
      }
    }
  }
  return uplAttachment;
};

exports.performAssetFileUpload = async function (uploadParams) {
  try {
    return new Promise((resolve, reject) => {
      var fileUploadSuccessful = false;
      s3.upload(uploadParams, (err, data) => {
        if (err) {
          console.error(
            "performConsortiumPreliminaryAttachmentFileUpload : File upload failed : ",
            err
          );
        } else {
          fileUploadSuccessful = true;
          console.error(
            "performConsortiumPreliminaryAttachmentFileUpload : File uploaded successfully : ",
            data
          );
        }

        resolve(fileUploadSuccessful);
      });
    });
  } catch (e) {
    console.log("Error while removing AssetFile " + e);
  }
};

exports.performAssetFileThumbnailGeneration = async function (
  buffer,
  width,
  height
) {
  try {
    return sharp(buffer).resize(width, height).toBuffer();
  } catch (e) {
    console.log("Error while removing AssetFile " + e);
  }
};

exports.getCloudS3SignedFileExpiresAtTimestamp = function () {
  var expiryTimeInSec = exports.getCloudS3SignedFileExpiryTimeInSeconds();
  expiryTimeInSec -= 60 * 1; // Decreasing by 1 min
  var expiryTs = moment().add(expiryTimeInSec, "seconds").unix();
  return expiryTs;
};

exports.getCloudS3SignedFileExpiryTimeInSeconds = function () {
  const expiryTimeInSec =
    60 * AppConfigUploads.STORAGE_UPLOADS_SIGNED_URL_ACCESSIBILITY_FOR_MINUTES;
  return expiryTimeInSec;
};

exports.updateAssetFileACLToPublicReadable = async function (cloudFileKey) {
  var aclParam = {
    Bucket: AppConfigUploads.DO_SPACES_BUCKET,
    Key: cloudFileKey,
    ACL: "public-read",
  };
  // console.log('updateAssetFileACLToPublicReadable : aclParam : ', aclParam);

  try {
    return new Promise((resolve, reject) => {
      let actionPerformed = false;
      s3.putObjectAcl(aclParam, function (err, data) {
        if (err) {
          console.log("PutBucketAcl : ERROR : ", err);
        } else {
          actionPerformed = true;
          // console.log('PutBucketAcl : SUCCESS : ', data);
        }

        resolve(actionPerformed);
      });
    });
  } catch (e) {
    console.log("Error while PutBucketAcl AssetFile " + e);
  }
};

exports.getSystemPreliminaryAttachmentFolderBaseUrl = function () {
  let folBaseUrl = AppConfigUploads.STORAGE_URL_SYSTEM_PRELIMINARY_ATTACHMENT;
  return folBaseUrl;
};

exports.getSystemPreliminaryAttachmentFolderBasePath = function () {
  let folBasePath = AppConfigUploads.STORAGE_PATH_SYSTEM_PRELIMINARY_ATTACHMENT;
  return folBasePath;
};

exports.removeSystemPreliminaryAttachment = async function (isImage, filename) {
  if (filename && filename !== "") {
    if (isImage === true) {
      const baseFilePrefix =
        exports.getSystemPreliminaryAttachmentFolderBasePath() + "/";
      await exports.removeRelevantScaledImages(baseFilePrefix, filename);
    } else {
      const actualFilePath =
        exports.getSystemPreliminaryAttachmentFolderBasePath() + "/" + filename;
      await exports.removeAssetFile(actualFilePath);
    }
  }
};

exports.removeRelevantScaledImages = async function (baseFilePrefix, filename) {
  if (baseFilePrefix && baseFilePrefix !== "") {
    const actualImagePath =
      baseFilePrefix +
      filename +
      AppConfigUploads.STORAGE_UPLOADS_SUFFIX_ACTUAL_W_SEPARATOR;
    await exports.removeAssetFile(actualImagePath);

    const thumbImagePath =
      baseFilePrefix +
      filename +
      AppConfigUploads.STORAGE_UPLOADS_SUFFIX_THUMB_W_SEPARATOR;
    await exports.removeAssetFile(thumbImagePath);
  }
};

exports.removeAssetFile = async function (actualFilePath) {
  var deleteParam = {
    Bucket: AppConfigUploads.DO_SPACES_BUCKET,
    // ACL: AppConfigUploads.DO_SPACES_ACL,
    Delete: {
      Objects: [
        {
          Key: AppConfigUploads.DO_SPACES_BUCKET + "/" + actualFilePath,
        },
      ],
    },
  };

  try {
    var deleteOperationSuccessful = false;
    return new Promise((resolve, reject) => {
      s3.deleteObjects(deleteParam, function (err, data) {
        if (err) {
          resolve(deleteOperationSuccessful);
        } else {
          deleteOperationSuccessful = true;
          resolve(deleteOperationSuccessful);
        }
      });
    });
  } catch (e) {
    console.log("Error while removing AssetFile " + e);
  }
};

exports.generateRandomFileName = function (actFileName) {
  let compFileName = "";
  if (actFileName !== undefined && actFileName !== "") {
    const ext = AppCommonService.getFileExtensionFromFileName(actFileName);
    compFileName = Date.now() + "." + ext;
  }
  return compFileName;
};

exports.moveSystemPreliminaryAttachmentToRelevantFolder = async function (
  moveToBaseFolder,
  preliminaryAttachment
) {
  let newFileName = "";
  if (preliminaryAttachment) {
    let isImage = preliminaryAttachment.isImage;
    let attFilePath = preliminaryAttachment.attFilePath;
    let attImagePathActual = preliminaryAttachment.attImagePathActual;
    let attImagePathThumb = preliminaryAttachment.attImagePathThumb;

    const moveFromBaseFolder =
      exports.getSystemPreliminaryAttachmentFolderBasePath();

    if (isImage === true) {
      newFileName = exports.generateRandomFileName(attImagePathActual);

      let compiledUploadedImageFileNamesForNewFile =
        AppCommonService.compileUploadedImageFileNamesFromFileName(newFileName);

      const actualImagePath = moveFromBaseFolder + attImagePathActual;
      const newActualImageFilePath =
        moveToBaseFolder + compiledUploadedImageFileNamesForNewFile.actual;
      await exports.makeAssetFileCopy(
        actualImagePath,
        newActualImageFilePath,
        true
      );

      const thumbImagePath = moveFromBaseFolder + attImagePathThumb;
      const newThumbImageFilePath =
        moveToBaseFolder + compiledUploadedImageFileNamesForNewFile.thumb;
      await exports.makeAssetFileCopy(
        thumbImagePath,
        newThumbImageFilePath,
        true
      );

      // await exports.removeAssetFile(actualImagePath);
      // await exports.removeAssetFile(thumbImagePath);
    } else {
      newFileName = exports.generateRandomFileName(attFilePath);

      const actualFilePath = moveFromBaseFolder + attFilePath;
      const newFilePath = moveToBaseFolder + newFileName;
      await exports.makeAssetFileCopy(actualFilePath, newFilePath, true);

      // await exports.removeAssetFile(actualFilePath);
    }
  }
  return newFileName;
};

exports.makeAssetFileCopy = async function (
  actualFilePath,
  newFilePath,
  removeActualFile = false
) {
  var copyParam = {
    Bucket: AppConfigUploads.DO_SPACES_BUCKET,
    ACL: AppConfigUploads.DO_SPACES_ACL,
    CopySource: AppConfigUploads.DO_SPACES_BUCKET + "/" + actualFilePath,
    Key: newFilePath,
  };

  // console.log('makeAssetFileCopy : actualFilePath : ', actualFilePath, ' : newFilePath : ', newFilePath, ' : removeActualFile : ', removeActualFile);

  try {
    var copyOperationSuccessful = false;
    return new Promise((resolve, reject) => {
      s3.copyObject(copyParam, async function (err, data) {
        if (err) {
          console.log("makeAssetFileCopy : copy error : ", err, err.stack);
          resolve(copyOperationSuccessful);
        } else {
          // console.log('makeAssetFileCopy : copy success : ', data);
          copyOperationSuccessful = true;

          if (removeActualFile !== undefined && removeActualFile === true) {
            // await exports.removeAssetFile(actualFilePath);
          }

          resolve(copyOperationSuccessful);
        }
      });
    });
  } catch (e) {
    console.log("Error while copying AssetFile " + e);
  }
};

exports.getFileContentStringAsBase64FromLocalFilePath = async function (
  localFilePath
) {
  try {
    return new Promise((resolve, reject) => {
      // and passing the path to the file
      const buffer = fs.readFileSync(localFilePath, "base64");

      // use the toString() method to convert
      // Buffer into String
      const fileContent = buffer.toString();
      resolve(fileContent);
    });
  } catch (e) {
    console.log("Error while copying AssetFile " + e);
  }
};

//--------------------------------------------------------Supplier---------------------------------------------------------

exports.moveSystemPreliminaryAttachmentToSupplierAttachment = async function (
  preliminaryAttachment
) {
  const moveToBaseFolder = exports.getSupplierAttachmentFolderBasePath();
  let newFileName =
    await exports.moveSystemPreliminaryAttachmentToRelevantFolder(
      moveToBaseFolder,
      preliminaryAttachment
    );
  return newFileName;
};

exports.getSupplierAttachmentFolderBasePath = function () {
  let folBasePath = AppConfigUploads.STORAGE_PATH_SUPPLIER_ATTACHMENT;
  return folBasePath;
};

exports.removeSupplierAttachment = async function (isImage, filename) {
  if (filename && filename !== "") {
    if (isImage === true) {
      const baseFilePrefix = exports.getSupplierAttachmentFolderBasePath();
      await exports.removeRelevantScaledImages(baseFilePrefix, filename);
    } else {
      const actualFilePath =
        exports.getSupplierAttachmentFolderBasePath() + filename;
      await exports.removeAssetFile(actualFilePath);
    }
  }
};

exports.getSupplierAttachmentFolderBaseUrl = function () {
  let folBaseUrl = AppConfigUploads.STORAGE_URL_SUPPLIER_ATTACHMENT;
  return folBaseUrl;
};

exports.getSupplierAttachmentUrlFromPath = function (filename) {
  let imgUrl = "";
  if (filename && filename != "") {
    imgUrl = AppConfigUploads.STORAGE_URL_SUPPLIER_ATTACHMENT + filename;
  }
  return imgUrl;
};

//--------------------------------------------------------Item---------------------------------------------------------

exports.moveSystemPreliminaryAttachmentToItemAttachment = async function (
  preliminaryAttachment
) {
  const moveToBaseFolder = exports.getItemAttachmentFolderBasePath();
  let newFileName =
    await exports.moveSystemPreliminaryAttachmentToRelevantFolder(
      moveToBaseFolder,
      preliminaryAttachment
    );
  return newFileName;
};

exports.getItemAttachmentFolderBasePath = function () {
  let folBasePath = AppConfigUploads.STORAGE_PATH_ITEM_ATTACHMENT;
  return folBasePath;
};

exports.removeItemAttachment = async function (isImage, filename) {
  if (filename && filename !== "") {
    if (isImage === true) {
      const baseFilePrefix = exports.getItemAttachmentFolderBasePath();
      await exports.removeRelevantScaledImages(baseFilePrefix, filename);
    } else {
      const actualFilePath =
        exports.getItemAttachmentFolderBasePath() + filename;
      await exports.removeAssetFile(actualFilePath);
    }
  }
};

exports.getItemAttachmentFolderBaseUrl = function () {
  let folBaseUrl = AppConfigUploads.STORAGE_URL_ITEM_ATTACHMENT;
  return folBaseUrl;
};

exports.getItemAttachmentUrlFromPath = function (filename) {
  let imgUrl = "";
  if (filename && filename != "") {
    imgUrl = AppConfigUploads.STORAGE_URL_ITEM_ATTACHMENT + filename;
  }
  return imgUrl;
};

//--------------------------------------------------------SystemUser---------------------------------------------------------

exports.moveSystemPreliminaryAttachmentToSystemUserAttachment = async function (
  preliminaryAttachment
) {
  const moveToBaseFolder = exports.getSystemUserAttachmentFolderBasePath();
  let newFileName =
    await exports.moveSystemPreliminaryAttachmentToRelevantFolder(
      moveToBaseFolder,
      preliminaryAttachment
    );
  return newFileName;
};

exports.getSystemUserAttachmentFolderBasePath = function () {
  let folBasePath = AppConfigUploads.STORAGE_PATH_SUPER_USER_ATTACHMENT;
  return folBasePath;
};

exports.removeSystemUserAttachment = async function (isImage, filename) {
  if (filename && filename !== "") {
    if (isImage === true) {
      const baseFilePrefix = exports.getSystemUserAttachmentFolderBasePath();
      await exports.removeRelevantScaledImages(baseFilePrefix, filename);
    } else {
      const actualFilePath =
        exports.getSystemUserAttachmentFolderBasePath() + filename;
      await exports.removeAssetFile(actualFilePath);
    }
  }
};

exports.getSystemUserAttachmentFolderBaseUrl = function () {
  let folBaseUrl = AppConfigUploads.STORAGE_URL_SUPER_USER_ATTACHMENT;
  return folBaseUrl;
};

exports.getSystemUserAttachmentUrlFromPath = function (filename) {
  let imgUrl = "";
  if (filename && filename != "") {
    imgUrl = AppConfigUploads.STORAGE_URL_SUPER_USER_ATTACHMENT + filename;
  }
  return imgUrl;
};

//--------------------------------------------------------------------ConsortiumPreliminaryAttachment------------------------------------------------------------------

exports.moveConsortiumPreliminaryAttachmentToRelevantFolder = async function (
  isConsortiumUserRequest,
  consortium,
  moveToBaseFolder,
  preliminaryAttachment
) {
  let newFileName = "";
  if (preliminaryAttachment) {
    let isImage = preliminaryAttachment.isImage;
    let attFilePath = preliminaryAttachment.attFilePath;
    let attImagePathActual = preliminaryAttachment.attImagePathActual;
    let attImagePathThumb = preliminaryAttachment.attImagePathThumb;

    let moveFromBaseFolder;
    if (isConsortiumUserRequest === true) {
      moveFromBaseFolder =
        exports.getConsortiumPreliminaryAttachmentFolderBasePath(consortium);
    } else {
      moveFromBaseFolder =
        exports.getSystemPreliminaryAttachmentFolderBasePath();
    }

    if (moveFromBaseFolder !== undefined) {
      if (isImage === true) {
        newFileName = exports.generateRandomFileName(attImagePathActual);

        let compiledUploadedImageFileNamesForNewFile =
          AppCommonService.compileUploadedImageFileNamesFromFileName(
            newFileName
          );

        const actualImagePath =
          moveFromBaseFolder +
          AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL +
          "/" +
          attImagePathActual;
        const newActualImageFilePath =
          moveToBaseFolder +
          AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL +
          "/" +
          compiledUploadedImageFileNamesForNewFile.actual;
        await exports.makeAssetFileCopy(
          actualImagePath,
          newActualImageFilePath,
          true
        );

        // const actualImagePath = moveFromBaseFolder + attImagePathActual;
        // const newActualImageFilePath = moveToBaseFolder + compiledUploadedImageFileNamesForNewFile.actual;
        // await exports.makeAssetFileCopy(actualImagePath, newActualImageFilePath, true);

        // const thumbImagePath = moveFromBaseFolder + attImagePathThumb;
        // const newThumbImageFilePath = moveToBaseFolder + compiledUploadedImageFileNamesForNewFile.thumb;
        // await exports.makeAssetFileCopy(thumbImagePath, newThumbImageFilePath, true);

        const thumbImagePath =
          moveFromBaseFolder +
          AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB +
          "/" +
          attImagePathThumb;
        const newThumbImageFilePath =
          moveToBaseFolder +
          AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB +
          "/" +
          compiledUploadedImageFileNamesForNewFile.thumb;
        await exports.makeAssetFileCopy(
          thumbImagePath,
          newThumbImageFilePath,
          true
        );

        await exports.removeAssetFile(actualImagePath);
        await exports.removeAssetFile(thumbImagePath);
      } else {
        newFileName = exports.generateRandomFileName(attFilePath);
        // const actualFilePath = moveFromBaseFolder + attFilePath;
        // const newFilePath = moveToBaseFolder + newFileName;
        // await exports.makeAssetFileCopy(actualFilePath, newFilePath, true);

        const actualFilePath =
          moveFromBaseFolder +
          AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL +
          "/" +
          attFilePath;
        const newFilePath =
          moveToBaseFolder +
          AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL +
          "/" +
          newFileName;
        await exports.makeAssetFileCopy(actualFilePath, newFilePath, true);

        await exports.removeAssetFile(actualFilePath);
      }
    }
  }
  return newFileName;
};

exports.copyConsortiumPatientAppointmentDictationAttachment = async function (
  consortium,
  dictationAttachment
) {
  let newFileName = "";
  if (dictationAttachment && dictationAttachment !== undefined) {
    let isImage = dictationAttachment.isImage;
    let attFilePath = dictationAttachment.attFilePath;
    let attImagePathActual = dictationAttachment.attImagePathActual;
    let attImagePathThumb = dictationAttachment.attImagePathThumb;

    const moveToBaseFolder =
      exports.getConsortiumPatientAppointmentDictationAttachmentFolderBasePath(
        consortium
      );
    const moveFromBaseFolder =
      exports.getConsortiumPatientAppointmentDictationAttachmentFolderBasePath(
        consortium
      );

    if (isImage === true) {
      newFileName = exports.generateRandomFileName(attImagePathActual);

      let compiledUploadedImageFileNamesForNewFile =
        AppCommonService.compileUploadedImageFileNamesFromFileName(newFileName);

      const actualImagePath =
        moveFromBaseFolder +
        AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL +
        "/" +
        attImagePathActual;
      const newActualImageFilePath =
        moveToBaseFolder +
        AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL +
        "/" +
        compiledUploadedImageFileNamesForNewFile.actual;
      await exports.makeAssetFileCopy(
        actualImagePath,
        newActualImageFilePath,
        true
      );

      const thumbImagePath =
        moveFromBaseFolder +
        AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB +
        "/" +
        attImagePathThumb;
      const newThumbImageFilePath =
        moveToBaseFolder +
        AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB +
        "/" +
        compiledUploadedImageFileNamesForNewFile.thumb;
      await exports.makeAssetFileCopy(
        thumbImagePath,
        newThumbImageFilePath,
        true
      );
    } else {
      newFileName = exports.generateRandomFileName(attFilePath);

      const actualFilePath =
        moveFromBaseFolder +
        AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL +
        "/" +
        attFilePath;
      const newFilePath =
        moveToBaseFolder +
        AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL +
        "/" +
        newFileName;
      await exports.makeAssetFileCopy(actualFilePath, newFilePath, true);

      await exports.removeAssetFile(actualFilePath);
    }
  }
  return newFileName;
};

exports.getConsortiumPreliminaryAttachmentFolderBaseUrl = function (
  consortium
) {
  let folBaseUrl;
  let consortiumBaseUrl = exports.getConsortiumAssetsFolderBaseUrl(consortium);
  if (consortiumBaseUrl) {
    folBaseUrl =
      consortiumBaseUrl +
      AppConfigUploads.STORAGE_URL_CONSORTIUM_PRELIMINARY_ATTACHMENT;
  }
  return folBaseUrl;
};

exports.getConsortiumPreliminaryAttachmentFolderBasePath = function (
  consortium
) {
  let folBasePath;
  let consortiumBasePath =
    exports.getConsortiumAssetsFolderBasePath(consortium);
  if (consortiumBasePath) {
    folBasePath =
      consortiumBasePath +
      AppConfigUploads.STORAGE_PATH_CONSORTIUM_PRELIMINARY_ATTACHMENT;
  }
  return folBasePath;
};

exports.removeConsortiumPreliminaryAttachment = async function (
  consortium,
  isImage,
  filename
) {
  if (filename && filename !== "") {
    if (isImage === true) {
      const baseFilePrefix =
        exports.getConsortiumPreliminaryAttachmentFolderBasePath(consortium) +
        "/";
      await exports.removeRelevantScaledImages(baseFilePrefix, filename);
    } else {
      const actualFilePath =
        exports.getConsortiumPreliminaryAttachmentFolderBasePath(consortium) +
        "/" +
        filename;
      await exports.removeAssetFile(actualFilePath);
    }
  }
};

exports.getConsortiumAssetsFolderBaseUrl = function (consortium) {
  let baseUrl;
  if (consortium) {
    var consortiumId = consortium.consortiumId;
    if (
      typeof consortiumId !== "string" ||
      consortiumId.indexOf(AppConfigPrefix.CONSORTIUM) < 0
    ) {
      consortiumId = AppConfigPrefix.CONSORTIUM + consortiumId;
    }
    const compPath = consortiumId;
    baseUrl = AppConfigUploads.STORAGE_URL_CONSORTIUM_ASSETS + compPath + "/";
  }
  return baseUrl;
};

exports.getConsortiumAssetsFolderBasePath = function (consortium) {
  let basePath;
  if (consortium) {
    var consortiumId = consortium.consortiumId;
    if (
      typeof consortiumId !== "string" ||
      consortiumId.indexOf(AppConfigPrefix.CONSORTIUM) < 0
    ) {
      consortiumId = AppConfigPrefix.CONSORTIUM + consortiumId;
    }
    const compPath = consortiumId;
    basePath = AppConfigUploads.STORAGE_PATH_CONSORTIUM_ASSETS + compPath + "/";
  }
  return basePath;
};

//--------------------------------------------------------ConsortiumUser---------------------------------------------------------

exports.moveConsortiumPreliminaryAttachmentToConsortiumUserAttachment =
  async function (isConsortiumUserRequest, consortium, preliminaryAttachment) {
    const moveToBaseFolder =
      exports.getConsortiumUserAttachmentFolderBasePath(consortium);
    let newFileName =
      await exports.moveConsortiumPreliminaryAttachmentToRelevantFolder(
        isConsortiumUserRequest,
        consortium,
        moveToBaseFolder,
        preliminaryAttachment
      );
    return newFileName;
  };

exports.getConsortiumUserAttachmentFolderBasePath = function (consortium) {
  let folBasePath;
  let consortiumBasePath =
    exports.getConsortiumAssetsFolderBasePath(consortium);
  if (consortiumBasePath) {
    folBasePath =
      consortiumBasePath +
      AppConfigUploads.STORAGE_PATH_CONSORTIUM_USER_ATTACHMENT;
  }
  return folBasePath;
};

exports.removeConsortiumUserAttachment = async function (
  consortium,
  isImage,
  filename
) {
  if (filename && filename !== "") {
    if (isImage === true) {
      const baseFilePrefix =
        exports.getConsortiumUserAttachmentFolderBasePath(consortium);
      await exports.removeRelevantScaledImages(baseFilePrefix, filename);
    } else {
      const actualFilePath =
        exports.getConsortiumUserAttachmentFolderBasePath(consortium) +
        filename;
      await exports.removeAssetFile(actualFilePath);
    }
  }
};

exports.getConsortiumUserAttachmentFolderBaseUrl = function (consortium) {
  let folBaseUrl;
  let consortiumBaseUrl = exports.getConsortiumAssetsFolderBaseUrl(consortium);
  if (consortiumBaseUrl) {
    folBaseUrl =
      consortiumBaseUrl +
      AppConfigUploads.STORAGE_URL_CONSORTIUM_USER_ATTACHMENT;
  }
  return folBaseUrl;
};

exports.getConsortiumUserAttachmentUrlFromPath = function (
  consortium,
  filename
) {
  let imgUrl = "";
  if (filename && filename != "") {
    let consortiumBaseUrl =
      exports.getConsortiumUserAttachmentFolderBaseUrl(consortium);

    imgUrl = consortiumBaseUrl + filename;
  }
  return imgUrl;
};

//--------------------------------------------------------ConsortiumPatient---------------------------------------------------------

exports.moveConsortiumPreliminaryAttachmentToConsortiumPatientAttachment =
  async function (isConsortiumUserRequest, consortium, preliminaryAttachment) {
    const moveToBaseFolder =
      exports.getConsortiumPatientAttachmentFolderBasePath(consortium);
    let newFileName =
      await exports.moveConsortiumPreliminaryAttachmentToRelevantFolder(
        isConsortiumUserRequest,
        consortium,
        moveToBaseFolder,
        preliminaryAttachment
      );
    return newFileName;
  };

exports.getConsortiumPatientAttachmentFolderBasePath = function (consortium) {
  let folBasePath;
  let consortiumBasePath =
    exports.getConsortiumAssetsFolderBasePath(consortium);
  if (consortiumBasePath) {
    folBasePath =
      consortiumBasePath +
      AppConfigUploads.STORAGE_PATH_CONSORTIUM_PATIENT_ATTACHMENT;
  }
  return folBasePath;
};

exports.removeConsortiumPatientAttachment = async function (
  consortium,
  isImage,
  filename
) {
  if (filename && filename !== "") {
    if (isImage === true) {
      const baseFilePrefix =
        exports.getConsortiumPatientAttachmentFolderBasePath(consortium);
      await exports.removeRelevantScaledImages(baseFilePrefix, filename);
    } else {
      const actualFilePath =
        exports.getConsortiumPatientAttachmentFolderBasePath(consortium) +
        filename;
      await exports.removeAssetFile(actualFilePath);
    }
  }
};

exports.getConsortiumPatientAttachmentFolderBaseUrl = function (consortium) {
  let folBaseUrl;
  let consortiumBaseUrl = exports.getConsortiumAssetsFolderBaseUrl(consortium);
  if (consortiumBaseUrl) {
    folBaseUrl =
      consortiumBaseUrl +
      AppConfigUploads.STORAGE_URL_CONSORTIUM_PATIENT_ATTACHMENT;
  }
  return folBaseUrl;
};

exports.getConsortiumPatientAttachmentUrlFromPath = function (
  consortium,
  filename
) {
  let imgUrl = "";
  if (filename && filename != "") {
    let consortiumBaseUrl =
      exports.getConsortiumPatientAttachmentFolderBaseUrl(consortium);

    imgUrl = consortiumBaseUrl + filename;
  }
  return imgUrl;
};

//--------------------------------------------------------ConsortiumPatientAppointment---------------------------------------------------------

exports.moveConsortiumPreliminaryAttachmentToConsortiumPatientAppointmentAttachment =
  async function (isConsortiumUserRequest, consortium, preliminaryAttachment) {
    const moveToBaseFolder =
      exports.getConsortiumPatientAppointmentAttachmentFolderBasePath(
        consortium
      );
    let newFileName =
      await exports.moveConsortiumPreliminaryAttachmentToRelevantFolder(
        isConsortiumUserRequest,
        consortium,
        moveToBaseFolder,
        preliminaryAttachment
      );
    return newFileName;
  };

exports.getConsortiumPatientAppointmentAttachmentFolderBasePath = function (
  consortium
) {
  let folBasePath;
  let consortiumBasePath =
    exports.getConsortiumAssetsFolderBasePath(consortium);
  if (consortiumBasePath) {
    folBasePath =
      consortiumBasePath +
      AppConfigUploads.STORAGE_PATH_CONSORTIUM_PATIENT_APPOINTMENT_ATTACHMENT;
  }
  return folBasePath;
};

exports.removeConsortiumPatientAppointmentAttachment = async function (
  consortium,
  isImage,
  filename
) {
  if (filename && filename !== "") {
    if (isImage === true) {
      const baseFilePrefix =
        exports.getConsortiumPatientAppointmentAttachmentFolderBasePath(
          consortium
        );
      await exports.removeRelevantScaledImages(baseFilePrefix, filename);
    } else {
      const actualFilePath =
        exports.getConsortiumPatientAppointmentAttachmentFolderBasePath(
          consortium
        ) + filename;
      await exports.removeAssetFile(actualFilePath);
    }
  }
};

exports.getConsortiumPatientAppointmentAttachmentFolderBaseUrl = function (
  consortium
) {
  let folBaseUrl;
  let consortiumBaseUrl = exports.getConsortiumAssetsFolderBaseUrl(consortium);
  if (consortiumBaseUrl) {
    folBaseUrl =
      consortiumBaseUrl +
      AppConfigUploads.STORAGE_URL_CONSORTIUM_PATIENT_APPOINTMENT_ATTACHMENT;
  }
  return folBaseUrl;
};

exports.getConsortiumPatientAppointmentAttachmentUrlFromPath = function (
  consortium,
  filename
) {
  let imgUrl = "";
  if (filename && filename != "") {
    let consortiumBaseUrl =
      exports.getConsortiumPatientAppointmentAttachmentFolderBaseUrl(
        consortium
      );

    imgUrl = consortiumBaseUrl + filename;
  }
  return imgUrl;
};

//--------------------------------------------------------ConsortiumPatientAppointmentDictation---------------------------------------------------------

exports.moveConsortiumPreliminaryAttachmentToConsortiumPatientAppointmentDictationAttachment =
  async function (isConsortiumUserRequest, consortium, preliminaryAttachment) {
    const moveToBaseFolder =
      exports.getConsortiumPatientAppointmentDictationAttachmentFolderBasePath(
        consortium
      );
    let newFileName =
      await exports.moveConsortiumPreliminaryAttachmentToRelevantFolder(
        isConsortiumUserRequest,
        consortium,
        moveToBaseFolder,
        preliminaryAttachment
      );
    return newFileName;
  };

exports.getConsortiumPatientAppointmentDictationAttachmentFolderBasePath =
  function (consortium) {
    let folBasePath;
    let consortiumBasePath =
      exports.getConsortiumAssetsFolderBasePath(consortium);
    if (consortiumBasePath) {
      folBasePath =
        consortiumBasePath +
        AppConfigUploads.STORAGE_PATH_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT;
    }
    return folBasePath;
  };

exports.removeConsortiumPatientAppointmentDictationAttachment = async function (
  consortium,
  isImage,
  filename
) {
  if (filename && filename !== "") {
    if (isImage === true) {
      const baseFilePrefix =
        exports.getConsortiumPatientAppointmentDictationAttachmentFolderBasePath(
          consortium
        );
      await exports.removeRelevantScaledImages(baseFilePrefix, filename);
    } else {
      const actualFilePath =
        exports.getConsortiumPatientAppointmentDictationAttachmentFolderBasePath(
          consortium
        ) + filename;
      await exports.removeAssetFile(actualFilePath);
    }
  }
};

exports.getConsortiumPatientAppointmentDictationAttachmentFolderBaseUrl =
  function (consortium) {
    let folBaseUrl;
    let consortiumBaseUrl =
      exports.getConsortiumAssetsFolderBaseUrl(consortium);
    if (consortiumBaseUrl) {
      folBaseUrl =
        consortiumBaseUrl +
        AppConfigUploads.STORAGE_URL_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT;
    }
    return folBaseUrl;
  };

exports.getConsortiumPatientAppointmentDictationAttachmentUrlFromPath =
  function (consortium, filename) {
    let imgUrl = "";
    if (filename && filename != "") {
      let consortiumBaseUrl =
        exports.getConsortiumPatientAppointmentDictationAttachmentFolderBaseUrl(
          consortium
        );

      imgUrl = consortiumBaseUrl + filename;
    }
    return imgUrl;
  };

//--------------------------------------------------------ConsortiumPatientAppointmentTranscription---------------------------------------------------------

exports.moveConsortiumPreliminaryAttachmentToConsortiumPatientAppointmentTranscriptionAttachment =
  async function (isConsortiumUserRequest, consortium, preliminaryAttachment) {
    const moveToBaseFolder =
      exports.getConsortiumPatientAppointmentTranscriptionAttachmentFolderBasePath(
        consortium
      );
    let newFileName =
      await exports.moveConsortiumPreliminaryAttachmentToRelevantFolder(
        isConsortiumUserRequest,
        consortium,
        moveToBaseFolder,
        preliminaryAttachment
      );
    return newFileName;
  };

exports.getConsortiumPatientAppointmentTranscriptionAttachmentFolderBasePath =
  function (consortium) {
    let folBasePath;
    let consortiumBasePath =
      exports.getConsortiumAssetsFolderBasePath(consortium);
    if (consortiumBasePath) {
      folBasePath =
        consortiumBasePath +
        AppConfigUploads.STORAGE_PATH_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT;
    }
    return folBasePath;
  };

exports.removeConsortiumPatientAppointmentTranscriptionAttachment =
  async function (consortium, isImage, filename) {
    if (filename && filename !== "") {
      if (isImage === true) {
        const baseFilePrefix =
          exports.getConsortiumPatientAppointmentTranscriptionAttachmentFolderBasePath(
            consortium
          );
        await exports.removeRelevantScaledImages(baseFilePrefix, filename);
      } else {
        const actualFilePath =
          exports.getConsortiumPatientAppointmentTranscriptionAttachmentFolderBasePath(
            consortium
          ) + filename;
        await exports.removeAssetFile(actualFilePath);
      }
    }
  };

exports.getConsortiumPatientAppointmentTranscriptionAttachmentFolderBaseUrl =
  function (consortium) {
    let folBaseUrl;
    let consortiumBaseUrl =
      exports.getConsortiumAssetsFolderBaseUrl(consortium);
    if (consortiumBaseUrl) {
      folBaseUrl =
        consortiumBaseUrl +
        AppConfigUploads.STORAGE_URL_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT;
    }
    return folBaseUrl;
  };

exports.getConsortiumPatientAppointmentTranscriptionAttachmentUrlFromPath =
  function (consortium, filename) {
    let imgUrl = "";
    if (filename && filename != "") {
      let consortiumBaseUrl =
        exports.getConsortiumPatientAppointmentTranscriptionAttachmentFolderBaseUrl(
          consortium
        );

      imgUrl = consortiumBaseUrl + filename;
    }
    return imgUrl;
  };

exports.uploadSystemPreliminaryAudioAttachmentBase64StringToPath =
  async function (base64Str, fileExt, fileContentType) {
    var compFileName = Date.now();
    var compFileNameWithExt = compFileName + "." + fileExt;
    var consideredBaseFolder =
      AppConfigUploads.STORAGE_PATH_SYSTEM_PRELIMINARY_ATTACHMENT;
    consideredBaseFolder +=
      AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL + "/";
    var compFileNameWithBaseFolder = consideredBaseFolder + compFileNameWithExt;

    if (
      compFileNameWithBaseFolder &&
      base64Str !== undefined &&
      base64Str !== ""
    ) {
      var fileContentEncoding = "base64";
      const fileContent = Buffer.from(
        base64Str.replace(/^data:audio\/\w+;base64,/, ""),
        "base64"
      );

      await exports.writeContentToAssetFile(
        compFileNameWithBaseFolder,
        fileContent,
        fileContentEncoding,
        fileContentType
      );
    }

    return compFileNameWithExt;
  };

exports.uploadSystemPreliminaryAttachmentBase64StringToPath = async function (
  base64Str,
  fileExt
) {
  var compFileName = Date.now();
  var compFileNameWithExt = compFileName + "." + fileExt;
  var consideredBaseFolderForActual =
    AppConfigUploads.STORAGE_PATH_SYSTEM_PRELIMINARY_ATTACHMENT;
  consideredBaseFolderForActual +=
    AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL + "/";
  var consideredBaseFolderForThumb =
    AppConfigUploads.STORAGE_PATH_SYSTEM_PRELIMINARY_ATTACHMENT;
  consideredBaseFolderForThumb +=
    AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB + "/";

  const fileMimeType = mime.lookup(fileExt);

  if (
    consideredBaseFolderForActual &&
    consideredBaseFolderForActual !== "" &&
    base64Str !== undefined &&
    base64Str !== ""
  ) {
    var fileContentEncoding = "base64";
    const regex = new RegExp(`^data:${fileMimeType};${fileContentEncoding},`);
    const fileContent = Buffer.from(
      base64Str.replace(regex, ""),
      fileContentEncoding
    );

    let fileIsImage =
      AppCommonService.checkIfFileIsTypeImageFromFileName(compFileNameWithExt);

    if (fileIsImage === true) {
      var compImageFilePath =
        AppCommonService.compileUploadedImageFileNamesFromFileName(uplFilePath);

      if (compImageFilePath) {
        attImagePathActual = compImageFilePath.actual;
        attImagePathThumb = compImageFilePath.thumb;

        var compFileNameWithBaseFolderForActual =
          consideredBaseFolderForActual + attImagePathActual;
        await exports.writeContentToAssetFile(
          compFileNameWithBaseFolderForActual,
          fileContent,
          fileContentEncoding,
          fileMimeType
        );

        var compFileNameWithBaseFolderForThumb =
          consideredBaseFolderForThumb + attImagePathThumb;
        await exports.writeContentToAssetFile(
          compFileNameWithBaseFolderForThumb,
          fileContent,
          fileContentEncoding,
          fileMimeType
        );
      }
    } else {
      var compFileNameWithBaseFolder =
        consideredBaseFolderForActual + compFileNameWithExt;
      await exports.writeContentToAssetFile(
        compFileNameWithBaseFolder,
        fileContent,
        fileContentEncoding,
        fileMimeType
      );
    }
  }

  return compFileNameWithExt;
};

exports.uploadConsortiumPreliminaryAudioAttachmentBase64StringToPath =
  async function (consortium, base64Str, fileExt, fileContentType) {
    let consortiumBasePath =
      exports.getConsortiumPreliminaryAttachmentFolderBasePath(consortium);

    var compFileName = Date.now();
    var compFileNameWithExt = compFileName + "." + fileExt;
    var consideredBaseFolder = consortiumBasePath;
    consideredBaseFolder +=
      AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL + "/";
    var compFileNameWithBaseFolder = consideredBaseFolder + compFileNameWithExt;

    if (
      compFileNameWithBaseFolder &&
      base64Str !== undefined &&
      base64Str !== ""
    ) {
      var fileContentEncoding = "base64";
      const fileContent = Buffer.from(
        base64Str.replace(/^data:audio\/\w+;base64,/, ""),
        "base64"
      );

      await exports.writeContentToAssetFile(
        compFileNameWithBaseFolder,
        fileContent,
        fileContentEncoding,
        fileContentType
      );
    }

    return compFileNameWithExt;
  };

exports.writeContentToAssetFile = async function (
  newFilePath,
  fileContent,
  fileContentEncoding,
  fileContentType
) {
  var uploadParam = {
    Bucket: AppConfigUploads.DO_SPACES_BUCKET,
    ACL: AppConfigUploads.DO_SPACES_ACL,
    Body: fileContent,
    ContentEncoding: fileContentEncoding,
    ContentType: fileContentType,
    Key: newFilePath,
  };

  try {
    let createOperationSuccessful = false;
    return new Promise((resolve, reject) => {
      s3.upload(uploadParam, function (err, data) {
        if (err) {
          console.log("writeContentToAssetFile : error : ", err, err.stack);
          resolve(createOperationSuccessful);
        } else {
          console.log("writeContentToAssetFile : success : ", data);
          createOperationSuccessful = true;
          resolve(createOperationSuccessful);
        }
      });
    });
  } catch (e) {
    console.log("Error while write content to AssetFile " + e);
  }
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

exports.getCloudS3SignedFileUrl = async function (
  fileNameWithPath,
  overrideSignedGeneration = false
) {
  try {
    if (
      fileNameWithPath.includes(
        AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB
      ) &&
      overrideSignedGeneration === false
    ) {
      var fileUrl =
        AppConfigUploads.STORAGE_APP_DOWNLOADS_BASE_URL + fileNameWithPath;
      return fileUrl;
    } else {
      var urlExpiryInSec = exports.getCloudS3SignedFileExpiryTimeInSeconds();
      return new Promise((resolve, reject) => {
        const params = {
          Bucket: AppConfigUploads.DO_SPACES_BUCKET,
          Key: fileNameWithPath,
          Expires: urlExpiryInSec,
        };
        console.log("getCloudS3SignedFileUrl : params : ", params);

        var fileUrl = "";
        s3.getSignedUrl("getObject", params, function (err, data) {
          if (err) {
            console.log("getCloudS3SignedFileUrl : err : ", err);
            resolve(fileUrl);
          } else {
            console.log("getCloudS3SignedFileUrl : data : ", data);
            fileUrl = data;
            resolve(fileUrl);
          }
        });
      });
    }
  } catch (e) {
    console.log("Error while copying AssetFile " + e);
  }
};

exports.getRelevantModuleActualImageSignedFileUrlFromPath = async function (
  moduleCode,
  fileName,
  consortium
) {
  let fileUrl = "";
  if (moduleCode && moduleCode !== undefined && moduleCode !== "") {
    if (
      moduleCode === AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT
    ) {
      fileUrl =
        await exports.getSystemPreliminaryAttachmentActualImageSignedFileUrlFromPath(
          fileName
        );
    } else if (
      moduleCode ===
      AppConfigUploadsModule.MOD_CONSORTIUM_PRELIMINARY_ATTACHMENT
    ) {
      fileUrl =
        await exports.getConsortiumPreliminaryAttachmentActualImageSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (moduleCode === AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT) {
      fileUrl =
        await exports.getConsortiumPatientAttachmentActualImageSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (
      moduleCode === AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT
    ) {
      fileUrl =
        await exports.getConsortiumPatientAppointmentAttachmentActualImageSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (
      moduleCode ===
      AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT
    ) {
      fileUrl =
        await exports.getConsortiumPatientAppointmentDictationAttachmentActualImageSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (
      moduleCode ===
      AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT
    ) {
      fileUrl =
        await exports.getConsortiumPatientAppointmentTranscriptionAttachmentActualImageSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (moduleCode === AppConfigUploadsModule.MOD_SYSTEM_USER) {
      fileUrl = await exports.getSystemUserActualImageSignedFileUrlFromPath(
        fileName
      );
    } else if (moduleCode === AppConfigUploadsModule.MOD_CONSORTIUM_USER) {
      fileUrl =
        await exports.getConsortiumUserAttachmentActualImageSignedFileUrlFromPath(
          fileName,
          consortium
        );
    }
  }
  return fileUrl;
};

exports.getRelevantModuleThumbImageSignedFileUrlFromPath = async function (
  moduleCode,
  fileName,
  consortium
) {
  let fileUrl = "";
  if (moduleCode && moduleCode !== undefined && moduleCode !== "") {
    if (
      moduleCode === AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT
    ) {
      fileUrl =
        await exports.getSystemPreliminaryAttachmentThumbImageSignedFileUrlFromPath(
          fileName
        );
    } else if (
      moduleCode ===
      AppConfigUploadsModule.MOD_CONSORTIUM_PRELIMINARY_ATTACHMENT
    ) {
      fileUrl =
        await exports.getConsortiumPreliminaryAttachmentThumbImageSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (moduleCode === AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT) {
      fileUrl =
        await exports.getConsortiumPatientAttachmentThumbImageSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (
      moduleCode === AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT
    ) {
      fileUrl =
        await exports.getConsortiumPatientAppointmentAttachmentThumbImageSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (
      moduleCode ===
      AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT
    ) {
      fileUrl =
        await exports.getConsortiumPatientAppointmentDictationAttachmentThumbImageSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (
      moduleCode ===
      AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT
    ) {
      fileUrl =
        await exports.getConsortiumPatientAppointmentTranscriptionAttachmentThumbImageSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (moduleCode === AppConfigUploadsModule.MOD_SYSTEM_USER) {
      fileUrl = await exports.getSystemUserThumbImageSignedFileUrlFromPath(
        fileName
      );
    } else if (moduleCode === AppConfigUploadsModule.MOD_CONSORTIUM_USER) {
      fileUrl =
        await exports.getConsortiumUserAttachmentThumbImageSignedFileUrlFromPath(
          fileName,
          consortium
        );
    }
  }
  return fileUrl;
};

exports.getRelevantModuleBaseFileSignedFileUrlFromPath = async function (
  moduleCode,
  fileName,
  consortium
) {
  let fileUrl = "";
  if (moduleCode && moduleCode !== undefined && moduleCode !== "") {
    if (
      moduleCode === AppConfigUploadsModule.MOD_SYSTEM_PRELIMINARY_ATTACHMENT
    ) {
      fileUrl =
        await exports.getSystemPreliminaryAttachmentFileSignedFileUrlFromPath(
          fileName
        );
    } else if (
      moduleCode ===
      AppConfigUploadsModule.MOD_CONSORTIUM_PRELIMINARY_ATTACHMENT
    ) {
      fileUrl =
        await exports.getConsortiumPreliminaryAttachmentFileSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (moduleCode === AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT) {
      fileUrl =
        await exports.getConsortiumPatientAttachmentFileSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (
      moduleCode === AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT
    ) {
      fileUrl =
        await exports.getConsortiumPatientAppointmentAttachmentFileSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (
      moduleCode ===
      AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT
    ) {
      fileUrl =
        await exports.getConsortiumPatientAppointmentDictationAttachmentFileSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (
      moduleCode ===
      AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT
    ) {
      fileUrl =
        await exports.getConsortiumPatientAppointmentTranscriptionAttachmentFileSignedFileUrlFromPath(
          fileName,
          consortium
        );
    } else if (moduleCode === AppConfigUploadsModule.MOD_CONSORTIUM_USER) {
      fileUrl =
        await exports.getConsortiumUserAttachmentFileSignedFileUrlFromPath(
          fileName,
          consortium
        );
    }
  }
  return fileUrl;
};

//-----------------------------------------------------------------------------------------------------------------------

exports.getSystemPreliminaryAttachmentFileSignedFileUrlFromPath =
  async function (fileName) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getSystemPreliminaryAttachmentFolderBasePath();
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getSystemPreliminaryAttachmentActualImageSignedFileUrlFromPath =
  async function (fileName) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getSystemPreliminaryAttachmentFolderBasePath();
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getSystemPreliminaryAttachmentThumbImageSignedFileUrlFromPath =
  async function (fileName) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getSystemPreliminaryAttachmentFolderBasePath();
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPreliminaryAttachmentFileSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPreliminaryAttachmentFolderBasePath(consortium);
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPreliminaryAttachmentActualImageSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPreliminaryAttachmentFolderBasePath(consortium);
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPreliminaryAttachmentThumbImageSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPreliminaryAttachmentFolderBasePath(consortium);
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPatientAttachmentFileSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPatientAttachmentFolderBasePath(consortium);
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPatientAttachmentActualImageSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPatientAttachmentFolderBasePath(consortium);
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPatientAttachmentThumbImageSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPatientAttachmentFolderBasePath(consortium);
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPatientAppointmentAttachmentFileSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPatientAppointmentAttachmentFolderBasePath(
          consortium
        );
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPatientAppointmentAttachmentActualImageSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPatientAppointmentAttachmentFolderBasePath(
          consortium
        );
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPatientAppointmentAttachmentThumbImageSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPatientAppointmentAttachmentFolderBasePath(
          consortium
        );
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      console.log("fileNameWithPath : ", fileNameWithPath);
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
      console.log("fileUrl : ", fileUrl);
    }
    return fileUrl;
  };

exports.getConsortiumPatientAppointmentDictationAttachmentFileSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPatientAppointmentDictationAttachmentFolderBasePath(
          consortium
        );
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPatientAppointmentDictationAttachmentActualImageSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPatientAppointmentDictationAttachmentFolderBasePath(
          consortium
        );
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPatientAppointmentDictationAttachmentThumbImageSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPatientAppointmentDictationAttachmentFolderBasePath(
          consortium
        );
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPatientAppointmentTranscriptionAttachmentFileSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPatientAppointmentTranscriptionAttachmentFolderBasePath(
          consortium
        );
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPatientAppointmentTranscriptionAttachmentActualImageSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPatientAppointmentTranscriptionAttachmentFolderBasePath(
          consortium
        );
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumPatientAppointmentTranscriptionAttachmentThumbImageSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumPatientAppointmentTranscriptionAttachmentFolderBasePath(
          consortium
        );
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getSystemUserActualImageSignedFileUrlFromPath = async function (
  fileName
) {
  let fileUrl = "";
  if (fileName && fileName != "") {
    let baseFolderPath = exports.getSystemUserAttachmentFolderBasePath();
    baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
    let fileNameWithPath = baseFolderPath + "/" + fileName;
    fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
  }
  return fileUrl;
};

exports.getSystemUserThumbImageSignedFileUrlFromPath = async function (
  fileName
) {
  let fileUrl = "";
  if (fileName && fileName != "") {
    let baseFolderPath = exports.getSystemUserAttachmentFolderBasePath();
    baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB;
    let fileNameWithPath = baseFolderPath + "/" + fileName;
    fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
  }
  return fileUrl;
};

exports.getConsortiumUserAttachmentFileSignedFileUrlFromPath = async function (
  fileName,
  consortium
) {
  let fileUrl = "";
  if (fileName && fileName != "") {
    let baseFolderPath =
      exports.getConsortiumUserAttachmentFolderBasePath(consortium);
    baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
    let fileNameWithPath = baseFolderPath + "/" + fileName;
    fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
  }
  return fileUrl;
};

exports.getConsortiumUserAttachmentActualImageSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumUserAttachmentFolderBasePath(consortium);
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_ACTUAL;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.getConsortiumUserAttachmentThumbImageSignedFileUrlFromPath =
  async function (fileName, consortium) {
    let fileUrl = "";
    if (fileName && fileName != "") {
      let baseFolderPath =
        exports.getConsortiumUserAttachmentFolderBasePath(consortium);
      baseFolderPath += AppConfigUploads.STORAGE_UPLOADS_SUB_FOLDER_THUMB;
      let fileNameWithPath = baseFolderPath + "/" + fileName;
      fileUrl = await exports.getCloudS3SignedFileUrl(fileNameWithPath);
    }
    return fileUrl;
  };

exports.checkAndGenerateCompleteModuleExpiredSignedFileUrl = async function (
  moduleCode
) {
  var consModelAndFieldObj =
    AppScheduledJobsService.compileCloudAssetSignedUrlGenerationSchemaForModule(
      moduleCode
    );
  let currTs = AppCommonService.getCurrentTimestamp();
  const currAssetUrlExpiryConsideration = currTs * 1;

  var responseLogs = {};
  responseLogs.moduleCode = moduleCode;
  responseLogs.consModelAndFieldObj = consModelAndFieldObj;
  responseLogs.currAssetUrlExpiryConsideration =
    currAssetUrlExpiryConsideration;
  if (consModelAndFieldObj) {
    let consModelObj = consModelAndFieldObj.modelObj;

    if (consModelObj) {
      var moduleCollectionName = consModelObj.collection.name;
      responseLogs.moduleCollectionName = moduleCollectionName;

      let hasIsDeletedConsideration =
        consModelAndFieldObj.hasIsDeletedConsideration;

      let fieldNameAndUpdNameArr = consModelAndFieldObj.fieldNameAndUpdNameArr;

      var andFetchOptions = [];

      if (hasIsDeletedConsideration === true) {
        andFetchOptions.push({
          isDeleted: 0,
        });
      }

      var orFetchOptions = [];
      fieldNameAndUpdNameArr.forEach((fieldNameAndUpdNameObj) => {
        const moduleUrlExpiresAtFieldName =
          fieldNameAndUpdNameObj.updFieldUrlExpiresAt;
        orFetchOptions.push({
          [moduleUrlExpiresAtFieldName]: {
            $lte: currAssetUrlExpiryConsideration,
          },
        });
      });

      andFetchOptions.push({
        $or: orFetchOptions,
      });

      var fetchOptions = {
        $and: andFetchOptions,
      };

      responseLogs.orFetchOptions = orFetchOptions;
      responseLogs.andFetchOptions = andFetchOptions;
      responseLogs.fetchOptions = fetchOptions;

      var consModuleIndObjArr;
      try {
        consModuleIndObjArr = await consModelObj.find(fetchOptions);
      } catch (e) {
        console.log("error : ", e);
      }
      responseLogs.consModuleIndObjArrLength = consModuleIndObjArr.length;

      var consModuleIndObjResponseLogsArr = [];
      if (
        Array.isArray(consModuleIndObjArr) &&
        consModuleIndObjArr.length > 0
      ) {
        await Promise.all(
          consModuleIndObjArr.map(async (consModuleIndObj, moduleObjIndex) => {
            var consModuleIndObjResponseLogsObj = {};
            const consAssetUrlExpiresAt =
              exports.getCloudS3SignedFileExpiresAtTimestamp();

            consModuleIndObjResponseLogsObj.consAssetUrlExpiresAt =
              consAssetUrlExpiresAt;
            consModuleIndObjResponseLogsObj.consModuleIndObj = consModuleIndObj;

            var modIndObjfieldNameAndUpdNameResponseLogsArr = [];
            if (
              Array.isArray(fieldNameAndUpdNameArr) &&
              fieldNameAndUpdNameArr.length > 0
            ) {
              var isUpdateRequired = false;

              await Promise.all(
                fieldNameAndUpdNameArr.map(
                  async (
                    fieldNameAndUpdNameObj,
                    fieldNameAndUpdNameObjIndex
                  ) => {
                    try {
                      var modIndObjfieldNameAndUpdNameResponseLogsObj = {};
                      modIndObjfieldNameAndUpdNameResponseLogsObj.fieldNameAndUpdNameObj =
                        fieldNameAndUpdNameObj;

                      const moduleUrlExpiresAtFieldName =
                        fieldNameAndUpdNameObj.updFieldUrlExpiresAt;

                      const currAssetUrlExpiresAt =
                        exports.fetchIndividualModuleObjectFieldValueFromName(
                          consModuleIndObj,
                          moduleUrlExpiresAtFieldName
                        );

                      modIndObjfieldNameAndUpdNameResponseLogsObj.currAssetUrlExpiresAt =
                        currAssetUrlExpiresAt;
                      modIndObjfieldNameAndUpdNameResponseLogsObj.currAssetUrlExpiryConsideration =
                        currAssetUrlExpiryConsideration;
                      modIndObjfieldNameAndUpdNameResponseLogsObj.moduleUrlExpiresAtFieldName =
                        moduleUrlExpiresAtFieldName;

                      if (
                        currAssetUrlExpiresAt <= currAssetUrlExpiryConsideration
                      ) {
                        var isExpiryTsUpdateRequired = false;

                        const moduleFilePathFieldNamesForImageActualFilePath =
                          fieldNameAndUpdNameObj.updFieldImageAct;
                        const moduleFilePathFieldNamesForImageActualFileUrl =
                          fieldNameAndUpdNameObj.updFieldImageActUrl;

                        if (
                          moduleFilePathFieldNamesForImageActualFilePath &&
                          moduleFilePathFieldNamesForImageActualFilePath !== ""
                        ) {
                          const imageActualFilePath =
                            exports.fetchIndividualModuleObjectFieldValueFromName(
                              consModuleIndObj,
                              moduleFilePathFieldNamesForImageActualFilePath
                            );
                          modIndObjfieldNameAndUpdNameResponseLogsObj.fieldNamesForImageActualFilePath =
                            moduleFilePathFieldNamesForImageActualFilePath;
                          modIndObjfieldNameAndUpdNameResponseLogsObj.imageActualFilePath =
                            imageActualFilePath;
                          if (
                            imageActualFilePath &&
                            imageActualFilePath !== ""
                          ) {
                            const imageActualFileUrl =
                              await exports.getRelevantModuleActualImageSignedFileUrlFromPath(
                                moduleCode,
                                imageActualFilePath
                              );

                            modIndObjfieldNameAndUpdNameResponseLogsObj.imageActualFileUrl =
                              imageActualFileUrl;
                            isExpiryTsUpdateRequired = true;
                            consModuleIndObj =
                              exports.updateIndividualModuleObjectFieldValueFromName(
                                consModuleIndObj,
                                moduleFilePathFieldNamesForImageActualFileUrl,
                                imageActualFileUrl
                              );
                            // consModuleIndObj[moduleFilePathFieldNamesForImageActualFileUrl] = imageActualFileUrl;
                          }
                        }

                        // const moduleFilePathFieldNamesForImageThumbFilePath = fieldNameAndUpdNameObj.updFieldImageThmb;
                        // const moduleFilePathFieldNamesForImageThumbFileUrl = fieldNameAndUpdNameObj.updFieldImageThmbUrl;

                        // if(moduleFilePathFieldNamesForImageThumbFilePath && moduleFilePathFieldNamesForImageThumbFilePath !== "")
                        // {
                        //     const imageThumbFilePath = exports.fetchIndividualModuleObjectFieldValueFromName(consModuleIndObj, moduleFilePathFieldNamesForImageThumbFilePath);
                        //     modIndObjfieldNameAndUpdNameResponseLogsObj.fieldNamesForImageThumbFilePath = moduleFilePathFieldNamesForImageThumbFilePath;
                        //     modIndObjfieldNameAndUpdNameResponseLogsObj.imageThumbFilePath = imageThumbFilePath;
                        //     if(imageThumbFilePath && imageThumbFilePath !== "")
                        //     {
                        //         const imageThumbFileUrl = await exports.getRelevantModuleThumbImageSignedFileUrlFromPath(moduleCode, imageThumbFilePath);

                        //         modIndObjfieldNameAndUpdNameResponseLogsObj.imageThumbFileUrl = imageThumbFileUrl;
                        //         isExpiryTsUpdateRequired = true;
                        //         consModuleIndObj = exports.updateIndividualModuleObjectFieldValueFromName(consModuleIndObj, moduleFilePathFieldNamesForImageThumbFileUrl, imageThumbFileUrl);
                        //         // consModuleIndObj[moduleFilePathFieldNamesForImageThumbFileUrl] = imageThumbFileUrl;
                        //     }
                        // }

                        const moduleFilePathFieldNamesForBaseFileFilePath =
                          fieldNameAndUpdNameObj.updFieldFile;
                        const moduleFilePathFieldNamesForBaseFileFileUrl =
                          fieldNameAndUpdNameObj.updFieldFileUrl;

                        if (
                          moduleFilePathFieldNamesForBaseFileFilePath &&
                          moduleFilePathFieldNamesForBaseFileFilePath !== ""
                        ) {
                          const baseFileFilePath =
                            exports.fetchIndividualModuleObjectFieldValueFromName(
                              consModuleIndObj,
                              moduleFilePathFieldNamesForBaseFileFilePath
                            );
                          modIndObjfieldNameAndUpdNameResponseLogsObj.fieldNamesForBaseFilePath =
                            moduleFilePathFieldNamesForBaseFileFilePath;
                          modIndObjfieldNameAndUpdNameResponseLogsObj.baseFileFilePath =
                            baseFileFilePath;
                          if (baseFileFilePath && baseFileFilePath !== "") {
                            const baseFileFileUrl =
                              await exports.getRelevantModuleBaseFileSignedFileUrlFromPath(
                                moduleCode,
                                baseFileFilePath
                              );

                            modIndObjfieldNameAndUpdNameResponseLogsObj.baseFileFileUrl =
                              baseFileFileUrl;
                            isExpiryTsUpdateRequired = true;
                            consModuleIndObj =
                              exports.updateIndividualModuleObjectFieldValueFromName(
                                consModuleIndObj,
                                moduleFilePathFieldNamesForBaseFileFileUrl,
                                baseFileFileUrl
                              );
                            // consModuleIndObj[moduleFilePathFieldNamesForBaseFileFileUrl] = baseFileFileUrl;
                          }
                        }

                        modIndObjfieldNameAndUpdNameResponseLogsObj.isExpiryTsUpdateRequired =
                          isExpiryTsUpdateRequired;
                        if (isExpiryTsUpdateRequired === true) {
                          isUpdateRequired = true;
                          consModuleIndObj =
                            exports.updateIndividualModuleObjectFieldValueFromName(
                              consModuleIndObj,
                              moduleUrlExpiresAtFieldName,
                              consAssetUrlExpiresAt
                            );
                          // consModuleIndObj[moduleUrlExpiresAtFieldName] = consAssetUrlExpiresAt;
                        }
                      }

                      modIndObjfieldNameAndUpdNameResponseLogsArr[
                        fieldNameAndUpdNameObjIndex
                      ] = modIndObjfieldNameAndUpdNameResponseLogsObj;
                    } catch (e) {
                      console.log("error : ", e);
                    }
                  }
                )
              );

              consModuleIndObjResponseLogsObj.isUpdateRequired =
                isUpdateRequired;
              if (isUpdateRequired === true) {
                consModuleIndObjResponseLogsObj.consModuleIndObj =
                  consModuleIndObj;
                try {
                  var savedConsModuleIndObj = await consModuleIndObj.save();
                } catch (e) {
                  console.log("error : ", e);
                }
              }
            }

            consModuleIndObjResponseLogsObj.modIndObjfieldNameAndUpdNameResponseLogsArr =
              modIndObjfieldNameAndUpdNameResponseLogsArr;
            consModuleIndObjResponseLogsArr[moduleObjIndex] =
              consModuleIndObjResponseLogsObj;
          })
        );
      }
      responseLogs.consModuleIndObjResponseLogsArr =
        consModuleIndObjResponseLogsArr;
    }
  }

  return responseLogs;
};

exports.checkAndGenerateModuleMultipleAttachmentExpiredSignedFileUrl =
  async function (moduleCode, modulePrimaryId) {
    var consModelAndFieldObj =
      AppScheduledJobsService.compileCloudAssetSignedUrlGenerationSchemaForModule(
        moduleCode
      );
    let currTs = AppCommonService.getCurrentTimestamp();
    const currAssetUrlExpiryConsideration = currTs * 1;

    var responseLogs = {};
    responseLogs.moduleCode = moduleCode;
    responseLogs.modulePrimaryId = modulePrimaryId;
    responseLogs.consModelAndFieldObj = consModelAndFieldObj;
    responseLogs.currAssetUrlExpiryConsideration =
      currAssetUrlExpiryConsideration;

    if (consModelAndFieldObj) {
      let consModelObj = consModelAndFieldObj.modelObj;
      var shouldConsiderThumbRetrieval =
        consModelAndFieldObj.shouldConsiderThumbRetrieval;

      var moduleCollectionName = consModelObj.collection.name;
      responseLogs.moduleCollectionName = moduleCollectionName;

      let hasIsDeletedConsideration =
        consModelAndFieldObj.hasIsDeletedConsideration;

      let fieldNameAndUpdNameArr = consModelAndFieldObj.fieldNameAndUpdNameArr;

      var fetchOptions = {
        _id: modulePrimaryId,
      };

      if (hasIsDeletedConsideration === true) {
        fetchOptions.isDeleted = 0;
      }

      responseLogs.fetchOptions = fetchOptions;

      var consModuleIndObj;
      try {
        consModuleIndObj = await consModelObj.findOne(fetchOptions);
      } catch (e) {
        console.log("error : ", e);
      }

      responseLogs.consModuleIndObj = consModuleIndObj;
      if (consModuleIndObj) {
        let consAttachmentArr = [];

        if (moduleCode === AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT) {
          consAttachmentArr = consModuleIndObj["attachments"];
        } else if (
          moduleCode ===
          AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT
        ) {
          consAttachmentArr = consModuleIndObj["appointmentAttachments"];
        } else if (moduleCode === AppConfigUploadsModule.MOD_CONSORTIUM_USER) {
          let templateAttachments = consModuleIndObj["templateAttachments"];
          let sampleAttachments = consModuleIndObj["sampleAttachments"];

          consAttachmentArr = templateAttachments.concat(sampleAttachments);
        }

        responseLogs.consModuleObjArr = consAttachmentArr;

        if (consAttachmentArr.length > 0) {
          let fetchedConsortiumId = consModuleIndObj.consortium;
          let fetchedConsortium =
            await ConsortiumService.getConsortiumBaseObjectById(
              fetchedConsortiumId,
              false
            );

          const consAssetUrlExpiresAt =
            exports.getCloudS3SignedFileExpiresAtTimestamp();

          var modIndObjfieldNameAndUpdNameResponseLogsArr = [];
          if (
            Array.isArray(fieldNameAndUpdNameArr) &&
            fieldNameAndUpdNameArr.length > 0
          ) {
            var isUpdateRequired = false;
            await Promise.all(
              fieldNameAndUpdNameArr.map(
                async (fieldNameAndUpdNameObj, fieldNameAndUpdNameObjIndex) => {
                  try {
                    var modIndObjfieldNameAndUpdNameResponseLogsObj = {};
                    modIndObjfieldNameAndUpdNameResponseLogsObj.fieldNameAndUpdNameObj =
                      fieldNameAndUpdNameObj;

                    const moduleUrlExpiresAtFieldName =
                      fieldNameAndUpdNameObj.updFieldUrlExpiresAt;

                    const moduleFilePathFieldNamesForImageActualFilePath =
                      fieldNameAndUpdNameObj.updFieldImageAct;
                    const moduleFilePathFieldNamesForImageActualFileUrl =
                      fieldNameAndUpdNameObj.updFieldImageActUrl;

                    const moduleFilePathFieldNamesForImageThumbFilePath =
                      fieldNameAndUpdNameObj.updFieldImageThmb;
                    const moduleFilePathFieldNamesForImageThumbFileUrl =
                      fieldNameAndUpdNameObj.updFieldImageThmbUrl;

                    const moduleFilePathFieldNamesForBaseFileFilePath =
                      fieldNameAndUpdNameObj.updFieldFile;
                    const moduleFilePathFieldNamesForBaseFileFileUrl =
                      fieldNameAndUpdNameObj.updFieldFileUrl;

                    var modIndObjAttachmentResponseLogsArr = [];
                    await Promise.all(
                      consAttachmentArr.map(
                        async (
                          consAttachmentIndObj,
                          consAttachmentObjIndex
                        ) => {
                          var modIndObjAttachmentResponseLogsObj = {};
                          modIndObjAttachmentResponseLogsObj.consAttachmentIndObj =
                            consAttachmentIndObj;

                          var currAssetUrlExpiresAt =
                            exports.fetchIndividualModuleObjectFieldValueFromName(
                              consAttachmentIndObj,
                              moduleUrlExpiresAtFieldName
                            );

                          var isExpiryTsUpdateRequired = false;
                          modIndObjAttachmentResponseLogsObj.currAssetUrlExpiresAt =
                            currAssetUrlExpiresAt;
                          modIndObjAttachmentResponseLogsObj.currAssetUrlExpiryConsideration =
                            currAssetUrlExpiryConsideration;
                          modIndObjAttachmentResponseLogsObj.moduleUrlExpiresAtFieldName =
                            moduleUrlExpiresAtFieldName;

                          if (
                            currAssetUrlExpiresAt <=
                            currAssetUrlExpiryConsideration
                          ) {
                            if (
                              moduleFilePathFieldNamesForImageActualFilePath &&
                              moduleFilePathFieldNamesForImageActualFilePath !==
                                ""
                            ) {
                              const imageActualFilePath =
                                exports.fetchIndividualModuleObjectFieldValueFromName(
                                  consAttachmentIndObj,
                                  moduleFilePathFieldNamesForImageActualFilePath
                                );
                              modIndObjAttachmentResponseLogsObj.fieldNamesForImageActualFilePath =
                                moduleFilePathFieldNamesForImageActualFilePath;
                              modIndObjAttachmentResponseLogsObj.imageActualFilePath =
                                imageActualFilePath;
                              if (
                                imageActualFilePath &&
                                imageActualFilePath !== ""
                              ) {
                                const imageActualFileUrl =
                                  await exports.getRelevantModuleActualImageSignedFileUrlFromPath(
                                    moduleCode,
                                    imageActualFilePath,
                                    fetchedConsortium
                                  );
                                modIndObjAttachmentResponseLogsObj.imageActualFileUrl =
                                  imageActualFileUrl;
                                isExpiryTsUpdateRequired = true;
                                consAttachmentIndObj =
                                  exports.updateIndividualModuleObjectFieldValueFromName(
                                    consAttachmentIndObj,
                                    moduleFilePathFieldNamesForImageActualFileUrl,
                                    imageActualFileUrl
                                  );
                              }
                            }

                            if (shouldConsiderThumbRetrieval === true) {
                              if (
                                moduleFilePathFieldNamesForImageThumbFilePath &&
                                moduleFilePathFieldNamesForImageThumbFilePath !==
                                  ""
                              ) {
                                const imageThumbFilePath =
                                  exports.fetchIndividualModuleObjectFieldValueFromName(
                                    consAttachmentIndObj,
                                    moduleFilePathFieldNamesForImageThumbFilePath
                                  );
                                modIndObjAttachmentResponseLogsObj.fieldNamesForImageThumbFilePath =
                                  moduleFilePathFieldNamesForImageThumbFilePath;
                                modIndObjAttachmentResponseLogsObj.imageThumbFilePath =
                                  imageThumbFilePath;
                                if (
                                  imageThumbFilePath &&
                                  imageThumbFilePath !== ""
                                ) {
                                  const imageThumbFileUrl =
                                    await exports.getRelevantModuleThumbImageSignedFileUrlFromPath(
                                      moduleCode,
                                      imageThumbFilePath,
                                      fetchedConsortium
                                    );

                                  modIndObjAttachmentResponseLogsObj.imageThumbFileUrl =
                                    imageThumbFileUrl;
                                  isExpiryTsUpdateRequired = true;
                                  consAttachmentIndObj =
                                    exports.updateIndividualModuleObjectFieldValueFromName(
                                      consAttachmentIndObj,
                                      moduleFilePathFieldNamesForImageThumbFileUrl,
                                      imageThumbFileUrl
                                    );
                                }
                              }
                            }

                            if (
                              moduleFilePathFieldNamesForBaseFileFilePath &&
                              moduleFilePathFieldNamesForBaseFileFilePath !== ""
                            ) {
                              const baseFileFilePath =
                                exports.fetchIndividualModuleObjectFieldValueFromName(
                                  consAttachmentIndObj,
                                  moduleFilePathFieldNamesForBaseFileFilePath
                                );
                              modIndObjAttachmentResponseLogsObj.fieldNamesForBaseFilePath =
                                moduleFilePathFieldNamesForBaseFileFilePath;
                              modIndObjAttachmentResponseLogsObj.baseFileFilePath =
                                baseFileFilePath;
                              if (baseFileFilePath && baseFileFilePath !== "") {
                                const baseFileFileUrl =
                                  await exports.getRelevantModuleBaseFileSignedFileUrlFromPath(
                                    moduleCode,
                                    baseFileFilePath,
                                    fetchedConsortium
                                  );

                                modIndObjAttachmentResponseLogsObj.baseFileFileUrl =
                                  baseFileFileUrl;
                                isExpiryTsUpdateRequired = true;
                                consAttachmentIndObj =
                                  exports.updateIndividualModuleObjectFieldValueFromName(
                                    consAttachmentIndObj,
                                    moduleFilePathFieldNamesForBaseFileFileUrl,
                                    baseFileFileUrl
                                  );
                              }
                            }

                            modIndObjAttachmentResponseLogsObj.isExpiryTsUpdateRequired =
                              isExpiryTsUpdateRequired;

                            if (isExpiryTsUpdateRequired === true) {
                              isUpdateRequired = true;
                              consAttachmentIndObj =
                                exports.updateIndividualModuleObjectFieldValueFromName(
                                  consAttachmentIndObj,
                                  moduleUrlExpiresAtFieldName,
                                  consAssetUrlExpiresAt
                                );
                            }
                          }

                          modIndObjAttachmentResponseLogsArr[
                            consAttachmentObjIndex
                          ] = modIndObjAttachmentResponseLogsObj;
                        }
                      )
                    );

                    modIndObjfieldNameAndUpdNameResponseLogsArr[
                      fieldNameAndUpdNameObjIndex
                    ] = modIndObjAttachmentResponseLogsArr;
                  } catch (e) {
                    console.log("error : ", e);
                  }
                }
              )
            );
          }

          responseLogs.modIndObjfieldNameAndUpdNameResponseLogsArr =
            modIndObjfieldNameAndUpdNameResponseLogsArr;

          responseLogs.isUpdateRequired = isUpdateRequired;
          if (isUpdateRequired === true) {
            responseLogs.updConsModuleIndObj = consModuleIndObj;
            try {
              var savedConsModuleIndObj = await consModuleIndObj.save();
              responseLogs.savedConsModuleIndObj = savedConsModuleIndObj;
            } catch (e) {
              console.log("error : ", e);
            }
          }
        }
      }
    }

    return responseLogs;
  };

exports.checkAndGenerateModuleExpiredSignedFileUrl = async function (
  moduleCode,
  modulePrimaryId,
  moduleSecondaryId
) {
  var consModelAndFieldObj =
    AppScheduledJobsService.compileCloudAssetSignedUrlGenerationSchemaForModule(
      moduleCode
    );
  let currTs = AppCommonService.getCurrentTimestamp();
  const currAssetUrlExpiryConsideration = currTs * 1;

  var responseLogs = {};
  responseLogs.moduleCode = moduleCode;
  responseLogs.modulePrimaryId = modulePrimaryId;
  responseLogs.consModelAndFieldObj = consModelAndFieldObj;
  responseLogs.currAssetUrlExpiryConsideration =
    currAssetUrlExpiryConsideration;

  if (consModelAndFieldObj) {
    let consModelObj = consModelAndFieldObj.modelObj;
    var shouldConsiderThumbRetrieval =
      consModelAndFieldObj.shouldConsiderThumbRetrieval;

    if (consModelObj) {
      var moduleCollectionName = consModelObj.collection.name;
      responseLogs.moduleCollectionName = moduleCollectionName;

      let hasIsDeletedConsideration =
        consModelAndFieldObj.hasIsDeletedConsideration;

      let fieldNameAndUpdNameArr = consModelAndFieldObj.fieldNameAndUpdNameArr;

      var fetchOptions = {
        _id: modulePrimaryId,
      };

      if (hasIsDeletedConsideration === true) {
        fetchOptions.isDeleted = 0;
      }

      responseLogs.fetchOptions = fetchOptions;

      var consModuleIndObj;
      try {
        consModuleIndObj = await consModelObj.findOne(fetchOptions);
      } catch (e) {
        console.log("error : ", e);
      }

      responseLogs.consModuleIndObj = consModuleIndObj;

      if (consModuleIndObj) {
        let fetchedConsortiumId = consModuleIndObj.consortium;
        let fetchedConsortium =
          await ConsortiumService.getConsortiumBaseObjectById(
            fetchedConsortiumId,
            false
          );

        const consAssetUrlExpiresAt =
          exports.getCloudS3SignedFileExpiresAtTimestamp();
        responseLogs.consAssetUrlExpiresAt = consAssetUrlExpiresAt;

        var modIndObjfieldNameAndUpdNameResponseLogsArr = [];
        if (
          Array.isArray(fieldNameAndUpdNameArr) &&
          fieldNameAndUpdNameArr.length > 0
        ) {
          var isUpdateRequired = false;
          await Promise.all(
            fieldNameAndUpdNameArr.map(
              async (fieldNameAndUpdNameObj, fieldNameAndUpdNameObjIndex) => {
                try {
                  var modIndObjfieldNameAndUpdNameResponseLogsObj = {};

                  const moduleUrlExpiresAtFieldName =
                    fieldNameAndUpdNameObj.updFieldUrlExpiresAt;
                  var currAssetUrlExpiresAt =
                    exports.fetchIndividualModuleObjectFieldValueFromName(
                      consModuleIndObj,
                      moduleUrlExpiresAtFieldName
                    );

                  modIndObjfieldNameAndUpdNameResponseLogsObj.moduleUrlExpiresAtFieldName =
                    moduleUrlExpiresAtFieldName;
                  modIndObjfieldNameAndUpdNameResponseLogsObj.currAssetUrlExpiresAt =
                    currAssetUrlExpiresAt;
                  modIndObjfieldNameAndUpdNameResponseLogsObj.currAssetUrlExpiryConsideration =
                    currAssetUrlExpiryConsideration;

                  if (
                    currAssetUrlExpiresAt <= currAssetUrlExpiryConsideration
                  ) {
                    var isExpiryTsUpdateRequired = false;

                    const moduleFilePathFieldNamesForImageActualFilePath =
                      fieldNameAndUpdNameObj.updFieldImageAct;
                    const moduleFilePathFieldNamesForImageActualFileUrl =
                      fieldNameAndUpdNameObj.updFieldImageActUrl;

                    if (
                      moduleFilePathFieldNamesForImageActualFilePath &&
                      moduleFilePathFieldNamesForImageActualFilePath !== ""
                    ) {
                      const imageActualFilePath =
                        exports.fetchIndividualModuleObjectFieldValueFromName(
                          consModuleIndObj,
                          moduleFilePathFieldNamesForImageActualFilePath
                        );
                      modIndObjfieldNameAndUpdNameResponseLogsObj.fieldNamesForImageActualFilePath =
                        moduleFilePathFieldNamesForImageActualFilePath;
                      modIndObjfieldNameAndUpdNameResponseLogsObj.imageActualFilePath =
                        imageActualFilePath;

                      if (imageActualFilePath && imageActualFilePath !== "") {
                        const imageActualFileUrl =
                          await exports.getRelevantModuleActualImageSignedFileUrlFromPath(
                            moduleCode,
                            imageActualFilePath,
                            fetchedConsortium
                          );

                        modIndObjfieldNameAndUpdNameResponseLogsObj.imageActualFileUrl =
                          imageActualFileUrl;
                        isExpiryTsUpdateRequired = true;
                        consModuleIndObj =
                          exports.updateIndividualModuleObjectFieldValueFromName(
                            consModuleIndObj,
                            moduleFilePathFieldNamesForImageActualFileUrl,
                            imageActualFileUrl
                          );
                        // consModuleIndObj[moduleFilePathFieldNamesForImageActualFileUrl] = imageActualFileUrl;
                      }
                    }

                    if (shouldConsiderThumbRetrieval === true) {
                      const moduleFilePathFieldNamesForImageThumbFilePath =
                        fieldNameAndUpdNameObj.updFieldImageThmb;
                      const moduleFilePathFieldNamesForImageThumbFileUrl =
                        fieldNameAndUpdNameObj.updFieldImageThmbUrl;

                      if (
                        moduleFilePathFieldNamesForImageThumbFilePath &&
                        moduleFilePathFieldNamesForImageThumbFilePath !== ""
                      ) {
                        const imageThumbFilePath =
                          exports.fetchIndividualModuleObjectFieldValueFromName(
                            consModuleIndObj,
                            moduleFilePathFieldNamesForImageThumbFilePath
                          );
                        modIndObjfieldNameAndUpdNameResponseLogsObj.fieldNamesForImageThumbFilePath =
                          moduleFilePathFieldNamesForImageThumbFilePath;
                        modIndObjfieldNameAndUpdNameResponseLogsObj.imageThumbFilePath =
                          imageThumbFilePath;
                        if (imageThumbFilePath && imageThumbFilePath !== "") {
                          const imageThumbFileUrl =
                            await exports.getRelevantModuleThumbImageSignedFileUrlFromPath(
                              moduleCode,
                              imageThumbFilePath,
                              fetchedConsortium
                            );

                          modIndObjfieldNameAndUpdNameResponseLogsObj.imageThumbFileUrl =
                            imageThumbFileUrl;
                          isExpiryTsUpdateRequired = true;
                          consModuleIndObj =
                            exports.updateIndividualModuleObjectFieldValueFromName(
                              consModuleIndObj,
                              moduleFilePathFieldNamesForImageThumbFileUrl,
                              imageThumbFileUrl
                            );
                          // consModuleIndObj[moduleFilePathFieldNamesForImageThumbFileUrl] = imageThumbFileUrl;
                        }
                      }
                    }

                    const moduleFilePathFieldNamesForBaseFileFilePath =
                      fieldNameAndUpdNameObj.updFieldFile;
                    const moduleFilePathFieldNamesForBaseFileFileUrl =
                      fieldNameAndUpdNameObj.updFieldFileUrl;

                    if (
                      moduleFilePathFieldNamesForBaseFileFilePath &&
                      moduleFilePathFieldNamesForBaseFileFilePath !== ""
                    ) {
                      const baseFileFilePath =
                        exports.fetchIndividualModuleObjectFieldValueFromName(
                          consModuleIndObj,
                          moduleFilePathFieldNamesForBaseFileFilePath
                        );
                      modIndObjfieldNameAndUpdNameResponseLogsObj.fieldNamesForBaseFilePath =
                        moduleFilePathFieldNamesForBaseFileFilePath;
                      modIndObjfieldNameAndUpdNameResponseLogsObj.baseFileFilePath =
                        baseFileFilePath;
                      if (baseFileFilePath && baseFileFilePath !== "") {
                        const baseFileFileUrl =
                          await exports.getRelevantModuleBaseFileSignedFileUrlFromPath(
                            moduleCode,
                            baseFileFilePath,
                            fetchedConsortium
                          );

                        modIndObjfieldNameAndUpdNameResponseLogsObj.baseFileFileUrl =
                          baseFileFileUrl;
                        isExpiryTsUpdateRequired = true;
                        consModuleIndObj =
                          exports.updateIndividualModuleObjectFieldValueFromName(
                            consModuleIndObj,
                            moduleFilePathFieldNamesForBaseFileFileUrl,
                            baseFileFileUrl
                          );
                        // consModuleIndObj[moduleFilePathFieldNamesForBaseFileFileUrl] = baseFileFileUrl;
                      }
                    }

                    modIndObjfieldNameAndUpdNameResponseLogsObj.isExpiryTsUpdateRequired =
                      isExpiryTsUpdateRequired;
                    if (isExpiryTsUpdateRequired === true) {
                      isUpdateRequired = true;
                      consModuleIndObj =
                        exports.updateIndividualModuleObjectFieldValueFromName(
                          consModuleIndObj,
                          moduleUrlExpiresAtFieldName,
                          consAssetUrlExpiresAt
                        );
                      // consModuleIndObj[moduleUrlExpiresAtFieldName] = consAssetUrlExpiresAt;
                    }
                  }

                  modIndObjfieldNameAndUpdNameResponseLogsArr[
                    fieldNameAndUpdNameObjIndex
                  ] = modIndObjfieldNameAndUpdNameResponseLogsObj;
                } catch (e) {
                  console.log("error : ", e);
                }
              }
            )
          );

          responseLogs.isUpdateRequired = isUpdateRequired;
          if (isUpdateRequired === true) {
            responseLogs.updConsModuleIndObj = consModuleIndObj;
            try {
              var savedConsModuleIndObj = await consModuleIndObj.save();
            } catch (e) {
              console.log("error : ", e);
            }
          }
        }
        responseLogs.modIndObjfieldNameAndUpdNameResponseLogsArr =
          modIndObjfieldNameAndUpdNameResponseLogsArr;
      }
    }
  }

  return responseLogs;
};

exports.fetchIndividualModuleObjectFieldValueFromName = function (
  consModuleIndObj,
  moduleFieldName
) {
  var moduleFieldValue;
  if (moduleFieldName.includes(".")) {
    var moduleFieldNamePartArr = moduleFieldName.split(".");
    if (moduleFieldNamePartArr.length > 0) {
      var moduleFieldSubPart;
      moduleFieldNamePartArr.forEach((moduleFieldNamePart) => {
        if (!moduleFieldSubPart) {
          moduleFieldSubPart = consModuleIndObj[moduleFieldNamePart];
        } else {
          moduleFieldSubPart = moduleFieldSubPart[moduleFieldNamePart];
        }
      });
      moduleFieldValue = moduleFieldSubPart;
    }
  } else {
    moduleFieldValue = consModuleIndObj[moduleFieldName];
  }
  return moduleFieldValue;
};

exports.updateIndividualModuleObjectFieldValueFromName = function (
  consModuleIndObj,
  moduleFieldName,
  moduleFieldValue
) {
  if (consModuleIndObj) {
    if (moduleFieldName.includes(".")) {
      var moduleFieldNamePartArr = moduleFieldName.split(".");
      if (moduleFieldNamePartArr.length > 0) {
        if (moduleFieldNamePartArr.length === 2) {
          const moduleFieldNamePart1 = moduleFieldNamePartArr[0];
          const moduleFieldNamePart2 = moduleFieldNamePartArr[1];

          var tempBaseModuleField = consModuleIndObj[moduleFieldNamePart1];
          tempBaseModuleField[moduleFieldNamePart2] = moduleFieldValue;
          consModuleIndObj[moduleFieldNamePart1] = tempBaseModuleField;
        }
      }
    } else {
      consModuleIndObj[moduleFieldName] = moduleFieldValue;
    }
  }
  return consModuleIndObj;
};

exports.checkAndGenerateSecondaryModuleExpiredSignedFileUrl = async function (
  secModuleCode,
  moduleSecondaryId
) {
  var responseLogs = {};

  var moduleCode = "";
  var consRetrievalKeyName = "";
  var shouldConsiderThumbRetrieval = false;
  var workWithPrefetchedResultset = false;
  var prefetchedResultset = [];

  if (
    secModuleCode ===
    AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT
  ) {
    moduleCode =
      AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT;
    consRetrievalKeyName = "consortiumPatientAppointment";
  } else if (
    secModuleCode ===
    AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT
  ) {
    moduleCode =
      AppConfigUploadsModule.MOD_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT;
    consRetrievalKeyName = "consortiumPatientAppointment";
  }

  let currTs = AppCommonService.getCurrentTimestamp();
  const currAssetUrlExpiryConsideration = currTs * 1;

  if (moduleCode !== "") {
    var consModelAndFieldObj =
      AppScheduledJobsService.compileCloudAssetSignedUrlGenerationSchemaForModule(
        moduleCode
      );
    responseLogs.consModelAndFieldObj = consModelAndFieldObj;

    if (consModelAndFieldObj) {
      let consModelObj = consModelAndFieldObj.modelObj;

      if (consModelObj) {
        var moduleCollectionName = consModelObj.collection.name;
        responseLogs.moduleCollectionName = moduleCollectionName;

        let hasIsDeletedConsideration =
          consModelAndFieldObj.hasIsDeletedConsideration;

        let fieldNameAndUpdNameArr =
          consModelAndFieldObj.fieldNameAndUpdNameArr;

        var fetchOptions = {};
        fetchOptions[consRetrievalKeyName] = moduleSecondaryId;

        if (hasIsDeletedConsideration === true) {
          fetchOptions.isDeleted = 0;
        }

        responseLogs.fetchOptions = fetchOptions;

        var consModuleObjArr;
        try {
          if (workWithPrefetchedResultset === true) {
            consModuleObjArr = prefetchedResultset;
          } else {
            consModuleObjArr = await consModelObj.find(fetchOptions);
          }
        } catch (e) {
          console.log("error : ", e);
        }

        responseLogs.consModuleObjArr = consModuleObjArr;

        var modIndObjResponseLogsArr = [];
        await Promise.all(
          consModuleObjArr.map(async (consModuleIndObj, moduleObjIndex) => {
            var modIndObjResponseLogsObj = {};

            let fetchedConsortiumId = consModuleIndObj.consortium;
            let fetchedConsortium =
              await ConsortiumService.getConsortiumBaseObjectById(
                fetchedConsortiumId,
                false
              );

            const consAssetUrlExpiresAt =
              exports.getCloudS3SignedFileExpiresAtTimestamp();
            modIndObjResponseLogsObj.consAssetUrlExpiresAt =
              consAssetUrlExpiresAt;

            var modIndObjfieldNameAndUpdNameResponseLogsArr = [];
            if (
              Array.isArray(fieldNameAndUpdNameArr) &&
              fieldNameAndUpdNameArr.length > 0
            ) {
              var isUpdateRequired = false;
              await Promise.all(
                fieldNameAndUpdNameArr.map(
                  async (
                    fieldNameAndUpdNameObj,
                    fieldNameAndUpdNameObjIndex
                  ) => {
                    try {
                      var modIndObjfieldNameAndUpdNameResponseLogsObj = {};

                      const moduleUrlExpiresAtFieldName =
                        fieldNameAndUpdNameObj.updFieldUrlExpiresAt;
                      var currAssetUrlExpiresAt =
                        exports.fetchIndividualModuleObjectFieldValueFromName(
                          consModuleIndObj,
                          moduleUrlExpiresAtFieldName
                        );

                      modIndObjfieldNameAndUpdNameResponseLogsObj.moduleUrlExpiresAtFieldName =
                        moduleUrlExpiresAtFieldName;
                      modIndObjfieldNameAndUpdNameResponseLogsObj.currAssetUrlExpiresAt =
                        currAssetUrlExpiresAt;
                      modIndObjfieldNameAndUpdNameResponseLogsObj.currAssetUrlExpiryConsideration =
                        currAssetUrlExpiryConsideration;

                      if (
                        currAssetUrlExpiresAt <= currAssetUrlExpiryConsideration
                      ) {
                        var isExpiryTsUpdateRequired = false;

                        const moduleFilePathFieldNamesForImageActualFilePath =
                          fieldNameAndUpdNameObj.updFieldImageAct;
                        const moduleFilePathFieldNamesForImageActualFileUrl =
                          fieldNameAndUpdNameObj.updFieldImageActUrl;

                        if (
                          moduleFilePathFieldNamesForImageActualFilePath &&
                          moduleFilePathFieldNamesForImageActualFilePath !== ""
                        ) {
                          const imageActualFilePath =
                            exports.fetchIndividualModuleObjectFieldValueFromName(
                              consModuleIndObj,
                              moduleFilePathFieldNamesForImageActualFilePath
                            );
                          modIndObjfieldNameAndUpdNameResponseLogsObj.fieldNamesForImageActualFilePath =
                            moduleFilePathFieldNamesForImageActualFilePath;
                          modIndObjfieldNameAndUpdNameResponseLogsObj.imageActualFilePath =
                            imageActualFilePath;

                          if (
                            imageActualFilePath &&
                            imageActualFilePath !== ""
                          ) {
                            const imageActualFileUrl =
                              await exports.getRelevantModuleActualImageSignedFileUrlFromPath(
                                moduleCode,
                                imageActualFilePath,
                                fetchedConsortium
                              );

                            console.log(
                              "imageActualFileUrl : ",
                              imageActualFileUrl
                            );
                            modIndObjfieldNameAndUpdNameResponseLogsObj.imageActualFileUrl =
                              imageActualFileUrl;
                            isExpiryTsUpdateRequired = true;
                            consModuleIndObj =
                              exports.updateIndividualModuleObjectFieldValueFromName(
                                consModuleIndObj,
                                moduleFilePathFieldNamesForImageActualFileUrl,
                                imageActualFileUrl
                              );
                            // consModuleIndObj[moduleFilePathFieldNamesForImageActualFileUrl] = imageActualFileUrl;
                          }
                        }

                        if (shouldConsiderThumbRetrieval === true) {
                          const moduleFilePathFieldNamesForImageThumbFilePath =
                            fieldNameAndUpdNameObj.updFieldImageThmb;
                          const moduleFilePathFieldNamesForImageThumbFileUrl =
                            fieldNameAndUpdNameObj.updFieldImageThmbUrl;

                          if (
                            moduleFilePathFieldNamesForImageThumbFilePath &&
                            moduleFilePathFieldNamesForImageThumbFilePath !== ""
                          ) {
                            const imageThumbFilePath =
                              exports.fetchIndividualModuleObjectFieldValueFromName(
                                consModuleIndObj,
                                moduleFilePathFieldNamesForImageThumbFilePath
                              );
                            modIndObjfieldNameAndUpdNameResponseLogsObj.fieldNamesForImageThumbFilePath =
                              moduleFilePathFieldNamesForImageThumbFilePath;
                            modIndObjfieldNameAndUpdNameResponseLogsObj.imageThumbFilePath =
                              imageThumbFilePath;
                            if (
                              imageThumbFilePath &&
                              imageThumbFilePath !== ""
                            ) {
                              const imageThumbFileUrl =
                                await exports.getRelevantModuleThumbImageSignedFileUrlFromPath(
                                  moduleCode,
                                  imageThumbFilePath,
                                  fetchedConsortium
                                );
                              console.log(
                                "imageThumbFileUrl : ",
                                imageThumbFileUrl
                              );
                              modIndObjfieldNameAndUpdNameResponseLogsObj.imageThumbFileUrl =
                                imageThumbFileUrl;
                              isExpiryTsUpdateRequired = true;
                              consModuleIndObj =
                                exports.updateIndividualModuleObjectFieldValueFromName(
                                  consModuleIndObj,
                                  moduleFilePathFieldNamesForImageThumbFileUrl,
                                  imageThumbFileUrl
                                );
                              // consModuleIndObj[moduleFilePathFieldNamesForImageThumbFileUrl] = imageThumbFileUrl;
                            }
                          }
                        }

                        const moduleFilePathFieldNamesForBaseFileFilePath =
                          fieldNameAndUpdNameObj.updFieldFile;
                        const moduleFilePathFieldNamesForBaseFileFileUrl =
                          fieldNameAndUpdNameObj.updFieldFileUrl;

                        if (
                          moduleFilePathFieldNamesForBaseFileFilePath &&
                          moduleFilePathFieldNamesForBaseFileFilePath !== ""
                        ) {
                          const baseFileFilePath =
                            exports.fetchIndividualModuleObjectFieldValueFromName(
                              consModuleIndObj,
                              moduleFilePathFieldNamesForBaseFileFilePath
                            );
                          modIndObjfieldNameAndUpdNameResponseLogsObj.fieldNamesForBaseFilePath =
                            moduleFilePathFieldNamesForBaseFileFilePath;
                          modIndObjfieldNameAndUpdNameResponseLogsObj.baseFileFilePath =
                            baseFileFilePath;
                          if (baseFileFilePath && baseFileFilePath !== "") {
                            const baseFileFileUrl =
                              await exports.getRelevantModuleBaseFileSignedFileUrlFromPath(
                                moduleCode,
                                baseFileFilePath,
                                fetchedConsortium
                              );
                            console.log("baseFileFileUrl : ", baseFileFileUrl);
                            modIndObjfieldNameAndUpdNameResponseLogsObj.baseFileFileUrl =
                              baseFileFileUrl;
                            isExpiryTsUpdateRequired = true;
                            consModuleIndObj =
                              exports.updateIndividualModuleObjectFieldValueFromName(
                                consModuleIndObj,
                                moduleFilePathFieldNamesForBaseFileFileUrl,
                                baseFileFileUrl
                              );
                            // consModuleIndObj[moduleFilePathFieldNamesForBaseFileFileUrl] = baseFileFileUrl;
                          }
                        }

                        modIndObjfieldNameAndUpdNameResponseLogsObj.isExpiryTsUpdateRequired =
                          isExpiryTsUpdateRequired;
                        if (isExpiryTsUpdateRequired === true) {
                          isUpdateRequired = true;
                          consModuleIndObj =
                            exports.updateIndividualModuleObjectFieldValueFromName(
                              consModuleIndObj,
                              moduleUrlExpiresAtFieldName,
                              consAssetUrlExpiresAt
                            );
                          // consModuleIndObj[moduleUrlExpiresAtFieldName] = consAssetUrlExpiresAt;
                        }
                      }

                      modIndObjfieldNameAndUpdNameResponseLogsArr[
                        fieldNameAndUpdNameObjIndex
                      ] = modIndObjfieldNameAndUpdNameResponseLogsObj;
                    } catch (e) {
                      console.log("error : ", e);
                    }
                  }
                )
              );

              modIndObjResponseLogsObj.isUpdateRequired = isUpdateRequired;
              if (isUpdateRequired === true) {
                modIndObjResponseLogsObj.updConsModuleIndObj = consModuleIndObj;
                try {
                  var savedConsModuleIndObj = await consModuleIndObj.save();
                  modIndObjResponseLogsObj.savedConsModuleIndObj =
                    savedConsModuleIndObj;
                } catch (e) {
                  console.log("error : ", e);
                }
              }
            }

            modIndObjResponseLogsObj.modIndObjfieldNameAndUpdNameResponseLogsArr =
              modIndObjfieldNameAndUpdNameResponseLogsArr;

            modIndObjResponseLogsArr[moduleObjIndex] = {
              modIndObjResponseLogsObj: modIndObjResponseLogsObj,
            };
          })
        );

        responseLogs.modIndObjResponseLogsArr = modIndObjResponseLogsArr;
      }
    }
  }

  responseLogs.moduleCode = moduleCode;
  responseLogs.moduleSecondaryId = moduleSecondaryId;
  responseLogs.currAssetUrlExpiryConsideration =
    currAssetUrlExpiryConsideration;

  return responseLogs;
};
ffmpeg.setFfprobePath(
  "C:/Users/hp/Downloads/ffmpeg-2024-08-21-git-9d15fe77e3-essentials_build/bin/ffprobe.exe"
);
exports.getAudioDurationUsingFluent = async function (filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }
      var duration = metadata.format.duration;
      var sanDuration = parseFloat(duration.toFixed(2));
      resolve(sanDuration);
    });
  });
};

exports.createLocalZipWithCloudUploadedFiles = async function (
  localZipFilePath,
  toBeZippedAttachmentObjArr
) {
  const archiver = require("archiver");

  const localZipFilePathWithExtension = localZipFilePath + ".zip";
  console.log(
    "createLocalZipWithCloudUploadedFiles : localZipFilePathWithExtension : ",
    localZipFilePathWithExtension
  );

  const output = fs.createWriteStream(localZipFilePathWithExtension); // '/tmp/output.zip'
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  output.on("close", () => {
    console.log(`Zip file created with ${archive.pointer()} total bytes`);
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  const localTempToBeZippedFilePath = localZipFilePath + "/" + "files" + "/";
  console.log(
    "createLocalZipWithCloudUploadedFiles : localTempToBeZippedFilePath : ",
    localTempToBeZippedFilePath
  );

  if (!fs.existsSync(localTempToBeZippedFilePath)) {
    fs.mkdirSync(localTempToBeZippedFilePath, { recursive: true });
  }

  var filesToBeZippedCount = 0,
    filesActuallyZippedCount = 0;
  await Promise.all(
    toBeZippedAttachmentObjArr.map(
      async (toBeZippedAttachmentObj, attIndex) => {
        filesToBeZippedCount++;
        const cloudBaseFolder = toBeZippedAttachmentObj.baseFolder;
        const cloudFilePath = toBeZippedAttachmentObj.attFilePath;
        const cloudFileName = toBeZippedAttachmentObj.attFileName;
        const filePath = await exports.createLocalFileFromS3File(
          cloudBaseFolder,
          localTempToBeZippedFilePath,
          cloudFilePath,
          cloudFileName
        );

        if (filePath && filePath !== undefined && filePath !== "") {
          archive.file(filePath, { name: cloudFileName });
          filesActuallyZippedCount++;
        }
      }
    )
  );

  console.log(
    "createLocalZipWithCloudUploadedFiles : filesToBeZippedCount : ",
    filesToBeZippedCount
  );
  console.log(
    "createLocalZipWithCloudUploadedFiles : filesActuallyZippedCount : ",
    filesActuallyZippedCount
  );

  await archive.finalize();

  fs.rmdir(
    localTempToBeZippedFilePath,
    { recursive: true, force: true },
    function (err) {
      if (err) {
        console.log(
          "createLocalZipWithCloudUploadedFiles : localTempToBeZippedFilePath deletion error : ",
          err
        );
      }
    }
  );

  fs.rmdir(
    localZipFilePath + "/",
    { recursive: true, force: true },
    function (err) {
      if (err) {
        console.log(
          "createLocalZipWithCloudUploadedFiles : localZipFilePath deletion error : ",
          err
        );
      }
    }
  );
};

exports.createLocalFileFromS3File = async function (
  cloudBaseFolder,
  localFilePath,
  cloudFilePath,
  cloudFileName
) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: AppConfigUploads.DO_SPACES_BUCKET + "/" + cloudBaseFolder,
      Key: cloudFilePath,
    };
    console.log("createLocalFileFromS3File : params : ", params);

    s3.getObject(params, (err, data) => {
      if (err) {
        console.log(
          "createLocalFileFromS3File : getObject : cloudFilePath : ",
          cloudFilePath,
          " : error : ",
          err
        );
        return resolve("");
      }

      // Write the file data to a temporary location
      const filePath = `${localFilePath}${cloudFileName}`;
      // const output = fs.createWriteStream(filePath);
      // let writeStream = fs.createWriteStream(filePath)
      console.log("createLocalFileFromS3File : filePath : ", filePath);
      fs.writeFileSync(filePath, data.Body);

      console.log(
        "createLocalFileFromS3File : writeFileSync success : ",
        cloudFileName
      );
      return resolve(filePath);
    });
  });
};
