var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var StateController = require('../../controllers/state.controller');

router.post('/', StateController.saveState)
router.post('/table', StateController.getStates)
router.patch('/', StateController.changeStateStatus)
router.delete('/:id', StateController.removeState)
router.post('/selectList', StateController.selectStateList)
router.post('/checkForDelete', StateController.checkCanBeDeleted)
router.post('/detail', StateController.getStateDetails)
router.post('/checkStateName', StateController.checkStateNameValidity)
router.post('/performImport', StateController.performStateImport)

// Export the Router
module.exports = router;
