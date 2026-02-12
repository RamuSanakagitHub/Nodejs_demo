const roleService = require("../services/roleService");

const OK = 200;
const CREATED = 201;
const INTERNAL_SERVER_ERROR = 500;

class RoleController {
    async createRole(req, res) {
        try {
            const newRole = await roleService.createRole(req.body);
            res.status(CREATED).json(newRole);
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    async getAllRoles(req, res) {
        try {
            const roles = await roleService.getAllRoles();
            res.status(OK).json(roles);
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    async getRoleById(req, res) {
        try {
            const { id } = req.params;
            const role = await roleService.getRoleById(id);
            res.status(OK).json(role);
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    async updateRole(req, res) {
        try {
            const { id } = req.params;
            const updatedRole = await roleService.updateRole(id, req.body);
            res.status(OK).json(updatedRole);
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    async deleteRole(req, res) {
        try {
            const { id } = req.params;
            await roleService.deleteRole(id);
            res.status(OK).json({ message: "Role deleted successfully" });
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
}

module.exports = new RoleController();
