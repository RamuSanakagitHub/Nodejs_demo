const express = require("express");
const router = express.Router();
const uploadController = require("../controller/uploadController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/save", verifyToken, uploadController.uploadFile);

router.post("/save/multiple", verifyToken, uploadController.uploadMultipleFiles);

// // Delete file (protected route - requires authentication)
// router.delete("/upload/:fileId", authMiddleware, uploadController.deleteFile);

// // Get file by ID (protected route - requires authentication)
router.get("/get/:fileId", verifyToken, uploadController.getFileById);

// // Get all files (protected route - requires authentication)
// router.get("/files", authMiddleware, uploadController.getAllFiles);

module.exports = router;
