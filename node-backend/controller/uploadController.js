const uploadService = require("../services/ulpoadService");
const uploadMiddleware = require("../middleware/uploadMiddleware");

// Upload single file
exports.uploadFile = async (req, res) => {
  try {
    // Use multer middleware
    uploadMiddleware.uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ message: "Please upload a file" });
      }

      // Get user ID from request (set by auth middleware)
      const uploadedBy = req.user ? req.user.id : null;

      // Upload to Supabase
      const result = await uploadService.uploadFile(req.file, uploadedBy);

      res.status(201).json(result);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload multiple files
exports.uploadMultipleFiles = async (req, res) => {
  try {
    // Use multer middleware
    uploadMiddleware.uploadMultiple(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      // Check if files exist
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Please upload at least one file" });
      }

      // Get user ID from request (set by auth middleware)
      const uploadedBy = req.user ? req.user.id : null;

      // Upload to Supabase
      const result = await uploadService.uploadMultipleFiles(req.files, uploadedBy);

      res.status(201).json(result);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // Delete file
// exports.deleteFile = async (req, res) => {
//   try {
//     const { fileId } = req.params;
//     const { fileName } = req.body;

//     if (!fileId) {
//       return res.status(400).json({ message: "File ID is required" });
//     }

//     const result = await uploadService.deleteFile(fileName, fileId);

//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Get file by ID
exports.getFileById = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await uploadService.getFileById(fileId);

    res.status(200).json(file);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// // Get all files
// exports.getAllFiles = async (req, res) => {
//   try {
//     const files = await uploadService.getAllFiles();

//     res.status(200).json(files);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
