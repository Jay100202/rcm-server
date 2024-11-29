var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var DesignationController = require('../../controllers/designation.controller');

router.post('/', DesignationController.saveDesignation)
router.post('/table', DesignationController.getDesignations)
router.patch('/', DesignationController.changeDesignationStatus)
router.delete('/:id', DesignationController.removeDesignation)
router.post('/selectList', DesignationController.selectDesignationList)
router.post('/checkForDelete', DesignationController.checkCanBeDeleted)
router.post('/detail', DesignationController.getDesignationDetails)
router.post('/checkDesignationName', DesignationController.checkDesignationNameValidity)
router.post('/performImport', DesignationController.performDesignationImport)

// Export the Router
module.exports = router;
