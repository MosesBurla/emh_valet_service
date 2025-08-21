const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/notifier');

const register = async (req, res) => {
  const { name, phone, email, password, role, licenseDetails, defaultLocation } = req.body;
  try {
    let user = await User.findOne({ phone });
    if (user) return res.status(400).json({ msg: 'User exists' });

    user = new User({ name, phone, email, password, role, licenseDetails, defaultLocation });
    if (role === 'owner') user.status = 'approved';
    await user.save();

    sendOTP(phone);
    res.status(201).json({ msg: 'Registered, pending approval if applicable' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const login = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }
    if (user.status !== 'approved') return res.status(403).json({ msg: 'Account pending approval' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, role: user.role } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const forgotPassword = async (req, res) => {
  const { phone } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    sendOTP(phone);
    res.json({ msg: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.password = password;
    await user.save();
    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
