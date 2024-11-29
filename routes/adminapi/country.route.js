var express = require('express')
var router = express.Router()

var CountryController = require('../../controllers/country.controller');

// Map each API to the Controller FUnctions
router.post('/table', CountryController.getCountries)
router.delete('/:id', CountryController.removeCountry)
router.post('/selectList', CountryController.selectCountryList)
router.post('/detail', CountryController.getCountryDetails)
router.post('/', CountryController.saveCountry)
router.post('/checkForDelete', CountryController.checkCanBeDeleted)
router.patch('/', CountryController.changeCountryStatus)
router.post('/checkCountryName', CountryController.checkCountryNameValidity)
router.post('/performImport', CountryController.performCountryImport)

// Export the Router
module.exports = router;
