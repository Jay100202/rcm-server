var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var SystemUserRoleController = require('../../controllers/systemUserRole.controller');

// Map each API to the Controller FUnctions
router.post('/table', SystemUserRoleController.getRoles)
router.post('/', SystemUserRoleController.saveRole)
router.post('/detail', SystemUserRoleController.getRoleDetails)
router.patch('/', SystemUserRoleController.changeRoleStatus)
router.delete('/:id', SystemUserRoleController.removeRole)
router.post('/selectList', SystemUserRoleController.selectRoleList)
router.post('/rightPreload', SystemUserRoleController.roleRightDependencies)
router.put('/saveRights', SystemUserRoleController.saveRoleRights)
router.post('/checkRoleName', SystemUserRoleController.checkRoleNameValidity)
router.post('/checkForDelete', SystemUserRoleController.checkCanBeDeleted)

// Export the Router
module.exports = router;
