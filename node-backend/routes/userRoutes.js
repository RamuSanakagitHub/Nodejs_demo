const express = require("express");
const userController = require("../controller/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/save", verifyToken, userController.createUser);//.bind(userController)
router.get("/getAll", verifyToken, userController.getAllUsers); //.bind(userController)
router.get("/get/:id", verifyToken, userController.getUserById);//.bind(userController)
router.put("/update/:id", userController.updateUser);//.bind(userController)
router.delete("/delete/:id", userController.deleteUser);//.bind(userController)

module.exports = router;