const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    role: {
        type: String,
        enum: ["admin","user"],
        default: "user"
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null
    },
    isDeleted: { type: Boolean, default: false},
    deletedAt: { type: Date, default: null},

    address: {
      street: { type: String, required: false },
      city: { type: String, required: false },
      state: { type: String, required: false },
        zipCode: { type: Number, required: false } 
    },
    skills: [{ type: String }], 
    projects: [{
      title: { type: String, required: false }, 
      budget: { type: Number, required: false },
      technologies: [{ type: String }] 
    }] ,
    comments : [commentsSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
