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
    if (!vehicle || vehicle.ownerId.toString() !== req.user.id) {
      return res.status(400).json({ msg: 'Invalid vehicle' });
    }

    if (vehicle.status === 'in-progress') {
      return res.status(400).json({ msg: 'Your Request is in-progress' });
    }

    // ✅ Check if request already exists for this vehicle & type
    const existingRequest = await Request.findOne({
      vehicleId,
      type: 'park',
      status: 'pending',
      driverId: { $exists: false } // no driver assigned
    });

    if (existingRequest) {
      return res.status(200).json({
        msg: 'A request is already created for this vehicle. You will be assigned a driver soon.',
        request: existingRequest
      });
    }

    // ✅ Create new request if none exists
    const request = new Request({
      vehicleId,
      ownerId: req.user.id,
      type: 'park',
      locationFrom
    });

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
    if (!vehicle || vehicle.ownerId.toString() !== req.user.id) {
      return res.status(400).json({ msg: 'Invalid vehicle' });
    }

    if (vehicle.status !== 'parked') {
      return res.status(400).json({ msg: 'Vehicle not parked' });
    }

    // ✅ Check if pickup request already exists for this vehicle
    const existingRequest = await Request.findOne({
      vehicleId,
      type: 'pickup',
      status: 'pending',
      driverId: { $exists: false } // not yet assigned
    });

    if (existingRequest) {
      return res.status(200).json({
        msg: 'A pickup request is already created for this vehicle. You will be assigned a driver soon.',
        request: existingRequest
      });
    }

    // ✅ Create new pickup request
    const request = new Request({
      vehicleId,
      ownerId: req.user.id,
      type: 'pickup',
      locationTo
    });

    await request.save();

    vehicle.status = 'in-progress'; // mark vehicle as waiting for pickup
    await vehicle.save();

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

const getLastRequestByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // Find the latest request for the vehicle (sorted by createdAt descending)
    const request = await Request.findOne({ vehicleId })
      .sort({ createdAt: -1 })
      .populate('vehicleId driverId');

    // If no request found OR no driver assigned, return empty
    if (!request || !request.driverId) {
      return res.json({});
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


module.exports = { addVehicle, getVehicles, createParkRequest, createPickupRequest, submitFeedback, getRequestStatus,getLastRequestByVehicle };
