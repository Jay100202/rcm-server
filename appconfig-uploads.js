const CLIENT_APP_URL = "https://app.analyticahcs.com/"; // For Live
const WEB_APP_URL = "https://app.analyticahcs.com/"; // For Live

const SPACES_BUCKET = "rcm-s3";
const SPACES_REGION = "us-east-1";
const SPACES_ENDPOINT = SPACES_REGION + ".amazonaws.com";
const BASE_SPACES_PATH =
  "https://" + SPACES_BUCKET + "." + SPACES_ENDPOINT + "/";
const BASE_SPACES_FOLDER = "ANA/";

const STORAGE_UPLOADS_PATH = BASE_SPACES_FOLDER + "uploads/";
const STORAGE_APP_DOWNLOADS_PATH =
  "https://" + SPACES_BUCKET + ".s3.amazonaws.com/" + STORAGE_UPLOADS_PATH;

const STORAGE_UPLOADS_SUFFIX_SEPARATOR = "-";
const STORAGE_UPLOADS_SUFFIX_ACTUAL = "org";
const STORAGE_UPLOADS_SUFFIX_THUMB = "thmb";

const STORAGE_UPLOADS_FOLDER_SYSTEM_PRELIMINARY_ATTACHMENT =
  "systemPreliminaryAttachment";
const STORAGE_UPLOADS_FOLDER_SYSTEM_SUPER_USER_ATTACHMENT =
  "systemUserAttachment";
const STORAGE_UPLOADS_FOLDER_CONSORTIUM_SUPER_USER_ATTACHMENT =
  "consortiumUserAttachment";
const STORAGE_UPLOADS_FOLDER_CONSORTIUM_PRELIMINARY_ATTACHMENT =
  "consortiumPreliminaryAttachment";
const STORAGE_UPLOADS_FOLDER_CONSORTIUM_PATIENT_ATTACHMENT =
  "consortiumPatientAttachment";
const STORAGE_UPLOADS_FOLDER_CONSORTIUM_PATIENT_APPOINTMENT_ATTACHMENT =
  "consortiumPatientAppointmentAttachment";
const STORAGE_UPLOADS_FOLDER_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT =
  "consortiumPatientAppointmentDictationAttachment";
const STORAGE_UPLOADS_FOLDER_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT =
  "consortiumPatientAppointmentTranscriptionAttachment";
const STORAGE_UPLOADS_FOLDER_CONSORTIUM_ASSETS = "consortiumAssets";

const STORAGE_UPLOADS_SUB_FOLDER_ACTUAL = "org";
const STORAGE_UPLOADS_SUB_FOLDER_THUMB = "thumb";

