const User = require("../models/User");

exports.findByEmail = async (email) => {
  return await User.findOne({ email, isDeleted: false }).select("+password");
};

exports.createUser = async (userData) => {
  return await User.create(userData);
};
