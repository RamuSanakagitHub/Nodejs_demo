const mongoose = require("mongoose");

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
