var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var SystemUserController = require('../../controllers/systemUser.controller');

router.post('/', SystemUserController.saveSystemUser)
router.post('/table', SystemUserController.getSystemUsers)
router.patch('/', SystemUserController.changeSystemUserStatus)
router.delete('/:id', SystemUserController.removeSystemUser)
router.post('/selectList', SystemUserController.selectSystemUserList)
router.post('/selectMTList', SystemUserController.selectMTSystemUserList)
router.post('/selectQAList', SystemUserController.selectQASystemUserList)
router.post('/selectStaffList', SystemUserController.selectStaffSystemUserList)
router.post('/checkForDelete', SystemUserController.checkCanBeDeleted)
router.patch('/auth', SystemUserController.authenticateSystemUser)

router.post('/registerToken', SystemUserController.registerSystemUserMessagingToken)
router.post('/checkEmail', SystemUserController.checkEmailValidity)
router.post('/sendCredentials', SystemUserController.sendSystemUserCredentials)
router.post('/profile', SystemUserController.loadSystemUserProfile)
router.post('/detail', SystemUserController.getSystemUserDetails)
router.post('/checkPasswordValidity', SystemUserController.checkSystemUserPasswordValidity)
router.post('/changePassword', SystemUserController.changeSystemUserPassword)
router.post('/reloadRights', SystemUserController.reloadSystemUserRoleRights)
router.post('/logout', SystemUserController.logoutSystemUser)
router.post('/getOTP', SystemUserController.resendSystemUserOTP)
router.post('/resetPassword', SystemUserController.resetSystemUserPassword)

// Export the Router
module.exports = router;
