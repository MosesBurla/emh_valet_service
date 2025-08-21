const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const rbac = require('../middleware/rbacMiddleware');
const supervisorController = require('../controllers/supervisorController');

router.use(protect);
router.use(rbac(['supervisor']));

router.get('/parked-vehicles', supervisorController.getParkedVehicles);
router.post('/add-unregistered-vehicle', supervisorController.addUnregisteredVehicle);
router.post('/mark-pickup/:vehicleId', supervisorController.markPickup);
router.get('/history', supervisorController.getHistory);
router.get('/dashboard-stats', supervisorController.getDashboardStats);

module.exports = router;
