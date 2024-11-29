var express = require('express')

var router = express.Router()
// Getting the Todo Controller that we just created

var ConsortiumController = require('../../controllers/consortium.controller');

router.post('/', ConsortiumController.saveConsortium)
router.post('/table', ConsortiumController.getConsortiums)
router.patch('/', ConsortiumController.changeConsortiumStatus)
router.delete('/:id', ConsortiumController.removeConsortium)
router.post('/selectList', ConsortiumController.selectConsortiumList)
router.post('/checkForDelete', ConsortiumController.checkCanBeDeleted)
router.post('/detail', ConsortiumController.getConsortiumDetails)
router.post('/checkShortCode', ConsortiumController.checkConsortiumShortCodeValidity)
router.post('/selectSystemUserTeamList', ConsortiumController.selectConsortiumSystemUserTeamList)


router.post('/systemUserTeam/', ConsortiumController.saveConsortiumSystemUserTeam)
router.post('/systemUserTeam/detail', ConsortiumController.getConsortiumSystemUserTeamDetails)
router.delete('/systemUserTeam/:id', ConsortiumController.removeConsortiumSystemUserTeam)

// Export the Router
module.exports = router;
