var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var DepartmentController = require('../../controllers/department.controller');

router.post('/', DepartmentController.saveDepartment)
router.post('/table', DepartmentController.getDepartments)
router.patch('/', DepartmentController.changeDepartmentStatus)
router.delete('/:id', DepartmentController.removeDepartment)
router.post('/selectList', DepartmentController.selectDepartmentList)
router.post('/checkForDelete', DepartmentController.checkCanBeDeleted)
router.post('/detail', DepartmentController.getDepartmentDetails)
router.post('/checkDepartmentName', DepartmentController.checkDepartmentNameValidity)
router.post('/performImport', DepartmentController.performDepartmentImport)

// Export the Router
module.exports = router;
