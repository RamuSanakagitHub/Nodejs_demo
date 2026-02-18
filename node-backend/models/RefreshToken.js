const mongoose = require("mongoose");
const RefreshTokenSchema = new mongoose.Schema({
 userId: {type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
 token: {type:String, rquired:true},
 createdAt:{ type:Date, default:Date.now, expires: '30d'}
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);