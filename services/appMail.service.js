var AppConfig = require("../appconfig");
var AppConfigUploads = require("../appconfig-uploads");
var AppConfigMailMessage = require("../appconfig-mail-message");
var SystemUserService = require("../services/systemUser.service");
var ConsortiumUserService = require("../services/consortiumUser.service");
var AppCommonService = require("../services/appcommon.service");
var _ = require("lodash");
var nodemailer = require("nodemailer");

// Saving the context of this module inside the _the variable
_this = this;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "marwiz.tech@gmail.com",
    pass: "abuoxineboamaqkm",
  },
});

exports.sendSystemUserCredentialsMail = async function (
  systemUserId,
  password
) {
  const companyName = AppConfig.CONF_COMPANY_NAME;
  const systemName = AppConfig.CONF_SYSTEM_NAME;
  const sysLink = AppConfig.CLIENT_APP_SUPER_USER_URL;

  const fetchedSystemUser = await SystemUserService.findSystemUserById(
    systemUserId,
    true
  );
  if (fetchedSystemUser) {
    try {
      const userFullName = fetchedSystemUser.userFullName;
      const userEmail = fetchedSystemUser.email;
      const roleName =
        fetchedSystemUser.role !== null && fetchedSystemUser.role !== undefined
          ? fetchedSystemUser.role.roleName
          : "";

      if (roleName) {
        const msgHtml =
          "Dear " +
          userFullName +
          ",<br/><br/>" +
          "You have been added as " +
          roleName +
          ".<br/>" +
          "You can login to the " +
          systemName +
          " console from your PC/Laptop " +
          'using this <a href="' +
          sysLink +
          '">link</a> with the following credentials.<br/>' +
          "Email: " +
          userEmail +
          "<br/>" +
          "Password: " +
          password +
          "<br/><br/>" +
          "Regards," +
          "<br/>" +
          companyName +
          " Team";

        const msgTitle = systemName + " - " + "System Access Credentials";
        const sendToArr = [userEmail];

        await performSendMail(msgTitle, msgHtml, sendToArr);
      }
    } catch (e) {
      throw Error("Error Occured while sending welcome mail " + e);
    }
  }
};

exports.sendSystemUserResetPasswordMail = async function (systemUser, otp) {
  const companyName = AppConfig.CONF_COMPANY_NAME;
  const systemName = AppConfig.CONF_SYSTEM_NAME;

  try {
    const userFullName = systemUser.userFullName;
    const userEmail = systemUser.email;

    const msgHtml =
      "Dear " +
      userFullName +
      ",<br/><br/>" +
      "Welcome to " +
      companyName +
      ".<br/>" +
      "Your OTP for Password reset is " +
      otp +
      "<br/><br/>" +
      AppConfigMailMessage.MAIL_SIGNATURE;

    const msgTitle = companyName + " - " + "OTP for Password Reset";
    const sendToArr = [userEmail];

    await performSendMail(msgTitle, msgHtml, sendToArr);
  } catch (e) {
    throw Error("Error Occured while sending verification code " + e);
  }
};

exports.sendSystemUserPasswordChangedMail = async function (systemUser) {
  const companyName = AppConfig.CONF_COMPANY_NAME;
  const systemName = AppConfig.CONF_SYSTEM_NAME;

  try {
    const userFullName = systemUser.userFullName;
    const userEmail = systemUser.email;

    const msgHtml =
      "Dear " +
      userFullName +
      ",<br/><br/>" +
      "Your " +
      companyName +
      " account password has been changed successfully.<br/><br/>" +
      AppConfigMailMessage.MAIL_SIGNATURE;

    const msgTitle = companyName + " - " + "Password Changed";
    const sendToArr = [userEmail];

    await performSendMail(msgTitle, msgHtml, sendToArr);
  } catch (e) {
    throw Error("Error Occured while sending verification code " + e);
  }
};

