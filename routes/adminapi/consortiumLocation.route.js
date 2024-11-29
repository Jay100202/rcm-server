var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumLocationController = require('../../controllers/consortiumLocation.controller');

router.post('/', ConsortiumLocationController.saveConsortiumLocation)
router.post('/table', ConsortiumLocationController.getConsortiumLocations)
router.patch('/', ConsortiumLocationController.changeConsortiumLocationStatus)
router.delete('/:id', ConsortiumLocationController.removeConsortiumLocation)
router.post('/selectList', ConsortiumLocationController.selectConsortiumLocationList)
router.post('/checkForDelete', ConsortiumLocationController.checkCanBeDeleted)
router.post('/detail', ConsortiumLocationController.getConsortiumLocationDetails)
router.post('/checkLocationName', ConsortiumLocationController.checkConsortiumLocationNameValidity)

// Export the Router
module.exports = router;
