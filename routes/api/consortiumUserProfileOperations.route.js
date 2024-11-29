var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumUserProfileOperationsController = require('../../controllers/consortiumUserProfileOperations.controller');

router.post('/registerToken', ConsortiumUserProfileOperationsController.registerConsortiumUserMessagingToken)
router.patch('/auth', ConsortiumUserProfileOperationsController.authenticateConsortiumUser)
router.post('/sendCredentials', ConsortiumUserProfileOperationsController.sendConsortiumUserCredentials)
router.post('/profile', ConsortiumUserProfileOperationsController.loadConsortiumUserProfile)
router.post('/checkPasswordValidity', ConsortiumUserProfileOperationsController.checkConsortiumUserPasswordValidity)
router.post('/changePassword', ConsortiumUserProfileOperationsController.changeConsortiumUserPassword)
router.post('/reloadRights', ConsortiumUserProfileOperationsController.reloadConsortiumUserDetailsAndRights)
router.post('/logout', ConsortiumUserProfileOperationsController.logoutConsortiumUser)
router.post('/getOTP', ConsortiumUserProfileOperationsController.resendConsortiumUserOTP)
router.post('/resetPassword', ConsortiumUserProfileOperationsController.resetConsortiumUserPassword)
router.post('/selectConsortiumLocationList', ConsortiumUserProfileOperationsController.loadConsortiumLocationSelectList)
router.post('/setDefaultConsortiumLocation', ConsortiumUserProfileOperationsController.setDefaultConsortiumLocation)

// Export the Router
module.exports = router;
