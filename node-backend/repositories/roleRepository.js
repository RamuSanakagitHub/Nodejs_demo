const Role = require("../models/Role");

exports.saveRole = async (roleData) => {
  const role = new Role(roleData);
  return await role.save();
};

exports.getAllRoles = async () => {
  return await Role.find().sort({ _id: 1 });
};

exports.getRoleById = async (id) => {
  return await Role.findById(id);
};

exports.updateRole = async (id, roleData) => {
  return await Role.findByIdAndUpdate(id, roleData, { new: true });
};

exports.deleteRole = async (id) => {
  return await Role.findByIdAndDelete(id);
};
