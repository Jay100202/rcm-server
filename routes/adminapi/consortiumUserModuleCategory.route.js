var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumUserModuleCategoryController = require('../../controllers/consortiumUserModuleCategory.controller');

// Map each API to the Controller FUnctions
router.post('/table', ConsortiumUserModuleCategoryController.getConsortiumUserModuleCategories)
router.post('/', ConsortiumUserModuleCategoryController.saveConsortiumUserModuleCategory)
router.post('/detail', ConsortiumUserModuleCategoryController.getConsortiumUserModuleCategoryDetails)
router.patch('/', ConsortiumUserModuleCategoryController.changeConsortiumUserModuleCategoryStatus)
router.delete('/:id', ConsortiumUserModuleCategoryController.removeConsortiumUserModuleCategory)
router.post('/selectList', ConsortiumUserModuleCategoryController.selectConsortiumUserModuleCategoryList)
router.post('/checkCategoryName', ConsortiumUserModuleCategoryController.checkCategoryNameValidity)
router.post('/checkForDelete', ConsortiumUserModuleCategoryController.checkCanBeDeleted)

// Export the Router
module.exports = router;