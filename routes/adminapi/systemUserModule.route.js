var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var SystemUserModuleController = require('../../controllers/systemUserModule.controller');

// Map each API to the Controller FUnctions
router.post('/table', SystemUserModuleController.getModules)
router.post('/', SystemUserModuleController.saveModule)
router.post('/detail', SystemUserModuleController.getModuleDetails)
router.patch('/', SystemUserModuleController.changeModuleStatus)
router.delete('/:id', SystemUserModuleController.removeModule)
router.post('/selectList', SystemUserModuleController.selectModuleList)
router.post('/checkModuleName', SystemUserModuleController.checkModuleNameValidity)
router.post('/checkForDelete', SystemUserModuleController.checkCanBeDeleted)

// Export the Router
module.exports = router;