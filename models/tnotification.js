const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TNotificationSchema = new Schema({
    read: Boolean,
    message: String,
    senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    receiverUserId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }
});

module.exports = mongoose.model('TNotification', TNotificationSchema);