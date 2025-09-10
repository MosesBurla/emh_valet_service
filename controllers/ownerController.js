const Vehicle = require('../models/Vehicle');
const Request = require('../models/Request');
const Feedback = require('../models/Feedback');
const { getIO } = require('../utils/socket');


const addVehicle = async (req, res) => {
  const { make, model, number, color, photoUrl } = req.body;
  try {
    const vehicle = new Vehicle({ ownerId: req.user.id, make, model, number, color, photoUrl });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ ownerId: req.user.id });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const createParkRequest = async (req, res) => {
  const { vehicleId, locationFrom } = req.body;
  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.ownerId.toString() !== req.user.id) return res.status(400).json({ msg: 'Invalid vehicle' });
    if (vehicle.status !== 'available') return res.status(400).json({ msg: 'Vehicle already parked' });

    const request = new Request({ vehicleId, ownerId: req.user.id, type: 'park', locationFrom });
    await request.save();
    vehicle.status = 'in-progress';
    await vehicle.save();
    getIO().emit('new-request', request);
    res.json(request);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const createPickupRequest = async (req, res) => {
  const { vehicleId, locationTo } = req.body;
  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.ownerId.toString() !== req.user.id) return res.status(400).json({ msg: 'Invalid vehicle' });
    if (vehicle.status !== 'parked') return res.status(400).json({ msg: 'Vehicle not parked' });

    const request = new Request({ vehicleId, ownerId: req.user.id, type: 'pickup', locationTo });
    await request.save();
     getIO().emit('new-request', request);
    res.json(request);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const submitFeedback = async (req, res) => {
  const { rating, comments } = req.body;
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request || request.ownerId.toString() !== req.user.id || request.status !== 'handed_over') {
      return res.status(400).json({ msg: 'Invalid request for feedback' });
    }
    const feedback = new Feedback({ requestId: request._id, driverId: request.driverId, ownerId: req.user.id, rating, comments });
    await feedback.save();
     getIO().emit('new-feedback', feedback);
    res.json({ msg: 'Feedback submitted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getRequestStatus = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('vehicleId driverId');
    if (!request || request.ownerId.toString() !== req.user.id) return res.status(400).json({ msg: 'Invalid request' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { addVehicle, getVehicles, createParkRequest, createPickupRequest, submitFeedback, getRequestStatus };
