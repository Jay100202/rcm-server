var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var SystemUserModuleCategoryController = require('../../controllers/systemUserModuleCategory.controller');

// Map each API to the Controller FUnctions
router.post('/table', SystemUserModuleCategoryController.getSystemUserModuleCategories)
router.post('/', SystemUserModuleCategoryController.saveSystemUserModuleCategory)
router.post('/detail', SystemUserModuleCategoryController.getSystemUserModuleCategoryDetails)
router.patch('/', SystemUserModuleCategoryController.changeSystemUserModuleCategoryStatus)
router.delete('/:id', SystemUserModuleCategoryController.removeSystemUserModuleCategory)
router.post('/selectList', SystemUserModuleCategoryController.selectSystemUserModuleCategoryList)
router.post('/checkCategoryName', SystemUserModuleCategoryController.checkCategoryNameValidity)
router.post('/checkForDelete', SystemUserModuleCategoryController.checkCanBeDeleted)

// Export the Router
module.exports = router;