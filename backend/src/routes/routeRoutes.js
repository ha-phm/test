const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

router.post('/route', routeController.findRoute);
router.get('/algorithms', routeController.listAlgorithms);
router.post('/reload', routeController.reloadGraph);

router.get('/nodes', routeController.getAllNodes);

module.exports = router;
