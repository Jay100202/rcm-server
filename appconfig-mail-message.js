var AppConfig = require("./appconfig");

var helpContactNo = "";
var helpContactEmail = "info@itechnosol.com";

var systemInternalNotificationsEmail = "marwiz.tech@gmail.com";

var onlySignature =
  "Warm Regards," + "<br/>" + AppConfig.CONF_COMPANY_NAME + " Team";
var signatureWithThanks = "Thanks." + "<br/><br/>" + onlySignature;

module.exports = {
  OS_ANDROID_NOTIF_CHANNEL_ID: "",
  OS_ANDROID_ACCENT_COLOR: "",
  OS_USER_AUTHENTICATION_KEY: "",
  OS_APP_AUTHENTICATION_KEY: "",
  OS_APP_ID: "",

  MSG91_ROUTE_NO: 4,
  MSG91_APP_KEY: "",
  MSG91_SENDER_ID: "",

  SYSTEM_HELP_EMAIL: helpContactEmail,
  SYSTEM_HELP_CONTACT_NO: helpContactNo,

  SYSTEM_HELP_REPLY_TO_EMAIL: helpContactEmail,

  SYSTEM_INTERNAL_NOTIF_EMAIL: systemInternalNotificationsEmail,

  CONF_SYSTEM_EMAIL_BCC_ARR: ["marwiz.tech@gmail.com"],

  MAIL_SIGNATURE: onlySignature,
  MAIL_SIGNATURE_THANKS: signatureWithThanks,
  MAIL_CONTACT_NO_HTML:
    '<a href="tel:' + helpContactNo + '">' + helpContactNo + "</a>",
  MAIL_CONTACT_EMAIL_HTML:
    '<a href="mailto:' +
    helpContactEmail +
    '" target="_top">' +
    helpContactEmail +
    "</a>",
};
