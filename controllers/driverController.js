const Request = require('../models/Request');
const Vehicle = require('../models/Vehicle');
const { getIO } = require('../utils/socket');  // destructure directly

const getIncomingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending', driverId: null });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request || request.status !== 'pending') return res.status(400).json({ msg: 'Invalid request' });
    request.driverId = req.user.id;
    request.status = 'accepted';
    await request.save();
    getIO().emit('request-accepted', request);
    res.json({ msg: 'Request accepted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const markParked = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request || request.driverId.toString() !== req.user.id) return res.status(400).json({ msg: 'Invalid request' });
    request.status = 'completed';
    request.completionTime = new Date();
    await request.save();
    getIO().emit('request-completed', request);
    res.json({ msg: 'Request marked as parked' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const markHandedOver = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request || request.driverId.toString() !== req.user.id) return res.status(400).json({ msg: 'Invalid request' });
    request.status = 'handed_over';
    request.handoverTime = new Date();
    await request.save();
    const vehicle = await Vehicle.findById(request.vehicleId);
    vehicle.status = 'available';
    await vehicle.save();
    getIO().emit('request-handed-over', request);
    res.json({ msg: 'Request marked as handed over' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await Request.find({ driverId: req.user.id }).populate('vehicleId ownerId');
    res.json(history);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { getIncomingRequests, acceptRequest, markParked, markHandedOver, getHistory };
