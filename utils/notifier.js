const sendOTP = (phone) => {
  console.log(`Sending OTP to ${phone}`);
};

const notifyUser = (phone, message) => {
  console.log(`Notifying ${phone}: ${message}`);
};

module.exports = { sendOTP, notifyUser };
