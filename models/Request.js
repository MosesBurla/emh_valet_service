const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['park', 'pickup'], required: true },
  status: { type: String, enum: ['pending', 'accepted' ,'completed', 'handed_over'], default: 'pending' },
  locationFrom: { lat: Number, lng: Number },
  locationTo: { lat: Number, lng: Number },
  completionTime: { type: Date },
  handoverTime: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
