var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var CityController = require('../../controllers/city.controller');

router.post('/', CityController.saveCity)
router.post('/table', CityController.getCities)
router.patch('/', CityController.changeCityStatus)
router.delete('/:id', CityController.removeCity)
router.post('/selectList', CityController.selectCityList)
router.post('/checkForDelete', CityController.checkCanBeDeleted)
router.post('/detail', CityController.getCityDetails)
router.post('/checkCityName', CityController.checkCityNameValidity)
router.post('/performImport', CityController.performCityImport)

// Export the Router
module.exports = router;