performSendMail = async function (
  msgTitle,
  msgHtml,
  sendToArr,
  sendCcArr,
  sendBccArr
) {
  const msgText = msgHtml;

  const mailOptions = {
    from: AppConfig.CONF_SENDGRID_FROM_EMAIL,
    replyTo: AppConfigMailMessage.SYSTEM_HELP_REPLY_TO_EMAIL,
    subject: msgTitle,
    text: msgText,
    html: msgHtml,
  };

  if (sendToArr !== undefined && sendToArr.length > 0) {
    sendToArr = _.uniq(sendToArr);
    mailOptions.to = sendToArr;
  }

  if (sendCcArr !== undefined && sendCcArr.length > 0) {
    sendCcArr = _.uniq(sendCcArr);
    mailOptions.cc = sendCcArr.filter(
      (ccEmail) => sendToArr.indexOf(ccEmail) < 0
    );
  }

  if (sendBccArr !== undefined && sendBccArr.length > 0) {
    sendBccArr = _.uniq(sendBccArr);
    mailOptions.bcc = sendBccArr.filter(
      (bccEmail) =>
        sendToArr.indexOf(bccEmail) < 0 && sendCcArr.indexOf(bccEmail) < 0
    );
  }

  await transporter.sendMail(mailOptions);
};

exports.sendConsortiumUserPasswordChangedMail = async function (
  consortiumUser
) {
  const companyName = AppConfig.CONF_COMPANY_NAME;
  const systemName = AppConfig.CONF_SYSTEM_NAME;

  try {
    const userFullName = consortiumUser.userFullName;
    const userEmail = consortiumUser.emailOfficial;

    const msgHtml =
      "Dear " +
      userFullName +
      ",<br/><br/>" +
      "Your " +
      companyName +
      " account password has been changed successfully.<br/><br/>" +
      AppConfigMailMessage.MAIL_SIGNATURE;

    const msgTitle = companyName + " - " + "Password Changed";
    const sendToArr = [userEmail];

    await performSendMail(msgTitle, msgHtml, sendToArr);
  } catch (e) {
    throw Error("Error Occured while sending verification code " + e);
  }
};

exports.sendConsortiumUserResetPasswordMail = async function (
  consortiumUser,
  otp
) {
  const companyName = AppConfig.CONF_COMPANY_NAME;
  const systemName = AppConfig.CONF_SYSTEM_NAME;

  try {
    const userFullName = consortiumUser.userFullName;
    const userEmail = consortiumUser.emailOfficial;

    const msgHtml =
      "Dear " +
      userFullName +
      ",<br/><br/>" +
      "Welcome to " +
      companyName +
      ".<br/>" +
      "Your OTP for Password reset is " +
      otp +
      "<br/><br/>" +
      AppConfigMailMessage.MAIL_SIGNATURE;

    const msgTitle = companyName + " - " + "OTP for Password Reset";
    const sendToArr = [userEmail];

    await performSendMail(msgTitle, msgHtml, sendToArr);
  } catch (e) {
    throw Error("Error Occured while sending verification code " + e);
  }
};

exports.sendConsortiumUserCredentialsMail = async function (
  consortiumUserId,
  password
) {
  const companyName = AppConfig.CONF_COMPANY_NAME;
  const systemName = AppConfig.CONF_SYSTEM_NAME;
  const sysLink = AppConfig.CLIENT_APP_CONSORTIUM_USER_URL;

  let req;
  const fetchedConsortiumUser =
    await ConsortiumUserService.findConsortiumUserById(
      req,
      consortiumUserId,
      true
    );
  if (fetchedConsortiumUser) {
    try {
      const userFullName = fetchedConsortiumUser.userFullName;
      const userEmail = fetchedConsortiumUser.emailOfficial;
      const roleName = fetchedConsortiumUser.consortiumUserRole.roleName;
      const consortiumShortCode =
        fetchedConsortiumUser.consortium.consortiumShortCode;

      if (roleName) {
        const msgHtml =
          "Dear " +
          userFullName +
          ",<br/><br/>" +
          "You have been added as " +
          roleName +
          ".<br/>" +
          "You can login to the " +
          systemName +
          " console from your PC/Laptop " +
          'using this <a href="' +
          sysLink +
          '">link</a> with the following credentials.<br/>' +
          "Email: " +
          userEmail +
          "<br/>" +
          "Password: " +
          password +
          "<br/>" +
          "Consortium Short Code: " +
          consortiumShortCode +
          "<br/><br/>" +
          "Regards," +
          "<br/>" +
          companyName +
          " Team";

        const msgTitle = systemName + " - " + "System Access Credentials";
        const sendToArr = [userEmail];

        await performSendMail(msgTitle, msgHtml, sendToArr);
      }
    } catch (e) {
      throw Error("Error Occured while sending welcome mail " + e);
    }
  }
};
