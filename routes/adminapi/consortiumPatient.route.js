var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumPatientController = require('../../controllers/consortiumPatient.controller');

router.post('/', ConsortiumPatientController.saveConsortiumPatient)
router.post('/table', ConsortiumPatientController.getConsortiumPatients)
router.patch('/', ConsortiumPatientController.changeConsortiumPatientStatus)
router.delete('/:id', ConsortiumPatientController.removeConsortiumPatient)
router.post('/selectList', ConsortiumPatientController.selectConsortiumPatientList)
router.post('/checkForDelete', ConsortiumPatientController.checkCanBeDeleted)
router.post('/detail', ConsortiumPatientController.getConsortiumPatientDetails)
router.post('/selectSearchByOptionList', ConsortiumPatientController.selectConsortiumPatientSearchByOptionList)
router.post('/filteredList', ConsortiumPatientController.getFilteredConsortiumPatients)
router.post('/performImport', ConsortiumPatientController.performConsortiumPatientImport)

// Export the Router
module.exports = router;
