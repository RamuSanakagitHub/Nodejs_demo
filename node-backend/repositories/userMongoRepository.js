const User = require("../models/User");

exports.saveUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

exports.getAllUsers = async () => {
  return await User.find().sort({ _id: 1 });
};

exports.getUserById = async (id) => {
  return await User.findById(id);
};

exports.updateUser = async (id, userData) => {
  return await User.findByIdAndUpdate(id, userData, { new: true });
};

exports.deleteUser = async (id) => {
  return await User.findByIdAndUpdate(
        id,
        {isDeleted: true,
        deletedAt: new Date()
        },
        {new: true}
    );
};
