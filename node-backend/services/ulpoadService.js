const { createClient } = require("@supabase/supabase-js");
const uploadRepository = require("../repositories/uploadReposiroy");
const path = require("path");
const fs = require("fs");
const FileModel = require("../models/File");


// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key if available, otherwise fall back to anon key
// Service role key bypasses RLS policies, which is needed for backend operations
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase credentials not found in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Upload file to Supabase Storage
exports.uploadFile = async (file, uploadedBy) => {
  try {
    // Generate unique file name
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.path);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    const mongoFile = await uploadRepository.createFile({
      fileName: file.originalname,
      fileUrl: fileUrl,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: uploadedBy,
    });

    // Clean up temporary file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return { mongoFile,     
      message: "File uploaded successfully",
    };
  } catch (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }
};

// Upload multiple files to Supabase Storage
exports.uploadMultipleFiles = async (files, uploadedBy) => {
  try {
    const uploadedFiles = [];

    for (const file of files) {
      const result = await this.uploadFile(file, uploadedBy);
      uploadedFiles.push(result);
    }

    return {
      files: uploadedFiles,
      message: `${uploadedFiles.length} files uploaded successfully`,
    };
  } catch (error) {
    throw new Error(`Error uploading files: ${error.message}`);
  }
};

// // Delete file from Supabase Storage
// exports.deleteFile = async (fileName, fileId) => {
//   try {
//     // Get file record from database
//     const fileRecord = await uploadRepository.getFileById(fileId);
    
//     if (!fileRecord) {
//       throw new Error("File not found");
//     }

//     // Extract file path from URL
//     const urlParts = fileRecord.file_url.split("/");
//     const storagePath = urlParts.slice(-2).join("/"); // Get the last two parts (bucket/path)

//     // Delete from Supabase Storage
//     const { error } = await supabase.storage
//       .from(bucketName)
//       .remove([storagePath]);

//     if (error) {
//       throw new Error(`Supabase delete error: ${error.message}`);
//     }

//     // Delete record from database
//     await uploadRepository.deleteFileRecord(fileId);

//     return {
//       message: "File deleted successfully",
//     };
//   } catch (error) {
//     throw new Error(`Error deleting file: ${error.message}`);
//   }
// };

// // Get file by ID
exports.getFileById = async (fileId) => {
  try {
    const fileRecord = await uploadRepository.getFileById(fileId);
    
    if (!fileRecord) {
      throw new Error("File not found");
    }

    return fileRecord;
  } catch (error) {
    throw new Error(`Error getting file: ${error.message}`);
  }
};

// // Get all files
// exports.getAllFiles = async () => {
//   try {
//     const files = await uploadRepository.getAllFiles();
//     return files;
//   } catch (error) {
//     throw new Error(`Error getting files: ${error.message}`);
//   }
// };
