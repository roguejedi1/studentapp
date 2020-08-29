const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    read: Boolean,
    message: String,
    senderUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    recieverUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Notification', NotificationSchema);