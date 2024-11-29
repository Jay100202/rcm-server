var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumUserModuleController = require('../../controllers/consortiumUserModule.controller');

// Map each API to the Controller FUnctions
router.post('/table', ConsortiumUserModuleController.getModules)
router.post('/', ConsortiumUserModuleController.saveModule)
router.post('/detail', ConsortiumUserModuleController.getModuleDetails)
router.patch('/', ConsortiumUserModuleController.changeModuleStatus)
router.delete('/:id', ConsortiumUserModuleController.removeModule)
router.post('/selectList', ConsortiumUserModuleController.selectModuleList)
router.post('/checkModuleName', ConsortiumUserModuleController.checkModuleNameValidity)
router.post('/checkForDelete', ConsortiumUserModuleController.checkCanBeDeleted)

// Export the Router
module.exports = router;