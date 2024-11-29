var express = require('express')

var router = express.Router()

var systemUserRoleRoute = require('./adminapi/systemUserRole.route')
var systemUserModuleCategoryRoute = require('./adminapi/systemUserModuleCategory.route')
var systemUserModuleRoute = require('./adminapi/systemUserModule.route')
var systemUserRoute = require('./adminapi/systemUser.route')
var designationRoute = require('./adminapi/designation.route')
var departmentRoute = require('./adminapi/department.route')
var countryRoute = require('./adminapi/country.route')
var stateRoute = require('./adminapi/state.route')
var cityRoute = require('./adminapi/city.route')
var specialityRoute = require('./adminapi/speciality.route')
var consortiumUserRoleRoute = require('./adminapi/consortiumUserRole.route')
var consortiumUserTypeRoute = require('./adminapi/consortiumUserType.route')
var consortiumUserModuleRoute = require('./adminapi/consortiumUserModule.route')
var consortiumUserModuleCategoryRoute = require('./adminapi/consortiumUserModuleCategory.route')
var consortiumRoute = require('./adminapi/consortium.route')
var consortiumLocationRoute = require('./adminapi/consortiumLocation.route')
var consortiumUserRoute = require('./adminapi/consortiumUser.route')
var relationshipRoute = require('./adminapi/relationship.route')
var salutationRoute = require('./adminapi/salutation.route')
var consortiumPatientRoute = require('./adminapi/consortiumPatient.route')
var genderRoute = require('./adminapi/gender.route')
var consortiumPatientAppointmentRoute = require('./adminapi/consortiumPatientAppointment.route')
var transcriptorRoleRoute = require('./adminapi/transcriptorRole.route')
var consortiumPatientAppointmentDictationAttachmentRoute = require('./adminapi/consortiumPatientAppointmentDictationAttachment.route')
var activityPriorityRoute = require('./adminapi/activityPriority.route')
var activityStatusRoute = require('./adminapi/activityStatus.route')
var transcriptionStatusRoute = require('./adminapi/transcriptionStatus.route')
var activityFileStatusRoute = require('./adminapi/activityFileStatus.route')
var activityActionRoute = require('./adminapi/activityAction.route')
var consortiumChatStatusRoute = require('./adminapi/consortiumChatStatus.route')
var consortiumChatUserTypeRoute = require('./adminapi/consortiumChatUserType.route')
var consortiumChatThreadRoute = require('./adminapi/consortiumChatThread.route')
var reportRoute = require('./adminapi/report.route')
var timeZoneOptionRoute = require('./adminapi/timeZoneOption.route')
var consortiumJobTypeRoute = require('./adminapi/consortiumJobType.route')


var tempOperationsRoute = require('./adminapi/tempOperations.route')

var systemPreliminaryAttachmentRoute = require('./adminapi/systemPreliminaryAttachment.route')
var consortiumPreliminaryAttachmentRoute = require('./adminapi/consortiumPreliminaryAttachment.route')
var claimDetailRoute = require('./adminapi/claimDetail.route')
var claimRoute = require('./adminapi/claim.route')
var encounterRoute = require("./adminapi/encounter.route");
var billingStatusRoute = require("./adminapi/billingStatus.route");
var coderRoute = require("./adminapi/coder.route");
const ClaimDenialCode = require("./adminapi/claimDenialCode.route");
var cpt4Routes = require("./adminapi/cpt4.route");
var icdRoutes = require("./adminapi/icd.route");
var placeOfServiceRoutes = require("./adminapi/placeOfService.route");



var claimFormRoutes = require("./adminapi/ClaimForm.route")
router.use('/systemUserRoles', systemUserRoleRoute);
router.use('/systemUserModuleCategories', systemUserModuleCategoryRoute);
router.use('/systemUserModules', systemUserModuleRoute);
router.use('/systemUsers', systemUserRoute);
router.use('/designations', designationRoute);
router.use('/departments', departmentRoute);
router.use('/countries', countryRoute);
router.use('/states', stateRoute);
router.use('/cities', cityRoute);
router.use('/specialities', specialityRoute);
router.use('/consortiumUserRoles', consortiumUserRoleRoute);
router.use('/consortiumUserTypes', consortiumUserTypeRoute);
router.use('/consortiumUserModules', consortiumUserModuleRoute);
router.use('/consortiumUserModuleCategories', consortiumUserModuleCategoryRoute);
router.use('/consortiums', consortiumRoute);
router.use('/consortiumLocations', consortiumLocationRoute);
router.use('/consortiumUsers', consortiumUserRoute);
router.use('/relationships', relationshipRoute);
router.use('/salutations', salutationRoute);
router.use('/consortiumPatients', consortiumPatientRoute);
router.use('/genders', genderRoute);
router.use('/consortiumPatientAppointments', consortiumPatientAppointmentRoute);
router.use('/transcriptorRoles', transcriptorRoleRoute);
router.use('/consortiumPatientAppointmentDictationAttachments', consortiumPatientAppointmentDictationAttachmentRoute);
router.use('/activityPriorities', activityPriorityRoute);
router.use('/activityStatuses', activityStatusRoute);
router.use('/transcriptionStatuses', transcriptionStatusRoute);
router.use('/activityFileStatuses', activityFileStatusRoute);
router.use('/activityActions', activityActionRoute);
router.use('/consortiumChatStatuses', consortiumChatStatusRoute);
router.use('/consortiumChatUserTypes', consortiumChatUserTypeRoute);
router.use('/consortiumChatThreads', consortiumChatThreadRoute);
router.use('/reports', reportRoute);
router.use('/timeZoneOptions', timeZoneOptionRoute);
router.use('/consortiumJobTypes', consortiumJobTypeRoute);




router.use('/tempOp', tempOperationsRoute);

router.use('/systemPreliminaryAttachments', systemPreliminaryAttachmentRoute);
router.use('/consortiumPreliminaryAttachments', consortiumPreliminaryAttachmentRoute);
router.use('/claimDetails', claimDetailRoute);
router.use('/claim', claimRoute);
router.use("/encounter", encounterRoute);
router.use('/billingStatus', billingStatusRoute);
router.use('/coder', coderRoute)
router.use("/claimDenialCode", ClaimDenialCode);
router.use("/cpt4", cpt4Routes);
router.use("/icd", icdRoutes);
router.use("/placeOfService", placeOfServiceRoutes);
router.use("/claimForm", claimFormRoutes);


module.exports = router;
