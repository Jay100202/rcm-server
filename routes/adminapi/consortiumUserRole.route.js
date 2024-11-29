var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumUserRoleController = require('../../controllers/consortiumUserRole.controller');

// Map each API to the Controller FUnctions
router.post('/table', ConsortiumUserRoleController.getRoles)
router.post('/', ConsortiumUserRoleController.saveRole)
router.post('/detail', ConsortiumUserRoleController.getRoleDetails)
router.patch('/', ConsortiumUserRoleController.changeRoleStatus)
router.delete('/:id', ConsortiumUserRoleController.removeRole)
router.post('/selectList', ConsortiumUserRoleController.selectRoleList)
router.post('/rightPreload', ConsortiumUserRoleController.roleRightDependencies)
router.put('/saveRights', ConsortiumUserRoleController.saveRoleRights)
router.post('/checkRoleName', ConsortiumUserRoleController.checkRoleNameValidity)
router.post('/checkForDelete', ConsortiumUserRoleController.checkCanBeDeleted)

// Export the Router
module.exports = router;
