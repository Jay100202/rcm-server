const serverBaseUrl = "https://backend.analyticahcs.com/";
const clientBaseUrl = "https://rcmapi.barodaweb.org/";
const clientSystemUserBaseUrl = clientBaseUrl + "sign-in";
const clientConsortiumUserBaseUrl = clientBaseUrl + "consortium-sign-in";
const userProfileUrl = clientBaseUrl + "profile";

const apiKeyConsortiumUserAppWeb = "API-KEY-CU-UT-WEB";
const apiKeyConsortiumUserAppAndroid = "API-KEY-CU-UT-ANDROID";
const apiKeyConsortiumUserAppIos = "API-KEY-CU-UT-IOS";
const validApiKeyConsortiumUserAppArr = [
  apiKeyConsortiumUserAppWeb,
  apiKeyConsortiumUserAppAndroid,
  apiKeyConsortiumUserAppIos,
];

module.exports = {
  CONF_SENDGRID_API_KEY:
    "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",
  CONF_SENDGRID_FROM_EMAIL: "marwiz.tech@gmail.com",
  CONF_COMPANY_NAME: "Analytica",
  CONF_SYSTEM_NAME: "Analytica",
  CONF_ITS_NAME: "iTechnoSol Inc.",

  CONF_SALT_WORK_FACTOR: 10,

  SYSTEM_DEFAULT_TIMEZONE_STR: "Asia/Calcutta",

  HDR_REQ_FROM_PANEL: "pnl",
  HDR_API_KEY_PANEL_SUPER_USER: "API-KEY-SU-UT-PANEL",

  HDR_REQ_FROM_APP_USER: "usr",
  HDR_API_KEY_WEB_CONSORTIUM_USER: apiKeyConsortiumUserAppWeb,
  HDR_API_KEY_ANDROID_CONSORTIUM_USER: apiKeyConsortiumUserAppAndroid,
  HDR_API_KEY_IOS_CONSORTIUM_USER: apiKeyConsortiumUserAppIos,
  VALID_HDR_API_KEY_CONSORTIUM_USER_APP_ARR: validApiKeyConsortiumUserAppArr,

  APP_DB_NAME: "ana-db",
  APP_EXEC_PORT: "8030",

  // APP_DB_CONNECTION_STR: "mongodb://localhost:17817/",
  APP_DB_CONNECTION_STR:
    "mongodb+srv://websupport:u8ErwzKUq4pWr63I@cluster0.r8rsrlt.mongodb.net/rcm-new?retryWrites=true&w=majority&appName=Cluster0",
  APP_DB_DEST_HOST: "cluster0.r8rsrlt.mongodb.net",
  APP_DB_DEST_PORT: 17817,
  // APP_DB_DEST_USERNAME: "ubuntu",
  // APP_DB_DEST_PASSWORD: 'x87f49c63af5zc195bc99163',
  APP_DB_DEST_AUTH_SOURCE: "admin",
  APP_DB_HOST: "127.0.0.1",
  APP_DB_PORT: 22,
  APP_DB_USERNAME: "websupport",
  APP_DB_PASSWORD: "u8ErwzKUq4pWr63I",
  // APP_DB_USERNAME: "ana-db-usr",
  // APP_DB_PASSWORD: 'EACZgRSPOqmp',

  CLIENT_APP_URL: clientBaseUrl,
  SERVER_APP_URL: serverBaseUrl,

  CLIENT_APP_SUPER_USER_URL: clientSystemUserBaseUrl,
  CLIENT_APP_CONSORTIUM_USER_URL: clientConsortiumUserBaseUrl,

  SESSION_TYPE_ID_WEB: 1,
  SESSION_TYPE_ID_ANDROID: 2,
  SESSION_TYPE_ID_IOS: 3,

  APP_CRYPT_ALGORITHM: "aes-256-ctr",
  APP_CRYPT_PASSWORD: "D3YRrcjrNq",
  APP_CRYPT_IV_LENGTH: 16,
};
