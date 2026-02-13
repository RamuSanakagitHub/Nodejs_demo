const FileModel = require("../models/File");

// Create file record
exports.createFile = async (data) => {
  try {
    const file = await FileModel.create(data);
    return file;
  } catch (error) {
    throw new Error(`MongoDB create file error: ${error.message}`);
  }
};

// // Get all files
// exports.getAllFiles = async () => {
//   return await FileModel.find().sort({ createdAt: -1 });
// };

// Get file by ID
exports.getFileById = async (id) => {
  return await FileModel.findById(id);
};

// // Delete file
// exports.deleteFile = async (id) => {
//   return await FileModel.findByIdAndDelete(id);
// };