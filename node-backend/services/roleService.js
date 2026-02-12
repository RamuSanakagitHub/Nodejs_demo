const roleRepository = require("../repositories/roleRepository");

exports.createRole = async (roleData) => {
  const { name, description, permissions } = roleData;

  if (!name) {
    throw new Error("Role name is required");
  }

  const existingRole = await roleRepository.getAllRoles();
  const roleExists = existingRole.some(role => role.name === name);
  if (roleExists) {
    throw new Error("Role with this name already exists");
  }

  return await roleRepository.saveRole({ name, description, permissions });
};

exports.getAllRoles = async () => {
  return await roleRepository.getAllRoles();
};

exports.getRoleById = async (id) => {
  const role = await roleRepository.getRoleById(id);
  if (!role) {
    throw new Error("Role not found");
  }
  return role;
};

exports.updateRole = async (id, roleData) => {
  const { name, description, permissions } = roleData;

  if (!name) {
    throw new Error("Role name is required");
  }

  const role = await roleRepository.getRoleById(id);
  if (!role) {
    throw new Error("Role not found");
  }

  // Check if name is unique, excluding current role
  const allRoles = await roleRepository.getAllRoles();
  const nameExists = allRoles.some(r => r.name === name && r._id.toString() !== id);
  if (nameExists) {
    throw new Error("Role with this name already exists");
  }

  return await roleRepository.updateRole(id, { name, description, permissions });
};

exports.deleteRole = async (id) => {
  const role = await roleRepository.getRoleById(id);
  if (!role) {
    throw new Error("Role not found");
  }

  await roleRepository.deleteRole(id);
  return { message: "Role deleted successfully" };
};