module.exports = {
  DO_SPACES_ENDPOINT: SPACES_ENDPOINT,
  DO_SPACES_BUCKET: SPACES_BUCKET,
  DO_SPACES_ACCESS_KEY: "AKIAYZTD4M4YKKEDBSXR",
  DO_SPACES_SECRET_KEY: "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",
  DO_SPACES_ACL: "private",
  DO_SPACES_ACL_PUBLIC: "public-read",
  DO_SPACES_REGION_NAME: SPACES_REGION,

  CLIENT_APP_URL: CLIENT_APP_URL,
  WEB_APP_URL: WEB_APP_URL,

  STORAGE_UPLOADS_SUFFIX_SEPARATOR: STORAGE_UPLOADS_SUFFIX_SEPARATOR,
  STORAGE_UPLOADS_SUFFIX_ACTUAL: STORAGE_UPLOADS_SUFFIX_ACTUAL,
  STORAGE_UPLOADS_SUFFIX_THUMB: STORAGE_UPLOADS_SUFFIX_THUMB,

  STORAGE_UPLOADS_SUB_FOLDER_ACTUAL: STORAGE_UPLOADS_SUB_FOLDER_ACTUAL,
  STORAGE_UPLOADS_SUB_FOLDER_THUMB: STORAGE_UPLOADS_SUB_FOLDER_THUMB,

  STORAGE_UPLOADS_SIGNED_URL_ACCESSIBILITY_FOR_MINUTES: 60,

  STORAGE_UPLOADS_FOLDER_ACTUAL: STORAGE_UPLOADS_SUFFIX_ACTUAL + "/",
  STORAGE_UPLOADS_FOLDER_THUMB: STORAGE_UPLOADS_SUFFIX_THUMB + "/",

  STORAGE_APP_DOWNLOADS_BASE_URL: BASE_SPACES_PATH,

  STORAGE_UPLOADS_SUFFIX_ACTUAL_W_SEPARATOR:
    STORAGE_UPLOADS_SUFFIX_SEPARATOR + STORAGE_UPLOADS_SUFFIX_ACTUAL,
  STORAGE_UPLOADS_SUFFIX_THUMB_W_SEPARATOR:
    STORAGE_UPLOADS_SUFFIX_SEPARATOR + STORAGE_UPLOADS_SUFFIX_THUMB,

  STORAGE_PATH_SYSTEM_PRELIMINARY_ATTACHMENT:
    STORAGE_UPLOADS_PATH +
    STORAGE_UPLOADS_FOLDER_SYSTEM_PRELIMINARY_ATTACHMENT +
    "/",

  STORAGE_URL_SYSTEM_PRELIMINARY_ATTACHMENT:
    STORAGE_APP_DOWNLOADS_PATH +
    STORAGE_UPLOADS_FOLDER_SYSTEM_PRELIMINARY_ATTACHMENT +
    "/",

  STORAGE_MULTER_UPLOAD_PATH_SYSTEM_PRELIMINARY_ATTACHMENT:
    STORAGE_UPLOADS_PATH + STORAGE_UPLOADS_FOLDER_SYSTEM_PRELIMINARY_ATTACHMENT,

  STORAGE_PATH_SUPER_USER_ATTACHMENT:
    STORAGE_UPLOADS_PATH +
    STORAGE_UPLOADS_FOLDER_SYSTEM_SUPER_USER_ATTACHMENT +
    "/",

  STORAGE_URL_SUPER_USER_ATTACHMENT:
    STORAGE_APP_DOWNLOADS_PATH +
    STORAGE_UPLOADS_FOLDER_SYSTEM_SUPER_USER_ATTACHMENT +
    "/",

  STORAGE_PATH_CONSORTIUM_ASSETS:
    STORAGE_UPLOADS_PATH + STORAGE_UPLOADS_FOLDER_CONSORTIUM_ASSETS + "/",

  STORAGE_URL_CONSORTIUM_ASSETS:
    STORAGE_APP_DOWNLOADS_PATH + STORAGE_UPLOADS_FOLDER_CONSORTIUM_ASSETS + "/",

  STORAGE_PATH_CONSORTIUM_PRELIMINARY_ATTACHMENT:
    STORAGE_UPLOADS_FOLDER_CONSORTIUM_PRELIMINARY_ATTACHMENT + "/",

  STORAGE_URL_CONSORTIUM_PRELIMINARY_ATTACHMENT:
    STORAGE_UPLOADS_FOLDER_CONSORTIUM_PRELIMINARY_ATTACHMENT + "/",

  STORAGE_MULTER_UPLOAD_PATH_CONSORTIUM_PRELIMINARY_ATTACHMENT:
    STORAGE_UPLOADS_FOLDER_CONSORTIUM_PRELIMINARY_ATTACHMENT,

  STORAGE_PATH_CONSORTIUM_USER_ATTACHMENT:
    STORAGE_UPLOADS_FOLDER_CONSORTIUM_SUPER_USER_ATTACHMENT + "/",

  STORAGE_URL_CONSORTIUM_USER_ATTACHMENT:
    STORAGE_UPLOADS_FOLDER_CONSORTIUM_SUPER_USER_ATTACHMENT + "/",

  STORAGE_PATH_CONSORTIUM_PATIENT_ATTACHMENT:
    STORAGE_UPLOADS_FOLDER_CONSORTIUM_PATIENT_ATTACHMENT + "/",

  STORAGE_URL_CONSORTIUM_PATIENT_ATTACHMENT:
    STORAGE_UPLOADS_FOLDER_CONSORTIUM_PATIENT_ATTACHMENT + "/",

  STORAGE_PATH_CONSORTIUM_PATIENT_APPOINTMENT_ATTACHMENT:
    STORAGE_UPLOADS_FOLDER_CONSORTIUM_PATIENT_APPOINTMENT_ATTACHMENT + "/",

  STORAGE_URL_CONSORTIUM_PATIENT_APPOINTMENT_ATTACHMENT:
    STORAGE_UPLOADS_FOLDER_CONSORTIUM_PATIENT_APPOINTMENT_ATTACHMENT + "/",

  STORAGE_PATH_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT:
    STORAGE_UPLOADS_FOLDER_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT +
    "/",

  STORAGE_URL_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT:
    STORAGE_UPLOADS_FOLDER_CONSORTIUM_PATIENT_APPOINTMENT_DICTATION_ATTACHMENT +
    "/",

  STORAGE_PATH_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT:
    STORAGE_UPLOADS_FOLDER_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT +
    "/",

  STORAGE_URL_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT:
    STORAGE_UPLOADS_FOLDER_CONSORTIUM_PATIENT_APPOINTMENT_TRANSCRIPTION_ATTACHMENT +
    "/",

  MIME_TYPE_MAP_IMAGE: {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/bmp": "bmp",
  },
  MIME_TYPE_MAP_PDF: { "application/pdf": "pdf" },

  FILE_TYPE_IMAGE_EXTENSION_ARRAY: ["png", "jpg", "jpeg", "ppt"],

  IMG_EXTENSION_ARR: ["png", "jpg", "jpeg", "bmp"],

  MIME_TYPE_MAP_DOCUMENT: {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/bmp": "bmp",
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/msword": "doc",
    "application/vnd.oasis.opendocument.text": "odt",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",
    "application/vnd.ms-powerpoint": "ppt",
    "text/plain": "txt",
  },

  MIME_TYPE_MAP_PRELIMINARY_ATTACHMENT: {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/bmp": "bmp",
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/msword": "doc",
    "application/vnd.oasis.opendocument.text": "odt",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",
    "application/vnd.ms-powerpoint": "ppt",
    "text/plain": "txt",
  },

  MIME_TYPE_MAP_PRELIMINARY_AUDIO_ATTACHMENT: {
    "audio/mpeg": "mp3",
    "audio/m4a": "m4a",
    "video/x-msvideo": "avi",
    "audio/midi": "midi",
    "audio/midi": "mid",
    "audio/mp4": "mp4a",
    "audio/webm": "weba",
    "audio/basic": "au",
    "audio/x-wav": "wav",
  },

  MIME_TYPE_MAP_FOR_AUDIO_ATTACHMENT_FROM_EXTENSION: {
    mp3: "audio/mpeg",
    m4a: "audio/m4a",
    avi: "video/x-msvideo",
    midi: "audio/midi",
    mid: "audio/midi",
    mp4a: "audio/mp4",
    weba: "audio/webm",
    au: "audio/basic",
    wav: "audio/x-wav",
  },

  FILE_UPLOAD_LIMIT_MB: 150,

  IMAGE_SIZE_HEIGHT_FULL: 1000,
  IMAGE_SIZE_WIDTH_FULL: 1000,

  IMAGE_SIZE_HEIGHT_SLIDER: 320,
  IMAGE_SIZE_WIDTH_SLIDER: 320,

  IMAGE_SIZE_HEIGHT_THUMB: 100,
  IMAGE_SIZE_WIDTH_THUMB: 100,
};
