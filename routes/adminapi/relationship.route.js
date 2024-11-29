var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var RelationshipController = require('../../controllers/relationship.controller');

router.post('/', RelationshipController.saveRelationship)
router.post('/table', RelationshipController.getRelationships)
router.patch('/', RelationshipController.changeRelationshipStatus)
router.delete('/:id', RelationshipController.removeRelationship)
router.post('/selectList', RelationshipController.selectRelationshipList)
router.post('/checkForDelete', RelationshipController.checkCanBeDeleted)
router.post('/detail', RelationshipController.getRelationshipDetails)
router.post('/checkName', RelationshipController.checkRelationshipNameValidity)

// Export the Router
module.exports = router;
