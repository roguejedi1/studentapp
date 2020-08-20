const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SNotificationSchema = new Schema({
    read: Boolean,
    message: String,
    senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    receiverUserId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }
});

module.exports = mongoose.model('SNotification', SNotificationSchema);