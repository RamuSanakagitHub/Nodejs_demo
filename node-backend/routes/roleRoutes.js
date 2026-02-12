const express = require("express");
const roleController = require("../controller/roleController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(verifyToken, authorizeRole(["admin"]));

// All role routes require authentication and admin role
router.post("/save", roleController.createRole);
router.get("/getAll", roleController.getAllRoles);
router.get("/get/:id", roleController.getRoleById);
router.put("/update/:id", roleController.updateRole);
router.delete("/delete/:id", roleController.deleteRole);

module.exports = router;
