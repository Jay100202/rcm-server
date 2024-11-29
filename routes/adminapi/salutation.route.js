var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var SalutationController = require('../../controllers/salutation.controller');

router.post('/', SalutationController.saveSalutation)
router.post('/table', SalutationController.getSalutations)
router.patch('/', SalutationController.changeSalutationStatus)
router.delete('/:id', SalutationController.removeSalutation)
router.post('/selectList', SalutationController.selectSalutationList)
router.post('/checkForDelete', SalutationController.checkCanBeDeleted)
router.post('/detail', SalutationController.getSalutationDetails)
router.post('/checkText', SalutationController.checkSalutationTextValidity)

// Export the Router
module.exports = router;
