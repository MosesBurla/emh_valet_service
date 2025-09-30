const Request = require('../models/Request');
const Vehicle = require('../models/Vehicle');
const ParkingLocation = require('../models/ParkingLocation');
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
    const vehicle = await Vehicle.findById(request.vehicleId);
    vehicle.status = 'in-progress';
    await vehicle.save();
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
    const vehicle = await Vehicle.findById(request.vehicleId);
    vehicle.status = 'parked';
    await vehicle.save();
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

    // Define the start and end of the current day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Start of current day
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // End of current day

    const history = await Request.find({ 
      driverId: req.user.id,
    status:'accepted',
      createdAt: { $gte: startOfDay, $lte: endOfDay },}
    
    ).populate('vehicleId ownerId');
    res.json(history);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get today's park requests
const getTodayParkRequests = async (req, res) => {
  try {
    // Get start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Query Requests of type 'park' created today
    const requests = await Request.find({
      type: 'park',
      status:'completed',
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('vehicleId') // include vehicle details
      .populate('ownerId')   // include owner details
      .populate('driverId'); // include driver details

    res.json(requests);
  } catch (err) {
    console.error('Error fetching park requests:', err);
    res.status(500).json({ msg: err.message });
  }
};



// const getHistory = async (req, res) => {
//   try {
//     // Define the start and end of the current day
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0); // Start of current day
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999); // End of current day

//     // Find requests of type 'park' for the current driver on the current day
//     const parkedRequests = await Request.find({
//       driverId: req.user.id,
//       type: 'park',
//       createdAt: { $gte: startOfDay, $lte: endOfDay },
//     }).populate('vehicleId');

//     // Extract vehicle IDs from parked requests
//     const vehicleIds = parkedRequests.map((request) => request.vehicleId._id);

//     // Fetch vehicles with status 'parked' and matching IDs
//     const parkedVehicles = await Vehicle.find({
//       _id: { $in: vehicleIds },
//       status: 'parked',
//     }).populate('ownerId');

//     res.json(parkedVehicles);
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };
const getParkingLocations = async (req, res) => {
  try {
    const locations = await ParkingLocation.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


module.exports = { getParkingLocations,getIncomingRequests, acceptRequest, markParked, markHandedOver, getHistory, getTodayParkRequests };
