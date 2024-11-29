var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumUserTypeController = require('../../controllers/consortiumUserType.controller');

router.post('/', ConsortiumUserTypeController.saveConsortiumUserType)
router.post('/table', ConsortiumUserTypeController.getConsortiumUserTypes)
router.patch('/', ConsortiumUserTypeController.changeConsortiumUserTypeStatus)
router.delete('/:id', ConsortiumUserTypeController.removeConsortiumUserType)
router.post('/selectList', ConsortiumUserTypeController.selectConsortiumUserTypeList)
router.post('/checkForDelete', ConsortiumUserTypeController.checkCanBeDeleted)
router.post('/detail', ConsortiumUserTypeController.getConsortiumUserTypeDetails)
router.post('/checkTypeName', ConsortiumUserTypeController.checkConsortiumUserTypeNameValidity)

// Export the Router
module.exports = router;
