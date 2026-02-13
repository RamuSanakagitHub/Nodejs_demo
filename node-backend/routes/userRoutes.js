const express = require("express");
const userController = require("../controller/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(verifyToken, authorizeRole(["admin"]));

router.post("/save", userController.createUser);//.bind(userController)
router.get("/getAll", userController.getAllUsers); //.bind(userController)
router.get("/get/:id", userController.getUserById);//.bind(userController)
router.put("/update/:id", userController.updateUser);//.bind(userController)
router.delete("/delete/:id", userController.deleteUser);//.bind(userController)
router.get("/export", userController.exportUsers);

module.exports = router;