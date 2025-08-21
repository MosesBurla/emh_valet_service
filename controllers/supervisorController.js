const Vehicle = require('../models/Vehicle');
const Request = require('../models/Request');

const getParkedVehicles = async (req, res) => {
  try {
    const parked = await Vehicle.find({ status: 'parked' }).populate('ownerId');
    res.json(parked);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const addUnregisteredVehicle = async (req, res) => {
  const { number, ownerDetails } = req.body;
  try {
    const vehicle = new Vehicle({ make: 'Unknown', model: 'Unknown', number, status: 'parked' });
    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const markPickup = async (req, res) => {
  const { type } = req.body;
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });
    vehicle.status = 'available';
    await vehicle.save();
    const request = await Request.findOne({ vehicleId: vehicle._id, status: 'completed' });
    if (request) {
      request.status = 'handed_over';
      request.handoverTime = new Date();
      await request.save();
       getIO().emit('request-handed-over', request);
    }
    res.json({ msg: 'Pickup marked' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await Request.find({}).populate('vehicleId ownerId driverId');
    res.json(history);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalParked = await Vehicle.countDocuments({ status: 'parked' });
    const totalRequests = await Request.countDocuments();
    res.json({ totalParked, totalRequests });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { getParkedVehicles, addUnregisteredVehicle, markPickup, getHistory, getDashboardStats };
