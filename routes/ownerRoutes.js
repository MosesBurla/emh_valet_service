const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const rbac = require('../middleware/rbacMiddleware');
const ownerController = require('../controllers/ownerController');

router.use(protect);
router.use(rbac(['owner','driver']));

router.post('/add-vehicle', ownerController.addVehicle);
router.get('/vehicles', ownerController.getVehicles);
router.post('/park-request', ownerController.createParkRequest);
router.post('/pickup-request', ownerController.createPickupRequest);
router.post('/submit-feedback/:requestId', ownerController.submitFeedback);
router.get('/request-status/:id', ownerController.getRequestStatus);
router.get('/vehicle-request/:vehicleId', ownerController.getLastRequestByVehicle);


module.exports = router;
