const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  color: { type: String },
  photoUrl: { type: String },
  status: { type: String, enum: ['available', 'parked'], default: 'available' },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
