const bcrypt = require("bcryptjs");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

exports.findByEmail = async (email) => {
  return await User.findOne({ email, isDeleted: false }).select("+password");
};

exports.createUser = async (userData) => {
  return await User.create(userData);
};

exports.storeRefreshToken = async (userId, token) => {
  const hashedToken = await bcrypt.hash(token, 10);
  return await RefreshToken.create({ userId, token: hashedToken });
}

exports.validateAndRemoveRefreshToken = async (userId, token) => {
  const storedToken = await RefreshToken.findOne({ userId });
  if (storedToken && await bcrypt.compare(token, storedToken.token)) {
    await RefreshToken.deleteOne({ _id: storedToken._id });
    return true;
  }
  return false;
};

// New: Invalidate all refresh tokens for a user (e.g., on logout)
exports.invalidateUserTokens = async (userId) => {
  await RefreshToken.deleteMany({ userId });
};
exports.findById = async (id) => {
  return await User.findById(id).select("+password"); // Adjust select as needed
};