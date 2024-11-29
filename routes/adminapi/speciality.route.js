var express = require('express')
var router = express.Router()

var SpecialityController = require('../../controllers/speciality.controller');

// Map each API to the Controller FUnctions
router.post('/table', SpecialityController.getSpecialities)
router.delete('/:id', SpecialityController.removeSpeciality)
router.post('/selectList', SpecialityController.selectSpecialityList)
router.post('/detail', SpecialityController.getSpecialityDetails)
router.post('/', SpecialityController.saveSpeciality)
router.post('/checkForDelete', SpecialityController.checkCanBeDeleted)
router.patch('/', SpecialityController.changeSpecialityStatus)
router.post('/checkSpecialityName', SpecialityController.checkSpecialityNameValidity)
router.post('/performImport', SpecialityController.performSpecialityImport)

// Export the Router
module.exports = router;
