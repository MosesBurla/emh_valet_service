const User = require('../models/User');
const ParkingLocation = require('../models/ParkingLocation');
const Request = require('../models/Request');
const Feedback = require('../models/Feedback');
const { notifier } = require('../utils/notifier');

const getPendingRegistrations = async (req, res) => {
  try {
    const pendings = await User.find({ status: 'approved' }).select('-password');
    res.json(pendings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const approveUser = async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.status = 'approved';
    if (role) user.role = role;
    await user.save();
    notifier.notifyUser(user.phone, 'Your registration is approved!');
    res.json({ msg: 'User approved' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    notifier.notifyUser(user.phone, 'Your registration was rejected.');
    res.json({ msg: 'User rejected' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const editUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const addParkingLocation = async (req, res) => {
  const { name, address, geolocation, capacity } = req.body;
  try {
    const location = new ParkingLocation({ name, address, geolocation, capacity });
    await location.save();
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const editParkingLocation = async (req, res) => {
  try {
    const location = await ParkingLocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!location) return res.status(404).json({ msg: 'Location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const deleteParkingLocation = async (req, res) => {
  try {
    const location = await ParkingLocation.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ msg: 'Location not found' });
    res.json({ msg: 'Location deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getStatistics = async (req, res) => {
  const { dateFrom, dateTo, locationId } = req.query;
  try {
    const totalUsers = await User.countDocuments();
    const totalRequests = await Request.countDocuments();
    const avgFeedback = await Feedback.aggregate([{ $group: { _id: null, avgRating: { $avg: '$rating' } } }]);
    res.json({ totalUsers, totalRequests, avgRating: avgFeedback[0]?.avgRating || 0 });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
const getParkingLocations = async (req, res) => {
  try {
    const locations = await ParkingLocation.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { getPendingRegistrations, approveUser, rejectUser, editUser, addParkingLocation, editParkingLocation, deleteParkingLocation, getStatistics, getParkingLocations };
